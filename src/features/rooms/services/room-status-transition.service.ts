import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { RoomStatus } from "@prisma/client";
import { updateRoomStatusInTx } from "../repositories/room-write.repository";

export async function roomStatusTransitionService(roomId: string, targetStatus: RoomStatus, reason?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertRoomAccess(roomId, session.user);

  // In Phase 3.2, manual status changes are strictly restricted to VACANT <-> MAINTENANCE
  const isAllowedManualTransition =
    (targetStatus === RoomStatus.VACANT || targetStatus === RoomStatus.MAINTENANCE);

  if (!isAllowedManualTransition) {
    throw new Error(
      "INVALID_STATUS_TRANSITION: Trạng thái Đang Cho Thuê (RENTED) và Đã Đặt Cọc (RESERVED) chỉ được thay đổi tự động qua hợp đồng!"
    );
  }

  return runSerializableTransaction(async (tx) => {
    const room = await tx.room.findUnique({
      where: { id: roomId },
      select: { status: true },
    });

    if (!room) throw new Error("NOT_FOUND_ROOM");
    if (room.status === RoomStatus.RENTED) {
      throw new Error("CANNOT_CHANGE_STATUS_OF_RENTED_ROOM: Phòng đang có khách ở. Không thể chuyển trạng thái bảo trì!");
    }

    const updated = await updateRoomStatusInTx(tx, roomId, targetStatus);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CHANGE_ROOM_STATUS",
        entity: "Room",
        entityId: roomId,
        details: JSON.stringify({
          fromStatus: room.status,
          toStatus: targetStatus,
          reason: reason || null,
        }),
      },
    });

    return updated;
  });
}

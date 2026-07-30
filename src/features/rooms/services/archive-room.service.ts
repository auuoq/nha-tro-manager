import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { softDeleteRoomInTx } from "../repositories/room-write.repository";
import { RoomStatus } from "@prisma/client";

export async function archiveRoomService(roomId: string, reason?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertRoomAccess(roomId, session.user);

  return runSerializableTransaction(async (tx) => {
    const room = await tx.room.findUnique({
      where: { id: roomId },
      select: {
        status: true,
        contracts: {
          where: { status: "ACTIVE", deletedAt: null },
          select: { id: true },
        },
      },
    });

    if (!room) throw new Error("NOT_FOUND_ROOM");
    if (room.status === RoomStatus.RENTED || room.contracts.length > 0) {
      throw new Error("CANNOT_ARCHIVE_ROOM_WITH_ACTIVE_CONTRACTS: Phòng đang có khách ở hoặc hợp đồng đang hiệu lực. Không thể lưu trữ!");
    }

    const archived = await softDeleteRoomInTx(tx, roomId);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ARCHIVE_ROOM",
        entity: "Room",
        entityId: roomId,
        details: JSON.stringify({
          archivedAt: archived.deletedAt,
          reason: reason || "Chủ nhà chủ động lưu trữ phòng",
        }),
      },
    });

    return archived;
  });
}

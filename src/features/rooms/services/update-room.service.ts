import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { updateRoomSchema, UpdateRoomInput } from "../schemas/room.schema";
import { updateRoomInTx } from "../repositories/room-write.repository";

export async function updateRoomService(input: UpdateRoomInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = updateRoomSchema.parse(input);
  if (!validated.roomId) throw new Error("MISSING_ROOM_ID");

  await assertRoomAccess(validated.roomId, session.user);

  return runSerializableTransaction(async (tx) => {
    const room = await tx.room.findUnique({
      where: { id: validated.roomId },
      select: { buildingId: true, roomNumber: true },
    });

    if (!room) throw new Error("NOT_FOUND_ROOM");

    // Unique roomNumber check if changed
    if (validated.roomNumber && validated.roomNumber !== room.roomNumber) {
      const existing = await tx.room.findFirst({
        where: {
          buildingId: room.buildingId,
          roomNumber: validated.roomNumber,
          deletedAt: null,
          id: { not: validated.roomId },
        },
      });

      if (existing) {
        throw new Error(`CONFLICT_ROOM_NUMBER_ALREADY_EXISTS: Số phòng '${validated.roomNumber}' đã tồn tại.`);
      }
    }

    const updated = await updateRoomInTx(tx, validated.roomId, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_ROOM",
        entity: "Room",
        entityId: updated.id,
        details: JSON.stringify({ roomNumber: updated.roomNumber }),
      },
    });

    return updated;
  });
}

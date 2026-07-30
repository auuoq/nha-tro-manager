import { requireOwner } from "@/server/permissions/rbac";
import { assertBuildingOwnership } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { createRoomSchema, CreateRoomInput } from "../schemas/room.schema";
import { createRoomInTx } from "../repositories/room-write.repository";

export async function createRoomService(input: CreateRoomInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createRoomSchema.parse(input);
  await assertBuildingOwnership(validated.buildingId, session.user);

  return runSerializableTransaction(async (tx) => {
    // Check roomNumber uniqueness within the building
    const existingRoom = await tx.room.findFirst({
      where: {
        buildingId: validated.buildingId,
        roomNumber: validated.roomNumber,
        deletedAt: null,
      },
    });

    if (existingRoom) {
      throw new Error(`CONFLICT_ROOM_NUMBER_ALREADY_EXISTS: Số phòng '${validated.roomNumber}' đã tồn tại trong tòa nhà này.`);
    }

    const room = await createRoomInTx(tx, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_ROOM",
        entity: "Room",
        entityId: room.id,
        details: JSON.stringify({ buildingId: room.buildingId, roomNumber: room.roomNumber }),
      },
    });

    return room;
  });
}

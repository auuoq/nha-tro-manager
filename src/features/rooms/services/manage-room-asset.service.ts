import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { roomAssetSchema, RoomAssetInput } from "../schemas/room-asset.schema";

export async function addRoomAssetService(roomId: string, input: RoomAssetInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertRoomAccess(roomId, session.user);
  const validated = roomAssetSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const asset = await tx.roomAsset.create({
      data: {
        roomId,
        name: validated.name,
        assetCode: validated.assetCode || null,
        condition: validated.condition,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADD_ROOM_ASSET",
        entity: "RoomAsset",
        entityId: asset.id,
        details: JSON.stringify({ roomId, name: asset.name }),
      },
    });

    return asset;
  });
}

export async function updateRoomAssetService(assetId: string, input: RoomAssetInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = roomAssetSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const asset = await tx.roomAsset.findUnique({
      where: { id: assetId },
      select: { roomId: true },
    });

    if (!asset) throw new Error("NOT_FOUND_ROOM_ASSET");
    await assertRoomAccess(asset.roomId, session.user);

    const updated = await tx.roomAsset.update({
      where: { id: assetId },
      data: {
        name: validated.name,
        assetCode: validated.assetCode || null,
        condition: validated.condition,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_ROOM_ASSET",
        entity: "RoomAsset",
        entityId: assetId,
        details: JSON.stringify({ name: updated.name }),
      },
    });

    return updated;
  });
}

export async function archiveRoomAssetService(assetId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const asset = await tx.roomAsset.findUnique({
      where: { id: assetId },
      select: { roomId: true, name: true },
    });

    if (!asset) throw new Error("NOT_FOUND_ROOM_ASSET");
    await assertRoomAccess(asset.roomId, session.user);

    await tx.roomAsset.delete({
      where: { id: assetId },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_ROOM_ASSET",
        entity: "RoomAsset",
        entityId: assetId,
        details: JSON.stringify({ name: asset.name }),
      },
    });
  });
}

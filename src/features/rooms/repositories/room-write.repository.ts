import { Prisma, RoomStatus } from "@prisma/client";
import { CreateRoomInput, UpdateRoomInput } from "../schemas/room.schema";

export async function createRoomInTx(tx: Prisma.TransactionClient, data: CreateRoomInput) {
  const room = await tx.room.create({
    data: {
      buildingId: data.buildingId,
      roomNumber: data.roomNumber,
      floor: data.floor,
      roomType: data.roomType,
      basePrice: data.basePrice,
      areaSqM: data.areaSqM,
      status: RoomStatus.VACANT,
      assets: data.initialAssets
        ? {
            create: data.initialAssets.map((a) => ({
              name: a.name,
              assetCode: a.assetCode || null,
              condition: a.condition || "GOOD",
            })),
          }
        : undefined,
    },
    include: {
      assets: true,
    },
  });

  return room;
}

export async function updateRoomInTx(tx: Prisma.TransactionClient, roomId: string, data: UpdateRoomInput) {
  return tx.room.update({
    where: { id: roomId },
    data: {
      ...(data.roomNumber ? { roomNumber: data.roomNumber } : {}),
      ...(data.floor !== undefined ? { floor: data.floor } : {}),
      ...(data.roomType ? { roomType: data.roomType } : {}),
      ...(data.basePrice !== undefined ? { basePrice: data.basePrice } : {}),
      ...(data.areaSqM !== undefined ? { areaSqM: data.areaSqM } : {}),
    },
  });
}

export async function updateRoomStatusInTx(tx: Prisma.TransactionClient, roomId: string, newStatus: RoomStatus) {
  return tx.room.update({
    where: { id: roomId },
    data: { status: newStatus },
  });
}

export async function softDeleteRoomInTx(tx: Prisma.TransactionClient, roomId: string) {
  return tx.room.update({
    where: { id: roomId },
    data: { deletedAt: new Date() },
  });
}

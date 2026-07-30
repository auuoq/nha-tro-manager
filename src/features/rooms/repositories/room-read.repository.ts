import { prisma } from "@/server/database/prisma";
import { RoomDetailDTO, RoomItemDTO } from "../types/room.types";

export async function findRoomsByOwner(ownerUserId: string, buildingId?: string): Promise<RoomItemDTO[]> {
  const rooms = await prisma.room.findMany({
    where: {
      building: {
        ownerId: ownerUserId,
        deletedAt: null,
      },
      deletedAt: null,
      ...(buildingId ? { buildingId } : {}),
    },
    orderBy: [{ building: { name: "asc" } }, { roomNumber: "asc" }],
    include: {
      building: {
        select: { name: true },
      },
      assets: true,
      chargeConfigs: {
        where: { roomId: { not: null }, contractId: null },
      },
      contracts: {
        where: { status: "ACTIVE", deletedAt: null },
        select: { id: true },
      },
    },
  });

  return rooms.map((r) => ({
    id: r.id,
    buildingId: r.buildingId,
    buildingName: r.building.name,
    roomNumber: r.roomNumber,
    floor: r.floor,
    roomType: r.roomType,
    basePrice: Number(r.basePrice),
    areaSqM: Number(r.areaSqM),
    status: r.status,
    assetsCount: r.assets.length,
    hasChargeConfig: r.chargeConfigs.length > 0,
    activeContractId: r.contracts[0]?.id || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function findRoomDetail(roomId: string, ownerUserId: string): Promise<RoomDetailDTO | null> {
  const r = await prisma.room.findFirst({
    where: {
      id: roomId,
      building: {
        ownerId: ownerUserId,
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      building: {
        select: {
          name: true,
          chargeConfigs: {
            where: { roomId: null, contractId: null },
            orderBy: { effectiveFrom: "desc" },
          },
        },
      },
      assets: {
        orderBy: { createdAt: "desc" },
      },
      chargeConfigs: {
        where: { roomId: roomId, contractId: null },
        orderBy: { effectiveFrom: "desc" },
      },
      contracts: {
        where: { status: "ACTIVE", deletedAt: null },
        select: { id: true },
      },
    },
  });

  if (!r) return null;

  return {
    id: r.id,
    buildingId: r.buildingId,
    buildingName: r.building.name,
    roomNumber: r.roomNumber,
    floor: r.floor,
    roomType: r.roomType,
    basePrice: Number(r.basePrice),
    areaSqM: Number(r.areaSqM),
    status: r.status,
    assetsCount: r.assets.length,
    hasChargeConfig: r.chargeConfigs.length > 0,
    activeContractId: r.contracts[0]?.id || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    assets: r.assets.map((a) => ({
      id: a.id,
      roomId: a.roomId,
      name: a.name,
      assetCode: a.assetCode,
      condition: a.condition,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })),
    chargeConfigs: r.chargeConfigs.map((c) => ({
      id: c.id,
      chargeType: c.chargeType,
      chargeMethod: c.chargeMethod,
      unitPrice: Number(c.unitPrice),
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
    })),
    buildingDefaultChargeConfigs: r.building.chargeConfigs.map((c) => ({
      id: c.id,
      chargeType: c.chargeType,
      chargeMethod: c.chargeMethod,
      unitPrice: Number(c.unitPrice),
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
    })),
  };
}

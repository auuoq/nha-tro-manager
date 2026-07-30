import { prisma } from "@/server/database/prisma";
import { BuildingDetailDTO, BuildingItemDTO } from "../types/building.types";

export async function findBuildingsByOwner(ownerUserId: string): Promise<BuildingItemDTO[]> {
  const buildings = await prisma.building.findMany({
    where: {
      ownerId: ownerUserId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      chargeConfigs: {
        where: { roomId: null, contractId: null },
        orderBy: { effectiveFrom: "desc" },
      },
      rooms: {
        where: { deletedAt: null },
        select: {
          id: true,
          contracts: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
      },
    },
  });

  return buildings.map((b) => {
    const activeContractsCount = b.rooms.reduce((acc, r) => acc + r.contracts.length, 0);

    return {
      id: b.id,
      ownerId: b.ownerId,
      name: b.name,
      address: b.address,
      description: b.description,
      bankName: b.bankName,
      bankAccountNo: b.bankAccountNo,
      bankAccountName: b.bankAccountName,
      bankBin: b.bankBin,
      wifiInfo: b.wifiInfo,
      rules: b.rules,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      roomsCount: b.rooms.length,
      activeContractsCount,
      chargeConfigs: b.chargeConfigs.map((c) => ({
        id: c.id,
        chargeType: c.chargeType,
        chargeMethod: c.chargeMethod,
        unitPrice: Number(c.unitPrice),
        effectiveFrom: c.effectiveFrom,
        effectiveTo: c.effectiveTo,
      })),
    };
  });
}

export async function findBuildingDetail(buildingId: string, ownerUserId: string): Promise<BuildingDetailDTO | null> {
  const b = await prisma.building.findFirst({
    where: {
      id: buildingId,
      ownerId: ownerUserId,
      deletedAt: null,
    },
    include: {
      chargeConfigs: {
        where: { roomId: null, contractId: null },
        orderBy: { effectiveFrom: "desc" },
      },
      rooms: {
        where: { deletedAt: null },
        orderBy: { roomNumber: "asc" },
        include: {
          contracts: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!b) return null;

  const activeContractsCount = b.rooms.reduce((acc, r) => acc + r.contracts.length, 0);

  return {
    id: b.id,
    ownerId: b.ownerId,
    name: b.name,
    address: b.address,
    description: b.description,
    bankName: b.bankName,
    bankAccountNo: b.bankAccountNo,
    bankAccountName: b.bankAccountName,
    bankBin: b.bankBin,
    wifiInfo: b.wifiInfo,
    rules: b.rules,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    roomsCount: b.rooms.length,
    activeContractsCount,
    chargeConfigs: b.chargeConfigs.map((c) => ({
      id: c.id,
      chargeType: c.chargeType,
      chargeMethod: c.chargeMethod,
      unitPrice: Number(c.unitPrice),
      effectiveFrom: c.effectiveFrom,
      effectiveTo: c.effectiveTo,
    })),
    rooms: b.rooms.map((r) => ({
      id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      roomType: r.roomType,
      basePrice: Number(r.basePrice),
      status: r.status,
    })),
  };
}

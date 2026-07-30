import { prisma } from "@/server/database/prisma";
import { MeterDTO, MeterReadingDTO } from "../types/meter.types";

export async function findMetersByOwner(ownerUserId: string, roomId?: string): Promise<MeterDTO[]> {
  const meters = await prisma.meter.findMany({
    where: {
      room: {
        building: {
          ownerId: ownerUserId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      ...(roomId ? { roomId } : {}),
    },
    orderBy: [{ isActive: "desc" }, { installedAt: "desc" }],
    include: {
      room: {
        select: {
          roomNumber: true,
          building: { select: { name: true } },
        },
      },
      readings: {
        orderBy: { period: "desc" },
        take: 1,
        select: { currentValue: true, period: true },
      },
    },
  });

  return meters.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    buildingName: m.room.building.name,
    roomNumber: m.room.roomNumber,
    type: m.type,
    serialNumber: m.serialNumber,
    initialReading: Number(m.initialReading),
    installedAt: m.installedAt,
    removedAt: m.removedAt,
    isActive: m.isActive,
    note: m.note,
    lastReadingValue: m.readings[0] ? Number(m.readings[0].currentValue) : null,
    lastReadingPeriod: m.readings[0] ? m.readings[0].period : null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));
}

export async function findMeterReadingsByOwner(ownerUserId: string, period?: string): Promise<MeterReadingDTO[]> {
  const readings = await prisma.meterReading.findMany({
    where: {
      meter: {
        room: {
          building: {
            ownerId: ownerUserId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
      ...(period ? { period } : {}),
    },
    orderBy: [{ period: "desc" }, { createdAt: "desc" }],
    include: {
      recordedBy: { select: { fullName: true } },
      meter: {
        select: {
          type: true,
          serialNumber: true,
          room: {
            select: {
              roomNumber: true,
              building: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  return readings.map((r) => ({
    id: r.id,
    meterId: r.meterId,
    meterType: r.meter.type,
    serialNumber: r.meter.serialNumber,
    roomNumber: r.meter.room.roomNumber,
    buildingName: r.meter.room.building.name,
    period: r.period,
    previousValue: Number(r.previousValue),
    currentValue: Number(r.currentValue),
    consumption: Number(r.consumption),
    imagePath: r.imagePath,
    note: r.note,
    status: r.status,
    recordedByName: r.recordedBy.fullName,
    recordedAt: r.recordedAt,
    createdAt: r.createdAt,
  }));
}

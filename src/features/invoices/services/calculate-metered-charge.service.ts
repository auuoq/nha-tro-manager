import { Prisma, MeterType } from "@prisma/client";

export interface MeteredChargeResult {
  totalConsumption: number;
  readingId: string | null;
  previousReading: number | null;
  currentReading: number | null;
  metadata: Record<string, any>;
}

export async function calculateMeteredChargeService(
  tx: Prisma.TransactionClient,
  params: {
    roomId: string;
    meterType: MeterType;
    billingPeriod: string;
  }
): Promise<MeteredChargeResult> {
  const { roomId, meterType, billingPeriod } = params;

  const readings = await tx.meterReading.findMany({
    where: {
      period: billingPeriod,
      status: { in: ["RECORDED", "VERIFIED"] },
      meter: {
        roomId,
        type: meterType,
      },
    },
    include: {
      meter: { select: { serialNumber: true, installedAt: true, removedAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (readings.length === 0) {
    throw new Error(
      `MISSING_METER_READING: Chưa có chỉ số đồng hồ ${meterType === "ELECTRICITY" ? "Điện" : "Nước"} nào được ghi nhận cho kỳ ${billingPeriod}.`
    );
  }

  const totalConsumption = readings.reduce((sum, r) => sum + Number(r.consumption), 0);

  const readingItems = readings.map((r) => ({
    meterId: r.meterId,
    meterReadingId: r.id,
    serialNumber: r.meter.serialNumber,
    previousValue: Number(r.previousValue),
    currentValue: Number(r.currentValue),
    consumption: Number(r.consumption),
    installedAt: r.meter.installedAt,
    removedAt: r.meter.removedAt,
  }));

  const single = readings.length === 1 ? readings[0] : null;

  return {
    totalConsumption,
    readingId: single ? single.id : null,
    previousReading: single ? Number(single.previousValue) : null,
    currentReading: single ? Number(single.currentValue) : null,
    metadata: {
      billingPeriod,
      meterType,
      readingsCount: readings.length,
      readings: readingItems,
    },
  };
}

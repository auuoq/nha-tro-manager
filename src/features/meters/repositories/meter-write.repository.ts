import { Prisma } from "@prisma/client";
import { CreateMeterInput, ReplaceMeterInput } from "../schemas/meter.schema";
import { RecordMeterReadingInput } from "../schemas/meter-reading.schema";

export async function createMeterInTx(tx: Prisma.TransactionClient, data: CreateMeterInput) {
  return tx.meter.create({
    data: {
      roomId: data.roomId,
      type: data.type,
      serialNumber: data.serialNumber,
      initialReading: data.initialReading,
      installedAt: data.installedAt,
      isActive: true,
      note: data.note || null,
    },
  });
}

export async function replaceMeterInTx(
  tx: Prisma.TransactionClient,
  oldMeter: { id: string; roomId: string; type: any },
  data: ReplaceMeterInput
) {
  // 1. Deactivate old meter
  await tx.meter.update({
    where: { id: oldMeter.id },
    data: {
      isActive: false,
      removedAt: data.replacedAt,
      note: `Thay mới đồng hồ vào ngày ${new Date(data.replacedAt).toLocaleDateString("vi-VN")}. Lý do: ${data.reason}`,
    },
  });

  // 2. Create new active meter
  const newMeter = await tx.meter.create({
    data: {
      roomId: oldMeter.roomId,
      type: oldMeter.type,
      serialNumber: data.newSerialNumber,
      initialReading: data.newInitialReading,
      installedAt: data.replacedAt,
      isActive: true,
      note: `Đồng hồ mới thay thế cho đồng hồ cũ (${oldMeter.id}). Lý do: ${data.reason}`,
    },
  });

  return newMeter;
}

export async function recordMeterReadingInTx(
  tx: Prisma.TransactionClient,
  recordedUserId: string,
  data: RecordMeterReadingInput,
  imagePath?: string
) {
  const consumption = data.currentValue - data.previousValue;

  return tx.meterReading.create({
    data: {
      meterId: data.meterId,
      period: data.period,
      previousValue: data.previousValue,
      currentValue: data.currentValue,
      consumption,
      imagePath: imagePath || null,
      note: data.note || null,
      status: "RECORDED",
      recordedById: recordedUserId,
      recordedAt: new Date(),
    },
  });
}

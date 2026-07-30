import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { recordMeterReadingSchema, RecordMeterReadingInput } from "../schemas/meter-reading.schema";
import { savePrivateMeterImageBuffer } from "@/server/storage/private-meter-storage.service";

export async function recordMeterReadingService(input: RecordMeterReadingInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = recordMeterReadingSchema.parse(input);

  // Optional image save
  let imagePath: string | undefined = undefined;
  if (validated.imageBase64 && validated.originalFilename) {
    const buffer = Buffer.from(validated.imageBase64, "base64");
    const saveRes = await savePrivateMeterImageBuffer(buffer, validated.originalFilename);
    if (saveRes.success && saveRes.storagePath) {
      imagePath = saveRes.storagePath;
    }
  }

  return runSerializableTransaction(async (tx) => {
    const meter = await tx.meter.findUnique({
      where: { id: validated.meterId },
      include: {
        room: { select: { building: { select: { ownerId: true } } } },
        readings: { orderBy: { period: "desc" }, take: 1 },
      },
    });

    if (!meter || meter.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_METER_OWNER");
    }

    if (!meter.isActive) {
      throw new Error("CANNOT_RECORD_READING_FOR_INACTIVE_METER: Đồng hồ này đã ngừng hoạt động.");
    }

    // 1. Determine Server-Side previousValue
    const lastReading = meter.readings[0];
    const previousValue = lastReading ? Number(lastReading.currentValue) : Number(meter.initialReading);

    // 2. Enforce Chronological Period Order (No backfilling without special action)
    if (lastReading && validated.period <= lastReading.period) {
      throw new Error(
        `INVALID_READING_PERIOD: Kỳ chốt (${validated.period}) không được nhỏ hơn hoặc bằng kỳ đã chốt gần nhất (${lastReading.period}).`
      );
    }

    // 3. Enforce currentValue >= previousValue
    if (validated.currentValue < previousValue) {
      throw new Error(
        `INVALID_METER_VALUE: Chỉ số mới (${validated.currentValue}) phải lớn hơn hoặc bằng chỉ số kỳ trước (${previousValue}).`
      );
    }

    // 4. Server-Side consumption calculation
    const consumption = validated.currentValue - previousValue;

    // 5. Unique check per (meterId, period)
    const existingReading = await tx.meterReading.findUnique({
      where: {
        meterId_period: {
          meterId: validated.meterId,
          period: validated.period,
        },
      },
    });

    if (existingReading) {
      throw new Error(`CONFLICT_READING_ALREADY_RECORDED: Đồng hồ này đã được ghi chỉ số cho kỳ ${validated.period}.`);
    }

    const reading = await tx.meterReading.create({
      data: {
        meterId: validated.meterId,
        period: validated.period,
        previousValue,
        currentValue: validated.currentValue,
        consumption,
        imagePath: imagePath || null,
        note: validated.note || null,
        status: "RECORDED",
        recordedById: session.user.id,
        recordedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RECORD_METER_READING",
        entity: "MeterReading",
        entityId: reading.id,
        details: JSON.stringify({
          meterId: meter.id,
          period: reading.period,
          previousValue,
          currentValue: reading.currentValue,
          consumption,
        }),
      },
    });

    return reading;
  });
}

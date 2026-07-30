import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { generateMeterSignedUrl } from "@/server/storage/private-meter-storage.service";

export async function getMeterReadingImageSignedUrlService(readingId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");

  return runSerializableTransaction(async (tx) => {
    const reading = await tx.meterReading.findUnique({
      where: { id: readingId },
      include: {
        meter: {
          select: {
            room: {
              select: { building: { select: { ownerId: true } } },
            },
          },
        },
      },
    });

    if (!reading || !reading.imagePath) {
      throw new Error("NOT_FOUND_METER_READING_IMAGE");
    }

    const isOwner = session.user.role === "OWNER" && reading.meter.room.building.ownerId === session.user.id;
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isOwner && !isSuperAdmin) {
      throw new Error("FORBIDDEN_METER_IMAGE_ACCESS");
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "VIEW_METER_READING_IMAGE",
        entity: "MeterReading",
        entityId: readingId,
        details: JSON.stringify({ period: reading.period }),
      },
    });

    return generateMeterSignedUrl(readingId, 300);
  });
}

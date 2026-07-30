import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { replaceMeterSchema, ReplaceMeterInput } from "../schemas/meter.schema";
import { replaceMeterInTx } from "../repositories/meter-write.repository";

export async function replaceMeterService(input: ReplaceMeterInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = replaceMeterSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const oldMeter = await tx.meter.findUnique({
      where: { id: validated.oldMeterId },
      include: {
        room: {
          select: { building: { select: { ownerId: true } } },
        },
      },
    });

    if (!oldMeter || oldMeter.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_METER_OWNER");
    }

    if (!oldMeter.isActive) {
      throw new Error("CANNOT_REPLACE_INACTIVE_METER: Đồng hồ cũ đã ngừng hoạt động.");
    }

    const newMeter = await replaceMeterInTx(tx, oldMeter, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPLACE_METER",
        entity: "Meter",
        entityId: newMeter.id,
        details: JSON.stringify({
          oldMeterId: oldMeter.id,
          newMeterId: newMeter.id,
          reason: validated.reason,
        }),
      },
    });

    return newMeter;
  });
}

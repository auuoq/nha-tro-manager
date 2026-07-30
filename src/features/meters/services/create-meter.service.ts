import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { createMeterSchema, CreateMeterInput } from "../schemas/meter.schema";
import { createMeterInTx } from "../repositories/meter-write.repository";

export async function createMeterService(input: CreateMeterInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createMeterSchema.parse(input);
  await assertRoomAccess(validated.roomId, session.user);

  return runSerializableTransaction(async (tx) => {
    // Enforce 1 active meter per room per type invariant
    const existingActive = await tx.meter.findFirst({
      where: {
        roomId: validated.roomId,
        type: validated.type,
        isActive: true,
      },
    });

    if (existingActive) {
      throw new Error(
        `CONFLICT_ACTIVE_METER_EXISTS: Phòng này đã có đồng hồ ${validated.type === "ELECTRICITY" ? "Điện" : "Nước"} đang hoạt động (${existingActive.serialNumber}). Hãy dùng tính năng Thay Đồng Hồ!`
      );
    }

    const meter = await createMeterInTx(tx, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_METER",
        entity: "Meter",
        entityId: meter.id,
        details: JSON.stringify({ roomId: meter.roomId, type: meter.type, serialNumber: meter.serialNumber }),
      },
    });

    return meter;
  });
}

import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { validateChargeConfigOverlap } from "@/server/database/validate-charge-config-overlap.service";
import { roomChargeConfigSchema, RoomChargeConfigInput } from "../schemas/room-charge-config.schema";

export async function upsertRoomChargeConfigService(
  roomId: string,
  input: RoomChargeConfigInput,
  excludeConfigId?: string
) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertRoomAccess(roomId, session.user);
  const validated = roomChargeConfigSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // 1. Validate Overlap
    await validateChargeConfigOverlap(tx, {
      buildingId: null,
      roomId: roomId,
      contractId: null,
      chargeType: validated.chargeType,
      effectiveFrom: validated.effectiveFrom,
      effectiveTo: validated.effectiveTo,
      excludeConfigId,
    });

    // 2. Create or Update
    let config;
    if (excludeConfigId) {
      config = await tx.chargeConfig.update({
        where: { id: excludeConfigId },
        data: {
          chargeMethod: validated.chargeMethod,
          unitPrice: validated.unitPrice,
          effectiveFrom: validated.effectiveFrom,
          effectiveTo: validated.effectiveTo,
        },
      });
    } else {
      config = await tx.chargeConfig.create({
        data: {
          buildingId: null,
          roomId: roomId,
          contractId: null,
          chargeType: validated.chargeType,
          chargeMethod: validated.chargeMethod,
          unitPrice: validated.unitPrice,
          effectiveFrom: validated.effectiveFrom,
          effectiveTo: validated.effectiveTo,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: excludeConfigId ? "UPDATE_ROOM_CHARGE_CONFIG" : "CREATE_ROOM_CHARGE_CONFIG",
        entity: "ChargeConfig",
        entityId: config.id,
        details: JSON.stringify({
          roomId,
          chargeType: config.chargeType,
          unitPrice: config.unitPrice,
        }),
      },
    });

    return config;
  });
}

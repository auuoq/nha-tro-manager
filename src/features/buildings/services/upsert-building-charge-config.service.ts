import { requireOwner } from "@/server/permissions/rbac";
import { assertBuildingOwnership } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { validateChargeConfigOverlap } from "@/server/database/validate-charge-config-overlap.service";
import { buildingChargeConfigSchema, BuildingChargeConfigInput } from "../schemas/building-charge-config.schema";

export async function upsertBuildingChargeConfigService(
  buildingId: string,
  input: BuildingChargeConfigInput,
  excludeConfigId?: string
) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  await assertBuildingOwnership(buildingId, session.user);
  const validated = buildingChargeConfigSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // 1. Kiểm tra chồng khoảng thời gian hiệu lực
    await validateChargeConfigOverlap(tx, {
      buildingId: buildingId,
      roomId: null,
      contractId: null,
      chargeType: validated.chargeType,
      effectiveFrom: validated.effectiveFrom,
      effectiveTo: validated.effectiveTo,
      excludeConfigId,
    });

    // 2. Tạo mới hoặc Cập nhật
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
          buildingId: buildingId,
          roomId: null,
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
        action: excludeConfigId ? "UPDATE_BUILDING_CHARGE_CONFIG" : "CREATE_BUILDING_CHARGE_CONFIG",
        entity: "ChargeConfig",
        entityId: config.id,
        details: JSON.stringify({
          buildingId,
          chargeType: config.chargeType,
          unitPrice: config.unitPrice,
        }),
      },
    });

    return config;
  });
}

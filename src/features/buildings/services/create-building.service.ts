import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { validateChargeConfigOverlap } from "@/server/database/validate-charge-config-overlap.service";
import { createBuildingSchema, CreateBuildingInput } from "../schemas/building.schema";
import { createBuildingInTx } from "../repositories/building-write.repository";

export async function createBuildingService(input: CreateBuildingInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createBuildingSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const building = await createBuildingInTx(tx, session.user.id, validated);

    // Xử lý tạo ChargeConfigs ban đầu (nếu có)
    if (validated.initialChargeConfigs && validated.initialChargeConfigs.length > 0) {
      for (const config of validated.initialChargeConfigs) {
        // Validate overlap
        await validateChargeConfigOverlap(tx, {
          buildingId: building.id,
          roomId: null,
          contractId: null,
          chargeType: config.chargeType,
          effectiveFrom: config.effectiveFrom,
          effectiveTo: config.effectiveTo,
        });

        await tx.chargeConfig.create({
          data: {
            buildingId: building.id,
            roomId: null,
            contractId: null,
            chargeType: config.chargeType,
            chargeMethod: config.chargeMethod,
            unitPrice: config.unitPrice,
            effectiveFrom: config.effectiveFrom,
            effectiveTo: config.effectiveTo,
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_BUILDING",
        entity: "Building",
        entityId: building.id,
        details: JSON.stringify({ name: building.name, address: building.address }),
      },
    });

    return building;
  });
}

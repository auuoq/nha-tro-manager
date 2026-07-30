import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { validateChargeConfigOverlap } from "@/server/database/validate-charge-config-overlap.service";
import { contractChargeConfigSchema, ContractChargeConfigInput } from "../schemas/contract-charge-config.schema";

export async function upsertContractChargeConfigService(
  contractId: string,
  input: ContractChargeConfigInput,
  excludeConfigId?: string
) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = contractChargeConfigSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: contractId },
      select: { room: { select: { building: { select: { ownerId: true } } } } },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    // 1. Validate Overlap
    await validateChargeConfigOverlap(tx, {
      buildingId: null,
      roomId: null,
      contractId: contractId,
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
          roomId: null,
          contractId: contractId,
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
        action: excludeConfigId ? "UPDATE_CONTRACT_CHARGE_CONFIG" : "CREATE_CONTRACT_CHARGE_CONFIG",
        entity: "ChargeConfig",
        entityId: config.id,
        details: JSON.stringify({
          contractId,
          chargeType: config.chargeType,
          unitPrice: config.unitPrice,
        }),
      },
    });

    return config;
  });
}

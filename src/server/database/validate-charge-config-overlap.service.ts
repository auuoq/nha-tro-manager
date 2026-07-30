import { Prisma, ChargeType } from "@prisma/client";

export interface ValidateOverlapParams {
  buildingId?: string | null;
  roomId?: string | null;
  contractId?: string | null;
  chargeType: ChargeType;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  excludeConfigId?: string;
}

export async function validateChargeConfigOverlap(
  tx: Prisma.TransactionClient,
  params: ValidateOverlapParams
): Promise<void> {
  const { buildingId, roomId, contractId, chargeType, effectiveFrom, effectiveTo, excludeConfigId } = params;

  // Exact-one-scope guard
  const scopesCount = [buildingId, roomId, contractId].filter(Boolean).length;
  if (scopesCount !== 1) {
    throw new Error("INVALID_CHARGE_CONFIG_SCOPE_EXACTLY_ONE_REQUIRED");
  }

  // Tìm các ChargeConfig có cùng Scope và cùng ChargeType
  const existingConfigs = await tx.chargeConfig.findMany({
    where: {
      buildingId: buildingId ?? null,
      roomId: roomId ?? null,
      contractId: contractId ?? null,
      chargeType: chargeType,
      ...(excludeConfigId ? { id: { not: excludeConfigId } } : {}),
    },
    select: {
      id: true,
      effectiveFrom: true,
      effectiveTo: true,
    },
  });

  const newStart = effectiveFrom.getTime();
  const newEnd = effectiveTo ? effectiveTo.getTime() : Infinity;

  for (const config of existingConfigs) {
    const existingStart = config.effectiveFrom.getTime();
    const existingEnd = config.effectiveTo ? config.effectiveTo.getTime() : Infinity;

    // Kiểm tra khoảng thời gian chồng nhau: (StartA <= EndB) AND (EndA >= StartB)
    const isOverlapping = newStart <= existingEnd && newEnd >= existingStart;

    if (isOverlapping) {
      throw new Error(
        `CHARGE_CONFIG_OVERLAP_CONFLICT: Cấu hình phí ${chargeType} bị trùng khoảng thời gian hiệu lực với bản ghi [${config.id}]`
      );
    }
  }
}

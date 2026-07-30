import { Prisma } from "@prisma/client";

export interface PerPersonChargeResult {
  activeTenantCount: number;
  metadata: Record<string, any>;
}

export async function calculatePerPersonChargeService(
  tx: Prisma.TransactionClient,
  params: {
    contractId: string;
    cutoffDate: Date;
  }
): Promise<PerPersonChargeResult> {
  const { contractId, cutoffDate } = params;

  const activeContractTenants = await tx.contractTenant.findMany({
    where: {
      contractId,
      joinedAt: { lte: cutoffDate },
      OR: [{ leftAt: null }, { leftAt: { gt: cutoffDate } }],
    },
    select: { tenantId: true },
  });

  const activeTenantCount = activeContractTenants.length;

  return {
    activeTenantCount,
    metadata: {
      cutoffDate,
      activeTenantCount,
      tenantIds: activeContractTenants.map((ct) => ct.tenantId),
    },
  };
}

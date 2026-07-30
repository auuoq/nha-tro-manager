import { Prisma, ContractStatus } from "@prisma/client";
import { CreateContractInput, UpdateContractInput, TerminateContractInput } from "../schemas/contract.schema";

export async function generateUniqueContractCode(tx: Prisma.TransactionClient): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
  let attempts = 0;
  while (attempts < 10) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `CT-${dateStr}-${randomHex}`;
    const existing = await tx.contract.findUnique({ where: { contractCode: code } });
    if (!existing) return code;
    attempts++;
  }
  throw new Error("CANNOT_GENERATE_UNIQUE_CONTRACT_CODE");
}

export async function createContractInTx(
  tx: Prisma.TransactionClient,
  data: CreateContractInput,
  contractCode: string
) {
  return tx.contract.create({
    data: {
      roomId: data.roomId,
      contractCode,
      startDate: data.startDate,
      endDate: data.endDate,
      depositAmount: data.depositAmount,
      monthlyPrice: data.monthlyPrice,
      billingDay: data.billingDay,
      status: ContractStatus.DRAFT,
      notes: data.notes || null,
      contractTenants: {
        create: [
          {
            tenantId: data.primaryTenantId,
            role: "PRIMARY",
            joinedAt: data.startDate,
          },
          ...(data.initialMemberTenantIds
            ? data.initialMemberTenantIds.map((tid) => ({
                tenantId: tid,
                role: "MEMBER" as const,
                joinedAt: data.startDate,
              }))
            : []),
        ],
      },
    },
    include: {
      contractTenants: true,
    },
  });
}

export async function updateContractInTx(
  tx: Prisma.TransactionClient,
  contractId: string,
  data: UpdateContractInput
) {
  return tx.contract.update({
    where: { id: contractId },
    data: {
      ...(data.startDate ? { startDate: data.startDate } : {}),
      ...(data.endDate ? { endDate: data.endDate } : {}),
      ...(data.depositAmount !== undefined ? { depositAmount: data.depositAmount } : {}),
      ...(data.monthlyPrice !== undefined ? { monthlyPrice: data.monthlyPrice } : {}),
      ...(data.billingDay !== undefined ? { billingDay: data.billingDay } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });
}

export async function activateContractInTx(
  tx: Prisma.TransactionClient,
  contractId: string,
  actualMoveInDate: Date
) {
  return tx.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.ACTIVE,
      actualMoveInDate,
    },
  });
}

export async function terminateContractInTx(
  tx: Prisma.TransactionClient,
  data: TerminateContractInput
) {
  return tx.contract.update({
    where: { id: data.contractId },
    data: {
      status: ContractStatus.TERMINATED,
      terminationDate: data.terminationDate,
      terminationReason: data.terminationReason,
      actualMoveOutDate: data.actualMoveOutDate,
      depositReturnedAmount: data.depositReturnedAmount,
      depositDeductionAmount: data.depositDeductionAmount,
    },
  });
}

export async function cancelContractInTx(
  tx: Prisma.TransactionClient,
  contractId: string,
  cancellationReason: string
) {
  return tx.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.CANCELLED,
      cancellationReason,
    },
  });
}

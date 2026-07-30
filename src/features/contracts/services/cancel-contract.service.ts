import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { cancelContractSchema, CancelContractInput } from "../schemas/contract.schema";
import { cancelContractInTx } from "../repositories/contract-write.repository";
import { ContractStatus } from "@prisma/client";

export async function cancelContractService(input: CancelContractInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = cancelContractSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: validated.contractId },
      select: {
        status: true,
        room: {
          select: { building: { select: { ownerId: true } } },
        },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new Error("CANNOT_CANCEL_NON_DRAFT_CONTRACT: Chỉ hợp đồng trạng thái DRAFT mới có thể hủy.");
    }

    const cancelled = await cancelContractInTx(tx, validated.contractId, validated.cancellationReason);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL_CONTRACT_DRAFT",
        entity: "Contract",
        entityId: validated.contractId,
        details: JSON.stringify({ cancellationReason: validated.cancellationReason }),
      },
    });

    return cancelled;
  });
}

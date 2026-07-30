import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { updateContractSchema, UpdateContractInput } from "../schemas/contract.schema";
import { updateContractInTx } from "../repositories/contract-write.repository";
import { ContractStatus } from "@prisma/client";

export async function updateContractService(input: UpdateContractInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = updateContractSchema.parse(input);

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
      throw new Error("CANNOT_UPDATE_NON_DRAFT_CONTRACT: Chỉ có thể sửa hợp đồng ở trạng thái DRAFT.");
    }

    const updated = await updateContractInTx(tx, validated.contractId, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_CONTRACT_DRAFT",
        entity: "Contract",
        entityId: updated.id,
        details: JSON.stringify({ contractCode: updated.contractCode }),
      },
    });

    return updated;
  });
}

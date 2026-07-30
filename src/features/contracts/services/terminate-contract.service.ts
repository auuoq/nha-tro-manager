import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { terminateContractSchema, TerminateContractInput } from "../schemas/contract.schema";
import { terminateContractInTx } from "../repositories/contract-write.repository";
import { updateRoomStatusInTx } from "@/features/rooms/repositories/room-write.repository";
import { ContractStatus, RoomStatus } from "@prisma/client";

export async function terminateContractService(input: TerminateContractInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = terminateContractSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: validated.contractId },
      select: {
        status: true,
        roomId: true,
        depositAmount: true,
        room: {
          select: { building: { select: { ownerId: true } } },
        },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.EXPIRING) {
      throw new Error("INVALID_CONTRACT_STATUS: Chỉ hợp đồng đang hoạt động mới được thanh lý.");
    }

    // Deposit check: returned + deduction <= depositAmount
    const totalDepositProcessed = validated.depositReturnedAmount + validated.depositDeductionAmount;
    if (totalDepositProcessed > Number(contract.depositAmount)) {
      throw new Error(
        `DEPOSIT_AMOUNT_EXCEEDED: Tổng tiền trả cọc (${validated.depositReturnedAmount.toLocaleString(
          "vi-VN"
        )}đ) và khấu trừ (${validated.depositDeductionAmount.toLocaleString(
          "vi-VN"
        )}đ) vượt quá tiền cọc ban đầu (${Number(contract.depositAmount).toLocaleString("vi-VN")}đ).`
      );
    }

    // Terminate contract record
    const terminated = await terminateContractInTx(tx, validated);

    // Update leftAt for active contract tenants
    await tx.contractTenant.updateMany({
      where: { contractId: validated.contractId, leftAt: null },
      data: { leftAt: validated.actualMoveOutDate },
    });

    // Check remaining active contracts for room
    const remainingActive = await tx.contract.count({
      where: {
        roomId: contract.roomId,
        status: ContractStatus.ACTIVE,
        id: { not: validated.contractId },
        deletedAt: null,
      },
    });

    if (remainingActive === 0) {
      await updateRoomStatusInTx(tx, contract.roomId, RoomStatus.VACANT);
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "TERMINATE_CONTRACT",
        entity: "Contract",
        entityId: validated.contractId,
        details: JSON.stringify({
          contractCode: terminated.contractCode,
          terminationReason: validated.terminationReason,
        }),
      },
    });

    return terminated;
  });
}

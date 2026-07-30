import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { activateContractInTx } from "../repositories/contract-write.repository";
import { validateContractOverlapService } from "./validate-contract-overlap.service";
import { updateRoomStatusInTx } from "@/features/rooms/repositories/room-write.repository";
import { ContractStatus, RoomStatus } from "@prisma/client";

export async function activateContractService(contractId: string, actualMoveInDate?: Date) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: contractId },
      include: {
        room: {
          select: {
            id: true,
            status: true,
            building: { select: { ownerId: true } },
          },
        },
        contractTenants: {
          where: { leftAt: null },
          select: { role: true },
        },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new Error("INVALID_CONTRACT_STATUS: Chỉ hợp đồng trạng thái DRAFT mới có thể kích hoạt.");
    }

    if (contract.room.status === RoomStatus.MAINTENANCE) {
      throw new Error("CANNOT_ACTIVATE_CONTRACT_ON_MAINTENANCE_ROOM: Phòng đang bảo trì. Không thể kích hoạt hợp đồng!");
    }

    // Check overlap with active contracts
    await validateContractOverlapService(tx, {
      roomId: contract.roomId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      excludeContractId: contract.id,
    });

    // Check exactly 1 PRIMARY tenant
    const primaryCount = contract.contractTenants.filter((ct) => ct.role === "PRIMARY").length;
    if (primaryCount !== 1) {
      throw new Error("MUST_HAVE_EXACTLY_ONE_PRIMARY_TENANT: Hợp đồng phải có chính xác 1 đại diện (PRIMARY) active.");
    }

    const moveInDate = actualMoveInDate || new Date();
    const activated = await activateContractInTx(tx, contractId, moveInDate);

    // Sync RoomStatus -> RENTED
    await updateRoomStatusInTx(tx, contract.roomId, RoomStatus.RENTED);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ACTIVATE_CONTRACT",
        entity: "Contract",
        entityId: contractId,
        details: JSON.stringify({ contractCode: activated.contractCode, roomId: contract.roomId }),
      },
    });

    return activated;
  });
}

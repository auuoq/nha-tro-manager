import { requireOwner } from "@/server/permissions/rbac";
import { assertRoomAccess } from "@/server/permissions/ownership";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { createContractSchema, CreateContractInput } from "../schemas/contract.schema";
import { createContractInTx, generateUniqueContractCode } from "../repositories/contract-write.repository";
import { RoomStatus } from "@prisma/client";

export async function createContractService(input: CreateContractInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createContractSchema.parse(input);
  await assertRoomAccess(validated.roomId, session.user);

  return runSerializableTransaction(async (tx) => {
    // 1. Check Room status
    const room = await tx.room.findUnique({
      where: { id: validated.roomId },
      select: { status: true },
    });

    if (!room) throw new Error("NOT_FOUND_ROOM");
    if (room.status === RoomStatus.MAINTENANCE) {
      throw new Error("CANNOT_CREATE_CONTRACT_FOR_MAINTENANCE_ROOM: Phòng đang bảo trì, không thể tạo hợp đồng mới.");
    }

    // 2. Validate Tenant Ownership
    const allTenantIds = Array.from(
      new Set([validated.primaryTenantId, ...(validated.initialMemberTenantIds || [])])
    );

    const tenants = await tx.tenant.findMany({
      where: {
        id: { in: allTenantIds },
        ownerId: session.user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (tenants.length !== allTenantIds.length) {
      throw new Error("FORBIDDEN_INVALID_TENANT_SELECTION: Khách thuê chọn không thuộc quyền quản lý của bạn hoặc đã bị lưu trữ.");
    }

    // 3. Generate Code & Create DRAFT Contract
    const contractCode = await generateUniqueContractCode(tx);
    const contract = await createContractInTx(tx, validated, contractCode);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_CONTRACT_DRAFT",
        entity: "Contract",
        entityId: contract.id,
        details: JSON.stringify({
          contractCode,
          roomId: contract.roomId,
          primaryTenantId: validated.primaryTenantId,
        }),
      },
    });

    return contract;
  });
}

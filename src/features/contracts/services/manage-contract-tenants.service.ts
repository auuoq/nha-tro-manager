import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { addContractMemberSchema, AddContractMemberInput, changePrimaryTenantSchema, ChangePrimaryTenantInput } from "../schemas/contract-tenant.schema";
import { ContractTenantRole } from "@prisma/client";

export async function addContractMemberService(input: AddContractMemberInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = addContractMemberSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: validated.contractId },
      select: {
        startDate: true,
        room: { select: { building: { select: { ownerId: true } } } },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    const tenant = await tx.tenant.findUnique({
      where: { id: validated.tenantId },
      select: { ownerId: true, fullName: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_INVALID_TENANT_SELECTION: Khách thuê không thuộc quyền quản lý của bạn.");
    }

    // Check if tenant is already active in this contract
    const existing = await tx.contractTenant.findFirst({
      where: {
        contractId: validated.contractId,
        tenantId: validated.tenantId,
        leftAt: null,
      },
    });

    if (existing) {
      throw new Error("ALREADY_ACTIVE_MEMBER: Khách thuê này đã có tên trong hợp đồng.");
    }

    const newMember = await tx.contractTenant.create({
      data: {
        contractId: validated.contractId,
        tenantId: validated.tenantId,
        role: ContractTenantRole.MEMBER,
        joinedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADD_CONTRACT_MEMBER",
        entity: "ContractTenant",
        entityId: newMember.id,
        details: JSON.stringify({ contractId: validated.contractId, tenantName: tenant.fullName }),
      },
    });

    return newMember;
  });
}

export async function removeContractMemberService(contractTenantId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const ct = await tx.contractTenant.findUnique({
      where: { id: contractTenantId },
      include: {
        contract: {
          select: { room: { select: { building: { select: { ownerId: true } } } } },
        },
      },
    });

    if (!ct || ct.contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    if (ct.role === ContractTenantRole.PRIMARY) {
      throw new Error("CANNOT_REMOVE_PRIMARY_TENANT: Không thể xóa đại diện hợp đồng (PRIMARY). Hãy đổi đại diện trước!");
    }

    // Soft removal: set leftAt = now()
    const updated = await tx.contractTenant.update({
      where: { id: contractTenantId },
      data: { leftAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REMOVE_CONTRACT_MEMBER",
        entity: "ContractTenant",
        entityId: contractTenantId,
        details: JSON.stringify({ contractId: ct.contractId }),
      },
    });

    return updated;
  });
}

export async function changePrimaryTenantService(input: ChangePrimaryTenantInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = changePrimaryTenantSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const contract = await tx.contract.findUnique({
      where: { id: validated.contractId },
      select: {
        room: { select: { building: { select: { ownerId: true } } } },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    // 1. Demote old primary to MEMBER
    await tx.contractTenant.updateMany({
      where: {
        contractId: validated.contractId,
        role: ContractTenantRole.PRIMARY,
        leftAt: null,
      },
      data: { role: ContractTenantRole.MEMBER },
    });

    // 2. Promote target tenant to PRIMARY or create if new
    const targetCt = await tx.contractTenant.findFirst({
      where: {
        contractId: validated.contractId,
        tenantId: validated.newPrimaryTenantId,
        leftAt: null,
      },
    });

    if (targetCt) {
      await tx.contractTenant.update({
        where: { id: targetCt.id },
        data: { role: ContractTenantRole.PRIMARY },
      });
    } else {
      await tx.contractTenant.create({
        data: {
          contractId: validated.contractId,
          tenantId: validated.newPrimaryTenantId,
          role: ContractTenantRole.PRIMARY,
          joinedAt: new Date(),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CHANGE_PRIMARY_TENANT",
        entity: "Contract",
        entityId: validated.contractId,
        details: JSON.stringify({ newPrimaryTenantId: validated.newPrimaryTenantId }),
      },
    });
  });
}

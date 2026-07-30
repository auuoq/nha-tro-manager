import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { updateTenantSchema, UpdateTenantInput } from "../schemas/tenant.schema";
import { updateTenantInTx } from "../repositories/tenant-write.repository";

export async function updateTenantService(input: UpdateTenantInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = updateTenantSchema.parse(input);
  if (!validated.tenantId) throw new Error("MISSING_TENANT_ID");

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: validated.tenantId },
      select: { ownerId: true, idCardNumber: true },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    // Check idCardNumber conflict if updated
    if (validated.idCardNumber && validated.idCardNumber !== tenant.idCardNumber) {
      const existing = await tx.tenant.findUnique({
        where: { idCardNumber: validated.idCardNumber },
        select: { id: true },
      });

      if (existing) {
        throw new Error("CONFLICT_IDCARD_NUMBER_ALREADY_EXISTS: Số CCCD/CMND này đã tồn tại trên hệ thống.");
      }
    }

    const updated = await updateTenantInTx(tx, validated.tenantId!, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_TENANT_PROFILE",
        entity: "Tenant",
        entityId: updated.id,
        details: JSON.stringify({ fullName: updated.fullName }),
      },
    });

    return updated;
  });
}

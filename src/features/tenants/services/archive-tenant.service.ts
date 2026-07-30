import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { softDeleteTenantInTx } from "../repositories/tenant-write.repository";

export async function archiveTenantService(tenantId: string, reason?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: {
        ownerId: true,
        userId: true,
        contractTenants: {
          where: { leftAt: null, contract: { status: "ACTIVE", deletedAt: null } },
          select: { id: true },
        },
      },
    });

    if (!tenant || tenant.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_TENANT_OWNER");
    }

    if (tenant.contractTenants.length > 0) {
      throw new Error("CANNOT_ARCHIVE_TENANT_WITH_ACTIVE_CONTRACT: Khách thuê đang tham gia hợp đồng hoạt động (ACTIVE). Không thể lưu trữ!");
    }

    // Soft delete tenant profile
    const archived = await softDeleteTenantInTx(tx, tenantId);

    // Deactivate User account if linked
    if (tenant.userId) {
      await tx.user.update({
        where: { id: tenant.userId },
        data: {
          isActive: false,
          tokenVersion: { increment: 1 },
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ARCHIVE_TENANT_PROFILE",
        entity: "Tenant",
        entityId: tenantId,
        details: JSON.stringify({
          archivedAt: archived.deletedAt,
          reason: reason || "Chủ nhà chủ động lưu trữ hồ sơ khách thuê",
        }),
      },
    });

    return archived;
  });
}

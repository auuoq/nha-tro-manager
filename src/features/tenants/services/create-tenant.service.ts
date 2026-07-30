import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { createTenantSchema, CreateTenantInput } from "../schemas/tenant.schema";
import { createTenantInTx } from "../repositories/tenant-write.repository";

export async function createTenantService(input: CreateTenantInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createTenantSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // Check idCardNumber uniqueness with neutral error message
    if (validated.idCardNumber) {
      const existing = await tx.tenant.findUnique({
        where: { idCardNumber: validated.idCardNumber },
        select: { id: true },
      });

      if (existing) {
        throw new Error("CONFLICT_IDCARD_NUMBER_ALREADY_EXISTS: Số CCCD/CMND này đã tồn tại trên hệ thống.");
      }
    }

    const tenant = await createTenantInTx(tx, session.user.id, validated);

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_TENANT_PROFILE",
        entity: "Tenant",
        entityId: tenant.id,
        details: JSON.stringify({ fullName: tenant.fullName, phone: tenant.phone }),
      },
    });

    return tenant;
  });
}

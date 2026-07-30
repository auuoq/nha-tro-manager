import { requireTenant } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { tenantProfileSelfServiceSchema, TenantProfileSelfServiceInput } from "../schemas/tenant-profile-self-service.schema";
import { updateTenantInTx } from "../repositories/tenant-write.repository";

export async function updateOwnTenantProfileService(input: TenantProfileSelfServiceInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireTenant(session.user);

  const validated = tenantProfileSelfServiceSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    const tenant = await tx.tenant.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!tenant) throw new Error("NOT_FOUND_TENANT_PROFILE");

    const updated = await updateTenantInTx(tx, tenant.id, {
      tenantId: tenant.id,
      phone: validated.phone,
      permanentAddress: validated.permanentAddress,
      vehicleNumber: validated.vehicleNumber,
      emergencyContactName: validated.emergencyContactName,
      emergencyContactPhone: validated.emergencyContactPhone,
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_OWN_TENANT_PROFILE",
        entity: "Tenant",
        entityId: tenant.id,
        details: JSON.stringify({ updatedFields: Object.keys(validated) }),
      },
    });

    return updated;
  });
}

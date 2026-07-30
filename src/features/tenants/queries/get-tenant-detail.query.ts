import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findTenantDetail } from "../repositories/tenant-read.repository";

export async function getTenantDetailQuery(tenantId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findTenantDetail(tenantId, session.user.id);
}

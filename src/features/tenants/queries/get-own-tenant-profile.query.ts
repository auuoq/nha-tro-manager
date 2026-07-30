import { requireTenant } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findTenantByUserId } from "../repositories/tenant-read.repository";

export async function getOwnTenantProfileQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireTenant(session.user);

  return findTenantByUserId(session.user.id);
}

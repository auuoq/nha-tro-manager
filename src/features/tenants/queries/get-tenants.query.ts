import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findTenantsByOwner } from "../repositories/tenant-read.repository";

export async function getTenantsQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findTenantsByOwner(session.user.id);
}

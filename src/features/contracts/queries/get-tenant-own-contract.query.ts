import { requireTenant } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findTenantOwnContract } from "../repositories/contract-read.repository";

export async function getTenantOwnContractQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireTenant(session.user);

  return findTenantOwnContract(session.user.id);
}

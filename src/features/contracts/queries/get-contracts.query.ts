import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findContractsByOwner } from "../repositories/contract-read.repository";

export async function getContractsQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findContractsByOwner(session.user.id);
}

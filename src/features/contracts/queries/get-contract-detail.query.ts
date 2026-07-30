import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findContractDetail } from "../repositories/contract-read.repository";

export async function getContractDetailQuery(contractId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findContractDetail(contractId, session.user.id);
}

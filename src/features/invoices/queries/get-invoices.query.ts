import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findInvoicesByOwner } from "../repositories/invoice-read.repository";

export async function getInvoicesQuery(period?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findInvoicesByOwner(session.user.id, period);
}

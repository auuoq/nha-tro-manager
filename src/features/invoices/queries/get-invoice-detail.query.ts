import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { findInvoiceDetail } from "../repositories/invoice-read.repository";

export async function getInvoiceDetailQuery(invoiceId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findInvoiceDetail(invoiceId, session.user.id);
}

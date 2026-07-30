import { getServerSession } from "@/server/auth/session";
import { findTenantInvoiceDetail } from "../repositories/invoice-tenant-read.repository";

export async function getTenantInvoiceDetailQuery(invoiceId: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (session.user.role !== "TENANT") throw new Error("FORBIDDEN_TENANT_ONLY");

  return findTenantInvoiceDetail(invoiceId, session.user.id);
}

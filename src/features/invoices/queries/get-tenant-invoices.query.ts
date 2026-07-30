import { getServerSession } from "@/server/auth/session";
import { findTenantInvoices } from "../repositories/invoice-tenant-read.repository";

export async function getTenantInvoicesQuery() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (session.user.role !== "TENANT") throw new Error("FORBIDDEN_TENANT_ONLY");

  return findTenantInvoices(session.user.id);
}

import { getServerSession } from "@/server/auth/session";
import { findTenantPayments } from "../repositories/payment-read.repository";

export async function getTenantPaymentsQuery(invoiceId?: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (session.user.role !== "TENANT") throw new Error("FORBIDDEN_TENANT_ONLY");

  return findTenantPayments(session.user.id, invoiceId);
}

import { getServerSession } from "@/server/auth/session";
import { requireOwner } from "@/server/permissions/rbac";
import { findOwnerPayments, PaymentFilter } from "../repositories/payment-read.repository";

export async function getPaymentsQuery(filter?: Omit<PaymentFilter, "ownerId">) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  return findOwnerPayments({
    ownerId: session.user.id,
    ...filter,
  });
}

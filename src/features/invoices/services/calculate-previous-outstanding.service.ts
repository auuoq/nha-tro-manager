import { Prisma } from "@prisma/client";

export async function calculatePreviousOutstandingService(
  tx: Prisma.TransactionClient,
  contractId: string,
  excludeInvoiceId?: string
): Promise<number> {
  const previousInvoices = await tx.invoice.findMany({
    where: {
      contractId,
      status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
      deletedAt: null,
      ...(excludeInvoiceId ? { id: { not: excludeInvoiceId } } : {}),
    },
    select: { remainingAmount: true },
  });

  const totalOutstanding = previousInvoices.reduce(
    (sum, inv) => sum + Number(inv.remainingAmount),
    0
  );

  return totalOutstanding;
}

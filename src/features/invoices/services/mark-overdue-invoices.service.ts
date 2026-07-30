import { prisma } from "@/server/database/prisma";
import { InvoiceStatus } from "@prisma/client";

/**
 * Mark overdue invoices: ISSUED/PARTIALLY_PAID with dueDate < now and remainingAmount > 0
 * This should be run as a scheduled job, NOT during read queries.
 * Does NOT mutate DB inside read queries.
 */
export async function markOverdueInvoicesService(): Promise<number> {
  const now = new Date();

  const result = await prisma.invoice.updateMany({
    where: {
      status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
      dueDate: { lt: now },
      remainingAmount: { gt: 0 },
      deletedAt: null,
    },
    data: {
      status: InvoiceStatus.OVERDUE,
    },
  });

  if (result.count > 0) {
    console.log(`[mark-overdue-invoices] Marked ${result.count} invoices as OVERDUE at ${now.toISOString()}`);
  }

  return result.count;
}

import { Prisma, InvoiceStatus, PaymentStatus } from "@prisma/client";

/**
 * Payment Ledger Principle:
 * Calculates total net paid amount from all CONFIRMED / PARTIALLY_REFUNDED / REFUNDED payments
 * and updates Invoice.paidAmount, remainingAmount, and status atomically.
 */
export async function recalculateInvoicePaymentStatusService(
  tx: Prisma.TransactionClient,
  invoiceId: string
) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: {
        where: {
          status: { in: [PaymentStatus.CONFIRMED, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED] },
          deletedAt: null,
        },
      },
    },
  });

  if (!invoice) throw new Error("INVOICE_NOT_FOUND");

  // Sum net paid amounts = sum(amount - refundAmount)
  let netPaidAmount = 0;
  for (const p of invoice.payments) {
    const gross = Number(p.amount);
    const refund = Number(p.refundAmount || 0);
    netPaidAmount += Math.max(0, gross - refund);
  }

  const totalAmount = Number(invoice.totalAmount);
  const remainingAmount = Math.max(0, totalAmount - netPaidAmount);
  const overpaymentAmount = Math.max(0, netPaidAmount - totalAmount);

  let newStatus: InvoiceStatus = invoice.status;

  // Do not mutate CANCELLED or DRAFT invoices
  if (invoice.status !== InvoiceStatus.CANCELLED && invoice.status !== InvoiceStatus.DRAFT) {
    if (netPaidAmount >= totalAmount && totalAmount > 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (netPaidAmount > 0 && netPaidAmount < totalAmount) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else if (netPaidAmount === 0) {
      const now = new Date();
      newStatus = invoice.dueDate < now ? InvoiceStatus.OVERDUE : InvoiceStatus.ISSUED;
    }
  }

  const updatedInvoice = await tx.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: netPaidAmount,
      remainingAmount,
      status: newStatus,
    },
  });

  return {
    invoice: updatedInvoice,
    paidAmount: netPaidAmount,
    remainingAmount,
    overpaymentAmount,
    newStatus,
  };
}

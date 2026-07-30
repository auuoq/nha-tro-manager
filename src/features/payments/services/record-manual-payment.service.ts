import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { RecordManualPaymentInput, recordManualPaymentSchema } from "../schemas/payment.schema";
import { PaymentStatus, PaymentSource, InvoiceStatus } from "@prisma/client";
import { recalculateInvoicePaymentStatusService } from "./recalculate-invoice-payment-status.service";

export async function generateUniquePaymentCode(tx: any): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  let attempts = 0;
  while (attempts < 10) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `PAY-${dateStr}-${randomHex}`;
    const existing = await tx.payment.findUnique({ where: { paymentCode: code } });
    if (!existing) return code;
    attempts++;
  }
  throw new Error("CANNOT_GENERATE_UNIQUE_PAYMENT_CODE");
}

export async function recordManualPaymentService(input: RecordManualPaymentInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = recordManualPaymentSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // 1. Verify Invoice ownership and status
    const invoice = await tx.invoice.findUnique({
      where: { id: validated.invoiceId },
      include: {
        room: { select: { building: { select: { ownerId: true } } } },
      },
    });

    if (!invoice || invoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
    }

    const validStatuses: InvoiceStatus[] = [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE];
    if (!validStatuses.includes(invoice.status)) {
      throw new Error(`CANNOT_RECORD_PAYMENT_FOR_STATUS_${invoice.status}: Chỉ có thể thanh toán cho Hóa đơn ISSUED, PARTIALLY_PAID hoặc OVERDUE.`);
    }

    if (invoice.deletedAt) {
      throw new Error("INVOICE_ARCHIVED: Hóa đơn đã bị xóa hoặc lưu trữ.");
    }

    const now = new Date();
    const paymentCode = await generateUniquePaymentCode(tx);
    const amount = validated.amount;
    const remainingBefore = Number(invoice.remainingAmount);
    const overpaymentAmount = amount > remainingBefore ? amount - remainingBefore : 0;

    // 2. Create CONFIRMED manual payment
    const payment = await tx.payment.create({
      data: {
        paymentCode,
        invoiceId: validated.invoiceId,
        amount,
        overpaymentAmount,
        method: validated.method,
        source: PaymentSource.ADMIN_MANUAL,
        status: PaymentStatus.CONFIRMED,
        transactionRef: validated.transactionRef || null,
        notes: validated.notes || null,
        receivedAt: now,
        confirmedAt: now,
        confirmedById: session.user.id,
        recordedById: session.user.id,
      },
    });

    // 3. Recalculate Invoice Ledger & Status
    const ledgerResult = await recalculateInvoicePaymentStatusService(tx, validated.invoiceId);

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RECORD_MANUAL_PAYMENT",
        entity: "Payment",
        entityId: payment.id,
        details: JSON.stringify({
          paymentCode,
          invoiceId: validated.invoiceId,
          amount,
          method: validated.method,
          overpaymentAmount,
          newInvoiceStatus: ledgerResult.newStatus,
        }),
      },
    });

    return {
      payment,
      invoice: ledgerResult.invoice,
      overpaymentAmount: ledgerResult.overpaymentAmount,
    };
  });
}

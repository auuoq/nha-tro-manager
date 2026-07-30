import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { RefundPaymentInput, refundPaymentSchema } from "../schemas/payment.schema";
import { PaymentStatus } from "@prisma/client";
import { recalculateInvoicePaymentStatusService } from "./recalculate-invoice-payment-status.service";

export async function refundPaymentService(input: RefundPaymentInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = refundPaymentSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // 1. Fetch Payment & check ownership
    const payment = await tx.payment.findUnique({
      where: { id: validated.paymentId },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceCode: true,
            room: { select: { building: { select: { ownerId: true } } } },
          },
        },
      },
    });

    if (!payment || payment.invoice.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_PAYMENT_OWNER");
    }

    const validStatuses: PaymentStatus[] = [PaymentStatus.CONFIRMED, PaymentStatus.PARTIALLY_REFUNDED];
    if (!validStatuses.includes(payment.status)) {
      throw new Error("CANNOT_REFUND_PAYMENT: Chỉ có thể hoàn tiền cho giao dịch CONFIRMED hoặc PARTIALLY_REFUNDED.");
    }

    const currentRefunded = Number(payment.refundAmount || 0);
    const paymentGrossAmount = Number(payment.amount);
    const newTotalRefund = currentRefunded + validated.refundAmount;

    if (newTotalRefund > paymentGrossAmount) {
      throw new Error(`REFUND_EXCEEDS_PAYMENT_AMOUNT: Tổng tiền hoàn (${newTotalRefund.toLocaleString("vi-VN")}đ) vượt quá số tiền thanh toán ban đầu (${paymentGrossAmount.toLocaleString("vi-VN")}đ).`);
    }

    const newStatus = newTotalRefund === paymentGrossAmount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    // 2. Update Payment refund info
    const updatedPayment = await tx.payment.update({
      where: { id: validated.paymentId },
      data: {
        refundAmount: newTotalRefund,
        status: newStatus,
        refundReason: validated.refundReason.trim(),
      },
    });

    // 3. Recalculate Invoice Ledger & Status
    const ledgerResult = await recalculateInvoicePaymentStatusService(tx, payment.invoiceId);

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REFUND_PAYMENT",
        entity: "Payment",
        entityId: payment.id,
        details: JSON.stringify({
          paymentCode: payment.paymentCode,
          invoiceId: payment.invoiceId,
          refundAmount: validated.refundAmount,
          totalRefundAmount: newTotalRefund,
          refundReason: validated.refundReason.trim(),
          newPaymentStatus: newStatus,
          newInvoiceStatus: ledgerResult.newStatus,
        }),
      },
    });

    return {
      payment: updatedPayment,
      invoice: ledgerResult.invoice,
    };
  });
}

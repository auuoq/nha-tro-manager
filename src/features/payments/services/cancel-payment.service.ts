import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { CancelPaymentInput, cancelPaymentSchema } from "../schemas/payment.schema";
import { PaymentStatus } from "@prisma/client";
import { recalculateInvoicePaymentStatusService } from "./recalculate-invoice-payment-status.service";

export async function cancelPaymentService(input: CancelPaymentInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = cancelPaymentSchema.parse(input);

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

    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new Error("CANNOT_CANCEL_NON_CONFIRMED_PAYMENT: Chỉ có thể hủy giao dịch ở trạng thái CONFIRMED.");
    }

    if (Number(payment.refundAmount) > 0) {
      throw new Error("CANNOT_CANCEL_REFUNDED_PAYMENT: Giao dịch đã có hoàn tiền. Vui lòng kiểm tra lại.");
    }

    const now = new Date();

    // 2. Mark Payment as CANCELLED
    const updatedPayment = await tx.payment.update({
      where: { id: validated.paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        cancelledAt: now,
        cancellationReason: validated.cancellationReason.trim(),
      },
    });

    // 3. Recalculate Invoice Ledger & Status
    const ledgerResult = await recalculateInvoicePaymentStatusService(tx, payment.invoiceId);

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL_PAYMENT",
        entity: "Payment",
        entityId: payment.id,
        details: JSON.stringify({
          paymentCode: payment.paymentCode,
          invoiceId: payment.invoiceId,
          invoiceCode: payment.invoice.invoiceCode,
          amount: payment.amount,
          cancellationReason: validated.cancellationReason.trim(),
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

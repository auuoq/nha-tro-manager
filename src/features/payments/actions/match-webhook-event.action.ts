"use server";

import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { prisma } from "@/server/database/prisma";
import { PaymentMethod, PaymentSource, PaymentStatus, InvoiceStatus } from "@prisma/client";
import { generateUniquePaymentCode } from "../services/record-manual-payment.service";
import { recalculateInvoicePaymentStatusService } from "../services/recalculate-invoice-payment-status.service";

export async function matchWebhookEventAction(webhookEventId: string, invoiceId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) throw new Error("UNAUTHORIZED");
    requireOwner(session.user);

    const event = await prisma.webhookEvent.findUnique({
      where: { id: webhookEventId },
    });

    if (!event || event.status !== "UNMATCHED") {
      throw new Error("INVALID_WEBHOOK_EVENT: Sự kiện không tồn tại hoặc đã được xử lý.");
    }

    return await runSerializableTransaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { room: { select: { building: { select: { ownerId: true } } } } },
      });

      if (!invoice || invoice.room.building.ownerId !== session.user.id) {
        throw new Error("FORBIDDEN_NOT_INVOICE_OWNER");
      }

      const validStatuses: InvoiceStatus[] = [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE];
      if (!validStatuses.includes(invoice.status)) {
        throw new Error(`CANNOT_MATCH_INVOICE_STATUS_${invoice.status}: Chỉ có thể gán thanh toán cho hóa đơn chưa hoàn tất.`);
      }

      const payload = event.payload as any;
      const amount = Number(payload.amount || payload.transferAmount || 0);
      if (amount <= 0) throw new Error("INVALID_WEBHOOK_AMOUNT: Số tiền giao dịch không hợp lệ.");

      const paymentCode = await generateUniquePaymentCode(tx);
      const remainingBefore = Number(invoice.remainingAmount);
      const overpaymentAmount = amount > remainingBefore ? amount - remainingBefore : 0;

      const payment = await tx.payment.create({
        data: {
          paymentCode,
          invoiceId,
          amount,
          overpaymentAmount,
          method: PaymentMethod.BANK_WEBHOOK,
          source: PaymentSource.BANK_WEBHOOK,
          status: PaymentStatus.CONFIRMED,
          provider: event.provider,
          transactionRef: payload.transactionRef || payload.reference || event.eventId,
          idempotencyKey: `MANUAL_MATCH_${event.id}`,
          notes: `Gán thủ công từ Webhook Unmatched ${event.provider} (EventId: ${event.eventId})`,
          receivedAt: new Date(),
          confirmedAt: new Date(),
          confirmedById: session.user.id,
          recordedById: session.user.id,
        },
      });

      const ledgerResult = await recalculateInvoicePaymentStatusService(tx, invoiceId);

      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          status: "PROCESSED",
          matchedInvoiceId: invoiceId,
          matchedPaymentId: payment.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "MATCH_WEBHOOK_EVENT",
          entity: "WebhookEvent",
          entityId: webhookEventId,
          details: JSON.stringify({
            eventId: event.eventId,
            invoiceId,
            invoiceCode: invoice.invoiceCode,
            paymentCode,
            amount,
          }),
        },
      });

      return { success: true, data: { payment, invoice: ledgerResult.invoice } };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MATCH_WEBHOOK_EVENT_FAILED";
    return { success: false, error: message };
  }
}

import { prisma } from "@/server/database/prisma";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { PaymentMethod, PaymentSource, PaymentStatus, InvoiceStatus } from "@prisma/client";
import { generateUniquePaymentCode } from "./record-manual-payment.service";
import { recalculateInvoicePaymentStatusService } from "./recalculate-invoice-payment-status.service";

export interface BankWebhookPayload {
  provider: string;
  eventId: string;
  amount: number;
  transactionRef: string;
  content: string;
  receivedAt?: string;
  rawPayload: any;
}

export async function processBankWebhookService(payload: BankWebhookPayload) {
  const { provider, eventId, amount, transactionRef, content, rawPayload } = payload;

  if (!provider || !eventId || !amount || amount <= 0) {
    throw new Error("INVALID_WEBHOOK_PAYLOAD: Missing provider, eventId, or amount <= 0");
  }

  // 1. Idempotency Check via DB Unique Constraint or lookup
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { provider_eventId: { provider, eventId } },
  });

  if (existingEvent) {
    return {
      status: existingEvent.status,
      message: "Webhook event already processed (Idempotent response)",
      webhookEventId: existingEvent.id,
      matchedPaymentId: existingEvent.matchedPaymentId,
    };
  }

  // 2. Parse & normalize transfer content to find invoiceCode (e.g. "INV-202607-AB12CD")
  const normalizedContent = content.toUpperCase().replace(/\s+/g, "");
  const invoiceCodeMatch = normalizedContent.match(/INV-\d{6}-[A-Z0-9]{6}/);

  let targetInvoiceId: string | null = null;
  if (invoiceCodeMatch) {
    const matchedCode = invoiceCodeMatch[0];
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceCode: matchedCode },
      select: { id: true, status: true, remainingAmount: true, deletedAt: true },
    });

    const validStatuses: InvoiceStatus[] = [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE];
    if (invoice && !invoice.deletedAt && validStatuses.includes(invoice.status)) {
      targetInvoiceId = invoice.id;
    }
  }

  // If no exact pattern match, search invoices where invoiceCode is contained in content
  if (!targetInvoiceId) {
    const activeInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        deletedAt: null,
      },
      select: { id: true, invoiceCode: true },
    });

    const matches = activeInvoices.filter((inv) => normalizedContent.includes(inv.invoiceCode.replace(/-/g, "")));
    if (matches.length === 1) {
      targetInvoiceId = matches[0].id;
    }
  }

  // 3. If no matching invoice found, record UNMATCHED WebhookEvent
  if (!targetInvoiceId) {
    const unmatchedEvent = await prisma.webhookEvent.create({
      data: {
        provider,
        eventId,
        payload: rawPayload || {},
        status: "UNMATCHED",
        errorMessage: "No unique matching active invoice found for transfer content",
      },
    });

    return {
      status: "UNMATCHED",
      message: "Webhook recorded as UNMATCHED. No matching active invoice found.",
      webhookEventId: unmatchedEvent.id,
    };
  }

  // 4. Serializable Transaction to create Payment & update Invoice
  return runSerializableTransaction(async (tx) => {
    // Check payment idempotencyKey to prevent duplicate payment creation
    const existingPayment = await tx.payment.findFirst({
      where: {
        OR: [
          { transactionRef },
          { idempotencyKey: `${provider}_${eventId}` },
        ],
      },
    });

    if (existingPayment) {
      const recordedEvent = await tx.webhookEvent.create({
        data: {
          provider,
          eventId,
          payload: rawPayload || {},
          status: "PROCESSED",
          matchedInvoiceId: targetInvoiceId,
          matchedPaymentId: existingPayment.id,
        },
      });

      return {
        status: "PROCESSED",
        message: "Payment already exists (idempotent)",
        webhookEventId: recordedEvent.id,
        matchedPaymentId: existingPayment.id,
      };
    }

    const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: targetInvoiceId } });
    const paymentCode = await generateUniquePaymentCode(tx);
    const remainingBefore = Number(invoice.remainingAmount);
    const overpaymentAmount = amount > remainingBefore ? amount - remainingBefore : 0;

    const payment = await tx.payment.create({
      data: {
        paymentCode,
        invoiceId: targetInvoiceId,
        amount,
        overpaymentAmount,
        method: PaymentMethod.BANK_WEBHOOK,
        source: PaymentSource.BANK_WEBHOOK,
        status: PaymentStatus.CONFIRMED,
        provider,
        transactionRef,
        idempotencyKey: `${provider}_${eventId}`,
        rawPayload: rawPayload || {},
        notes: `Tự động gán từ Webhook ${provider}. Nội dung: ${content}`,
        receivedAt: new Date(),
        confirmedAt: new Date(),
      },
    });

    const ledgerResult = await recalculateInvoicePaymentStatusService(tx, targetInvoiceId);

    const webhookEvent = await tx.webhookEvent.create({
      data: {
        provider,
        eventId,
        payload: rawPayload || {},
        status: "PROCESSED",
        matchedInvoiceId: targetInvoiceId,
        matchedPaymentId: payment.id,
      },
    });

    return {
      status: "PROCESSED",
      message: "Webhook processed and payment recorded successfully",
      webhookEventId: webhookEvent.id,
      matchedPaymentId: payment.id,
      invoiceCode: invoice.invoiceCode,
      paidAmount: ledgerResult.paidAmount,
      remainingAmount: ledgerResult.remainingAmount,
    };
  });
}

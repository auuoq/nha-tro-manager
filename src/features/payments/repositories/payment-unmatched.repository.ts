import { prisma } from "@/server/database/prisma";
import { WebhookEventDTO } from "../types/payment.types";

export async function findUnmatchedWebhookEvents(): Promise<WebhookEventDTO[]> {
  const events = await prisma.webhookEvent.findMany({
    where: { status: "UNMATCHED" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return events.map((e) => ({
    id: e.id,
    provider: e.provider,
    eventId: e.eventId,
    payload: e.payload,
    status: e.status,
    matchedInvoiceId: e.matchedInvoiceId,
    matchedPaymentId: e.matchedPaymentId,
    errorMessage: e.errorMessage,
    createdAt: e.createdAt,
  }));
}

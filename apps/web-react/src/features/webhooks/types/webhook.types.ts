export interface WebhookEvent {
  id: string;
  provider: string;
  eventId: string;
  transactionRef: string;
  amount: number;
  content: string;
  occurredAt: string;
  status: "UNMATCHED" | "MATCHED" | "IGNORED";
  matchedInvoiceId?: string | null;
  accountReference?: string | null;
}

export interface WebhookMatchInput {
  invoiceId: string;
}

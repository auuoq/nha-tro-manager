import { PaymentMethod, PaymentSource, PaymentStatus } from "@prisma/client";

export interface PaymentItemDTO {
  id: string;
  paymentCode: string;
  invoiceId: string;
  invoiceCode: string;
  buildingName: string;
  roomNumber: string;
  contractCode: string;
  amount: number;
  refundAmount: number;
  overpaymentAmount: number;
  netAmount: number;
  method: PaymentMethod;
  source: PaymentSource;
  status: PaymentStatus;
  provider: string | null;
  transactionRef: string | null;
  idempotencyKey: string | null;
  notes: string | null;
  receivedAt: Date | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  refundReason: string | null;
  recordedByName: string | null;
  confirmedByName: string | null;
  createdAt: Date;
}

export interface WebhookEventDTO {
  id: string;
  provider: string;
  eventId: string;
  payload: any;
  status: string; // PROCESSED, UNMATCHED, FAILED
  matchedInvoiceId: string | null;
  matchedPaymentId: string | null;
  errorMessage: string | null;
  createdAt: Date;
}

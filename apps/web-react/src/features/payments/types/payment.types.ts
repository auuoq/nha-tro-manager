export type PaymentMethod = "VIETQR" | "BANK_TRANSFER" | "CASH" | "BANK_WEBHOOK" | "OTHER";
export type PaymentStatus = "PENDING" | "PENDING_REVIEW" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface Payment {
  id: string;
  paymentCode: string;
  invoiceId: string;
  invoiceCode?: string;
  roomNumber?: string;
  buildingName?: string;
  amount: number;
  refundAmount: number;
  netAmount: number;
  overpaymentAmount?: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  transactionRef: string | null;
  maskedTransactionRef?: string | null;
  note: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManualPaymentInput {
  invoiceId: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "OTHER";
  paidAt: string;
  transactionRef?: string | null;
  note?: string | null;
}

export interface CancelPaymentInput {
  reason: string;
}

export interface RefundPaymentInput {
  amount: number;
  reason?: string;
  refundedAt?: string;
}

export interface VietQRResponse {
  qrCodeUrl: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
}

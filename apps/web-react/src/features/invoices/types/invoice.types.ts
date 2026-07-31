export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type InvoiceItemType = "ROOM" | "ELECTRICITY" | "WATER" | "WIFI" | "GARBAGE" | "PARKING" | "OTHER" | "DISCOUNT";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  contractId: string;
  roomNumber?: string;
  buildingName?: string;
  billingPeriod: string; // YYYY-MM
  issueDate: string | null;
  dueDate: string;
  cutoffDate: string;
  previousOutstandingAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
}

export interface CreateDraftInvoiceInput {
  contractId: string;
  billingPeriod: string; // YYYY-MM
  dueDate: string;
  cutoffDate: string;
}

export interface ManualInvoiceItemInput {
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ApplyDiscountInput {
  discountAmount: number;
  reason?: string;
}

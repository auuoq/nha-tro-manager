import { InvoiceStatus, InvoiceItemType } from "@prisma/client";

export interface InvoiceItemDTO {
  id: string;
  invoiceId: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  meterReadingId: string | null;
  previousReading: number | null;
  currentReading: number | null;
  sortOrder: number;
  calculationMetadata: Record<string, any> | null;
}

export interface InvoiceItemSnapshotDTO {
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  meterReadingId?: string | null;
  previousReading?: number | null;
  currentReading?: number | null;
  sortOrder: number;
  calculationMetadata?: Record<string, any>;
}

export interface InvoiceItemDTOList {
  id: string;
  invoiceCode: string;
  contractCode: string;
  buildingName: string;
  roomNumber: string;
  primaryTenantName: string;
  billingPeriod: string;
  revision: number;
  issuedAt: Date | null;
  dueDate: Date;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceDetailDTO extends InvoiceItemDTOList {
  previousOutstandingAmount: number;
  totalAmountDue: number;
  cancellationReason: string | null;
  notes: string | null;
  items: InvoiceItemDTO[];
}

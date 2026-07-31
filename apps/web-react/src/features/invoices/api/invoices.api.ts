import { apiClient } from "@/api/client";
import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  CreateDraftInvoiceInput,
  ManualInvoiceItemInput,
  ApplyDiscountInput
} from "../types/invoice.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";

export interface InvoiceFilterParams extends PaginationParams {
  buildingId?: string;
  contractId?: string;
  status?: InvoiceStatus;
  period?: string;
}

export const invoicesApi = {
  list: async (params?: InvoiceFilterParams): Promise<PaginatedData<Invoice>> => {
    const res = await apiClient.get("/invoices", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const res = await apiClient.get(`/invoices/${id}`);
    return res.data.data;
  },

  createDraft: async (data: CreateDraftInvoiceInput): Promise<Invoice> => {
    const res = await apiClient.post("/invoices/draft", data);
    return res.data.data;
  },

  recalculate: async (id: string): Promise<Invoice> => {
    const res = await apiClient.post(`/invoices/${id}/recalculate`);
    return res.data.data;
  },

  issue: async (id: string): Promise<Invoice> => {
    const res = await apiClient.post(`/invoices/${id}/issue`);
    return res.data.data;
  },

  cancel: async (id: string, reason?: string): Promise<Invoice> => {
    const res = await apiClient.post(`/invoices/${id}/cancel`, { reason });
    return res.data.data;
  },

  reissue: async (id: string): Promise<Invoice> => {
    const res = await apiClient.post(`/invoices/${id}/reissue`);
    return res.data.data;
  },

  // Manual Items & Discount
  addItem: async (invoiceId: string, data: ManualInvoiceItemInput): Promise<InvoiceItem> => {
    const res = await apiClient.post(`/invoices/${invoiceId}/items`, data);
    return res.data.data;
  },

  updateItem: async (invoiceId: string, itemId: string, data: Partial<ManualInvoiceItemInput>): Promise<InvoiceItem> => {
    const res = await apiClient.patch(`/invoices/${invoiceId}/items/${itemId}`, data);
    return res.data.data;
  },

  deleteItem: async (invoiceId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/invoices/${invoiceId}/items/${itemId}`);
  },

  applyDiscount: async (invoiceId: string, data: ApplyDiscountInput): Promise<Invoice> => {
    const res = await apiClient.post(`/invoices/${invoiceId}/discount`, data);
    return res.data.data;
  },

  // Tenant Portal Endpoints
  listTenantInvoices: async (params?: PaginationParams): Promise<PaginatedData<Invoice>> => {
    const res = await apiClient.get("/tenant/invoices", { params });
    return res.data.data;
  },

  getTenantInvoice: async (id: string): Promise<Invoice> => {
    const res = await apiClient.get(`/tenant/invoices/${id}`);
    return res.data.data;
  },
};

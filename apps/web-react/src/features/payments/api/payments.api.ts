import { apiClient } from "@/api/client";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  CreateManualPaymentInput,
  CancelPaymentInput,
  RefundPaymentInput,
  VietQRResponse
} from "../types/payment.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";

export interface PaymentFilterParams extends PaginationParams {
  invoiceId?: string;
  buildingId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export const paymentsApi = {
  list: async (params?: PaymentFilterParams): Promise<PaginatedData<Payment>> => {
    const res = await apiClient.get("/payments", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data.data;
  },

  createManual: async (data: CreateManualPaymentInput): Promise<Payment> => {
    const res = await apiClient.post("/payments/manual", data);
    return res.data.data;
  },

  cancel: async (id: string, data: CancelPaymentInput): Promise<Payment> => {
    const res = await apiClient.post(`/payments/${id}/cancel`, data);
    return res.data.data;
  },

  refund: async (id: string, data: RefundPaymentInput): Promise<Payment> => {
    const res = await apiClient.post(`/payments/${id}/refund`, data);
    return res.data.data;
  },

  getVietQR: async (invoiceId: string): Promise<VietQRResponse> => {
    const res = await apiClient.get(`/invoices/${invoiceId}/vietqr`);
    return res.data.data;
  },

  listTenantPayments: async (params?: PaginationParams): Promise<PaginatedData<Payment>> => {
    const res = await apiClient.get("/tenant/payments", { params });
    return res.data.data;
  },
};

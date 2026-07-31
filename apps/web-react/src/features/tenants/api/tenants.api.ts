import { apiClient } from "@/api/client";
import { Tenant, TenantCreateInput, TenantUpdateInput, CreateAccountInput, CreateAccountResponse } from "../types/tenant.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";

export interface TenantFilterParams extends PaginationParams {
  buildingId?: string;
  search?: string;
}

export const tenantsApi = {
  list: async (params?: TenantFilterParams): Promise<PaginatedData<Tenant>> => {
    const res = await apiClient.get("/tenants", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Tenant> => {
    const res = await apiClient.get(`/tenants/${id}`);
    return res.data.data;
  },

  create: async (data: TenantCreateInput): Promise<Tenant> => {
    const res = await apiClient.post("/tenants", data);
    return res.data.data;
  },

  update: async (id: string, data: TenantUpdateInput): Promise<Tenant> => {
    const res = await apiClient.patch(`/tenants/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  },

  // Tenant Account Actions
  createAccount: async (tenantId: string, data: CreateAccountInput): Promise<CreateAccountResponse> => {
    const res = await apiClient.post(`/tenants/${tenantId}/account`, data);
    return res.data.data;
  },

  resetPassword: async (tenantId: string): Promise<{ tempPassword: string }> => {
    const res = await apiClient.post(`/tenants/${tenantId}/account/reset-password`);
    return res.data.data;
  },

  updateAccountStatus: async (tenantId: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/tenants/${tenantId}/account/status`, { isActive });
  },
};

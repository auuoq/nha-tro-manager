import { apiClient } from "@/api/client";
import { Contract, ContractCreateInput, ContractUpdateInput, ContractStatus, ContractTenantRelation } from "../types/contract.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";
import { ChargeConfig, ChargeConfigCreateInput, ChargeConfigUpdateInput } from "@/shared/types/charge-config.types";

export interface ContractFilterParams extends PaginationParams {
  buildingId?: string;
  roomId?: string;
  tenantId?: string;
  status?: ContractStatus;
  search?: string;
}

export const contractsApi = {
  list: async (params?: ContractFilterParams): Promise<PaginatedData<Contract>> => {
    const res = await apiClient.get("/contracts", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Contract> => {
    const res = await apiClient.get(`/contracts/${id}`);
    return res.data.data;
  },

  create: async (data: ContractCreateInput): Promise<Contract> => {
    const res = await apiClient.post("/contracts", data);
    return res.data.data;
  },

  update: async (id: string, data: ContractUpdateInput): Promise<Contract> => {
    const res = await apiClient.patch(`/contracts/${id}`, data);
    return res.data.data;
  },

  updateStatus: async (id: string, targetStatus: ContractStatus, reason?: string): Promise<Contract> => {
    const res = await apiClient.patch(`/contracts/${id}/status`, { targetStatus, reason });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contracts/${id}`);
  },

  // Contract Tenants Relations
  getTenants: async (contractId: string): Promise<ContractTenantRelation[]> => {
    const res = await apiClient.get(`/contracts/${contractId}/tenants`);
    return res.data.data;
  },

  addTenant: async (contractId: string, tenantId: string, isPrimary: boolean = false): Promise<void> => {
    await apiClient.post(`/contracts/${contractId}/tenants`, { tenantId, isPrimary });
  },

  removeTenant: async (contractId: string, tenantId: string): Promise<void> => {
    await apiClient.delete(`/contracts/${contractId}/tenants/${tenantId}`);
  },

  // Contract Charge Configs (Phase D & F3 Endpoint requirement)
  getChargeConfigs: async (contractId: string): Promise<ChargeConfig[]> => {
    const res = await apiClient.get(`/contracts/${contractId}/charge-configs`);
    return res.data.data;
  },

  createChargeConfig: async (contractId: string, data: ChargeConfigCreateInput): Promise<ChargeConfig> => {
    const res = await apiClient.post(`/contracts/${contractId}/charge-configs`, data);
    return res.data.data;
  },

  updateChargeConfig: async (contractId: string, configId: string, data: ChargeConfigUpdateInput): Promise<ChargeConfig> => {
    const res = await apiClient.patch(`/contracts/${contractId}/charge-configs/${configId}`, data);
    return res.data.data;
  },

  // Tenant Portal Endpoint
  getTenantContractDetail: async (contractId: string): Promise<Contract> => {
    const res = await apiClient.get(`/tenant/contracts/${contractId}`);
    return res.data.data;
  },
};

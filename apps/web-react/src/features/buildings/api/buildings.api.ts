import { apiClient } from "@/api/client";
import { Building, BuildingCreateInput, BuildingUpdateInput } from "../types/building.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";
import { ChargeConfig, ChargeConfigCreateInput, ChargeConfigUpdateInput } from "@/shared/types/charge-config.types";

export const buildingsApi = {
  list: async (params?: PaginationParams & { search?: string }): Promise<PaginatedData<Building>> => {
    const res = await apiClient.get("/buildings", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Building> => {
    const res = await apiClient.get(`/buildings/${id}`);
    return res.data.data;
  },

  create: async (data: BuildingCreateInput): Promise<Building> => {
    const res = await apiClient.post("/buildings", data);
    return res.data.data;
  },

  update: async (id: string, data: BuildingUpdateInput): Promise<Building> => {
    const res = await apiClient.patch(`/buildings/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/buildings/${id}`);
  },

  // Building Charge Configs
  getChargeConfigs: async (buildingId: string): Promise<ChargeConfig[]> => {
    const res = await apiClient.get(`/buildings/${buildingId}/charge-configs`);
    return res.data.data;
  },

  createChargeConfig: async (buildingId: string, data: ChargeConfigCreateInput): Promise<ChargeConfig> => {
    const res = await apiClient.post(`/buildings/${buildingId}/charge-configs`, data);
    return res.data.data;
  },

  updateChargeConfig: async (buildingId: string, configId: string, data: ChargeConfigUpdateInput): Promise<ChargeConfig> => {
    const res = await apiClient.patch(`/buildings/${buildingId}/charge-configs/${configId}`, data);
    return res.data.data;
  },
};

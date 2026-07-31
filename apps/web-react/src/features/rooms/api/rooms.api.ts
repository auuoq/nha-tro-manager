import { apiClient } from "@/api/client";
import { Room, RoomCreateInput, RoomUpdateInput, RoomStatus } from "../types/room.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";
import { RoomAsset, RoomAssetCreateInput, RoomAssetUpdateInput } from "../types/room-asset.types";
import { ChargeConfig, ChargeConfigCreateInput, ChargeConfigUpdateInput } from "@/shared/types/charge-config.types";

export interface RoomFilterParams extends PaginationParams {
  buildingId?: string;
  status?: RoomStatus;
  search?: string;
}

export const roomsApi = {
  list: async (params?: RoomFilterParams): Promise<PaginatedData<Room>> => {
    const res = await apiClient.get("/rooms", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Room> => {
    const res = await apiClient.get(`/rooms/${id}`);
    return res.data.data;
  },

  create: async (data: RoomCreateInput): Promise<Room> => {
    const res = await apiClient.post("/rooms", data);
    return res.data.data;
  },

  update: async (id: string, data: RoomUpdateInput): Promise<Room> => {
    const res = await apiClient.patch(`/rooms/${id}`, data);
    return res.data.data;
  },

  updateMaintenanceStatus: async (id: string, targetStatus: "VACANT" | "MAINTENANCE", reason?: string): Promise<Room> => {
    const res = await apiClient.patch(`/rooms/${id}/maintenance-status`, { targetStatus, reason });
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`);
  },

  // Room Assets
  getAssets: async (roomId: string): Promise<RoomAsset[]> => {
    const res = await apiClient.get(`/rooms/${roomId}/assets`);
    return res.data.data;
  },

  createAsset: async (roomId: string, data: RoomAssetCreateInput): Promise<RoomAsset> => {
    const res = await apiClient.post(`/rooms/${roomId}/assets`, data);
    return res.data.data;
  },

  updateAsset: async (roomId: string, assetId: string, data: RoomAssetUpdateInput): Promise<RoomAsset> => {
    const res = await apiClient.patch(`/rooms/${roomId}/assets/${assetId}`, data);
    return res.data.data;
  },

  deleteAsset: async (roomId: string, assetId: string): Promise<void> => {
    await apiClient.delete(`/rooms/${roomId}/assets/${assetId}`);
  },

  // Room Charge Configs
  getChargeConfigs: async (roomId: string): Promise<ChargeConfig[]> => {
    const res = await apiClient.get(`/rooms/${roomId}/charge-configs`);
    return res.data.data;
  },

  createChargeConfig: async (roomId: string, data: ChargeConfigCreateInput): Promise<ChargeConfig> => {
    const res = await apiClient.post(`/rooms/${roomId}/charge-configs`, data);
    return res.data.data;
  },

  updateChargeConfig: async (roomId: string, configId: string, data: ChargeConfigUpdateInput): Promise<ChargeConfig> => {
    const res = await apiClient.patch(`/rooms/${roomId}/charge-configs/${configId}`, data);
    return res.data.data;
  },
};

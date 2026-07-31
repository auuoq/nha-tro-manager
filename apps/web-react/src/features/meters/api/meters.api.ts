import { apiClient } from "@/api/client";
import {
  Meter,
  MeterReading,
  MeterType,
  CreateMeterInput,
  ReplaceMeterInput,
  CreateMeterReadingInput
} from "../types/meter.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";

export interface MeterFilterParams extends PaginationParams {
  buildingId?: string;
  roomId?: string;
  type?: MeterType;
  isActive?: boolean;
}

export const metersApi = {
  list: async (params?: MeterFilterParams): Promise<PaginatedData<Meter>> => {
    const res = await apiClient.get("/meters", { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<Meter> => {
    const res = await apiClient.get(`/meters/${id}`);
    return res.data.data;
  },

  create: async (data: CreateMeterInput): Promise<Meter> => {
    const res = await apiClient.post("/meters", data);
    return res.data.data;
  },

  replace: async (id: string, data: ReplaceMeterInput): Promise<Meter> => {
    const res = await apiClient.post(`/meters/${id}/replace`, data);
    return res.data.data;
  },

  // Meter Readings
  getReadings: async (meterId: string): Promise<MeterReading[]> => {
    const res = await apiClient.get(`/meters/${meterId}/readings`);
    return res.data.data;
  },

  createReading: async (meterId: string, data: CreateMeterReadingInput): Promise<MeterReading> => {
    const res = await apiClient.post(`/meters/${meterId}/readings`, data);
    return res.data.data;
  },

  correctReading: async (_meterId: string, readingId: string, currentValue: number, note?: string): Promise<MeterReading> => {
    const res = await apiClient.post(`/meter-readings/${readingId}/correct`, { currentValue, note });
    return res.data.data;
  },
};

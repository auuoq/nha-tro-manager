import { apiClient } from "@/api/client";
import { SignedUrlResponse, UploadResponse } from "../types/storage.types";

export const storageApi = {
  // Tenant CCCD Storage
  uploadTenantIdCard: async (tenantId: string, side: "front" | "back", file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/storage/tenants/${tenantId}/id-card/${side}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  getTenantIdCardSignedUrl: async (tenantId: string, side: "front" | "back"): Promise<SignedUrlResponse> => {
    const res = await apiClient.get(`/storage/tenants/${tenantId}/id-card/${side}/signed-url`);
    return res.data.data;
  },

  deleteTenantIdCard: async (_tenantId: string, _side: "front" | "back"): Promise<void> => {
    // Delete endpoint is local placeholder if applicable
  },

  // Meter Reading Storage
  uploadMeterReadingImage: async (readingId: string, file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/storage/meter-readings/${readingId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  getMeterReadingSignedUrl: async (readingId: string): Promise<SignedUrlResponse> => {
    const res = await apiClient.get(`/storage/meter-readings/${readingId}/image/signed-url`);
    return res.data.data;
  },
};

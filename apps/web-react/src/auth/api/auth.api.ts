import { apiClient } from "@/api/client";
import { LoginPayload, LoginResponse, UserDTO } from "../types/auth.types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await apiClient.post("/auth/login", payload);
    return res.data.data;
  },
  me: async (): Promise<UserDTO> => {
    const res = await apiClient.get("/auth/me");
    return res.data.data;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post("/auth/change-password", { oldPassword, newPassword });
  },
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
  },
};

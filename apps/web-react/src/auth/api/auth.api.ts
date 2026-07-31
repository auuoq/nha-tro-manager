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
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refreshToken });
      } catch {
        // Ignore logout errors
      }
    }
  },
};

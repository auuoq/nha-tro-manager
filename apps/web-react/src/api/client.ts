// TODO (Auth Audit Required): Refresh token interceptor flow below is a temporary client-side mock implementation.
// Production token lifecycle, HttpOnly cookie handling, and session rotation will be fully audited in Phase F.
import axios from "axios";

// VITE_API_BASE_URL is set on the hosting platform (e.g. Vercel env var).
// In local dev, it is empty — Vite dev server proxies /api → http://127.0.0.1:8000.
// In staging/production, it must be the full backend URL e.g. https://nha-tro-api-staging.onrender.com
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Guard against refresh loops if status is 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !originalRequest.url?.includes("/auth/refresh")) {
        try {
          const res = await axios.post("/api/v1/auth/refresh", { refreshToken });
          if (res.data?.success && res.data?.data?.accessToken) {
            localStorage.setItem("accessToken", res.data.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");
      }
    }
    return Promise.reject(error);
  }
);

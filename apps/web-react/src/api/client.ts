import axios from "axios";

// VITE_API_BASE_URL is set on the hosting platform (e.g. Vercel env var).
// In local dev, it is empty — Vite dev server proxies /api → http://127.0.0.1:8000.
// In staging/production, it must be the full backend URL e.g. https://nha-tro-api-staging.onrender.com
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || (import.meta.env.PROD ? "https://nha-tro-manager-5clz.onrender.com/api/v1" : "/api/v1");

export const apiClient = axios.create({
  baseURL: API_BASE.endsWith("/api/v1") ? API_BASE : `${API_BASE}/api/v1`,
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
          const res = await apiClient.post("/auth/refresh");
          if (res.data?.success && res.data?.data?.accessToken) {
            const newAccess = res.data.data.accessToken;
            localStorage.setItem("accessToken", newAccess);
            if (res.data.data.refreshToken) {
              localStorage.setItem("refreshToken", res.data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
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

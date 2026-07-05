import axios from "axios";

export const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith("/api/admin");
  const token = isAdminRoute
    ? localStorage.getItem("admin_token")
    : localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAdminRoute = err.config?.url?.startsWith("/api/admin");
      if (isAdminRoute) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── User ────────────────────────────────────────────────────
export const register = (data) => api.post("/api/register", data);
export const login    = (data) => api.post("/api/login", data);
export const predict  = (data) => api.post("/api/predict", data);
export const getHistory       = ()   => api.get("/api/history");
export const getHistoryDetail = (id) => api.get(`/api/history/${id}`);
export const deleteHistory    = (id) => api.delete(`/api/history/${id}`);

// ── Admin ───────────────────────────────────────────────────
export const adminLogin          = (data) => api.post("/api/admin/login", data);
export const getAdminStats       = ()     => api.get("/api/admin/stats");
export const getAdminUsers       = ()     => api.get("/api/admin/users");
export const getAdminPredictions = ()     => api.get("/api/admin/predictions");

export default api;
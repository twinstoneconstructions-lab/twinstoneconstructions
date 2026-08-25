import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 90000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ts_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fileUrl = (path) => `${API}/files/${path}`;

export const derivativeUrl = (path, w, fmt) => `${API}/files/${path}?w=${w}&fmt=${fmt}`;

export const mediaSrc = (m) =>
  m ? m.external_url || (m.storage_path ? fileUrl(m.storage_path) : "") : "";

export function apiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : "")).filter(Boolean).join(" ") || fallback;
  return fallback;
}

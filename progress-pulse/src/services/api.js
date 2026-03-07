import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "http://localhost:5018/api",  
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) { localStorage.clear(); window.location.href = "/login"; toast.error("Session expired."); }
    else if (status === 403) toast.error("Access denied.");
    else if (status === 500) toast.error("Server error. Try again.");
    return Promise.reject(error);
  }
);

export default api;

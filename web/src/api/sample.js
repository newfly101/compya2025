import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    'Content-Type': 'application/json',
    // "X-Page-Path": window.location.pathname
  },
  timeout: 5000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    config.headers["X-Page-Path"] = window.location.pathname;
    config.headers["X-Referrer"] = document.referrer || "-";
    config.headers["X-Page-Url"] = window.location.href;
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchHealth = async () => {
  return await api.get("/health");
}

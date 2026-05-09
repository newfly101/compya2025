import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const API = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    config.headers["X-Page-Path"] = window.location.pathname;
    config.headers["X-Referrer"] = document.referrer || "-";
    config.headers["X-Page-Url"] = window.location.href;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return Promise.resolve({ data: null })
    }
    return Promise.reject(error)
  }
);

import axios from "axios";
import { API_BASE_URL } from "@/config/env.js";

export const API = axios.create({
  baseURL: API_BASE_URL,
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

// 401 발생 시 /api/auth/refresh 호출 → 성공 시 원 요청 재시도.
// refresh 자체가 401 이거나 이미 한 번 재시도한 요청은 그대로 실패 처리.
let refreshing = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    // refresh / logout endpoint 자체의 401 은 retry 안 함 (무한루프 방지)
    const isAuthEndpoint =
      url.includes("/api/auth/refresh") || url.includes("/api/auth/logout");

    if (status !== 401 || original?._retried || isAuthEndpoint) {
      if (status === 401) return Promise.resolve({ data: null });
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      // 동시 다발 401 → refresh 호출은 한 번만
      if (!refreshing) {
        refreshing = API.post("/api/auth/refresh").finally(() => {
          refreshing = null;
        });
      }
      await refreshing;
      return API(original);
    } catch (e) {
      // refresh 실패 → 미인증 상태로 처리
      return Promise.resolve({ data: null });
    }
  }
);

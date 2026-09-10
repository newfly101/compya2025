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

// 401 발생 시 refresh 호출 → 성공 시 원 요청 재시도.
// refresh 자체가 401 이거나 이미 한 번 재시도한 요청은 그대로 실패 처리.
//
// 경로는 baseURL 기준 상대경로로 쓴다. API_BASE_URL 이 이미 /api 로 끝나므로
// 여기에 /api 를 또 붙이면 /api/api/... 가 되어 404 가 난다.
const REFRESH_PATH = "/auth/refresh";
const LOGOUT_PATH = "/auth/logout";

// 인증 실패를 성공(resolve)으로 위장하면 안 된다 — 도메인 api 함수는
// `data.data` 형태로 payload 를 꺼내는데, 응답이 null 이면 원인 불명의
// TypeError 로 터진다. 대신 reject 하되, 호출부(thunk)가 이미 공통으로
// try/catch → rejectWithValue(error.message) 패턴을 쓰고 있으므로
// 여기서 message 만 한글로 채워주면 화면은 그 문구를 그대로 보여줄 수 있다.
// isAuthError 플래그는 필요 시 호출부가 인증 실패를 구분해 분기할 수 있게 남겨둔다.
const AUTH_ERROR_MESSAGE = "로그인이 필요합니다. 다시 로그인해 주세요.";

// 401 외의 실패도 여기서 한글로 바꿔 둔다.
// 안 그러면 axios 기본 문구("Request failed with status code 500")가 화면에 그대로 뜬다.
// 실제로 공지 상세에서 그 영문이 사용자에게 노출됐다.
const toUserMessage = (error) => {
  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message ?? "")) {
    return "응답이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.";
  }
  // 응답 자체가 없으면 서버까지 못 갔다는 뜻 — 네트워크나 CORS.
  if (!error.response) {
    return "연결에 실패했습니다. 네트워크 상태를 확인해 주세요.";
  }
  const status = error.response.status;
  if (status === 403) return "접근 권한이 없습니다.";
  if (status === 404) return "요청한 정보를 찾을 수 없습니다.";
  if (status >= 500) return "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
  return "데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

const createAuthError = (original) => {
  original.isAuthError = true;
  original.message = AUTH_ERROR_MESSAGE;
  return original;
};

let refreshing = null;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || "";

    // refresh / logout endpoint 자체의 401 은 retry 안 함 (무한루프 방지)
    const isAuthEndpoint =
      url.includes(REFRESH_PATH) || url.includes(LOGOUT_PATH);

    if (status !== 401 || original?._retried || isAuthEndpoint) {
      if (status === 401) return Promise.reject(createAuthError(error));
      error.message = toUserMessage(error);
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      // 동시 다발 401 → refresh 호출은 한 번만
      if (!refreshing) {
        refreshing = API.post(REFRESH_PATH).finally(() => {
          refreshing = null;
        });
      }
      await refreshing;
      return API(original);
    } catch {
      // refresh 실패 → 미인증 상태. 원 요청의 401 에러를 그대로 reject 해
      // 호출부(thunk)가 "로그인이 필요합니다" 류 메시지를 낼 수 있게 한다.
      return Promise.reject(createAuthError(error));
    }
  }
);

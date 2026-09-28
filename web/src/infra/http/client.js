import axios from "axios";
import { API_BASE_URL } from "@/config/env.js";
import { hasAuthSessionMarker } from "@/infra/http/authSessionMarker.js";

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
const AUTH_ERROR_MESSAGE = "로그인이 필요합니다. 다시 로그인해 주세요.";
const BLOCKED_MESSAGE = "이용이 제한된 계정입니다. 고객센터로 문의해 주세요.";
const FORBIDDEN_MESSAGE = "접근 권한이 없습니다.";

// 실패 응답 본문은 { success:false, code, data:null } 형태다 (BE GlobalResponse.fail).
// 403 은 세 갈래 — 계정 정지 / 인증 만료 / 일반 권한 부족. 문구가 아니라 code 로 가른다.
// 시큐리티의 AccessDeniedHandler(역할 부족)는 AUTH_FORBIDDEN 을 내린다 — AUTH_USER_BLOCKED 와 code 로 구분된다.
const CODE_USER_BLOCKED = "AUTH_USER_BLOCKED";
const CODE_UNAUTHORIZED = "AUTH_UNAUTHORIZED";
const CODE_FORBIDDEN = "AUTH_FORBIDDEN";

// "blocked" = 계정 정지·탈퇴 / "expired" = 인증 만료 / "forbidden" = 일반 권한 부족 / null = 미분류
const classifyForbidden = (error) => {
  const code = error.response?.data?.code;
  if (code === CODE_UNAUTHORIZED) return "expired";
  if (code === CODE_USER_BLOCKED) return "blocked";
  if (code === CODE_FORBIDDEN) return "forbidden";
  return null;
};

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
  if (status === 403) return FORBIDDEN_MESSAGE;
  if (status === 404) return "요청한 정보를 찾을 수 없습니다.";
  if (status >= 500) return "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
  return "데이터를 받지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

// store 를 여기서 직접 import 하면 순환이다 (store → slices → thunks → api → client).
// slices 의 extraReducers 는 모듈 평가 시점에 thunk 를 참조하므로 "콜백 안에서만 쓴다" 로는
// 안전해지지 않는다 — 실제로 TDZ 로 앱이 즉시 죽었다. 방향을 뒤집어 store 쪽에서 주입받는다.
let dispatchAuthReset = null;

export const setAuthResetDispatcher = (dispatcher) => {
  dispatchAuthReset = dispatcher;
};

// 인증 최종 실패(재발급까지 실패 / 계정 정지 확정) 지점 — 로그인 상태 정리는 여기 한 곳에서만
// 한다. resetAuthSession 이 세션 마커와 Redux 상태를 함께 비우므로 화면마다 흩뿌릴 필요가 없다.
const failAuth = (error, message) => {
  error.isAuthError = true;
  error.message = message;
  dispatchAuthReset?.();
  return error;
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

    // 계정 정지·탈퇴는 401 이 아니라 403 으로 온다 — 서버가 refresh token 을 이미 지웠으니
    // 재발급으로 되살릴 수 없다. 바로 최종 인증 실패로 처리한다.
    if (status === 403) {
      const forbiddenKind = classifyForbidden(error);
      if (forbiddenKind === "blocked" || forbiddenKind === "expired") {
        const message = forbiddenKind === "blocked" ? BLOCKED_MESSAGE : AUTH_ERROR_MESSAGE;
        return Promise.reject(failAuth(error, message));
      }
      if (forbiddenKind === "forbidden") {
        error.message = FORBIDDEN_MESSAGE;
        return Promise.reject(error);
      }
    }

    if (status !== 401 || original?._retried || isAuthEndpoint) {
      if (status === 401) return Promise.reject(failAuth(error, AUTH_ERROR_MESSAGE));
      error.message = toUserMessage(error);
      return Promise.reject(error);
    }

    // 로그인한 적 없는 방문자는 refresh 를 시도할 이유가 없다 — AuthProvider 가 이미
    // 마커 없을 때 /users/me 호출을 건너뛰지만, 다른 API 가 우연히 401 을 낼 경우를 막는
    // 이중 안전장치.
    if (!hasAuthSessionMarker()) {
      return Promise.reject(failAuth(error, AUTH_ERROR_MESSAGE));
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
      // refresh 실패 → 미인증 확정. 마커·Redux 상태를 함께 비워 다음 요청부터는
      // 재발급을 시도하지 않게 한다. 원 요청의 에러를 그대로 reject 해
      // 호출부(thunk)가 "로그인이 필요합니다" 문구를 낼 수 있게 한다.
      return Promise.reject(failAuth(error, AUTH_ERROR_MESSAGE));
    }
  }
);

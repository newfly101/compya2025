import { fetchHealthCheck, fetchLogout } from "@/features/authentication/store/api.js";
import { setAuthResetDispatcher } from "@/lib/http/client.js";
import { setAuthSessionMarker, clearAuthSessionMarker } from "@/lib/http/authSessionMarker.js";
import { clearQueryCache } from "@/lib/query/queryClientRef.js";
import { useAuthStore } from "@/stores/authStore.js";

// 로그인 상태 정리는 이 함수 하나로 모은다 — 세션 상태(authStore)와 세션 마커를 함께 비운다.
// 마커가 남으면 다음 401 마다 쓸모없는 재발급을 계속 시도한다. 로그아웃 · 탈퇴 · 인증 최종 실패(http client)가 모두 쓴다.
export const resetAuthSession = () => {
  clearAuthSessionMarker();
  useAuthStore.getState().clearUser();
  clearQueryCache(); // 이전 사용자 데이터가 다음 계정에 보이지 않게 react-query 캐시도 비운다
};

// http client 는 store 를 import 하지 않는다(순환 방지) — 인증 최종 실패 시 정리 함수만 주입한다.
setAuthResetDispatcher(resetAuthSession);

/** GET /users/me → 세션 복원. 실패하면 세션을 비우고 Error(한글 문구)로 reject. */
export const restoreSession = async () => {
  try {
    const data = await fetchHealthCheck();
    setAuthSessionMarker();
    useAuthStore.getState().setSession(data);
    return data;
  } catch (error) {
    const status = error.response?.status;
    // 인증 거절(401/403)일 때만 세션을 비운다. 네트워크·5xx 는 일시 장애 — 마커·캐시 user 를 유지하고 확인 시도만 끝낸 것으로 한다.
    if (error.isAuthError || status === 401 || status === 403) resetAuthSession();
    else useAuthStore.setState({ initialized: true });
    throw new Error(error.message);
  }
};

/** 성공·실패 어느 쪽이든 세션을 비운다. */
export const logoutSession = async () => {
  try {
    await fetchLogout();
  } finally {
    resetAuthSession();
  }
};

import { fetchHealthCheck, fetchLogout } from "@/domains/authentication/store/api.js";
import { setAuthResetDispatcher } from "@/infra/http/client.js";
import { setAuthSessionMarker, clearAuthSessionMarker } from "@/infra/http/authSessionMarker.js";
import { useAuthStore } from "@/store/authStore.js";

// 로그인 상태 정리는 이 함수 하나로 모은다 — 세션 상태(authStore)와 세션 마커를 함께 비운다.
// 마커가 남으면 다음 401 마다 쓸모없는 재발급을 계속 시도한다. 로그아웃 · 탈퇴 · 인증 최종 실패(http client)가 모두 쓴다.
export const resetAuthSession = () => {
  clearAuthSessionMarker();
  useAuthStore.getState().clearUser();
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
    resetAuthSession();
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

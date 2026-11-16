import { useAuthStore } from "@/stores/authStore.js";
import { API_PUBLIC_URL } from "@/lib/env.js";
import { isNicknameUnset } from "@/lib/utils/isNicknameUnset.js";
import { trackLogout } from "@/lib/analytics/events/authEvents.js";

// 로그인 시작을 BE 로 넘긴다 — BE 가 state 를 만들어 쿠키에 심고 네이버로 보낸다 (콜백에서 대조)
const LOGIN_URL = `${API_PUBLIC_URL}/auth/naver/login`;

export const useAuthentication = () => {
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.userRole);
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = user !== null;
  const nicknameUnset = isNicknameUnset(user);
  const isAdmin = userRole === "ADMIN";

  const login = () => {
    // 쿼리·해시까지 저장해 로그인 뒤 보던 화면(예: ?tab=mine)으로 그대로 돌아온다 (REQ-AUTH-13)
    const { pathname, search, hash } = window.location;
    sessionStorage.setItem("redirectPath", pathname + search + hash);
    // 로그인 이벤트는 실제로 로그인이 끝나는 AuthCallBack 에서만 기록한다 (여기서 쏘면 취소해도 집계됨)
    window.location.href = LOGIN_URL;
  };

  const logout = async () => {
    trackLogout(userRole);
    // 세션 정리 코드(axios 포함)는 로그아웃할 때만 받는다
    const { logoutSession } = await import("@/features/authentication/store/session.js");
    await logoutSession().catch(() => {});
    window.location.replace("/"); // 하드 이동 — 쿼리 캐시도 함께 사라진다
  };

  return { initialized, isAuthenticated, user, userRole, isAdmin, nicknameUnset, login, logout };
};

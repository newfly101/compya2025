import { useDispatch, useSelector } from "react-redux";
import { requestUserLogout } from "@/domains/authentication/store/thunks.js";
import { trackLogout } from "@/infra/analytics/events/authEvents.js";

// 로그인 시작을 BE 로 넘긴다 — BE 가 state 를 만들어 쿠키에 심고 네이버로 보낸다 (콜백에서 대조)
const LOGIN_URL = window.location.hostname === "localhost"
  ? "http://localhost:8080/api/auth/naver/login"
  : "https://api.compyafun.com/api/auth/naver/login";

export const useAuthentication = () => {
  const dispatch = useDispatch();
  const { user, userRole, initialized } = useSelector(state => state.auth);
  const isAuthenticated = user !== null;
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
    // requestUserLogout 이 resetAuthSession 으로 Redux 상태와 세션 마커를 함께 비운다.
    await dispatch(requestUserLogout());
    window.location.replace("/");
  };

  return { initialized, isAuthenticated, user, userRole, isAdmin, login, logout };
};

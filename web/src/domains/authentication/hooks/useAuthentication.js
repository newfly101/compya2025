import { useDispatch, useSelector } from "react-redux";
import { requestUserLogout } from "@/domains/authentication/store/thunks.js";
import { trackLogin, trackLogout } from "@/infra/analytics/events/authEvents.js";

const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";

const REDIRECT_URI = window.location.hostname === "localhost"
  ? "http://localhost:8080/api/auth/naver/callback"
  : "https://api.compyafun.com/api/auth/naver/callback";

export const useAuthentication = () => {
  const dispatch = useDispatch();
  const { user, userRole } = useSelector(state => state.auth);
  const isAuthenticated = user !== null;
  const isAdmin = userRole === "ADMIN";

  const login = () => {
    sessionStorage.setItem("redirectPath", window.location.pathname);
    trackLogin();

    window.location.href = "https://nid.naver.com/oauth2.0/authorize" +
      "?response_type=code" +
      `&client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${crypto.randomUUID()}`;
  };

  const logout = async () => {
    trackLogout();
    // requestUserLogout 이 resetAuthSession 으로 Redux 상태와 세션 마커를 함께 비운다.
    await dispatch(requestUserLogout());
    window.location.replace("/");
  };

  return { isAuthenticated, user, userRole, isAdmin, login, logout };
};

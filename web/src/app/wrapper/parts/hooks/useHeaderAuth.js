import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/domains/auth/store/slices.js";
import { requestUserLogout } from "@/domains/auth/store/thunks.js";

export const useHeaderAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, authority } = useSelector(state => state.auth);
  const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";
  const isLocal = window.location.hostname === "localhost";

  const REDIRECT_URI = isLocal
    ? "http://localhost:8080/api/auth/naver/callback"
    : "https://api.compyafun.com/api/auth/naver/callback";

  const login = () => {
    const STATE = crypto.randomUUID(); // CSRF 방어용

    const url =
      "https://nid.naver.com/oauth2.0/authorize" +
      "?response_type=code" +
      `&client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${STATE}`;

    window.location.href = url;
  }

  const logout = async () => {
    dispatch(clearUser());
    await dispatch(requestUserLogout());
    window.location.replace("/");
  };

  return {
    isAuthenticated,
    user,
    authority,
    login,
    logout
  }
}

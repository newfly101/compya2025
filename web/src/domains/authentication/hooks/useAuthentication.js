import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/domains/authentication/store/slices.js";
import { requestUserLogout } from "@/domains/authentication/store/thunks.js";

const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";

const REDIRECT_URI = window.location.hostname === "localhost"
  ? "http://localhost:8080/api/auth/naver/callback"
  : "https://api.compyafun.com/api/auth/naver/callback";

export const useAuthentication = () => {
  const dispatch = useDispatch();
  const { user, authority } = useSelector(state => state.auth);
  const isAuthenticated = user !== null;

  const login = () => {
    sessionStorage.setItem("redirectPath", window.location.pathname);

    const url =
      "https://nid.naver.com/oauth2.0/authorize" +
      "?response_type=code" +
      `&client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${crypto.randomUUID()}`;

    window.location.href = url;
  };

  const logout = async () => {
    await dispatch(requestUserLogout());
    dispatch(clearUser());
    window.location.replace("/");
  };

  return { isAuthenticated, user, authority, login, logout };
};

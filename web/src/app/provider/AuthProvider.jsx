import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks.js";
import { setGuestInitialized } from "@/domains/authentication/store/slices.js";
import { hasAuthSessionMarker } from "@/infra/http/authSessionMarker.js";
import { setUserProperties } from "@/infra/analytics/ga.js";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const initialized = useSelector(state => state.auth.initialized);

  useEffect(() => {
    // 로그인한 적 없는 방문자(세션 마커 없음) — GET /users/me 조회 자체를 건너뛴다.
    // 마커가 있는데 실제 세션이 만료된 경우는 그대로 조회 → 401 → refresh 흐름을 탄다.
    if (!hasAuthSessionMarker()) {
      dispatch(setGuestInitialized());
      setUserProperties('GUEST');
      return;
    }

    dispatch(requestUserHealthCheck())
      .unwrap()
      .then((data) => {
        if (!data) return;
      })
      .catch(() => {
        setUserProperties('GUEST')
      })
      .catch(() => {})
  }, [])

  if (!initialized) return null;

  return children;
};


export default AuthProvider;

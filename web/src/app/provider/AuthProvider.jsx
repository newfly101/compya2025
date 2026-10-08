import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestUserHealthCheck } from "@/domains/authentication/store/thunks.js";
import { setGuestInitialized } from "@/domains/authentication/store/slices.js";
import { hasAuthSessionMarker } from "@/infra/http/authSessionMarker.js";
import { requestCheckIn } from "@/domains/gamification/store/public/thunks.js";
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
        // ponytail: 시범 운영 — 관리자만 체크인. 전체 공개 시 이 조건을 !data 로 되돌린다
        if (data?.userRole !== "ADMIN") return;
        // 출석 체크인 — 실패해도 로그인 흐름에 영향 없음(서버가 하루 1회 멱등 처리)
        dispatch(requestCheckIn()).unwrap().catch(() => {});
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

"use client";
import { useEffect } from "react";
import { restoreSession } from "@/domains/authentication/store/session.js";
import { useAuthStore } from "@/store/authStore.js";
import { hasAuthSessionMarker } from "@/infra/http/authSessionMarker.js";
import { useCheckIn } from "@/domains/gamification/store/public/queries.js";
import { setUserProperties } from "@/infra/analytics/ga.js";

// 세션 복원 — 원본과 달리 children 을 막지 않는다(공개 페이지는 서버 렌더 HTML 을 그대로 내보낸다).
// 로그인 사용자 화면은 <AuthGate> 가 initialized 를 기다린다.
const AuthProvider = ({ children }) => {
  const checkIn = useCheckIn();

  useEffect(() => {
    // 캐시된 세션 요약을 먼저 반영(깜빡임 방지) — 아래 restoreSession 결과가 덮어쓴다
    useAuthStore.persist.rehydrate();
    // 이미 확인이 끝났으면(클라이언트 이동으로 재마운트) 다시 돌리지 않는다
    if (useAuthStore.getState().initialized) return;

    // 로그인한 적 없는 방문자(세션 마커 없음) — GET /users/me 조회 자체를 건너뛴다.
    if (!hasAuthSessionMarker()) {
      useAuthStore.getState().setGuestInitialized();
      setUserProperties("GUEST");
      return;
    }

    restoreSession()
      .then((data) => {
        if (data) checkIn(); // 출석 체크인 — 실패해도 로그인 흐름에 영향 없음(서버가 하루 1회 멱등 처리)
      })
      .catch(() => setUserProperties("GUEST"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export default AuthProvider;

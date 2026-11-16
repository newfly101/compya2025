"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/authStore.js";
import { hasAuthSessionMarker } from "@/lib/http/authSessionMarker.js";
import { setUserProperties } from "@/lib/analytics/ga.js";
import { ROUTE_PATHS } from "@/lib/routePath.js";

const SessionRestorer = dynamic(() => import("./SessionRestorer.jsx"), { ssr: false });

// 세션 복원 — 원본과 달리 children 을 막지 않는다(공개 페이지는 서버 렌더 HTML 을 그대로 내보낸다).
// 로그인 사용자 화면은 <AuthGate> 가 initialized 를 기다린다.
const AuthProvider = ({ children }) => {
  const [restore, setRestore] = useState(false);

  useEffect(() => {
    // 이미 확인이 끝났으면(클라이언트 이동으로 재마운트) 다시 돌리지 않는다
    if (useAuthStore.getState().initialized) return;
    // 로그인 콜백은 AuthCallBack 이 세션을 확인한다 — 여기서 게스트로 확정하면 상단바가 로그인→로그아웃으로 한 번 더 깜빡인다
    // (?error= 로 돌아온 실패는 확인을 안 하므로 아래로 내려가 게스트로 확정 → 재시도용 로그인 버튼이 보인다)
    const { pathname, search } = window.location;
    if (pathname === ROUTE_PATHS.authentication && !new URLSearchParams(search).has("error")) {
      useAuthStore.persist.rehydrate(); // 캐시된 세션 요약만 먼저 반영(깜빡임 방지)
      return;
    }

    // 로그인한 적 없는 방문자(세션 마커 없음) — GET /users/me 조회 자체를 건너뛰고, 복원 코드도 받지 않는다.
    if (!hasAuthSessionMarker()) {
      useAuthStore.getState().setGuestInitialized();
      setUserProperties("GUEST");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 뒤에만 마커(localStorage)를 읽을 수 있다
    setRestore(true);
  }, []);

  return (
    <>
      {children}
      {restore && <SessionRestorer />}
    </>
  );
};

export default AuthProvider;

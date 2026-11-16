"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/authStore.js";
import { hasAuthSessionMarker } from "@/lib/http/authSessionMarker.js";
import { setUserProperties } from "@/lib/analytics/ga.js";

const SessionRestorer = dynamic(() => import("./SessionRestorer.jsx"), { ssr: false });

// 세션 복원 — 원본과 달리 children 을 막지 않는다(공개 페이지는 서버 렌더 HTML 을 그대로 내보낸다).
// 로그인 사용자 화면은 <AuthGate> 가 initialized 를 기다린다.
const AuthProvider = ({ children }) => {
  const [restore, setRestore] = useState(false);

  useEffect(() => {
    // 캐시된 세션 요약을 먼저 반영(깜빡임 방지) — SessionRestorer 결과가 덮어쓴다
    useAuthStore.persist.rehydrate();
    // 이미 확인이 끝났으면(클라이언트 이동으로 재마운트) 다시 돌리지 않는다
    if (useAuthStore.getState().initialized) return;

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

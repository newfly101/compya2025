"use client";
import { useEffect } from "react";
import { restoreSession } from "@/features/authentication/store/session.js";
import { useCheckIn } from "@/features/gamification/store/queries.js";
import { useAuthStore } from "@/stores/authStore.js";
import { setUserProperties } from "@/lib/analytics/ga.js";

// 로그인한 적 있는 방문자만 렌더된다(AuthProvider) — axios·query 훅 번들이 비로그인 첫 화면에 실리지 않게 분리.
export default function SessionRestorer() {
  const checkIn = useCheckIn();
  useEffect(() => {
    // 캐시된 세션 요약을 먼저 반영(깜빡임 방지) — 같은 이펙트 안이라 아래 결과와 한 번의 렌더로 묶인다
    useAuthStore.persist.rehydrate();
    restoreSession()
      .then((data) => {
        if (data) checkIn(); // 출석 체크인 — 실패해도 로그인 흐름에 영향 없음(서버가 하루 1회 멱등 처리)
      })
      .catch(() => setUserProperties("GUEST"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

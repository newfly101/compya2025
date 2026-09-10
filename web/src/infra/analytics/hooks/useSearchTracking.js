// infra/analytics/hooks/useSearchTracking.js
// 타이핑마다 보내면 안 되므로, 입력이 멎은 뒤 한 번만 보낸다. 빈 문자열은 보내지 않는다.
// 대상: 선수 백과사전 / 스킬 백과사전 검색창 (둘 다 클라이언트 필터링 — 서버 호출 없이 여기서 직접 쏜다)
import { useEffect, useRef } from "react";
import { enqueueEvent } from "@/infra/analytics/serverEvents.js";

const DEBOUNCE_MS = 800;

export const useSearchTracking = (keyword) => {
  const timerRef = useRef(null);

  useEffect(() => {
    const trimmed = (keyword ?? "").trim();
    clearTimeout(timerRef.current);
    if (!trimmed) return;

    timerRef.current = setTimeout(() => {
      enqueueEvent("SEARCH", { searchKeyword: trimmed });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [keyword]);
};

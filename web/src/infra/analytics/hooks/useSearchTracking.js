// infra/analytics/hooks/useSearchTracking.js
// 타이핑마다 보내면 안 되므로, 입력이 멎은 뒤 한 번만 보낸다. 빈 문자열은 보내지 않는다.
// 대상: 선수 백과사전 / 스킬 백과사전 검색창 (둘 다 클라이언트 필터링 — 서버 호출 없이 여기서 직접 쏜다)
import { useEffect, useRef } from "react";
import { enqueueEvent } from "@/infra/analytics/serverEvents.js";

const DEBOUNCE_MS = 800;

export const useSearchTracking = (keyword) => {
  const timerRef = useRef(null);
  const pendingRef = useRef(null); // 디바운스 대기 중인 검색어 — 언마운트 시 flush 용

  useEffect(() => {
    const trimmed = (keyword ?? "").trim();
    clearTimeout(timerRef.current);
    pendingRef.current = null;
    if (!trimmed) return;

    pendingRef.current = trimmed;
    timerRef.current = setTimeout(() => {
      enqueueEvent("SEARCH", { searchKeyword: trimmed });
      pendingRef.current = null;
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [keyword]);

  // 화면을 벗어날 때 디바운스 타이머가 아직 살아있으면(입력 후 800ms 안에 이동) 버리지 않고
  // 즉시 전송한다 — 마지막 검색어가 조용히 사라지는 것을 막는다(FN-1).
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (pendingRef.current) {
        enqueueEvent("SEARCH", { searchKeyword: pendingRef.current });
        pendingRef.current = null;
      }
    };
  }, []);
};

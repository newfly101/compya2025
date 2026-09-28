import { useEffect, useState } from "react";

// 열어 둔 화면은 렌더가 없으면 만료 분류가 그대로다 — 자정을 넘겨도 "진행중" 으로 남았다.
// 다음 KST 자정과 탭 복귀 시점에만 리렌더를 유발한다(주기 타이머 없음). KST 는 UTC+9 고정이라 DST 보정이 없다.
export const useKstDayTick = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const onVisible = () => {
      if (document.visibilityState === "visible") bump();
    };
    const msToKstMidnight = 86400000 - ((Date.now() + 9 * 3600000) % 86400000);
    const timer = setTimeout(bump, msToKstMidnight + 1000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [tick]);

  return tick;
};

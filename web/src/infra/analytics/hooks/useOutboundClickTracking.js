// infra/analytics/hooks/useOutboundClickTracking.js
// 외부 이동 지점이 16곳 흩어져 있어 하나하나 고치는 대신, 문서 레벨에서
// target="_blank" 링크 클릭을 공통으로 잡는다. 쿠폰/이벤트 카드처럼 이미
// CONTENT_CLICK 으로 잡히는 지점은 data-analytics-tracked 로 표시해 중복 집계를 막는다.
// 어드민(/admin/**)은 에디터 툴바 링크 등 노이즈가 커서 대상에서 뺀다.
import { useEffect } from "react";
import { enqueueEvent } from "@/infra/analytics/serverEvents.js";

export const useOutboundClickTracking = () => {
  useEffect(() => {
    const handleClick = (e) => {
      if (window.location.pathname.startsWith("/admin")) return;

      const anchor = e.target?.closest?.('a[target="_blank"]');
      if (!anchor || anchor.dataset.analyticsTracked) return;

      // 전체 URL 대신 호스트만 — 쿼리스트링·경로에 개인식별 정보가 실려도 저장하지 않는다.
      enqueueEvent("OUTBOUND_CLICK", { targetUrl: new URL(anchor.href).host });
    };

    // capture 단계 — 클릭 핸들러가 stopPropagation 을 해도 놓치지 않게
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);
};

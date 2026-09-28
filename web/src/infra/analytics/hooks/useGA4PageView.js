import { useLocation, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { pushEvent } from "@/infra/analytics/ga.js";

// 모듈 스코프 — 진짜 새로고침(모듈 재초기화)에서는 리셋되어 정상 전송되고,
// 같은 문서에서의 재마운트만으로는 유지되어 중복 PAGE_VIEW 전송을 막는다.
let lastEmittedPath = null;

export const useGA4PageView = () => {
  const location = useLocation();
  const matches = useMatches();

  // title이 함수면 동적 라우트 — 페이지가 데이터 로드 후 직접 처리한다
  const isDynamicTitle = typeof matches[matches.length - 1]?.handle?.title === "function";

  // 의존성은 pathname 과 boolean 뿐이다.
  // useMatches() 는 렌더마다 새 배열을 돌려주므로 그대로 의존성에 넣으면
  // 쿼리스트링만 바뀌어도 page_view 가 다시 나간다 (page_path 는 그대로라 중복 전송).
  // 구단·필터를 쿼리로 관리하는 화면(선수 백과사전, 레전드 재료)에서 특히 심하다.
  useEffect(() => {
    if (isDynamicTitle) return;
    if (location.pathname === lastEmittedPath) return; // 재마운트 중복 차단

    // 이 모듈 최초 호출(=진짜 새로고침/최초 진입)만 navigation 타입을 읽는다. 이후는 전부 SPA 이동.
    const navType =
      lastEmittedPath === null
        ? (performance.getEntriesByType("navigation")[0]?.type ?? "navigate")
        : "spa";
    lastEmittedPath = location.pathname;

    // document.title 세팅 책임은 useDocumentMeta 로 이관됨 (infra/seo/useDocumentMeta.js)
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
      nav_type: navType,
    });
  }, [location.pathname, isDynamicTitle]);
}

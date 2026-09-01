import { useLocation, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { pushEvent } from "@/infra/analytics/ga.js";

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

    // document.title 세팅 책임은 useDocumentMeta 로 이관됨 (infra/seo/useDocumentMeta.js)
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, isDynamicTitle]);
}

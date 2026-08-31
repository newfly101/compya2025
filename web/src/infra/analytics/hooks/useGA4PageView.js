import { useLocation, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { pushEvent } from "@/infra/analytics/ga.js";

export const useGA4PageView = () => {
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    const current = matches[matches.length - 1];
    const title = current?.handle?.title;

    // title이 함수면 동적 라우트 — 페이지가 데이터 로드 후 직접 처리한다
    if (typeof title === "function") return;

    // document.title 세팅 책임은 useDocumentMeta 로 이관됨 (infra/seo/useDocumentMeta.js)
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, matches]);
}

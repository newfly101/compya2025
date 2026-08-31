// src/infra/seo/useDocumentMeta.js
// 라우트별 document.title / meta description / canonical / robots 를
// document.head 직접 조작 방식으로 통일 관리한다.
//
// title 세팅 책임은 useGA4PageView 에서 이곳으로 이관됨.
// "title 이 함수면 동적 라우트 — return" 규칙은 그대로 유지한다
// (동적 라우트는 페이지 컴포넌트가 데이터 로드 후 document.title 을 직접 세팅).

import { useEffect } from "react";
import { useLocation, useMatches, matchPath } from "react-router-dom";
import {
  ROUTE_SEO,
  DEFAULT_DESCRIPTION,
  NOT_FOUND_DESCRIPTION,
  buildCanonicalUrl,
} from "@/infra/seo/routeSeo.js";

function upsertMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove();
}

function findDescription(pathname) {
  const pattern = Object.keys(ROUTE_SEO).find((p) => matchPath(p, pathname));
  return pattern ? ROUTE_SEO[pattern] : DEFAULT_DESCRIPTION;
}

export const useDocumentMeta = () => {
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    const current = matches[matches.length - 1];
    const title = current?.handle?.title;
    const isNotFound = current?.handle?.seoKey === "notFound";

    // title이 함수면 동적 라우트 — 페이지가 데이터 로드 후 직접 처리한다
    if (typeof title !== "function" && title) {
      document.title = title;
    }

    if (isNotFound) {
      upsertMeta("description", NOT_FOUND_DESCRIPTION);
      upsertMeta("robots", "noindex, follow");
      removeCanonical();
      return;
    }

    upsertMeta("description", findDescription(location.pathname));
    upsertMeta("robots", "index, follow");
    upsertCanonical(buildCanonicalUrl(location.pathname));
  }, [location.pathname, matches]);
};

// src/infra/seo/usePageSeo.js
// 데이터를 불러온 뒤에야 제목/설명/대표이미지를 알 수 있는 화면(예: 공지 상세)이
// useDocumentMeta 가 세팅한 라우트 기본값을 덮어쓰기 위한 훅.
//
// useDocumentMeta 는 location.pathname 이 바뀔 때만 다시 돈다. 같은 라우트 안에서
// 데이터 로드 후 값을 바꾸는 건 이 훅의 몫이다. 화면을 벗어날 때는 그 시점의
// location/matches 로 applyRouteSeo 를 다시 호출해 라우트 기본값으로 되돌린다
// (useDocumentMeta 재실행에 기대지 않는 이유: 같은 커밋 안에서 페이지 effect가
//  레이아웃의 useDocumentMeta effect보다 먼저 도는 순서라, 페이지가 언마운트되지 않고
//  파라미터만 바뀌는 케이스에선 기댈 수 없다).

import { useEffect, useRef } from "react";
import { useLocation, useMatches } from "react-router-dom";
import { buildCanonicalUrl, SITE_URL } from "@/infra/seo/routeSeo.js";
import { applyRouteSeo, upsertMeta, upsertProperty, upsertCanonical } from "@/infra/seo/useDocumentMeta.js";

function toAbsoluteUrl(pathOrUrl) {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * @param {object} params
 * @param {string} [params.title] - document.title + og:title + twitter:title
 * @param {string} [params.description] - meta description + og:description + twitter:description
 * @param {string} [params.imageUrl] - og:image + twitter:image (상대경로면 SITE_URL 붙여 절대 URL화)
 * @param {string} [params.canonicalPath] - canonical + og:url
 * @param {string} [params.ogType] - og:type (기본 "website" 유지, 예: "article")
 */
export function usePageSeo({ title, description, imageUrl, canonicalPath, ogType } = {}) {
  const location = useLocation();
  const matches = useMatches();

  // cleanup 시점에 쓸 최신 location/matches — effect 의존성에 넣으면 매 렌더 재적용되므로 ref 로 우회.
  // ref 갱신은 렌더 중이 아니라 별도 effect 에서 한다(react-hooks/refs 규칙).
  const routeStateRef = useRef({ location, matches });
  useEffect(() => {
    routeStateRef.current = { location, matches };
  });

  useEffect(() => {
    // 값이 하나도 준비되지 않았으면(로딩 중) 라우트 기본값을 그대로 둔다.
    const hasAnyValue = title != null || description != null || imageUrl != null || canonicalPath != null;
    if (!hasAnyValue) return undefined;

    if (title != null) {
      document.title = title;
      upsertProperty("og:title", title);
      upsertMeta("twitter:title", title);
    }

    if (description != null) {
      upsertMeta("description", description);
      upsertProperty("og:description", description);
      upsertMeta("twitter:description", description);
    }

    if (imageUrl != null) {
      const absoluteImage = toAbsoluteUrl(imageUrl);
      upsertProperty("og:image", absoluteImage);
      upsertMeta("twitter:image", absoluteImage);
    }

    if (canonicalPath != null) {
      const absoluteUrl = buildCanonicalUrl(canonicalPath);
      upsertCanonical(absoluteUrl);
      upsertProperty("og:url", absoluteUrl);
    }

    if (ogType) {
      upsertProperty("og:type", ogType);
    }

    return () => {
      const { location: prevLocation, matches: prevMatches } = routeStateRef.current;
      applyRouteSeo(prevLocation, prevMatches);
    };
  }, [title, description, imageUrl, canonicalPath, ogType]);
}

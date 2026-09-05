// src/infra/seo/useDocumentMeta.js
// 라우트별 document.title / meta description / canonical / robots / og·twitter 를
// document.head 직접 조작 방식으로 통일 관리한다.
//
// title 세팅 책임은 useGA4PageView 에서 이곳으로 이관됨.
// "title 이 함수면 동적 라우트 — return" 규칙은 그대로 유지한다
// (동적 라우트는 페이지 컴포넌트가 데이터 로드 후 document.title 을 직접 세팅,
//  og/twitter/description 도 usePageSeo 로 같은 방식으로 덮어쓸 수 있다).

import { useEffect } from "react";
import { useLocation, useMatches, matchPath } from "react-router-dom";
import {
  ROUTE_SEO,
  DEFAULT_DESCRIPTION,
  NOT_FOUND_DESCRIPTION,
  NOINDEX_PATHS,
  SITE_URL,
  buildCanonicalUrl,
} from "@/infra/seo/routeSeo.js";

const SITE_NAME = "컴프야펀";
// 공유 카드 기본 이미지 — index.html 정적 og:image 와 동일한 파일로 맞춘다.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/compyafun2026.jpg`;

export function upsertMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// og 계열은 name 이 아니라 property 속성을 쓴다 (index.html 정적 태그와 동일 규칙).
export function upsertProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove();
}

function findDescription(pathname) {
  const pattern = Object.keys(ROUTE_SEO).find((p) => matchPath(p, pathname));
  return pattern ? ROUTE_SEO[pattern] : DEFAULT_DESCRIPTION;
}

function isNoindexPath(pathname) {
  return NOINDEX_PATHS.some((p) => matchPath(p, pathname));
}

// og/twitter 는 검색엔진 색인 여부(noindex)와 무관하게 항상 채운다.
// noindex 는 "검색결과에 내지 말라"는 지시일 뿐, 카카오톡/디스코드 등 소셜 공유 카드는
// noindex 페이지(예: 커뮤니티, 확률 공시 상세)도 정상적으로 필요하기 때문이다.
function setOgAndTwitter({ title, description, url, image }) {
  upsertProperty("og:type", "website");
  upsertProperty("og:site_name", SITE_NAME);
  upsertProperty("og:title", title);
  upsertProperty("og:description", description);
  upsertProperty("og:url", url);
  if (image) upsertProperty("og:image", image);

  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", title);
  upsertMeta("twitter:description", description);
  if (image) upsertMeta("twitter:image", image);
}

// 라우트 기본 SEO 를 실제로 적용하는 순수 함수.
// useDocumentMeta 훅 본체이자, usePageSeo 가 화면 이탈 시 "라우트 기본값으로 복귀"하는 데도 재사용한다.
export function applyRouteSeo(location, matches) {
  const current = matches[matches.length - 1];
  const title = current?.handle?.title;
  const isNotFound = current?.handle?.seoKey === "notFound";

  // title이 함수면 동적 라우트 — 페이지가 데이터 로드 후 직접 처리한다
  if (typeof title !== "function" && title) {
    document.title = title;
  }

  const canonicalUrl = buildCanonicalUrl(location.pathname);

  if (isNotFound) {
    upsertMeta("description", NOT_FOUND_DESCRIPTION);
    upsertMeta("robots", "noindex, follow");
    removeCanonical();
    setOgAndTwitter({
      title: document.title,
      description: NOT_FOUND_DESCRIPTION,
      url: canonicalUrl,
      image: DEFAULT_OG_IMAGE,
    });
    return;
  }

  const description = findDescription(location.pathname);
  upsertMeta("description", description);

  if (isNoindexPath(location.pathname)) {
    upsertMeta("robots", "noindex, follow");
    removeCanonical();
    setOgAndTwitter({ title: document.title, description, url: canonicalUrl, image: DEFAULT_OG_IMAGE });
    return;
  }

  upsertMeta("robots", "index, follow");
  upsertCanonical(canonicalUrl);
  setOgAndTwitter({ title: document.title, description, url: canonicalUrl, image: DEFAULT_OG_IMAGE });
}

export const useDocumentMeta = () => {
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    applyRouteSeo(location, matches);
  }, [location.pathname, matches]);
};

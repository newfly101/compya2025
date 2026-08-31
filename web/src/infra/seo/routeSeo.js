// src/infra/seo/routeSeo.js
// 라우트별 SEO 메타(description/canonical) 전용 맵.
// routeMeta.js(title) 와 분리 — 동시 편집 충돌 회피 + 관심사 분리.
// key 는 라우트 등록 시 쓰인 path 패턴 문자열(react-router matchPath 대상)과 동일하게 맞춘다.

export const SITE_URL = "https://compyafun.com";

// index.html 의 기본 description 과 동일 — JS 미실행/미매칭 라우트의 fallback.
export const DEFAULT_DESCRIPTION =
  "컴프야펀은 컴투스 프로야구 공식 공지, 이벤트, 쿠폰, 공략 정보를 한눈에 볼 수 있는 팬 사이트입니다.";

export const NOT_FOUND_DESCRIPTION =
  "요청하신 페이지를 찾을 수 없습니다. 컴프야펀 홈에서 최신 공지·이벤트·쿠폰 정보를 확인해보세요.";

// path 패턴 → 실제 페이지 내용을 반영한 description
export const ROUTE_SEO = {
  "/": "컴프야펀 홈 — 컴투스 프로야구 최신 공지, 진행 중 이벤트, 쿠폰 코드를 한 곳에서 확인하세요.",
  "/coupons": "컴투스 프로야구 최신 쿠폰 코드와 종료된 쿠폰 이력을 모아보는 페이지입니다.",
  "/events": "컴투스 프로야구 진행 중/종료된 이벤트 일정과 참여 방법을 안내합니다.",
  "/notices": "컴투스 프로야구 공식 공지사항을 모아 확인할 수 있는 목록 페이지입니다.",
  "/notice/:id": "컴투스 프로야구 공지사항 상세 내용을 확인하세요.",
  "/probability": "컴투스 프로야구 확률형 아이템 확률 공시 정보를 안내합니다.",
  "/probability/:sectionId": "컴투스 프로야구 확률 공시 상세 항목별 확률 정보를 확인하세요.",
  "/players": "컴투스 프로야구 소속 선수 정보를 구단·연도별로 찾아볼 수 있는 선수 백과사전입니다.",
  "/mode/history": "컴투스 프로야구 히스토리 모드 진행 정보와 기록을 확인하세요.",
  // 아래 4개는 다른 작업으로 라우트 신설 예정 — description 선반영
  "/privacy": "컴프야펀 개인정보처리방침 안내 페이지입니다.",
  "/terms": "컴프야펀 이용약관 안내 페이지입니다.",
  "/contact": "컴프야펀에 문의할 수 있는 페이지입니다.",
  "/about": "컴프야펀 서비스 소개 페이지입니다.",
};

// 쿼리스트링은 location.pathname 자체에 포함되지 않으므로 별도 정규화 불필요.
// (예: /players?team=..&year=.. → location.pathname 은 이미 "/players")
export function buildCanonicalUrl(pathname) {
  const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return `${SITE_URL}${path}`;
}

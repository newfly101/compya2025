import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

export const ROUTE_META = {
  HOME: { path: ROUTE_PATHS.home, title: "컴프야펀 | 홈" },
  COUPONS: { path: ROUTE_PATHS.coupons, title: "컴프야펀 | 쿠폰 모아보기" },
  EVENTS: {path: ROUTE_PATHS.events, title: "컴프야펀 | 이벤트"},
  NOTICES: {path: ROUTE_PATHS.notices, title: "컴프야펀 | 공지사항"},
  NOTICE_DETAILS: {
    path: ROUTE_PATHS.notice_details_pattern,
    title: (noticeTitle) =>
      noticeTitle
        ? `컴프야펀 | 공지사항 | ${noticeTitle}`
        : "컴프야펀 | 공지사항 상세",
  },
  ODDS: {path: ROUTE_PATHS.odds, title: "컴프야펀 | 확률 공시"},
  ODDS_SECTION: {
    path: ROUTE_PATHS.odds_section_pattern,
    title: (sectionTitle) =>
      sectionTitle
        ? `컴프야펀 | 확률 공시 | ${sectionTitle}`
        : "컴프야펀 | 확률 공시 상세",
  },
  PLAYERS: {path: ROUTE_PATHS.players, title: "컴프야펀 | 선수 백과사전"},
  LEGEND_STATS: {path: ROUTE_PATHS.legend_stats, title: "컴프야펀 | 레전드 재료 검색"},
  HISTORY_LEGEND: {path: ROUTE_PATHS.history_legend, title: "컴프야펀 | 히스토리 재료"},
  COMMUNITY: {path: ROUTE_PATHS.community, title: "컴프야펀 | 커뮤니티"},
  PRIVACY: {path: ROUTE_PATHS.privacy, title: "컴프야펀 | 개인정보처리방침"},
  TERMS: {path: ROUTE_PATHS.terms, title: "컴프야펀 | 이용약관"},
  CONTACT: {path: ROUTE_PATHS.contact, title: "컴프야펀 | 문의하기"},
  ABOUT: {path: ROUTE_PATHS.about, title: "컴프야펀 | 사이트 소개"},
  MYPAGE: {path: ROUTE_PATHS.mypage, title: "컴프야펀 | 마이페이지"},
  AUTH_CALL_BACK: {path: ROUTE_PATHS.authentication},
  // admin — 단일 셸(AdminShellScreen). title 이 함수라 useDocumentMeta 는 건너뛰고,
  // AdminShellScreen 이 활성 탭에 맞춰 document.title 을 직접 갱신한다(공지 상세와 동일 패턴).
  ADMIN: {
    path: ROUTE_PATHS.admin,
    title: (tabLabel) => (tabLabel ? `컴프야펀 | 어드민 | ${tabLabel}` : "컴프야펀 | 어드민"),
  },
  // 공지 글쓰기 — 셸 밖 전체 페이지(탭 구조 예외).
  ADMIN_NOTICE_WRITE: {
    path: ROUTE_PATHS.admin_notice_write_edit_pattern,
    title: "컴프야펀 | 어드민 | 공지 글쓰기",
  },
};

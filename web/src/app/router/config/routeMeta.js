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
  LEGEND_MATERIALS: {path: ROUTE_PATHS.legend_materials, title: "컴프야펀 | 레전드 재료 검색"},
  HISTORY_MODE: {path: ROUTE_PATHS.history_mode, title: "컴프야펀 | 히스토리모드"},
  COMMUNITY: {path: ROUTE_PATHS.community, title: "컴프야펀 | 커뮤니티"},
  PRIVACY: {path: ROUTE_PATHS.privacy, title: "컴프야펀 | 개인정보처리방침"},
  TERMS: {path: ROUTE_PATHS.terms, title: "컴프야펀 | 이용약관"},
  CONTACT: {path: ROUTE_PATHS.contact, title: "컴프야펀 | 문의하기"},
  ABOUT: {path: ROUTE_PATHS.about, title: "컴프야펀 | 사이트 소개"},
  MYPAGE: {path: ROUTE_PATHS.mypage, title: "컴프야펀 | 마이페이지"},
  AUTH_CALL_BACK: {path: ROUTE_PATHS.authentication},
  // admin
  ADMIN_COUPON: { path: ROUTE_PATHS.admin_coupon, title: "컴프야펀 | 어드민 | 쿠폰 관리", variant: "page" },
  ADMIN_EVENT: { path: ROUTE_PATHS.admin_event, title: "컴프야펀 | 어드민 | 이벤트 관리", variant: "page" },
  ADMIN_NOTICE: { path: ROUTE_PATHS.admin_notice, title: "컴프야펀 | 어드민 | 공지 관리", variant: "page" },
  ADMIN_USER: { path: ROUTE_PATHS.admin_user, title: "컴프야펀 | 어드민 | 유저 관리", variant: "page" },
};

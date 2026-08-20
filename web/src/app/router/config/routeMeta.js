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
  HISTORY_MODE: {path: ROUTE_PATHS.history_mode, title: "컴프야펀 | 히스토리모드"},
  COMMUNITY: {path: ROUTE_PATHS.community, title: "컴프야펀 | 커뮤니티"},
  AUTH_CALL_BACK: {path: ROUTE_PATHS.authentication},
  // admin
  ADMIN_COUPON: { path: ROUTE_PATHS.admin_coupon, title: "컴프야펀 | 어드민 | 쿠폰 관리", variant: "page" },
  ADMIN_EVENT: { path: ROUTE_PATHS.admin_event, title: "컴프야펀 | 어드민 | 이벤트 관리", variant: "page" },
  ADMIN_NOTICE: { path: ROUTE_PATHS.admin_notice, title: "컴프야펀 | 어드민 | 공지 관리", variant: "page" },
  ADMIN_USER: { path: ROUTE_PATHS.admin_user, title: "컴프야펀 | 어드민 | 유저 관리", variant: "page" },
};

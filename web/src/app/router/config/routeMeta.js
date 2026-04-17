import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

export const ROUTE_META = {
  HOME: { path: ROUTE_PATHS.home, title: "컴프야펀 | 홈" },
  COUPONS: { path: ROUTE_PATHS.coupons, title: "컴프야펀 | 쿠폰 모아보기" },
  EVENTS: {path: ROUTE_PATHS.events, title: "컴프야펀 | 이벤트"},
  NOTICES: {path: ROUTE_PATHS.notices, title: "컴프야펀 | 공지사항"},
  // NOTICE_DETAILS: {path: ROUTE_PATHS.notice_details(id), title: "컴프야펀 | 공지사항"}
  HISTORY_MODE: {path: ROUTE_PATHS.history_mode, title: "컴프야펀 | 히스토리모드"},
  AUTH_CALL_BACK: {path: ROUTE_PATHS.authentication},
};

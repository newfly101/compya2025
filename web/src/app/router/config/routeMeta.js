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
  ADMIN_WIKI: { path: ROUTE_PATHS.admin_wiki, title: "컴프야펀 | 어드민 | 위키 관리", variant: "page" },
  ADMIN_WIKI_PITCHES: { path: ROUTE_PATHS.admin_wiki_pitches, title: "컴프야펀 | 어드민 | 마구 관리", variant: "page" },
  ADMIN_WIKI_PITCH_GRADES: { path: ROUTE_PATHS.admin_wiki_pitch_grades, title: "컴프야펀 | 어드민 | 마구 등급 관리", variant: "page" },
  ADMIN_WIKI_STAT_INFLUENCES: { path: ROUTE_PATHS.admin_wiki_stat_influences, title: "컴프야펀 | 어드민 | 스탯 영향 관리", variant: "page" },
  ADMIN_WIKI_GAME_INFO: { path: ROUTE_PATHS.admin_wiki_game_info, title: "컴프야펀 | 어드민 | 위키 게임 정보", variant: "page" },
  // wiki public
  WIKI_HOME: { path: ROUTE_PATHS.wiki, title: "컴프야펀 | 추천 백과사전", variant: "page" },
  WIKI_SKILL: { path: ROUTE_PATHS.wiki_skill_pattern, title: "컴프야펀 | 스킬 백과사전", variant: "page" },
  WIKI_RECOMMEND: { path: ROUTE_PATHS.wiki_recommend_pattern, title: "컴프야펀 | 추천 조합", variant: "page" },
  WIKI_GAME_INFO: { path: ROUTE_PATHS.wiki_game_info_pattern, title: "컴프야펀 | 게임 정보", variant: "page" },
};

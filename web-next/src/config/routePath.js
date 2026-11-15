import { noticeTitleToSlug } from "@/domains/notices/mobile/noticeSlug.js";

// 원본 web/src/app/router/config/routePath.js 중 Next 에 옮긴 화면이 참조하는 항목만
export const ROUTE_PATHS = {
  home: "/",
  authentication: "/auth/callback",
  mypage: "/mypage",
  mypage_history: "/mypage/history",
  home_shortcuts: "/home/shortcuts",
  legend_collections: "/legend-collections",
  legend_collection_manage: "/legend-collections/manage",
  legend_collection_skills: "/legend-collection-skills",
  legend_collection_skill_edit: (legendId) => `/legend-collection-skills/${legendId}/edit`,
  simulator_gsb: "/simulators/gsb",
  mileage: "/mileage",
  player_skills: "/skills",
  coupons: "/coupons",
  events: "/events",
  notices: "/notices",
  odds: "/probability",
  players: "/players",
  legend_stats: "/legend-stats",
  history_legend: "/history-mode/legend",
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  about: "/about",
  guides: "/guides",
};

export const NOTICE_LIST_PATH = "/notices";
export const noticeDetailPath = (notice) => `/notice/${noticeTitleToSlug(notice?.title, notice?.id)}`;
export const EVENT_LIST_PATH = "/events";
export const eventDetailPath = (id) => `/events/${id}`;

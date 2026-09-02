export const ROUTE_PATHS = {
  home: "/",
  authentication: "/auth/callback",
  coupons: "/coupons",
  events: "/events",
  notices: "/notices",
  notice_details_pattern: "/notice/:id",
  notice_details: (id) => `/notice/${id}`,
  // 확률 공시 — 코드 식별자는 odds, 노출 주소는 probability
  // (국내 게임사가 확률형 아이템 정보 공개 페이지에 쓰는 표기를 따름)
  odds: "/probability",
  odds_section_pattern: "/probability/:sectionId",
  odds_section: (id) => `/probability/${id}`,
  // 선수 백과사전 — 구단/연도는 쿼리스트링(?team=&year=)으로 처리
  players: "/players",
  players_query: ({ team, year } = {}) => {
    const params = new URLSearchParams();
    if (team) params.set("team", team);
    if (year) params.set("year", year);
    const qs = params.toString();
    return qs ? `/players?${qs}` : "/players";
  },
  players_legacy_team_pattern: "/players/:teamId",
  players_legacy_year_pattern: "/players/:teamId/:year",
  // 구 주소 — v1 폐기 후 legend_stats 로 리다이렉트만 한다
  legend_materials_legacy: "/legend-materials",
  // 레전드 재료
  legend_stats: "/legend-stats",
  history_mode: "/mode/history",
  community: "/community",
  // 정책 페이지 — 구글 애드센스 심사 대비 신설 (2026-08-31)
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  about: "/about",
  mypage: "/mypage",
  // admin flat 구조
  admin_coupon: "/admin/coupon",
  admin_event: "/admin/event",
  admin_notice: "/admin/notice",
  admin_user: "/admin/user",
}

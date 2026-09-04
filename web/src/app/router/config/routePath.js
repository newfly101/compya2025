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
  // 구 주소 — v1 폐기 후 history_legend 로 리다이렉트만 한다
  history_mode_legacy: "/mode/history",
  // 히스토리 재료 탐색기 — 평점표에서 ?legend={레전드명} 으로 진입한다
  history_legend: "/history-mode/legend",
  community: "/community",
  // 정책 페이지 — 구글 애드센스 심사 대비 신설 (2026-08-31)
  privacy: "/privacy",
  terms: "/terms",
  contact: "/contact",
  about: "/about",
  mypage: "/mypage",
  // admin — 단일 셸 + 상단 탭. 기존 경로 문자열은 그대로 두고(북마크 호환) :tab 파라미터로 매칭한다.
  admin: "/admin",
  admin_tab_pattern: "/admin/:tab",
  admin_tab: (tab) => `/admin/${tab}`,
  // 공지 글쓰기 — 유일하게 셸 탭이 아니라 전체 페이지로 전환되는 예외(모달 대신 Tiptap 에디터).
  admin_notice_write: "/admin/notice/write",
  admin_notice_write_edit_pattern: "/admin/notice/write/:id",
  admin_notice_write_edit: (id) => `/admin/notice/write/${id}`,
}

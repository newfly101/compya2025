export const ROUTE_PATHS = {
  home: "/",
  authentication: "/auth/callback",
  coupons: "/coupons",
  events: "/events",
  notices: "/notices",
  notice_details_pattern: "/notice/:id",
  notice_details: (id) => `/notice/${id}`,
  history_mode: "/mode/history",
}

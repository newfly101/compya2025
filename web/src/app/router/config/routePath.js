export const ROUTE_PATHS = {
  home: "/",
  authentication: "/auth/callback",
  coupons: "/coupons",
  events: "/events",
  notices: "/notices",
  notice_details_pattern: "/notice/:id",
  notice_details: (id) => `/notice/${id}`,
  history_mode: "/mode/history",
  community: "/community",
  // admin flat 구조
  admin_coupon: "/admin/coupon",
  admin_event: "/admin/event",
  admin_notice: "/admin/notice",
  admin_user: "/admin/user",
}

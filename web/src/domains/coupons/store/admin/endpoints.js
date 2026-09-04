export const ADMIN_COUPONS = {
  GET_COUPONS: "/admin/coupons",
  CREATE_COUPONS: "/admin/coupons",
  UPDATE_COUPONS: (id) => `/admin/coupons/${id}`,
  UPDATE_COUPON_VISIBLE: (id) => `/admin/coupons/${id}/visible`,
  DELETE_COUPON: (id) => `/admin/coupons/${id}`,
  // v2 일괄 삭제·숨김 — BE 작업 중(계약만 확정). 연결 전까지는 호출하면 404.
  BULK_DELETE_COUPONS: "/admin/coupons/bulk",
  BULK_UPDATE_COUPON_VISIBLE: "/admin/coupons/bulk/visible",
}

export const ADMIN_COUPON_ACTIONS = {
  GET_LIST: "GET/admin/coupons/list",
  CREATE: "POST/admin/coupons",
  UPDATE: "PATCH/admin/coupons/update",
  UPDATE_VISIBLE: "PATCH/admin/coupons/updateVisible",
  DELETE: "DELETE/admin/coupons/delete",
  BULK_DELETE: "DELETE/admin/coupons/bulk",
  BULK_UPDATE_VISIBLE: "PATCH/admin/coupons/bulk/visible",
}

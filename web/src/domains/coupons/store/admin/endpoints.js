export const ADMIN_COUPONS = {
  GET_COUPONS: "/admin/coupons",
  CREATE_COUPONS: "/admin/coupons",
  UPDATE_COUPONS: (id) => `/admin/coupons/${id}`,
  UPDATE_COUPON_VISIBLE: (id) => `/admin/coupons/${id}/visible`,
  DELETE_COUPON: (id) => `/admin/coupons/${id}`,
}

export const ADMIN_COUPON_ACTIONS = {
  GET_LIST: "GET/admin/coupons/list",
  CREATE: "POST/admin/coupons",
  UPDATE: "PATCH/admin/coupons/update",
  UPDATE_VISIBLE: "PATCH/admin/coupons/updateVisible",
  DELETE: "DELETE/admin/coupons/delete",
}

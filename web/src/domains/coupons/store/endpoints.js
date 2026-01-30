export const COUPONS = {
  GET_COUPONS: "/coupons",
  CREATE_COUPONS: "/coupons",
  UPDATE_COUPONS: (id) => `/coupons/${id}`,
  UPDATE_COUPON_VISIBLE: (id) => `/coupons/${id}/visible`,
}

export const COUPON_ACTIONS = {
  GET_COUPON_LIST: "/coupons/list",
  CREATE: "/coupons",
  UPDATE: "/coupons/update",
  UPDATE_VISIBLE: "coupons/updateVisible",
}

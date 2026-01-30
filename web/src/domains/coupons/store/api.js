import { API } from "@/app/store/APIConfig.js";
import { COUPONS } from "@/domains/coupons/store/endpoints.js";

/**
 * COUPON API
 */

export const fetchGetCouponList = async () => {
  const { data } = await API.get(`${COUPONS.GET_COUPONS}`);
};
export const fetchInsertCoupon = async (coupon) => {
  const { data } = await API.post(`${COUPONS.CREATE_COUPONS}`, coupon);
  return data;
};
export const fetchUpdateCoupon = async (id, coupon) => {
  const { data } = await API.patch(`${COUPONS.UPDATE_COUPONS(id)}`, coupon);
  return data;
};
export const fetchUpdateCouponVisible = async (id, visible) => {
  const { data } = await API.patch(`${COUPONS.UPDATE_COUPON_VISIBLE(id)}`, { visible });
  return data;
};

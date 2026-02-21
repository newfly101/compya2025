import { API } from "@/app/store/APIConfig.js";
import { ADMIN_COUPONS } from "@/domains/coupons/store/admin/endpoints.js";

/**
 * COUPON API
 */

export const fetchAdminCouponList = async () => {
  const { data } = await API.get(`${ADMIN_COUPONS.GET_COUPONS}`);
  return data;
};
export const fetchAdminInsertCoupon = async (coupon) => {
  const { data } = await API.post(`${ADMIN_COUPONS.CREATE_COUPONS}`, coupon);
  return data;
};
export const fetchAdminUpdateCoupon = async (id, coupon) => {
  const { data } = await API.patch(`${ADMIN_COUPONS.UPDATE_COUPONS(id)}`, coupon);
  return data;
};
export const fetchAdminUpdateVisible = async (id, visible) => {
  const { data } = await API.patch(`${ADMIN_COUPONS.UPDATE_COUPON_VISIBLE(id)}`, { visible });
  return data;
};

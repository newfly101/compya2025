import { API } from "@/app/store/APIConfig.js";
import { COUPONS } from "@/domains/coupons/store/public/endpoints.js";

export const fetchGetUserCoupon = async () => {
  const { data } = await API.get(`${COUPONS.GET_COUPONS}`);
  return data;
};

import { API } from "@/infra/http/client.js";
import { COUPONS } from "@/domains/coupons/store/public/endpoints.js";
// BE 는 모든 응답을 { success, code, data } 로 감싼다. api 함수는 내용물(data.data)만 반환한다.

export const fetchGetUserCoupon = async () => {
  const { data } = await API.get(`${COUPONS.GET_COUPONS}`);
  return data.data;
};

import { API } from "@/infra/http/client.js";
import { MILEAGE_SNIPER } from "@/domains/mileage/store/public/endpoints.js";

/**
 * 마일리지로 확정 저격 가능한 재료 카드 119건.
 * 거의 안 바뀌는 데이터라 서버가 ETag 를 주므로 재방문은 대부분 304 로 끝난다.
 */
export const fetchGetSniperTargets = async () => {
  const { data } = await API.get(MILEAGE_SNIPER.GET_TARGETS);
  return data;
};

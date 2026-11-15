import { API } from "@/infra/http/client.js";
import { MILEAGE_SNIPER } from "@/domains/mileage/store/public/endpoints.js";
// BE 는 모든 응답을 { success, code, data } 로 감싼다. api 함수는 내용물(data.data)만 반환한다.

/**
 * 마일리지로 확정 저격 가능한 재료 카드 119건.
 * 거의 안 바뀌는 데이터라 서버가 ETag 를 주므로 재방문은 대부분 304 로 끝난다.
 */
export const fetchGetSniperTargets = async () => {
  const { data } = await API.get(MILEAGE_SNIPER.GET_TARGETS);
  return data.data;
};

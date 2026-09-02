import { API } from "@/infra/http/client.js";
import { HISTORY_ROUNDS } from "@/domains/historyLegend/store/public/endpoints.js";

/**
 * 라운드 70개 + 25인 로스터 전량.
 * 재료만 추려 받지 않는다 — 덱빌딩 화면이 같은 응답을 쓴다.
 * 서버가 ETag 를 주므로 재방문은 대부분 304 로 끝난다.
 */
export const fetchGetHistoryRounds = async () => {
  const { data } = await API.get(HISTORY_ROUNDS.GET_ROUNDS);
  return data;
};

import { API } from "@/infra/http/client.js";
import { PLAYER_CARDS } from "@/domains/players/store/endpoints.js";

// 공통 응답 래퍼({ success, code, data })에서 배열만 꺼내 돌려준다.
// ETag 가 붙어 재방문 시 304 가 올 수 있는데, 캐시 무효화는 axios 기본 동작에 맡긴다.
export const fetchGetPlayerCards = async () => {
  const { data } = await API.get(PLAYER_CARDS.GET_ALL);
  return data.data;
};

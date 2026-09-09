import { API } from "@/infra/http/client.js";
import { PLAYER_SKILLS } from "@/domains/playerSkills/store/endpoints.js";

// 공통 응답 래퍼({ success, code, data })에서 배열만 꺼내 돌려준다.
// ETag 재요청 시 304 가 올 수 있는데, 캐시 무효화는 axios 기본 동작에 맡기고
// 여기서 별도 처리를 하지 않는다.
export const fetchGetHitterSkills = async () => {
  const { data } = await API.get(PLAYER_SKILLS.GET_HITTERS);
  return data.data;
};

export const fetchGetPitcherSkills = async () => {
  const { data } = await API.get(PLAYER_SKILLS.GET_PITCHERS);
  return data.data;
};

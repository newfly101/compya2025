import { API } from "@/infra/http/client.js";
import { LEGEND_STATS } from "@/domains/legendStats/store/public/endpoints.js";

/** 레전드 74명 전량. 필터·정렬은 화면이 하므로 조건 파라미터가 없다. */
export const fetchGetLegendStats = async () => {
  const { data } = await API.get(LEGEND_STATS.GET_STATS);
  return data;
};

export const fetchGetPitchTypes = async () => {
  const { data } = await API.get(LEGEND_STATS.GET_PITCH_TYPES);
  return data;
};

/** 구단 한글명 lookup 재료 — 같은 teamCode 가 여러 행(팀명 변경 이력)일 수 있다. */
export const fetchGetTeams = async () => {
  const { data } = await API.get(LEGEND_STATS.GET_TEAMS);
  return data;
};

/** 재료는 이름을 눌렀을 때만. 74명분을 미리 받지 않는다. */
export const fetchGetLegendMaterials = async (legendId) => {
  const { data } = await API.get(LEGEND_STATS.getLegendDetail(legendId));
  return data;
};

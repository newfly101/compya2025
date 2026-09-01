import { API } from "@/infra/http/client.js";
import { LEGEND_MATERIALS } from "@/domains/legendMaterials/store/public/endpoints.js";

/**
 * 레전드 + 재료를 한 번에 받는다.
 * 레전드 74명 × 재료 8행이라 분할 호출보다 한 번에 받는 편이 가볍다.
 */
export const fetchGetLegendsWithMaterials = async () => {
  const { data } = await API.get(LEGEND_MATERIALS.GET_LEGENDS, {
    params: { withMaterials: true },
  });
  return data;
};

/** 구단 한글명 lookup 재료 — 같은 team_code 가 여러 행(팀명 변경 이력)일 수 있다. */
export const fetchGetTeams = async () => {
  const { data } = await API.get(LEGEND_MATERIALS.GET_TEAMS);
  return data;
};

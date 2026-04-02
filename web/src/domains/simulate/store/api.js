import { API } from "@/app/store/APIConfig.js";
import { SIMULATE } from "@/domains/simulate/store/endpoints.js";

/**
 * Player Skill Dictionary API
 * @param {string} playerType - HITTER | PITCHER
 */
export const fetchPlayerCardInfo = async (playerType) => {
  const { data } = await API.get(`${SIMULATE.INFO}/${playerType}`);
  return data;
};

/**
 * Skill Score Config API
 * - 투수/타자 스킬 점수 설정 전체 조회 (캐싱용)
 */
export const fetchSkillScoreConfig = async () => {
  const { data } = await API.get(SIMULATE.SCORE_CONFIG);
  return data;
};

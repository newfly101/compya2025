import { API } from "@/app/store/APIConfig.js";
import { DICTIONARY } from "@/domains/dictionary/store/endpoints.js";

/**
 * Player Skill Dictionary API
 * @param {string} playerType - HITTER | PITCHER
 */
export const fetchPlayerSkillSet = async (playerType) => {
  const { data } = await API.get(`${DICTIONARY.SKILLSET}/${playerType}`);
  return data;
};

import { API } from "@/store/api/APIConfig.js";
import { DICTIONARY } from "@/store/modules/dictionary/endpoints.js";

/**
 * Player Skill Dictionary API
 * @param {string} playerType - HITTER | PITCHER
 */
export const fetchPlayerSkillSet = async (playerType) => {
  const { data } = await API.get(`${DICTIONARY.SKILLSET}/${playerType}`);
  return data;
};

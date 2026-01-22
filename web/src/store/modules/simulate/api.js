import { API } from "@/store/api/APIConfig.js";
import { SIMULATE } from "@/store/modules/simulate/endpoints.js";

/**
 * Player Skill Dictionary API
 * @param {string} playerType - HITTER | PITCHER
 */
export const fetchPlayerCardInfo = async (playerType) => {
  const { data } = await API.get(`${SIMULATE.INFO}/${playerType}`);
  return data;
};

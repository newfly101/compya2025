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

import { API } from "@/app/store/APIConfig.js";
import { ADMIN_PLAYER_CARD } from "@/domains/playerCard/store/admin/endpoints.js";

/**
 * PLAYER CARD API
 */

export const fetchAdminTeamList = async () => {
  const { data } = await API.get(`${ADMIN_PLAYER_CARD.GET_TEAMS}`);
  return data;
};

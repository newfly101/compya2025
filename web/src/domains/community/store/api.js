import { API } from "@/app/store/APIConfig.js";
import { ADMIN_COMMUNITY } from "@/domains/community/store/endpoints.js";

/**
 * COMMUNITY API
 */

export const fetchGetAllBoardLists = async () => {
  const { data } = await API.get(`${ADMIN_COMMUNITY.BOARD_LIST}`);
  return data;
}

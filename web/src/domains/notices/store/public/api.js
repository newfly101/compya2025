import { API } from "@/app/store/APIConfig.js";
import { NOTICES } from "@/domains/notices/store/public/endpoints.js";

export const fetchGetNotices = async () => {
  const { data } = await API.get(NOTICES.GET_NOTICES);
  return data;
};

import { API } from "@/app/store/APIConfig.js";
import { NOTICES } from "@/domains/notices/store/public/endpoints.js";

export const fetchGetSiteNotices = async () => {
  const { data } = await API.get(NOTICES.GET_SITE_NOTICES);
  return data;
};

export const fetchGetOfficialNotices = async () => {
  const { data } = await API.get(NOTICES.GET_OFFICIAL_NOTICES);
  return data;
};

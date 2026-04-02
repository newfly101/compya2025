import { API } from "@/app/store/APIConfig.js";
import { KBO } from "@/domains/kbo/store/public/endpoints.js";

export const fetchTodayMatches = async () => {
  const { data } = await API.get(KBO.GET_TODAY_MATCHES);
  return data;
};

export const fetchMatchDetail = async (matchId) => {
  const { data } = await API.get(KBO.GET_MATCH_DETAIL(matchId));
  return data;
};

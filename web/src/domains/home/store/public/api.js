import { API } from "@/infra/http/client.js";
import { HOME } from "@/domains/home/store/public/endpoints.js";

export const fetchGetHome = async () => {
  const { data } = await API.get(HOME.GET_HOME);
  return data;
};

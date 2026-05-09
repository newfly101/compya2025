import { API } from "@/infra/http/client.js";
import { EVENTS } from "@/domains/events/store/public/endpoints.js";

export const fetchGetUserExternalEvent = async () => {
  const { data } = await API.get(`${EVENTS.GET_EVENTS}`);
  return data;
};

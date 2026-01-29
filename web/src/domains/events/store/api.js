import { API } from "@/store/api/APIConfig.js";
import { EVENTS } from "@/domains/events/store/endpoints.js";

/**
 * EVENTS API
 */

export const fetchGetExternalEventList = async () => {
  const { data } = await API.get(`${EVENTS.GET_EVENTS}`);
  return data;
}

export const fetchInsertNewEvent = async (event) => {
  const { data } = await API.post(`${EVENTS.SET_NEW_EVENT}`, event);
  return data;
}
export const fetchUpdateExternalEvent = async (id, event) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_EVENT(id)}`, event);
  return data;
}
export const fetchUpdateExternalEventVisible = async (id, visible) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_VISIBLE(id)}`, { visible });
  return data;
}

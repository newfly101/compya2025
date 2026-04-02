import { API } from "@/app/store/APIConfig.js";
import { EVENTS } from "@/domains/events/store/admin/endpoints.js";

/**
 * EVENTS API
 */

export const fetchAdminExEventList = async () => {
  const { data } = await API.get(`${EVENTS.GET_EVENTS}`);
  return data;
};

export const fetchAdminInsertExEvent = async (event) => {
  const { data } = await API.post(`${EVENTS.SET_NEW_EVENT}`, event);
  return data;
};
export const fetchAdminUpdateExEvent = async (id, event) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_EVENT(id)}`, event);
  return data;
};
export const fetchAdminUpdateExVisible = async (id, visible) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_VISIBLE(id)}`, { visible });
  return data;
};
export const fetchUploadEventImageFile = async (file) => {
  const { data } = await API.post(`${EVENTS.UPLOAD_EVENT_IMAGE}`, file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

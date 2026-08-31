import { API } from "@/infra/http/client.js";
import { EVENTS } from "@/domains/events/store/admin/endpoints.js";

/**
 * EVENTS API
 */

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchAdminExEventList = async () => {
  const { data } = await API.get(`${EVENTS.GET_EVENTS}`);
  return data.data;
};

export const fetchAdminInsertExEvent = async (event) => {
  const { data } = await API.post(`${EVENTS.SET_NEW_EVENT}`, event);
  return data.data;
};
export const fetchAdminUpdateExEvent = async (id, event) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_EVENT(id)}`, event);
  return data.data;
};
export const fetchAdminUpdateExVisible = async (id, visible) => {
  const { data } = await API.patch(`${EVENTS.SET_UPDATE_VISIBLE(id)}`, { visible });
  return data.data;
};
export const fetchUploadEventImageFile = async (file) => {
  const { data } = await API.post(`${EVENTS.UPLOAD_EVENT_IMAGE}`, file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
export const fetchAdminAllEventList = async ({ page = 0, size = 20, eventType, visible } = {}) => {
  const { data } = await API.get(`${EVENTS.GET_ALL_EVENTS}`, {
    params: { page, size, eventType, visible },
  });
  return data.data;
};
export const fetchAdminDeleteEvent = async (id) => {
  const { data } = await API.delete(`${EVENTS.DELETE_EVENT(id)}`);
  return data.data;
};

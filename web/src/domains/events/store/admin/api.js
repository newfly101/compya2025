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

// v2 일괄 삭제·숨김 — 응답 data: { successIds: number[], failedIds: number[] }. 200 이어도
// failedIds 가 있을 수 있다(부분 실패) — 호출부가 반드시 확인해야 한다.
export const fetchAdminBulkDeleteEvents = async (ids) => {
  const { data } = await API.delete(`${EVENTS.BULK_DELETE_EVENTS}`, { data: { ids } });
  return data.data;
};
export const fetchAdminBulkUpdateEventsVisible = async (ids, visible) => {
  const { data } = await API.patch(`${EVENTS.BULK_UPDATE_EVENTS_VISIBLE}`, { ids, visible });
  return data.data;
};

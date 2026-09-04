import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminExEventList,
  fetchAdminInsertExEvent,
  fetchAdminUpdateExEvent, fetchAdminUpdateExVisible,
  fetchAdminAllEventList, fetchAdminDeleteEvent,
  fetchAdminBulkDeleteEvents, fetchAdminBulkUpdateEventsVisible,
} from "@/domains/events/store/admin/api.js";
import { ADMIN_EVENT_ACTIONS } from "@/domains/events/store/admin/endpoints.js";
import { baseEventDTO } from "@/domains/events/store/dto.js";
import { requestUploadImage } from "@/infra/api/uploads/index.js";

export const requestAdminGetExEventList = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.GET_EVENT_LISTS, async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminExEventList();

      return [...list].reverse();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });


export const requestAdminInsertNewExEvent = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.CREATE, async (newEvent, { rejectWithValue }) => {
    try {
      const { id:eventId, ...options } = await fetchAdminInsertExEvent(baseEventDTO(newEvent));

      return {
        ...newEvent,
        id: eventId,
        options
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestAdminUpdateExEvent = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.UPDATE, async ({ id, ...event }, { rejectWithValue }) => {
    try {
      const { id:eventId, ...options } = await fetchAdminUpdateExEvent(id, baseEventDTO(event));

      return {
        ...event,
        id: eventId,
        options
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestAdminUpdateExEventVisible = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.UPDATE_VISIBLE, async ({ id, visible }, { rejectWithValue }) => {
    try {
      // visible 토글 응답의 data 는 Void(null) — 응답에서 id 를 꺼내지 않고 요청 param 을 그대로 사용.
      await fetchAdminUpdateExVisible(id, visible);
      return {
        id,
        visible,
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  });

export const requestAdminUploadEventImage = (file) => {
  return requestUploadImage({
    file,
    directory: "events"
  });
};

export const EVENTS_ADMIN_PAGE_SIZE = 20;

export const requestAdminGetAllEventList = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.GET_ALL_LISTS,
  async ({ page = 0, size = EVENTS_ADMIN_PAGE_SIZE } = {}, { rejectWithValue }) => {
    try {
      // BE 는 created_at DESC(최신순)로 내려준다. 페이지를 이어붙여야 하므로 뒤집지 않는다.
      const list = await fetchAdminAllEventList({ page, size });
      return list;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestAdminDeleteEvent = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.DELETE, async (id, { rejectWithValue }) => {
    try {
      await fetchAdminDeleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// v2 일괄 삭제 — BE 응답 { successIds, failedIds } 를 그대로 반환한다. 응답 형태가 예상과
// 다를 때(둘 다 비어있는 등) 방어적으로 failedIds 기준 나머지를 successIds 로 보정한다.
export const requestAdminBulkDeleteEvents = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.BULK_DELETE, async (ids, { rejectWithValue }) => {
    try {
      const result = await fetchAdminBulkDeleteEvents(ids);
      const failedIds = result?.failedIds ?? [];
      const successIds = result?.successIds ?? ids.filter((id) => !failedIds.includes(id));
      return { successIds, failedIds };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// v2 일괄 노출 변경(주로 숨김) — BE 응답 { successIds, failedIds }.
export const requestAdminBulkUpdateEventsVisible = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.BULK_UPDATE_VISIBLE, async ({ ids, visible }, { rejectWithValue }) => {
    try {
      const result = await fetchAdminBulkUpdateEventsVisible(ids, visible);
      const failedIds = result?.failedIds ?? [];
      const successIds = result?.successIds ?? ids.filter((id) => !failedIds.includes(id));
      return { successIds, failedIds, visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

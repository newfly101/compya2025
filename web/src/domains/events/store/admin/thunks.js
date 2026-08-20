import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAdminExEventList,
  fetchAdminInsertExEvent,
  fetchAdminUpdateExEvent, fetchAdminUpdateExVisible,
  fetchAdminAllEventList, fetchAdminDeleteEvent,
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

export const requestAdminGetAllEventList = createAsyncThunk(
  ADMIN_EVENT_ACTIONS.GET_ALL_LISTS, async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminAllEventList();
      return [...list].reverse();
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

import { createAsyncThunk } from "@reduxjs/toolkit";
import { EVENT_ACTIONS } from "@/domains/events/store/public/endpoints.js";
import { fetchGetUserExternalEvent, fetchGetUserEventDetail } from "@/domains/events/store/public/api.js";

export const requestGetExternalEventList = createAsyncThunk(
  EVENT_ACTIONS.GET_EVENT_LISTS, async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetUserExternalEvent();

      return [...data]
        .filter(event => event.visible)
        .sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().events.publicLoading },
);

// 없는·비공개 이벤트(404)는 오류가 아니라 null 로 돌려 화면이 "없음"과 "오류(재시도)"를 가르게 한다.
export const requestGetEventDetail = createAsyncThunk(
  EVENT_ACTIONS.GET_EVENT_DETAIL, async (id, { rejectWithValue }) => {
    try {
      return await fetchGetUserEventDetail(id);
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(error.message);
    }
  },
);

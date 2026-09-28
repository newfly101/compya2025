import { createAsyncThunk } from "@reduxjs/toolkit";
import { EVENT_ACTIONS } from "@/domains/events/store/public/endpoints.js";
import { fetchGetUserExternalEvent } from "@/domains/events/store/public/api.js";

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

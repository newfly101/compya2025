import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetExternalEventList,
  requestInsertNewEvent,
  requestUpdateExternalEvent, requestUpdateExternalEventVisible,
} from "@/domains/events/store/thunks.js";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";

const initialState = {
  events: [],
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: "events",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===============================
     * 외부 이벤트 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetExternalEventList, (state, action) => {
      state.events = action.payload.events;
    });
    /* ===============================
     * 이벤트 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestInsertNewEvent, (state, action) => {
      state.events.push(action.payload);
    });
    /* ===============================
     * 이벤트 수정
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateExternalEvent, (state, action) => {
      const updated = action.payload;
      const index = state.events.findIndex(e => e.id === updated.id);

      if (index !== -1) {
        state.events[index] = {
          ...state.events[index],
          ...updated,
        };
      }
    });
    /* ===============================
     * visible 토글
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateExternalEventVisible, (state, action) => {
      const updated = action.payload;
      const index = state.events.findIndex(e => e.id === updated.id);

      if (index !== -1) {
        state.events[index].visible = updated.visible;
      }
    });
  },
});
export const {} = eventsSlice.actions;
export default eventsSlice.reducer;

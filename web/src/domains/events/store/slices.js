import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";
import {
  requestAdminGetExEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent, requestAdminUpdateExEventVisible,
} from "@/domains/events/store/admin/thunks.js";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";

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
      state.events = action.payload;
    });

    applyAsyncHandlers(builder, requestAdminGetExEventList, (state, action) => {
      state.events = action.payload;
    });
    /* ===============================
     * 이벤트 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestAdminInsertNewExEvent, (state, action) => {
      state.events.unshift(action.payload);
    });
    /* ===============================
     * 이벤트 수정
     * =============================== */
    applyAsyncHandlers(builder, requestAdminUpdateExEvent, (state, action) => {
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
     * 이벤트 visible 변경
     * =============================== */
    applyAsyncHandlers(builder, requestAdminUpdateExEventVisible, (state, action) => {
      const updated = action.payload;

      state.events = state.events.map(e =>
        Number(e.id) === Number(updated.id)
          ? { ...e, visible: updated.visible }
          : e
      );
    });
  },
});
export const {} = eventsSlice.actions;
export default eventsSlice.reducer;

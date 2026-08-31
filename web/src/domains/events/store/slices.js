import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminGetExEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent, requestAdminUpdateExEventVisible,
  requestAdminGetAllEventList, requestAdminDeleteEvent,
} from "@/domains/events/store/admin/thunks.js";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";

const initialState = {
  events: [],
  loading: false,
  error: null,
  page: 0,
  hasMore: false,
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
    /* ===============================
     * 전체 이벤트 목록 조회 (admin) — 더 보기 페이지네이션
     * =============================== */
    applyAsyncHandlers(builder, requestAdminGetAllEventList, (state, action) => {
      const { page = 0, size = 20 } = action.meta.arg ?? {};

      state.events = page === 0 ? action.payload : [...state.events, ...action.payload];
      state.page = page;
      state.hasMore = action.payload.length === size;
    });
    /* ===============================
     * 이벤트 삭제
     * =============================== */
    applyAsyncHandlers(builder, requestAdminDeleteEvent, (state, action) => {
      state.events = state.events.filter(e => Number(e.id) !== Number(action.payload));
    });
  },
});
export const {} = eventsSlice.actions;
export default eventsSlice.reducer;

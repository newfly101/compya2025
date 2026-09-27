import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent, requestAdminUpdateExEventVisible,
  requestAdminGetAllEventList,
  requestAdminBulkDeleteEvents, requestAdminBulkUpdateEventsVisible,
} from "@/domains/events/store/admin/thunks.js";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";

// events = 관리자 목록(숨김 포함) / publicEvents = 공개 목록.
// 한 칸을 같이 쓰면 관리자 화면을 본 뒤 공개 화면으로 이동할 때 관리자 목록이 그대로
// 공개 화면 재료가 되고, 관리자 저장 실패 문구가 공개 화면 오류로 새어 나간다.
//
// 로딩·오류 칸도 셋으로 나눈다(규칙: app/store/utils/applyAsyncHandlers.js).
//   loading/error             → 관리자 목록 조회 전용
//   publicLoading/publicError → 공개 목록 조회 전용
//   mutateLoading/mutateError → 등록·수정·노출변경·삭제·일괄 (쓰기)
const initialState = {
  events: [],
  publicEvents: [],
  loading: false,
  error: null,
  publicLoading: false,
  publicError: null,
  mutateLoading: false,
  mutateError: null,
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
      state.publicEvents = action.payload;
    }, "public");

    /* ===============================
     * 이벤트 신규 생성
     * =============================== */
    applyAsyncHandlers(builder, requestAdminInsertNewExEvent, (state, action) => {
      state.events.unshift(action.payload);
    }, "mutate");
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
    }, "mutate");
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
    }, "mutate");
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
     * 이벤트 일괄 삭제 (v2) — successIds 만 제거, failedIds 는 화면에 남는다
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkDeleteEvents, (state, action) => {
      const ids = new Set(action.payload.successIds.map(Number));
      state.events = state.events.filter(e => !ids.has(Number(e.id)));
    }, "mutate");
    /* ===============================
     * 이벤트 일괄 노출 변경 (v2) — successIds 만 반영
     * =============================== */
    applyAsyncHandlers(builder, requestAdminBulkUpdateEventsVisible, (state, action) => {
      const { successIds, visible } = action.payload;
      const idSet = new Set(successIds.map(Number));
      state.events = state.events.map(e =>
        idSet.has(Number(e.id)) ? { ...e, visible } : e
      );
    }, "mutate");
  },
});
export const {} = eventsSlice.actions;
export default eventsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetExternalEventList,
  requestInsertNewEvent,
  requestUpdateExternalEvent, requestUpdateExternalEventVisible,
} from "@/domains/admin/store/thunks.js";

const initialState  = {
  events: [],
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===============================
       * 외부 이벤트 목록 조회
       * =============================== */
      .addCase(requestGetExternalEventList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestGetExternalEventList.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(requestGetExternalEventList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===============================
       * 이벤트 신규 생성
       * =============================== */
      .addCase(requestInsertNewEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestInsertNewEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(requestInsertNewEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===============================
       * 이벤트 수정
       * =============================== */
      .addCase(requestUpdateExternalEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateExternalEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.events.findIndex(e => e.id === updated.id);

        if (index !== -1) {
          state.events[index] = updated;
        }
      })
      .addCase(requestUpdateExternalEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===============================
       * visible 토글
       * =============================== */
      .addCase(requestUpdateExternalEventVisible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateExternalEventVisible.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.events.findIndex(e => e.id === updated.id);

        if (index !== -1) {
          state.events[index].visible = updated.visible;
        }
      })
      .addCase(requestUpdateExternalEventVisible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
})

/**
 * export const {} = authSlice.actions;
 * {} 안에는 state를 저장하는 함수 reducer: {} 에 정의된 함수를 사용시 .jsx 에서 사용가능
 */
export const {  } = adminSlice.actions;
/**
 * extraReducers 에서 정의된 .addCase를 사용하기 위해서 주입용으로 내보내는 구문
 * /api/Store.jsx
 */
export default adminSlice.reducer;

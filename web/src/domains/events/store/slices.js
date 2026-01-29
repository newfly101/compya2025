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

const eventsSlice = createSlice({
  name: "events",
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
export const {  } = eventsSlice.actions;
export default eventsSlice.reducer;

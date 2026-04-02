import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";
import {
  requestGetTodayMatches,
  requestGetMatchDetail,
} from "@/domains/kbo/store/public/thunks.js";

const initialState = {
  todayMatches: [],
  selectedMatch: null,
  loading: false,
  error: null,
};

const kboSlice = createSlice({
  name: "kbo",
  initialState,
  reducers: {
    clearSelectedMatch(state) {
      state.selectedMatch = null;
    },
  },
  extraReducers: (builder) => {
    /* ===============================
     * 오늘의 경기 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetTodayMatches, (state, action) => {
      state.todayMatches = action.payload?.matches ?? [];
    });

    /* ===============================
     * 경기 상세 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetMatchDetail, (state, action) => {
      state.selectedMatch = action.payload;
    });
  },
});

export const { clearSelectedMatch } = kboSlice.actions;
export default kboSlice.reducer;

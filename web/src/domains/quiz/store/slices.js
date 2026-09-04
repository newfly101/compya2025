import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminQuizAll,
  requestAdminQuizCreate,
  requestAdminQuizUpdate,
  requestAdminQuizDelete,
  requestAdminQuizBulkDelete,
} from "@/domains/quiz/store/admin/thunks.js";
import { requestLatestQuizAnswer } from "@/domains/quiz/store/public/thunks.js";

const initialState = {
  quizAnswers: [],
  latest: null,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestLatestQuizAnswer, (state, action) => {
      state.latest = action.payload;
    });

    applyAsyncHandlers(builder, requestAdminQuizAll, (state, action) => {
      state.quizAnswers = action.payload;
    });

    applyAsyncHandlers(builder, requestAdminQuizCreate, (state, action) => {
      state.quizAnswers.unshift(action.payload);
    });

    applyAsyncHandlers(builder, requestAdminQuizUpdate, (state, action) => {
      const updated = action.payload;
      const index = state.quizAnswers.findIndex((q) => q.id === updated.id);
      if (index !== -1) {
        state.quizAnswers[index] = { ...state.quizAnswers[index], ...updated };
      }
    });

    applyAsyncHandlers(builder, requestAdminQuizDelete, (state, action) => {
      state.quizAnswers = state.quizAnswers.filter((q) => Number(q.id) !== Number(action.payload));
    });

    /* ===============================
     * 퀴즈 일괄 삭제 (v2) — 200 이어도 일부만 지워졌을 수 있어 successIds 만 반영한다.
     * =============================== */
    applyAsyncHandlers(builder, requestAdminQuizBulkDelete, (state, action) => {
      const successIds = new Set((action.payload?.successIds ?? []).map(Number));
      state.quizAnswers = state.quizAnswers.filter((q) => !successIds.has(Number(q.id)));
    });
  },
});

export default quizSlice.reducer;

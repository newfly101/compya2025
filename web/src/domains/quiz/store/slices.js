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

// 칸 이름 규칙: app/store/utils/applyAsyncHandlers.js
//   loading/error             → 어드민 목록 조회 전용
//   publicLoading/publicError → 공개 최신 정답 조회 전용
//   mutateLoading/mutateError → 등록·수정·삭제·일괄 (쓰기)
const initialState = {
  quizAnswers: [],
  latest: null,
  loading: false,
  error: null,
  publicLoading: false,
  publicError: null,
  mutateLoading: false,
  mutateError: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestLatestQuizAnswer, (state, action) => {
      state.latest = action.payload;
    }, "public");

    applyAsyncHandlers(builder, requestAdminQuizAll, (state, action) => {
      state.quizAnswers = action.payload;
    });

    applyAsyncHandlers(builder, requestAdminQuizCreate, (state, action) => {
      state.quizAnswers.unshift(action.payload);
    }, "mutate");

    applyAsyncHandlers(builder, requestAdminQuizUpdate, (state, action) => {
      const updated = action.payload;
      const index = state.quizAnswers.findIndex((q) => q.id === updated.id);
      if (index !== -1) {
        state.quizAnswers[index] = { ...state.quizAnswers[index], ...updated };
      }
    }, "mutate");

    applyAsyncHandlers(builder, requestAdminQuizDelete, (state, action) => {
      state.quizAnswers = state.quizAnswers.filter((q) => Number(q.id) !== Number(action.payload));
    }, "mutate");

    /* ===============================
     * 퀴즈 일괄 삭제 (v2) — 200 이어도 일부만 지워졌을 수 있어 successIds 만 반영한다.
     * =============================== */
    applyAsyncHandlers(builder, requestAdminQuizBulkDelete, (state, action) => {
      const successIds = new Set((action.payload?.successIds ?? []).map(Number));
      state.quizAnswers = state.quizAnswers.filter((q) => !successIds.has(Number(q.id)));
    }, "mutate");
  },
});

export default quizSlice.reducer;

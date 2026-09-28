import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminQuizAll,
  requestAdminQuizCreate,
  requestAdminQuizUpdate,
  requestAdminQuizBulkDelete,
} from "@/domains/quiz/store/admin/thunks.js";

// 칸 이름 규칙: app/store/utils/applyAsyncHandlers.js
//   loading/error             → 어드민 목록 조회 전용
//   mutateLoading/mutateError → 등록·수정·일괄삭제 (쓰기)
// 공개 화면은 홈(state.home.quiz)이 /home 응답으로 퀴즈를 받아 쓴다 — 이 슬라이스에 공개 칸은 없다.
const initialState = {
  quizAnswers: [],
  loading: false,
  error: null,
  mutateLoading: false,
  mutateError: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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

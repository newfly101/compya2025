import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminQuizAll,
  requestAdminQuizCreate,
  requestAdminQuizUpdate,
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
  },
});

export default quizSlice.reducer;

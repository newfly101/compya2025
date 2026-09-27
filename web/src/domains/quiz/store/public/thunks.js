import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLatestQuizAnswer } from "@/domains/quiz/store/public/api.js";

export const requestLatestQuizAnswer = createAsyncThunk(
  "GET/quiz/latest",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchLatestQuizAnswer();
      return data ?? null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().quiz.publicLoading },
);

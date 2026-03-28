import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLatestQuizAnswer } from "@/domains/quiz/store/public/api.js";

export const requestLatestQuizAnswer = createAsyncThunk(
  "GET/quiz-answers/latest",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchLatestQuizAnswer();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

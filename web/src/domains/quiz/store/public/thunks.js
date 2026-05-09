import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchLatestQuizAnswer } from "@/domains/quiz/store/public/api.js";

export const requestLatestQuizAnswer = createAsyncThunk(
  "GET/quiz/latest",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchLatestQuizAnswer();
      return data ?? null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

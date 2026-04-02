import { createAsyncThunk } from "@reduxjs/toolkit";
import { KBO_ACTIONS } from "@/domains/kbo/store/public/endpoints.js";
import { fetchTodayMatches, fetchMatchDetail } from "@/domains/kbo/store/public/api.js";

export const requestGetTodayMatches = createAsyncThunk(
  KBO_ACTIONS.GET_TODAY_MATCHES,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTodayMatches();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestGetMatchDetail = createAsyncThunk(
  KBO_ACTIONS.GET_MATCH_DETAIL,
  async (matchId, { rejectWithValue }) => {
    try {
      return await fetchMatchDetail(matchId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

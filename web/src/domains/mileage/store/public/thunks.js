import { createAsyncThunk } from "@reduxjs/toolkit";
import { MILEAGE_SNIPER_ACTIONS } from "@/domains/mileage/store/public/endpoints.js";
import { fetchGetSniperTargets } from "@/domains/mileage/store/public/api.js";

/** 응답을 그대로 저장한다 — 레전드 평점표가 cardId 로 직접 대조해 쓴다. */
export const requestGetSniperTargets = createAsyncThunk(
  MILEAGE_SNIPER_ACTIONS.GET_TARGET_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetSniperTargets();
      return data ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

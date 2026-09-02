import { createAsyncThunk } from "@reduxjs/toolkit";
import { HISTORY_ROUND_ACTIONS } from "@/domains/historyLegend/store/public/endpoints.js";
import { fetchGetHistoryRounds } from "@/domains/historyLegend/store/public/api.js";
import { toHistoryRoundModel } from "@/domains/historyLegend/config/historyLegend.js";

/** 응답을 화면 모델로 바꿔 저장한다 — 카드 표시 문자열 조립까지 여기서 끝낸다. */
export const requestGetHistoryRounds = createAsyncThunk(
  HISTORY_ROUND_ACTIONS.GET_ROUND_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetHistoryRounds();
      return (data ?? []).map(toHistoryRoundModel);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

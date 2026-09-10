import { createAsyncThunk } from "@reduxjs/toolkit";
import { PLAYER_CARD_ACTIONS } from "@/domains/players/store/endpoints.js";
import { fetchGetPlayerCards } from "@/domains/players/store/api.js";
import { toScreenPlayer } from "@/domains/players/store/adapter.js";

// 11,668건 전량 — 이미 불러왔거나 요청 중이면 재요청하지 않는다(용량이 커서 특히 중요).
export const requestGetPlayerCards = createAsyncThunk(
  PLAYER_CARD_ACTIONS.GET_ALL,
  async (_, { rejectWithValue }) => {
    try {
      const list = await fetchGetPlayerCards();
      return (list ?? []).map(toScreenPlayer);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().players;
      return !state.loaded && !state.loading;
    },
  },
);

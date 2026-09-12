import { createAsyncThunk } from "@reduxjs/toolkit";
import { PLAYER_CARD_ACTIONS } from "@/domains/players/store/endpoints.js";
import { fetchGetPlayerCards, fetchGetPlayerStats } from "@/domains/players/store/api.js";
import { toScreenPlayer } from "@/domains/players/store/adapter.js";
import { toScreenStatRow } from "@/domains/players/store/statsAdapter.js";

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
      const state = getState().players.cards;
      return !state.loaded && !state.loading;
    },
  },
);

// 리스트형 표 전용 — 구단 하나만 캐시한다(동시에 두 구단을 보여줄 화면이 없다).
// 팀을 바꾸면 캐시된 teamCode 와 달라져 조건을 통과, 자동으로 다시 받아온다.
export const requestGetPlayerStats = createAsyncThunk(
  PLAYER_CARD_ACTIONS.GET_STATS,
  async (teamCode, { rejectWithValue }) => {
    try {
      const list = await fetchGetPlayerStats(teamCode);
      return { teamCode, items: (list ?? []).map((row) => toScreenStatRow(row, teamCode)) };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (teamCode, { getState }) => {
      const state = getState().players.stats;
      if (state.teamCode !== teamCode) return true;
      return !state.loaded && !state.loading;
    },
  },
);

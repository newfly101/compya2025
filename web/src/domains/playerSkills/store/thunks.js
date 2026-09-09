import { createAsyncThunk } from "@reduxjs/toolkit";
import { PLAYER_SKILL_ACTIONS } from "@/domains/playerSkills/store/endpoints.js";
import { fetchGetHitterSkills, fetchGetPitcherSkills } from "@/domains/playerSkills/store/api.js";
import { toScreenSkill } from "@/domains/playerSkills/store/adapter.js";

// 46개 전량 — 필터/정렬은 화면이 하므로 조건 파라미터가 없다.
// condition 으로 이미 불러온 role 은 재요청을 막는다(과도한 재조회 방지).
export const requestGetHitterSkills = createAsyncThunk(
  PLAYER_SKILL_ACTIONS.GET_HITTER_SKILLS,
  async (_, { rejectWithValue }) => {
    try {
      const list = await fetchGetHitterSkills();
      return (list ?? []).map(toScreenSkill);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().playerSkills.hitters;
      return state.items.length === 0 && !state.loading;
    },
  },
);

export const requestGetPitcherSkills = createAsyncThunk(
  PLAYER_SKILL_ACTIONS.GET_PITCHER_SKILLS,
  async (_, { rejectWithValue }) => {
    try {
      const list = await fetchGetPitcherSkills();
      return (list ?? []).map(toScreenSkill);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState().playerSkills.pitchers;
      return state.items.length === 0 && !state.loading;
    },
  },
);

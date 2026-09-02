import { createAsyncThunk } from "@reduxjs/toolkit";
import { LEGEND_STAT_ACTIONS } from "@/domains/legendStats/store/public/endpoints.js";
import {
  fetchGetLegendMaterials,
  fetchGetLegendStats,
  fetchGetPitchTypes,
  fetchGetTeams,
} from "@/domains/legendStats/store/public/api.js";
import {
  buildPitchNameByCode,
  buildTeamNameByCode,
} from "@/domains/legendStats/config/legendStats.js";

/** 스탯은 응답 그대로 저장한다. lookup 두 개와 도착 시점이 달라 조립은 훅에서 한다. */
export const requestGetLegendStats = createAsyncThunk(
  LEGEND_STAT_ACTIONS.GET_STAT_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetLegendStats();
      return data ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestGetPitchTypes = createAsyncThunk(
  LEGEND_STAT_ACTIONS.GET_PITCH_TYPE_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetPitchTypes();
      return buildPitchNameByCode(data ?? []);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/** 실패해도 표는 teamCode 를 그대로 보여주며 동작해야 한다. */
export const requestGetTeams = createAsyncThunk(
  LEGEND_STAT_ACTIONS.GET_TEAM_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetTeams();
      return buildTeamNameByCode(data ?? []);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestGetLegendMaterials = createAsyncThunk(
  LEGEND_STAT_ACTIONS.GET_LEGEND_MATERIALS,
  async (legendId, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetLegendMaterials(legendId);
      return { legendId, detail: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 받은 레전드는 요청 자체를 내보내지 않는다
  { condition: (legendId, { getState }) => !getState().legendStat.materials.byId[legendId] },
);

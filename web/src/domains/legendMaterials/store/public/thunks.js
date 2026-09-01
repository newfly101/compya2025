import { createAsyncThunk } from "@reduxjs/toolkit";
import { LEGEND_MATERIAL_ACTIONS } from "@/domains/legendMaterials/store/public/endpoints.js";
import { fetchGetLegendsWithMaterials, fetchGetTeams } from "@/domains/legendMaterials/store/public/api.js";
import { toLegendModel, buildTeamNameByCode } from "@/domains/legendMaterials/config/legendMaterials.js";

export const requestGetLegendList = createAsyncThunk(
  LEGEND_MATERIAL_ACTIONS.GET_LEGEND_LIST, async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetLegendsWithMaterials();

      return (data ?? []).map(toLegendModel);

    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * 구단 한글명 조회 — legends 와 독립된 상태로 관리된다 (store/slices.js 참조).
 * 이 요청이 실패해도 legends 화면은 teamCode 를 그대로 표시하며 계속 동작해야 한다.
 */
export const requestGetTeams = createAsyncThunk(
  LEGEND_MATERIAL_ACTIONS.GET_TEAM_LIST, async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetTeams();

      return {
        teams: data ?? [],
        teamNameByCode: buildTeamNameByCode(data ?? []),
      };

    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

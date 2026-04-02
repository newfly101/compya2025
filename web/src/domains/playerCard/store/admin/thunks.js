import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_PLAYER_CARD_ACTIONS } from "@/domains/playerCard/store/admin/endpoints.js";
import { fetchAdminTeamList } from "@/domains/playerCard/store/admin/api.js";

export const requestAdminPlayerCardTeamLists = createAsyncThunk(
  ADMIN_PLAYER_CARD_ACTIONS.GET_TEAM_LISTS, async (_, { rejectWithValue }) => {
    try {
      const { items } = await fetchAdminTeamList();
      // console.log("requestAdminPlayerCardTeamLists: data >> ", items);

      return items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

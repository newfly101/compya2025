import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import { fetchGetAllBoardLists } from "@/domains/community/store/api.js";

export const requestGetAllBoardLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const data = await fetchGetAllBoardLists();
      console.log(`requestGetAllBoardLists : `, data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

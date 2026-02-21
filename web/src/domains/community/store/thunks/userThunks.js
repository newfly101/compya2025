import { createAsyncThunk } from "@reduxjs/toolkit";
import { USER_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import { fetchGetUserBoardLists, fetchGetUserPostListsByBoardId } from "@/domains/community/store/api.js";

export const requestGetUserBoardLists = createAsyncThunk(
  USER_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { rejectWithValue }) => {
    try {
      const { items: boards } = await fetchGetUserBoardLists();
      console.log(`requestGetUserBoardLists : `, boards);

      return boards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestGetUserPostListsByBoardId = createAsyncThunk(
  USER_COMMUNITY_ACTIONS.POST_LIST, async (boardId, { rejectWithValue }) => {
    try {
      const { items: posts } = await fetchGetUserPostListsByBoardId(boardId);
      // console.log(`requestGetUserPostListsByBoardId : `, posts);

      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

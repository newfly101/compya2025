import { createAsyncThunk } from "@reduxjs/toolkit";
import { USER_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import { fetchGetUserBoardLists, fetchGetUserPostListsByBoardId } from "@/domains/community/store/api.js";

// BoardController 는 GlobalResponse({ success, code, data }) 로 감싸서 응답한다.
export const requestGetUserBoardLists = createAsyncThunk(
  USER_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { rejectWithValue }) => {
    try {
      const response = await fetchGetUserBoardLists();
      return response?.data ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// PostController 는 GlobalResponse 래핑 없이 List<PostResponse> 를 그대로 응답한다.
export const requestGetUserPostListsByBoardId = createAsyncThunk(
  USER_COMMUNITY_ACTIONS.POST_LIST, async (boardId, { rejectWithValue }) => {
    try {
      const posts = await fetchGetUserPostListsByBoardId(boardId);
      return posts ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

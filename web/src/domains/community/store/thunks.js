import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllBoardLists, fetchGetAllPostLists,
  fetchInsertNewBoard, fetchInsertNewPost,
  fetchUpdateBoard, fetchUpdatePost,
} from "@/domains/community/store/api.js";
import { createBoardDTO } from "@/domains/community/store/dto.js";

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

export const requestInsertNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_BOARD, async (form, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, boardId } = await fetchInsertNewBoard(createBoardDTO(form));
      console.log(`requestInsertNewBoard: `, boardId);

      return {
        boards: {
          id: boardId,
          ...form,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_BOARD, async ({ id, form }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, boardId } = await fetchUpdateBoard({ id: id, board: createBoardDTO(form) });
      console.log(`requestUpdateNewBoard: `, boardId);

      return {
        id: boardId,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestGetAllPostLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.POST_LIST, async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const { posts } = await fetchGetAllPostLists();
      console.log(`requestGetAllPostLists : `, posts);

      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewPost = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_POST, async (form, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, postId } = await fetchInsertNewPost(form);
      console.log(`requestInsertNewPost: `, postId);

      return {
        posts: {
          id: postId,
          ...form,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewPost = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_POST, async ({ id, form }, { dispatch, getState, rejectWithValue }) => {
    try {
      const { success, message, postId } = await fetchUpdatePost({ id: id, posts: form });
      console.log(`requestUpdateNewPost: `, postId);

      return {
        id: postId,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

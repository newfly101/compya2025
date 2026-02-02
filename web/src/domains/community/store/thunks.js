import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllBoardLists, fetchGetAllPostLists, fetchGetAllTags,
  fetchInsertNewBoard, fetchInsertNewPost, fetchInsertNewTag,
  fetchUpdateBoard, fetchUpdatePost, fetchUpdateTag,
} from "@/domains/community/store/api.js";
import { createBoardDTO } from "@/domains/community/store/dto.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const requestGetAllBoardLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.BOARD_LIST, async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetAllBoardLists();
      console.log(`requestGetAllBoardLists : `, data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewBoard = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_BOARD, async (form, { rejectWithValue }) => {
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
  ADMIN_COMMUNITY_ACTIONS.UPDATE_BOARD, async ({ id, form }, { rejectWithValue }) => {
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
  ADMIN_COMMUNITY_ACTIONS.POST_LIST, async (_, { rejectWithValue }) => {
    try {
      const { posts } = await fetchGetAllPostLists();
      console.log(`requestGetAllPostLists : `, posts);

      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewPost = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_POST, async (form, { rejectWithValue }) => {
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
  ADMIN_COMMUNITY_ACTIONS.UPDATE_POST, async ({ id, form }, { rejectWithValue }) => {
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

// TAG

export const requestGetAllTagLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.TAG_LIST, async (_, { rejectWithValue }) => {
    try {
      const { tags } = await fetchGetAllTags();
      console.log(`requestGetAllTagLists : `, tags);

      return tags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewTag = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_TAG, async (form, { rejectWithValue }) => {
    try {
      const { success, message, tagId } = await fetchInsertNewTag(form);
      console.log(`requestInsertNewTag: `, tagId);
      const now = formatNow();

      return {
        tags: {
          id: tagId,
          createdAt: now,
          updatedAt: now,
          ...form,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewTag = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_TAG, async ({ id, form }, { rejectWithValue }) => {
    try {
      const { success, message, tagId } = await fetchUpdateTag({ id: id, tags: form });
      console.log(`requestUpdateNewTag: `, tagId);

      return {
        id: tagId,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

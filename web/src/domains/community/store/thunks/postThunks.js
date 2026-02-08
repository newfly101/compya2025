import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS, USER_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllPostLists, fetchGetAllTags, fetchGetUserBoardLists, fetchGetUserPostListsByBoardId, fetchInsertNewPost, fetchInsertNewTag, fetchUpdatePost, fetchUpdateTag,
} from "@/domains/community/store/api.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const requestGetAllPostLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.POST_LIST, async (_, { rejectWithValue }) => {
    try {
      const { items: posts } = await fetchGetAllPostLists();
      console.log(`requestGetAllPostLists : `, posts);

      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewPost = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_POST, async (form, { getState, rejectWithValue }) => {

    try {
      const state = getState(); // 1회만 호출
      const { user, role } = state.auth;

      const payload = {
        ...form,
        authorId: user.id,
        authorType: role.role,
        authorName: role.role === "ADMIN" ? "관리자" : user.nickName,
      };

      const { success, message, id } = await fetchInsertNewPost(payload);
      // console.log(`requestInsertNewPost: `, postId);

      return {
        posts: {
          id,
          ...payload,
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
      const { success, message, id } = await fetchUpdatePost({ id: id, posts: form });
      // console.log(`requestUpdateNewPost: `, postId);

      return {
        id,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

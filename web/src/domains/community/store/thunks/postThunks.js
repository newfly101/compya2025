import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import { fetchGetAllPostLists, fetchInsertNewPost, fetchUpdatePost } from "@/domains/community/store/index.js";

export const requestGetAllPostLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.POST_LIST, async (_, { rejectWithValue }) => {
    try {
      const { items: posts } = await fetchGetAllPostLists();
      
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

      const { id, ...options } = await fetchInsertNewPost(payload);

      return {
        posts: { id, ...payload },
        options,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewPost = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_POST, async ({ id: postId, form }, { rejectWithValue }) => {
    try {
      const { id, ...options } = await fetchUpdatePost({ id: postId, posts: form });

      return {
        posts: { id, ...form },
        options,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

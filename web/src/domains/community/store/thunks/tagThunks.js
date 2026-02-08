import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_COMMUNITY_ACTIONS } from "@/domains/community/store/endpoints.js";
import {
  fetchGetAllTags, fetchInsertNewTag, fetchUpdateTag,
} from "@/domains/community/store/api.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const requestGetAllTagLists = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.TAG_LIST, async (_, { rejectWithValue }) => {
    try {
      const { items: tags } = await fetchGetAllTags();

      return tags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewTag = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_TAG, async (form, { rejectWithValue }) => {
    try {
      const { id, ...options } = await fetchInsertNewTag(form);


      const now = formatNow();

      return {
        tags: {
          id,
          createdAt: now,
          updatedAt: now,
          ...form,
        },
        options
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const requestUpdateNewTag = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.UPDATE_TAG, async ({ id:tagId, form }, { rejectWithValue }) => {
    try {
      const { id, ...options } = await fetchUpdateTag({ id: tagId, tags: form });

      return {
        tags: {id, ...form},
        options
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

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
      // console.log(`requestGetAllTagLists : `, tags);

      return tags;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestInsertNewTag = createAsyncThunk(
  ADMIN_COMMUNITY_ACTIONS.CREATE_TAG, async (form, { rejectWithValue }) => {
    try {
      const { success, message, id } = await fetchInsertNewTag(form);
      // console.log(`requestInsertNewTag: `, tagId);
      const now = formatNow();

      return {
        tags: {
          id,
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
      const { success, message, id } = await fetchUpdateTag({ id: id, tags: form });
      // console.log(`requestUpdateNewTag: `, tagId);

      return {
        id,
        ...form,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

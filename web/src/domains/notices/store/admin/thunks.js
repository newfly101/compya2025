import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_NOTICE_ACTIONS } from "@/domains/notices/store/admin/endpoints.js";
import {
  fetchAdminGetNoticeList,
  fetchAdminInsertNotice,
  fetchAdminUpdateNotice,
  fetchAdminUpdateVisible,
} from "@/domains/notices/store/admin/api.js";

export const requestAdminGetNoticeList = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.GET_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchAdminGetNoticeList();
      return [...data].reverse();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminInsertNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.INSERT,
  async (notice, { rejectWithValue }) => {
    try {
      const { data } = await fetchAdminInsertNotice(notice);
      return { id: data.id, ...notice };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE,
  async (notice, { rejectWithValue }) => {
    try {
      const { data } = await fetchAdminUpdateNotice(notice);
      return { id: data.id, ...notice };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNoticeVisible = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE_VISIBLE,
  async ({ id, visible }, { rejectWithValue }) => {
    try {
      const { data } = await fetchAdminUpdateVisible({ id, visible });
      return { id: data.id, isVisible: data.isVisible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

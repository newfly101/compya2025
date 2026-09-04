import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_NOTICE_ACTIONS } from "@/domains/notices/store/admin/endpoints.js";
import {
  fetchAdminGetNoticeList,
  fetchAdminInsertNotice,
  fetchAdminUpdateNotice,
  fetchAdminUpdateVisible,
  fetchAdminUpdatePinned,
  fetchAdminDeleteNotice,
} from "@/domains/notices/store/admin/api.js";

export const requestAdminGetNoticeList = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.GET_LIST,
  async (_, { rejectWithValue }) => {
    try {
      const list = await fetchAdminGetNoticeList();
      return [...list].reverse();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminInsertNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.INSERT,
  async (notice, { rejectWithValue }) => {
    try {
      const created = await fetchAdminInsertNotice(notice);
      return { ...notice, id: created.id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE,
  async ({ id, ...notice }, { rejectWithValue }) => {
    try {
      await fetchAdminUpdateNotice(id, notice);
      return { id, ...notice };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNoticeVisible = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE_VISIBLE,
  async ({ id, visible }, { rejectWithValue }) => {
    try {
      // visible 토글 응답의 data 는 Void(null) — 응답에서 id 를 꺼내지 않고 요청 param 을 그대로 사용.
      await fetchAdminUpdateVisible(id, visible);
      return { id, isVisible: visible };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminUpdateNoticePinned = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.UPDATE_PINNED,
  async ({ id, pinned }, { rejectWithValue }) => {
    try {
      // pinned 토글 응답도 Void(null) — visible 토글과 동일 패턴.
      await fetchAdminUpdatePinned(id, pinned);
      return { id, isPinned: pinned };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminDeleteNotice = createAsyncThunk(
  ADMIN_NOTICE_ACTIONS.DELETE,
  async (id, { rejectWithValue }) => {
    try {
      await fetchAdminDeleteNotice(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

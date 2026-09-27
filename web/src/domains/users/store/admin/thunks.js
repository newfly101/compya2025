import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_USER_ACTIONS } from "@/domains/users/store/admin/endpoints.js";
import {
  fetchAdminUserList,
  fetchAdminUserDetail,
  fetchAdminPatchRole,
  fetchAdminPatchStatus,
} from "@/domains/users/store/admin/api.js";

export const requestAdminGetUserList = createAsyncThunk(
  ADMIN_USER_ACTIONS.GET_LIST,
  async (params, { rejectWithValue }) => {
    try {
      const list = await fetchAdminUserList(params);
      return list ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().adminUsers.loading },
);

export const requestAdminGetUserDetail = createAsyncThunk(
  ADMIN_USER_ACTIONS.GET_DETAIL,
  async (publicId, { rejectWithValue }) => {
    try {
      return await fetchAdminUserDetail(publicId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminPatchUserRole = createAsyncThunk(
  ADMIN_USER_ACTIONS.PATCH_ROLE,
  async ({ publicId, userRole }, { rejectWithValue }) => {
    try {
      await fetchAdminPatchRole(publicId, userRole);
      return { publicId, userRole };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminPatchUserStatus = createAsyncThunk(
  ADMIN_USER_ACTIONS.PATCH_STATUS,
  async ({ publicId, userStatus }, { rejectWithValue }) => {
    try {
      await fetchAdminPatchStatus(publicId, userStatus);
      return { publicId, userStatus };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

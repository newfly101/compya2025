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
  }
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

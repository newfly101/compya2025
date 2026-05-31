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
      const { items } = await fetchAdminUserList(params);
      return items ?? [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminGetUserDetail = createAsyncThunk(
  ADMIN_USER_ACTIONS.GET_DETAIL,
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAdminUserDetail(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminPatchUserRole = createAsyncThunk(
  ADMIN_USER_ACTIONS.PATCH_ROLE,
  async ({ id, userRole }, { rejectWithValue }) => {
    try {
      await fetchAdminPatchRole(id, userRole);
      return { id, userRole };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestAdminPatchUserStatus = createAsyncThunk(
  ADMIN_USER_ACTIONS.PATCH_STATUS,
  async ({ id, userStatus }, { rejectWithValue }) => {
    try {
      await fetchAdminPatchStatus(id, userStatus);
      return { id, userStatus };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

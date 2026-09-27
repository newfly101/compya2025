import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_USER_ACTIONS } from "@/domains/users/store/admin/endpoints.js";
import {
  fetchAdminUserList,
  fetchAdminUserDetail,
  fetchAdminPatchRole,
  fetchAdminPatchStatus,
} from "@/domains/users/store/admin/api.js";

// 회원 관리 화면은 검색·필터·페이지 이동을 전부 화면에서 처리하고, 상단 배지도 받은 개수를 센다.
// 그래서 서버 기본 페이지(20)로 받으면 표와 배지가 함께 잘린다 — 호출부가 값을 주지 않으면 전량을 받는다.
// ponytail: 상한 1000. 회원이 그 수를 넘으면 총건수를 주는 API 가 필요하다(지금은 count 엔드포인트가 없다).
const LIST_ALL_PARAMS = { page: 0, size: 1000 };

export const requestAdminGetUserList = createAsyncThunk(
  ADMIN_USER_ACTIONS.GET_LIST,
  async (params = LIST_ALL_PARAMS, { rejectWithValue }) => {
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

import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminGetUserList,
  requestAdminGetUserDetail,
  requestAdminPatchUserRole,
  requestAdminPatchUserStatus,
} from "@/domains/users/store/admin/thunks.js";

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ── 유저 목록 조회 ──────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminGetUserList, (state, action) => {
      state.users = action.payload;
    });
    /* ── 유저 상세 조회 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminGetUserDetail, (state, action) => {
      state.selectedUser = action.payload;
    });
    /* ── 유저 역할 변경 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminPatchUserRole, (state, action) => {
      const { id, userRole } = action.payload;
      state.users = state.users.map((u) =>
        u.id === id ? { ...u, userRole } : u
      );
    });
    /* ── 유저 상태 변경 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminPatchUserStatus, (state, action) => {
      const { id, userStatus } = action.payload;
      state.users = state.users.map((u) =>
        u.id === id ? { ...u, userStatus } : u
      );
    });
  },
});

export const { actions } = adminUsersSlice;
export default adminUsersSlice.reducer;

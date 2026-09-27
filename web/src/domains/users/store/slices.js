import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestAdminGetUserList,
  requestAdminPatchUserRole,
  requestAdminPatchUserStatus,
} from "@/domains/users/store/admin/thunks.js";
import {
  requestGetMyInfo,
  requestUpdateMyNickname,
  requestUpdateMyProfileImage,
  requestDeleteMyAccount,
} from "@/domains/users/store/public/thunks.js";

// 칸 이름 규칙: app/store/utils/applyAsyncHandlers.js
//   loading/error             → 유저 목록 조회 전용
//   mutateLoading/mutateError → 역할·상태 변경 (쓰기)
const initialState = {
  users: [],
  loading: false,
  error: null,
  mutateLoading: false,
  mutateError: null,
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
    /* ── 유저 역할 변경 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminPatchUserRole, (state, action) => {
      const { publicId, userRole } = action.payload;
      state.users = state.users.map((u) =>
        u.publicId === publicId ? { ...u, userRole } : u
      );
    }, "mutate");
    /* ── 유저 상태 변경 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminPatchUserStatus, (state, action) => {
      const { publicId, userStatus } = action.payload;
      state.users = state.users.map((u) =>
        u.publicId === publicId ? { ...u, userStatus } : u
      );
    }, "mutate");
  },
});

export const { actions } = adminUsersSlice;
export default adminUsersSlice.reducer;

/* ── 마이페이지(본인 정보 조회/수정/탈퇴) ─────────────────────── */
// loading/error = 내 정보 조회 전용. 닉네임·프로필·탈퇴(쓰기)는 화면이 .unwrap() 으로
// 각자 처리하므로 조회 칸을 밟지 않게 mutate 칸으로 뺀다.
const initialMyPageState = {
  profile: null,
  loading: false,
  error: null,
  mutateLoading: false,
  mutateError: null,
};

const myPageSlice = createSlice({
  name: "myPage",
  initialState: initialMyPageState,
  reducers: {},
  extraReducers: (builder) => {
    /* ── 내 정보 조회 ───────────────────────────────────────── */
    applyAsyncHandlers(builder, requestGetMyInfo, (state, action) => {
      state.profile = action.payload;
    });
    /* ── 닉네임 수정 ────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestUpdateMyNickname, (state, action) => {
      state.profile = action.payload;
    }, "mutate");
    /* ── 프로필 이미지 수정(기본 이미지 복원 포함) ─────────────── */
    applyAsyncHandlers(builder, requestUpdateMyProfileImage, (state, action) => {
      state.profile = action.payload;
    }, "mutate");
    /* ── 회원 탈퇴 ──────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestDeleteMyAccount, (state) => {
      state.profile = null;
    }, "mutate");
  },
});

export const myPageActions = myPageSlice.actions;
export const myPageReducer = myPageSlice.reducer;

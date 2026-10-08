import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_GAMIFICATION_ACTIONS } from "@/domains/gamification/store/admin/endpoints.js";
import {
  fetchAdminGetUserTitles,
  fetchAdminGrantTitle,
  fetchAdminRevokeTitle,
  fetchAdminGrantEarlyAdopters,
} from "@/domains/gamification/store/admin/api.js";

const makeThunk = (type, fetcher) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fetcher(arg);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

// 인자 publicId. 응답 [{code,name,category,bonusPoint,owned,equipped,grantedAt}]
export const requestAdminGetUserTitles = makeThunk(ADMIN_GAMIFICATION_ACTIONS.GET_USER_TITLES, fetchAdminGetUserTitles);
// 인자 { publicId, code }. 지급/회수 뒤 화면이 목록을 다시 조회한다.
export const requestAdminGrantTitle = makeThunk(ADMIN_GAMIFICATION_ACTIONS.GRANT_TITLE, fetchAdminGrantTitle);
export const requestAdminRevokeTitle = makeThunk(ADMIN_GAMIFICATION_ACTIONS.REVOKE_TITLE, fetchAdminRevokeTitle);
// 인자 { dryRun }. 응답 { dryRun, founderCount, samplePublicIds }
export const requestAdminGrantEarlyAdopters = makeThunk(
  ADMIN_GAMIFICATION_ACTIONS.GRANT_EARLY_ADOPTERS,
  fetchAdminGrantEarlyAdopters,
);

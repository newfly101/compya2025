import { createAsyncThunk } from "@reduxjs/toolkit";
import { USERS_ME_ACTIONS } from "@/domains/users/store/public/endpoints.js";
import { fetchMyInfo, patchMyNickname, deleteMyAccount } from "@/domains/users/store/public/api.js";

export const requestGetMyInfo = createAsyncThunk(
  USERS_ME_ACTIONS.GET,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMyInfo();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// nickname: string — trim/길이 검증은 화면(폼)에서 먼저 하고, 여기서는 그대로 전달한다.
export const requestUpdateMyNickname = createAsyncThunk(
  USERS_ME_ACTIONS.PATCH,
  async (nickname, { rejectWithValue }) => {
    try {
      return await patchMyNickname(nickname);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestDeleteMyAccount = createAsyncThunk(
  USERS_ME_ACTIONS.DELETE,
  async (_, { rejectWithValue }) => {
    try {
      await deleteMyAccount();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

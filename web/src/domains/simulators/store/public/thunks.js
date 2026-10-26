import { createAsyncThunk } from "@reduxjs/toolkit";
import { SIMULATOR_ACTIONS } from "@/domains/simulators/store/public/endpoints.js";
import { fetchDeleteGsb, fetchGetGsb, fetchPostGsbSave, fetchPutGsb } from "@/domains/simulators/store/public/api.js";

// 401 은 화면이 로그인 안내로 처리한다 — unauthorized 로 구분해 넘긴다
const failure = (error) => ({
  message: error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해 주세요.",
  unauthorized: error?.response?.status === 401,
});

export const requestGetGsb = createAsyncThunk(SIMULATOR_ACTIONS.GET_GSB, async (_, { rejectWithValue }) => {
  try {
    return (await fetchGetGsb())?.items ?? [];
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

/** items: [{ legendId, gsbCount, selCount, skillIds[3], skillTiers[3] }] — 바뀐 선수만 */
export const requestPutGsb = createAsyncThunk(SIMULATOR_ACTIONS.PUT_GSB, async (items, { rejectWithValue }) => {
  try {
    return await fetchPutGsb({ items });
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const requestDeleteGsb = createAsyncThunk(SIMULATOR_ACTIONS.DELETE_GSB, async (legendId, { rejectWithValue }) => {
  try {
    const result = await fetchDeleteGsb(legendId);
    return { legendId, ...result };
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

export const requestPostGsbSave = createAsyncThunk(SIMULATOR_ACTIONS.POST_GSB_SAVE, async (body, { rejectWithValue }) => {
  try {
    return await fetchPostGsbSave(body);
  } catch (error) {
    return rejectWithValue(failure(error));
  }
});

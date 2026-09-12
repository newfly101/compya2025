import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCacheSyncTargets,
  fetchCacheSyncOne,
  fetchCacheSyncAll,
} from "@/domains/admin/store/admin/api.js";
import { ADMIN_CACHE_SYNC_ACTIONS } from "@/domains/admin/store/admin/endpoints.js";

export const requestCacheSyncTargets = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.GET_TARGETS,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncTargets();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 단건 동기화 — 실패해도 어떤 대상(id)이 실패했는지 알아야 그 줄에만 이유를 보여줄 수 있다.
export const requestCacheSyncOne = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.SYNC_ONE,
  async (id, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncOne(id);
    } catch (error) {
      return rejectWithValue({ id, message: error.message });
    }
  }
);

// 전체 동기화 — 응답은 대상별 성공/실패가 섞인 배열. 요청 자체(네트워크/서버 오류)가
// 실패한 경우만 이 catch 로 들어온다.
export const requestCacheSyncAll = createAsyncThunk(
  ADMIN_CACHE_SYNC_ACTIONS.SYNC_ALL,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCacheSyncAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

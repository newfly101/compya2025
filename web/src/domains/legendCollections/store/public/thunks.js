import { createAsyncThunk } from "@reduxjs/toolkit";
import { LEGEND_COLLECTION_ACTIONS } from "@/domains/legendCollections/store/public/endpoints.js";
import {
  fetchGetLegendMaterials,
  fetchGetMyCollection,
  fetchGetSchedule,
  fetchPutAcquiredAt,
  fetchPutChanges,
  fetchPutPreferences,
} from "@/domains/legendCollections/store/public/api.js";
import { toMyCollection, toSchedule } from "@/domains/legendCollections/store/dto.js";

const failure = (error) => {
  const conflict = error?.response?.status === 409;
  return {
    message: error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해 주세요.",
    conflict,
    unauthorized: error?.response?.status === 401,
  };
};

export const requestGetMyCollection = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.GET_ME,
  async (_, { rejectWithValue }) => {
    try {
      return toMyCollection(await fetchGetMyCollection());
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

/** 서버 응답을 그대로 돌려준다. 저장 뒤 화면은 내 상태를 다시 조회해 채운다. */
export const requestPutChanges = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.PUT_CHANGES,
  async (body, { rejectWithValue }) => {
    try {
      return (await fetchPutChanges(body)) ?? {};
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

export const requestPutPreferences = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.PUT_PREFERENCES,
  async (body, { rejectWithValue }) => {
    try {
      return (await fetchPutPreferences(body)) ?? {};
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

/** arg: { legendId, frameAcquiredAt?, acquiredAt? } — 성공하면 슬라이스가 보낸 필드만 반영한다 */
export const requestPutAcquiredAt = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.PUT_ACQUIRED_AT,
  async ({ legendId, ...dates }, { rejectWithValue }) => {
    try {
      await fetchPutAcquiredAt(legendId, dates);
      return { legendId, ...dates };
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

export const requestGetSchedule = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.GET_SCHEDULE,
  async (_, { rejectWithValue }) => {
    try {
      return toSchedule(await fetchGetSchedule());
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

/** 재료 8칸(선수 6 + 코치 2) — 펼친 레전드만, 한 번 받은 레전드는 다시 받지 않는다 */
export const requestGetLegendMaterials = createAsyncThunk(
  LEGEND_COLLECTION_ACTIONS.GET_MATERIALS,
  async (legendId, { rejectWithValue }) => {
    try {
      return { legendId, detail: await fetchGetLegendMaterials(legendId) };
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
  {
    condition: (legendId, { getState }) => !getState().legendCollections.materials.byId[legendId],
  },
);

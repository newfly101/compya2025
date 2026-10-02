import { createAsyncThunk } from "@reduxjs/toolkit";
import { isRegistered } from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import { LEGEND_COLLECTION_SKILL_ACTIONS } from "@/domains/legendCollectionSkills/store/public/endpoints.js";
import { fetchGetSkillItems, fetchPostBatch, fetchPostEvent, fetchPutSlots } from "@/domains/legendCollectionSkills/store/public/api.js";

const failure = (error) => ({
  message: error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해 주세요.",
  conflict: error?.response?.status === 409,
  unauthorized: error?.response?.status === 401,
});

// 미등록(slots null 또는 칸 필드가 null)은 slots 를 null 로 통일 — 화면은 "slots 있음 = 등록" 하나로만 본다
// rev: 서버 응답을 받을 때마다 새 값 — 편집기가 key 로 써서 응답마다 로컬 상태(초안·선택)를 서버 기준으로 다시 만든다
let rev = 0;
const normalize = (item) => ({
  ...item,
  rev: ++rev,
  slots: isRegistered(item?.slots) ? item.slots : null,
  usage: item?.usage ?? { base: 0, gcg: 0, ggg: 0 },
  enhanceCount: item?.enhanceCount ?? 0,
});

export const requestGetSkillItems = createAsyncThunk(
  LEGEND_COLLECTION_SKILL_ACTIONS.GET_ALL,
  async (_, { rejectWithValue }) => {
    try {
      return ((await fetchGetSkillItems()) ?? []).map(normalize);
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

/** 등록(PUT) 뒤 전체 목록을 다시 받는다 — PUT 응답 모양에 기대지 않고 서버 값으로 채운다 */
export const requestPutSkillSlots = createAsyncThunk(
  LEGEND_COLLECTION_SKILL_ACTIONS.PUT_SLOTS,
  async ({ legendId, slots }, { rejectWithValue }) => {
    try {
      await fetchPutSlots(legendId, { slots });
      return ((await fetchGetSkillItems()) ?? []).map(normalize);
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

export const requestPostSkillEvent = createAsyncThunk(
  LEGEND_COLLECTION_SKILL_ACTIONS.POST_EVENT,
  async ({ legendId, action, slot }, { rejectWithValue }) => {
    try {
      return normalize(await fetchPostEvent(legendId, slot ? { action, slot } : { action }));
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

export const requestPostSkillBatch = createAsyncThunk(
  LEGEND_COLLECTION_SKILL_ACTIONS.POST_BATCH,
  async ({ legendId, actions }, { rejectWithValue }) => {
    try {
      return normalize(await fetchPostBatch(legendId, { actions }));
    } catch (error) {
      return rejectWithValue(failure(error));
    }
  },
);

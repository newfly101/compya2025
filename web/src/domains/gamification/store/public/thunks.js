import { createAsyncThunk } from "@reduxjs/toolkit";
import { GAMIFICATION_ACTIONS } from "@/domains/gamification/store/public/endpoints.js";
import {
  fetchCheckIn,
  fetchGetMyGamification,
  fetchEquipTitle,
  fetchGetLevels,
  fetchGetTitles,
  fetchGetHistory,
} from "@/domains/gamification/store/public/api.js";

const makeThunk = (type, fetcher) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fetcher(arg);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  });

export const requestCheckIn = makeThunk(GAMIFICATION_ACTIONS.CHECK_IN, fetchCheckIn);
export const requestGetMyGamification = makeThunk(GAMIFICATION_ACTIONS.GET_ME, fetchGetMyGamification);
// 서버가 갱신된 내 정보(me 전체)를 돌려준다 — 슬라이스가 그대로 me 로 교체한다. code=null 이면 대표 칭호 해제.
export const requestEquipTitle = makeThunk(GAMIFICATION_ACTIONS.EQUIP_TITLE, fetchEquipTitle);
export const requestGetLevels = makeThunk(GAMIFICATION_ACTIONS.GET_LEVELS, fetchGetLevels);
export const requestGetTitles = makeThunk(GAMIFICATION_ACTIONS.GET_TITLES, fetchGetTitles);
export const requestGetHistory = makeThunk(GAMIFICATION_ACTIONS.GET_HISTORY, fetchGetHistory);

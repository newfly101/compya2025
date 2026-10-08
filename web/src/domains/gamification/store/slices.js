import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestCheckIn,
  requestGetMyGamification,
  requestEquipTitle,
  requestGetLevels,
  requestGetTitles,
  requestGetHistory,
} from "@/domains/gamification/store/public/thunks.js";
import {
  requestAdminGetUserTitles,
  requestAdminGrantTitle,
  requestAdminRevokeTitle,
  requestAdminGrantEarlyAdopters,
} from "@/domains/gamification/store/admin/thunks.js";

const emptyTab = { items: [], page: -1, hasNext: false, loaded: false };
const emptyHistory = () => ({ XP: { ...emptyTab }, POINT: { ...emptyTab } });

const initialState = {
  me: null, // { xp, level, levelName, nextLevelXp, point, titles[], equippedCode, recent[] }
  loading: false,
  error: null,
  mutateLoading: false,
  mutateError: null,
  // levels · titleDefs 는 "detail" 칸 공유 — 등급·칭호 모달은 동시에 열리지 않는다.
  levels: [], // [{ level, name, requiredXp, bonusPoint }]
  titleDefs: [], // [{ code, name, category, condition, bonusPoint, owned, equipped }]
  detailLoading: false,
  detailError: null,
  history: emptyHistory(), // 탭별 { items, page, hasNext, loaded }
  publicLoading: false,
  publicError: null,
  adminUserTitles: [], // 관리자 유저 상세의 칭호 목록 [{ code, name, category, bonusPoint, owned, equipped, grantedAt }] — "detail" 칸 공유
  lastCheckIn: null, // { xp, point, level, levelName, leveledUp } — 토스트용, xp>0 일 때만
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    dismissCheckIn(state) {
      state.lastCheckIn = null;
    },
  },
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetMyGamification, (state, action) => {
      state.me = action.payload;
    });
    applyAsyncHandlers(builder, requestCheckIn, (state, action) => {
      if (action.payload?.xp > 0) {
        state.lastCheckIn = action.payload;
        state.history = emptyHistory();
      }
    }, "mutate");
    applyAsyncHandlers(builder, requestEquipTitle, (state, action) => {
      state.me = action.payload;
    }, "mutate");
    applyAsyncHandlers(builder, requestGetLevels, (state, action) => {
      state.levels = action.payload;
    }, "detail");
    applyAsyncHandlers(builder, requestGetTitles, (state, action) => {
      state.titleDefs = action.payload;
    }, "detail");
    applyAsyncHandlers(builder, requestGetHistory, (state, action) => {
      const { type, page, hasNext, items } = action.payload;
      const prev = state.history[type].items;
      state.history[type] = { items: page === 0 ? items : [...prev, ...items], page, hasNext, loaded: true };
    }, "public");
    applyAsyncHandlers(builder, requestAdminGetUserTitles, (state, action) => {
      state.adminUserTitles = action.payload ?? [];
    }, "detail");
    // 지급·회수·일괄 지급 결과는 호출 화면이 unwrap 으로 받는다 — 상태에 남길 값 없음. 칸만 관리.
    [requestAdminGrantTitle, requestAdminRevokeTitle, requestAdminGrantEarlyAdopters].forEach((t) =>
      applyAsyncHandlers(builder, t, () => {}, "mutate"));
  },
});

export const { dismissCheckIn } = gamificationSlice.actions;
export default gamificationSlice.reducer;

import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestGetLegendMaterials,
  requestGetMyCollection,
  requestGetSchedule,
  requestPutAcquiredAt,
  requestPutChanges,
  requestPutPreferences,
} from "@/domains/legendCollections/store/public/thunks.js";

// 내 기록 — 비로그인이면 요청하지 않으므로 loaded=false 가 "열람 전용" 이다
const meSlice = createSlice({
  name: "legendCollections/me",
  initialState: {
    version: null,
    legends: {},
    acquiredAt: {},
    frameAcquiredAt: {},
    materials: {},
    materialLegend: {},
    preferences: [],
    loaded: false,
    loading: false,
    error: null,
    mutateLoading: false,
    mutateError: null,
  },
  reducers: {
    reset: () => meSlice.getInitialState(),
  },
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetMyCollection, (state, action) => {
      Object.assign(state, action.payload, { loaded: true });
    });
    applyAsyncHandlers(builder, requestPutChanges, () => {}, "mutate");
    applyAsyncHandlers(builder, requestPutPreferences, () => {}, "mutate");
    applyAsyncHandlers(
      builder,
      requestPutAcquiredAt,
      (state, action) => {
        const { legendId } = action.payload;
        if ("acquiredAt" in action.payload) state.acquiredAt[legendId] = action.payload.acquiredAt;
        if ("frameAcquiredAt" in action.payload) state.frameAcquiredAt[legendId] = action.payload.frameAcquiredAt;
      },
      "mutate",
    );
  },
});

const scheduleSlice = createSlice({
  name: "legendCollections/schedule",
  initialState: { todayDayNo: null, items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetSchedule, (state, action) => {
      Object.assign(state, action.payload, { loaded: true });
    });
  },
});

const materialsSlice = createSlice({
  name: "legendCollections/materials",
  initialState: { byId: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetLegendMaterials, (state, action) => {
      state.byId[action.payload.legendId] = action.payload.detail;
    });
  },
});

export const actions = { resetMe: meSlice.actions.reset };

export const reducer = combineReducers({
  me: meSlice.reducer,
  schedule: scheduleSlice.reducer,
  materials: materialsSlice.reducer,
});

export default reducer;

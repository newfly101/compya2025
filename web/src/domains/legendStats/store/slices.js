import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestGetLegendMaterials,
  requestGetLegendStats,
  requestGetPitchTypes,
  requestGetTeams,
} from "@/domains/legendStats/store/public/thunks.js";

// 스탯 74건 — 응답 원형 그대로. 표시용 조립은 훅이 한다
const statsSlice = createSlice({
  name: "legendStat/stats",
  initialState: { items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetLegendStats, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
  },
});

// 표시명 lookup 2종 — 실패해도 표는 코드값으로 동작해야 해서 스탯과 상태를 분리한다
const pitchTypesSlice = createSlice({
  name: "legendStat/pitchTypes",
  initialState: { pitchNameByCode: {}, loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetPitchTypes, (state, action) => {
      state.pitchNameByCode = action.payload;
      state.loaded = true;
    });
  },
});

const teamsSlice = createSlice({
  name: "legendStat/teams",
  initialState: { teamNameByCode: {}, loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetTeams, (state, action) => {
      state.teamNameByCode = action.payload;
      state.loaded = true;
    });
  },
});

// 재료 — 행을 펼친 레전드만 담긴다 (재요청은 thunk 의 condition 이 막는다)
const materialsSlice = createSlice({
  name: "legendStat/materials",
  initialState: { byId: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetLegendMaterials, (state, action) => {
      state.byId[action.payload.legendId] = action.payload.detail;
    });
  },
});

export default combineReducers({
  stats: statsSlice.reducer,
  pitchTypes: pitchTypesSlice.reducer,
  teams: teamsSlice.reducer,
  materials: materialsSlice.reducer,
});

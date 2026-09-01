import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetLegendList, requestGetTeams } from "@/domains/legendMaterials/store/public/thunks.js";

/* ===============================
 * 레전드 + 재료 목록
 * =============================== */
const legendsInitialState = {
  legends: [],
  loaded: false,
  loading: false,
  error: null,
};

const legendsSlice = createSlice({
  name: "legendMaterial/legends",
  initialState: legendsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetLegendList, (state, action) => {
      state.legends = action.payload;
      state.loaded = true;
    });
  },
});

/* ===============================
 * 구단 목록 (한글명 lookup 재료)
 * legends 와 독립된 loaded/loading/error 로 관리한다 —
 * 이 쪽이 실패해도 legends 화면은 그대로 동작해야 한다.
 * =============================== */
const teamsInitialState = {
  teams: [],
  teamNameByCode: {},
  loaded: false,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: "legendMaterial/teams",
  initialState: teamsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetTeams, (state, action) => {
      state.teams = action.payload.teams;
      state.teamNameByCode = action.payload.teamNameByCode;
      state.loaded = true;
    });
  },
});

export default combineReducers({
  legends: legendsSlice.reducer,
  teams: teamsSlice.reducer,
});

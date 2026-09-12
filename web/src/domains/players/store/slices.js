import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetPlayerCards, requestGetPlayerStats } from "@/domains/players/store/thunks.js";

// 11,668건 — 어댑터를 거친 화면 형태 그대로 저장한다. 필터/정렬은 화면(4단계)이 한다.
const cardsSlice = createSlice({
  name: "players/cards",
  initialState: { items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetPlayerCards, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
  },
});

// 리스트형 스탯 — 활성 구단 1개만 들고 있는다(teamCode 로 캐시 적중 여부를 판단).
// 팀을 바꾸면 thunk 의 condition 이 자동으로 다시 받아오게 한다.
const statsSlice = createSlice({
  name: "players/stats",
  initialState: { teamCode: null, items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetPlayerStats, (state, action) => {
      state.teamCode = action.payload.teamCode;
      state.items = action.payload.items;
      state.loaded = true;
    });
  },
});

export default combineReducers({
  cards: cardsSlice.reducer,
  stats: statsSlice.reducer,
});

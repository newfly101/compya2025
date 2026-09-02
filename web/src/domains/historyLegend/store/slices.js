import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetHistoryRounds } from "@/domains/historyLegend/store/public/thunks.js";

// 라운드 70개 + 로스터 1,750행. 한 번 받으면 필터·검색은 서버 호출 없이 화면이 한다
const roundsSlice = createSlice({
  name: "historyLegend/rounds",
  initialState: { items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetHistoryRounds, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
  },
});

export default combineReducers({
  rounds: roundsSlice.reducer,
});

import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetPlayerCards } from "@/domains/players/store/thunks.js";

// 11,668건 — 어댑터를 거친 화면 형태 그대로 저장한다. 필터/정렬은 화면(4단계)이 한다.
const playersSlice = createSlice({
  name: "players",
  initialState: { items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetPlayerCards, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
  },
});

export default playersSlice.reducer;

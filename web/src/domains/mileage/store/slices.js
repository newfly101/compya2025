import { createSlice, combineReducers } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetSniperTargets } from "@/domains/mileage/store/public/thunks.js";

// 119건, 필터링(cardId 대조)은 화면 훅에서 한다
const sniperTargetsSlice = createSlice({
  name: "mileage/sniperTargets",
  initialState: { items: [], loaded: false, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetSniperTargets, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
  },
});

export default combineReducers({
  sniperTargets: sniperTargetsSlice.reducer,
});

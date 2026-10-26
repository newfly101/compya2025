import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestDeleteGsb, requestGetGsb, requestPostGsbSave, requestPutGsb } from "@/domains/simulators/store/public/thunks.js";

const slice = createSlice({
  name: "simulators",
  // items: 서버에 저장된 내 고스변 기록. 화면의 현재 값은 훅이 로컬로 들고, 이 값은 처음 합칠 때만 읽는다
  initialState: { items: [], loaded: false, loading: false, error: null, mutateLoading: false, mutateError: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetGsb, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
    applyAsyncHandlers(builder, requestPutGsb, () => {}, "mutate");
    applyAsyncHandlers(
      builder,
      requestDeleteGsb,
      (state, action) => {
        state.items = state.items.filter((i) => i.legendId !== action.payload.legendId);
      },
      "mutate",
    );
    applyAsyncHandlers(builder, requestPostGsbSave, () => {}, "mutate");
  },
});

export const { actions, reducer } = slice;
export default reducer;

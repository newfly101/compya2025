import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import {
  requestGetSkillItems,
  requestPostSkillBatch,
  requestPostSkillEvent,
  requestPutSkillSlots,
} from "@/domains/legendCollectionSkills/store/public/thunks.js";

const slice = createSlice({
  name: "legendCollectionSkills",
  initialState: { items: [], loaded: false, loading: false, error: null, mutateLoading: false, mutateError: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetSkillItems, (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    });
    applyAsyncHandlers(
      builder,
      requestPutSkillSlots,
      (state, action) => {
        state.items = action.payload;
      },
      "mutate",
    );
    const replaceItem = (state, action) => {
      const next = action.payload;
      state.items = state.items.map((i) => (i.legendId === next.legendId ? next : i));
    };
    applyAsyncHandlers(builder, requestPostSkillEvent, replaceItem, "mutate");
    applyAsyncHandlers(builder, requestPostSkillBatch, replaceItem, "mutate");
  },
});

export const { actions, reducer } = slice;
export default reducer;

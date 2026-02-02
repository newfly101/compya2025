import { createSlice } from "@reduxjs/toolkit";
import { requestGetAllBoardLists } from "@/domains/community/store/thunks.js";

const initialState  = {
  boardLists: [],
  loading: false,
  error: null,
}

const communitySlice = createSlice({
  name: "community",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===============================
       * 외부 이벤트 목록 조회
       * =============================== */
      .addCase(requestGetAllBoardLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestGetAllBoardLists.fulfilled, (state, action) => {
        state.loading = false;
        state.boardLists = action.payload.boards;
      })
      .addCase(requestGetAllBoardLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
})
export const {  } = communitySlice.actions;
export default communitySlice.reducer;

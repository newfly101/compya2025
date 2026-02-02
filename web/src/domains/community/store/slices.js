import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetAllBoardLists, requestGetAllPostLists,
  requestInsertNewBoard, requestInsertNewPost,
  requestUpdateNewBoard, requestUpdateNewPost,
} from "@/domains/community/store/thunks.js";

const initialState  = {
  boardLists: [],
  postLists: [],
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
       * 게시판 목록 조회
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

      .addCase(requestInsertNewBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestInsertNewBoard.fulfilled, (state, action) => {
        state.loading = true;
        state.boardLists.push(action.payload.boards);
      })
      .addCase(requestInsertNewBoard.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })

      .addCase(requestUpdateNewBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateNewBoard.fulfilled, (state, action) => {
        state.loading = true;
        const updated = action.payload;
        const index = state.boardLists.findIndex(b => b.id === updated.id);

        if (index !== -1) {
          state.boardLists[index] = {
            ...state.boardLists[index],
            ...updated,
          };
        }
      })
      .addCase(requestUpdateNewBoard.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })




      /* ===============================
       * 게시글 목록 조회
       * =============================== */
      .addCase(requestGetAllPostLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestGetAllPostLists.fulfilled, (state, action) => {
        state.loading = false;
        state.postLists = action.payload;
      })
      .addCase(requestGetAllPostLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(requestInsertNewPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestInsertNewPost.fulfilled, (state, action) => {
        state.loading = true;
        state.postLists.push(action.payload.posts);
      })
      .addCase(requestInsertNewPost.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })

      .addCase(requestUpdateNewPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestUpdateNewPost.fulfilled, (state, action) => {
        state.loading = true;
        const updated = action.payload;
        const index = state.postLists.findIndex(b => b.id === updated.id);

        if (index !== -1) {
          state.postLists[index] = {
            ...state.postLists[index],
            ...updated,
          };
        }
      })
      .addCase(requestUpdateNewPost.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })
  }
})
export const {  } = communitySlice.actions;
export default communitySlice.reducer;

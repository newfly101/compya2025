import { createSlice } from "@reduxjs/toolkit";
import {
  requestGetAllBoardLists, requestGetAllPostLists,
  requestInsertNewBoard, requestInsertNewPost,
  requestUpdateNewBoard, requestUpdateNewPost,
} from "@/domains/community/store/thunks.js";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";

const initialState  = {
  boardLists: [],
  postLists: [],
  tagLists: [],
  loading: false,
  error: null,
}

const communitySlice = createSlice({
  name: "community",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ===============================
     * 게시판 관리 - 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetAllBoardLists, (state, action) => {
      state.boardLists = action.payload.boards;
    });
    /* ===============================
     * 게시판 관리 - 추가
     * =============================== */
    applyAsyncHandlers(builder, requestInsertNewBoard, (state, action) => {
      state.boardLists.push(action.payload.boards);
    });
    /* ===============================
     * 게시판 관리 - 수정
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateNewBoard, (state, action) => {
      const updated = action.payload;
      const index = state.boardLists.findIndex(b => b.id === updated.id);

      if (index !== -1) {
        state.boardLists[index] = {
          ...state.boardLists[index],
          ...updated,
        };
      }
    });

    /* ===============================
     * 게시글 관리 - 목록 조회
     * =============================== */
    applyAsyncHandlers(builder, requestGetAllPostLists, (state, action) => {
      state.postLists = action.payload;
    });
    /* ===============================
     * 게시글 관리 - 추가
     * =============================== */
    applyAsyncHandlers(builder, requestInsertNewPost, (state, action) => {
      state.postLists.push(action.payload.posts);
    });
    /* ===============================
     * 게시글 관리 - 수정
     * =============================== */
    applyAsyncHandlers(builder, requestUpdateNewPost, (state, action) => {
      const updated = action.payload;
      const index = state.postLists.findIndex(b => b.id === updated.id);

      if (index !== -1) {
        state.postLists[index] = {
          ...state.postLists[index],
          ...updated,
        };
      }
    });
  }
})
export const {  } = communitySlice.actions;
export default communitySlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetNoticeList } from "@/domains/notices/store/public/thunks.js";
import {
  requestAdminGetNoticeList,
  requestAdminGetNotice,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
  requestAdminUpdateNoticeVisible,
  requestAdminUpdateNoticePinned,
  requestAdminDeleteNotice,
} from "@/domains/notices/store/admin/thunks.js";

const initialState = {
  siteNotices:     [],
  officialNotices: [],
  loading: false,
  error:   null,
};

const noticeSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* ── 전체 공지 조회 (source 기준 분리) ───────────────────── */
    applyAsyncHandlers(builder, requestGetNoticeList, (state, action) => {
      state.siteNotices     = action.payload.siteNotices;
      state.officialNotices = action.payload.officialNotices;
    });

    /* ── 어드민 조회 (전체 목록) ─────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminGetNoticeList, (state, action) => {
      state.siteNotices = action.payload;
    });

    /* ── 어드민 단건 조회(글쓰기 화면 새로고침 대비) ───────────── */
    applyAsyncHandlers(builder, requestAdminGetNotice, (state, action) => {
      const notice = action.payload;
      const idx = state.siteNotices.findIndex(n => n.id === notice.id);
      if (idx !== -1) state.siteNotices[idx] = { ...state.siteNotices[idx], ...notice };
      else state.siteNotices.unshift(notice);
    });

    /* ── 신규 등록 ────────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminInsertNotice, (state, action) => {
      state.siteNotices.unshift(action.payload);
    });

    /* ── 수정 ─────────────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminUpdateNotice, (state, action) => {
      const updated = action.payload;
      const idx = state.siteNotices.findIndex(n => n.id === updated.id);
      if (idx !== -1) state.siteNotices[idx] = { ...state.siteNotices[idx], ...updated };
    });

    /* ── visible 변경 ─────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminUpdateNoticeVisible, (state, action) => {
      const { id, isVisible } = action.payload;
      state.siteNotices = state.siteNotices.map(n =>
        Number(n.id) === Number(id) ? { ...n, isVisible } : n
      );
    });

    /* ── pinned(고정) 변경 ────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminUpdateNoticePinned, (state, action) => {
      const { id, isPinned } = action.payload;
      state.siteNotices = state.siteNotices.map(n =>
        Number(n.id) === Number(id) ? { ...n, isPinned } : n
      );
    });

    /* ── 삭제 ─────────────────────────────────────────────────── */
    applyAsyncHandlers(builder, requestAdminDeleteNotice, (state, action) => {
      state.siteNotices = state.siteNotices.filter(n => Number(n.id) !== Number(action.payload));
    });
  },
});

export default noticeSlice.reducer;

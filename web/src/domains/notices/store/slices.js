import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/global/handler/applyAsyncHandlers.js";
import { requestGetSiteNoticeList, requestGetOfficialNoticeList } from "@/domains/notices/store/public/thunks.js";
import {
  requestAdminGetNoticeList,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
  requestAdminUpdateNoticeVisible,
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
    /* ── 사이트 공지 조회 ─────────────────────────────────────── */
    applyAsyncHandlers(builder, requestGetSiteNoticeList, (state, action) => {
      state.siteNotices = action.payload;
    });

    applyAsyncHandlers(builder, requestAdminGetNoticeList, (state, action) => {
      state.siteNotices = action.payload;
    });

    /* ── 공식 공지 조회 ───────────────────────────────────────── */
    applyAsyncHandlers(builder, requestGetOfficialNoticeList, (state, action) => {
      state.officialNotices = action.payload;
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
  },
});

export default noticeSlice.reducer;

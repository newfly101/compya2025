import { createAsyncThunk } from "@reduxjs/toolkit";
import { NOTICE_ACTIONS } from "@/domains/notices/store/public/endpoints.js";
import { fetchGetNotices, fetchGetNoticeBySlug } from "@/domains/notices/store/public/api.js";

export const requestGetNoticeList = createAsyncThunk(
  NOTICE_ACTIONS.GET_NOTICES,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetNotices();
      // console.log("GET_NOTICES data:", data);
      const visible = [...data].filter(notice => notice.isVisible);
      return {
        siteNotices:     visible.filter(n => n.source === "INTERNAL").sort((a, b) => b.id - a.id),
        officialNotices: visible.filter(n => n.source === "EXTERNAL").sort((a, b) => b.id - a.id),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// slug 주소로 직접 진입했는데 목록에 아직 없을 때(캐시 미스) 단건 조회
export const requestGetNoticeBySlug = createAsyncThunk(
  NOTICE_ACTIONS.GET_NOTICE_BY_SLUG,
  async (slug, { rejectWithValue }) => {
    try {
      return await fetchGetNoticeBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

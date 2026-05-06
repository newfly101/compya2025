import { createAsyncThunk } from "@reduxjs/toolkit";
import { NOTICE_ACTIONS } from "@/domains/notices/store/public/endpoints.js";
import { fetchGetNotices } from "@/domains/notices/store/public/api.js";

export const requestGetNoticeList = createAsyncThunk(
  NOTICE_ACTIONS.GET_NOTICES,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetNotices();
      // console.log("GET_NOTICES data:", data);
      const visible = [...data].filter(notice => notice.isVisible);
      return {
        siteNotices:     visible.filter(n => n.source === "INTERNAL").sort((a, b) => b.id - a.id),
        officialNotices: visible.filter(n => n.source === "OFFICIAL").sort((a, b) => b.id - a.id),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

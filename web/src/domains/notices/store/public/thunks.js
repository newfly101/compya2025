import { createAsyncThunk } from "@reduxjs/toolkit";
import { NOTICE_ACTIONS } from "@/domains/notices/store/public/endpoints.js";
import { fetchGetSiteNotices, fetchGetOfficialNotices } from "@/domains/notices/store/public/api.js";

export const requestGetSiteNoticeList = createAsyncThunk(
  NOTICE_ACTIONS.GET_SITE_NOTICES,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetSiteNotices();
      console.log("GET_SITE_NOTICES data:", data);
      return [...data]
        .filter(notice => notice.isVisible)
        .sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestGetOfficialNoticeList = createAsyncThunk(
  NOTICE_ACTIONS.GET_OFFICIAL_NOTICES,
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetOfficialNotices();
      console.log("GET_OFFICIAL_NOTICES data:", data);
      return [...data]
        .filter(notice => notice.isVisible)
        .sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

import { createAsyncThunk } from "@reduxjs/toolkit";
import { NOTICE_ACTIONS } from "@/domains/notices/store/public/endpoints.js";
import { fetchGetNotices, fetchGetNoticeDetail } from "@/domains/notices/store/public/api.js";

export const requestGetNoticeList = createAsyncThunk(
  NOTICE_ACTIONS.GET_NOTICES,
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchGetNotices();
      // console.log("GET_NOTICES data:", data);
      const visible = [...data].filter(notice => notice.isVisible);
      return {
        siteNotices:     visible.filter(n => n.source === "INTERNAL").sort((a, b) => b.id - a.id),
        officialNotices: visible.filter(n => n.source === "EXTERNAL").sort((a, b) => b.id - a.id),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  // 이미 같은 요청이 날아가 있으면 건너뛴다 — 훅/화면이 같은 틱에 각자 dispatch 해도 1번만 나간다.
  { condition: (_, { getState }) => !getState().notices.publicLoading },
);

// 목록에서 찾은 공지의 본문만 채운다(목록 SQL 은 본문을 내려주지 않는다).
export const requestGetNoticeDetail = createAsyncThunk(
  NOTICE_ACTIONS.GET_NOTICE_DETAIL,
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchGetNoticeDetail(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

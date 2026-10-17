import { createAsyncThunk } from "@reduxjs/toolkit";
import { ADMIN_CHAT_ACTIONS } from "@/domains/chats/store/admin/endpoints.js";
import { fetchGetAdminChatOnline } from "@/domains/chats/store/admin/api.js";

// 관리자 접속 목록 모달 — 결과는 모달 지역 상태로 쓴다(슬라이스 저장 없음)
export const requestGetAdminChatOnline = createAsyncThunk(
  ADMIN_CHAT_ACTIONS.GET_ONLINE,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchGetAdminChatOnline();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

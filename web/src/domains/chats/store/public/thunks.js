import { createAsyncThunk } from "@reduxjs/toolkit";
import { CHAT_ACTIONS } from "@/domains/chats/store/public/endpoints.js";
import { fetchGetChatMessages } from "@/domains/chats/store/public/api.js";

// 입장 시·재연결 성공 시 호출 — 매번 새로 받는다(재요청 가드 없음).
export const requestGetChatMessages = createAsyncThunk(
  CHAT_ACTIONS.GET_MESSAGES,
  async (_, { rejectWithValue }) => {
    try {
      return await fetchGetChatMessages();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

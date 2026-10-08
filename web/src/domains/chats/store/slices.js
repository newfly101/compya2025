import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";
import { requestGetChatMessages } from "@/domains/chats/store/public/thunks.js";

const MAX = 100;
const byId = (list) => [...new Map(list.map((m) => [m.id, m])).values()];

// 오래된 → 최신. 실시간 수신분과 REST 목록은 id 로 합친다.
const initialState = { messages: [], loading: false, error: null, loaded: false };

const slice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    appendMessage(state, action) {
      state.messages = byId([...state.messages, action.payload]).slice(-MAX);
    },
    removeMessage(state, action) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetChatMessages, (state, action) => {
      // REST 순서가 먼저, 그 뒤에 이미 받은 실시간 글. 같은 id 는 하나로.
      // ponytail: 끊긴 사이 삭제된 글이 되살아날 수 있음 — 다음 입장 때 사라짐.
      state.messages = byId([...(action.payload ?? []), ...state.messages]).slice(-MAX);
      state.loaded = true;
    });
  },
});

export const { actions, reducer } = slice;
export default reducer;

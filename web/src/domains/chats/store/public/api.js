import { API } from "@/infra/http/client.js";
import { CHATS } from "@/domains/chats/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다 — 내용물(data.data)만 반환한다.

export const fetchGetChatMessages = async () => {
  const { data } = await API.get(CHATS.GET_MESSAGES);
  return data.data;
};

// 비로그인 게스트 번호 발급 — CHAT_GUEST 쿠키가 세팅된다. { name: "guest00042" | null }
export const fetchGetChatGuest = async () => {
  const { data } = await API.get(CHATS.GUEST);
  return data.data;
};

// 현재 접속자 수 — { count }
export const fetchGetChatOnline = async () => {
  const { data } = await API.get(CHATS.ONLINE);
  return data.data;
};

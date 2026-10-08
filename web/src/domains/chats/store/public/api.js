import { API } from "@/infra/http/client.js";
import { CHATS } from "@/domains/chats/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다 — 내용물(data.data)만 반환한다.

export const fetchGetChatMessages = async () => {
  const { data } = await API.get(CHATS.GET_MESSAGES);
  return data.data;
};

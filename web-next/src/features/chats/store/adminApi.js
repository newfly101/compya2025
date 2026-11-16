import { API } from "@/lib/http/client.js";
import { ADMIN_CHATS } from "@/features/chats/store/adminEndpoints.js";

export const fetchDeleteChatMessage = async (messageId) => {
  await API.delete(ADMIN_CHATS.DELETE_MESSAGE(messageId));
};

// { users: [{ userId, nickname, nicknameSet }], guests: ["guest00042"], anonymousCount }
export const fetchGetAdminChatOnline = async () => {
  const { data } = await API.get(ADMIN_CHATS.ONLINE);
  return data.data;
};

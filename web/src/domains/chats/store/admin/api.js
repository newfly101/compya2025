import { API } from "@/infra/http/client.js";
import { ADMIN_CHATS } from "@/domains/chats/store/admin/endpoints.js";

export const fetchDeleteChatMessage = async (messageId) => {
  await API.delete(ADMIN_CHATS.DELETE_MESSAGE(messageId));
};

export const ADMIN_CHAT_ACTIONS = {
  GET_ONLINE: "GET/admin/chats/online",
};

export const ADMIN_CHATS = {
  ONLINE: "/admin/chats/online",
  DELETE_MESSAGE: (messageId) => `/admin/chats/messages/${messageId}`,
};

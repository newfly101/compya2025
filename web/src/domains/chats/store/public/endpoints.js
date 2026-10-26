export const CHAT_ACTIONS = {
  GET_MESSAGES: "GET/chats/messages",
  GET_GUEST: "GET/chats/guest",
  GET_ONLINE: "GET/chats/online",
};

export const CHATS = {
  GET_MESSAGES: "/chats/messages",
  GUEST: "/chats/guest",
  ONLINE: "/chats/online",
};

// STOMP 계약 (BE 와 동일 이름)
export const CHAT_STOMP = {
  WS_PATH: "/ws",
  SUBSCRIBE_LOBBY: "/topic/chats.lobby",
  SUBSCRIBE_ERRORS: "/user/queue/chats.errors",
  SEND: "/app/chats.send",
};

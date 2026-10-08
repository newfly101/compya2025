import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "@/config/env.js";
import { CHAT_STOMP } from "@/domains/chats/store/public/endpoints.js";
import { requestGetChatMessages } from "@/domains/chats/store/public/thunks.js";
import { actions } from "@/domains/chats/store/slices.js";

// http(s)://host/api → ws(s)://host/ws  (native WebSocket, SockJS 아님)
const WS_URL = API_BASE_URL.replace(/\/api\/?$/, "").replace(/^http/, "ws") + CHAT_STOMP.WS_PATH;

export const MAX_LENGTH = 200;
export const MAX_LINES = 5; // 서버 ChatService.MAX_LINES 와 같게

// 서버(ChatService.MARKUP)와 같은 패턴 — "<3", "1 < 2", "a < b", "<<최고>>", "a->b" 는 통과
export const MARKUP_RE = /<[/!]?[a-zA-Z!-]/;
export const MARKUP_TEXT = "태그(<...>)는 쓸 수 없어요";

const ERROR_TEXT = {
  CHAT_MARKUP_NOT_ALLOWED: MARKUP_TEXT,
  CHAT_UNAUTHORIZED: "로그인하면 채팅할 수 있어요.",
  CHAT_NICKNAME_REQUIRED: "닉네임을 바꾸면 채팅할 수 있어요.",
  CHAT_TOO_LONG: `${MAX_LENGTH}자까지 보낼 수 있어요.`,
  CHAT_TOO_MANY_LINES: `${MAX_LINES}줄까지 보낼 수 있어요.`,
  CHAT_RATE_LIMITED: "잠시 후 다시 보내주세요.",
};

// 패널이 열려 있는 동안만 연결한다. 인증은 httpOnly 쿠키라 JS 가 토큰을 못 읽는다 —
// 쿠키가 WS 업그레이드 요청에 실려 가며, Authorization 헤더는 JS 가 토큰을 갖게 되면 connectHeaders 에 추가.
// authKey 가 바뀌면(로그인 상태 변화) 재연결한다.
export const useChatRoom = (open, authKey) => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((s) => s.chats);
  const [status, setStatus] = useState("connecting"); // connecting | connected | disconnected
  const [notice, setNotice] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });
    client.onConnect = () => {
      setStatus("connected");
      client.subscribe(CHAT_STOMP.SUBSCRIBE_LOBBY, (frame) => {
        let evt;
        try { evt = JSON.parse(frame.body); } catch { return; }
        if (evt.type === "MESSAGE" && evt.message) dispatch(actions.appendMessage(evt.message));
        else if (evt.type === "DELETE") dispatch(actions.removeMessage(evt.id));
      });
      client.subscribe(CHAT_STOMP.SUBSCRIBE_ERRORS, (frame) => {
        try {
          const { code } = JSON.parse(frame.body);
          setNotice(ERROR_TEXT[code] ?? "전송하지 못했어요.");
        } catch { /* 형식 오류는 무시 */ }
      });
      // 구독 뒤에 받아야 사이에 낀 글을 놓치지 않는다. 최초·재연결 모두 여기서 메운다.
      dispatch(requestGetChatMessages());
    };
    client.onWebSocketClose = () => setStatus("disconnected");
    client.onStompError = () => setStatus("disconnected");
    client.activate();
    clientRef.current = client;
    return () => {
      clientRef.current = null;
      client.deactivate();
      setStatus("connecting"); // 다음 연결(재오픈·재로그인) 대비 초기화
    };
  }, [open, authKey, dispatch]);

  const send = useCallback((body) => {
    const client = clientRef.current;
    if (!client?.connected) return false;
    setNotice(null);
    client.publish({ destination: CHAT_STOMP.SEND, body: JSON.stringify({ body }) });
    return true;
  }, []);

  return { messages, status, loading, error, notice, send };
};

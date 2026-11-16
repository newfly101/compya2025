"use client";
import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import { API_PUBLIC_URL } from "@/lib/env.js";
import { CHAT_STOMP } from "@/features/chats/store/endpoints.js";
import { fetchGetChatGuest, fetchGetChatMessages, fetchGetChatOnline } from "@/features/chats/store/api.js";
import { useChatStore } from "@/features/chats/store/store.js";

// http(s)://host/api → ws(s)://host/ws  (native WebSocket, SockJS 아님)
const WS_URL = API_PUBLIC_URL.replace(/\/api\/?$/, "").replace(/^http/, "ws") + CHAT_STOMP.WS_PATH;

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

// 사이트에 들어오면 패널과 무관하게 연결한다 — 접속자 수가 채팅을 연 사람이 아니라 방문자 전체가 되도록. 인증은 httpOnly 쿠키라 JS 가 토큰을 못 읽는다 —
// 쿠키가 WS 업그레이드 요청에 실려 가며, Authorization 헤더는 JS 가 토큰을 갖게 되면 connectHeaders 에 추가.
// authKey 가 바뀌면(로그인 상태 변화) 재연결한다.
const RECONNECT_BASE = 3000;
const RECONNECT_MAX = 30000;

// 연결 부수 상태 — 닫힌 위젯(껍데기)이 이벤트마다 리렌더되지 않게, 패널이 열렸을 때만 구독한다.
const useRoomState = create((set) => ({
  loading: false,
  error: null,
  status: "connecting", // connecting | connected | disconnected
  notice: null,
  guestName: null,
  presenceTick: 0, // PRESENCE 수신마다 +1 — 관리자 모달 재조회 신호
}));
const setRoom = (patch) => useRoomState.setState(patch);

// 패널(열렸을 때)용 — 메시지·접속자·연결 상태 구독
export const useChatRoomState = () => {
  const messages = useChatStore((s) => s.messages);
  const onlineCount = useChatStore((s) => s.onlineCount);
  const room = useRoomState();
  return { messages, onlineCount, ...room };
};

// 사이트에 들어오면 패널과 무관하게 연결한다 — 접속자 수가 채팅을 연 사람이 아니라 방문자 전체가 되도록. 인증은 httpOnly 쿠키라 JS 가 토큰을 못 읽는다 —
// 쿠키가 WS 업그레이드 요청에 실려 가며, Authorization 헤더는 JS 가 토큰을 갖게 되면 connectHeaders 에 추가.
// authKey 가 바뀌면(로그인 상태 변화) 재연결한다. 이 훅은 아무 상태도 구독하지 않는다(리렌더 0).
export const useChatConnection = (open, authKey) => {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    let client = null;
    const connect = () => {
      client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: RECONNECT_BASE,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });
      client.onConnect = () => {
        client.reconnectDelay = RECONNECT_BASE;
        setRoom({ status: "connected" });
        client.subscribe(CHAT_STOMP.SUBSCRIBE_LOBBY, (frame) => {
          let evt;
          try { evt = JSON.parse(frame.body); } catch { return; }
          if (evt.type === "MESSAGE" && evt.message) useChatStore.getState().appendMessage(evt.message);
          else if (evt.type === "DELETE") useChatStore.getState().removeMessage(evt.id);
          else if (evt.type === "PRESENCE") {
            useChatStore.getState().setOnlineCount(Number(evt.presence?.count));
            useRoomState.setState((s) => ({ presenceTick: s.presenceTick + 1 }));
          }
        });
        client.subscribe(CHAT_STOMP.SUBSCRIBE_ERRORS, (frame) => {
          try {
            const { code } = JSON.parse(frame.body);
            setRoom({ notice: ERROR_TEXT[code] ?? "전송하지 못했어요." });
          } catch { /* 형식 오류는 무시 */ }
        });
        // 구독 뒤에 받아야 사이에 낀 글을 놓치지 않는다. 최초·재연결 모두 여기서 메운다.
        setRoom({ loading: true });
        fetchGetChatMessages()
          .then((list) => { if (cancelled) return; useChatStore.getState().mergeMessages(list); setRoom({ error: null }); })
          .catch((e) => { if (!cancelled) setRoom({ error: e.message }); })
          .finally(() => { if (!cancelled) setRoom({ loading: false }); });
        fetchGetChatOnline()
          .then((res) => { if (!cancelled) useChatStore.getState().setOnlineCount(Number(res?.count)); })
          .catch(() => { /* 실패하면 숫자만 숨김 */ });
      };
      // 재연결 지수 백오프(3s → 최대 30s). 연결되면 onConnect 에서 초기화
      client.onWebSocketClose = () => {
        setRoom({ status: "disconnected" });
        client.reconnectDelay = Math.min(client.reconnectDelay * 2, RECONNECT_MAX);
      };
      client.onStompError = () => setRoom({ status: "disconnected" });
      client.activate();
      clientRef.current = client;
    };
    // 비로그인이면 연결 전에 게스트 번호를 먼저 받는다(쿠키 세팅). 실패해도 연결은 한다.
    if (authKey) {
      connect();
    } else {
      fetchGetChatGuest()
        .then((res) => { if (!cancelled) setRoom({ guestName: res?.name ?? null }); })
        .catch(() => { /* 번호 없는 게스트로 진행 */ })
        .finally(() => { if (!cancelled) connect(); });
    }
    return () => {
      cancelled = true;
      clientRef.current = null;
      client?.deactivate();
      useChatStore.getState().setOnlineCount(null);
      setRoom({ status: "connecting" }); // 다음 연결(재오픈·재로그인) 대비 초기화
    };
  }, [open, authKey]);

  return useCallback((body) => {
    const client = clientRef.current;
    if (!client?.connected) return false;
    setRoom({ notice: null });
    client.publish({ destination: CHAT_STOMP.SEND, body: JSON.stringify({ body }) });
    return true;
  }, []);
};

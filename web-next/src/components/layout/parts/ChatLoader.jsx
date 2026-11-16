"use client";
import dynamic from "next/dynamic";

// 채팅(stomp 포함)은 첫 화면에 필요 없다 — 하이드레이션 뒤에 따로 받는다.
const ChatWidget = dynamic(() => import("@/features/chats/components/chatWidget/ChatWidget.jsx"), { ssr: false });

export default ChatWidget;

import { create } from "zustand";

const MAX = 100;
const byId = (list) => [...new Map(list.map((m) => [m.id, m])).values()];

// 실시간 채팅 상태(오래된 → 최신). 실시간 수신분과 REST 목록은 id 로 합친다.
export const useChatStore = create((set) => ({
  messages: [],
  onlineCount: null, // 모르면 null(화면에서 숨김)
  appendMessage: (m) => set((s) => ({ messages: byId([...s.messages, m]).slice(-MAX) })),
  removeMessage: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  // REST 순서가 먼저, 그 뒤에 이미 받은 실시간 글. ponytail: 끊긴 사이 삭제된 글이 되살아날 수 있음 — 다음 입장 때 사라짐.
  mergeMessages: (list) => set((s) => ({ messages: byId([...(list ?? []), ...s.messages]).slice(-MAX) })),
  setOnlineCount: (n) => set({ onlineCount: Number.isFinite(n) ? n : null }),
}));

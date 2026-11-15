import { create } from "zustand";

// 출석 체크인 토스트 — 원본 gamification slice 의 lastCheckIn 대체 (앱 전역 1곳, 3초 뒤 닫힘).
// { xp, point, level, levelName, leveledUp } — xp>0 일 때만 채운다.
export const useGamificationStore = create((set) => ({
  lastCheckIn: null,
  showCheckIn: (payload) => set({ lastCheckIn: payload }),
  dismissCheckIn: () => set({ lastCheckIn: null }),
}));

import { create } from "zustand";

// 전역 작업 결과 모달 — 원본 operation slice 대체. { success, message } 를 한 건만 들고 있는다.
// 채우는 곳은 QueryProvider 의 QueryCache/MutationCache (meta.notify).
export const useOperationStore = create((set) => ({
  lastOperation: null,
  setLastOperation: (op) => set({ lastOperation: op }),
  clearLastOperation: () => set({ lastOperation: null }),
}));

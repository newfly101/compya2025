import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 로그인 세션 — 원본 auth slice 대체. initialized = "세션 확인을 시도해 봤다" (AuthGate 가 이 값을 기다린다).
// 표시용 요약(user·userRole)만 sessionStorage 에 둔다 — 토큰 없음. 새 페이지 첫 화면에 로그인 상태를 바로 보이려는 캐시이고,
// 진짜 확인은 AuthProvider 의 restoreSession 이 한다. skipHydration: 서버 HTML 과 첫 렌더를 맞추려고 마운트 뒤 rehydrate().
export const useAuthStore = create(persist((set, get) => ({
  user: null,
  userRole: null,
  initialized: false,
  // GET /users/me 응답 { userRole, ...사용자 } 를 상태로 옮긴다
  setSession: (payload) => {
    const { userRole = null, ...userDetail } = payload ?? {};
    const prev = get().user;
    const next = userRole ? userDetail : null;
    // 내용이 같으면 기존 참조를 유지 — user 구독자 전체가 다시 렌더되지 않게 한다
    const same = prev && next && Object.keys(next).length === Object.keys(prev).length
      && Object.keys(next).every((k) => Object.is(prev[k], next[k]));
    set({ user: same ? prev : next, userRole, initialized: true });
  },
  // 정리됐다는 것은 "확인이 끝났다" 는 뜻이기도 하다 — initialized 가 false 로 남으면 화면이 영구히 비어 있다
  clearUser: () => {
    set({ user: null, userRole: null, initialized: true });
    useAuthStore.persist.clearStorage();
  },
  setGuestInitialized: () => {
    set({ user: null, userRole: null, initialized: true });
    useAuthStore.persist.clearStorage();
  },
  // 마이페이지 닉네임 저장 성공 뒤 — 전역 닉네임 가드가 새로고침 없이 풀리게 한다
  patchUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
}), {
  name: "authSummary",
  storage: createJSONStorage(() => sessionStorage),
  skipHydration: true,
  partialize: (s) => ({ user: s.user, userRole: s.userRole }),
}));

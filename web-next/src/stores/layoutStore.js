import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 서랍 접이식 부모 행(id)별 접힘 상태 — 탭을 닫으면 다시 펼침(sessionStorage, REQ-HM-15).
// skipHydration: 서버 HTML 과 첫 렌더를 맞추려고 마운트 뒤(Drawer 의 effect)에 복원한다.
export const useLayoutStore = create(
  persist(
    (set) => ({
      drawerCollapsed: [], // string[] (Set 은 JSON 으로 저장되지 않는다)
      toggleGroup: (id) =>
        set((s) => ({
          drawerCollapsed: s.drawerCollapsed.includes(id)
            ? s.drawerCollapsed.filter((g) => g !== id)
            : [...s.drawerCollapsed, id],
        })),
    }),
    { name: "drawerCollapsed", storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);

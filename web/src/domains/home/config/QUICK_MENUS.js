// ── Mock 데이터 ───────────────────────────────────────────────
// comingSoon: true → /skill, /encyclopedia 폐기 도메인 (simulate bc147f9 / dictionary 823c6ac).
// QuickSection 에서 click 시 navigate 차단 + RenewalNoticeModal 표시.
export const QUICK_MENUS = [
  { id: 1, icon: "🎮", label: "스킬\n시뮬레이터", to: "/skill",       comingSoon: true },
  { id: 2, icon: "📖", label: "추천\n백과사전",   to: "/encyclopedia", comingSoon: true },
  { id: 3, icon: "🎯", label: "히스토리\n모드",   to: "/mode/history" },
  // LEGACY kbo 도메인 잠정 보류 — 2026-05-09 (frontend kbo 화면 폐기. BE API 미구현 / DB 는 kbocrol 운영)
  // { id: 4, icon: "⚾", label: "KBO\n승부예측",    to: "/kbo" },
];

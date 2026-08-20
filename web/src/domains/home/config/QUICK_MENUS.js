// ── Mock 데이터 ───────────────────────────────────────────────
// comingSoon: true → /skill, /encyclopedia 폐기 도메인 (simulate bc147f9 / dictionary 823c6ac).
// QuickSection 에서 click 시 navigate 차단 + RenewalNoticeModal 표시.
export const QUICK_MENUS = [
  { id: 1, icon: "🎮", label: "스킬\n시뮬레이터", to: "/skill",       comingSoon: true },
  { id: 3, icon: "🎯", label: "히스토리\n모드",   to: "/mode/history" },
];

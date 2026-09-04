// ADMIN_TABS.js — 어드민 셸 탭 정의. 상단 탭 바 · 홈 카드 그리드가 함께 참조한다.
// 순서 고정: 홈 · 퀴즈 · 이벤트 · 쿠폰 · 공지 · 유저관리
// (근거: test-docs/레전드 재료 앱 디자인/design_handoff_admin/README.md § Global Shell)
export const ADMIN_TABS = [
  { key: "home", label: "홈" },
  { key: "quiz", label: "퀴즈", description: "회차 · 이미지" },
  { key: "event", label: "이벤트", description: "등록 · 기간 · 노출" },
  { key: "coupon", label: "쿠폰", description: "코드 · 만료일" },
  { key: "notice", label: "공지", description: "글쓰기 · 고정" },
  { key: "user", label: "유저관리", description: "상태 · 조회" },
];

// 홈 탭의 「빠른 이동」 카드 그리드 — 홈 자신은 제외한 5개.
export const ADMIN_HOME_CARDS = ADMIN_TABS.filter((t) => t.key !== "home");

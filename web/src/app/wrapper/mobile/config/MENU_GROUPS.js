import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

export const MENU_GROUPS = [
  {
    label: '메인',
    items: [
      { icon: '🏠', label: '홈',           to: '/' },
      { icon: '🎪', label: '이벤트',        to: '/events' },
      { icon: '🎫', label: '쿠폰 코드',     to: '/coupons' },
      { icon: '📢', label: '공지사항',      to: '/notices' },
    ]
  },
  {
    label: '컨텐츠',
    items: [
      { icon: '🧩', label: '레전드 재료',     to: '/legend-stats',
        tag: { variant: 'hot' } },
      { icon: '🎯', label: '히스토리 재료',   to: '/history-mode/legend' },
      { icon: '🧭', label: '마일리지 저격',   to: '/mileage',
        tag: { variant: 'new' } },
      { icon: '⚾', label: '선수 백과사전',   to: '/players',
        tag: { variant: 'beta' } },
      { icon: '📖', label: '스킬 백과사전',   to: ROUTE_PATHS.player_skills },
      { icon: '📊', label: '확률 공시',      to: '/probability', loginRequired: true },
      { icon: '📚', label: '가이드',        to: ROUTE_PATHS.guides },
      { icon: '🎮', label: '스킬 시뮬레이터', to: '/skill', comingSoon: true,
        tag: { variant: 'neutral', label: '준비중' } },
    ]
  },
  // 커뮤니티 그룹 — AdSense 심사 대응으로 드로어 노출에서 제외(2026-09-13).
  // 라우트 자체는 유지(직접 URL 접근 가능), infra/seo/routeSeo.js NOINDEX_PATHS 로 색인만 차단.
]

// admin role 한정 노출 — Drawer 가 isAdmin 일 때 MENU_GROUPS 뒤에 append.
// 어드민이 단일 셸 + 상단 탭 구조로 바뀌면서 드로어 항목도 「Admin」 하나로 합친다
// (근거: test-docs/레전드 재료 앱 디자인/design_handoff_admin/README.md § Overview).
export const ADMIN_MENU_GROUPS = [
  {
    label: '어드민 사이트 관리',
    items: [
      { icon: '🛠️', label: 'Admin', to: '/admin' },
    ]
  },
]

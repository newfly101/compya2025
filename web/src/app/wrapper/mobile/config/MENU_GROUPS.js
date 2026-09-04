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
        tag: { variant: 'new' } },
      { icon: '🎯', label: '히스토리 재료',   to: '/history-mode/legend',
        tag: { variant: 'new' } },
      { icon: '🎮', label: '스킬 시뮬레이터', to: '/skill', comingSoon: true,
        tag: { variant: 'neutral', label: '공사중' } },
      { icon: '⚾', label: '선수 백과사전',   to: '/players', loginRequired: true },
      { icon: '📊', label: '확률 공시',      to: '/probability', loginRequired: true },
    ]
  },
  {
    // 2026-08-31 읽기 전용 재오픈. 기존 주석의 /posts/hot, /posts/team 은 실제 라우트가 아니었고
    // 실제 게시판(TIP/CLUB)과도 매핑되지 않아 살리지 않음 — /community 단일 진입점으로 대체.
    label: '커뮤니티',
    items: [
      { icon: '💬', label: '커뮤니티', to: '/community' },
    ]
  },
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

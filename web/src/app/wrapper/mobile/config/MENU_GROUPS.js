export const MENU_GROUPS = [
  {
    label: '메인',
    items: [
      { icon: '🏠', label: '홈',           to: '/',         badge: null },
      { icon: '🎪', label: '이벤트',        to: '/events',   badge: null },
      { icon: '🎫', label: '쿠폰 코드',     to: '/coupons',  badge: null },
      { icon: '📢', label: '공지사항',      to: '/notices',  badge: null },
    ]
  },
  {
    label: '컨텐츠',
    items: [
      { icon: '🎮', label: '스킬 시뮬레이터', to: '/skill',       badge: null, comingSoon: true },
      { icon: '🎯', label: '히스토리 탐색기', to: '/mode/history', badge: null },
      { icon: '📊', label: '확률 공시',      to: '/probability',        badge: null, tag: 'new', loginRequired: true },
      { icon: '⚾', label: '선수 백과사전',   to: '/players',      badge: null, tag: 'beta', loginRequired: true },
      { icon: '🧩', label: '레전드 재료 검색', to: '/legend-materials', badge: null, tag: 'beta' },
    ]
  },
  {
    // 2026-08-31 읽기 전용 재오픈. 기존 주석의 /posts/hot, /posts/team 은 실제 라우트가 아니었고
    // 실제 게시판(TIP/CLUB)과도 매핑되지 않아 살리지 않음 — /community 단일 진입점으로 대체.
    label: '커뮤니티',
    items: [
      { icon: '💬', label: '커뮤니티', to: '/community', badge: null },
    ]
  },
]

// admin role 한정 노출 — Drawer 가 isAdmin 일 때 MENU_GROUPS 뒤에 append
export const ADMIN_MENU_GROUPS = [
  {
    label: '어드민 사이트 관리',
    items: [
      { icon: '🎫', label: '쿠폰 관리',     to: '/admin/coupon', badge: null },
      { icon: '🎪', label: '이벤트 관리',   to: '/admin/event',  badge: null },
      { icon: '📢', label: '공지 관리',     to: '/admin/notice', badge: null },
      { icon: '👥', label: '유저 관리',     to: '/admin/user',   badge: null },
    ]
  },
]

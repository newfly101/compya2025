export const MENU_GROUPS = [
  {
    label: '메인',
    items: [
      { icon: '🏠', label: '홈',           to: '/',         badge: null },
      { icon: '🎪', label: '이벤트',        to: '/events',   badge: 5 },
      { icon: '🎫', label: '쿠폰 코드',     to: '/coupons',  badge: 3 },
      { icon: '📢', label: '공지사항',      to: '/notices',  badge: null },
    ]
  },
  {
    label: '기능',
    items: [
      { icon: '🎮', label: '스킬 시뮬레이터', to: '/skill',       badge: null },
      { icon: '📖', label: '추천 백과사전',   to: '/encyclopedia', badge: null },
      { icon: '🎯', label: '히스토리 탐색기', to: '/mode/history', badge: null },
      { icon: '⚾', label: 'KBO 승부예측',   to: '/kbo',          badge: null },
    ]
  },
  {
    label: '커뮤니티',
    items: [
      { icon: '💬', label: '인기글',   to: '/posts/hot',  badge: null },
      { icon: '💡', label: '팀 게시판', to: '/posts/team', badge: null },
    ]
  },
]

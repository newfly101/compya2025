import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

// key: 홈 바로가기가 항목을 가리키는 안정된 id (저장값에 쓰이므로 바꾸지 않는다 — home/config/quickShortcuts.js)
// children: 접이식 하위 메뉴. 부모 행은 이동하지 않고 접고 펴기만 한다. 선택지로는 children 의 항목이 쓰인다.
// loginRequired: 비로그인 클릭 시 navigate 차단 + 공용 로그인 안내 모달 (loginReason = LOGIN_REASONS 키)
export const MENU_GROUPS = [
  {
    label: '메인',
    items: [
      { key: 'home',    icon: '🏠', label: '홈',           to: '/' },
      { key: 'events',  icon: '🎪', label: '이벤트',        to: '/events' },
      { key: 'coupons', icon: '🎫', label: '쿠폰 코드',     to: '/coupons' },
      { key: 'notices', icon: '📢', label: '공지사항',      to: '/notices' },
    ]
  },
  {
    label: '컨텐츠',
    items: [
      { id: 'legend', icon: '🧩', label: '레전드 재료',
        tag: { variant: 'hot' },
        children: [
          { key: 'legend-stats',       icon: '🔎', label: '재료 검색',            to: ROUTE_PATHS.legend_stats },
          { key: 'legend-collections', icon: '🗂️', label: '내 재료 보유 현황',    to: ROUTE_PATHS.legend_collections,
            loginRequired: true, loginReason: 'holdings' },
          { key: 'legend-skills',      icon: '📝', label: '내 레전드 스킬 기록',  to: ROUTE_PATHS.legend_collection_skills,
            loginRequired: true, loginReason: 'skills' },
        ] },
      { key: 'history',   icon: '🎯', label: '히스토리 재료',   to: '/history-mode/legend' },
      { key: 'mileage',   icon: '🧭', label: '마일리지 저격',   to: '/mileage',
        tag: { variant: 'catNew' } },
      { key: 'players',   icon: '⚾', label: '선수 백과사전',   to: '/players',
        tag: { variant: 'beta' } },
      { key: 'skills',    icon: '📖', label: '스킬 백과사전',   to: ROUTE_PATHS.player_skills },
      { key: 'odds',      icon: '📊', label: '확률 공시',      to: '/probability' },
      { key: 'guides',    icon: '📚', label: '가이드',        to: ROUTE_PATHS.guides },
      { key: 'simulator', icon: '🎮', label: '스킬 시뮬레이터', to: '/skill', comingSoon: true,
        tag: { variant: 'neutral', label: '준비중' } },
    ]
  },
  // 커뮤니티 그룹 — AdSense 심사 대응으로 드로어 노출에서 제외(2026-09-13).
  // 라우트 자체는 유지(직접 URL 접근 가능), infra/seo/routeSeo.js NOINDEX_PATHS 로 색인만 차단.
]

// 홈 바로가기 선택지 = 서랍 메뉴의 이동 가능한 항목 전체 (부모 행은 제외, 하위 항목은 펼쳐서 포함)
export const MENU_LEAVES = MENU_GROUPS.flatMap((g) => g.items.flatMap((i) => i.children ?? [i]));

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

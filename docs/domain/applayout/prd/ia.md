# AppLayout — IA (정보 구조)

> 작성일: 2026-05-11
> 모드: reverse (코드 → 기획)
> 입력: `docs/domain/applayout/develop/structure.md` + `web/src/app/**` + `web/src/global/**`
> 다음 단계: requirements → feature-spec → endpoint-spec-draft → edge-cases → qa-checklist
> 본 문서는 **확정 IA**. (Draft 아님 — 사실 baseline)

---

## 0. 본 도메인의 의미

AppLayout 은 **단일 도메인이 아닌 글로벌 layer**. 모든 페이지가 mount 되기 전 거치는 공통 wrapper. 따라서 IA 는:
- 글로벌 layer 자체 (Provider 체인 / TopBar / Drawer / pageContent / Outlet)
- live 7 도메인 → 글로벌 layer 와의 hookup 표 (페이지 트리 / 진입 경로)

---

## 1. Scope

### 1-1. In scope (본 PRD 범위)

| 항목 | 비고 |
|---|---|
| 글로벌 Provider 체인 | AppProvider → ResponseListener → AuthProvider → RouterProvider |
| AppWrapper | GA4 page view + MobileLayout 렌더 |
| MobileLayout | TopBarProvider + TopBar + Drawer + pageContent (scroll-root) + Suspense + Outlet |
| TopBar 2 variants | `home` (햄버거+로고+로그인) / `page` (back+title+rightAction) |
| Drawer | MENU_GROUPS 기반 좌측 슬라이드 메뉴 + 프로필 + comingSoon 모달 |
| 글로벌 ResponseModal | `state.operation.lastOperation` 구독 → 성공/실패 모달 |
| AuthGuard | route-level 권한 가드 (현재 사용처 0개) |
| 글로벌 디자인 토큰 | colors / typography / spacing / radius / breakpoints / z-index |
| live 7 도메인 hookup | home / coupons / events / notices / notice detail / historyMode / auth callback — 글로벌 layer 와의 연결 표 |

### 1-2. Out of scope (본 PRD 범위 밖)

| 도메인 | 상태 | 처리 |
|---|---|---|
| community | 코드 잔존 / 라우트 주석 / `ROUTE_META.COMMUNITY` 만 정의 | 본 PRD 미포함. 별도 라운드에서 IA 재개 |
| quiz | 페이지 없음. 홈 QuizSection 만 store 사용 | 본 PRD 미포함 (도메인 단독 page 부재) |
| profile / mypage | UserRoutes 자식 전체 주석 (legacy 폐기 2026-05-09) | 본 PRD 미포함 |
| admin | AdminRoutes 자식 전체 주석 (legacy 폐기 2026-05-09) | 본 PRD 미포함 |
| kbo | MENU_GROUPS legacy 주석. 라우트 X | 본 PRD 미포함 |
| skill | MENU_GROUPS `comingSoon: true` → RenewalNoticeModal | 본 PRD 미포함 |
| encyclopedia | MENU_GROUPS `comingSoon: true` → RenewalNoticeModal | 본 PRD 미포함 |

---

## 2. 글로벌 layer 트리 (정보 구조)

```
AppProvider                                # redux store + ResponseListener + AuthProvider
└── RouterProvider                         # react-router-dom v7
    └── path "/" → AppWrapper              # GA4 page view 훅
        └── MobileLayout                   # TopBarProvider 컨텍스트
            ├── TopBar                     # variant=home | page
            ├── Drawer                     # 좌측 슬라이드 메뉴
            └── pageContent (scroll-root)
                └── Suspense fallback "로딩중..."
                    └── Outlet             # PublicRoutes / userRoutes / AdminRoutes 의 페이지
```

핵심 파일 (사실 baseline):

| 컴포넌트 | 위치 |
|---|---|
| AppProvider | `web/src/app/provider/AppProvider.jsx` |
| AuthProvider | `web/src/app/provider/AuthProvider.jsx` |
| TopBarProvider | `web/src/app/provider/TopBarProvider.jsx` |
| AppWrapper | `web/src/app/wrapper/AppWrapper.jsx` |
| MobileLayout | `web/src/app/wrapper/mobile/MobileLayout.jsx` |
| TopBar | `web/src/app/wrapper/mobile/parts/TopBar.jsx` |
| Drawer | `web/src/app/wrapper/mobile/parts/Drawer.jsx` |
| MENU_GROUPS | `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` |
| ResponseListener | `web/src/app/store/operation/ResponseListener.jsx` |
| AuthGuard | `web/src/app/router/guards/AuthGuard.jsx` |
| ROUTE_PATHS | `web/src/app/router/config/routePath.js` |
| ROUTE_META | `web/src/app/router/config/routeMeta.js` |

---

## 3. 페이지 트리 (live 7 도메인)

> URL ↔ 컴포넌트 ↔ 진입경로 ↔ 권한 — 코드 직접 확인 (사실)

| 도메인 | URL | 컴포넌트 경로 | 진입 경로 | 권한 |
|---|---|---|---|---|
| home | `/` | `domains/home/components/HomeScreen.jsx` | TopBar 로고 클릭 / Drawer 메인>홈 / 직접 URL | guest+ |
| auth callback | `/auth/callback` | `domains/authentication/callback/AuthCallBack.jsx` | 네이버 OAuth 콜백 (`window.location`) | (콜백 — 차단 없음) |
| coupons | `/coupons` | `domains/coupons/mobile/CouponScreen.jsx` | Drawer 메인>쿠폰 코드 / Home `최신 쿠폰` 섹션 "전체 보기" 링크 | guest+ |
| events | `/events` | `domains/events/mobile/EventScreen.jsx` | Drawer 메인>이벤트 / Home `진행 중인 이벤트` 섹션 "전체 보기" 링크 | guest+ |
| notices | `/notices` | `domains/notices/mobile/NoticeScreen.jsx` | Drawer 메인>공지사항 / Home `공지사항` 섹션 "전체 보기" 링크 | guest+ |
| notice detail | `/notice/:id` | `domains/notices/mobile/NoticeDetailScreen.jsx` | NoticeScreen / Home NoticeSection NoticeCard 클릭 | guest+ |
| history mode | `/mode/history` | `domains/historyMode/mobile/HistoryModeScreen.jsx` | Drawer 컨텐츠>히스토리 탐색기 | guest+ |

🟨 **가정**: live 7 도메인 모두 guest+ 권한. USER/ADMIN 전용 라우트 현재 **0개** (UserRoutes / AdminRoutes children 전부 주석).

---

## 4. Drawer 메뉴 트리 (MENU_GROUPS)

```
[메인 그룹]
  🏠 홈              /             → live           badge: null
  🎪 이벤트           /events       → live           badge: 5  ❓ 하드코딩
  🎫 쿠폰 코드        /coupons      → live           badge: 3  ❓ 하드코딩
  📢 공지사항         /notices      → live           badge: null

[컨텐츠 그룹]
  🎮 스킬 시뮬레이터   /skill        → comingSoon → RenewalNoticeModal
  📖 추천 백과사전     /encyclopedia → comingSoon → RenewalNoticeModal
  🎯 히스토리 탐색기   /mode/history → live

[커뮤니티 그룹]
  (주석 처리 — 본 PRD scope out)
```

❓ **미정 (Drawer badge)**: `이벤트 badge: 5` / `쿠폰 badge: 3` 정적 하드코딩. 실제 활성 이벤트 / 쿠폰 카운트와 무관.

---

## 5. 글로벌 layer 의 책임 / 비책임 (boundary)

### 5-1. 책임 (글로벌 layer 가 처리)

- redux store 제공 (Provider)
- 글로벌 ResponseModal 단일 마운트 (`state.operation.lastOperation` 구독)
- App mount 시 health-check 1회 dispatch (`requestUserHealthCheck`)
- `state.auth.initialized === false` 동안 children null block (전체 화면 blank)
- TopBar context 제공 (variant / title / rightAction / onBack / drawer state)
- Drawer 마운트 + body scroll lock (drawer open 시)
- pageContent scroll-to-top (route 변경 시)
- Suspense fallback (lazy 페이지 로딩 중)
- GA4 page view 자동 push (`useGA4PageView`)

### 5-2. 비책임 (도메인 페이지가 처리)

- 페이지별 데이터 fetch + redux thunk dispatch
- 페이지별 loading / empty / error 화면 분기 (현재 글로벌 layer 는 Suspense fallback "로딩중..." 만 제공)
- 페이지별 `useSetTopBar(config)` 호출 — page variant 사용 시 페이지가 명시
- 페이지별 form / modal / 상호작용

---

## 6. 외부 통합 (cite only — 본 PRD 결정 사안 X)

| 통합 | 위치 | 본 PRD 처리 |
|---|---|---|
| 네이버 OAuth | `useAuthentication.login()` → `window.location.href` redirect → `/auth/callback` | 기존 운영 — cite |
| GA4 | `infra/analytics/ga.js`, `useGA4PageView`, `setUserProperties` | 기존 운영 — cite |
| HTTP cookie auth | `axios withCredentials: true`, 401 → `/api/auth/refresh` 1회 interceptor | 기존 운영 — cite |

🔴 **권한 / auth 분야** — 신규 권한 등급 추가 / SecurityConfig 변경 / SSO 통합 시 HITL 필수. 본 PRD 는 **기존 운영 cite 만** — 신규 결정 사안 없음.

---

## 7. 글로벌 layer 의 핵심 디자인 토큰 그룹 (designer 입력)

> 상세 값은 `requirements.md` § 디자인 토큰 / `structure.md` § 3 참조

| 그룹 | 핵심 token | 본 layer 사용처 |
|---|---|---|
| Color background | `--color-bg-deepest` / `--color-bg-deep` / `--color-bg-card` | body / topbar / drawer / pageContent |
| Color brand | `--color-brand` / `--color-brand-violet` | TopBar 로고 / Drawer active 액센트 / 로그인 버튼 |
| Color text | `--color-text-primary` / `--color-text-secondary` / `--color-text-muted` | TopBar 타이틀 / Drawer label |
| Color status | `--color-success #03c75a` (네이버 그린) | 네이버 로그인 버튼 |
| Layout 상수 | `$layout-topbar-height: 52px` / `$layout-bottombar-height: 56px` ❓ 미사용 / `$bp-mobile-lg: 428px` (body max-width) | 글로벌 wrapper |
| Z-index | `$z-sticky 200` (TopBar) / `$z-drawer 300` / `$z-modal 410` | 글로벌 stacking 컨텍스트 |

---

## 8. 사용자 확인 필요 항목

다음 항목은 본 IA 의 ❓ / 🟨 마커. requirements / feature-spec 단계 진행 시 일관 적용:

1. ❓ **Drawer badge 하드코딩** (이벤트 5 / 쿠폰 3) — 활성 카운트 동기화 정책 결정 필요 (별도 라운드)
2. ❓ **BottomNav 부재** — `$layout-bottombar-height: 56px` 토큰만 존재. 도입 여부 미정
3. ❓ **TopBar `page` variant 미사용** — 모든 live 페이지가 `home` variant 또는 미설정. 사용 정책 미정
4. ❓ **AuthProvider initialized false 동안 전체 blank** — 스플래시 vs blank UX 미정
5. ❓ **`/skill /encyclopedia`** — comingSoon 표시. 도입 여부 미정 (본 PRD scope out)
6. ❓ **`/community` 라우트 보류** — `ROUTE_META` / `ROUTE_PATHS` 만 정의. 본 PRD scope out
7. 🟨 **live 7 도메인 권한** — 전부 guest+. USER 전용 라우트 0개 — 향후 도입 시 AuthGuard 활용

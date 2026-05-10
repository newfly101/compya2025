# AppLayout 코드 구조 분석 (reverse 입력)

> 작성일: 2026-05-11
> 분석 대상: `web/src/app/`, `web/src/global/`, `web/src/main.jsx`, 라우터/도메인 entry
> 다음 단계: planner reverse 기획 (`docs/domain/applayout/prd/`) → designer Figma 그리기
> 범위: read-only. 코드 수정 없음.

---

## 0. 진입점 / 라이브러리

- `web/src/main.jsx` — `createRoot` → `<AppProvider><RouterProvider router={router} /></AppProvider>`
- 글로벌 스타일 단일 import: `@/global/styles/global.scss`
- 라이브러리:
  - 라우터: `react-router-dom@7` (`createBrowserRouter`)
  - 상태: `@reduxjs/toolkit@2`, `react-redux@9`
  - HTTP: `axios@1`
  - 스타일: `sass` (모듈 CSS + `@use` 토큰/믹스인)
  - 캐러셀: `swiper@12`
  - 빌드: `vite@7` + `@vitejs/plugin-react@5` + `babel-plugin-react-compiler`

---

## 1. 전역 Layout 컴포넌트 트리

```
<AppProvider>
├── <Provider store={store}>           # redux store
├── <ResponseListener />               # 글로벌 ResponseModal (성공/실패)
├── <AuthProvider>                     # health-check, initialized 가드 (null block)
└── <RouterProvider router={router}>
    └── path "/" → <AppWrapper>        # useGA4PageView 훅
        └── <MobileLayout>             # TopBarProvider context wrapper
            ├── <TopBar>               # variant: home | page
            ├── <Drawer>               # 좌측 슬라이드 메뉴 (햄버거 from TopBar)
            └── <div.pageContent>      # padding-top: 52px, flex:1, overflow-y:auto
                └── <Suspense fallback="로딩중...">
                    └── <Outlet />     # 라우트별 페이지 (lazy)
        children: [...PublicRoutes, ...userRoutes, ...AdminRoutes]
```

핵심 파일:

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `AppProvider` | `web/src/app/provider/AppProvider.jsx` | redux Provider + ResponseListener + AuthProvider |
| `AuthProvider` | `web/src/app/provider/AuthProvider.jsx` | mount 시 `requestUserHealthCheck` dispatch, `initialized` false 동안 null |
| `TopBarProvider` | `web/src/app/provider/TopBarProvider.jsx` | `{ config, setConfig, isDrawerOpen, openDrawer, closeDrawer }` context. `useSetTopBar(config)` 헬퍼 |
| `AppWrapper` | `web/src/app/wrapper/AppWrapper.jsx` | GA4 page view + `<MobileLayout/>` 렌더 |
| `MobileLayout` | `web/src/app/wrapper/mobile/MobileLayout.jsx` | scroll-to-top (path/search 변경 시), Suspense, Outlet |
| `TopBar` | `web/src/app/wrapper/mobile/parts/TopBar.jsx` | `variant=home` (햄버거/로고/로그인) · `variant=page` (back/title/rightAction) |
| `Drawer` | `web/src/app/wrapper/mobile/parts/Drawer.jsx` | 좌측 슬라이드 메뉴. MENU_GROUPS 기반. comingSoon → RenewalNoticeModal |
| `MENU_GROUPS` | `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` | 드로어 메뉴 데이터 (그룹 + items) |
| `ResponseListener` | `web/src/app/store/operation/ResponseListener.jsx` | `state.operation.lastOperation` 구독 → 글로벌 ResponseModal |

### 1-1. MobileLayout 특이사항

- `scrollRef` (`<div.pageContent data-scroll-root>`) — `useLocation()` (pathname+search) 변경 시 즉시 + setTimeout(0/100/300/600) + MutationObserver(1500ms 한도) 로 다중 시도. lazy 컴포넌트가 Suspense fallback 후 마운트되며 스크롤이 위로 안 올라가는 케이스를 보완.
- 사용자 wheel/touch/keydown/pointerdown 발생 시 pending scrollTop 취소.

### 1-2. TopBar variant 분기

```
variant === "page"  → [back ‹]   [title (centered, max-width 200px)]   [rightAction]
variant === "home"  → [burger]   [⚾  컴프야펀]   [login/logout]
```

- `useTopBar()` 로 `config.variant / title / rightAction / onBack` 주입
- 도메인 페이지가 mount 시 `useSetTopBar({ variant, title, onBack, rightAction })` 호출 → 그 외 기본 `variant=home`
- 현재 코드 사용:
  - `HomeScreen` 만 `useSetTopBar({ variant: "home" })` 호출
  - 그 외 페이지(Coupon/Event/Notice/NoticeDetail/HistoryMode)는 `useSetTopBar` 미호출 → 기본 home variant 유지 (햄버거+로고+로그인) ❓ 의도와 무관하게 page variant 미사용

### 1-3. Drawer

- 위치: 좌측 fixed, top `$layout-topbar-height(52px)`, width 75% (max 250px), height `100dvh - 52px`
- 오버레이 + 패널 transform translateX(-100%) → 0 (`drawerOpen`)
- 메뉴 active 표시: `location.pathname === item.to`, 좌측 액센트 바 (3×24, `--color-brand-violet`)
- 프로필: 로그인 시 avatar+nickname+email, 비로그인 시 안내 + 네이버 로그인 버튼
- `comingSoon: true` 아이템 클릭 → `preventDefault` + `RenewalNoticeModal` open
- body scroll lock: `isDrawerOpen` 시 `document.body.style.overflow = "hidden"` (`TopBarProvider.useEffect`)
- 태블릿 이상 (`from-tablet`) — `position: absolute` + `clip-path` 로 wrapper 안쪽으로 한정

### 1-4. Footer / BottomNav

- **없음.** `Footer` / `BottomNav` 컴포넌트 미구현. `$layout-bottombar-height: 56px` 토큰만 존재 (`page-content.has-bottombar` 클래스 사용처 없음). ❓ 미정: planner 단계에서 도입 여부 결정 필요

---

## 2. 라우팅 / 페이지 entry

### 2-1. 라우트 정의 위치

- `web/src/app/router/index.jsx` — `createBrowserRouter`, 루트 `path:"/"` → `<AppWrapper/>` · children: `[...PublicRoutes, ...userRoutes, ...AdminRoutes]`
- `web/src/app/router/config/routePath.js` — URL 상수 (`ROUTE_PATHS`)
- `web/src/app/router/config/routeMeta.js` — `{path, title}` 메타 (title 은 `document.title` / GA `handle`)
- `web/src/app/router/routes/PublicRoutes.jsx` — guest 포함 전체 접근
- `web/src/app/router/routes/UserRoutes.jsx` — `<AuthGuard allow=["ADMIN","USER"]/>` 자식 (현재 비어있음)
- `web/src/app/router/routes/AdminRoutes.jsx` — `<AuthGuard allow="ADMIN"/>` 자식 (현재 비어있음 — legacy 주석만)
- `web/src/app/router/guards/AuthGuard.jsx` — `state.auth.user/userRole` 검사

### 2-2. 등록된 페이지 (live)

| 도메인 | URL | 컴포넌트 경로 | 진입 경로 | 권한 |
|---|---|---|---|---|
| home | `/` | `domains/home/components/HomeScreen.jsx` | TopBar 로고, Drawer 메인>홈 | guest+ |
| auth callback | `/auth/callback` | `domains/authentication/callback/AuthCallBack.jsx` | 네이버 OAuth 콜백 (window.location) | (콜백, 차단 없음) |
| coupons | `/coupons` | `domains/coupons/mobile/CouponScreen.jsx` | Drawer 메인>쿠폰 코드, Home `최신 쿠폰` → `to` | guest+ |
| events | `/events` | `domains/events/mobile/EventScreen.jsx` | Drawer 메인>이벤트, Home `진행 중인 이벤트` → `to` | guest+ |
| notices | `/notices` | `domains/notices/mobile/NoticeScreen.jsx` | Drawer 메인>공지사항, Home `공지사항` → `to` | guest+ |
| notice detail | `/notice/:id` | `domains/notices/mobile/NoticeDetailScreen.jsx` | NoticeScreen / Home NoticeSection 의 NoticeCard 클릭 | guest+ |
| history mode | `/mode/history` | `domains/historyMode/mobile/HistoryModeScreen.jsx` | Drawer 컨텐츠>히스토리 탐색기 | guest+ |

### 2-3. 등록 안 됨 / legacy / 보류

- **community** (`/community`) — `ROUTE_META.COMMUNITY` 만 routeMeta 에 정의되어 있음. `ROUTE_PATHS.community = "/community"` 도 존재. 라우트 등록은 X (PublicRoutes 주석 처리). `docs/prd/domains/community.md` TODO. 코드 자체 (`domains/community/mobile/*`, `domains/community/feature/*`, `domains/community/store/*`)는 잔존.
- **quiz** — 도메인 코드는 store + 홈 QuizSection 만 사용. 별도 페이지 라우트 없음.
- **profile / mypage** — UserRoutes 전체 주석 (legacy `UserProfile` 폐기 2026-05-09)
- **admin** — AdminRoutes 전체 주석 (dashboard / users / content/event,notice,coupon,player,quiz / community 전부 legacy 폐기 2026-05-09)
- **kbo 승부예측** — MENU_GROUPS legacy 주석 (`/kbo`), 라우트 X
- **skill 시뮬레이터 / 추천 백과사전** — MENU_GROUPS 에 `comingSoon: true` 로 등록 (`/skill`, `/encyclopedia`), 라우트 X → 클릭 시 RenewalNoticeModal

### 2-4. Drawer ↔ 라우트 매트릭스

```
[메인 그룹]
  🏠 홈              /            → live
  🎪 이벤트          /events      → live  (badge: 5)
  🎫 쿠폰 코드       /coupons     → live  (badge: 3)
  📢 공지사항        /notices     → live

[컨텐츠 그룹]
  🎮 스킬 시뮬레이터  /skill           → comingSoon (modal)
  📖 추천 백과사전    /encyclopedia    → comingSoon (modal)
  🎯 히스토리 탐색기  /mode/history    → live

[커뮤니티 그룹 — 전체 주석 / 보류]
  💬 인기글          /posts/hot
  💡 팀 게시판       /posts/team
```

❓ badge 5/3 은 하드코딩. 활성 이벤트/쿠폰 수와 무동기.

---

## 3. 글로벌 디자인 토큰

### 3-1. 토큰 구조

- raw 토큰: `web/src/global/styles/variables/*` — colors / font / spacing / radius / breakpoints / zindex / semantic(별칭)
- semantic 매핑(런타임): `web/src/global/styles/semantic/_color.scss` — `:root { --color-* }` CSS 변수
- 자동 주입: `web/src/global/styles/index.scss` 가 `additionalData` 로 모든 `*.module.scss` 에 forward (vite 설정) — 컴포넌트 .module.scss 에서 `@use` 없이 `$color-*` / `@include flex-*` 등 사용 가능
- CSS 출력 진입점: `web/src/global/styles/global.scss` (semantic/color + base/base + base/typography) — `main.jsx` 에서 1회 import

### 3-2. Color (raw → semantic)

Background scale:
- `$color-bg-900 #0f0a14` → `--color-bg-deepest` (body, topbar 배경)
- `$color-bg-800 #140f1f` → `--color-bg-deep` (drawer 배경)
- `$color-bg-700 #18141f` → `--color-bg-overlay`
- `$color-bg-600 #1f1a29` → `--color-bg-card`
- `$color-bg-500 #332947` → `--color-bg-elevated`

Brand purple:
- `$color-brand-400 #a86af0` → `--color-brand`
- `$color-brand-500 #6d4ad3` → `--color-brand-dark`
- `$color-brand-600 #6c5ce7` → `--color-brand-violet` (드로어 active 액센트)
- `$color-brand-700 #3c1e50` → `--color-brand-tint` / `--color-surface-event`
- alpha: `--color-brand-alpha-15`, `--color-brand-dark-alpha-15`, `--color-brand-violet-alpha-12`

Text (white alpha):
- `--color-text-primary` (92%), `--color-text-secondary` (60%), `--color-text-muted` (38%)
- `--color-text-code` (#d9d3e0), `--color-text-placeholder` (#7c6f8f)

Border:
- `--color-border` (white 06%), `--color-border-strong` (white 12%)

Status:
- `--color-success #03c75a` (네이버 그린), `--color-danger #e84141`, `--color-warning #e8d541`
- 디밍 변형: `--color-danger-dim`, `--color-warning-dim`

Surface 특수:
- `--color-surface-event #3c1e50`, `--color-surface-community #19284b`

### 3-3. Typography

- family: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- size: `$font-size-9 / 10 / 11 / 12 / 13 / 15 / 17 / 22 / 28` (rem)
- weight: regular 400 / medium 500 / semibold 600 / bold 700
- line-height: tight 1.2 / base 1.5 / relaxed 1.6
- letter-spacing: tight `-0.02em` / base 0 / wide `0.04em`
- 클래스 (`base/typography.scss`): `.text-hero / .text-page-title / .text-topbar / .text-section-title / .text-body-bold / .text-body / .text-caption / .text-micro / .text-badge`
- mixin (`mixins/typography.scss`): `text-hero / text-page-title / text-topBar / text-section-title / text-body-bold / text-body / text-caption / text-micro / text-badge / text-ellipsis`
- 색상 유틸: `.text-primary / .text-secondary / .text-muted / .text-code / .text-brand / .text-violet / .text-success / .text-danger`

### 3-4. Spacing (8pt grid)

`$space-1 4 / 2 8 / 3 12 / 4 16 / 5 20 / 6 24 / 8 32 / 10 40 / 12 48`

Layout constants:
- `$layout-screen-width: 375px`
- `$layout-card-width: 343px` (= 375 - 16×2)
- `$layout-h-pad: 16px` (= `$space-4`)
- `$layout-topbar-height: 52px`
- `$layout-bottombar-height: 56px` ❓ 미사용 (BottomNav 없음)
- `$layout-section-sep: 8px`

### 3-5. Radius

`$radius-none 0 / sm 4 / md 6 / lg 8 / xl 10 / 2xl 12 / full 9999px`

### 3-6. Breakpoints

`$bp-mobile-sm 320 / $bp-mobile 375 / $bp-mobile-lg 428 / $bp-tablet 768 / $bp-desktop 1024`

- body max-width `$bp-mobile-lg` (428px), `margin: 0 auto`
- TopBar/Drawer 도 동일하게 `$bp-mobile-lg` 폭으로 중앙 정렬
- mixin: `@include from-mobile-lg | from-tablet | from-desktop | only-mobile | small-mobile | retina`

### 3-7. Z-index

`$z-base 0 / above 1 / dropdown 100 / sticky 200 (TopBar) / drawer 300 / modal-bg 400 / modal 410 / sheet 420 / toast 500`

### 3-8. Mixins (그 외)

- flex: `flex-row($gap, $align, $justify) / flex-col / flex-center / flex-between / flex-end / flex-col-center`
- layout: `page-layout / page-content($topbar-h) / h-pad / card-width / section-sep / scroll-row($gap, $pad) / grid-2col($gap) / overlay($z)`
- media: 위 3-6 참조
- background, table — 별도 파일 (`_background.scss`, `_table.scss`)

---

## 4. 글로벌 컴포넌트 (`web/src/global/ui/`)

| 컴포넌트 | 위치 | props / variant | 용도 |
|---|---|---|---|
| `LabelBadge` | `global/ui/badge/LabelBadge.jsx` | `variant: update/patch/cafe/tip/important/mustread`, `label?` | 카드 카테고리 분류 (alpha 채우기, border 없음) |
| `PinnedBadge` | `global/ui/badge/PinnedBadge.jsx` | 동일 variant | 강조 (alpha 채우기 + border) |
| `StatusBadge` | `global/ui/badge/StatusBadge.jsx` | `variant: active/new/hot/ended/pick/limited/event/reward` | 상태 표시 (solid) |
| `SectionBlock` | `global/ui/mobile/section/SectionBlock.jsx` | `title, to?, linkText?, children` | 섹션 wrapper (제목+선택적 "전체 보기 →" 링크) |
| `SectionHeader` | `global/ui/mobile/section/SectionHeader.jsx` | `title, to?, linkText?` | SectionBlock 내부 헤더 — 좌측 액센트 바 + 제목 + 우측 링크 |
| `RenewalNoticeModal` | `global/ui/renewalNoticeModal/RenewalNoticeModal.jsx` | `isOpen, onClose, message?` | createPortal `#modal` → "리뉴얼 작업 중" 안내 (comingSoon 클릭 시) |
| `ResponseModal` | `global/ui/responseModal/ResponseModal.jsx` | `open, success, message, onClose` | createPortal → 성공/실패 아이콘 + 메시지 + 확인. ResponseListener 가 글로벌 마운트 |
| `VisibleToggle` | `global/ui/visibleToggle/VisibleToggle.jsx` | `visible, onChange, disabled?` | on/off 토글 스위치 (admin UI 잔재) |

기타 글로벌 utils:
- `web/src/global/utils/datetime/dateUtils.js` — 날짜 포맷터

❌ 글로벌 `Button` / `Card` / `Modal` / `FormField` / `Input` 추상 컴포넌트 **없음**. 페이지 단위로 직접 markup + .module.scss 처리. (모달은 createPortal 패턴만 공유)

❌ `web/src/global/styles/components/composite/` 폴더는 빈 폴더 (placeholder)

---

## 5. 인증 / 라우트 가드

### 5-1. 인증 흐름

1. App mount → `AuthProvider` 가 `requestUserHealthCheck()` dispatch
2. 서버가 cookie(ACCESS_TOKEN/REFRESH_TOKEN) 기반으로 사용자 정보 반환 → `auth.setUser({userDetail, useRole})` 또는 실패 → `state.auth.user = null`
3. `state.auth.initialized = true` 전까지 `AuthProvider` 가 `return null` (전체 화면 blank)
4. 모든 API 요청: `axios withCredentials: true` (cookie 자동 전송)
5. 401 응답 → `infra/http/client.js` interceptor 가 `/api/auth/refresh` 1회 호출 → 성공 시 원 요청 retry / 실패 시 `data: null` 반환 (guest fallback)
6. login: `useAuthentication.login()` → 네이버 OAuth URL 로 `window.location.href` redirect (`sessionStorage.redirectPath` 저장)
7. OAuth 콜백: `/auth/callback` → `AuthCallback` 컴포넌트 → `requestUserHealthCheck` → `redirectPath` 로 `window.location.replace`
8. logout: `requestUserLogout` dispatch → `clearUser` → `window.location.replace("/")`

### 5-2. AuthGuard

```js
// web/src/app/router/guards/AuthGuard.jsx
<AuthGuard allow="ADMIN" />
<AuthGuard allow={["ADMIN","USER"]} />
```

- `state.auth.initialized` false → null (blank)
- `user === null` → `sessionStorage.redirectPath` 저장 + `<Navigate to="/" replace />`
- `allow` 지정 시 `userRole` not in allowList → `<Navigate to="/" replace />`
- 통과 시 `<Outlet />`

### 5-3. 권한 매트릭스 (현재 live)

| 라우트 | guest | USER | ADMIN |
|---|---|---|---|
| `/` | O | O | O |
| `/auth/callback` | O | O | O |
| `/coupons` | O | O | O |
| `/events` | O | O | O |
| `/notices` | O | O | O |
| `/notice/:id` | O | O | O |
| `/mode/history` | O | O | O |

- USER/ADMIN 전용 라우트: 현재 없음 (UserRoutes/AdminRoutes 자식 비어있음)

---

## 6. 모바일 우선 / 반응형

- 단일 모바일 레이아웃 — body `max-width: $bp-mobile-lg` (428px), `margin: 0 auto`, `overflow-x: hidden`, `min-height: 100dvh`
- TopBar/Drawer 도 동일 max-width 로 중앙 정렬 (`left: 50%; transform: translateX(-50%)`)
- `pageContent` padding-top 52px (TopBar 높이)
- tablet/PC 좌우 여백: body 외곽 — 다크 배경 그대로 노출 (별도 PC 레이아웃 없음)
- Drawer 만 `from-tablet` 분기 (`position: absolute` + clip-path 로 wrapper 안쪽 한정)
- media query 사용처: Drawer overlay/패널 만. 그 외 페이지/컴포넌트는 모바일 단일

---

## 7. 사용자 시나리오 (Persona × Flow)

### guest
- 홈 진입 → TopBar 우측 "N 네이버 로그인" 버튼 노출
- 모든 live 페이지 접근 가능 (인증 필요 페이지 현재 없음)
- 햄버거 → Drawer → 메인/컨텐츠 그룹 메뉴 사용
- comingSoon 메뉴 클릭 → RenewalNoticeModal
- 로그인 클릭 → 네이버 OAuth → `/auth/callback` → 진입 직전 페이지 복귀

### user (네이버 로그인 후)
- TopBar 우측 "로그아웃" 노출
- Drawer 상단에 프로필 (avatar + nickname + email) 노출
- 접근 가능 라우트는 guest 와 동일 (USER 전용 라우트 미구현)
- 로그아웃 → `requestUserLogout` → `/` replace

### admin
- AuthGuard 는 `allow="ADMIN"` 지원
- 그러나 AdminRoutes 자식 전부 legacy 폐기 (2026-05-09) → **admin 접근 가능 페이지 0개**
- 현재 admin/USER 시각적 분리 없음 (Drawer / TopBar 모두 동일)

---

## 8. 다음 단계 (planner reverse 기획용 hook)

planner-ia 가 받을 핵심:
- **도메인 list** (live): home, coupons, events, notices(+detail), historyMode, authentication(callback only)
- **도메인 list** (보류/legacy): community, quiz(no page), profile, admin, kbo, skill, encyclopedia
- **페이지 트리**: 위 §2-2 표
- **진입 경로**: Drawer MENU_GROUPS + Home 의 SectionBlock `to` 링크 (`/coupons /events /notices`)

planner-feature-spec 이 받을 핵심:
- TopBar `home | page` 2 variant — 페이지별 어느 쪽을 쓸지 정책 필요
- 페이지별 화면 분기 (loading / empty / error / normal) — 현재 코드는 명시적 loading state 없음 (Suspense fallback "로딩중..." 만), error 처리 빈약 ❓
- 글로벌 ResponseModal 발동 조건 (`state.operation.lastOperation`) — 어떤 thunk 가 트리거하는지 매핑 필요
- AuthGuard 의 `redirectPath` 동작 — guest 가 인증 필요 페이지 진입 시도 → 로그인 후 복귀 (현재 인증 필요 페이지 없어 미발동)

designer 가 받을 핵심:
- 글로벌 토큰 (color/font/spacing/radius/breakpoints/zindex)
- 글로벌 컴포넌트: Badge 3종 / SectionBlock+Header / RenewalNoticeModal / ResponseModal / VisibleToggle
- Layout 트리: AppWrapper → MobileLayout (TopBar + Drawer + pageContent)
- 모바일 단일 (max-width 428px) + 중앙 정렬 wrapper
- Drawer 상호작용 (slide + overlay + body scroll lock)

---

## 9. 발견된 mismatch / 미정 항목

1. ❓ **TopBar page variant 미사용** — `variant="page"` (back/title/rightAction) 가 구현되어 있으나 모든 live 페이지가 `useSetTopBar` 미호출 또는 `variant: "home"`. NoticeDetail 처럼 detail 페이지에서도 햄버거+로고 그대로 노출됨.
2. ❓ **Drawer 메뉴 badge 하드코딩** — `MENU_GROUPS.js` 의 `이벤트 badge: 5`, `쿠폰 badge: 3` 정적값. 실제 활성 카운트와 무관.
3. ❓ **BottomNav 부재** — `$layout-bottombar-height: 56px` 토큰과 `page-content.has-bottombar` 분기만 존재. 컴포넌트 미구현. planner 결정 필요.
4. ❓ **인증 필요 라우트 0개** — UserRoutes / AdminRoutes 자식 전부 폐기. AuthGuard 동작은 코드상 멀쩡하나 검증 경로 없음.
5. ❓ **`/community` 라우트 보류** — `ROUTE_PATHS.community`, `ROUTE_META.COMMUNITY` 만 정의, 라우트 등록 X. 도메인 코드(`domains/community/**`)는 광범위 잔존 — 정리 필요 (admin 페이지 + mobile 페이지 + feature hooks).
6. ❓ **redux store 의 `community` reducer 주석 처리** — `app/store/store.js` 에 주석. `domains/community/store/slices.js` 잔재 가능.
7. ❓ **`/skill /encyclopedia`** — comingSoon 으로만 표시. planner 가 향후 도입 여부 확정 필요.
8. ❓ **`AuthProvider` initialized false 동안 전체 blank** — health-check 지연 시 첫 페인트 X. UX 정책 검토 필요 (스플래시 vs blank).
9. ❓ **NoticeDetail `document.title` 직접 설정** — 다른 페이지는 라우터 `handle` (`ROUTE_META.*.title`) 기반. detail 만 useEffect 로 직접 수동 처리 — title sync 메커니즘 일관성 부족.
10. ❓ **`AuthCallback` 의 `setUserProperties(data.userRole)`** — `data` 가 null 인 케이스 가드 없음. health-check 실패 분기 의도 명확화 필요.
11. ❓ **HomeScreen `MOCK_POSTS` / `MOCK_TEAM_POSTS` import 잔재** — 사용처는 community 주석 블록 안에 있어 unreachable. dead import.
12. ❓ **`global/styles/components/composite/`** 빈 폴더 — placeholder. 의도 미정.
13. ❓ **`useSetTopBar` 의 `useEffect` deps `[]`** — config 가 동적으로 바뀌어도 갱신 안 됨. 페이지가 mount 시 1회만 설정하는 패턴 강제. planner 가 이 제약을 인지하고 IA 설계해야 함.

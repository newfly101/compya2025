# AppLayout — 요구사항 정의서

> 작성일: 2026-05-11
> 모드: reverse
> 입력: `ia.md` + `structure.md` + 코드 cross-check
> 본 문서는 **확정 요구사항** (Draft 아님 — 사실 baseline)

---

## 0. 작성 방식

- **사실** = 코드 검증 완료 (해당 파일 cite)
- **가정 (🟨)** = 합리적 default — 사용자 수정 가능
- **미정 (❓)** = 결정 필요 — 별도 라운드
- **위험 (🔴)** = 강제 HITL (법무/결제/권한/DB 파괴적)

---

## 1. 기능 요구사항 (FR)

### FR-1. 글로벌 Provider 체인

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-1.1 | App mount 시 `<Provider store={store}>` 로 redux 컨텍스트 제공 | 사실 | `AppProvider.jsx` |
| FR-1.2 | App mount 시 `<ResponseListener/>` 가 글로벌 ResponseModal 마운트 | 사실 | `AppProvider.jsx` |
| FR-1.3 | App mount 시 `<AuthProvider/>` 가 `requestUserHealthCheck()` 1회 dispatch | 사실 | `AuthProvider.jsx` L11 |
| FR-1.4 | `state.auth.initialized === false` 동안 children 렌더 차단 (`return null`) | 사실 | `AuthProvider.jsx` L22 |
| FR-1.5 | health-check 실패 (catch) 시 GA4 user property `'GUEST'` 설정 | 사실 | `AuthProvider.jsx` L17 |

### FR-2. 라우팅

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-2.1 | 단일 root `path: "/"` → `<AppWrapper/>` 가 모든 라우트의 부모 | 사실 | `router/index.jsx` |
| FR-2.2 | children: `[...PublicRoutes, ...userRoutes, ...AdminRoutes]` | 사실 | `router/index.jsx` |
| FR-2.3 | PublicRoutes 등록 페이지: home / coupons / events / notices / notice detail / history mode / auth callback | 사실 | `PublicRoutes.jsx` |
| FR-2.4 | userRoutes / AdminRoutes children 비어있음 (legacy 폐기 2026-05-09) | 사실 | `UserRoutes.jsx` / `AdminRoutes.jsx` |
| FR-2.5 | 모든 lazy 페이지는 Suspense fallback "로딩중..." 으로 wrap | 사실 | `MobileLayout.jsx` L72 |

### FR-3. TopBar

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-3.1 | `variant === "home"` 일 때: 햄버거 (좌) + 로고 "⚾ 컴프야펀" (중) + 로그인/로그아웃 (우) | 사실 | `TopBar.jsx` L31-49 |
| FR-3.2 | `variant === "page"` 일 때: back ‹ (좌) + title (중, max-width 200px) + rightAction (우) | 사실 | `TopBar.jsx` L12-28 |
| FR-3.3 | TopBar 높이 52px (`$layout-topbar-height`) | 사실 | `variables/_layout.scss` |
| FR-3.4 | TopBar 는 모바일 wrapper (max-width 428px) 와 동일 폭으로 중앙 정렬 | 사실 | `structure.md` § 6 |
| FR-3.5 | TopBar z-index `$z-sticky: 200` | 사실 | `variables/_zindex.scss` |
| FR-3.6 | 로고 클릭 → `<Link to="/">` (홈 이동) | 사실 | `TopBar.jsx` L38 |
| FR-3.7 | 로그인 버튼: 비로그인 시 "N 네이버 로그인" → `useAuthentication.login()` 호출 | 사실 | `TopBar.jsx` L45 |
| FR-3.8 | 로그아웃 버튼: 로그인 시 "로그아웃" → `useAuthentication.logout()` 호출 | 사실 | `TopBar.jsx` L44 |
| FR-3.9 | 햄버거 버튼 → `openDrawer()` 호출 | 사실 | `TopBar.jsx` L33 |
| FR-3.10 | back 버튼 → `config.onBack()` 호출 (페이지가 주입) | 사실 | `TopBar.jsx` L16 |
| FR-3.11 | 현재 live 페이지 중 `variant: "page"` 사용처: **0개** (HomeScreen 만 `useSetTopBar({ variant: "home" })` 호출) | 사실 | `HomeScreen.jsx` L37 |

❓ **미정**: page variant 의 실제 사용처 (NoticeDetail 등). designer 단계에서 결정.

### FR-4. Drawer

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-4.1 | 좌측 fixed slide 메뉴. top 52px, width 75% (max 250px), height `100dvh - 52px` | 사실 | `Drawer.module.scss` |
| FR-4.2 | 오버레이 클릭 → `closeDrawer()` | 사실 | `Drawer.jsx` L28 |
| FR-4.3 | 패널 transform `translateX(-100%)` → `0` (open 시) | 사실 | `Drawer.module.scss` |
| FR-4.4 | 로그인 상태: avatar (`user.profileImage`) + nickname + email 표시 | 사실 | `Drawer.jsx` L36-45 |
| FR-4.5 | 비로그인 상태: "로그인하고 더 많은 컨텐츠 이용하기!" + "N 네이버 로그인" 버튼 | 사실 | `Drawer.jsx` L47-55 |
| FR-4.6 | 메뉴 그룹: 메인 (홈/이벤트/쿠폰/공지) + 컨텐츠 (스킬/백과사전/히스토리) | 사실 | `MENU_GROUPS.js` |
| FR-4.7 | 현재 라우트 (`location.pathname === item.to`) 활성 표시 (좌측 액센트 바 3×24, brand-violet) | 사실 | `Drawer.jsx` L65 |
| FR-4.8 | 일반 메뉴 클릭 → `closeDrawer()` + Link navigate | 사실 | `Drawer.jsx` L71 |
| FR-4.9 | `comingSoon: true` 메뉴 클릭 → `preventDefault` + `closeDrawer()` + RenewalNoticeModal open | 사실 | `Drawer.jsx` L18-22, L71 |
| FR-4.10 | Drawer open 시 `document.body.style.overflow = "hidden"` (body scroll lock) | 사실 | `TopBarProvider.jsx` L19-28 |
| FR-4.11 | z-index `$z-drawer: 300` | 사실 | `variables/_zindex.scss` |
| FR-4.12 | 태블릿 이상 (`from-tablet`) — `position: absolute` + clip-path 로 wrapper 안쪽 한정 | 사실 | `Drawer.module.scss` |

### FR-5. pageContent / scroll behavior

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-5.1 | pageContent: `padding-top: 52px`, `flex: 1`, `overflow-y: auto`, `data-scroll-root` | 사실 | `MobileLayout.module.scss` |
| FR-5.2 | `useLocation()` (pathname + search) 변경 시 scroll 즉시 + `setTimeout(0/100/300/600)` + MutationObserver(1500ms) 다중 시도 | 사실 | `MobileLayout.jsx` L16-60 |
| FR-5.3 | 사용자 wheel/touch/keydown/pointerdown 발생 시 pending scroll-top 모두 취소 | 사실 | `MobileLayout.jsx` L46-54 |

### FR-6. ResponseModal (글로벌)

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-6.1 | `state.operation.lastOperation` 이 truthy 일 때 ResponseModal 자동 마운트 | 사실 | `ResponseListener.jsx` L10-19 |
| FR-6.2 | modal props: `success` / `message` / `onClose` → `clearLastOperation()` dispatch | 사실 | `ResponseListener.jsx` L13-18 |
| FR-6.3 | createPortal 로 `#modal` 에 마운트 | 사실 | `ResponseModal.jsx` |
| FR-6.4 | 성공/실패 아이콘 + 메시지 + 확인 버튼 | 사실 | `ResponseModal.jsx` |

### FR-7. AuthGuard (route-level)

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-7.1 | `state.auth.initialized === false` → null block | 사실 | `AuthGuard.jsx` L9 |
| FR-7.2 | `user === null` → `sessionStorage.redirectPath = pathname` + `<Navigate to="/" replace/>` | 사실 | `AuthGuard.jsx` L11-14 |
| FR-7.3 | `allow` prop 지정 시 `userRole not in allow` → `<Navigate to="/" replace/>` | 사실 | `AuthGuard.jsx` L16-21 |
| FR-7.4 | 통과 시 `<Outlet/>` 렌더 | 사실 | `AuthGuard.jsx` L23 |
| FR-7.5 | 현재 사용처: 0개 (UserRoutes / AdminRoutes children 비어있음) | 사실 | `UserRoutes.jsx` / `AdminRoutes.jsx` |

🔴 **권한 / auth 분야**: USER/ADMIN 전용 라우트 신규 도입 시 본 가드 활용. 신규 권한 등급 / SecurityConfig 변경 시 HITL.

### FR-8. GA4 / Analytics

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| FR-8.1 | AppWrapper 마운트 시 `useGA4PageView()` 훅 호출 → 라우트 변경마다 page view push | 사실 | `AppWrapper.jsx` L6 |
| FR-8.2 | health-check 실패 시 GA4 user property `'GUEST'` 설정 | 사실 | `AuthProvider.jsx` L17 |
| FR-8.3 | NoticeDetail 은 `document.title` 직접 설정 + `pushEvent({event: "page_view", ...})` 수동 호출 | 사실 | `NoticeDetailScreen.jsx` L14-24 |

❓ **미정**: title sync 일관성 — 다른 페이지는 router `handle` 기반, NoticeDetail 만 수동. 정책 통일 필요.

---

## 2. 비기능 요구사항 (NFR)

### NFR-1. 성능

| ID | 요구사항 | 측정 |
|---|---|---|
| NFR-1.1 | 모든 도메인 페이지 lazy 로딩 (`React.lazy` + Suspense) | 코드 검증 — `PublicRoutes.jsx` |
| NFR-1.2 | 글로벌 styles 단일 import (`global.scss`) — 빌드 시 1회 | `main.jsx` |
| NFR-1.3 | TopBar/Drawer/Layout 컴포넌트는 모듈 SCSS — bundle splitting 친화 | `*.module.scss` |
| NFR-1.4 | scroll-to-top 다중 시도 (`setTimeout` + MutationObserver) — Suspense fallback 후 mount 케이스 cover | `MobileLayout.jsx` L27-43 |

### NFR-2. 접근성 (a11y)

| ID | 요구사항 | 상태 |
|---|---|---|
| NFR-2.1 | 햄버거 버튼 `aria-label="메뉴"` | 사실 — `TopBar.jsx` L33 |
| NFR-2.2 | back 버튼 `aria-label="뒤로가기"` | 사실 — `TopBar.jsx` L16 |
| NFR-2.3 | 메뉴 active 시 색상 변화 + 좌측 액센트 바 (시각적 구분) | 사실 — `Drawer.module.scss` |
| NFR-2.4 | Drawer overlay 클릭 닫힘 (escape 가능) | 사실 — `Drawer.jsx` L28 |
| NFR-2.5 | Drawer keyboard escape 처리 | ❓ 미정 — 코드 미구현 |

### NFR-3. 반응형 / 모바일 우선

| ID | 요구사항 | 상태 |
|---|---|---|
| NFR-3.1 | body `max-width: 428px` (`$bp-mobile-lg`), 중앙 정렬 | 사실 — `global.scss` |
| NFR-3.2 | TopBar / Drawer 도 동일 max-width 중앙 정렬 (`left: 50%; transform: translateX(-50%)`) | 사실 |
| NFR-3.3 | tablet 이상에서 body 외곽 다크 배경 노출 (별도 PC 레이아웃 없음) | 사실 |
| NFR-3.4 | Drawer 만 tablet 분기 (`from-tablet` mixin) — `position: absolute` + clip-path | 사실 |
| NFR-3.5 | media query 사용처 — Drawer overlay/패널 만. 그 외 0 | 사실 |

### NFR-4. 보안 / 인증

🔴 **권한 분야** — 본 PRD 는 기존 운영 cite 만. 변경 사안 X.

| ID | 요구사항 | 상태 | 근거 |
|---|---|---|---|
| NFR-4.1 | axios `withCredentials: true` — 쿠키 자동 전송 | 사실 cite | `infra/http/client.js` |
| NFR-4.2 | 401 응답 시 `/api/auth/refresh` 1회 호출 → 성공 retry / 실패 `data: null` (guest fallback) | 사실 cite | `infra/http/client.js` |
| NFR-4.3 | 네이버 OAuth 콜백 → `/auth/callback` → health-check → `redirectPath` 복귀 | 사실 cite | `AuthCallBack.jsx` |

### NFR-5. 가독성 / 유지보수

| ID | 요구사항 | 상태 |
|---|---|---|
| NFR-5.1 | 디자인 토큰은 raw + semantic 2단 구조 (`variables/*` + `semantic/_color.scss`) | 사실 |
| NFR-5.2 | `*.module.scss` 자동 토큰 forward (vite `additionalData`) — `@use` 없이 사용 가능 | 사실 |
| NFR-5.3 | TopBar config 는 페이지가 `useSetTopBar(config)` 로 주입 — context pattern | 사실 |
| NFR-5.4 | `useSetTopBar` 의 `useEffect` deps `[]` — mount 시 1회만 설정 (page 가 config 동적 변경 시 갱신 X) | 사실 — `TopBarProvider.jsx` L51 |

❓ **미정**: deps `[]` 제약 — 페이지가 동적 title 변경 시 신경 써야 함. designer 단계 인지 필요.

---

## 3. 디자인 토큰 요구사항 (designer 입력)

> 상세는 `structure.md` § 3 참조. 본 PRD 는 핵심만.

### 3-1. Color (라우트 본 layer 사용처 중심)

| Semantic | Raw | 본 layer 사용처 |
|---|---|---|
| `--color-bg-deepest` | `$color-bg-900 #0f0a14` | body / TopBar |
| `--color-bg-deep` | `$color-bg-800 #140f1f` | Drawer |
| `--color-bg-overlay` | `$color-bg-700 #18141f` | Drawer overlay |
| `--color-bg-card` | `$color-bg-600 #1f1a29` | pageContent 자식 카드 |
| `--color-brand` | `$color-brand-400 #a86af0` | 로고 / brand 강조 |
| `--color-brand-violet` | `$color-brand-600 #6c5ce7` | Drawer active 액센트 |
| `--color-success` | `#03c75a` | 네이버 로그인 버튼 (네이버 그린) |
| `--color-text-primary` | white 92% | TopBar 타이틀 / 메뉴 라벨 |
| `--color-text-secondary` | white 60% | 그룹 라벨 |
| `--color-text-muted` | white 38% | 보조 텍스트 |
| `--color-border` | white 06% | 구분선 |

### 3-2. Layout 상수

| Token | 값 | 사용처 |
|---|---|---|
| `$layout-topbar-height` | 52px | TopBar height / pageContent padding-top |
| `$layout-bottombar-height` | 56px | ❓ 미사용 (BottomNav 없음) |
| `$layout-h-pad` | 16px | 좌우 padding |
| `$bp-mobile-lg` | 428px | body / TopBar / Drawer max-width |

### 3-3. Z-index

| Token | 값 | 사용처 |
|---|---|---|
| `$z-base` | 0 | body |
| `$z-sticky` | 200 | TopBar |
| `$z-drawer` | 300 | Drawer overlay + 패널 |
| `$z-modal-bg` | 400 | ResponseModal 배경 |
| `$z-modal` | 410 | ResponseModal |
| `$z-toast` | 500 | 미래 토스트 |

### 3-4. Typography (글로벌 layer 사용)

| Class | 사용처 |
|---|---|
| `.text-topbar` | TopBar 타이틀 |
| `.text-body-bold` | Drawer 메뉴 라벨 |
| `.text-caption` | Drawer 그룹 라벨 |

---

## 4. 사용자 확인 필요 항목

1. ❓ **Drawer badge 하드코딩** (이벤트 5 / 쿠폰 3) — 활성 카운트 동기화 정책 (별도 라운드)
2. ❓ **BottomNav 도입 여부** — 토큰만 존재 (`$layout-bottombar-height: 56px`). 미정
3. ❓ **TopBar page variant** — 모든 live 페이지가 미사용 또는 home. 사용 정책 미정
4. ❓ **AuthProvider initialized false 동안 blank** — 스플래시 vs blank UX 결정 필요
5. ❓ **Drawer keyboard escape (a11y)** — 미구현. 도입 여부 미정
6. ❓ **title sync 일관성** — NoticeDetail 만 `document.title` 수동. 통일 정책 미정
7. ❓ **`useSetTopBar` deps `[]` 제약** — 동적 title 미지원. 정책 인지 필요
8. ❓ **AuthCallback null guard** — `data.userRole` null 케이스 가드 없음
9. ❓ **HomeScreen dead import** — `MOCK_POSTS / MOCK_TEAM_POSTS` (community 주석 블록 안)
10. 🔴 **신규 권한 등급 / SecurityConfig 변경** — 본 PRD 결정 사안 X. 도입 시 별도 HITL

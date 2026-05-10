# AppLayout — Feature Spec (기능 명세)

> 작성일: 2026-05-11
> 모드: reverse
> 입력: `requirements.md` + `ia.md` + 코드 cross-check
> 본 문서는 **확정 기능 명세** — Given/When/Then (주어진 상황 / 행동 / 결과) 패턴
> ⭐ designer agent 의 핵심 입력 — Figma frame 자동 그리기 기준

---

## 0. 글로벌 layer 의 핵심 화면 요소 (designer hook)

> Figma 프레임 직접 그리기용 elements. 좌표 / 색상 / 폰트는 `requirements.md` § 3 토큰 참조.

### 0-1. 모바일 뷰포트

- **wrapper**: 428px × 100dvh (body max-width `$bp-mobile-lg`), 중앙 정렬, 배경 `--color-bg-deepest`
- **TopBar**: 428px × 52px, fixed top, `--color-bg-deepest`, z-index 200
- **pageContent**: 428px × `100dvh - 52px`, padding-top 52px, scroll-y auto
- **Drawer (open)**: 좌측 fixed, top 52px, width `min(75%, 250px)`, height `100dvh - 52px`, `--color-bg-deep`, z-index 300
- **Drawer overlay**: 전체 화면 `rgba(0,0,0,0.5)`, z-index 299

### 0-2. TopBar variants (2종)

**variant = "home"** (현재 모든 live 페이지 default):

```
┌────────────────────────────────────────────┐
│ [≡]      ⚾  컴프야펀          [로그인]    │   height 52px
└────────────────────────────────────────────┘
  16px                                   16px
```

- 좌 (40×40): 햄버거 (3 줄, white, 32px 클릭 영역)
- 중: 로고 텍스트 `⚾  컴프야펀` (`.text-topbar`, `--color-brand`)
- 우 (auto): 비로그인 시 "N 네이버 로그인" 버튼 (`--color-success` 배경) / 로그인 시 "로그아웃" 텍스트 버튼

**variant = "page"** (구현 존재 / 사용처 0):

```
┌────────────────────────────────────────────┐
│ [‹]     공지사항 상세 페이지     [rightAct] │   height 52px
└────────────────────────────────────────────┘
```

- 좌 (40×40): back ‹ 화살표
- 중: title (max-width 200px, ellipsis, `.text-topbar`)
- 우 (auto): rightAction 슬롯 (페이지 주입 — 보통 공유/북마크 등)

🟨 **가정 (designer)**: page variant 는 코드 존재하나 사용처 0. designer 가 Figma 에 2 variants 모두 그리되, 사용 매핑은 별도 라운드에서 결정.

### 0-3. Drawer 구조

```
┌──────────────────────┐
│ ┌──────────────────┐ │
│ │ [avatar]  닉네임  │ │   profile (로그인 시)
│ │           email   │ │
│ └──────────────────┘ │
│                      │
│ 메인                  │   group label
│  🏠 홈                │
│  🎪 이벤트     [5]    │   active = 좌측 액센트 바
│  🎫 쿠폰 코드  [3]    │
│  📢 공지사항          │
│                      │
│ 컨텐츠                │
│  🎮 스킬 시뮬레이터    │   comingSoon
│  📖 추천 백과사전      │   comingSoon
│  🎯 히스토리 탐색기    │
└──────────────────────┘
  width: min(75%, 250px)
  height: 100dvh - 52px
```

- profile (로그인): avatar 40×40 원형 + nickname (`.text-body-bold`) + email (`.text-caption text-muted`)
- profile (비로그인): "로그인하고 더 많은 컨텐츠 이용하기!" + 네이버 로그인 버튼
- group label: `.text-caption text-secondary`, padding-left 16px
- menu item: 48px height, icon 24×24 + label + badge (옵션)
- menu item active: 좌측 액센트 바 (3×24, `--color-brand-violet`), 배경 `--color-brand-violet-alpha-12`

---

## 1. 사용자 시나리오 (Given/When/Then)

> "주어진 상황 (Given) / 행동 (When) / 결과 (Then)" — 주니어 친화 표현

### Scenario 1: 첫 진입 (guest, 헬스체크 진행 중)

| 단계 | 내용 |
|---|---|
| **Given** | 사용자가 처음 사이트 진입 (URL `/`). cookie 없음. `state.auth.initialized === false` |
| **When** | App mount → `AuthProvider` 가 `requestUserHealthCheck()` dispatch |
| **Then** | `initialized === false` 동안 **전체 화면 blank** (children null block). 헬스체크 응답 후 `initialized === true` → MobileLayout 렌더 → 홈 페이지 표시. TopBar 우측 "N 네이버 로그인" 노출 |

❓ **미정**: blank 동안 스플래시 / 로딩 인디케이터 미표시. UX 정책 결정 필요.

### Scenario 2: 첫 진입 (user, cookie 보유)

| 단계 | 내용 |
|---|---|
| **Given** | 사용자 cookie 보유 (ACCESS_TOKEN). `initialized === false` |
| **When** | App mount → health-check → 서버가 user data 반환 |
| **Then** | `state.auth.user = userDetail`, `userRole`, `initialized = true`. 홈 페이지 표시. TopBar 우측 "로그아웃" 노출. Drawer 열면 profile 영역 (avatar + nickname + email) |

### Scenario 3: 햄버거 → Drawer open

| 단계 | 내용 |
|---|---|
| **Given** | 사용자가 임의 페이지에 있음 (TopBar `variant === "home"`) |
| **When** | TopBar 좌측 햄버거 클릭 |
| **Then** | `openDrawer()` → `isDrawerOpen = true`. Drawer 패널 transform 0 (slide-in). overlay 페이드인. `document.body.style.overflow = "hidden"` (배경 스크롤 잠금) |

### Scenario 4: Drawer 메뉴 클릭 (live 메뉴)

| 단계 | 내용 |
|---|---|
| **Given** | Drawer 열려 있음. 사용자가 "이벤트" 메뉴 hover |
| **When** | 메뉴 클릭 |
| **Then** | `closeDrawer()` 호출 → Drawer slide-out + overlay 페이드아웃. `<Link to="/events">` navigate → `/events` 라우트. scroll-to-top 실행. 새 페이지 lazy 로드 (Suspense "로딩중...") → mount 완료. `location.pathname === "/events"` 가 되며 다음 Drawer open 시 "이벤트" 메뉴 active 표시 |

### Scenario 5: Drawer 메뉴 클릭 (comingSoon 메뉴)

| 단계 | 내용 |
|---|---|
| **Given** | Drawer 열려 있음. 사용자가 "스킬 시뮬레이터" hover (comingSoon 표시) |
| **When** | 메뉴 클릭 |
| **Then** | `preventDefault()` (navigate 차단). `closeDrawer()` + `setRenewalOpen(true)`. Drawer slide-out 직후 RenewalNoticeModal 표시 ("리뉴얼 작업 중" 안내) |

### Scenario 6: 로그인 버튼 클릭 (TopBar 또는 Drawer)

| 단계 | 내용 |
|---|---|
| **Given** | 사용자 비로그인. TopBar 또는 Drawer 의 "N 네이버 로그인" 버튼 노출 |
| **When** | 사용자가 버튼 클릭 |
| **Then** | `useAuthentication.login()` 호출 → `sessionStorage.setItem("redirectPath", current pathname)` → `window.location.href = NAVER_OAUTH_URL`. 네이버 OAuth 완료 후 → `/auth/callback` → health-check → `sessionStorage.redirectPath` 로 `window.location.replace` |

### Scenario 7: 로그아웃 버튼 클릭

| 단계 | 내용 |
|---|---|
| **Given** | 사용자 로그인. TopBar 우측 "로그아웃" 버튼 노출 |
| **When** | 버튼 클릭 |
| **Then** | `requestUserLogout()` dispatch → 서버 cookie 무효화 → `clearUser()` reducer → `window.location.replace("/")` (full reload) |

### Scenario 8: 라우트 변경 → scroll-to-top

| 단계 | 내용 |
|---|---|
| **Given** | 사용자가 임의 페이지 스크롤 down 상태 (예: `/coupons` scrollTop 500) |
| **When** | Drawer 또는 SectionBlock 링크로 다른 라우트 navigate |
| **Then** | `useLocation()` 변경 감지 → MobileLayout useEffect 발동. `scrollRef.scrollTo(0,0)` + `window.scrollTo(0,0)` 즉시. 추가로 `setTimeout(0/100/300/600)` 4회 + MutationObserver(1500ms 한도) 다중 시도 — Suspense fallback 후 컨텐츠 mount 케이스 cover. 사용자가 wheel/touch/keydown/pointerdown 발생 시 pending 즉시 취소 |

### Scenario 9: 글로벌 ResponseModal 표시

| 단계 | 내용 |
|---|---|
| **Given** | 임의 페이지에서 thunk dispatch (예: 쿠폰 발급 요청) |
| **When** | thunk 가 `state.operation.lastOperation = {success, message}` 업데이트 |
| **Then** | `ResponseListener` 가 selector 로 구독 중 → ResponseModal 마운트 (createPortal `#modal`). 사용자가 "확인" → `clearLastOperation()` dispatch → `lastOperation = null` → 모달 unmount |

### Scenario 10: AuthGuard 차단 (현재 미발동 — 인증 필요 라우트 0개)

| 단계 | 내용 |
|---|---|
| **Given** | 가상: USER 전용 라우트 도입됨 (예: `/mypage`). guest 가 직접 URL 진입 |
| **When** | AuthGuard 가 `state.auth.user === null` 확인 |
| **Then** | `sessionStorage.setItem("redirectPath", "/mypage")` + `<Navigate to="/" replace/>`. 사용자가 이후 로그인 → 네이버 콜백 → `redirectPath` 복귀 (= `/mypage`) |

🔴 **권한 분야**: 본 Scenario 는 가상. 현 코드 사용처 0. 신규 도입 시 HITL.

### Scenario 11: Suspense 로딩 (lazy 페이지)

| 단계 | 내용 |
|---|---|
| **Given** | 사용자가 처음 `/coupons` 진입 — `CouponScreen` chunk 미로드 |
| **When** | navigate → React.lazy 가 chunk fetch |
| **Then** | Suspense fallback `<div className={styles.loading}>로딩중...</div>` 표시. chunk 로드 완료 → `<Outlet/>` 가 실제 컴포넌트로 교체. MobileLayout 의 MutationObserver 가 자식 추가 감지 → scroll-to-top 재시도 |

---

## 2. TopBar variant 매핑 (도메인별)

> 현재 코드 사실 + 🟨 가정 (designer 단계 결정)

| 도메인 | 현재 코드 | 🟨 designer 권고 (가정) | 사유 |
|---|---|---|---|
| home (`/`) | `useSetTopBar({ variant: "home" })` 명시 | home | 진입 화면. 햄버거 + 로고 + 로그인 |
| coupons (`/coupons`) | 미설정 → default home | home | 1-depth 페이지 |
| events (`/events`) | 미설정 → default home | home | 1-depth 페이지 |
| notices (`/notices`) | 미설정 → default home | home | 1-depth 페이지 |
| notice detail (`/notice/:id`) | 미설정 → default home | **page** ❓ | 2-depth detail → back 버튼 필요 |
| history mode (`/mode/history`) | 미설정 → default home | home | 1-depth 페이지 |
| auth callback (`/auth/callback`) | 미설정 → default home (콜백 시 TopBar 노출 무의미) | (미표시 권고) | 콜백 처리 직후 redirect — UI 무의미 |

❓ **미정**: notice detail 이 page variant 사용해야 하는지. 현재 사용자는 햄버거 → 다른 라우트 navigate 로 빠져나가는 패턴. 결정 별도 라운드.

---

## 3. 화면 분기 (loading / empty / error / normal)

> 글로벌 layer 자체의 분기 (도메인 페이지 내부 분기는 도메인별 PRD)

| 상황 | 글로벌 layer 동작 | 사실/가정 |
|---|---|---|
| **app boot** (`initialized === false`) | `<AuthProvider/>` children null → 전체 blank | 사실 |
| **app booted, route 미일치** | react-router-dom v7 기본 동작 (404 element 미정의 → 빈 outlet) | 사실 — `router/index.jsx` errorElement 미정의 ❓ |
| **lazy chunk 로딩 중** | Suspense fallback "로딩중..." 텍스트 | 사실 |
| **lazy chunk 로딩 실패** | Suspense 미 catch — error boundary 부재 ❓ | 사실 — 글로벌 ErrorBoundary 없음 |
| **API 401** | axios interceptor 가 `/api/auth/refresh` 1회 호출 → 실패 시 `data: null` (guest fallback) | 사실 |
| **API 500 / network** | thunk 가 `state.operation.lastOperation = {success: false, message}` 설정 → 글로벌 ResponseModal 표시 | 사실 (thunk 가 처리 시) |
| **Drawer open + route 변경** | Drawer 닫힘 + scroll-to-top + 새 페이지 mount | 사실 |

❓ **미정**:
- 404 errorElement 미정의 — designer 단계에서 디자인 결정 필요
- 글로벌 ErrorBoundary 부재 — chunk 로딩 실패 / 페이지 런타임 에러 처리 정책 미정

---

## 4. 상호작용 시퀀스 (interaction sequence)

> 사용자 → UI → state → 결과

### Sequence 1: Drawer open/close + body scroll lock

```
사용자 햄버거 클릭
  → TopBar.openDrawer()
    → TopBarProvider.setIsDrawerOpen(true)
      → Drawer rerender (className drawerOpen 추가)
        → CSS transform translateX 0 (slide-in)
      → TopBarProvider.useEffect [isDrawerOpen]
        → document.body.style.overflow = "hidden"

사용자 overlay 클릭 (또는 메뉴 클릭)
  → Drawer.closeDrawer()
    → TopBarProvider.setIsDrawerOpen(false)
      → Drawer rerender (drawerOpen 제거)
        → CSS transform translateX(-100%) (slide-out)
      → TopBarProvider.useEffect [isDrawerOpen]
        → document.body.style.overflow = ""
```

### Sequence 2: 로그인 → OAuth → 콜백 → 복귀

```
사용자 "N 네이버 로그인" 클릭
  → useAuthentication.login()
    → sessionStorage.setItem("redirectPath", current pathname)
    → window.location.href = NAVER_OAUTH_AUTHORIZE_URL

(외부 — 네이버 OAuth 인증)

네이버 → window.location = "/auth/callback?code=..."
  → AuthCallback mount
    → requestUserHealthCheck dispatch
      → 서버 cookie 발급 → state.auth.user set
    → sessionStorage.getItem("redirectPath") 확인
    → window.location.replace(redirectPath || "/")

복귀된 페이지 mount
  → AppProvider 재진입 (full reload)
  → AuthProvider 가 다시 health-check (cookie 있으므로 user 반환)
  → state.auth.initialized = true → 페이지 표시
  → TopBar 우측 "로그아웃" 노출
```

### Sequence 3: 글로벌 ResponseModal (성공/실패)

```
도메인 페이지가 thunk dispatch (예: 쿠폰 발급)
  → thunk.fulfilled
    → operation.slice 가 lastOperation = {success: true, message: "발급 완료"}
  → ResponseListener selector 발동
    → ResponseModal 마운트 (createPortal #modal)
      → 사용자에게 성공 아이콘 + 메시지 + 확인 표시

사용자 "확인" 클릭
  → onClose → dispatch(clearLastOperation())
    → operation.lastOperation = null
  → ResponseListener selector 발동 → null 반환 → ResponseModal unmount
```

---

## 5. 글로벌 layer 가 도메인에 제공하는 API (interface)

> 도메인 페이지가 글로벌 layer 와 통신하는 hook / pattern

| API | 위치 | 용도 | 예 |
|---|---|---|---|
| `useSetTopBar(config)` | `@/app/provider/TopBarProvider` | 페이지 mount 시 TopBar 설정 1회 주입 | `useSetTopBar({ variant: "home" })` |
| `useTopBar()` | 동일 | TopBar context 직접 접근 (`config / openDrawer / closeDrawer`) | 거의 사용 X (대부분 useSetTopBar) |
| `useAuthentication()` | `@/domains/authentication/hooks/useAuthentication.js` | login / logout / user / isAuthenticated | TopBar / Drawer |
| `useGA4PageView()` | `@/infra/analytics/hooks/useGA4PageView.js` | 라우트 변경 시 GA4 page view 자동 push | AppWrapper (글로벌 1회) |
| `state.operation.lastOperation` | redux | 글로벌 응답 모달 트리거 | thunk 가 `setLastOperation` |
| `ROUTE_META / ROUTE_PATHS` | `@/app/router/config/*` | URL / title 상수 참조 | `to={ROUTE_META.COUPONS.path}` |
| `AuthGuard` | `@/app/router/guards/AuthGuard.jsx` | route-level 권한 가드 | UserRoutes / AdminRoutes wrap |

### 5-1. `useSetTopBar` 제약 (designer / developer 인지 필수)

```js
// TopBarProvider.jsx L47-52
export function useSetTopBar(config) {
  const { setConfig } = useTopBar();
  useEffect(() => {
    setConfig(config);
  }, []);   // ⚠️ deps 빈 배열 — mount 1회만 설정
}
```

- **결과**: 페이지가 동적으로 title 변경 (예: detail title 비동기 fetch 후) 시 자동 갱신 X
- **현재 우회**: NoticeDetail 은 `useSetTopBar` 사용 X. `document.title` 직접 useEffect 로 처리
- 🟨 **권고**: deps 를 `[config]` 또는 deep compare 로 변경 권고 — 별도 라운드

---

## 6. designer hook (Figma frame 그리기 입력)

> 본 PRD 의 designer agent 가 Figma 자동 frame 생성 시 사용할 핵심

### 6-1. 필수 Figma frames

| Frame | 크기 | 내용 |
|---|---|---|
| **F1: Mobile wrapper (default)** | 428 × 932 | body 배경 `--color-bg-deepest`. TopBar(home) + pageContent (빈 상태) |
| **F2: TopBar home variant** | 428 × 52 | 햄버거 + 로고 + 로그인 / 햄버거 + 로고 + 로그아웃 (2 states) |
| **F3: TopBar page variant** | 428 × 52 | back + title + rightAction (1 state) |
| **F4: Drawer (guest)** | 428 × 932 | TopBar + Drawer open + overlay. profile: guest 안내 + 네이버 로그인 버튼 |
| **F5: Drawer (user)** | 428 × 932 | TopBar + Drawer open + overlay. profile: avatar + nickname + email |
| **F6: RenewalNoticeModal** | 428 × 932 | comingSoon 클릭 시. createPortal modal |
| **F7: ResponseModal (success)** | 428 × 932 | 성공 아이콘 + 메시지 + 확인 |
| **F8: ResponseModal (error)** | 428 × 932 | 실패 아이콘 + 메시지 + 확인 |
| **F9: Suspense loading** | 428 × 932 | TopBar + "로딩중..." 텍스트 (가운데) |
| **F10: AuthProvider blank** | 428 × 932 | 전체 빈 화면 (`initialized === false`) ❓ 디자인 결정 |

### 6-2. live 7 도메인 페이지 frame (각 도메인 PRD 에서 상세)

> 본 PRD 는 글로벌 layer 만. 도메인별 frame 은 각 `docs/domain/{name}/prd/feature-spec.md` 참조 (TBD)

| 도메인 | URL | TopBar variant (권고) | 비고 |
|---|---|---|---|
| home | `/` | home | HomeScreen — HeroSection / QuickSection / QuizSection / 최신쿠폰 / 공지사항 / 진행이벤트 |
| coupons | `/coupons` | home | CouponScreen — 본 PRD scope out |
| events | `/events` | home | EventScreen — 본 PRD scope out |
| notices | `/notices` | home | NoticeScreen — 본 PRD scope out |
| notice detail | `/notice/:id` | page ❓ | NoticeDetailScreen — 본 PRD scope out |
| history mode | `/mode/history` | home | HistoryModeScreen — 본 PRD scope out |
| auth callback | `/auth/callback` | (UI 없음 — 즉시 redirect) | AuthCallback — 처리 직후 redirect |

### 6-3. 디자인 토큰 그룹 (Figma variables import)

> 토큰 값은 `requirements.md` § 3 참조. designer agent 는 다음 그룹을 Figma variables 로 매핑:

- Color/Background (5 tokens)
- Color/Brand (4 tokens + alpha 3)
- Color/Text (5 tokens)
- Color/Border (2 tokens)
- Color/Status (3 tokens)
- Color/Surface (2 tokens)
- Typography/Family (1 font stack)
- Typography/Size (9 sizes)
- Typography/Weight (4 weights)
- Spacing/Scale (9 steps, 8pt grid)
- Layout/Constants (5 constants)
- Radius/Scale (7 steps)
- Z-index/Scale (8 levels)

---

## 7. 사용자 확인 필요 항목

1. ❓ **TopBar page variant 사용 매핑** — designer 가 NoticeDetail 등에 page variant 적용 여부 결정
2. ❓ **AuthProvider blank 화면 디자인** — F10 frame. 스플래시 vs blank 결정
3. ❓ **404 errorElement** — react-router-dom v7 errorElement 미정의. 404 페이지 디자인 결정
4. ❓ **글로벌 ErrorBoundary** — 부재. chunk 로딩 실패 / 런타임 에러 처리 미정
5. ❓ **Drawer keyboard escape** — a11y. 미구현
6. ❓ **`useSetTopBar` deps `[]` 제약** — 동적 title 미지원. 정책 결정
7. 🔴 **AuthGuard 실 사용** — 현재 사용처 0. USER/ADMIN 전용 라우트 도입 시 HITL

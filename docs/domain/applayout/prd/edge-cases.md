# AppLayout — Edge Cases (예외 케이스)

> 작성일: 2026-05-11
> 모드: reverse
> 입력: `feature-spec.md` + `endpoint-spec-draft.md` + 코드 cross-check
> 본 문서는 **확정 예외 명세**

---

## 0. 작성 방식

각 예외는 다음 4 요소:
- **상황**: 어떤 조건에서 발생
- **현재 동작** (사실): 코드가 실제로 어떻게 처리
- **권고 동작** (🟨): 개선안
- **위험도**: P0 (즉시 수정) / P1 (다음 라운드) / P2 (관찰)

---

## 1. 인증 / 세션 예외

### EC-1.1: 네트워크 단절 중 App mount

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 오프라인 상태에서 페이지 진입 |
| 현재 동작 | `requestUserHealthCheck` thunk reject → `.catch(() => setUserProperties('GUEST'))`. `state.auth.initialized` 이 어떻게 설정되는지 코드 확인 필요 — `state.auth.initialized` 가 thunk fulfilled 시점에만 true 면 영원히 blank 화면 🔴 |
| 권고 동작 | thunk reject 시에도 `initialized = true` 설정 + guest fallback. 글로벌 ResponseModal "네트워크 오류" |
| 위험도 | **P0** 🔴 — 사용자 체감 큰 issue |

❓ **확인 필요**: `domains/authentication/store/slices.js` 의 reducer 가 `requestUserHealthCheck.rejected` 시 `initialized = true` 설정하는지.

### EC-1.2: 만료 cookie + refresh 실패

| 항목 | 내용 |
|---|---|
| 상황 | ACCESS_TOKEN 만료. REFRESH_TOKEN 도 만료 / 무효 |
| 현재 동작 | health-check 401 → axios interceptor `/api/auth/refresh` 호출 → 실패 → `data: null` 반환 → AuthProvider 가 user null 로 처리 → guest 진입 (사실) |
| 권고 동작 | 현재 동작 OK. 단, `sessionStorage.redirectPath` 에 잔재 있으면 잘못된 복귀 위험 — clear 필요 |
| 위험도 | P1 |

### EC-1.3: 네이버 OAuth 콜백 실패

| 항목 | 내용 |
|---|---|
| 상황 | `/auth/callback` 진입했으나 cookie 발급 실패 또는 health-check 401 |
| 현재 동작 | `AuthCallback` 의 `setUserProperties(data.userRole)` 가 null 가드 없음 ❓ — 런타임 에러 가능 |
| 권고 동작 | null guard 추가 + 실패 시 글로벌 ResponseModal "로그인 실패" + `/` redirect |
| 위험도 | **P0** 🔴 |

### EC-1.4: 로그아웃 중 API 실패

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 로그아웃 클릭 → `requestUserLogout` thunk 실패 (네트워크 단절 등) |
| 현재 동작 | thunk reject → `state.operation.lastOperation = {success: false, message}` (🟨 가정) → ResponseModal 표시 / 단, 서버 cookie 는 그대로 남아있을 가능성 |
| 권고 동작 | 클라이언트 측에서도 `clearUser()` 강제 호출 + `window.location.replace("/")` (서버 cookie 는 만료 대기) |
| 위험도 | P1 |

### EC-1.5: 동시 다중 탭에서 로그인 / 로그아웃

| 항목 | 내용 |
|---|---|
| 상황 | 탭 A 에서 로그인. 탭 B 는 이미 로딩 완료 (guest 상태) |
| 현재 동작 | 탭 B 는 다음 라우트 변경 / 다음 health-check 까지 user state 갱신 X (사실) |
| 권고 동작 | `BroadcastChannel` 또는 `storage` 이벤트로 cross-tab sync (P2 — 사용 빈도 낮음) |
| 위험도 | P2 |

---

## 2. 라우팅 / 진입 예외

### EC-2.1: 미정의 라우트 진입 (404)

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 `/foo-bar` 직접 진입 |
| 현재 동작 | `createBrowserRouter` 에 `errorElement` 미정의 → react-router-dom v7 기본 (빈 outlet 또는 default error page) ❓ |
| 권고 동작 | 글로벌 404 페이지 정의 — designer 단계 디자인 |
| 위험도 | **P0** 🔴 — UX 직접 영향 |

### EC-2.2: lazy chunk 로딩 실패

| 항목 | 내용 |
|---|---|
| 상황 | `React.lazy(() => import("..."))` 가 네트워크 오류로 실패 |
| 현재 동작 | Suspense 가 catch X. ErrorBoundary 부재 → React 가 화면 전체 unmount → 빈 화면 / 콘솔 에러 |
| 권고 동작 | 글로벌 ErrorBoundary 추가 — "페이지 로드 실패. 새로고침" 안내 |
| 위험도 | **P0** 🔴 |

### EC-2.3: AuthGuard 통과 후 user 변경 (logout in flight)

| 항목 | 내용 |
|---|---|
| 상황 | guest 가 USER 전용 페이지 진입 → AuthGuard 차단 → `/` 복귀 → 로그인 → `redirectPath` 복귀 직전 logout 발생 (가상 시나리오 — 현재 사용처 0) |
| 현재 동작 | 코드 사용처 0 — 발동 X |
| 권고 동작 | (도입 시) AuthGuard 가 routing 후에도 user state 변경 시 즉시 차단 — 현재 코드 그렇게 동작 |
| 위험도 | P2 (현재 미발동) |

### EC-2.4: `notice/:id` 의 잘못된 id

| 항목 | 내용 |
|---|---|
| 상황 | `/notice/abc` 또는 `/notice/999999` (없는 id) |
| 현재 동작 | NoticeDetailScreen 의 `useNoticeDetail(id)` 가 fetch 실패 → `notice = null` → `<div className={styles.screen} />` 빈 화면 (사실 — `NoticeDetailScreen.jsx` L26) |
| 권고 동작 | 글로벌 ResponseModal "공지사항을 찾을 수 없습니다" + `/notices` 로 navigate |
| 위험도 | P1 |

### EC-2.5: 라우트 변경 중 Drawer 열림 상태 잔재

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 Drawer 메뉴 클릭 → `closeDrawer()` 호출되지만 메뉴 클릭 → Link navigate 가 더 빠른 케이스 |
| 현재 동작 | `Drawer.jsx` L71: `onClick={item.comingSoon ? handleComingSoonClick : closeDrawer}` — `closeDrawer` 가 Link click 보다 먼저 실행 (event 순서). `body.overflow` 도 `useEffect` 가 동기로 풀림 (사실) |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

---

## 3. UI / 상호작용 예외

### EC-3.1: Drawer open 상태에서 라우트 변경 (back/forward)

| 항목 | 내용 |
|---|---|
| 상황 | Drawer open → 사용자가 브라우저 back 버튼 |
| 현재 동작 | route 변경 → Drawer 가 닫히지 않음 (Drawer 는 `isDrawerOpen` state 만 의존 — route 변경 무관) ❓ |
| 권고 동작 | `useLocation()` 변경 시 `closeDrawer()` 자동 호출 — `TopBarProvider` 또는 `Drawer` 에서 |
| 위험도 | P1 |

### EC-3.2: Drawer overlay 클릭 vs 패널 클릭

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 Drawer 패널 안쪽 빈 영역 클릭 |
| 현재 동작 | overlay 만 `onClick={closeDrawer}`. 패널 내부는 닫히지 않음 (사실 — `Drawer.jsx`) |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

### EC-3.3: `useSetTopBar` 동적 title 미갱신

| 항목 | 내용 |
|---|---|
| 상황 | 페이지가 비동기 fetch 후 title 변경 (예: NoticeDetail 의 notice.title 로딩 완료) |
| 현재 동작 | `useSetTopBar` 의 deps `[]` — mount 시 1회만 (사실 — `TopBarProvider.jsx` L51). 동적 변경 시 갱신 X. NoticeDetail 은 이를 회피하기 위해 `document.title` 직접 처리 |
| 권고 동작 | deps 를 `[config]` 또는 deep compare 로 수정 — 별도 라운드 |
| 위험도 | P1 |

### EC-3.4: TopBar `variant: "page"` 페이지가 `onBack` 미주입

| 항목 | 내용 |
|---|---|
| 상황 | (가상) 페이지가 `useSetTopBar({ variant: "page", title: "..." })` 만 호출. onBack 미주입 |
| 현재 동작 | back 버튼 클릭 → `config.onBack()` 호출 → `null()` 런타임 에러 ❓ (TopBar.jsx L16 가드 없음) |
| 권고 동작 | TopBar 가 `onBack ?? (() => navigate(-1))` default 처리 |
| 위험도 | P1 (현재 page variant 사용처 0 — 미발동) |

### EC-3.5: comingSoon 메뉴 클릭 → Drawer close + Modal open 순서 race

| 항목 | 내용 |
|---|---|
| 상황 | comingSoon 메뉴 클릭 → `closeDrawer()` + `setRenewalOpen(true)` 동시 |
| 현재 동작 | React 18 batch 로 두 state 동시 update. Drawer slide-out + Modal fade-in 동시 진행 (사실 — `Drawer.jsx` L18-22) |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

### EC-3.6: ResponseModal 중첩 발생 가능성

| 항목 | 내용 |
|---|---|
| 상황 | thunk A 실패 → ResponseModal 표시 중 → thunk B 실패 → `lastOperation` 덮어쓰기 |
| 현재 동작 | `lastOperation` 단일 slot — 후속 메시지가 이전 메시지 덮어씀. 사용자가 첫 메시지 못 봄 (사실) |
| 권고 동작 | queue 도입 — 별도 라운드 |
| 위험도 | P1 |

---

## 4. 스크롤 / 레이아웃 예외

### EC-4.1: scroll-to-top 이 사용자 의도와 충돌

| 항목 | 내용 |
|---|---|
| 상황 | 사용자가 SectionBlock 의 anchor 링크 (`/notices#section-2`) 클릭 |
| 현재 동작 | route 변경 → MobileLayout 의 scroll-to-top 발동 → anchor 위치 무시. 단, 사용자가 wheel/touch 발생 시 pending 취소 (사실 — `MobileLayout.jsx` L46-54) |
| 권고 동작 | hash 가 있는 라우트는 scroll-to-top skip — 별도 라운드 |
| 위험도 | P2 (현재 hash 사용 없음) |

### EC-4.2: pageContent overflow vs body overflow

| 항목 | 내용 |
|---|---|
| 상황 | Drawer open 시 `body.overflow = "hidden"`. 그러나 실 스크롤 컨테이너는 `pageContent` (data-scroll-root) |
| 현재 동작 | Drawer open 시 pageContent 스크롤은 막히지 않음 ❓ — 그러나 wrapper height `100dvh` 이므로 모바일에서 사실상 차이 없음 |
| 권고 동작 | Drawer open 시 `pageContent.style.overflow = "hidden"` 도 함께 — 별도 라운드 |
| 위험도 | P2 |

### EC-4.3: tablet 이상 viewport 에서 Drawer 위치

| 항목 | 내용 |
|---|---|
| 상황 | tablet (768px) 이상 viewport 에서 Drawer open |
| 현재 동작 | `from-tablet` 분기로 `position: absolute` + clip-path 로 wrapper 안쪽 한정. body wrapper max-width 428px 안쪽에만 Drawer 표시 (사실 — `Drawer.module.scss`) |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

### EC-4.4: iOS Safari `100dvh` 처리

| 항목 | 내용 |
|---|---|
| 상황 | iOS Safari 의 dynamic viewport (toolbar 표시/숨김에 따라 viewport height 변경) |
| 현재 동작 | `100dvh` 사용 — iOS 14+ 지원 (사실) |
| 권고 동작 | 구버전 fallback `100vh` 동시 적용 권고 — 별도 라운드 |
| 위험도 | P2 |

---

## 5. Drawer 메뉴 데이터 예외

### EC-5.1: Drawer badge 하드코딩 vs 실제 카운트

| 항목 | 내용 |
|---|---|
| 상황 | MENU_GROUPS 의 `이벤트 badge: 5`, `쿠폰 badge: 3` 정적. 실제 활성 이벤트 0개 / 쿠폰 0개 가능 |
| 현재 동작 | 항상 5 / 3 표시 (사실 — `MENU_GROUPS.js`) |
| 권고 동작 | 동적 카운트 (`activeEvents.length`, `activeCoupon.length`) 연동 — 별도 라운드 |
| 위험도 | P1 (사용자 혼란 가능) |

### EC-5.2: 메뉴 active 표시가 hash / query 변경 시 미반응

| 항목 | 내용 |
|---|---|
| 상황 | `/notices?category=update` 진입 |
| 현재 동작 | `location.pathname === item.to` — pathname 만 비교 (사실 — `Drawer.jsx` L65). `?category=update` 와 무관하게 "공지사항" active 유지 |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

### EC-5.3: Home `/` vs sub-path `/notices` 의 active 판정

| 항목 | 내용 |
|---|---|
| 상황 | `/notices/123` 진입 시 "홈" 또는 "공지사항" active? |
| 현재 동작 | `location.pathname === item.to` — `/notice/123` 은 어느 메뉴와도 일치 X → 모두 inactive (사실) |
| 권고 동작 | startsWith 매칭 권고 (예: `/notice` 시작 시 공지사항 active) — 별도 라운드 |
| 위험도 | P1 |

---

## 6. 성능 / 메모리 예외

### EC-6.1: Suspense fallback 후 scroll-to-top 다중 시도 메모리 누수

| 항목 | 내용 |
|---|---|
| 상황 | 빠른 라우트 연속 변경 (back/forward 다발) |
| 현재 동작 | useEffect cleanup 이 `clearTimeout` + `observer.disconnect()` 호출 (사실 — `MobileLayout.jsx` L56-59). 누수 없음 |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

### EC-6.2: 라우트 변경 시 wheel listener 잔재

| 항목 | 내용 |
|---|---|
| 상황 | scroll-to-top useEffect 가 `{ once: true }` 옵션으로 wheel/touch 등록 |
| 현재 동작 | `once: true` 자동 제거 + cleanup 에서 명시 removeEventListener (사실 — `MobileLayout.jsx` L52, L58) |
| 권고 동작 | 현재 OK |
| 위험도 | P2 |

---

## 7. 우선순위 요약

| 위험도 | 항목 |
|---|---|
| **P0 🔴** | EC-1.1 (네트워크 단절 + initialized 미설정) / EC-1.3 (OAuth 콜백 null guard) / EC-2.1 (404 미정의) / EC-2.2 (lazy chunk 실패 ErrorBoundary 부재) |
| **P1** | EC-1.2 / EC-1.4 / EC-2.4 / EC-3.1 / EC-3.3 / EC-3.4 / EC-3.6 / EC-5.1 / EC-5.3 |
| **P2** | EC-1.5 / EC-2.3 / EC-2.5 / EC-3.2 / EC-3.5 / EC-4.1~4.4 / EC-5.2 / EC-6.* |

---

## 8. 사용자 확인 필요 항목

1. 🔴 **EC-1.1** — `state.auth.initialized` 가 thunk reject 시 true 설정되는지 코드 검증 필요 (별도 라운드)
2. 🔴 **EC-2.1** — 404 페이지 디자인 결정 (designer 단계)
3. 🔴 **EC-2.2** — 글로벌 ErrorBoundary 도입 결정
4. 🔴 **EC-1.3** — AuthCallback null guard 추가 결정
5. 🟨 **P1 항목들** — 다음 라운드 fix 우선순위 결정

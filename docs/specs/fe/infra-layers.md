# FE 계층 레이어 분석 + GA4·operationListener·async toast 흐름

> 작성: 2026-05-09 (사용자 요청 — `web/src/app` + `web/src/main` 계층 적합성 + GA4 / operationListener 연동 + `global/handler` async toast 점검 + infra 문서)
> 분석 기준: commit `fa52ef1` (`infra/api/uploads` + `infra/http/client.js` 마이그) 후 + `c2ff814` (global/layout 3 폴더 폐기) 후 상태
> 본 문서: read-only 분석 + 변경 권고 — 코드 변경 0건. 권고 채택은 사용자 검토 후 별도 라운드

---

## 1. 진입점 흐름

### 1.1 `web/src/main.jsx` (`web/src/main.jsx:1-12`)

```jsx
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@/global/styles/global.scss";
import router from "@/app/router";
import AppProvider from "@/app/provider/AppProvider.jsx";

createRoot(document.getElementById("root")).render(
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>,
);
```

- `index.jsx` 부재 — `main.jsx` 단일 진입점 (Vite 표준)
- React StrictMode **미사용**
- 외부 entry 의존: `@/app/router` (router 정의), `@/app/provider/AppProvider` (provider chain), `@/global/styles/global.scss` (전역 스타일)

### 1.2 `AppProvider` (`web/src/app/provider/AppProvider.jsx:1-21`)

```jsx
<Provider store={store}>
  <ResponseListener />
  <AuthProvider>
    {children}
  </AuthProvider>
</Provider>
```

- Redux Provider (`@reduxjs/toolkit` store)
- `ResponseListener` — `state.operation.lastOperation` 구독 → `ResponseModal` 출력 (전역 toast/modal)
- `AuthProvider` — 부팅 시 `requestUserHealthCheck` dispatch + `setUserProperties('GUEST')` GA4 fallback
- 어떤 i18n / theme provider 도 없음

### 1.3 `AuthProvider` (`web/src/app/provider/AuthProvider.jsx:1-28`)

- `useEffect(() => dispatch(requestUserHealthCheck())...)` — 마운트 시 1회 health check
- 성공 → `state.auth.initialized = true`, 자식 렌더
- 401/실패 → `setUserProperties('GUEST')` GA4 호출 + `initialized` 처리
- `initialized === false` 이면 `null` 렌더 (글로벌 splash 없음)

### 1.4 `TopBarProvider` (`web/src/app/provider/TopBarProvider.jsx:1-53`)

- `MobileLayout` 안쪽에서 wrap (라우트 element 레벨, `web/src/app/wrapper/mobile/MobileLayout.jsx:62-63`)
- TopBar 가변 config (variant / title / rightAction / onBack / onBurger) + drawer open state
- `useTopBar()`, `useSetTopBar(config)` hook export

### 1.5 진입점 chain 요약

```
main.jsx
└─ AppProvider
   ├─ Provider (Redux store)         ← @/app/store/store.js
   ├─ ResponseListener                ← @/app/page/commonModal/ResponseListener.jsx (전역 toast)
   └─ AuthProvider                    ← @/api/users/me health check + GA4 user_properties
      └─ RouterProvider
         └─ AppWrapper                ← @/app/wrapper/AppWrapper.jsx (useGA4PageView)
            └─ MobileLayout
               └─ TopBarProvider
                  ├─ TopBar
                  ├─ Drawer
                  └─ Suspense > Outlet  ← lazy 라우트 element
```

---

## 2. 계층 구조 (commit `fa52ef1` 후)

### 2.1 `src/app/`

| 폴더 | 내용 | 책임 | 평가 |
|---|---|---|---|
| `app/router/` | `index.jsx`, `config/{routePath, routeMeta}.js`, `guards/AuthGuard.jsx`, `routes/{Public,User,Admin}Routes.jsx` | createBrowserRouter 정의 + 라우트 메타 + auth guard | OK — 단일 책임 |
| `app/store/` | `store.js`, `operation/{operationListener.js, slices.jsx}` | Redux store config + 글로벌 operation slice + operation listener middleware | ⚠ `operation/` 의 적합성은 § 4 에서 별도 검토 |
| `app/provider/` | `AppProvider.jsx`, `AuthProvider.jsx`, `TopBarProvider.jsx` | provider chain 조립 | OK |
| `app/wrapper/` | `AppWrapper.jsx`, `mobile/{MobileLayout, config/MENU_GROUPS, parts/{Drawer, TopBar}}`, `parts/{Header, Footer, hooks}` | 라우트 element 진입점 + 모바일 layout | ⚠ `wrapper/parts/{Header, Footer}` 는 PC legacy 잔존 의심 (모바일 진입은 `wrapper/mobile/MobileLayout`) |
| `app/analytics/` | `ga.js`, `events/{auth, coupon, event}Events.js`, `hooks/useGA4PageView.js`, `README.md` | GA4 wrapper + 이벤트 카탈로그 | ⚠ **infra 이전 권고 (Q5 후속)** — § 5 권고 1 |
| `app/page/` | `HomePage.jsx`, `CouponPage.jsx`, `EventPage.jsx`, `HistoryModePage.jsx`, `NoticePage.jsx`, `NoticeDetailPage.jsx`, `CommunityPage.jsx`, `commonModal/ResponseListener.jsx`, `legal/PrivacyPolicy.jsx` | lazy 라우트 element | ⚠ **위치 부적합** — 페이지는 도메인 (`domains/{domain}/mobile/...`) 기준이 일관. `app/page/` 는 routes 파일에서만 import 되는 lazy entry 모음. § 5 권고 4 |

### 2.2 `src/global/`

| 폴더 | 내용 | 책임 | 평가 |
|---|---|---|---|
| `global/ui/` | `badge/{StatusBadge, LabelBadge, PinnedBadge}`, `mobile/section/`, `renewalNoticeModal/`, `responseModal/`, `visibleToggle/` | 도메인 횡단 UI 컴포넌트 | OK |
| `global/utils/` | `datetime/`, `crypto/storageCrypto.js`, `skill/`, `parseDate.js`, `sortCoupons.js`, `DateFormatt.js` | pure 함수 util | ⚠ `skill/` 은 polished/dictionary/simulate legacy 잔존 의심 (해당 도메인 폐기됨). `sortCoupons.js` / `DateFormatt.js` 도메인 종속 의심 — 별도 audit 필요 |
| `global/handler/` | `applyAsyncHandlers.js`, `VisibleToggleHandler.js` | thunk reducer factory + visible toggle factory | ⚠ § 4 검토 결과 — **이름 misleading, 위치 부적합** |
| `global/hooks/` | `useTableModal.js` | admin table modal hook (legacy 의심) | ⚠ admin UI legacy 폐기 (commit 2026-05-09) 후 사용처 조사 필요 |
| `global/layout/` | `callBack/AuthCallBack.jsx` | OAuth callback (`/auth/callback`) | ⚠ **위치 부적합** — auth callback 은 authentication 도메인 영역. `domains/authentication/callback/AuthCallBack.jsx` 와 **2개 callback 파일 중복 존재** (PublicRoutes 가 후자만 import). § 5 권고 5 |
| `global/styles/` | `base/`, `components/`, `mixins/`, `semantic/`, `variables/`, `global.scss`, `index.scss` | 전역 SCSS | OK |

### 2.3 `src/infra/`

| 폴더 | 내용 | 책임 | 평가 |
|---|---|---|---|
| `infra/api/uploads/` | `api.js`, `endpoints.js`, `index.js`, `slices.js`, `thunks.js` (`fa52ef1` 마이그) | 횡단 S3 upload (events / quiz admin 사용) | OK |
| `infra/http/client.js` | axios instance + interceptor (`fa52ef1` 마이그) | 단일 axios instance + request/response interceptor | OK — 단일 책임 |

### 2.4 `src/domains/`

표준 패턴 (예: coupons, events, notices, quiz):

```text
domains/{domain}/
├── mobile/         # 모바일 화면 (Screen.jsx, *.module.scss)
├── feature/        # admin 또는 horizontal 등 hor용 화면 묶음
├── components/     # 도메인 전용 sub component
├── hooks/          # 도메인 hook
├── store/          # api/endpoints/thunks/dto/slices (5 파일)
├── config/         # MOCK_*.js, 정책 const
└── README.md
```

- 표준 모듈 구조 (Q2 후속 미답): 5 파일 layout (`api`, `endpoints`, `thunks`, `dto`, `slices`) + `index.js` barrel — `domains/notices/store/{public,admin}/` 처럼 `public/admin` 분기 추가 가능
- `domains/authentication/callback/AuthCallBack.jsx` 가 PublicRoutes 진입 — `global/layout/callBack/` 잔존본은 dead 의심

---

## 3. GA4 + operationListener 흐름

### 3.1 GA4 init

- `index.html` `<script src="https://www.googletagmanager.com/gtag/js?id=G-KCC3QTZWZW"></script>` (README 명시)
- 코드 어디서도 `gtag('config', ...)` 직접 호출 없음 — `index.html` 인라인 스크립트가 처리
- 단일 진입점: `app/analytics/ga.js`
  - `pushEvent({ event, ...params })` — `window.gtag?.("event", eventName, params)` 호출
  - `setUserProperties(userRole)` — `window.gtag?.('set', 'user_properties', {...})` + `'event', 'user_role_set'`
  - localhost 분기: `[GA]${eventName}` prefix + `console.log`

### 3.2 GA4 호출 위치

| 트리거 | 호출 코드 | 어떤 이벤트 | 계층 |
|---|---|---|---|
| 라우트 변경 | `useGA4PageView` (`app/analytics/hooks/useGA4PageView.js:9-26`) | `page_view` | `app/wrapper/AppWrapper.jsx:6` 호출 |
| Auth health check 실패 | `setUserProperties('GUEST')` (`app/provider/AuthProvider.jsx:17`) | user_properties + `user_role_set` | provider 마운트 시 |
| OAuth callback 성공 | `setUserProperties(data.userRole)` + `trackLogin(data.userRole)` (`domains/authentication/callback/AuthCallBack.jsx:14-15`) | `(dev|user|admin)_login` | 도메인 컴포넌트 |
| 로그인 클릭 | `trackLogin()` (`domains/authentication/hooks/useAuthentication.js:19`) | `(dev|user|admin)_login` | 도메인 hook (인자 누락 — userRole 미전달) |
| 로그아웃 클릭 | `trackLogout()` (`domains/authentication/hooks/useAuthentication.js:29`) | `(dev|user|admin)_logout` | 도메인 hook (인자 누락) |
| 쿠폰 클릭 | `trackCouponGo` (`app/analytics/events/couponEvents.js`) | `coupon_clicked` | (사용처 조사 필요) |
| 이벤트 클릭 | `trackEventClick` (`app/analytics/events/eventEvents.js`) | `event_clicked` | (사용처 조사 필요) |

> 흐름 요약: GA4 는 **컴포넌트/hook/provider 직접 호출** 패턴 (axios interceptor 통합 없음, Redux middleware 통합 없음). 상위 레벨 API 통신과 **자동 연동되지 않음** — 도메인이 의식적으로 호출.

### 3.3 operationListener (`app/store/operation/operationListener.js:1-17`)

```js
operationListener.startListening({
  predicate: (action) => {
    const hasOptions = Boolean(action?.payload?.options);
    const isDone = action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected");
    return isDone && hasOptions;
  },
  effect: async (action, listenerApi) => {
    const options = action?.payload?.options;
    listenerApi.dispatch(setLastOperation(options));
  }
})
```

- `createListenerMiddleware` 기반 — `store.js:40` 에서 `prepend(operationListener.middleware)` 등록
- 트리거 조건: `*/fulfilled` 또는 `*/rejected` 액션 + `payload.options` 가 truthy
- 효과: `operation.lastOperation = options` 저장

### 3.4 `payload.options` 발생 위치

`grep` 결과 (`web/src/domains/`):

- `domains/events/store/admin/thunks.js:26,41,56` — `const { id, ...options } = await fetchAdmin...()` → `return { ..., options }`
- `domains/quiz/store/admin/thunks.js` — 동일 패턴
- `domains/coupons/store/admin/thunks.js` — 동일 패턴
- `domains/community/store/thunks/{post,tag,board}Thunks.js` — 동일 패턴 (community 정리 보류 중)

> 핵심: `payload.options` 는 **BE 응답에서 destructure 된 `{ success, message, kind, scope, ts }` 같은 메타** (`slices.jsx` 주석). **admin thunk 만** 옵션을 채움 — 사용자 화면 thunk 는 `options` 미반환 (조사 결과). 따라서 **자연스럽게 admin 전용** 동작.

### 3.5 `ResponseListener` (`app/page/commonModal/ResponseListener.jsx:1-22`)

```jsx
const lastOperation = useSelector(state => state.operation.lastOperation);
if (!lastOperation) return null;
return <ResponseModal ... success={lastOperation.success} message={lastOperation.message} ... />
```

- `AppProvider` 안에 마운트 — 모든 라우트에서 활성
- `lastOperation` 이 set 되면 `ResponseModal` 출력 → 사용자가 close 하면 `clearLastOperation()` dispatch
- **admin role 분기 없음** — `payload.options` 가 admin thunk 에서만 채워지는 사실에 의존

### 3.6 흐름 다이어그램

```
[1] 도메인 thunk dispatch (예: requestAdminInsertNewExEvent)
       │
       ▼
[2] api 호출 (infra/http/client.js — axios)
       │
       ▼
[3] BE 응답 → thunk fulfilled action
       payload = { ...event, id, options: { success, message, kind, scope, ts } }
       │
       ▼
[4] operationListener middleware (app/store/operation/operationListener.js)
       predicate: isDone && hasOptions === true
       effect: dispatch(setLastOperation(payload.options))
       │
       ▼
[5] state.operation.lastOperation = options
       │
       ▼
[6] ResponseListener (app/page/commonModal/ResponseListener.jsx)
       useSelector(state.operation.lastOperation) → ResponseModal 렌더

  ─── 별도 흐름 ───
[a] 라우트 변경 → AppWrapper.useGA4PageView → pushEvent('page_view')
[b] OAuth callback → setUserProperties + trackLogin (직접 호출)
```

> **결론**: 상위 레벨 API 통신 → GA4 통합 **없음**. axios interceptor 는 헤더 보정 + 401 무음화만 (`infra/http/client.js:14-32`). GA4 는 컴포넌트 ad-hoc, operationListener 는 Redux 액션 ad-hoc — **두 채널이 분리**.

---

## 4. `global/handler` async toast 계층 검증

### 4.1 현 위치

`web/src/global/handler/{applyAsyncHandlers.js, VisibleToggleHandler.js}` (2 파일)

### 4.2 `applyAsyncHandlers.js` 책임 (`web/src/global/handler/applyAsyncHandlers.js:1-20`)

```js
export const applyAsyncHandlers = (builder, thunk, onFulfilled) => {
  builder
    .addCase(thunk.pending,   (state) => { state.loading = true; state.error = null; })
    .addCase(thunk.fulfilled, (state, action) => { state.loading = false; onFulfilled(state, action); })
    .addCase(thunk.rejected,  (state, action) => {
      state.loading = false;
      const errorMessage = action.payload?.message ?? action.error?.message ?? "Unknown error";
      state.error = "[내부 오류] " + errorMessage;
    });
};
```

- **slice extraReducer factory** — 각 도메인 slice 가 `applyAsyncHandlers(builder, thunk, onFulfilled)` 호출 (`domains/notices/store/slices.js:24` 등 5 도메인)
- **toast 없음** — `state.loading` / `state.error` 만 채움
- async toast 동작 **자체와 무관** — 사용자 task 의 "async 전역 toast" 는 § 3 `operationListener` + `ResponseListener` 가 담당. `applyAsyncHandlers` 는 **slice 패턴 helper**.

### 4.3 `VisibleToggleHandler.js` 책임 (`web/src/global/handler/VisibleToggleHandler.js:1-11`)

```js
export const VisibleToggleHandler = (dispatch, updateThunk) => (id) => (nextVisible) => {
  dispatch(updateThunk({ id, visible: nextVisible }));
};
```

- 단순 dispatch curry. admin visible toggle UI helper.
- toast 와 무관 — 이름의 "Handler" 도 misleading

### 4.4 admin 전용 분기 검증

- `applyAsyncHandlers` / `VisibleToggleHandler` / `operationListener` / `ResponseListener` **어디에도 `state.auth.userRole === 'ADMIN'` 분기 없음**
- admin 전용 효과는 **자연스러운 결과**: `payload.options` 가 admin thunk 에서만 destructure 됨 (events/quiz/coupons/community admin thunks). user thunk 는 `options` 미반환 → predicate 통과 X
- 사용자 화면 thunk 가 미래에 BE 가 `options` 반환하도록 변경되면 → user 에게도 toast 노출 (의도되지 않은 사이드 이펙트 위험)

### 4.5 계층 적합성 평가

| 항목 | 평가 |
|---|---|
| `global/handler/` 폴더명 | ⚠ "handler" 가 모호 (axios handler? action handler? error handler?) — 실제는 **slice factory**. async toast 는 `app/store/operation/` 에 있어 **혼동 유발** |
| `applyAsyncHandlers` 위치 | ⚠ Redux slice helper 는 `app/store/utils/` 또는 도메인 표준 모듈에 두는 게 일관 — `global/` 보다는 `app/store/` 영역 |
| `VisibleToggleHandler` 위치 | ⚠ admin UI helper — 사용처 0건이면 dead. admin UI legacy 폐기 (commit 2026-05-09) 후 **사용처 grep 검증 필요** |
| async toast 실제 위치 | `app/store/operation/operationListener.js` + `app/page/commonModal/ResponseListener.jsx` — **현 위치 OK** (Redux store 영역) 단 admin 전용 명시적 분기 없어 위험 |

> **결론**: 사용자 task 가 가리킨 "global/handler async toast (admin 전용)" 의 실제 코드는 `global/handler/` 가 아닌 `app/store/operation/` + `app/page/commonModal/`. `global/handler/` 는 별개의 **slice factory** 모음 — **이름 변경 + 위치 이전 권고** (§ 5 권고 2).

---

## 5. 변경 권고 (사용자 검토용)

### 권고 1 — `app/analytics/` → `infra/analytics/` (Q5 후속)

- **현**: `web/src/app/analytics/{ga.js, events/, hooks/, README.md}`
- **제안**: `web/src/infra/analytics/{ga.js, events/, hooks/, README.md}`
- **사유**:
  - GA4 = 외부 시스템 (Google) 통신 — `infra/` 의 정의 (외부 통신 어댑터) 와 정합
  - axios (`infra/http/`) + S3 upload (`infra/api/uploads/`) 와 동급의 외부 통신
  - `app/` = "조립 / 라우팅 / 글로벌 store 조립" 의미를 더 명확히 함
- **영향 범위**:
  - import 갱신: 13 파일 (§ 3.2 grep 결과 기반 — `useGA4PageView`, `pushEvent`, `setUserProperties`, `trackLogin`, `trackLogout`, `trackCouponGo`, `trackEventClick`)
  - barrel `infra/analytics/index.js` 추가 권장 (`infra/api/uploads/index.js` 패턴)
  - README 위치 동시 이동
- **위험**: 낮음 (단순 import 경로 갱신)

### 권고 2 — `global/handler/` 폐기 + 분리 이전

- **현**: `web/src/global/handler/{applyAsyncHandlers.js, VisibleToggleHandler.js}`
- **제안**:
  - `applyAsyncHandlers.js` → `web/src/app/store/utils/applyAsyncHandlers.js` (Redux slice factory 영역)
  - `VisibleToggleHandler.js` → 사용처 grep 검증 후 **dead 면 삭제**, live 면 admin 도메인 영역 (`domains/{domain}/feature/admin/utils/` 또는 `global/ui/visibleToggle/`) 으로 흡수
  - `global/handler/` 빈 폴더 정리
- **사유**:
  - "handler" 라는 모호한 폴더명 — 실제 책임은 slice factory + admin UI helper 두 가지
  - 사용자가 "global/handler async toast (admin 전용)" 이라 인지하는 코드와 실제 위치 불일치 (실제 toast 는 `app/store/operation/` + `app/page/commonModal/`)
- **영향 범위**:
  - `applyAsyncHandlers` import 5 도메인 (notices, events, coupons, quiz, community + `infra/api/uploads/slices.js`) 갱신
  - `VisibleToggleHandler` import 0건 추정 (admin UI legacy 폐기 후) — grep 재확인 필요
- **위험**: 낮음 (명명 + 경로만 정리)

### 권고 3 — `app/store/operation/` 의 admin 전용 분기 명시화

- **현**: `operationListener` 가 `payload.options` 존재만 검사 (`app/store/operation/operationListener.js:6-10`)
- **제안 옵션 A**: `state.auth.userRole === 'ADMIN'` 분기 추가
  ```js
  predicate: (action, currentState) => {
    if (currentState.auth?.userRole !== 'ADMIN') return false;
    const hasOptions = Boolean(action?.payload?.options);
    const isDone = action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected");
    return isDone && hasOptions;
  }
  ```
- **제안 옵션 B**: 명시적 marker (예: `payload.options.audience: 'admin'`) 추가
- **사유**: 사용자가 인지한 "admin 전용" 의도가 코드에 반영되지 않음 — user thunk 가 미래에 `options` 반환하면 의도되지 않은 toast 노출 위험
- **영향 범위**: 9 라인 변경 (predicate 강화). 백엔드/도메인 영향 0
- **위험**: 낮음 (방어적 추가)

### 권고 4 — `app/page/` 잔여 정리

- **현**: `web/src/app/page/{HomePage, CouponPage, EventPage, NoticePage, NoticeDetailPage, HistoryModePage, CommunityPage, commonModal/, legal/}`
- **검토**:
  - `HomePage.jsx` / `CouponPage.jsx` / 등 — `routes/PublicRoutes.jsx` 가 lazy import → 어떤 컴포넌트인지 (도메인 Screen wrap 여부) 후속 audit 필요
  - `commonModal/ResponseListener.jsx` → `app/store/operation/ResponseListener.jsx` 이전 권고 (operationListener 와 짝)
  - `legal/PrivacyPolicy.jsx` — PublicRoutes 주석 처리 dead (commit `c2ff814`) 추정 — 사용처 재확인 후 정리
  - `CommunityPage.jsx` — community 도메인 정리 보류 중 (PublicRoutes 주석)
- **제안**: 별도 audit 라운드에서 각 page 가 도메인 Screen 의 lazy wrap 인지 확인 후, 도메인 mobile/ 또는 feature/ 로 흡수
- **영향**: PublicRoutes import 경로 갱신
- **위험**: 중 (lazy import 경로 다수 + community/legacy 잔존 정리 동반)

### 권고 5 — `global/layout/callBack/AuthCallBack.jsx` 폐기

- **현**: `web/src/global/layout/callBack/AuthCallBack.jsx` (24줄, token URL parse + redirect)
- **사실**:
  - PublicRoutes:31 가 `/auth/callback` 에 `<AuthCallback />` (대문자 `b`) 매핑 — `domains/authentication/callback/AuthCallBack.jsx` import (`PublicRoutes.jsx:3`)
  - `global/layout/callBack/AuthCallBack.jsx` (대문자 `B`) 는 PublicRoutes:23 에서 `lazy(...)` 로 import 만 하고 **route 정의 어디에도 사용 안 됨** (주석 dead)
- **제안**: `global/layout/callBack/` 폴더 통째 삭제 + PublicRoutes:23 lazy 줄 삭제
- **사유**: dead chain. `domains/authentication/callback/` 가 활성. 도메인 callback 은 도메인 폴더 안에 있는 것이 일관
- **영향**: 1 파일 삭제 + 1 import 줄 삭제
- **위험**: 낮음 — grep `global/layout/callBack` 검증 후 진행

### 권고 6 — 표준 모듈 구조 (Q2 후속) 명시

- **권고**: 도메인 store 표준 5 파일 layout 명문화
  ```
  domains/{domain}/store/
  ├── api.js          # axios call (infra/http/client.js 의 API import)
  ├── endpoints.js    # path const
  ├── thunks.js       # createAsyncThunk (admin 은 payload.options 반환)
  ├── dto.js          # 응답 ↔ state shape 변환
  ├── slices.js       # createSlice + applyAsyncHandlers
  └── index.js        # barrel
  ```
- 일부 도메인 (notices) 는 `store/{public, admin}/` 분기 — 이 변형도 표준의 일환으로 명시
- `infra/api/uploads/` 도 동일 5 파일 layout 채택 (검증됨)

### 권고 7 — 향후 전역 API 후보 (Q6 후속)

`infra/` 추가 가능 후보 식별:

| 후보 | 현 위치 | 이전 검토 |
|---|---|---|
| GA4 | `app/analytics/` | 권고 1 (이전) |
| storageCrypto (sessionStorage AES) | `global/utils/crypto/storageCrypto.js` | dictionary/simulate 폐기 후 사용처 재확인 — live 면 `infra/storage/` 후보 |
| OAuth callback | `domains/authentication/callback/` | 도메인 영역이 적합 (이전 X) |

---

## 6. 사용자 확인 항목

| 권고 | 채택 여부 | 마이그 시점 |
|---|---|---|
| 1 — `app/analytics/` → `infra/analytics/` | ☐ | 즉시 / 별도 라운드 |
| 2 — `global/handler/` 폐기 + 분리 이전 | ☐ | 즉시 / 별도 라운드 |
| 3 — `operationListener` admin 분기 명시화 | ☐ | 즉시 / 별도 라운드 |
| 4 — `app/page/` 잔여 audit | ☐ | 별도 라운드 |
| 5 — `global/layout/callBack/` dead 폐기 | ☐ | 즉시 / 별도 라운드 |
| 6 — 표준 모듈 구조 (Q2 후속) 명문화 | ☐ | 본 문서 또는 별도 specs |
| 7 — 향후 전역 API 후보 (Q6 후속) | ☐ | 도메인별 별도 검토 |

---

## 7. 관련 commit / 문서

- `fa52ef1` — `infra/api/uploads` + `infra/http/client.js` 마이그 (옵션 C)
- `c2ff814` — `global/layout/{adminPageLayout, contentPageLayout, userLayout}` 폐기 (3 폴더)
- `docs/prd/_meta/global-api-folder-structure.md` — 옵션 C 제안서 (Q1~Q6 미답 항목 정의)
- `docs/specs/fe/state-and-data.md` — Redux store 등록 reducer 표 (operationListener 흐름 일부 cite)
- `docs/specs/fe/api-calls.md` — 도메인별 endpoint 카탈로그
- `docs/specs/fe/routes-and-screens.md` — 라우트 ↔ 화면 매핑
- `docs/specs/fe/dead-suspects.md` — dead 후보 audit
- `docs/prd/_history.md` — 본 라운드 INIT row 추가
- `web/src/app/analytics/README.md` — GA4 운영 가이드 (이벤트 카탈로그 + 환경별 동작)

# Frontend 구조 가이드

> 작성: 2026-05-10 — `web/src/` 모바일 리뉴얼 기준 실측 스냅샷
> 목적: Claude / 신규 작업자가 도메인 추가·수정 시 폴더 구조·네이밍·store 패턴을 일관 적용하기 위한 단일 참조 문서
> 관련 문서: `docs/specs/fe/module-conventions.md` (도메인 표준 명문화), `docs/specs/fe/api-calls.md` (활성 endpoint 카탈로그), `docs/specs/fe/dead-suspects.md` (정리 대기 dead 후보)
> 상태: 도메인 살아있는 7개(`authentication`, `coupons`, `events`, `home`, `historyMode`, `notices`, `quiz`) + community 정리 보류 中 기준. admin UI / profile / playerCard / dictionary / simulate / kbo 도메인은 폐기되어 폴더 자체 부재 (라우터에서도 lazy import 주석)

---

## 1. 진입점 / 빌드 환경

- 빌드: Vite (`web/vite.config.js`)
- path alias: `@` → `web/src/` (모든 파일에서 `@/...` 절대 경로 사용)
- SCSS auto-inject: `additionalData` 로 `@/global/styles/index.scss` 가 모든 `.module.scss` 에 자동 prepend 됨 → SCSS 파일에서 변수/믹스인 `@use` 불필요
- 진입: `web/src/main.jsx` → `<AppProvider><RouterProvider /></AppProvider>`

---

## 2. `web/src/` 최상위 구조

```text
web/src/
├── main.jsx                    # 앱 부트스트랩 (RouterProvider + AppProvider)
├── app/                        # 앱 골격 (router / store / wrapper / provider)
├── domains/                    # 도메인별 화면·hook·store (도메인 단위 응집)
├── global/                     # 도메인 횡단 UI · 스타일 · pure util
├── infra/                      # 외부 시스템 어댑터 (http, analytics, api/{module})
├── data/                       # 정적 mock JSON/JS (BE 미연동 화면이 직접 import)
└── assets/                     # 정적 이미지 (png/jpg/svg)
```

- **`app/`** = 앱 단일 인스턴스 책임 (라우터 정의, 스토어 등록, 전역 wrapper). 도메인 코드 없음
- **`domains/{name}/`** = 한 사용자/컨텐츠 단위. 화면 + hook + store 가 모두 들어감
- **`global/`** = 순수 UI/스타일/util 횡단. 외부 통신 없음
- **`infra/`** = 외부 통신·시스템 어댑터 (axios, GA4, S3 upload). 도메인 ≥ 2개 횡단 또는 외부 SDK 의존
- **`data/`** = 화면이 BE 없이 표시하는 mock. 정리되면 도메인 store/thunk 로 이전 (community / historyMode 가 현재 유일한 사용처)

### 2.1 mobile / admin / legacy(pc) 분리 규칙

- **mobile**: 도메인 폴더 안 `mobile/` 하위 (Screen, components, containers, hooks). 라우트 진입점
- **admin**: 라우터에서 `AdminRoutes.jsx` 가 모든 lazy import 를 **주석 처리** 한 상태. 신규 admin 화면은 `domains/{name}/feature/admin/` 패턴으로 재구현 예정 — **현재 미구현, 기획 대기. 본 문서 컨벤션 추출 대상 아님**
- **legacy PC**: 도메인 폴더 자체가 삭제됨 (`profile`, `playerCard`, `dictionary`, `simulate`, `kbo`, `admin`). `community` 만 PC 흔적 (`feature/`, `page/`) 잔존하나 라우트 미등록. 신규 코드는 절대 PC 패턴 따라쓰지 말 것

---

## 3. 도메인 폴더 구조 표준

### 3.1 표준 (★) — coupons / events / notices / authentication

라이브 BE 연동 도메인의 표준 트리 (coupons 기준):

```text
domains/coupons/
├── README.md                       # 도메인 가이드 (활성 도메인 권장)
├── mobile/                         # 라우트 진입 영역
│   ├── CouponScreen.jsx            # 라우트 element 직접 (lazy 대상)
│   ├── components/                 # 도메인 sub component (외부 재사용 X)
│   │   └── couponCard/
│   │       ├── CouponCard.jsx
│   │       └── CouponCard.module.scss
│   ├── containers/                 # 데이터 fetch + 리스트 조립
│   │   └── public/
│   │       ├── CouponListHorizontal.jsx   # 다른 도메인(home)에서 import 가능
│   │       ├── CouponListVertical.jsx
│   │       └── CouponList.module.scss
│   └── hooks/
│       └── useCouponList.js        # dispatch + selector 캡슐화
└── store/                          # Redux store 모듈
    ├── public/                     # 사용자(public) thunk 그룹
    │   ├── api.js                  # axios call (얇은 wrapper)
    │   ├── endpoints.js            # path const + action type const
    │   └── thunks.js               # createAsyncThunk
    ├── admin/                      # admin thunk 그룹 (UI 미연결이어도 store 코드 보존)
    │   ├── api.js
    │   ├── endpoints.js
    │   └── thunks.js
    └── slices.js                   # createSlice (public/admin thunk 모두 처리)
```

**규칙 요약**
- `mobile/{Domain}Screen.jsx` 는 라우터에서 lazy import 되는 **단일 진입 컴포넌트**. 자체 헤더 만들지 않음 (글로벌 `MobileLayout` TopBar 사용 — `feedback_no_domain_header` memory)
- `mobile/components/{name}/` 는 **단일 컴포넌트 1개 + scss 1개** 묶음 (PascalCase 폴더 아님, **camelCase 폴더 + PascalCase 파일**)
- `mobile/containers/{public|admin}/` 는 리스트/섹션 조립 + hook 호출 담당. props 없이 hook 으로 데이터 self-fetch
- `mobile/hooks/use{Domain}{Action}.js` 는 `useDispatch + useSelector + useEffect(dispatch(thunk))` 패턴
- `store/` 는 **public/admin 분기** + **slices.js 단일 통합** 패턴

### 3.2 변형 — home (사용자 단일 진입, store 없음)

```text
domains/home/
├── components/
│   ├── HomeScreen.jsx              # 라우트 element. mobile/ 폴더 없음 (홈은 mobile 단독)
│   ├── HomeScreen.module.scss
│   └── section/                    # 도메인 sub section (hero, quick, quiz, notice)
│       └── {sectionName}/
│           ├── {SectionName}.jsx
│           └── {SectionName}.module.scss
└── config/                         # 도메인 단독 const
    ├── MOCK_*.js                   # 화면 임시 mock (BE 연결 후 제거 대상)
    └── QUICK_MENUS.js              # 정적 정책 const
```

> home 은 **자체 store 없음**. 다른 도메인의 hook (`useCouponList`, `useEventList`) 과 container 를 직접 import 해서 조립함. 신규 도메인 추가 시 home 패턴 따라쓰지 말 것 — 단일 collector 화면 한정 변형

### 3.3 변형 — historyMode (mock-only, store 없음)

```text
domains/historyMode/
├── config/
│   ├── MOCK_HISTORY_LEGENDS.js
│   └── MOCK_HISTORY_STAGES.js
└── mobile/
    ├── HistoryModeScreen.jsx
    ├── HistoryModeScreen.module.scss
    ├── historyMode.tokens.scss     # 도메인 로컬 :root 토큰 (옵션)
    ├── components/{chip|stageCard}/
    └── hooks/useHistoryMode.js     # mock 직접 import + useState/useMemo
```

> store 폴더 자체 없음. BE 연동 시 `store/public/` 추가하면 표준 (3.1) 으로 정렬됨

### 3.4 변형 — authentication (인프라성, mobile 폴더 없음)

```text
domains/authentication/
├── README.md
├── callback/
│   └── AuthCallBack.jsx            # OAuth 콜백 진입점 (라우트 element)
├── hooks/
│   └── useAuthentication.js
└── store/                          # public/admin 분기 없음
    ├── api.js
    ├── endpoints.js
    ├── thunks.js
    └── slices.js
```

> 외부 SDK(네이버 OAuth) 콜백 처리에 강하게 묶여 화면이 단일 (`return null`). admin 분기 없으므로 `store/` flat 구조

### 3.5 변형 — quiz (store 만 보존, UI 폐기)

```text
domains/quiz/
└── store/
    ├── public/  { api.js, endpoints.js, thunks.js }
    ├── admin/   { api.js, endpoints.js, thunks.js }
    ├── dto.js
    └── slices.js
```

> admin UI 폐기 후 store 만 잔존 (HomeScreen 이 `requestLatestQuizAnswer` 만 사용). admin UI 재구현 시 `feature/admin/` 으로 추가될 예정

### 3.6 community (정리 보류 中 — 다음 작업 대상)

`community/` 는 PC legacy (`feature/`, `page/`, `store/thunks/{board,post,tag,user}Thunks.js`) + 모바일 신규 (`mobile/`) 가 공존하는 **혼재 상태**. 라우터 / store 등록은 **모두 주석 처리** 됨 (`web/src/app/store/store.js:17-18`, `PublicRoutes.jsx:21-23`).

다음 작업: **content 도메인(notices/events/coupons) 표준 (§ 3.1) 으로 정렬**. 이 가이드의 표준은 그 정렬 후 모습을 가정.

---

## 4. 파일 네이밍 컨벤션

| 대상 | 컨벤션 | 예 |
|---|---|---|
| 화면(Screen) 컴포넌트 | `PascalCase` + `.jsx` | `CouponScreen.jsx`, `NoticeDetailScreen.jsx` |
| sub 컴포넌트 | `PascalCase` + `.jsx` | `CouponCard.jsx`, `LabelBadge.jsx`, `SectionBlock.jsx` |
| sub 컴포넌트 폴더 | `camelCase` (단일 컴포넌트 묶음) | `couponCard/`, `noticeCard/`, `categoryChip/` |
| SCSS 모듈 | `PascalCase.module.scss` (컴포넌트 동명) | `CouponCard.module.scss` |
| SCSS 공유 (containers 같은 폴더) | `{Group}.module.scss` | `CouponList.module.scss`, `AdminTable.module.scss` |
| 도메인 로컬 토큰 SCSS | `{domain}.tokens.scss` (lower) | `historyMode.tokens.scss`, `community.tokens.scss` |
| hook | `camelCase` + `use` prefix | `useCouponList.js`, `useNoticeDetail.js` |
| util / pure 함수 | `camelCase` | `dateUtils.js`, `applyAsyncHandlers.js`, `utils.js` |
| 정책/정적 const | `SCREAMING_SNAKE_CASE.js` | `MENU_GROUPS.js`, `ROUTE_PATHS.js`, `MOCK_HISTORY_LEGENDS.js`, `QUICK_MENUS.js` |
| barrel | `index.js` (소문자) | `global/ui/responseModal/index.js` |
| store slice | `slices.js` (복수형 — 단일 slice 라도) | `events/store/slices.js` |
| store thunks | `thunks.js` | `coupons/store/public/thunks.js` |
| store endpoint | `endpoints.js` (복수) | (URL const + action type const 둘 다 export) |
| store axios wrapper | `api.js` | (얇은 wrapper, 한 함수당 1줄 axios call) |
| store DTO 변환 | `dto.js` (옵션) | `events/store/dto.js`, `quiz/store/dto.js` |
| Redux action type | `slice prefix + / + verb` | `auth/setUser`, `operation/setLastOperation` |
| BE endpoint const key | `URL_*` 또는 액션류 (`GET_LIST`, `INSERT`) | `COUPONS.GET_COUPONS`, `ADMIN_NOTICE_ACTIONS.INSERT` |
| createAsyncThunk type | `"VERB/path/action"` 문자열 | `"GET/coupons/list"`, `"GET/quiz/latest"` |
| 라우트 element prefix | `{Name}Page` (lazy import 변수명) | `const HomePage = lazy(() => import(".../HomeScreen.jsx"))` |

> ⚠ 컴포넌트 파일은 항상 `default export` 1개. barrel(`index.js`) 에서 named re-export 로 노출.

---

## 5. Store 구조 (Redux Toolkit)

### 5.1 라이브러리

- `@reduxjs/toolkit` (`createSlice`, `createAsyncThunk`, `createListenerMiddleware`)
- `react-redux` (`useSelector`, `useDispatch`, `Provider`)
- 단일 store: `web/src/app/store/store.js`
- 단일 axios instance: `web/src/infra/http/client.js` (export `API`)

### 5.2 store 파일 layout (5 파일 표준)

#### Variant A — public/admin 분기 (★ 표준)

활성 도메인 (events, coupons, notices, quiz):

```text
domains/{domain}/store/
├── public/
│   ├── api.js          # axios call (return raw axios response)
│   ├── endpoints.js    # path const + action type const
│   └── thunks.js       # createAsyncThunk (사용자 화면용 — payload.options 미반환)
├── admin/
│   ├── api.js
│   ├── endpoints.js
│   └── thunks.js       # admin 전용 — payload.options 반환 (operationListener 처리)
├── dto.js              # (옵션) 응답 ↔ state shape 변환
└── slices.js           # createSlice + applyAsyncHandlers (public/admin 둘 다 처리)
```

#### Variant B — 단일 layout (admin 분기 없음)

authentication 처럼 admin 화면 자체가 의미 없는 도메인:

```text
domains/{domain}/store/
├── api.js
├── endpoints.js
├── thunks.js
└── slices.js
```

> 신규 도메인은 거의 항상 **Variant A** 채택. admin UI 가 당장 없어도 store/admin 폴더는 미리 준비 (notices/coupons/events 패턴).

### 5.3 파일별 책임

**`endpoints.js`**:
```js
// URL const + action type const 같이 export
export const COUPONS = {
  GET_COUPONS: "/coupons",
}
export const COUPON_ACTIONS = {
  GET_COUPON_LIST: "GET/coupons/list",
}
```

**`api.js`** — 한 함수당 한 axios call. 응답 가공 금지 (thunks 책임):
```js
import { API } from "@/infra/http/client.js";
import { COUPONS } from "@/domains/coupons/store/public/endpoints.js";

export const fetchGetUserCoupon = async () => {
  const { data } = await API.get(`${COUPONS.GET_COUPONS}`);
  return data;
};
```

**`thunks.js`** — `createAsyncThunk(actionType, async (arg, { rejectWithValue }) => {...})`:
```js
export const requestGetUserCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST, async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchGetUserCoupon();
      return [...data].filter(c => c.visible).sort((a, b) => b.id - a.id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
```
- 정렬·필터는 thunks 단에서 처리 (화면 hook 또는 컴포넌트에서 다시 가공 금지)
- admin thunk 는 추가로 `return { ..., options: { success, message, kind, scope, ts } }` 반환 → operationListener 가 toast/모달 발화

**`slices.js`** — `applyAsyncHandlers` 헬퍼로 pending/fulfilled/rejected 일괄 등록:
```js
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers.js";

const initialState = { coupons: [], loading: false, error: null };

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, requestGetUserCouponList, (state, action) => {
      state.coupons = action.payload;
    });
    // ... admin thunk 도 같은 builder 에 등록
  },
});

export default couponSlice.reducer;
```
- `state.loading` / `state.error` 는 `applyAsyncHandlers` 가 자동 관리
- `extraReducers` 에 직접 `addCase` 호출 지양 (auth slice 만 인증 흐름 특수성으로 직접 작성)

### 5.4 store/store.js 등록

```js
// web/src/app/store/store.js
export const store = configureStore({
  reducer: {
    operation: operationReducer,    // 공통 모달 신호
    auth:      authReducer,
    events:    eventsReducer,
    coupon:    couponReducer,       // ⚠ 단수형 — 'coupons' 아님 (slice.name === 'coupon')
    upload:    upLoadReducer,       // infra/api/uploads
    quiz:      quizReducer,
    notices:   noticesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(operationListener.middleware),
});
```
- 신규 도메인 추가 시 이 파일에 import + reducer 키 추가 1줄
- key 명은 slice 의 `name` 과 일치시킴 (예외: `coupon` 단수, `notices` 복수 — 도메인 폴더명과 다를 수 있음)

### 5.5 operationListener (admin 토스트/모달)

- `web/src/app/store/operation/operationListener.js`: middleware 가 `payload.options` 를 가진 fulfilled/rejected 액션 + `state.auth.userRole === 'ADMIN'` 일 때만 `setLastOperation` 디스패치
- `web/src/app/store/operation/ResponseListener.jsx`: `state.operation.lastOperation` 을 watch 해서 `<ResponseModal>` 출력
- **사용자(public) thunk 는 `payload.options` 미반환** — admin 분기로 차단됨

### 5.6 hook 컨벤션

```js
// domains/coupons/mobile/hooks/useCouponList.js
export const useCouponList = () => {
  const dispatch = useDispatch();
  const couponList = useSelector(state => state.coupon.coupons) ?? [];

  useEffect(() => {
    dispatch(requestGetUserCouponList());
  }, [dispatch]);

  const now = formatNow(new Date());
  return {
    activeCoupon:  couponList.filter(c => c.expireAt >= now),
    expiredCoupon: couponList.filter(c => c.expireAt < now),
  };
};
```
- hook 1개당 thunk 1개 dispatch 가 일반적 패턴
- 화면 가공(active/expired 분리) 은 hook 에서 (컴포넌트에서 다시 계산 금지)

---

## 6. Routing 구조

### 6.1 폴더

```text
web/src/app/router/
├── index.jsx                       # createBrowserRouter — 한 path "/" 에 children 으로 합침
├── config/
│   ├── routePath.js                # path 문자열 const (소문자 / 동사 없는 명사)
│   └── routeMeta.js                # path + title 묶음 (handle 메타에 cite)
├── guards/
│   └── AuthGuard.jsx               # allow={"ADMIN"|"USER"|배열} 체크 + Navigate
└── routes/
    ├── PublicRoutes.jsx            # 비인증 라우트 (lazy import 직접)
    ├── UserRoutes.jsx              # AuthGuard 보호 (현재 비어있음)
    └── AdminRoutes.jsx             # AuthGuard ADMIN 보호 (현재 모두 주석)
```

### 6.2 라우터 골격

```jsx
// web/src/app/router/index.jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,                  // MobileLayout 1개로 PC/모바일 통합
    children: [
      ...PublicRoutes,
      ...userRoutes,
      ...AdminRoutes,
    ],
  },
]);
```

### 6.3 라우트 추가 패턴

```jsx
// web/src/app/router/routes/PublicRoutes.jsx
import { lazy } from "react";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));

export const PublicRoutes = [
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title },
];
```
- 라우트 element 명은 `{Name}Page` (Screen 임에도 Page 로 명명 — 라우터 단 alias)
- `handle` 에 `ROUTE_META.{KEY}.title` 을 넘기면 페이지 타이틀 메타로 사용
- `app/page/` 폴더는 폐기됨 (`716e3ad` 커밋) — 라우터에서 직접 도메인 Screen 을 lazy import

### 6.4 PC/모바일 분기

- **현재 분기 없음**. `AppWrapper` → `MobileLayout` 단일 레이아웃. 신규 도메인은 무조건 `mobile/` 진입
- `feature/components/user/post/{pc,mobile}/` 같은 도메인 내부 분기는 community legacy 한정 (라우트 미등록)

---

## 7. Layout / Wrapper / Provider

### 7.1 트리

```text
<AppProvider>                               # web/src/app/provider/AppProvider.jsx
  <Provider store={store}>                  # react-redux
    <ResponseListener />                    # 공통 모달 (operation slice watcher)
    <AuthProvider>                          # web/src/app/provider/AuthProvider.jsx
      <RouterProvider router={router}>
        <AppWrapper>                        # web/src/app/wrapper/AppWrapper.jsx (useGA4PageView)
          <MobileLayout>                    # web/src/app/wrapper/mobile/MobileLayout.jsx
            <TopBarProvider>                # web/src/app/provider/TopBarProvider.jsx
              <TopBar variant=home|page />  # parts/TopBar.jsx
              <Drawer />                    # parts/Drawer.jsx (MENU_GROUPS)
              <Suspense>
                <Outlet />                  ← 도메인 Screen 마운트
              </Suspense>
            </TopBarProvider>
          </MobileLayout>
        </AppWrapper>
      </RouterProvider>
    </AuthProvider>
  </Provider>
</AppProvider>
```

### 7.2 책임 분리

- **`AppProvider`**: Redux Provider + healthCheck 부팅(AuthProvider) + 글로벌 ResponseListener
- **`AuthProvider`**: 마운트 시 `requestUserHealthCheck` dispatch → `state.auth.initialized` 가 true 될 때까지 children 렌더 차단 (`return null`)
- **`AppWrapper`**: GA4 page view tracking (`useGA4PageView`)만 담당. 현재 `MobileLayout` 만 렌더 — PC 분기 코드 자체 없음
- **`MobileLayout`**: TopBar + Drawer + Suspense + 라우트 전환 시 scroll-to-top 처리. 도메인 Screen 은 `<Outlet />` 으로 마운트
- **`TopBarProvider`**: page-level TopBar variant 제어. 도메인 Screen 에서 `useSetTopBar({ variant: "home" })` 으로 마운트 시 한 번 설정

### 7.3 도메인에서 TopBar 커스터마이즈

```jsx
// HomeScreen.jsx 만 home variant 사용 (햄버거 + 로고 + 로그인)
useSetTopBar({ variant: "home" });
```
- 일반 도메인 화면은 호출 생략 (기본 `page` variant — 좌측 back 버튼)

### 7.4 글로벌 메뉴 (MENU_GROUPS)

`web/src/app/wrapper/mobile/config/MENU_GROUPS.js` — Drawer 메뉴 정의. 신규 도메인 라우트 추가 시 이 파일에 항목 추가 (단, badge 숫자는 현재 하드코딩).

---

## 8. 글로벌 UI 컴포넌트 (`web/src/global/ui/`)

```text
global/ui/
├── badge/                          # 카드/리스트 라벨류 (barrel 없음)
│   ├── LabelBadge.jsx              # update/patch/cafe/tip/important/mustread 6 variant
│   ├── PinnedBadge.jsx
│   └── StatusBadge.jsx
├── mobile/                         # 모바일 전용 레이아웃 부품
│   └── section/
│       ├── SectionBlock.jsx        # 섹션 wrapper (title + 우측 to/linkText + children)
│       ├── SectionHeader.jsx
│       └── Section.module.scss     # 공유 SCSS
├── responseModal/                  # 공통 응답 모달 (operationListener 와 짝)
│   ├── ResponseModal.jsx
│   ├── ResponseModal.module.scss
│   └── index.js                    # barrel: export { default as ResponseModal }
├── visibleToggle/                  # admin 토글 (visible on/off)
│   ├── VisibleToggle.jsx
│   ├── VisibleToggle.module.scss
│   └── index.js
└── renewalNoticeModal/             # 리뉴얼 안내 모달
    ├── RenewalNoticeModal.jsx
    ├── RenewalNoticeModal.module.scss
    └── index.js
```

**규칙**:
- **단일 컴포넌트** (예: `LabelBadge`) 는 폴더 없이 `badge/LabelBadge.jsx` 평면 배치 가능
- **시각적으로 묶이는 컴포넌트군** (modal, toggle, section) 은 폴더 + `index.js` barrel
- 도메인에서 import 시 절대 경로: `@/global/ui/{폴더}/{Component}.jsx` 또는 barrel: `@/global/ui/responseModal`
- **외부 통신 금지** — 받은 props 만 렌더 (axios / dispatch 호출 없음)

### 8.1 `global/styles/`

```text
global/styles/
├── index.scss                      # vite additionalData (변수 + 믹스인 forward)
├── global.scss                     # main.jsx 가 import — 전역 reset/typography
├── variables/   _colors, _font, _spacing, _radius, _breakpoints, _zindex, _semantic
├── mixins/      _flex, _layout, _media, _typography, _table, _background
├── base/        _base, _typography
└── semantic/    _color
```

- `.module.scss` 내부에서 `@use "..."` 호출 **불필요** — 변수/믹스인 자동 주입
- 도메인 SCSS 는 항상 `*.module.scss` (CSS Modules) — 글로벌 클래스 금지
- 도메인 로컬 토큰 필요 시 `domains/{name}/mobile/{name}.tokens.scss` (community / historyMode 패턴)

### 8.2 `global/utils/`

```text
global/utils/
└── datetime/dateUtils.js           # formatNow, isExpired
```

- pure 함수만 (axios / dispatch / DOM 접근 금지)
- 도메인 횡단 사용처가 있을 때만 추가. 도메인 단일 사용은 `domains/{name}/mobile/utils.js` 로

---

## 9. infra (`web/src/infra/`)

```text
infra/
├── http/
│   └── client.js                   # 단일 axios instance (export API) + interceptors
├── analytics/
│   ├── ga.js                       # pushEvent / setUserProperties
│   ├── hooks/useGA4PageView.js     # AppWrapper 가 사용
│   ├── events/                     # 도메인별 GA event helper
│   │   ├── authEvents.js
│   │   ├── couponEvents.js
│   │   └── eventEvents.js
│   └── README.md
└── api/
    └── uploads/                    # S3 image upload (event/quiz admin 횡단)
        ├── api.js
        ├── endpoints.js
        ├── thunks.js
        ├── slices.js
        └── index.js                # barrel (필수)
```

**infra 채택 기준 (둘 다 만족)**:
1. 외부 시스템 통신 (axios, GA4 SDK, 외부 service)
2. 도메인 ≥ 2개 횡단 사용 (또는 시스템 횡단 의도 명시)

> 단일 도메인만 쓰는 외부 통신 코드는 `domains/{name}/store/` 에 둠 (예: authentication callback 은 외부 OAuth 지만 도메인 단일 사용 → 도메인에 위치).

---

## 10. 데이터 / Mock / Config

### 10.1 정적 mock 위치 (3 갈래)

| 위치 | 사용 시점 | 예 |
|---|---|---|
| `web/src/data/{domain}/*.js` | 도메인 store 자체가 미구축, 화면이 mock 만 표시 | `data/community/*`, `data/historyMode/*` (현재 폐기, `domains/historyMode/config/` 로 이전됨) |
| `domains/{domain}/config/MOCK_*.js` | 도메인 안에서 mock 을 보존, 부분 BE 연동 진행 中 | `domains/home/config/MOCK_POSTS.js`, `domains/historyMode/config/MOCK_HISTORY_*.js` |
| `domains/{domain}/store/` 의 정적 응답 | (현재 사용 0건) | — |

> 신규 화면은 가능하면 처음부터 store/thunks 까지 만들고 thunk 응답을 mock 으로 하드코딩하는 방식 권장. `data/` 직접 import 는 **임시 패턴**.

### 10.2 정책 const (mock 아님)

- `domains/home/config/QUICK_MENUS.js` — Hero 아래 빠른 메뉴 (라우트 + icon)
- `app/wrapper/mobile/config/MENU_GROUPS.js` — Drawer 메뉴
- `app/router/config/routePath.js`, `routeMeta.js` — 라우트 path/title

`SCREAMING_SNAKE_CASE.js` 파일명 + `export const NAME = [...]` 패턴.

---

## 11. 신규 도메인 스캐폴드 가이드

content 도메인 (BE 연동 + 사용자 화면 + admin 화면 예정) 추가 시 따라야 할 표준:

### 11.1 폴더 + 파일 생성

```text
domains/{newDomain}/
├── README.md                                       # 1.목적 / 2.폴더 / 3.파일별 / 4.데이터 흐름 / 5.BE / 9.수정 / 10.규칙
├── mobile/
│   ├── {NewDomain}Screen.jsx                       # default export, 라우트 진입
│   ├── {NewDomain}Screen.module.scss
│   ├── components/
│   │   └── {subName}/
│   │       ├── {SubName}.jsx
│   │       └── {SubName}.module.scss
│   ├── containers/public/
│   │   ├── {NewDomain}ListVertical.jsx
│   │   └── {NewDomain}List.module.scss
│   └── hooks/
│       └── use{NewDomain}List.js
└── store/
    ├── public/
    │   ├── api.js
    │   ├── endpoints.js
    │   └── thunks.js
    ├── admin/                                      # admin UI 미구현이라도 미리 준비
    │   ├── api.js
    │   ├── endpoints.js
    │   └── thunks.js
    └── slices.js
```

### 11.2 등록 체크리스트

1. **store 등록**: `web/src/app/store/store.js` 에 reducer key 추가
2. **라우트 메타**: `web/src/app/router/config/routePath.js` + `routeMeta.js` 에 path/title 추가
3. **라우트 등록**: `PublicRoutes.jsx` (또는 `UserRoutes.jsx` / `AdminRoutes.jsx`) 에 lazy import + entry 추가
4. **메뉴 노출** (옵션): `app/wrapper/mobile/config/MENU_GROUPS.js` 에 Drawer 메뉴 추가
5. **GA 이벤트** (옵션): `infra/analytics/events/{newDomain}Events.js` 에 helper 추가
6. **README.md**: events / authentication 도메인 README 패턴 따라 작성 (한국어, 10 섹션 권장)

### 11.3 import 컨벤션

- 항상 **절대 경로** (`@/...`) 사용. 상대 경로 (`../../`) 는 같은 sub-component 폴더 내부 한정
- 도메인 외부에서 import 가능한 경계:
  - `mobile/{Screen}.jsx` (라우터 lazy import 만)
  - `mobile/containers/public/*.jsx` (다른 도메인 collector — home 등)
  - `mobile/hooks/use*.js` (다른 도메인이 hook 만 재사용 — home 패턴)
  - `store/public/thunks.js` 의 thunk action (다른 도메인 hook 에서 dispatch)
- **외부에서 import 금지**: `mobile/components/**`, `store/{public,admin}/api.js`, `store/{public,admin}/endpoints.js`

---

## 12. 금지 / 주의 사항

### 12.1 폴더 구조 안티패턴

- ❌ `domains/{name}/page/` 또는 `domains/{name}/feature/` 신규 생성 — community legacy 패턴, **새 코드는 `mobile/` 만**
- ❌ `app/page/{Name}Page.jsx` 1줄 wrapper 부활 — `716e3ad` 커밋으로 폐기됨. 라우터에서 직접 도메인 Screen lazy import
- ❌ `domains/{name}/components/` (mobile 외부) — 모든 sub component 는 `mobile/components/` 안에
- ❌ `containers/` 가 hook + UI 둘 다 자기 안에 정의 — hook 은 항상 `mobile/hooks/` 분리

### 12.2 store 안티패턴

- ❌ thunks 를 `slices.js` 안에 정의 — 항상 `thunks.js` 분리
- ❌ thunk 안에서 응답 가공 없이 raw data 반환 + 컴포넌트에서 가공 — 정렬/필터는 thunk 단
- ❌ `store/store.js` 가 아닌 곳에서 reducer 등록
- ❌ `useSelector` 결과를 컴포넌트에서 다시 계산 — hook 에서 `return { activeX, expiredX }` 식으로 가공
- ❌ `state.auth.user`, `state.auth.userRole` 외 키 추가 (slice 가 정의한 shape 만 사용. 현재 `state.auth.authority` 참조하는 코드 있으나 slice 정의 없음 — 사용 분기 자체가 미구현이라 영향 없음, 추후 정리)

### 12.3 컴포넌트 분해 정책 (memory `feedback_component_decomposition`)

- 단일 페이지 상태분기형 화면(예: HistoryModeScreen) 은 sub component 분리 **최소화**. 반복 / 변형 / 외부 재사용 셋 중 하나 이상 충족할 때만 분리
- 1회 사용 / 단순 markup 은 부모 화면 안 인라인
- community 패턴 참조: `Section`, `PostRow`, `CommunityBadge` 등은 **반복 + 외부 재사용** 충족이라 분리됨

### 12.4 도메인 자체 헤더 금지 (memory `feedback_no_domain_header`)

- 도메인 Screen 안에 별도 `<header>` 만들지 말 것
- 글로벌 `MobileLayout` TopBar 로 통일. variant 만 `useSetTopBar` 로 전환

### 12.5 legacy 잔존 코드 회피

- `community/{feature,page}/*`, `community/store/thunks/{board,post,tag,user}Thunks.js` — 라우트 미등록, BE 호출 코드 잔존하나 **참조 금지**
- `app/store/store.js:17-18` 의 `// community: communityReducer` 주석 — community IA 재개 후 표준 (§ 3.1) 으로 정렬 후 활성
- `AdminRoutes.jsx` 의 모든 lazy import 주석 — admin UI 신규 기획 후 `domains/{name}/feature/admin/` 패턴 으로 재구현 예정
- `routePath.js` 에 정의된 `community: "/community"` 는 **메타만** 살아있고 라우트 entry 는 없음

### 12.6 import 안티패턴

- ❌ `domains/A/mobile/components/X.jsx` 를 도메인 B 가 import — 외부 재사용 의도 있으면 `containers/` 또는 `global/ui/` 로 승격
- ❌ `data/*.js` 직접 import (community/historyMode 만 임시 허용) — 정식 도메인은 store/thunks 경유
- ❌ relative path 깊게 (`../../../`) — 항상 `@/` alias

---

## 13. 참고 cite

- `docs/specs/fe/module-conventions.md` — store layout 변종 / barrel 정책 / infra 경계 (본 문서의 § 3, § 5, § 9 의 출처)
- `docs/specs/fe/api-calls.md` — 도메인별 활성 endpoint 카탈로그 (Live/Admin TBD 분류)
- `docs/specs/fe/dead-suspects.md` — dead code 후보 (정리 대기)
- 도메인 README:
  - `web/src/domains/events/README.md` — content 도메인 README 작성 표준 (10 섹션)
  - `web/src/domains/authentication/README.md` — Variant B + 인프라성 도메인 README 표준
  - `web/src/domains/coupons/README.md` — content 도메인 README 표준
  - `web/src/domains/community/README.md` — mobile 리뉴얼 + legacy 공존 도메인 README

---

## 14. 핵심 요약 (treetop)

```text
새 도메인 'content' 추가 시:

1. domains/content/
   ├── README.md                                   ← events/README.md 따라 작성
   ├── mobile/
   │   ├── ContentScreen.jsx                       ← 라우트 진입
   │   ├── components/{contentCard}/
   │   ├── containers/public/{ContentList*}.jsx
   │   └── hooks/useContentList.js
   └── store/
       ├── public/  { api, endpoints, thunks }
       ├── admin/   { api, endpoints, thunks }     ← admin UI 없어도 미리 준비
       └── slices.js                               ← applyAsyncHandlers 사용

2. app/store/store.js               → import + reducer 등록
3. app/router/config/routePath.js   → path 추가
4. app/router/config/routeMeta.js   → title 추가
5. app/router/routes/PublicRoutes.jsx → lazy + element 추가
6. app/wrapper/mobile/config/MENU_GROUPS.js → Drawer 메뉴 (옵션)
```

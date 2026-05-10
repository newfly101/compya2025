# Frontend Developer Guide (single entry)

> Claude / 신규 작업자가 frontend 작업 시 1차 참조하는 단일 가이드. 깊이 들어가야 할 때만 `docs/specs/fe/*` cite.
> 관련: `frontend-structure.md` (전체 구조), `module-conventions.md` (store/barrel/infra 경계), `api-calls.md` (활성 endpoint), `dead-suspects.md` (정리 대기).

---

## 1. 빌드 환경

- Vite (`web/vite.config.js`) + path alias `@` → `web/src/` (절대경로 `@/...` 만 사용, 깊은 `../../` 금지)
- SCSS auto-inject: `@/global/styles/index.scss` 가 모든 `*.module.scss` 에 자동 prepend → SCSS 안에서 `@use` 불필요
- 진입: `web/src/main.jsx` → `<AppProvider><RouterProvider /></AppProvider>`

---

## 2. 최상위 폴더 (`web/src/`)

| 폴더 | 책임 |
|---|---|
| `app/` | 앱 골격 (router / store / wrapper / provider). 도메인 코드 없음 |
| `domains/{name}/` | 도메인 단위 응집 (Screen + hook + store) |
| `global/` | 도메인 횡단 UI / 스타일 / pure util — 외부 통신 없음 |
| `infra/` | 외부 시스템 어댑터 (axios `http/`, GA4 `analytics/`, S3 `api/uploads/`) |
| `data/` | 정적 mock JSON/JS — community / historyMode 만 임시 허용 |
| `assets/` | 정적 이미지 |

신규 코드는 무조건 **`mobile/`** 진입. PC legacy 패턴 (`feature/`, `page/`) 신규 생성 금지.

---

## 3. 표준 도메인 폴더 트리 (★ events / coupons / notices 기준)

```text
domains/{domain}/
├── README.md                       # 활성 도메인 권장
├── mobile/
│   ├── {Domain}Screen.jsx          # 라우트 진입 (lazy 대상). 자체 헤더 만들지 말 것
│   ├── {Domain}Screen.module.scss
│   ├── {domain}.tokens.scss        # (옵션) 도메인 로컬 :root 토큰
│   ├── components/                 # 도메인 sub component (외부 재사용 X)
│   │   └── {subName}/
│   │       ├── {SubName}.jsx
│   │       └── {SubName}.module.scss
│   ├── containers/public/          # 리스트/섹션 조립 — 다른 도메인 import 가능 (home collector 등)
│   │   └── {Domain}List{Horizontal|Vertical}.jsx
│   └── hooks/
│       └── use{Domain}List.js      # dispatch + selector 캡슐화
└── store/                          # § 4 참조
```

규칙
- sub-component 폴더: **camelCase 폴더 + PascalCase 파일** (`couponCard/CouponCard.jsx`)
- 단일페이지 상태분기형 화면은 sub-component 분리 최소화 (반복/변형/외부재사용 셋 중 하나 만족 시만 분리)
- 도메인 자체 `<header>` 만들지 말 것 — 글로벌 `MobileLayout` TopBar 사용 (`useSetTopBar({ variant: "page" })`)

---

## 4. Store layout (Variant A — public/admin 분기, ★ 표준)

```text
domains/{domain}/store/
├── public/
│   ├── api.js          # axios call (얇은 wrapper, 가공 금지)
│   ├── endpoints.js    # path const + action type const
│   └── thunks.js       # createAsyncThunk — payload.options 미반환
├── admin/              # admin UI 미구현이라도 미리 준비
│   ├── api.js
│   ├── endpoints.js
│   └── thunks.js       # admin 전용 — payload.options 반환 (operationListener 처리)
├── dto.js              # (옵션) 응답 ↔ state shape 변환
└── slices.js           # createSlice + applyAsyncHandlers (public/admin 통합)
```

핵심
- 정렬/필터는 thunk 단에서 처리 (컴포넌트/hook 에서 다시 가공 금지)
- `slices.js` 는 `applyAsyncHandlers(builder, thunk, (state, action) => {...})` 사용 → `loading`/`error` 자동 관리
- store 등록은 `web/src/app/store/store.js` reducer key 1줄 추가 (key 명 = slice `name`. 예: `coupon` 단수)
- 라이브러리: `@reduxjs/toolkit` + `react-redux`. 단일 axios = `@/infra/http/client.js` (`export API`)

axios + thunk 최소 예
```js
// store/public/api.js
import { API } from "@/infra/http/client.js";
import { COUPONS } from "./endpoints.js";
export const fetchGetUserCoupon = async () => (await API.get(COUPONS.GET_COUPONS)).data;

// store/public/thunks.js
export const requestGetUserCouponList = createAsyncThunk(
  COUPON_ACTIONS.GET_COUPON_LIST,
  async (_, { rejectWithValue }) => {
    try { return (await fetchGetUserCoupon()).filter(c => c.visible); }
    catch (e) { return rejectWithValue(e.message); }
  },
);
```

---

## 5. 파일 네이밍

| 대상 | 컨벤션 | 예 |
|---|---|---|
| Screen / sub 컴포넌트 | PascalCase + `.jsx` | `CouponScreen.jsx`, `CouponCard.jsx` |
| sub 컴포넌트 폴더 | camelCase | `couponCard/`, `categoryChip/` |
| SCSS 모듈 | PascalCase + `.module.scss` | `CouponCard.module.scss` |
| 도메인 로컬 토큰 SCSS | `{domain}.tokens.scss` | `historyMode.tokens.scss` |
| hook | `use` prefix + camelCase | `useCouponList.js` |
| 정적 const | SCREAMING_SNAKE_CASE | `MENU_GROUPS.js`, `MOCK_*.js`, `QUICK_MENUS.js` |
| store slice | `slices.js` (복수형 일관) | `events/store/slices.js` |
| store thunk type | `"VERB/path/action"` | `"GET/coupons/list"` |
| 라우트 lazy 변수 | `{Name}Page` | `const HomePage = lazy(...)` |
| barrel | `index.js` (소문자) | `global/ui/responseModal/index.js` |

컴포넌트는 항상 `default export` 1개. barrel 에서 named re-export.

---

## 6. 신규 도메인 추가 6단계 체크리스트

content 도메인 (BE 연동, 사용자 화면, admin 예정) 기준:

1. **폴더 스캐폴드**: `domains/{newDomain}/` 에 § 3 트리 생성 (`mobile/{Screen,components,containers/public,hooks}` + `store/{public,admin,slices.js}`). admin UI 없어도 `store/admin/` 미리 준비
2. **store 등록**: `web/src/app/store/store.js` 에 `import` + `reducer` key 추가 (slice `name` 과 일치)
3. **라우트 메타**: `web/src/app/router/config/routePath.js` + `routeMeta.js` 에 path/title 추가
4. **라우트 등록**: `app/router/routes/PublicRoutes.jsx` (또는 `UserRoutes`/`AdminRoutes`) 에 lazy import + entry 추가 (§ 7 패턴)
5. **Drawer 메뉴 (옵션)**: `app/wrapper/mobile/config/MENU_GROUPS.js` 에 항목 추가
6. **GA 이벤트 (옵션)**: `infra/analytics/events/{newDomain}Events.js` 에 helper 추가 → 컴포넌트/hook 에서 `pushEvent('page_view', ...)` 직접 호출

활성 도메인은 README.md 권장 (events/authentication/coupons README 패턴).

---

## 7. 라우트 추가 패턴

```jsx
// web/src/app/router/routes/PublicRoutes.jsx
import { lazy } from "react";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));

export const PublicRoutes = [
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title },
];
```

- 라우터 단 변수명은 `{Name}Page` (Screen → Page alias). element 는 도메인 Screen 직접 lazy
- `handle: ROUTE_META.{KEY}.title` 로 페이지 타이틀 메타 세팅
- PC/모바일 분기 없음 — `AppWrapper` → `MobileLayout` 단일 레이아웃

---

## 8. operation / payload.options 1줄 요약

`admin` thunk 만 `return { ...data, options: { success, message, kind, scope, ts } }` → `operationListener` 가 `state.auth.userRole === 'ADMIN'` 일 때만 `<ResponseModal>` 발화. **public thunk 는 options 미반환** (admin role 분기로 자동 차단).

---

## 9. 활성 Public Endpoint (요약)

| METHOD | PATH | 트리거 화면 |
|---|---|---|
| GET | `/users/me` | 모든 라우트 부팅 (`AuthProvider`), `/auth/callback` |
| POST | `/auth/logout` | TopBar 로그아웃 버튼 |
| GET | `/notices` | `/notices`, `/notice/:id`, `/` (HomeScreen NoticeSection) |
| GET | `/coupons` | `/coupons`, `/` (HomeScreen 최신쿠폰) |
| GET | `/events/external` | `/events`, `/` (HomeScreen 진행 중 이벤트) |
| GET | `/quiz/latest` | `/` (HomeScreen QuizSection) |

baseURL: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"`. 인증: `withCredentials: true` 쿠키. 401 응답은 `{ data: null }` swallow. Admin endpoint 는 코드 보존이지만 라우트 비활성 (TBD).

> 도메인별 fetcher/thunk 매핑이 필요하면 `docs/specs/fe/api-calls.md` 또는 `domains/{name}/store/public/{api,thunks}.js` 직접 grep.

---

## 10. Dead 영역 (1줄씩)

- `web/src/data/skill/*` — dictionary/simulate 폐기 후 import 0건. 즉시 정리 가능
- `web/src/domains/community/{feature,page,store/thunks/{board,post,tag,user}Thunks.js}` — IA 재개 대기 (라우트/store 미등록)
- `web/src/domains/home/config/MOCK_{POSTS,TEAM_POSTS,QUIZ}.js` — HomeScreen JSX 주석 후 미연결 (community/quiz 재정리 시 결정)
- `requestUploadImage` chain (`infra/api/uploads/`) — admin form UI 비활성으로 실효 dead, 재기획 시 활성

---

## 11. 안티패턴

- `domains/{name}/page/` 또는 `feature/` 신규 생성 — 새 코드는 `mobile/` 만
- `app/page/{Name}Page.jsx` 1줄 wrapper 부활 (폐기됨, 라우터에서 도메인 Screen 직접 lazy)
- `domains/{name}/components/` (mobile 외부) — 모든 sub component 는 `mobile/components/`
- thunk 를 `slices.js` 안에 정의 / thunk 가 raw 반환 후 컴포넌트에서 가공
- `extraReducers` 에 직접 `addCase` 사용 (auth slice 외 금지 — `applyAsyncHandlers` 사용)
- `data/*.js` 직접 import (community/historyMode 임시 한정)
- 다른 도메인이 `domains/A/mobile/components/**` 를 import — 외부 재사용은 `containers/` 또는 `global/ui/` 로 승격
- 도메인 Screen 안 자체 `<header>` 작성

---

## 12. 도메인 변형 (1줄씩)

- **home** — store 없음. 다른 도메인 hook/container import 해서 조립 (단일 collector 한정)
- **historyMode** — store 없음, mock-only. `config/MOCK_*.js` + `useState/useMemo` hook. BE 연동 시 표준으로 정렬
- **authentication** — admin 분기 없는 Variant B (`store/{api,endpoints,thunks,slices}.js` flat). `callback/AuthCallBack.jsx` 가 라우트 진입
- **quiz** — store 만 보존, UI 폐기 (HomeScreen 의 `requestLatestQuizAnswer` 만 사용). admin UI 재구현 예정
- **community** — PC legacy 와 mobile mock 공존. reducer/route 모두 주석. IA 재개 시 표준으로 정렬

---

## 13. Layout / Wrapper 트리 (참고)

```text
<AppProvider>                       # Redux Provider + ResponseListener + AuthProvider
  <AuthProvider>                    # healthCheck dispatch — initialized 전 children 차단
    <RouterProvider>
      <AppWrapper>                  # useGA4PageView
        <MobileLayout>              # TopBar + Drawer + Suspense + scroll-to-top
          <TopBarProvider>
            <Outlet />              # 도메인 Screen 마운트 위치
```

도메인 Screen 에서 TopBar variant 변경: `useSetTopBar({ variant: "home" })` (HomeScreen 만. 일반 도메인은 호출 생략 → 기본 `page` variant).

---

## 14. 글로벌 UI / SCSS 토큰 위치 (cheat sheet)

```text
global/
├── ui/
│   ├── badge/                      # LabelBadge / PinnedBadge / StatusBadge (단일 파일 평면)
│   ├── mobile/section/             # SectionBlock / SectionHeader (+ 공유 SCSS)
│   ├── responseModal/              # 폴더 + index.js barrel (필수)
│   ├── visibleToggle/              # admin 토글
│   └── renewalNoticeModal/
├── styles/
│   ├── index.scss                  # vite additionalData (변수+믹스인 forward)
│   ├── global.scss                 # main.jsx import — 전역 reset/typography
│   ├── variables/                  # _colors _font _spacing _radius _breakpoints _zindex _semantic
│   ├── mixins/                     # _flex _layout _media _typography _table _background
│   ├── base/  semantic/
└── utils/
    └── datetime/dateUtils.js       # formatNow, isExpired (pure 만)
```

Infra 채택 기준: **외부 시스템 통신** AND **도메인 ≥ 2개 횡단** 둘 다 만족 (axios / GA4 / S3 upload). 단일 도메인 외부 통신은 도메인 store 에 둠 (예: authentication OAuth callback).

---

## 15. import 경계

도메인 외부에서 import 가능
- `mobile/{Screen}.jsx` (라우터 lazy 만)
- `mobile/containers/public/*.jsx` (다른 도메인 collector — home 등)
- `mobile/hooks/use*.js` (다른 도메인 hook 재사용)
- `store/public/thunks.js` 의 thunk action

외부 import 금지: `mobile/components/**`, `store/{public,admin}/{api,endpoints}.js`.

---

## 16. cite

- 폴더/파일 디테일: `docs/specs/fe/frontend-structure.md`
- store 변형 / barrel / infra 경계 디테일: `docs/specs/fe/module-conventions.md`
- endpoint 풀 카탈로그 (admin 포함): `docs/specs/fe/api-calls.md`
- dead 후보 분류: `docs/specs/fe/dead-suspects.md`
- 도메인 README: `web/src/domains/{events,authentication,coupons,community}/README.md`

# FE 코드베이스 컨벤션 (cheat sheet)

> agent JIT 참조용. 1차 진실 소스 = `docs/develop/frontend-developer.md`.
> 스택: **React + Redux Toolkit + Vite + JSX (TS 아님)**.

---

## 1. 진입

```jsx
// web/src/main.jsx
<AppProvider><RouterProvider router={router} /></AppProvider>
```

| 위치 | 역할 |
|---|---|
| `web/src/main.jsx` | 진입 |
| `web/src/app/provider/AppProvider.jsx` | Redux + Auth + TopBar provider 통합 |
| `web/src/app/wrapper/mobile/MobileLayout.jsx` | 모바일 wrapper (TopBar + Drawer + outlet) |

---

## 2. 도메인 폴더 트리

```
web/src/domains/{name}/
├── mobile/
│   ├── {Domain}Screen.jsx              # 진입 화면 (라우트 매핑)
│   ├── components/{subName}/{SubName}.jsx
│   ├── containers/public/{XxxList}.jsx # 데이터 fetching + container
│   └── hooks/use{XxxName}.js
└── store/
    ├── public/{api,endpoints,thunks}.js
    ├── admin/{api,endpoints,thunks}.js
    ├── dto.js                          # (옵션)
    └── slices.js                       # createSlice + applyAsyncHandlers
```

⭐ `pages/`, `feature/` 폴더 신규 생성 X. 신규 도메인 = 위 트리 복제.

---

## 3. store layout

| 파일 | 역할 |
|---|---|
| `store/public/api.js` | axios instance + baseURL (공개 API) |
| `store/public/endpoints.js` | endpoint 함수 (api 호출 wrapper) |
| `store/public/thunks.js` | `createAsyncThunk` |
| `store/admin/*` | 관리자 동일 구조 |
| `store/dto.js` | (옵션) 응답 → 도메인 모델 변환 |
| `store/slices.js` | `createSlice` + `applyAsyncHandlers(builder, thunks)` |

### slices.js 패턴

```js
import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers";
import * as thunks from "./thunks";

const slice = createSlice({
  name: "{domain}",
  initialState: { items: [], loading: false, error: null },
  reducers: { /* 동기 */ },
  extraReducers: (builder) => applyAsyncHandlers(builder, thunks),
});
export const { actions, reducer } = slice;
```

⭐ `extraReducers` 에 `addCase` 직접 작성 X. 항상 `applyAsyncHandlers`.

---

## 4. 라우트

| 파일 | 역할 |
|---|---|
| `app/router/routes/{Public,Admin,User}Routes.jsx` | route 정의 |
| `app/router/config/routeMeta.js` | TopBar variant / title 메타 |
| `app/router/config/routePath.js` | 경로 상수 |
| `app/router/guards/AuthGuard.jsx` | 보호 wrapper |

```jsx
const {Domain}Page = lazy(() => import("@/domains/{name}/mobile/{Domain}Screen"));
```

⭐ 등록 시 `routeMeta.js` TopBar 메타 1줄 + `routePath.js` 상수 1줄.

---

## 5. store 등록

```js
// web/src/app/store/store.js
import { reducer as {domain}Reducer } from "@/domains/{name}/store/slices";
reducer: { {domain}: {domain}Reducer, ... }
```

---

## 6. 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `CouponScreen`, `CouponCard` |
| 폴더 | camelCase | `couponCard/`, `historyMode/` |
| slice 파일 | 복수형 | `slices.js` (단수 X) |
| hook | `use*` | `useTopBar`, `useFetchCoupons` |
| lazy var | `{Name}Page` | `CouponPage` |
| route 상수 | UPPER_SNAKE | `COUPONS`, `HISTORY_MODE` |

---

## 7. TopBar

```jsx
import { useSetTopBar } from "@/app/provider/TopBarProvider";
useSetTopBar({ variant: "page", title: "도메인명" });
```

⭐ 도메인 자체 `<Header>` 생성 금지.
⭐ 모바일 wrapper / frame width 전략 (375 / 320 보호 / 8pt grid / tap 44px): [`docs/global-guide/design/mobile-frame.md`](../../docs/global-guide/design/mobile-frame.md)

---

## 8. 안티패턴

- ❌ `pages/`, `feature/` 폴더 신규
- ❌ `.tsx`, `slice.ts`, `router.tsx`, `store.ts` 파일명 (전부 `.js`/`.jsx`)
- ❌ `extraReducers` 직접 `addCase`
- ❌ 도메인 자체 `<Header>` / `<MobileLayout>` 우회
- ❌ inline endpoint 호출 (`endpoints.js` → `thunks.js` → 컴포넌트)

---

## 9. 신규 도메인 추가 체크리스트

- [ ] `domains/{name}/mobile/{Domain}Screen.jsx`
- [ ] `domains/{name}/store/{public,admin}/{api,endpoints,thunks}.js`
- [ ] `domains/{name}/store/slices.js` (`applyAsyncHandlers`)
- [ ] `app/store/store.js` reducer 등록
- [ ] `app/router/routes/{Public,Admin,User}Routes.jsx` lazy + Route
- [ ] `app/router/config/routeMeta.js` TopBar 메타
- [ ] `app/router/config/routePath.js` 경로 상수
- [ ] `useSetTopBar` 적용

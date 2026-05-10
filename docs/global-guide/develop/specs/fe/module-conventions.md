# 모듈 컨벤션

> baseline: `web/src/**` (현 코드 실측)
> 목적: store 분리 / SCSS module / 토큰 / 컴포넌트 분해 정책 / import alias 표준 — 신규 도메인 추가 시 일관성 유지
> 짝 spec: `frontend-structure.md` (트리), `api-calls.md` (endpoint 매핑)

---

## 1. import alias

| alias | 매핑 | 정의 |
|---|---|---|
| `@/` | `web/src/` | `web/vite.config.js:resolve.alias` |

- 모든 도메인 import 는 `@/...` 절대 경로 사용 (상대 경로 `../../` 금지)
- 같은 폴더 내부 파일 참조만 `./X` 허용 (e.g. Screen 이 같은 폴더의 `*.module.scss`, 같은 폴더 hooks/components)
- `node_modules` 는 그냥 바로 import (alias 없음)

---

## 2. store 폴더 표준

### 2.1 public / admin 분리 (★ 표준)

`coupons / events / notices / quiz` 가 따르는 표준:

```text
domains/{name}/store/
├── public/
│   ├── endpoints.js     # path 상수 + ACTIONS 상수
│   ├── api.js           # axios call 얇은 wrapper
│   └── thunks.js        # createAsyncThunk
├── admin/
│   ├── endpoints.js
│   ├── api.js
│   └── thunks.js
├── dto.js               # (선택) post/patch payload 가공 — events/quiz/community 사용
└── slices.js            # createSlice — public + admin thunk 모두 extraReducers 에 등록
```

**규칙**

- **endpoints.js**: 두 set 동시 export — (a) `XXX = { GET_FOO: "/api/path", UPDATE: (id) => ... }` (axios path), (b) `XXX_ACTIONS = { GET_LIST: "GET/path/list" }` (createAsyncThunk type identifier)
- **api.js**: `import { API } from "@/infra/http/client.js"` → `const { data } = await API.get(...)` → `return data` 형태. 단일 책임 (얇은 wrapper)
- **thunks.js**: `createAsyncThunk(ACTIONS.X, async (arg, { rejectWithValue }) => {...})`. payload filter/sort 가공은 여기서 (`.filter(c => c.visible).sort((a,b) => b.id - a.id)`)
- **slices.js**: `applyAsyncHandlers(builder, thunk, (state, action) => {...})` 헬퍼 사용 (`@/app/store/utils/applyAsyncHandlers.js`). pending/rejected 는 헬퍼가 자동 처리, fulfilled 만 도메인 별 핸들러
- **store 등록**: `web/src/app/store/store.js` 의 `reducer:` 에 등록. 미등록 reducer 는 dispatch 해도 state 변하지 않음 (community 가 그 케이스)

### 2.2 비표준 (도메인 사정)

| 도메인 | store 형태 | 비고 |
|---|---|---|
| authentication | `store/{api,endpoints,thunks,slices}.js` 평탄. public/admin 분리 없음 | OAuth + healthCheck 로 admin 개념 부재. 표준에서 예외 |
| home | store 없음 | 다른 도메인 hook(`useCouponList`, `useEventList`, `useNoticeList`) + `state.quiz.latest` 직접 selector |
| historyMode | store 없음 | mock-only. BE 연결 시 표준 store 추가 |
| community | `store/{api, endpoints, thunks/{boardThunks, postThunks, tagThunks, userThunks}, slices, dto, index}.js` (단일 평탄 + thunks 폴더 분할) | public/admin 평탄 + admin endpoints 만 운영. store.js 미등록 — 사실상 dead |

### 2.3 ACTIONS 키 네이밍

`endpoints.js` 의 `*_ACTIONS` 는 createAsyncThunk type identifier 로 redux devtools / listenerMiddleware 에서 식별. 도메인별 prefix + verb 통일 권장:

| 패턴 | 예 |
|---|---|
| `"VERB/path/action"` | `"GET/coupons/list"`, `"POST/admin/coupons"`, `"PATCH/admin/notices/visible"` |

> community 에서 `*_ACTIONS` 일부에 `"${id}"` literal 박힌 케이스(`"/community/admin/boards/${id}"`) 존재 — thunk 식별자로만 쓰여서 동작은 하지만 혼동 유발. IA 재개 시 정리

---

## 3. operation listener 패턴 (admin 응답 모달)

`web/src/app/store/operation/` — admin 사용자에게만 mutation 응답 모달 표시:

```
thunk fulfilled/rejected (payload.options 포함)
  → operationListener.middleware (state.auth.userRole === 'ADMIN' 게이트)
  → setLastOperation(options)
  → ResponseListener.jsx (AppProvider 안에 항상 마운트) 가 ResponseModal 렌더
  → onClose → clearLastOperation
```

**규칙**
- thunk 가 `{ ..., options: { success, message, kind, scope } }` 를 payload 에 포함하면 modal 자동 노출 — admin 만
- 일반 user 화면은 options 없이 thunk return → modal 없음
- listener gate 는 `state.auth.userRole === 'ADMIN'` (현재 admin UI 미연결로 trigger 0건)

---

## 4. SCSS module

### 4.1 파일 명명

| 패턴 | 위치 | 사용 |
|---|---|---|
| `{Component}.module.scss` | 컴포넌트 옆 | `import styles from './X.module.scss'` |
| `{Screen}.module.scss` | 도메인 mobile 폴더 | `import styles from './HistoryModeScreen.module.scss'` |
| 공유 module (도메인 내) | container 폴더 e.g. `CouponList.module.scss` | `CouponListVertical / CouponListHorizontal` 양쪽이 import |
| `{domain}.tokens.scss` | 도메인 mobile 폴더 | global tokens 위에 도메인 전용 CSS 변수 추가 (community / historyMode 사용) |

### 4.2 vite SCSS auto-inject

`vite.config.js`:

```js
additionalData: `@use "@/global/styles/index.scss" as *;`
```

→ 모든 `.module.scss` 에 prepend. `@/global/styles/index.scss` 는 **forward 만** (출력 0):

- `variables/{colors, font, spacing, radius, breakpoints, zindex}` (Sass 변수)
- `mixins/{flex, layout, media, table, background, typography}` (Sass mixin)

→ 도메인 .module.scss 에서 `@use` 없이 바로 `$space-4`, `@include flex-row` 등 사용 가능

### 4.3 색상 토큰 — 2-tier

```text
variables/_colors.scss   # raw $color-bg-900 ... $color-success-400 (Sass 변수, 직접 사용 금지)
       │
       ▼
semantic/_color.scss     # :root --color-bg-deepest, --color-text-primary ... (CSS custom property)
       │
       ▼
컴포넌트 .module.scss     # color: var(--color-text-primary)  ← 항상 CSS 변수만
```

- `global.scss` (main.jsx 진입) 에서 `@use "semantic/color"` 가 :root 출력 — 한 번만
- raw `$color-*` Sass 변수 직접 참조 금지. 새 색상 추가 시 raw → semantic → CSS var 3단계 모두 추가
- semantic role: `bg-deepest/deep/overlay/card/elevated`, `brand`/`brand-dark`/`brand-violet`/`brand-tint`, `text-primary/secondary/muted/code/placeholder`, `border`/`border-strong`, `success/danger/warning` (+ dim alpha)

### 4.4 spacing / radius / zindex 토큰

| 토큰 | 정의 | 용도 |
|---|---|---|
| `$space-1..$space-12` (4/8/12/16/20/24/32/40/48 px) | `_spacing.scss` | 일관 8pt grid. `$space-4` = 화면 수평 패딩 (H_PAD = 16px) |
| `$layout-h-pad` 16, `$layout-screen-width` 375, `$layout-card-width` 343, `$layout-topbar-height` 52 | `_spacing.scss` | mobile 레이아웃 상수 |
| `$radius-sm/md/lg/xl/2xl/full` (4/6/8/10/12/9999) | `_radius.scss` | 카드 = `$radius-xl` |
| `$z-base/above/dropdown/sticky/drawer/modal-bg/modal/sheet/toast` | `_zindex.scss` | 레이어 충돌 방지 — Drawer=300, Modal=410 |
| `$bp-mobile-sm/mobile/mobile-lg/tablet/desktop` (320/375/428/768/1024) | `_breakpoints.scss` | mobile-first |
| `$font-size-9..28`, `$font-weight-regular/medium/semibold/bold` | `_font.scss` | typography |

### 4.5 mixin

| mixin | 위치 | 용도 |
|---|---|---|
| `flex-row` / `flex-col` / `flex-center` / `flex-between` / `flex-end` | `mixins/_flex.scss` | flexbox 단축 |
| `page-layout` / `page-content` / `h-pad` / `scroll-row` / `grid-2col` / `overlay` | `mixins/_layout.scss` | 화면 레이아웃 |
| `from-mobile-lg` / `from-tablet` / `from-desktop` / `small-mobile` / `retina` | `mixins/_media.scss` | media query |
| `text-*` | `mixins/_typography.scss` | typography helper |
| `bg-*` | `mixins/_background.scss` | 배경 helper |
| `list-row` / `section-header` | `mixins/_table.scss` | 리스트/헤더 helper |

### 4.6 도메인 토큰 파일

`community.tokens.scss`, `historyMode.tokens.scss` — 도메인 전용 :root --xxx 추가. 도메인 Screen 이 import 해서 :root 에 출력 (한 번만).

```js
// HistoryModeScreen.jsx
import "./historyMode.tokens.scss";   // import side-effect (출력)
```

> 이 패턴은 글로벌 :root 에 도메인 변수 누적 — 도메인 라우트 진입 시점부터 글로벌 영향. 폴리시 ❓ 명시 가이드 미정 (현재는 충돌 키 부재)

---

## 5. 컴포넌트 분해 정책

### 5.1 원칙 (memory: feedback_component_decomposition)

- **단일 페이지 상태분기형 화면은 sub 컴포넌트 분리 최소화** — 4 상태(empty/results/selected/etc.) 로 한 화면 안에서 분기되는 도메인은 한 Screen.jsx 안에 inline JSX 로 유지 (HistoryModeScreen 케이스)
- **분리 기준 3가지**: (a) 반복 (리스트 item), (b) 변형 (showDetail / isExpired prop), (c) 외부 도메인 재사용 — 셋 중 하나라도 충족 시만 컴포넌트 분리
- 단순 "줄 길어진다" 는 분리 사유 안 됨 (코드 navigation 비용만 증가)

### 5.2 도메인 자체 헤더 금지 (memory: feedback_no_domain_header)

- 도메인 Screen 에 별도 `<header>` 만들지 않음. 글로벌 `MobileLayout` 의 TopBar 가 단일 헤더
- 도메인이 TopBar variant/title/rightAction 변경하려면 `useSetTopBar({ variant, title, rightAction, onBack })` 호출 (TopBarProvider context 갱신)
- 현재 호출처 1곳: `HomeScreen` (`useSetTopBar({ variant: "home" })`). 나머지 도메인은 default("home") 사용 — page variant 호출처 ❓ 0건

### 5.3 분리 위치

| 종류 | 위치 |
|---|---|
| 도메인 sub component | `domains/{name}/mobile/components/{kebab}/{Name}.jsx` |
| 도메인 데이터 컨테이너 (외부 재사용 가능) | `domains/{name}/mobile/containers/public/{Name}List{Layout}.jsx` |
| 도메인 hook | `domains/{name}/mobile/hooks/use{Name}.js` |
| 도메인 횡단 UI | `global/ui/{kebab}/` |
| 도메인 횡단 hook | (현재 없음) — 도메인 hook 이 다른 도메인에서 import 됨 (home → useCouponList / useEventList / useNoticeList) |

### 5.4 Screen 책임

- 라우트 element 로 lazy import 됨 (`PublicRoutes.jsx`: `lazy(() => import(...))`) — default export 필수
- 컴포넌트 자체는 **얇게** — hook 호출 + JSX 렌더만. 데이터 가공은 hook 안에서
- TopBar 변경 / scroll-to-top 보강 / portal 모달 제어 등 sideeffect 는 Screen 에서 useEffect

---

## 6. hook 컨벤션

- 명명: `use{Domain}{Action}.js` (`useCouponList`, `useNoticeDetail`, `useHistoryMode`, `useEventList`)
- 위치: `domains/{name}/mobile/hooks/`
- 책임: dispatch (`useDispatch` + `requestX`) + selector (`useSelector(state => state.X)`) + 가공 (filter/sort/group) + handler (callback)
- 리턴: 화면이 그대로 렌더할 수 있는 형태. `{ activeCoupon, expiredCoupon }`, `{ featuredNotice, listedNotices, listedOfficials }`, `{ inputValue, query, ..., handleX }`
- `useEffect(() => dispatch(requestX()), [dispatch])` 표준 마운트 fetch 패턴
- 도메인 외 도메인 hook 재사용 가능 (home 이 useCouponList / useEventList 사용) — store 가 단일 단위로 cache 역할

---

## 7. selector 컨벤션

- inline `useSelector(state => state.coupon.coupons)` 형태. 별도 selector 파일 없음
- nullish 가드: `useSelector(state => state.coupon.coupons) ?? []` (useCouponList 케이스)
- 도메인 선언 키: `auth`, `events`, `coupon`, `quiz`, `notices`, `upload`, `operation` (community 는 store.js 미등록)

---

## 8. axios / API 호출 룰

- 모든 axios 호출은 `@/infra/http/client.js` 의 `API` 인스턴스 사용 (raw `axios.create` 금지)
- domain api.js 만 호출 책임 (component / Screen 에서 직접 호출 금지)
- multipart 는 `infra/api/uploads/` 의 `requestUploadImage({ file, directory })` 일원화 (events / quiz 가 사용)
- 도메인 endpoints.js 의 path 상수만 axios 에 전달 (literal hardcode 금지)

---

## 9. analytics 호출 룰

- `pushEvent` 는 `@/infra/analytics/ga.js` 가 단일 진입점. `gtag` 직접 호출 금지
- 도메인 이벤트는 `infra/analytics/events/{domain}Events.js` 에 trackXxx 함수로 export. 컴포넌트에서 직접 import (`trackCouponGo`, `trackEventClick`, `trackLogin`, `trackLogout`)
- localhost (`window.location.hostname === "localhost" / 127.0.0.1`) 에서는 `console.log("[GA]", event)` + gtag 에 `[GA]` prefix 이벤트로 전송 (운영 분리)
- ❓ `setUserProperties` 가 GUEST 분기 1번 (AuthProvider catch) — userRole 미세팅 시 호출처. `useGA4PageView` 의 ADMIN 제외 분기는 README.md 에는 명시되나 `useGA4PageView.js` 코드에는 없음 — README ↔ 코드 mismatch

---

## 10. 신규 컴포넌트 추가 체크리스트

1. **위치**: 도메인 횡단이면 `global/ui/`, 단일 도메인이면 `domains/{name}/mobile/components/`. 다른 도메인 재사용 OK 면 `containers/public/`
2. **props**: 가공된 데이터 받기. axios 직접 호출 / dispatch 금지. 분기 prop 은 `showDetail`, `isExpired` 같은 boolean 명시적 이름
3. **SCSS module**: `{Name}.module.scss` 옆에 두기. `@use` 불필요 (auto-inject), `var(--color-*)` / `$space-*` / `@include flex-*` 자유 사용
4. **export**: default export 1개 (리스트 컴포넌트도 동일). `index.js` barrel 은 `global/ui/` 에서만 사용 (renewalNoticeModal, responseModal, visibleToggle)
5. **재사용 분리**: 동일 컴포넌트가 home / 도메인 페이지 둘 다 쓰이면 `containers/public/`. 도메인 외 import 0 면 `components/`
6. **컴포넌트 분리 회피**: 단일 화면 상태 분기는 inline 유지 (5.1 원칙)
7. **헤더 추가 금지**: 도메인 Screen 안에 `<header>` 만들지 말고 `useSetTopBar` 사용 (5.2 원칙)

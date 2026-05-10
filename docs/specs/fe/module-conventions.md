# FE 표준 모듈 구조

> 분석 시점: v2.0.0-refactor-mobile (2026-05-09 이후 정리 상태)
> 본 문서: 모바일 리뉴얼 후 정착된 도메인 / infra / global 모듈 컨벤션 명문화. 신규 도메인 작성 시 본 문서 cite.

---

## 1. 도메인 표준 (`web/src/domains/{domain}/`)

```text
domains/{domain}/
├── README.md                       # 도메인 가이드 (활성 도메인 권장)
├── mobile/                         # 모바일 화면 (Screen + sub component)
│   ├── {Domain}Screen.jsx          # 라우트 진입 (lazy)
│   ├── {Domain}Screen.module.scss
│   ├── {domain}.tokens.scss        # (옵션) 도메인 로컬 :root 토큰
│   ├── components/                 # 도메인 전용 sub component (외부 재사용 X)
│   │   └── {componentName}/
│   │       ├── {ComponentName}.jsx
│   │       └── {ComponentName}.module.scss
│   ├── containers/                 # (옵션) 리스트/composer 컨테이너
│   │   └── public/                 # public/admin 분기 시
│   │       └── {Domain}List{Horizontal\|Vertical}.jsx
│   └── hooks/                      # 도메인 hook (use* prefix)
│       └── use{Domain}List.js
├── feature/                        # (옵션) 별도 진입 화면 묶음
│   └── admin/                      # Admin TBD — 기획 대기
│       ├── components/
│       ├── hooks/
│       └── pages/
├── config/                         # 정책 const (MOCK_*.js, *_TYPES.js)
│   └── {DOMAIN_CONFIG}.js          # SCREAMING_SNAKE_CASE
└── store/                          # Redux store 모듈 (§ 1.1)
```

### 1.1 `store/` 표준 layout

#### Variant A — public/admin 분기 (권장 — 활성 패턴)

활성 도메인 (events, coupons, notices, quiz) 채택:

```text
domains/{domain}/store/
├── public/
│   ├── api.js                  # axios call (infra/http/client.js)
│   ├── endpoints.js            # path const + thunk type identifier
│   └── thunks.js               # createAsyncThunk (사용자 화면용 — payload.options 미반환)
├── admin/                      # Admin TBD — 기획 대기, 코드 보존
│   ├── api.js                  # axios call
│   ├── endpoints.js            # path const + thunk type identifier
│   └── thunks.js               # createAsyncThunk (admin 전용 — payload.options 반환)
├── dto.js                      # (옵션) 응답 ↔ state shape 변환
└── slices.js                   # createSlice + applyAsyncHandlers (public/admin 통합)
```

cite:
- `web/src/domains/events/store/{public,admin}/{api,endpoints,thunks}.js` + `dto.js` + `slices.js`
- `web/src/domains/quiz/store/{public,admin}/{api,endpoints,thunks}.js` + `dto.js` + `slices.js`
- `web/src/domains/coupons/store/{public,admin}/{api,endpoints,thunks}.js` + `slices.js`
- `web/src/domains/notices/store/{public,admin}/{api,endpoints,thunks}.js` + `slices.js`

#### Variant B — 단일 layout (admin 분기 없는 도메인)

authentication 처럼 admin 없는 도메인:

```text
domains/{domain}/store/
├── api.js
├── endpoints.js
├── thunks.js
└── slices.js
```

cite: `web/src/domains/authentication/store/{api,endpoints,thunks,slices}.js`

#### Variant C — thunks 분기 (community legacy)

community 가 board/post/tag/user 4개 thunk 그룹으로 분기:

```text
domains/community/store/
├── api.js
├── endpoints.js
├── dto.js
├── thunks/
│   ├── boardThunks.js
│   ├── postThunks.js
│   ├── tagThunks.js
│   ├── userThunks.js
│   └── index.js                # barrel
├── slices.js
└── index.js
```

> ⚠ community IA 재개 시 Variant A (public/admin) 로 마이그 권장. 현재 reducer 가 store 등록에서도 빠져있음 (`store.js:17-18` 주석).

#### Variant D — store 없음 (mock-only)

historyMode 처럼 BE 연동 없이 mock 만 사용:

```text
domains/historyMode/
├── config/                     # MOCK_*.js
├── mobile/                     # Screen + components + hooks (useState/useMemo 만)
└── (store/ 없음)
```

cite: `web/src/domains/historyMode/`

### 1.2 `payload.options` 컨벤션

- **admin thunk** 만 `return { ..., options }` 으로 BE 메타 (`{ success, message, kind, scope, ts }`) 반환
- **public (사용자 화면) thunk** 는 `options` 미반환 — operationListener 가 `state.auth.userRole === 'ADMIN'` 일 때만 toast 발화
- BE 가 사용자 thunk 응답에 메타를 추가해도 admin role 분기로 차단됨
- thunk 작성 시 의도 명시: admin 만 `const { id, ...options } = await fetch...()` 패턴 사용
- cite: `web/src/app/store/operation/operationListener.js`, `web/src/app/store/operation/ResponseListener.jsx`

---

## 2. infra 표준 (`web/src/infra/`)

### 2.1 `infra/api/{moduleName}/` (5 파일 표준)

도메인 횡단 외부 통신 API:

```text
infra/api/{moduleName}/
├── api.js                      # axios call
├── endpoints.js                # path const
├── thunks.js                   # createAsyncThunk
├── slices.js                   # createSlice + applyAsyncHandlers
├── types.js                    # (옵션) 타입/enum const
├── hooks/                      # (옵션) use* hook
└── index.js                    # barrel (필수)
```

cite: `web/src/infra/api/uploads/{api,endpoints,thunks,slices,index}.js`

> 도메인 store 의 layout 과 동일 — infra 와 도메인 사이의 차이는 **import 경계** (도메인 = 사용자/컨텐츠 단위, infra = 시스템 횡단). 폴더 구조는 동일.

### 2.2 `infra/http/`

```text
infra/http/
└── client.js                   # 단일 axios instance + interceptor + import.meta.env.VITE_API_BASE_URL 우선
```

cite: `web/src/infra/http/client.js`

### 2.3 `infra/analytics/`

GA4 wrapper + 이벤트 카탈로그:

```text
infra/analytics/
├── ga.js                       # gtag wrapper (pushEvent, setUserProperties)
├── events/
│   ├── authEvents.js           # trackLogin, trackLogout
│   ├── couponEvents.js         # trackCouponGo
│   └── eventEvents.js          # trackEventClick
└── hooks/
    └── useGA4PageView.js       # 라우트 변경 page_view
```

cite: `web/src/infra/analytics/`

---

## 3. 명명 컨벤션

| 대상 | 컨벤션 | 예 |
|---|---|---|
| 컴포넌트 파일 | PascalCase + `.jsx` | `HomeScreen.jsx`, `ResponseModal.jsx` |
| 컴포넌트 SCSS | PascalCase + `.module.scss` | `HomeScreen.module.scss` |
| 컴포넌트 폴더 | camelCase (단수) | `couponCard/`, `categoryChip/` |
| hook 파일 | camelCase + `use` prefix | `useEventList.js`, `useGA4PageView.js` |
| util 파일 | camelCase | `dateUtils.js`, `applyAsyncHandlers.js` |
| const 파일 | SCREAMING_SNAKE_CASE | `MENU_GROUPS.js`, `MOCK_HISTORY_LEGENDS.js`, `QUICK_MENUS.js` |
| barrel | `index.js` | (lowercase, 확장자 `.js`) |
| store slice 파일 | `slices.js` (복수) | (단일 도메인이라도 복수형 일관) |
| store thunk 파일 | `thunks.js` 또는 `{name}Thunks.js` | community variant C 만 분리 |
| Redux action type | slice prefix + `/` + verb | `auth/setUser`, `operation/setLastOperation` |
| BE endpoint const | `URL_*` 또는 `{DOMAIN_NOUN}` | `URL_GET_EVENT_LIST`, `EVENTS.GET_EVENTS` |
| 도메인 로컬 토큰 | `{domain}.tokens.scss` (camelCase) | `community.tokens.scss`, `historyMode.tokens.scss` |

---

## 4. barrel export 정책

### 4.1 사용 권장 위치

- `infra/api/{moduleName}/index.js` — **필수** (외부 import 단일 진입점)
- `domains/{domain}/store/index.js` — **권장** (하위 변형 흡수, 현재는 community 만 채택)
- `global/ui/{component}/index.js` — **필수** (responseModal, visibleToggle, renewalNoticeModal 패턴)
- `domains/{domain}/components/index.js` — **선택** (도메인 외부 재사용 0이면 생략 가능)

### 4.2 사용 금지 위치

- 도메인 내부 깊은 폴더 (`domains/{domain}/hooks/index.js`) — barrel 깊이만 늘림. import 경로 직접 cite 권장
- `app/`, `main/` 영역 — 진입점이라 barrel 불필요

### 4.3 barrel 형식

```js
// global/ui/responseModal/index.js
export { default as ResponseModal } from './ResponseModal.jsx';
```

> ⚠ named export + `default` 혼용 시 import 측 혼동 — barrel 작성 시 형식 통일

---

## 5. 도메인 vs infra vs global 경계

### 5.1 infra 에 두는 기준

다음 **2개 모두** 만족 시 `infra/` 영역:

1. **외부 시스템 통신** (외부 서비스, 브라우저 native, 외부 SDK)
2. **도메인 횡단 사용** (≥ 2 도메인 import — 또는 사용자 정책상 횡단 의도 명시)

예:
- `infra/api/uploads/` — S3 (외부) + events/quiz admin 횡단 → infra OK
- `infra/http/client.js` — axios + 모든 도메인 → infra OK
- `infra/analytics/` — GA4 (외부) + 모든 도메인 → infra OK

### 5.2 도메인에 두는 기준

다음 중 **하나라도** 해당 시 `domains/{domain}/` 영역:

1. 도메인 단일 사용 (다른 도메인 import 0건)
2. 도메인 의미 단위에 강하게 묶인 로직 (예: OAuth callback → authentication 도메인)
3. 도메인 화면/hook/store 와 동일 책임

예:
- `domains/authentication/callback/AuthCallBack.jsx` — OAuth callback (외부 통신이지만 authentication 도메인 의미)
- `domains/coupons/mobile/hooks/useCouponList.js` — coupons 단일 사용
- `domains/home/config/QUICK_MENUS.js` — home 단일 사용

### 5.3 global vs infra 경계

- `global/ui/`: **시각 컴포넌트** 도메인 횡단 (badge, mobile/section, responseModal, visibleToggle, renewalNoticeModal)
- `global/styles/`: **전역 SCSS** (variables, mixins, base, components, semantic)
- `global/utils/`: **pure 함수** 도메인 횡단 (datetime/dateUtils.js)
- `infra/`: **외부 통신 어댑터** (api, http, analytics)

> 차이: `global/` 은 **순수 / UI / 스타일** 횡단, `infra/` 는 **외부 통신 / 시스템 어댑터** 횡단

### 5.4 app vs global 경계

- `app/`: **앱 조립 / 라우팅 / 글로벌 store 조립** (router, store, provider, wrapper)
- `app/store/utils/`: Redux slice helper (`applyAsyncHandlers`) — `app/store/` 영역 (slice 와 같은 추상 레벨)
- `app/store/operation/`: 글로벌 operation slice + admin 전용 listener — store 의 일부

---

## 6. 변형 채택 시 절차

신규 도메인 작성 / 기존 도메인 변형 시:

1. **store/ 패턴 결정**: Variant A (public/admin) / B (단일) / C (thunks 분기) / D (store 없음) 중 선택
2. **infra 후보 검증**: § 5.1 두 기준 충족 시 `infra/` 신규 모듈 추가 검토
3. **명명 컨벤션 준수**: § 3 표 cite
4. **barrel 추가 여부**: § 4.1 / § 4.2 기준
5. **README.md**: 활성 도메인은 권장 — `web/src/domains/coupons/README.md`, `web/src/domains/events/README.md`, `web/src/domains/community/README.md` 패턴

---

## 7. Admin 영역 정책

> **Admin: TBD (기획 대기)**

- admin 화면 코드는 **`domains/{domain}/feature/admin/` 패턴**으로 재구현 예정 (현재 모두 비활성)
- admin store 코드 (api/endpoints/thunks) 는 **현재 보존** (`domains/{events,coupons,notices,quiz}/store/admin/`) — UI 재기획 후 재활성화 가능
- admin endpoint 정책: thunk 가 `payload.options` 반환 → operationListener 가 admin role 일 때만 toast trigger
- `feature/admin/pages/` 진입 컴포넌트는 lazy import 후 `app/router/routes/AdminRoutes.jsx` 에 등록
- 본 문서의 컨벤션은 admin 재구현 시점에도 동일 적용 (도메인 표준의 일부)

---

## 8. 관련 문서

- `docs/specs/fe/frontend-structure.md` — 폴더/파일 구조 + 신규 도메인 스캐폴드 가이드 (본 문서 상위)
- `docs/specs/fe/api-calls.md` — 도메인별 활성 endpoint 카탈로그
- `docs/specs/fe/dead-suspects.md` — dead 후보 audit

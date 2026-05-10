# Frontend 구조 가이드

> baseline: `web/src/**` (현 코드 실측, v2.0.0-refactor-mobile)
> 목적: 폴더 구조 / 진입 흐름 / 도메인 표준 트리 / mobile 라우트 7종 단일 파악
> 범위: 운영 도메인 (authentication, coupons, events, home, historyMode, notices, quiz) + community(보류) 만 cover. PC / admin UI / profile / playerCard / dictionary / simulate / kbo 폐기 — 라우터 lazy import 주석 처리, 도메인 폴더 부재 또는 무진입

---

## 1. 빌드 / 진입점

| 항목 | 값 | 출처 |
|---|---|---|
| 번들러 | Vite 7 | `web/vite.config.js` |
| React | 19 + react-router-dom 7 + @reduxjs/toolkit 2 | `web/package.json` |
| path alias | `@` → `web/src/` | `vite.config.js:resolve.alias` |
| SCSS auto-inject | `@use "@/global/styles/index.scss" as *;` 가 모든 `.module.scss` 에 prepend | `vite.config.js:css.preprocessorOptions` |
| 진입 | `web/src/main.jsx` → `<AppProvider><RouterProvider router={router}/></AppProvider>` | `main.jsx` |
| html shell | `web/index.html` (id="root", id="modal" portal target, GA4 inline script) | `index.html` |
| env 분기 | `import.meta.env.PROD` 만 사용. `.env` 파일 없음 | `web/src/config/env.js` |

> portal target `<div id="modal">` 가 index.html 에 존재. `RenewalNoticeModal`, `ResponseModal` 이 `createPortal` 로 사용

---

## 2. `web/src/` 최상위 트리

```text
web/src/
├── main.jsx                # 부트스트랩 (createRoot + AppProvider + RouterProvider)
├── app/                    # 앱 단일 인스턴스 (router / store / wrapper / provider)
├── domains/                # 도메인 단위 응집 (mobile + store)
├── global/                 # 횡단 UI / 스타일 토큰 / pure util
├── infra/                  # 외부 어댑터 (http client, GA4, file upload)
├── config/                 # 빌드타임 상수 (env.js)
├── data/                   # 정적 mock (community / skill — skill 은 dead)
└── assets/                 # 정적 이미지
```

**책임 경계**
- `app/` = 도메인 코드 0. 라우터 정의·store 조립·전역 wrapper·provider 만
- `domains/{name}/` = 화면 + hook + store 가 한 폴더에 응집. `domains/` 끼리 직접 import 가능 (단 store/api 는 동일 도메인 내부에서만)
- `global/` = 외부 통신 0. 토큰·UI·util
- `infra/` = 외부 SDK / 통신 어댑터. 도메인 ≥ 2개 횡단 시 진입
- `config/` = 빌드타임 const. runtime fetch 금지
- `data/` = BE 미연동 화면이 직접 import 하는 mock. BE 연결되면 store 로 이전 (community 만 활성 사용. skill 폴더는 dead)

---

## 3. `app/` 트리

```text
app/
├── provider/
│   ├── AppProvider.jsx      # Redux Provider + ResponseListener + AuthProvider
│   ├── AuthProvider.jsx     # 부트 시 requestUserHealthCheck dispatch → initialized 게이트
│   └── TopBarProvider.jsx   # context (config, isDrawerOpen) + useTopBar / useSetTopBar hook
├── router/
│   ├── index.jsx            # createBrowserRouter([{ path:"/", element:<AppWrapper/>, children:[Public, user, Admin] }])
│   ├── routes/
│   │   ├── PublicRoutes.jsx # 비인증 진입 라우트
│   │   ├── UserRoutes.jsx   # AuthGuard allow=["ADMIN","USER"] (현재 children 비어있음 — profile 폐기)
│   │   └── AdminRoutes.jsx  # AuthGuard allow="ADMIN" (모든 children lazy import 주석 — admin UI 미구현)
│   ├── guards/AuthGuard.jsx # initialized 대기 → user null 시 sessionStorage[redirectPath] 저장 후 / 로 리다이렉트
│   └── config/
│       ├── routePath.js     # ROUTE_PATHS 상수 (literal + 함수형 ex. notice_details(id))
│       └── routeMeta.js     # ROUTE_META { path, title } (title 은 string 또는 함수)
├── store/
│   ├── store.js             # configureStore — operation/auth/events/coupon/upload/quiz/notices reducer
│   ├── operation/
│   │   ├── slices.jsx       # operationSlice ({ lastOperation }) — setLastOperation / clearLastOperation
│   │   ├── operationListener.js # listenerMiddleware: ADMIN + payload.options 가 있는 fulfilled/rejected 만 lastOperation 으로 매핑
│   │   └── ResponseListener.jsx # lastOperation 존재 시 ResponseModal 렌더 (success/message)
│   └── utils/applyAsyncHandlers.js # (builder, thunk, onFulfilled) 표준 pending/fulfilled/rejected 핸들러
└── wrapper/
    ├── AppWrapper.jsx       # useGA4PageView() + <MobileLayout/> (PC 분기 코드 없음 — 모바일 only)
    └── mobile/
        ├── MobileLayout.jsx           # TopBarProvider + TopBar + Drawer + Suspense + Outlet + scroll-to-top
        ├── MobileLayout.module.scss
        ├── parts/
        │   ├── TopBar.jsx     # variant: "home" (logo+burger+login) / "page" (back+title+rightAction)
        │   └── Drawer.jsx     # MENU_GROUPS 렌더 + comingSoon 클릭 시 RenewalNoticeModal
        └── config/MENU_GROUPS.js  # Drawer 메뉴 정의 (메인/컨텐츠 그룹)
```

### 3.1 진입 흐름

```text
main.jsx
  └─ AppProvider                      [Provider(store) + ResponseListener + AuthProvider]
       └─ AuthProvider                [requestUserHealthCheck → initialized 후 children 렌더]
            └─ RouterProvider
                 └─ AppWrapper        [GA4 page_view + MobileLayout]
                      └─ MobileLayout
                           ├─ TopBarProvider
                           ├─ TopBar  (variant 분기)
                           ├─ Drawer  (MENU_GROUPS, comingSoon → RenewalNoticeModal)
                           └─ Suspense + Outlet  (도메인 Screen lazy 마운트)
```

- **scroll-to-top**: pathname/search 변경 시 `MobileLayout` 이 다중 setTimeout(0/100/300/600ms) + MutationObserver(자식 추가) 로 lazy Suspense 후 mount 시점 cover. 사용자 input(wheel/touchstart/keydown/pointerdown) 발생 시 즉시 cancel
- **TopBarProvider**: `useSetTopBar(config)` 훅으로 도메인 Screen 이 variant 지정. 현재 호출처 = `HomeScreen`(`variant:"home"`) 한 곳. 나머지 도메인은 default 그대로 사용 (variant 미지정 시 home 동작)
- **AuthGuard**: `state.auth.initialized` false 면 `null` 반환 → AuthProvider 가 이미 초기화 후 children 렌더하므로 가드 통과. user null 시 redirectPath 저장 + `/` redirect

### 3.2 라우트 정의 (`PublicRoutes.jsx`)

| ROUTE_META 키 | path | element | 비고 |
|---|---|---|---|
| HOME | `/` | `HomeScreen` | index. 컴프야펀 \| 홈 |
| AUTH_CALL_BACK | `/auth/callback` | `AuthCallback` | NAVER OAuth redirect 수신 → healthCheck → redirectPath 복귀 |
| COUPONS | `/coupons` | `CouponScreen` | |
| EVENTS | `/events` | `EventScreen` | |
| NOTICES | `/notices` | `NoticeScreen` | |
| NOTICE_DETAILS | `/notice/:id` | `NoticeDetailScreen` | title 동적 (notice.title) |
| HISTORY_MODE | `/mode/history` | `HistoryModeScreen` | mock 데이터 only (BE 미연동) |

> `userRoutes` = AuthGuard만 정의, children 0 (mypage 폐기). `AdminRoutes` = 모든 children lazy import 주석. `community: "/community"` 는 `routePath.js` 에 존재하나 `PublicRoutes` 진입 등록은 주석 (community IA 보류)

### 3.3 Drawer 메뉴 (`MENU_GROUPS.js`)

| 그룹 | label | to | comingSoon |
|---|---|---|---|
| 메인 | 홈 | `/` | - |
| 메인 | 이벤트 | `/events` | - |
| 메인 | 쿠폰 코드 | `/coupons` | - |
| 메인 | 공지사항 | `/notices` | - |
| 컨텐츠 | 스킬 시뮬레이터 | `/skill` | true (RenewalNoticeModal) |
| 컨텐츠 | 추천 백과사전 | `/encyclopedia` | true (RenewalNoticeModal) |
| 컨텐츠 | 히스토리 탐색기 | `/mode/history` | - |

> badge 숫자 (이벤트=5, 쿠폰=3) 는 정적 hardcode. unread count BE 미연동

---

## 4. `domains/` 트리 (도메인별 요약)

### 4.1 표준 트리 (★) — coupons / events / notices

```text
domains/{name}/
├── README.md                  # 도메인 가이드 (coupons 만 작성)
├── mobile/
│   ├── {Name}Screen.jsx        # 라우트 element (lazy 대상)
│   ├── components/{kebab}/     # 도메인 sub component (외부 재사용 X)
│   ├── containers/public/      # 데이터 fetch + 리스트 조립 (다른 도메인이 import 가능)
│   └── hooks/use{Name}.js      # dispatch + selector 캡슐화
└── store/
    ├── public/{api,endpoints,thunks}.js
    ├── admin/{api,endpoints,thunks}.js   # admin UI 미연결이어도 코드 보존
    └── slices.js
```

**현재 상태**

| 도메인 | mobile/ | store/ | 진입 | 비고 |
|---|---|---|---|---|
| coupons | ✅ Screen + 1 component(CouponCard) + 2 container(Hor/Vert) + 1 hook | ✅ public + admin + slices | `/coupons` | README 표준 |
| events | ✅ Screen + 1 component(EventCard) + 2 container(Hor/Vert) + 1 hook | ✅ public + admin + dto + slices | `/events` | dto.js (`baseEventDTO`) 추가 |
| notices | ✅ ListScreen + DetailScreen + 2 component(NoticeCard, OfficialNoticeCard) + 2 container(NoticeListVertical, OfficialNoticeListVertical) + 2 hook | ✅ public + admin + slices | `/notices`, `/notice/:id` | source 기준 (INTERNAL/OFFICIAL) 분리 |

### 4.2 비표준 (도메인별 사정)

| 도메인 | 트리 | 비고 |
|---|---|---|
| authentication | `callback/AuthCallBack.jsx` + `hooks/useAuthentication.js` + `store/{api,endpoints,thunks,slices}.js` (단일 store 평탄. public/admin 분리 없음) | NAVER OAuth + healthCheck. login/logout 만. mobile/ 없음 (Screen 0) |
| home | `components/HomeScreen.jsx` + `components/section/{hero,notice,quick,quiz}/` + `config/{QUICK_MENUS, MOCK_*}.js` | mobile/ 없음. components/ 직속. store 없음 (다른 도메인 hook 재사용) |
| historyMode | `mobile/HistoryModeScreen.jsx` + `components/{chip,stageCard}/` + `hooks/useHistoryMode.js` + `historyMode.tokens.scss` + `config/MOCK_HISTORY_*.js` | store 없음 (mock-only). BE 연결 시 store 추가 예정 |
| quiz | `store/{public,admin,slices,dto}.js` 만. mobile/ 없음 | QuizSection 은 home 도메인이 렌더. quiz 도메인 = 데이터 컨트랙트만 |
| community | `mobile/{CommunityScreen, CategoryScreen}.jsx` + components 6 + hooks 2 + `store/{api,endpoints,thunks/,slices,dto,index}.js` + `feature/{components/admin, hooks/{admin,user,internal}}` + `page/{admin,user}/` + `config/POST_TABLE.js` | 라우트 미등록. store 도 store.js 미등록. IA 재개 보류 — dead chain. 자세한 dead 분류는 `dead-suspects.md` |

> 도메인 README: coupons / events / community / authentication 만 존재. 나머지(home/historyMode/notices/quiz) 미작성 — ❓ 작성 미정

### 4.3 도메인 단일 진입 권장 패턴

도메인 Screen → `useXxx()` 훅 → `dispatch + useSelector` → `slices.coupons` / `state.events` / `state.notices` 등 → 가공 후 컨테이너에 prop 주입.
화면 컴포넌트는 axios 직접 호출 / store 직접 mutate 금지. 분리 책임은 `module-conventions.md` 참조.

---

## 5. `global/` 트리

```text
global/
├── styles/
│   ├── global.scss              # main.jsx 가 한 번만 import. semantic/color + base + typography 출력 진입
│   ├── index.scss               # vite additionalData 전용. variables(forward) + mixins(forward) — 출력 0
│   ├── variables/{breakpoints,colors,font,radius,semantic,spacing,zindex}.scss
│   ├── semantic/_color.scss     # :root --color-* CSS custom property 선언 (런타임 참조 단위)
│   ├── base/{base,typography}.scss
│   ├── mixins/{background,flex,layout,media,table,typography}.scss
│   └── components/composite/    # ❓ 비어있음
├── ui/
│   ├── badge/{LabelBadge, PinnedBadge, StatusBadge}.jsx       # 3종 + module.scss
│   ├── mobile/section/{SectionBlock, SectionHeader, Section.module.scss}
│   ├── renewalNoticeModal/RenewalNoticeModal.jsx + index.js   # comingSoon 안내 portal 모달
│   ├── responseModal/ResponseModal.jsx + index.js             # operation 결과 portal 모달
│   └── visibleToggle/VisibleToggle.jsx + index.js             # admin visible toggle (현재 호출처 0 — admin UI 폐기로)
└── utils/datetime/dateUtils.js   # formatNow (KST yyyy-MM-dd HH:mm) + isExpired
```

- **2-tier color**: raw `$color-*` (variables/_colors.scss) → semantic `--color-*` (semantic/_color.scss). 컴포넌트는 항상 CSS 변수만 사용. raw Sass 변수 직접 참조 금지
- **portal**: `RenewalNoticeModal` / `ResponseModal` 이 `document.getElementById("modal")` (index.html 에 정의) 에 createPortal
- **VisibleToggle**: 현재 사용처 0 — admin UI legacy 폐기로 dead chain 후보. dead-suspects 참조

---

## 6. `infra/` 트리

```text
infra/
├── http/
│   └── client.js                  # axios instance (baseURL=API_BASE_URL, withCredentials, request: X-Page-* headers, response: 401 → /api/auth/refresh 재시도)
├── analytics/
│   ├── ga.js                      # pushEvent / setUserProperties (localhost 분기: console.log + [GA] prefix)
│   ├── events/{authEvents, couponEvents, eventEvents}.js
│   ├── hooks/useGA4PageView.js    # useMatches handle.title → document.title + page_view
│   └── README.md
└── api/uploads/                   # multipart/form-data S3 업로드 (events/quiz 가 사용)
    ├── api.js
    ├── endpoints.js
    ├── index.js                   # barrel
    ├── thunks.js                  # requestUploadImage({ file, directory })
    └── slices.js                  # upload state (imageUrl)
```

- `http/client.js` 는 단일 axios 인스턴스. 401 발생 시 한 번만 `/api/auth/refresh` 호출 (refreshing promise share) → 성공 시 원 요청 재시도, 실패 시 `Promise.resolve({data:null})` 반환 (rejection 대신 빈 응답)
- `auth/refresh`, `auth/logout` 자체의 401 은 retry 안 함 (무한 루프 방지)

---

## 7. `config/` / `data/` / `assets/`

| 폴더 | 내용 | 사용처 |
|---|---|---|
| `config/env.js` | `API_BASE_URL` (PROD: api.compyafun.com / dev: localhost:8080), `COUPON_BASE_URL` ("http://withhive.me/399") | http/client.js, CouponCard |
| `data/community/{categories,notices,hotPosts,posts}.js` | community mock | CommunityScreen / CategoryScreen / useCommunity / useCategoryFeed (모두 라우트 미등록) |
| `data/skill/*` | skill 도메인(폐기) mock | import 0건 — dead |
| `assets/{NAVER_login_btn.png, new/compyafun2026.jpg}` | 정적 이미지 | ❓ 사용처 grep 추가 필요 (현재 코드 grep 미확인) |

---

## 8. 도메인 신규 추가 체크리스트

신규 도메인 (예: `tournaments`) 추가 시 7단계:

1. **폴더 생성**: `web/src/domains/tournaments/{mobile,store/{public,admin}}/` 구성. README.md 권장 (coupons 양식 참조)
2. **endpoints + api**: `store/public/{endpoints.js, api.js}` 작성. `endpoints.js` 는 path 상수 + ACTIONS 상수 (thunk type identifier) 두 set
3. **thunks**: `createAsyncThunk(ACTIONS.X, async ...)` 패턴. payload 가공 (filter/sort) 은 thunk 안에서. action type = `endpoints.ACTIONS.X` 사용
4. **slices**: `applyAsyncHandlers(builder, thunk, onFulfilled)` 표준 사용 (`@/app/store/utils/applyAsyncHandlers.js`)
5. **store 등록**: `web/src/app/store/store.js` 의 `reducer:` 에 추가
6. **route 등록**: `routePath.js` + `routeMeta.js` 에 추가 → `PublicRoutes.jsx` (또는 UserRoutes/AdminRoutes) 에 lazy import + 라우트 정의. handle 에 `ROUTE_META.X.title` 지정 (page_view / document.title 동작)
7. **Screen + hook + container**: `mobile/{Name}Screen.jsx` (라우트 element) + `mobile/hooks/use{Name}.js` (dispatch + selector) + `mobile/containers/public/{Name}List*.jsx` (홈에서 재사용 가능). 컴포넌트는 `mobile/components/{kebab}/`

> dto: BE post/patch payload 가공 필요 시 `store/dto.js` 추가 (events / quiz / community 가 양식)

---

## 9. 주요 기존 spec ↔ 코드 차이 (mismatch)

- `docs/specs/fe/frontend-structure.md` (이전 버전, 2026-05-10) — community 트리 / dead 후보 분류 / 구조 표준 모두 일치. 본 신규 spec 은 같은 baseline 으로 재정리
- `domains/authentication/store/slices.js` 의 `setUser` 는 `payload.useRole` 로 잘못된 키를 읽음 (typo — `userRole` 가 정답). 결과적으로 `state.userRole` 이 항상 undefined 가 됨. ❓ 작동 영향: AuthGuard 의 `userRole` 체크가 ADMIN 라우트에서 차단 — admin UI 폐기 상태라 운영 영향 없음. dead-suspects 후속 처리 권고
- `useAuthentication.js` 의 `useSelector(state => state.auth)` 에서 `authority` 를 destructure 하나 slice 에는 `authority` 필드 없음 (`userRole` 만 존재) — return 값에서 `authority` 가 항상 undefined. 호출처 사용 0. dead 필드

---
paths:
  - "web/src/**"
---
# FE 컨벤션 (구조 · 화면 · 라우트 · 네이밍)

> 기준 2026-09-28. 대상 `web/src/**` (React 19 + Redux Toolkit 2 + Vite 7, JS/JSX). 상태관리·통신은 `fe-store.md`, 디자인 값은 `fe-design.md`.

## 1. 빌드 환경

| 항목 | 규칙 |
|---|---|
| import | `@/...` 절대경로만. `../../` 금지. 같은 폴더 `./X` 만 상대 |
| SCSS | `@/global/styles/index.scss` 가 모든 `*.module.scss` 에 자동 주입 → `@use` 불필요. **단 `mixins/*.scss` 는 직접 `@use`** |
| 진입 | `main.jsx` → `<AppProvider><RouterProvider/></AppProvider>`. Provider 는 `app/provider/AppProvider.jsx` (Redux+Auth+TopBar) |
| 레이아웃 | `app/wrapper/mobile/MobileLayout.jsx` 하나. PC 분기 없음 |
| 확장자 | `.js` `.jsx` 만. TypeScript 아님 (`.ts` `.tsx` 파일명 금지) |

## 2. 최상위 폴더

| 폴더 | 역할 |
|---|---|
| `app/` | 라우터·스토어 조립·전역 레이아웃. 도메인 코드 금지 |
| `domains/{도메인}/` | 화면 + 훅 + 스토어 한 묶음 |
| `global/` | 여러 도메인 공용 UI·스타일 토큰·순수 유틸. 외부 통신 없음 |
| `infra/` | 외부 연결(axios, 로그, 업로드, 광고, SEO). 두 도메인 이상 쓸 때만 |
| `data/` · `assets/` | 서버 연동 전 정적 데이터 · 이미지 |

도메인 목록은 `bash .claude/scripts/domain-map.sh` (폴더가 원천). 정적 도메인(store 없음)도 같은 트리를 따른다.
❓ D2 — `historyMode` 는 옛 이름. versioning·CLAUDE.md § 10 의 목록도 `historyLegend` 로 맞춘다.

## 3. 도메인 표준 트리

```
domains/{도메인}/
├── README.md                      (권장)
├── mobile/
│   ├── {도메인}Screen.jsx + .module.scss   라우트 진입
│   ├── components/{부품명}/{부품명}.jsx + .module.scss   이 도메인 전용
│   ├── containers/public/{도메인}List{가로|세로}형.jsx    다른 도메인이 가져다 씀(홈)
│   └── hooks/use{도메인}List.js            요청 + 상태 읽기
├── config/{도메인}.js               (선택) 컬럼 정의·정적 설정. 7개 도메인 사용
└── store/                          fe-store.md
```

- 새 코드는 반드시 `mobile/` 아래. `page/` `feature/` 옛 폴더 신설 금지. 예외(기존): `home` 은 `components/`, `authentication` 은 `callback/` — 새 도메인은 따라가지 않는다
- **관리자 화면**(`mobile/admin/Admin*Screen.jsx`)은 hooks 없이 `useSelector`/`useDispatch` 직접 사용이 관례(8곳 중 7). 공개 화면은 반드시 hooks 경유
- 부품 분리는 셋 중 하나일 때만: (1) 같은 모양 반복 (2) 겉모습이 상황별로 다름 (3) 다른 도메인 재사용. 상태 분기만 있는 단일 화면은 쪼개지 않는다

## 4. 컴포넌트 위치 · 규칙

| 상황 | 위치 |
|---|---|
| 이 도메인만 | `domains/{d}/mobile/components/` |
| 다른 도메인도 (홈) | `domains/{d}/mobile/containers/public/` |
| 여러 도메인 공통 | `global/ui/{부품명}/` |

- props 로 가공된 데이터만. 컴포넌트 안 axios·dispatch 직접 호출 금지
- 옆에 `{Name}.module.scss`, 토큰만 (하드코딩 금지 — `fe-design.md`)
- default export 1개
- 다른 도메인의 `mobile/components/**` 직접 import 금지 → `containers/` 또는 `global/ui/` 로 옮긴다. 다른 도메인 **store 를 `useSelector` 로 직접 읽지 않는다** — 그 도메인 훅(`useAuthentication()`)을 쓴다
- 로딩·오류·빈 상태는 `global/ui/mobile/stateBox/StateBox` 하나 (`AdminStateBox` 는 2026-09-28 삭제). 화면 전용 표현(players 스켈레톤 격자)만 자체 마크업
- 관리자 페이지네이션은 `global/ui/admin/pagination/AdminPagination` (7페이지 초과 시 창 렌더)
- 공용 뱃지 3종은 `fe-badges.md`, 광고 슬롯은 `fe-ads.md`

## 5. 화면 레이아웃 · TopBar

- 전역 레이아웃 = 상단바 + 서랍 + 본문. 도메인 화면은 본문 자리에만. 자체 `<header>` 금지
- 상단바 3형: 기본(로고+메뉴+로그인) · 뒤로가기(제목) · 메뉴버튼(제목)
- 상단바 변경은 **`useDomainTopBar` / `useAdminTopBar`** (`@/app/wrapper/mobile/hooks/`)

  ```js
  useDomainTopBar("쿠폰");
  useDomainTopBar({ title: "쿠폰", rightAction: <아이콘/> });
  useAdminTopBar("쿠폰 관리");   // 뒤로가기 → /admin
  ```

- `TopBarProvider` 의 `useSetTopBar`·`useTopBar().setConfig` 직접 호출 금지 — 화면을 벗어날 때 기본형으로 안 돌아온다. 위 두 훅이 그 결함을 덮은 것
  ❓ D1 — `responsive-mobile-first.md` 는 `useSetTopBar({ variant: "page" })`, `odds/useOddsTopBar` 는 `useTopBar().setConfig` 를 쓴다(3갈래). 이 문서를 우선 채택, odds 는 정리 대상
- **로그인·로그아웃은 상단바 소유.** `rightAction` 에 넣으면 두 개가 나란히 보인다(실제 사고). `rightAction` 은 그 화면 고유 동작만

## 6. 라우트 등록

1. `app/router/config/routePath.js` · `routeMeta.js` 에 경로/제목
2. `PublicRoutes.jsx` 등에 `lazy(() => import(...))`. 변수명 `{도메인}Page`
3. `handle: ROUTE_META.{키}.title`
4. 로그인 보호 → `app/router/guards/AuthGuard.jsx`
5. (선택) 서랍 노출 → `MENU_GROUPS.js`

```jsx
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));
{ path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title }
```

## 7. 네이밍

| 대상 | 규칙 | 예 |
|---|---|---|
| 화면·컴포넌트 파일 | PascalCase `.jsx` | `CouponCard.jsx` |
| 컴포넌트 폴더 | camelCase | `couponCard/` |
| SCSS 모듈 | 컴포넌트명 + `.module.scss` | `CouponCard.module.scss` |
| 도메인 전용 토큰 | `{도메인}.tokens.scss` | `historyLegend.tokens.scss` |
| 훅 / 상수 | `use{Name}.js` / `UPPER_SNAKE.js` | `useCouponList.js` · `MENU_GROUPS.js` |
| 슬라이스 / barrel | `slices.js` / `index.js` | |

## 8. 신규 도메인 체크리스트

1. `domains/{d}/` 를 § 3 대로 (`store/admin/` 은 관리자 화면 없어도 미리)
2. `app/store/store.js` 등록 (빼먹으면 dispatch 해도 조용히 안 바뀜)
3. `routePath.js` + `routeMeta.js` → lazy import + 라우트 항목
4. (선택) 서랍 메뉴 · 로그 이벤트 `infra/analytics/events/{d}Events.js`

## 9. 금지

- `page/` `feature/` 폴더 · `mobile/components/` 밖 부품 · 도메인 자체 `<header>`
- 컴포넌트·훅에서 정렬/필터 재가공 (thunk 에서 끝낸다 — `fe-store.md`)
- "오늘 날짜"를 `new Date().toISOString().slice(0,10)` 로 — UTC 라 KST 자정~09시에 하루 전이 나온다(실제 사고). `@/global/utils/datetime/dateUtils` 의 `formatNow()` 만
- 타 도메인 `mobile/components/**` import · 스토어 등록 누락 · `useSetTopBar` 직접 호출

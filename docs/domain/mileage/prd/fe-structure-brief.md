# 마일리지 저격 경로 — FE 구조 실측 브리프

> 기준일: 2026-09-05 (read-only 조사, 코드 미수정)
> 참조: `docs/convention/frontend.md`, `docs/convention/design.md`
> 표준 참조 도메인: `historyLegend` (2026-09-02 신설, 가장 최근 도메인. 서버 조회 + 순수 로컬 계산이 섞인 화면이라 마일리지 도구와 성격이 가장 가깝다)

---

## § 1. 도메인 디렉터리 표준형 (historyLegend 실측)

| 역할 | 실제 경로 | 비고 |
|---|---|---|
| 화면 진입점 | `domains/historyLegend/mobile/HistoryLegendScreen.jsx` | 라우트로 연결 |
| 화면 스타일 | `domains/historyLegend/mobile/HistoryLegendScreen.module.scss` | |
| 도메인 로컬 토큰 | `domains/historyLegend/mobile/historyLegend.tokens.scss` | `:root` 에 `--hl-*`, `--color-hl-*` 변수. Screen.jsx가 side-effect import(1회 주입) |
| 데이터 훅 | `domains/historyLegend/mobile/hooks/useHistoryLegend.js` | dispatch + selector + 파생 계산을 한 곳에 모음 |
| 순수 로직·상수 | `domains/historyLegend/config/historyLegend.js` | 229줄, VIEW/정렬/필터 등 화면 계산 함수 전부 여기 |
| store (서버 연동 있음) | `domains/historyLegend/store/{public/api.js,endpoints.js,thunks.js},slices.js` | 표준 4.1 구조 그대로 |
| 하위 부품 | (없음) | 상태 분기만 있는 단일 화면이라 컴포넌트 분리 안 함 (컨벤션 §3 원칙 그대로 적용된 사례) |

**신규 도메인 `mileage` 배치안** (서버 통신 없는 순수 계산 도구 — § 3 참조):

- `domains/mileage/mobile/MileageScreen.jsx`
- `domains/mileage/mobile/MileageScreen.module.scss`
- `domains/mileage/mobile/mileage.tokens.scss` (도메인 전용 색/치수 필요 시만)
- `domains/mileage/mobile/hooks/useMileage.js` (로컬 state + 계산 훅)
- `domains/mileage/config/mileage.js` (경로 탐색·점수 계산 등 순수 함수 + 상수)
- `domains/mileage/mobile/components/{부품명}/` (반복/재사용 조건 충족 시만, §3 3원칙 그대로 적용)
- store 폴더 없음 (§3 권고)

---

## § 2. 라우팅 연결 지점

- 경로 상수: `web/src/app/router/config/routePath.js` (예: `legend_stats: "/legend-stats"`)
- 페이지 메타(타이틀): `web/src/app/router/config/routeMeta.js` (예: `LEGEND_STATS: {path: ROUTE_PATHS.legend_stats, title: "..."}`)
- 라우트 등록 + lazy: `web/src/app/router/routes/PublicRoutes.jsx`
  ```jsx
  const HistoryLegendPage = lazy(() => import("@/domains/historyLegend/mobile/HistoryLegendScreen.jsx"));
  { path: ROUTE_META.HISTORY_LEGEND.path, element: <HistoryLegendPage />, handle: ROUTE_META.HISTORY_LEGEND },
  ```
- 신규 라우트 추가 시 **수정 파일**: `routePath.js`, `routeMeta.js`, `PublicRoutes.jsx` 3곳 — 모두 admin 라우트(`AdminRoutes.jsx`)와는 별개 파일이지만, **routePath.js / routeMeta.js 는 admin 경로 상수도 같은 파일에 함께 있어 공유 파일**(§7 참조)
- 메뉴 노출: `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` — 직전 커밋(메뉴 정리)에서 "레전드 재료"/"히스토리 재료" 항목이 `tag:{variant:'new'}`로 추가돼 있고, 아직 라우트 없는 "스킬 시뮬레이터"는 `comingSoon:true`로만 등록된 선례 있음. 같은 방식으로 "마일리지 저격 경로" 항목 추가 가능

---

## § 3. 상태 관리 관례 — Redux 여부 판단

- store 루트: `web/src/app/store/store.js` — 모든 도메인 reducer를 여기 한 줄씩 등록해야 동작(빠뜨리면 dispatch해도 상태 안 바뀌는 조용한 버그, 컨벤션 §11 경고)
- 컨벤션 문서(§4.3)에 명시된 "스토어 없음" 예외: `home`(다른 도메인 훅 재사용), `historyMode`(서버 연동 전 정적 데이터만 — 단, historyMode는 이미 폐기되어 코드에 없음)
- **권고: mileage는 Redux slice를 만들지 않는다.** 서버 통신이 전혀 없는 순수 로컬 계산 도구는 기존 "스토어 없음" 예외 사유(정적 데이터/재사용 없음)에 정확히 부합. `mobile/hooks/useMileage.js` 안에서 `useState`/`useMemo`로 입력값·계산 결과를 관리하고, 계산 로직 자체는 `config/mileage.js`의 순수 함수로 분리 — historyLegend가 이미 이 패턴(계산 로직은 config, 상태는 훅)을 쓰고 있어 그대로 따르면 됨

---

## § 4. 스타일 관례

- scss 모듈: 컴포넌트명과 동일 파일명 + `.module.scss` (예: `HistoryLegendScreen.module.scss`)
- 전역 토큰 정의 위치: `global/styles/variables/{_colors,_font,_radius,_semantic,_spacing,_zindex}.scss`, 의미별 이름 매핑은 `global/styles/semantic/_color.scss`. `global/styles/index.scss`가 모든 `*.module.scss`에 자동 프리로드되어 별도 `@use` 불필요
- 도메인 로컬 토큰 관례 있음 — `{도메인명}.tokens.scss` 파일에 `:root` 변수로 정의, Screen.jsx 최상단에서 side-effect import. historyLegend 사례: 공용 토큰으로 대체 불가한 값(행 높이, 홀짝 배경색 등)만 `--hl-*`/`--color-hl-*` 이름으로 최소한만 추가
- breakpoint 실측값(`global/styles/variables/_breakpoints.scss`): `$bp-mobile-sm:320px`, `$bp-mobile:375px`, `$bp-mobile-lg:428px`, `$bp-tablet:768px`, `$bp-desktop:1024px` — 모바일 우선(375px 기준), mixin은 `mixins/_media.scss`

---

## § 5. 화면 공통 껍데기

- 전역 레이아웃: `app/wrapper/mobile/MobileLayout.jsx` (상단바 + 서랍 메뉴 + 본문)
- 제목 지정: 문서(§5)는 `useSetTopBar`를 언급하지만, **실제 코드에서 도메인 화면 전량이 쓰는 것은 `useDomainTopBar`**(`app/wrapper/mobile/hooks/useDomainTopBar.js`) — `useSetTopBar`의 unmount cleanup 미복원 결함을 보완한 래퍼. 문서와 실코드 사이 표기 차이 존재(§8 참조)
- 사용법 그대로 인용:
  ```js
  useDomainTopBar("히스토리 재료");
  ```
- mileage 화면도 자체 `<header>` 없이 `useDomainTopBar("마일리지 저격 경로")` 형태로 제목만 넘기면 됨

---

## § 6. 정적 데이터 두는 곳

- `web/src/data/{도메인}/` 하위에 큰 JSON + `index.js` barrel. `data/odds/` 사례: `cpb2015_1_3.json`(약 174KB) + `index.js`에서 import 후 배열/헬퍼로 재수출
- `data/odds/index.js` 최상단 주석: 스크립트(`scripts/parse-odds.mjs`) 자동 생성 파일이라 수동 편집 금지 — mileage 데이터가 스크립트 생성물이면 동일 패턴 검토
- import는 정적 `import x from "./file.json"` 방식(Vite가 번들에 포함), 별도 동적 code-splitting 처리는 안 보임 — 화면 자체는 라우트 lazy(§2)로 이미 분리되므로 JSON은 해당 청크에 자연히 포함됨
- mileage가 진행 경로/보상표 같은 정적 데이터를 쓴다면 `data/mileage/` 신설 검토(§4 유형 산출물 위치 규칙과 일치)

---

## § 7. admin 세션 충돌 위험 목록

| 경로 | 왜 필요한가 | 위험도 | 회피 방법 |
|---|---|---|---|
| `web/src/app/store/store.js` | 신규 도메인 reducer 등록(단, mileage는 §3 권고대로 store 없음이면 **아예 손댈 필요 없음**) | 중 (mileage에 store 안 만들면 회피 가능) | Redux 없이 가면 이 파일 자체를 안 건드림 |
| `web/src/app/router/config/routePath.js` | 신규 경로 상수 추가 | 중 (admin 경로 상수도 같은 파일 하단에 있음) | 파일 끝에 새 줄만 추가, 기존 admin 라인 근처 손대지 않기 |
| `web/src/app/router/config/routeMeta.js` | 신규 타이틀 메타 추가 | 중 (admin 메타도 같은 파일) | 위와 동일 — 추가만, 기존 항목 미변경 |
| `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` | 메뉴 항목 추가 | 상 (같은 파일에 `MENU_GROUPS`/`ADMIN_MENU_GROUPS` 공존, 직전 커밋이 이 파일의 "메뉴 정리"였음 — admin 세션이 메뉴 관련 작업 중일 가능성) | `MENU_GROUPS` "컨텐츠" 그룹에 항목 1줄만 추가, 다른 그룹/항목 순서 미변경 |
| `web/src/app/router/routes/PublicRoutes.jsx` | lazy import + 라우트 1줄 추가 | 하 (admin은 `AdminRoutes.jsx` 별도 파일 사용) | 파일 끝 근처에 추가만 |

회피 불가 항목 없음 — mileage가 Redux store를 만들지 않기로 하면 `store.js` 충돌은 원천 차단되고, 나머지는 전부 "끝에 한 줄 추가"라 병합 충돌 가능성은 낮음(단, `MENU_GROUPS.js`는 실제 작업 시점에 admin 세션의 diff를 먼저 확인 권장).

---

## § 8. 자체 평가

- `useSetTopBar` vs `useDomainTopBar`: 컨벤션 문서(§5)는 `useSetTopBar`만 언급하지만 실제 도메인 화면은 전부 `useDomainTopBar`를 사용 — 문서가 최신 래퍼 등장 전 기술을 그대로 남긴 것으로 추정. 실제 신규 코드는 `useDomainTopBar` 기준으로 작성해야 함
- `data/` 하위 대용량 JSON의 code-splitting 여부는 `data/odds` 사례 1건만 확인 — vite 설정(`vite.config`)의 chunk 분리 규칙까지는 미확인(범위 밖 판단, 필요시 별도 조사 필요)
- mileage 화면이 "경로 탐색"처럼 계산량이 큰 로직을 포함할 경우 `config/mileage.js` 파일이 historyLegend(229줄)보다 커질 가능성 — 컨벤션에 파일 분할 상한 규정은 없어 판단 기준 없음
- admin 세션이 지금 `MENU_GROUPS.js`/`routePath.js`/`routeMeta.js`를 실제로 건드리고 있는지는 (admin 파일 접근 금지 제약상) 직접 확인 못함 — 표는 "같은 파일을 공유한다"는 구조적 사실까지만 근거로 삼았음

# 어드민 UI 재구성 설계

> 조사 전용 — 코드 수정 없음. 커뮤니티 어드민 코드는 참고만, 재사용 대상 아님.
> 기준일 2026-09-04.

## 지금 무엇이 문제인가

**모달이 화면 전체 폭으로 뜨는 원인**

- 어드민 라우트는 전용 레이아웃이 없다. `AdminRoutes.jsx` → `AuthGuard`(권한 체크만) → `AppWrapper.jsx` → `MobileLayout.jsx` 순으로, 홈·이벤트 같은 일반 화면과 완전히 같은 레이아웃을 탄다.
- `MobileLayout`은 `page-layout` mixin(`web/src/global/styles/mixins/_layout.scss`)을 쓰는 `.appWrapper`로 감싸는데, 이 mixin이 `max-width: $layout-wrapper-max`(480px, `_spacing.scss:22`) + `margin-inline: auto` + `position: relative`로 앱 컬럼을 화면 가운데 480px 폭에 고정한다.
- 그런데 쿠폰/이벤트/공지/유저관리 4개 어드민 화면 모두 등록·수정 폼을 `.overlay { position: fixed; inset: 0; }`로 직접 구현한다 (`AdminCouponScreen.module.scss:188-195`, `AdminEventScreen.module.scss:224-227`, `AdminNoticeScreen.module.scss:175-178`, `AdminUserScreen.module.scss:93-96` — 4곳 동일 코드 중복).
- `position: relative`는 `position: fixed` 자손의 CSS containing block을 바꾸지 못한다(`transform`/`filter`/`contain` 등이 있어야 바뀐다). 그래서 이 오버레이는 480px 프레임을 무시하고 **브라우저 뷰포트 전체**를 덮는다. PC처럼 창이 넓을수록 증상이 커진다.
- 정작 전역에 `modal-backdrop` mixin(`_layout.scss` — `position:fixed; inset:0` + 가운데 정렬, `ResponseModal` 등이 사용)이 이미 있는데 4개 화면 다 이걸 안 쓰고 각자 손으로 재작성했다.

**그 밖의 구조적 문제**

- 4개 화면(222~321줄 JSX, 252~360줄 SCSS, 총 ~1650줄)이 검색창·필터칩·등록버튼·bottom sheet 폼·상태 3분기(로딩/에러/빈 목록)를 구조적으로 90% 동일하게 각자 새로 짰다. 공용 컴포넌트가 하나도 없다.
- 목록이 카드 리스트다. 사용자가 원하는 레전드/히스토리 재료 화면(표 + sticky 헤더 + 칩 필터)과 톤이 다르다.
- `/admin` 뒤로가기 전용 훅 `useAdminTopBar`(`web/src/app/wrapper/mobile/hooks/useAdminTopBar.js` — back 시 `/admin`으로, unmount 시 TopBar 복원)가 이미 만들어져 있는데 4개 화면 전부 안 쓰고 `useSetTopBar` + `navigate(-1)`을 직접 쓴다. unmount 복원이 없어 TopBar 설정이 다음 화면으로 새어나갈 수 있는 잠재 버그다.
- 진입점 `AdminDashboardScreen.jsx`는 `AdminRoutes.jsx`에 `/admin` 라우트 자체가 등록돼 있지 않고 Drawer 메뉴에도 안 걸린 고아 화면이다(기존 조사 `docs/domain/admin/prd/admin-code-inventory.md` §3 확인). 이모지 카드 그리드로 PC 지향이 아니다.
- 커뮤니티 어드민(`community/feature/components/admin/**`)은 표+등록/수정 모달을 분리한 구조 자체는 참고할 만하지만, 그 분리를 가능하게 하는 `@/global/hooks/useTableModal.js`가 실제로는 **존재하지 않는 파일**이라(`admin-code-inventory.md` §6-3) 지금 상태로는 렌더 자체가 깨진다. 구조만 참고하고 코드는 그대로 가져오면 안 된다.

## 레퍼런스에서 가져올 것

레전드 재료(`LegendStatsScreen`)·히스토리 재료(`HistoryLegendScreen`)에서 이어받을 규칙:

| 요소 | 규칙 |
|---|---|
| 표 | `<table>` + `thead th`를 sticky(top:0)로, 열 정의를 `{key,label,cls,sticky,sortable}` 배열(`legendStats.js`의 `columns()`)로 뽑아 폭·정렬·고정 여부를 선언적으로 관리 |
| 정렬 | 헤더 클릭 → 토글(같은 키면 방향 반전) → 화살표(▲▼) 표시. 정렬 가능 열만 `cursor:pointer` |
| 검색 | `type="search"` input, placeholder, 커스텀 clear(×) 버튼. 브라우저 기본 clear 버튼은 `appearance:none`으로 죽여 중복 방지 |
| 필터 | 가로 스크롤 chip row, `aria-pressed`로 활성 표시. 히스토리 화면은 라벨을 40px 고정폭(`chipLabel`)으로 둬서 여러 줄 필터의 시작 위치를 맞춤 |
| 배지/도움말 | `?` 아이콘 + 라벨(`badgeHelp`) 버튼 → 클릭 시 `role="dialog" aria-modal="true"` 중앙 카드 오버레이. Esc 키로도 닫힘 |
| 빈 상태 | `!loaded && loading` → "불러오는 중…", `error` → 에러 텍스트, `loaded && rows.length===0` → "조건에 맞는 게 없습니다. 필터를 하나 풀어보세요" 3단 분기. 텍스트만 있는 최소 컴포넌트 |
| 행 상세 | 행 클릭 시 바로 아래 `<tr>`로 펼쳐지는 상세(테이블 안에 인라인) — 별도 모달 없이 확장 |
| 토큰 | 전부 전역 `var(--color-*)` 사용, 대체 불가한 값만 도메인 접두(`--color-ls-*`, `--color-hl-*`)로 별도 `*.tokens.scss` 파일에 분리 |

## 공통 컴포넌트 설계안

| 이름 | 역할 | props 개요 | 위치 |
|---|---|---|---|
| `AdminTable` | 컬럼 config 기반 sticky-header 표. 정렬 토글, 행 클릭 확장 지원 | `columns`, `rows`, `sortKey`, `sortDir`, `onSort`, `onRowClick`, `renderCell` | `web/src/global/ui/admin/table/AdminTable.jsx` |
| `AdminToolbar` | 검색 input + 필터 chip row + "+ 등록" 버튼 한 줄 | `search`, `onSearchChange`, `filters:[{label,options,value,onChange}]`, `onCreate`, `createLabel` | `web/src/global/ui/admin/toolbar/AdminToolbar.jsx` |
| `AdminModal` | **main 콘텐츠 컬럼 안에서만** 뜨는 등록/수정 모달 (뷰포트 전체 덮지 않음 — 아래 레이아웃안 참고) | `open`, `title`, `onClose`, `children`, `footer` | `web/src/global/ui/admin/modal/AdminModal.jsx` |
| `AdminStateBox` | 로딩/에러/빈 상태 3분기 텍스트 박스 | `status: 'loading'\|'error'\|'empty'`, `message`, `onRetry` | `web/src/global/ui/admin/stateBox/AdminStateBox.jsx` |
| `AdminConfirmDialog` | 삭제·탈퇴 등 위험 액션 확인(동의 체크박스 옵션) | `message`, `dangerous`, `requireAgree`, `onConfirm`, `onCancel` | `web/src/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx` |
| `useTableModal` | 등록/수정 모달 open state 관리 훅. 커뮤니티가 참조하지만 실제 파일이 없으므로 **신규 작성** 필요 | `{ createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit }` | `web/src/global/hooks/useTableModal.js` |

## 레이아웃 구조안

- **admin 전용 레이아웃 신설**: `AppWrapper`가 현재 무조건 `MobileLayout`을 쓰는데, 경로가 `/admin`으로 시작하면 새 `AdminLayout`(`web/src/app/wrapper/admin/AdminLayout.jsx`)을 쓰도록 분기하거나, `AdminRoutes.jsx`의 부모 element를 `AdminLayout`으로 교체한다.
- **PC 우선 폭**: `AdminLayout`은 `page-layout`의 480px 캡을 쓰지 않는다. 좌측 고정 사이드 nav(퀴즈/이벤트/쿠폰/공지/유저관리 5개 링크) + 우측 `main` 2열 구조, `main` 최대 폭은 넉넉하게(예: 1200px) 잡는다.
- **main 안에서 모달처럼 뜨게 하는 방법**: `main` 컨테이너에 `position: relative` 대신(또는 추가로) `transform: translateZ(0)` 또는 `contain: layout`을 준다. 둘 중 하나만 있어도 새 CSS containing block이 생겨, 그 안의 `AdminModal`을 `position: fixed`가 아니라 `position: absolute; inset: 0`으로 두면 **사이드바를 침범하지 않고 main 영역 폭 안에서만** 덮인다. 이게 지금 문제의 근본 해결책이다.
- **라우팅**: `AdminRoutes.jsx`의 5개 화면(신규 퀴즈 포함)을 `AdminLayout`의 자식 라우트로 넣는다. 각 화면 컴포넌트 자체는 `AdminToolbar` + `AdminTable` + `AdminModal` 조합만 쓰면 되므로 화면별 코드량이 크게 준다.

## 화면별 구성안

열/폼 항목은 각 `AdminXScreen.jsx`의 실제 `EMPTY_FORM`·렌더 코드에서 그대로 뽑았다. 퀴즈는 어드민 화면 자체가 없어(`quiz/store/admin/*`만 존재) 확인 안 된 항목은 표시했다.

**쿠폰** (`AdminCouponController`, 5 엔드포인트)

| 표 열 | 필터 | 폼 항목 |
|---|---|---|
| 제목, 쿠폰코드, 만료일, 노출여부 | 검색(제목/코드), 노출여부(전체/노출/숨김) | title, couponCode, discountType(FIXED/PERCENT), discountValue, minOrderAmount, expireAt, visible |

**이벤트** (`AdminEventController`, 6 엔드포인트)

| 표 열 | 필터 | 폼 항목 |
|---|---|---|
| 썸네일, 제목, 타입, 기간, 노출여부 | 검색(제목), 타입(전체/공식/자체), 노출만 토글 | title, eventType(OFFICIAL/INTERNAL), startAt, expireAt, imageUrl(업로드+URL 직접입력), externalLink, visible |

**공지** (`AdminNoticeController`, 7 엔드포인트 — ⚠️ 수정 API가 PATCH/PUT 불일치 알려진 버그, `admin-code-inventory.md` §6-1/6-2)

| 표 열 | 필터 | 폼 항목 |
|---|---|---|
| 소스구분, 고정여부, 제목, 게시일, 노출여부 | 검색(제목), 소스(전체/사이트공지/공식링크), 노출만, 고정만 | title, source(INTERNAL/EXTERNAL), content(INTERNAL 전용), externalUrl(EXTERNAL 전용, 서로 배타), isVisible, isPinned |

**유저관리** (`AdminUserController`, 4 엔드포인트 — 생성/삭제 없음, BE 범위와 일치)

| 표 열 | 필터 | 상세 액션 |
|---|---|---|
| 닉네임, 이메일, 역할, 상태, 가입일 | 검색(닉네임), 역할(전체/관리자/일반회원), 상태(전체/정상/차단/탈퇴/정지) | 역할 변경, 상태 변경(변경 전 확인 다이얼로그, 탈퇴는 동의 체크박스 강제). 본인 계정은 변경 불가 |

**퀴즈** [확인필요]

| 표 열 | 필터 | 폼 항목 |
|---|---|---|
| [확인필요 — 어드민 화면 자체가 없음] | [확인필요] | round(숫자), imageUrl(업로드) 만 `quiz/store/dto.js`에서 확인됨. 제목/정답/노출여부/기간 등 추가 필드 여부는 API 인벤토리 쪽 확인 필요 |

## 작업 분할안

파일이 겹치지 않는 5개 트랙. A가 끝나야 C/D/E가 그 컴포넌트를 가져다 쓸 수 있어 **A 선행 → B는 A와 병렬 → C/D/E는 A 완료 후 병렬**로 진행한다.

| 트랙 | 범위 | 대상 파일 |
|---|---|---|
| A. 공통 컴포넌트 | `AdminTable`/`AdminToolbar`/`AdminModal`/`AdminStateBox`/`AdminConfirmDialog`/`useTableModal` 신규 작성 | `web/src/global/ui/admin/**`, `web/src/global/hooks/useTableModal.js` |
| B. 레이아웃 | `AdminLayout` 신설, `AppWrapper`/`AdminRoutes.jsx` 분기 배선 | `web/src/app/wrapper/admin/**`, `web/src/app/wrapper/AppWrapper.jsx`, `web/src/app/router/routes/AdminRoutes.jsx` |
| C. 쿠폰 + 이벤트 | 두 화면을 A 컴포넌트로 교체 | `web/src/domains/coupons/mobile/admin/**`, `web/src/domains/events/mobile/admin/**` |
| D. 공지 + 유저관리 | 두 화면 교체 (공지는 PATCH/PUT 버그도 같이 확인) | `web/src/domains/notices/mobile/admin/**`, `web/src/domains/users/mobile/admin/**` |
| E. 퀴즈 신규 | 필드 확정 후 화면 신규 작성 (기존 화면 없음) | `web/src/domains/quiz/mobile/admin/**`(신규 디렉터리) |

## 미결정 — 사용자 확인 필요

1. `AdminDashboardScreen`(이모지 그리드 진입점)을 사이드 nav 도입 후에도 유지할지, 폐기할지.
2. 퀴즈 관리 화면의 실제 필드 — `round`/`imageUrl` 외 제목·정답·노출여부·기간 등이 있는지, 별도 진행 중인 API 인벤토리 쪽과 합쳐서 확정 필요.
3. `AdminModal`을 진짜 모달(오버레이+포커스)로 유지할지, 레전드 재료 화면처럼 표 안에서 펼쳐지는 인라인 확장으로 등록/수정도 바꿀지. 사용자가 "모달"이라 명시했으므로 이 문서는 모달 유지로 가정했다.
4. 기존에 있지만 안 쓰이는 `useAdminTopBar` 훅(뒤로가기 → `/admin`)을 이번에 5개 화면에 실제로 연결할지, 아니면 TopBar 자체를 없애고 사이드 nav 헤더로 대체할지.
5. PC 우선이라지만 좁은 창(태블릿 등)에서 사이드바를 접을지, 아니면 PC 전용으로 못박고 반응형은 포기할지.

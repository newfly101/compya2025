# 어드민 재디자인 구현 명세

> 입력: `test-docs/레전드 재료 앱 디자인/design_handoff_admin/{README.md, Admin.dc.html}` (프로토타입) ↔ 현재 구현 5개 라우트 + 공통 부품 6종.
> 기준일 2026-09-04. 코드 수정 없음, 조사 전용.

---

## 프로토타입이 요구하는 구조

- **단일 페이지 + 상단 탭.** 사이드 드로어에는 「Admin」 하나만. 탭 순서: 홈 · 퀴즈 · 이벤트 · 쿠폰 · 공지 · 유저관리.
- **컨테이너 465px** 고정, 중앙 정렬. `position:relative` 가 모달의 기준 박스.
- **홈 탭 신설** — 빠른 이동 카드 3열 그리드(도메인별 건수) + 「지금 홈에 노출 중」 요약 카드.
- **리스트 툴바**: 검색 → 필터 칩(라벨 뒤 건수 실시간 표시) → 정보 행(총계 / 선택 시 「n개 선택」+선택삭제+숨김 / 정렬 토글 라벨 / + 등록).
- **리스트 표**: `grid-template-columns: 16px 1fr auto 44px 52px`(체크·주요셀·메타·토글·버튼) div-grid 방식. 체크박스 다중선택, 노출 토글은 리스트에서 즉시 저장(optimistic), 번호식 페이지네이션 8개/페이지.
- **등록/수정은 모달** — 메인 컬럼(465px) 안에서만 뜬다(`position:absolute; inset:0` 기준), 뷰포트 전체 폭 금지.
- **예외: 공지만 모달이 아니라 전체 페이지 글쓰기**(Tiptap, 대표 이미지, 커뮤니티 재사용 전제).
- 탭 전환 시 검색어·칩·선택·페이지 초기화. 일괄 삭제/숨김은 프로토타입은 confirm 없이 즉시 → 실제 구현은 confirm 권장(README 명시).

---

## 현재 구현과의 차이

| 항목 | 프로토타입 | 현재 구현 | 격차 |
|---|---|---|---|
| 화면 구조 | 단일 페이지 + 클라이언트 탭 상태 | 라우트 5개, 화면마다 독립 `useSetTopBar` | 큼 — 셸 신설 필요 |
| 드로어 메뉴 | 「Admin」 1개 | `ADMIN_MENU_GROUPS`에 5개 항목 | 작음 — 배열 교체만 |
| 컨테이너 폭 | 465px | `$layout-wrapper-max` 480px 공용 | 중간 — 아래 § 참고 |
| 다중선택/일괄 삭제·숨김 | 있음 | 없음 | 큼 — 신규 |
| 리스트 토글 | 즉시 저장(optimistic) | 공지만 유사 구현(source/pinned를 클릭 가능한 칩으로), 나머지는 폼 안 체크박스뿐 | 중간 |
| 필터 칩 건수 | 실시간 계산 | 없음(`AdminToolbar`는 라벨만) | 작음 — 확장 |
| 페이지네이션 | 번호식 8개/페이지 | 없음(쿠폰/공지/유저/퀴즈는 전량, 이벤트만 "더보기") | 큼 — 신규, API도 일부 없음 |
| 등록/수정 위치 | 모달(465px 스코프) | 이미 `AdminModal`이 동일 원리(`position:absolute` 기반)로 구현됨 | 없음 — 이미 해결됨 |
| 공지 작성 | 전체 페이지 Tiptap | 모달 폼(textarea) | 큼 — 신규, Tiptap 미설치 |
| TopBar 뒤로가기 | — | `useAdminTopBar` 훅 존재하지만 5개 화면 다 안 씀(`useSetTopBar`+`navigate(-1)` 직접 사용) | 탭 전환되면 이 훅 자체가 무의미해짐(뒤로가기 개념이 탭 전환으로 대체) |
| 표 마크업 | div + CSS grid | `<table>`(레전드/히스토리와 동일 패턴) | 유지 권장(접근성) — 열 폭만 프로토타입 그리드 비율 참고 |

퀴즈 어드민은 이미 화면이 있다(`docs/domain/admin/prd/_api-inventory.md`가 조사한 "화면 자체가 없음"은 구버전 상태 — 현재는 `AdminQuizScreen.jsx` 존재, `{ items }` 구조분해 버그도 이미 고쳐진 것으로 보임. 화면별 명세 § 퀴즈에서 재확인).

---

## 공통 부품 처리 방침

| 부품 | 판정 | 근거 |
|---|---|---|
| `AdminModal` | **살림** | 프로토타입이 요구하는 "메인 컬럼 안에서만 뜨는 모달"을 `position:absolute + page-layout의 position:relative` 조합으로 이미 정확히 구현. `left/right:16px;top:64px` 같은 세부 위치값만 톤 맞추면 됨 |
| `AdminStateBox` | **살림** | 로딩/에러/빈 상태 3분기 그대로 프로토타입·레전드 화면과 동일 패턴 |
| `AdminConfirmDialog` | **살림** | 일괄 삭제/숨김에 confirm을 붙이라는 README 권고와 정확히 맞는 용도 |
| `useTableModal` | **살림** | create/edit 모달 open state 관리는 탭 구조에서도 그대로 필요 |
| `AdminToolbar` | **수정(확장)** | 검색+칩+등록 골격은 맞지만 칩 건수 표시, 선택 개수·선택삭제·숨김 버튼, 정렬 토글 라벨이 빠져 있음. 새 props(`selectedCount`, `onBulkDelete`, `onBulkHide`, `sortLabel`, `onToggleSort`, 칩 `count`) 추가로 해결 — 새 컴포넌트로 쪼갤 필요는 없음 |
| `AdminTable` | **수정(확장)** | `<table>` 구조 자체는 유지(레전드/히스토리 톤 일치, 접근성 우위). 체크박스 열, 토글 스위치 열, 페이지네이션은 `AdminTable` 밖의 새 부품으로 추가(아래) — 기존 `columns/rows/render` API는 그대로 재사용 가능 |

### 신규 필요 부품 (기존 6종 확장으로 안 되는 것)

| 이름 | 역할 | 위치 제안 |
|---|---|---|
| `AdminToggleSwitch` | 36×20 pill 토글, on/off 즉시 저장용 원자 컴포넌트 | `web/src/global/ui/admin/toggleSwitch/` |
| `AdminCheckbox` | 16px 체크박스(행 선택/전체선택 공용) | `web/src/global/ui/admin/checkbox/` |
| `AdminPagination` | 번호식 페이지네이션(8개/페이지, ‹ › 포함) | `web/src/global/ui/admin/pagination/` |
| `AdminBulkBar` (선택) | `AdminToolbar` 정보 행의 선택 개수/일괄 액션 부분만 별도로 뽑을지, `AdminToolbar` 확장으로 흡수할지는 화면 코드량 보고 판단 — 별도 부품 강제 아님 |

재사용률 요약: 6종 중 4종 그대로, 2종(Table/Toolbar) 확장, 폐기 없음. 신규 3종(토글/체크박스/페이지네이션) 추가.

---

## 라우팅 변경안

**권장: 경로는 유지하고 셸을 씌운다.** `/admin`, `/admin/coupon`, `/admin/event`, `/admin/notice`, `/admin/user`, `/admin/quiz` 경로 문자열 그대로 두되, 5개 경로 모두 동일한 `AdminShellScreen` 하나를 렌더링하고 `useParams().tab`으로 초기 탭을 결정한다.

```
AdminRoutes.jsx
  path: "admin"
    index                → AdminShellScreen (tab=home)
    path: ":tab"          → AdminShellScreen (tab=coupon|event|notice|user|quiz)
    path: "notice/write"  → AdminNoticeWriteScreen (전체 페이지, 셸 밖)
    path: "notice/write/:id" → AdminNoticeWriteScreen (수정)
```

- 탭 클릭 시 `navigate('/admin/'+key, { replace: true })`로 주소만 갱신, 화면은 리마운트 없이 내부 상태만 전환.
- 기존 `ROUTE_META.ADMIN_*` 5개는 그대로 두거나(각 tab의 title로 재사용) `AdminShellScreen` 안에서 탭별로 `document.title`을 직접 갱신하는 방식으로 통합 — 기존 상수를 지우지 않아도 됨.
- **북마크/메뉴 링크 안 깨짐**: `/admin/coupon` 같은 기존 링크는 그대로 유효하고, 이제 "쿠폰 탭이 선택된 셸"을 보여줄 뿐이라 사용자 입장에서 결과는 동일(오히려 탭 바까지 보여 다른 메뉴로 즉시 이동 가능해짐).
- 쿼리스트링(`/admin?tab=coupon`) 방식은 기각 — 기존 5개 경로 문자열을 그대로 못 살리고 마이그레이션(리다이렉트) 코드가 추가로 필요해짐. path param 방식이 더 적은 변경으로 호환됨.
- `MENU_GROUPS.js`의 `ADMIN_MENU_GROUPS`를 5항목 → `{ icon:'🛠️', label:'Admin', to:'/admin' }` 1항목으로 교체.
- `useAdminTopBar` 훅은 탭 구조에서는 "뒤로가기=/admin" 개념 자체가 사라지므로 폐기 대상. `AdminShellScreen`이 자체 TopBar(햄버거·타이틀·로그아웃)를 한 번만 세팅.
- `AdminDashboardScreen.jsx`(현재 라우트 미등록 고아 화면)는 홈 탭으로 대체되므로 폐기.

---

## 스타일 토큰 대조

`web/src/global/styles/variables/_colors.scss` + `semantic/_color.scss` 대조 결과, 프로토타입 hex는 **기존 토큰과 안 겹치지만 역할은 대응된다** — 새 원색을 그대로 박아 넣지 말고 기존 토큰에 매핑해야 한다(레전드/히스토리 화면이 쓴 방식과 동일 원칙).

| 프로토타입 역할 | 프로토타입 값 | 매핑할 기존 토큰 | 비고 |
|---|---|---|---|
| 페이지 배경 | `#0b0813` | `var(--color-bg-deepest)` | 값은 다르지만(#0f0a14) 역할 동일, 그대로 재사용 |
| 컨테이너/카드 배경 | `#0f0b1a` / `#15101f` | `var(--color-bg-deep)` / `var(--color-bg-card)` | |
| 인풋 배경 | `#120d1f`/`#0f0b1a` | `var(--color-bg-card)` 또는 `--color-bg-overlay` | |
| 선택행/hover | `#16102a`/`#130e22` | `var(--color-bg-elevated)` (투명도 조절) | |
| 텍스트 주/보조/placeholder | `#ece8f6`/`#8a7fa8`/`#5a5170` | `--color-text-primary` / `--color-text-secondary`(또는 muted) / `--color-text-placeholder` | |
| 경계선 | `#1c1530`~`#3b3352` (6단계) | `--color-border` / `--color-border-strong` (2단계) | 프로토타입이 더 세분화돼 있으나 전부 새 토큰화하지 말 것 — 대부분 2단계로 흡수 가능. 정말 구분 필요한 것만(퍼플 강조 보더 `#3b2a66`) 아래 신규 토큰 |
| 액센트 퍼플 | `#7c3aed`/`#a78bfa`/`#c4b5fd` | `--color-brand`(#a86af0) / `--color-brand-dark` / `--color-brand-tint` | 기존 브랜드 퍼플로 통일 — 프로토타입 고유 퍼플 값 신규 도입 금지 |
| 성공(토글 on) | `#22c55e` | **신규 검토 필요** — `--color-success`(#03c75a)는 네이버 로그인 브랜드 그린으로 이미 의미가 고정돼 있음. 토글 on에 재사용할지 신규 도메인 토큰(`--color-admin-on`)을 팔지 미결정 § 참고 | |
| 위험(삭제) | `#f87171`/보더 `#5b2430` | `--color-danger` / `--color-danger-dim` | 값 근사 대체 가능 |
| 경고(비활성 유저 태그) | `#fcd34d` | `--color-warning` | |
| 태그 배경 5종(퍼플/그린/앰버/로즈/뉴트럴) | `#2a1f4a`,`#14321f`,`#3a2f1a`,`#3a1f2a`,`#1e1631` | 전역에 대응 토큰 없음 | **신규**: `web/src/domains/admin/mobile/admin.tokens.scss`에 `--color-admin-tag-*` 세트로 분리(legendStats/historyLegend와 동일 패턴) |

**결론**: 전역 `_colors.scss`/`semantic/_color.scss`에는 손대지 않는다. 어드민 전용 값은 `admin.tokens.scss` 1개 파일(도메인 로컬 토큰, Screen에서 side-effect import)로 최소화하고, 나머지는 전부 기존 `--color-*`로 흡수한다.

### 465px vs 480px

`$layout-wrapper-max`(480px)는 `page-layout` mixin(`mixins/_layout.scss`)이 사용자 페이지 전역과 공용. 이 파일을 직접 바꾸면 전체 서비스 폭이 바뀐다 — 금지.

**권장 방법**: `page-layout` mixin에 선택적 파라미터를 추가한다.

```scss
@mixin page-layout($max: $layout-wrapper-max) {
  ...
  max-width: $max;
  ...
}
```

- 파라미터에 기본값을 기존 `$layout-wrapper-max`로 주므로 **기존 40여 개 호출부는 코드 변경 없이 그대로 480px 동작**(하위호환).
- 어드민 셸 scss에서만 `@include page-layout($max: 465px);`로 호출.
- 리스크 낮음(1줄짜리 시그니처 확장) — 다만 `_layout.scss`는 공용 파일이라 이 변경은 **공통 부품 트랙(A)**에서 처리하고 다른 트랙은 건드리지 않는다.

---

## 화면별 구현 명세

### 홈 (신설)

- `AdminShellScreen`의 tab=home일 때 렌더. 카드 3열 그리드(퀴즈/이벤트/쿠폰/공지/유저 5장) — 각 카드 건수는 해당 도메인 리스트 길이.
- 「지금 홈에 노출 중」 카드: 퀴즈(노출 ON + 이미지 있는 최대 회차) / 이벤트(진행중 개수, `expireAt >= 오늘`) / 쿠폰(사용가능 개수, `expireAt >= 오늘`) / 고정 공지 제목(`isPinned && isVisible`). 이 계산은 각 도메인 데이터를 셸 레벨에서 이미 불러온 뒤 파생(derive)하면 되고, 별도 API 불필요.

### 퀴즈

- 현재 `AdminQuizScreen.jsx` 존재·동작(구버전 API 인벤토리 문서의 "화면 없음"은 stale). 필드는 `round`(자동부여 토글 포함), `imageUrl`(URL/파일 선택 세그먼트), `visible` 토글 3개 — README 필드 구성과 일치.
- 격차: 자동 부여 체크박스 UI, 홈 노출 중 배지(`가장 큰 노출 회차`), 페이지네이션 없음. 홈 노출 판정 로직(회차+이미지+ON 최댓값)은 위 홈 탭과 동일 derive 함수 공유.

### 이벤트

- 필드·필터는 API 인벤토리와 일치(공식/자체, 시작~만료, visible). 격차: 체크박스 다중선택, 썸네일 36px 표시, 페이지네이션(현재 "더보기"만 있고 count API가 없음 — 아래 미결정 참고).

### 쿠폰

- 필드 거의 일치. `discountType`/`discountValue`/`minOrderAmount`는 현재 구현에만 있고 README 필드 목록(코드/제목/설명/만료일/노출)엔 없음 — README가 필드를 단순화한 것으로 보이며 기존 DB 스키마가 이 필드들을 요구하면 폼에서 유지해야 한다. 화면 담당 트랙에서 `sql/V2` 실측 후 유지 여부 결정.

### 공지

- 리스트는 기존 구조 재사용 가능(소스구분/고정/노출 칩 필터 이미 있음). **등록/수정만 모달 → 전체 페이지로 전환**(아래 별도 § 참고).

### 유저관리

- 체크박스·토글 없음(README 명시), 「+ 등록」 없음 — 현재 구현과 이미 일치. 격차: 정렬 클릭 순환(가입일↓→가입일↑→로그인↓→로그인↑), 행 클릭 시 상세 모달 오픈은 이미 구현됨. 본인 계정 보호(role/status 비활성화)도 이미 구현됨 — 그대로 유지.

---

## 공지 글쓰기 페이지

- **범위**: 제목 인풋 + 대표 이미지 업로드 + Tiptap 툴바(B/I/U/S/H3/목록/인용/링크/이미지/구분선/실행취소) + 본문 + 하단 노출/고정 토글.
- **위치 제안**: 에디터 자체(Tiptap 래퍼)는 `web/src/global/ui/richEditor/RichEditor.jsx`에 도메인 비의존 공용 컴포넌트로 둔다 — README가 "커뮤니티 게시판 글쓰기에 재사용"을 명시했으므로 처음부터 공용으로 만드는 게 나중에 notices → community로 다시 뜯어내는 것보다 싸다(컴포넌트 분해 정책 예외: 외부 재사용이 이미 확정된 경우).
- 화면 래퍼(`AdminNoticeWriteScreen.jsx`, 대표이미지 블록·게시판 칩·저장 버튼 배치)는 `web/src/domains/notices/mobile/admin/`에 둔다. 커뮤니티가 나중에 이 화면을 참조할 때는 `RichEditor` 컴포넌트를 그대로 가져다 자기 화면을 새로 짜면 된다.
- **의존성**: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` 미설치 — `web/package.json`에 신규 추가 필요(ops 성격이지만 이 트랙 작업에 종속되므로 담당 트랙에서 함께 처리).
- **임시저장 없음**(README 명시) — 이탈 시 unsaved-changes 경고도 프로토타입엔 없음, 필요 여부는 미결정 § 참고.

---

## 작업 분할안

파일이 겹치지 않는 6개 트랙. **A(공통 부품+토큰+mixin 확장) 선행 → B(라우팅 셸) 는 A 완료 후 → C~F(화면별)는 B 완료 후 병렬**.

| 순서 | 트랙 | 범위 | 대상 파일 |
|---|---|---|---|
| 1 | A. 공통 부품 확장 | `AdminToolbar`/`AdminTable` 확장, `AdminToggleSwitch`/`AdminCheckbox`/`AdminPagination` 신설, `page-layout` mixin에 `$max` 파라미터 추가, `admin.tokens.scss` 신설 | `web/src/global/ui/admin/**`, `web/src/global/styles/mixins/_layout.scss`, `web/src/domains/admin/mobile/admin.tokens.scss` |
| 2 | B. 셸 + 라우팅 | `AdminShellScreen`(탭바+홈탭+TopBar), `AdminRoutes.jsx` 재배선(`:tab` 파라미터), `MENU_GROUPS.js` 드로어 1항목화, `useAdminTopBar`/`AdminDashboardScreen` 폐기 | `web/src/domains/admin/mobile/**`, `web/src/app/router/routes/AdminRoutes.jsx`, `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` |
| 3 | C. 퀴즈+이벤트 | 두 화면을 탭 패널 컴포넌트로 전환, 체크박스/토글/페이지네이션 적용 | `web/src/domains/quiz/mobile/admin/**`, `web/src/domains/events/mobile/admin/**` |
| 3 | D. 쿠폰+유저 | 동일 전환(유저는 체크박스/토글 없음, 정렬 순환만) | `web/src/domains/coupons/mobile/admin/**`, `web/src/domains/users/mobile/admin/**` |
| 3 | E. 공지 리스트 + 글쓰기 | 리스트 탭 패널 전환 + `RichEditor` 신설 + `AdminNoticeWriteScreen` 신설 + Tiptap 패키지 추가 | `web/src/domains/notices/mobile/admin/**`, `web/src/global/ui/richEditor/**`, `web/package.json` |
| 3 | F. 검증 | 5개 화면 ↔ README 정합 + 465px/480px 회귀(사용자 페이지 폭 안 깨졌는지) + 톤 대조(레전드/히스토리와 다크퍼플 일치 여부) | Read only |

C/D/E는 서로 다른 도메인 디렉터리라 병렬 가능. F는 C/D/E 완료 후 실행.

---

## 미결정 — 사용자 확인 필요

1. **토글 on 색상** — 프로토타입 `#22c55e`을 기존 `--color-success`(#03c75a, 네이버 브랜드 그린)에 재사용할지, 어드민 전용 `--color-admin-on` 토큰을 새로 팔지.
2. **이벤트/유저 번호식 페이지네이션** — API 인벤토리가 확인한 대로 두 도메인 모두 count 쿼리가 없어 총 페이지 수를 못 낸다(BE 작업 필요, ops/backend 트랙). 이번 라운드는 "더보기"로 갈지, count API를 먼저 붙이고 번호식으로 갈지.
3. **쿠폰 폼 필드** — 현재 구현엔 있는 `discountType`/`discountValue`/`minOrderAmount`가 README엔 없다. DB에 이미 저장되는 컬럼이면 유지해야 하는데, 화면 담당 트랙 시작 전에 `sql/V2` 확정 필요.
4. **공지 글쓰기 이탈 경고** — 임시저장 없음은 확정(README), unsaved-changes confirm을 추가할지는 미정.
5. **`ROUTE_META.ADMIN_*` 5종 처리** — 탭 셸로 통합되면 개별 title 상수를 그대로 title 매핑용으로 재사용할지, 셸 전용 단일 메타로 정리할지.

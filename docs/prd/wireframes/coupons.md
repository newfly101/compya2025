# coupons 화면기획서 (Wireframe)

> 입력: `docs/prd/domains/coupons.md` Part B + Figma MCP (node: 16-624, 10-2)
> 생성: prd-wireframe-generator
> 갱신: 2026-05-09

---

## 1. 도메인 컨텍스트 (Part A 요약 — read-only)

- **분류**: live (public 모바일) + partial-mock (admin 라우트 주석 처리 — `A.1`)
- **활성 라우트 / 핵심 화면** (`A.2`):
  - `/coupons` — `CouponScreen.jsx` (모바일 단일, live)
  - `/` 의 일부 — `CouponListHorizontal.jsx` (HomeScreen 미니 가로 스크롤, live)
  - `/admin/content/coupon` — lazy import 자체가 주석 (`AdminCouponListPage.jsx` 파일 부재)
- **알려진 위험 차단성** (`A.6`):
  - R1: coupon dual-write 정책 ↔ 코드 갭 — ★ admin coupon 화면 신규 작업 차단 (부분 해소: `B.7` 결정 #1 ◐). public 미차단
  - `CouponAdminServiceImpl#createCoupon` → site_coupons INSERT 후 coupons readback → NPE 위험. T1 해소로 제거 예정 (`B.2 T1`)
  - T4 (시간대 정합): KST 기준 정합 vs server-side 만료 필터 — 구현 단계 결정 (`B.9`)
  - T5 (외부 URL HTTPS): `http://withhive.me/399/{code}` 평문 + 하드코딩 — T5 해소 필요 (`B.2 T5`)

---

## 2. 기능 → 화면 매핑 (Part B → wireframe)

| 기능 (Part B) | 우선순위 | 매핑 화면 | 화면 상태 (state) | figma node |
|---|---|---|---|---|
| T1: BE 코드 단방향 전환 | P0 | (BE only — 화면 없음) | n/a | 해당 없음 |
| T2: admin 라우트 활성화 + AdminCouponListPage 신규 작성 | P0 | Screen 3: AdminCouponListPage | loading / loaded / empty / error | 미정 (텍스트 wireframe) |
| T3: admin 4 capability 정합 검증 | P0 | Screen 3: AdminCouponListPage | (T2 결과 합산) | 해당 없음 |
| T4: public `formatNow` vs `expireAt` 시간대 정합 fix | P0 | Screen 1: CouponScreen, Screen 2: CouponListHorizontal | loaded (만료 라벨 상태) | 16-624 (Screen 1), 10-2 (Screen 2) |
| T5: 외부 URL HTTPS / 환경변수화 | P0 | Screen 1, Screen 2 (바로가기 인터랙션) | loaded | 16-624, 10-2 |
| T6: V1→V2 INSERT only 마이그 | P1 | (운영 마이그 — 화면 없음) | n/a | 해당 없음 |
| T7: V1 `coupons` 테이블 DROP | P2 | (운영 schema — 화면 없음) | n/a | 해당 없음 |
| (현행 유지) public 쿠폰 리스트 read | 현행 | Screen 1: CouponScreen, Screen 2: CouponListHorizontal | loading / loaded / empty / error | 16-624, 10-2 |

---

## 3. 화면별 wireframe

### 3.1 CouponScreen — `/coupons` 풀화면

- **라우트**: `/coupons` (`A.2`)
- **진입 컴포넌트**: `web/src/domains/coupons/mobile/CouponScreen.jsx`
- **figma node**: `16-624` (https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=16-624)
- **figma metadata** (node `16:624` — `get_metadata` 결과):
  - frame 명: "User — 쿠폰 페이지 (Component-Based)", 375 × 1476 px
  - 자식 노드 요약:
    - `C / PageHeader` (16:625) — 375×52 px. "← 쿠폰" 헤더 (뒤로가기 + 타이틀)
    - `C / SectionHeader` × 2 — "최신 쿠폰" (16:628), "종료된 쿠폰" (16:682)
    - `C / CouponCard / action-focused` (16:631) — 343×226 px. 활성 쿠폰 action 강조형
    - `C / CouponCard / default` × 2 (16:648, 16:664) — 활성 쿠폰 기본형
    - `C / CouponCard / default--expired` × 2 (16:685, 16:704) — 종료 쿠폰 (비활성 스타일)
    - 구분선 Rectangle (16:681) — 4px 높이 섹션 구분

> **중요**: figma 의 `C / PageHeader` (id 16:625) 는 도메인 자체 헤더. 본 프로젝트 원칙상 도메인 자체 헤더를 새로 만들지 않고 글로벌 `MobileLayout` TopBar 로 통일 (`feedback_no_domain_header`). 구현 시 `C / PageHeader` 는 figma 참조 전용 — 글로벌 TopBar 의 title prop "쿠폰" 으로 대체.

- **screenshot**: `_assets/coupons/screen_coupon_full.png` (figma node 16-624)
- **레이아웃 구성** (top → bottom):

  ```
  [GlobalTopBar — title="쿠폰", backBtn=true]   ← MobileLayout 제공. figma C/PageHeader 대체
  ─────────────────────────────────────────────
  [SectionHeader] "최신 쿠폰"                    ← 16:628, 보라 accent bar(#a86af0, 3×13px) + 텍스트 13px SemiBold
    [CouponCard / active] × N                   ← 16:631 (action-focused) or 16:648 (default)
      - TopRow: [Badge/code (couponCode)] + [BtnGo "바로가기" (active: #6d4ad3)]
      - Divider
      - title (16px Bold, rgba(255,255,255,0.92))
      - detail (12px Regular, rgba(255,255,255,0.38), 다줄 가능)
      - Divider
      - ⏱ expireAt 유효기간 YYYY-MM-DD HH:mm
      - 안내문: "바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다."
      - [PrimaryActionButton / default] "쿠폰 적용하기" (#6d4ad3)
  ─────────────────────────────────────────────
  [구분선 4px #0f0a14]                           ← 16:681
  [SectionHeader] "종료된 쿠폰"                  ← 16:682
    [CouponCard / expired] × N                  ← 16:685, 16:704
      - TopRow: [Badge/code (couponCode)] + [BtnGo "바로가기" (inactive: #272033, rgba(255,255,255,0.38))]
      - Divider
      - title (16px Bold, rgba(255,255,255,0.60) — 흐림 처리)
      - detail (동일 흐림)
      - Divider
      - ⏱ expireAt (rgba(255,255,255,0.38) — 흐림)
      - 안내문
      - [PrimaryActionButton / disabled] "종료된 쿠폰" (#272033, 비활성)
  ```

- **데이터 source**:
  - API: `GET /api/coupons` (`A.3`, `CouponController#getCouponLists`) — visible=true 필터. `useCouponList` hook (`A.1 hooks/useCouponList.js`)
  - DB: `site_coupons` (V2 active, `A.4`)
  - Response 에서 `visible=true` 만 수신 (BE 단에서 필터) → FE 에서 `expireAt` 기준으로 active / expired 분리 (`T4` 시간대 정합 대상)

- **상태 분기**:
  - **loading**: 스켈레톤 또는 스피너 (현행 코드 동작 그대로 — 구현체 변경 없음)
  - **loaded**: 최신 쿠폰 섹션 + 종료된 쿠폰 섹션 렌더링 (active N건 / expired M건)
  - **empty** (active 0건): 최신 쿠폰 섹션 빈 상태 표시. 종료된 쿠폰은 있을 수 있음 (현행 코드 동작 그대로 — 빈 상태 노출 빈도는 B.5 KPI 지표)
  - **error**: API 실패 시 현행 코드 동작 그대로 (에러 메시지 or 빈 화면)

- **유저 액션**:
  - 카드 내 `[BtnGo "바로가기"]` 클릭 (active 카드) → `window.open('http://withhive.me/399/{couponCode}', '_blank')` + analytics `trackCouponGo(couponCode)` 현행 코드 그대로. ⚠ T5 해소 전까지 http 평문 + 하드코딩 (T5 대상)
  - 카드 내 `[PrimaryActionButton "쿠폰 적용하기"]` 클릭 → 동일 외부 링크 (`window.open`)
  - expired 카드의 `[PrimaryActionButton "종료된 쿠폰"]` → disabled, 클릭 불가
  - GlobalTopBar backBtn → 이전 화면 (브라우저 히스토리 back)

- **acceptance criteria 매핑** (Part B T4, T5 관련):
  - [ ] T4: `expireAt` 기준 active/expired 분리가 KST 기준 정합 또는 server-side 만료 필터로 동작 (구현 단계 결정 — TBD)
  - [ ] T5: `window.open` 의 URL 이 `VITE_COUPON_BASE_URL` env 변수 또는 HTTPS 로 전환됨

---

### 3.2 CouponListHorizontal — HomeScreen 미니 가로 스크롤

- **라우트**: `/` 의 일부 (`A.2` — HomeScreen 차용)
- **진입 컴포넌트**: `web/src/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx`
- **figma node**: `10-2` (https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=10-2)
- **figma metadata** (node `10:2` — `get_metadata` 결과):
  - frame 명: "Coupon Section", 375 × 170 px
  - 자식 노드 요약:
    - SectionHeader 인라인: accent bar (Rectangle `10:3`, #a86af0, 3×13px) + "최신 쿠폰" 텍스트 (10:4) + "전체 보기 →" (10:5, #7c6f8f 11px)
    - `CouponScrollGrid` (9:9) — 347×112 px, overflow:clip (가로 스크롤 컨테이너)
      - `CouponScrollRow` (10:6) — 640×104 px (화면 밖으로 넘침 → 가로 스크롤)
        - `CouponCard_0` (10:7), `CouponCard_1` (10:17), `CouponCard_2` (10:27) — 각 200×104 px
          - `CouponCode` 뱃지 (100×22px, #332947)
          - `BtnGo "바로가기"` (52×22px)
          - 구분선
          - title 텍스트 (12px Medium, overflow-hidden text-ellipsis)
          - `ExpiryRow` — ⏱ + 유효기간 텍스트

- **screenshot**: `_assets/coupons/screen_coupon_mini.png` (figma node 10-2)
- **레이아웃 구성** (HomeScreen 내 섹션 단위):

  ```
  [SectionHeader 인라인]
    accent bar(#a86af0) | "최신 쿠폰" (SemiBold 13px) | "전체 보기 →" (#7c6f8f 11px, 우측 정렬)
  ─────────────────────────────────────────────────────
  [CouponScrollGrid — overflow-x: scroll (혹은 clip + touch scroll)]
    [CouponCard × N] — 카드 너비 200px, 가로 배치, 간격 8px (10→17 간격=24px 기준 — card+gap)
      - [CouponCode 뱃지] + [BtnGo "바로가기"]
      - 구분선
      - title (12px Medium, 1줄 ellipsis)
      - ⏱ 유효기간 (10px Regular, rgba(255,255,255,0.38))
  ```

  > active 쿠폰만 노출. expired 섹션 없음.

- **데이터 source**:
  - API: `GET /api/coupons` (`A.3`) — `useCouponList` hook 재사용 (`A.1`, `B.8` cross-reference: home 도메인이 본 도메인 hook 차용)
  - active 쿠폰만 필터링해서 가로 스크롤에 표시

- **상태 분기**:
  - **loading**: 로딩 인디케이터 또는 스켈레톤 (현행 코드 동작 그대로)
  - **loaded**: active 쿠폰 N건 가로 스크롤 (1건 이상)
  - **empty** (active 0건): 빈 상태 처리 (현행 코드 동작 그대로 — 섹션 자체를 hide 하거나 빈 메시지. 현행 확인 필요)
  - **error**: 현행 코드 동작 그대로

- **유저 액션**:
  - `[BtnGo "바로가기"]` 클릭 → `window.open('http://withhive.me/399/{couponCode}', '_blank')` + analytics. (T5 대상 — 동일)
  - `[전체 보기 →]` 클릭 → `/coupons` 라우트 이동 (Screen 3.1 로)
  - 카드 가로 스크롤 — touch drag 또는 마우스 wheel

- **acceptance criteria 매핑**:
  - [ ] T4: active/expired 분리 기준이 KST 정합 (Screen 3.1 와 동일 기준)
  - [ ] T5: BtnGo 의 `window.open` URL HTTPS 전환 또는 env 변수화

---

### 3.3 AdminCouponListPage — `/admin/content/coupon` (PC 어드민, 텍스트 wireframe)

- **라우트**: `/admin/content/coupon` (`A.2` — 현재 라우트 주석 처리)
- **진입 컴포넌트**: `AdminCouponListPage.jsx` — **신규 작성 필요** (현재 파일 부재, lazy import 자체가 주석 — `B.2 T2`)
- **figma node**: 미정 (admin figma 미진행 — `B.6`). 텍스트 wireframe 으로 정의
- **screenshot**: 없음 (figma 미연결)
- **권한**: ADMIN role 필수 — URL 가드 `/api/admin/**` hasRole(ADMIN) (`A.5`)

- **레이아웃 구성** (PC 어드민 — 좌측 사이드메뉴 + 메인 컨텐츠 영역):

  ```
  [AdminLayout — 좌측 사이드메뉴 + 우측 컨텐츠]
  ─────────────────────────────────────────────
  [페이지 헤더]
    "쿠폰 관리"  +  [등록] 버튼 (우측 정렬)
  ─────────────────────────────────────────────
  [CouponListTable]
    | # | couponCode | title | visible | expireAt | 작업 |
    | 1 | DREAMY602ND | GM드리미의 2차 쿠폰 | ON  | 2026-05-31 | [수정] [숨김] |
    | 2 | NEWYEARCPB2026 | 설날 쿠폰          | OFF | 2026-03-31 | [수정] [표시] |
    | … |
    - visible=true: "ON" (활성), visible=false: "OFF" (숨김)
    - 페이지네이션: GET /api/admin/coupons 단일 페이로드 기준 (현재 페이지네이션 BE 미지원 확인 필요)
    - 삭제 버튼 없음 (visible=false 처리로 갈음 — `B.1 시나리오 2`)
  ─────────────────────────────────────────────
  [CouponFormModal — 등록/수정 공용, 모달 또는 슬라이드 패널]
    - couponCode   : text input (필수)
    - title        : text input (필수)
    - detail       : textarea (선택 — 보상 내용 여러 줄)
    - expireAt     : datetime-local input (필수)
    - visible      : toggle switch (기본값: true)
    - [저장] / [취소] 버튼
    → 등록: POST /api/admin/coupons
    → 수정: PATCH /api/admin/coupons/{id}
  ─────────────────────────────────────────────
  [VisibleToggle — 인라인 또는 모달 없이 직접 토글]
    → PATCH /api/admin/coupons/{id}/visible
    → 성공 시 리스트 재조회 (GET /api/admin/coupons)
  ```

- **입력 필드 (T2 acceptance 기준)**:
  | 필드 | 타입 | 필수 | 비고 |
  |---|---|---|---|
  | `couponCode` | text | 필수 | 쿠폰 코드 (영문 대문자 + 숫자) |
  | `title` | text | 필수 | 쿠폰명 |
  | `detail` | textarea | 선택 | 보상 내용 (여러 줄, 현행 BE 필드 확인 필요) |
  | `expireAt` | datetime | 필수 | 만료 일시 (KST 기준 — T4 와 동일 정합 필요) |
  | `visible` | boolean | 필수 | 기본값: true |

- **데이터 source**:
  - 목록: `GET /api/admin/coupons` (`A.3`, `AdminCouponController#getCouponLists`, auth: ADMIN)
  - 등록: `POST /api/admin/coupons` (`A.3`, `AdminCouponController#insertNewCoupons`)
  - 수정: `PATCH /api/admin/coupons/{id}` (`A.3`, `AdminCouponController#updateCoupon`)
  - visible 토글: `PATCH /api/admin/coupons/{id}/visible` (`A.3`, `AdminCouponController#updateCouponVisible`)
  - DB: `site_coupons` (V2 active — T1 완료 후 단일 출처 보장)

- **상태 분기**:
  - **loading**: 테이블 로딩 인디케이터
  - **loaded**: 쿠폰 리스트 테이블 표시 (visible/hidden 모두)
  - **empty** (리스트 0건): "등록된 쿠폰이 없습니다." + [등록] 유도
  - **error**: API 실패 시 에러 메시지

- **유저 액션**:
  - `[등록]` 클릭 → CouponFormModal 오픈 (등록 모드)
  - `[수정]` 클릭 → CouponFormModal 오픈 (수정 모드, 기존 데이터 pre-fill)
  - `[숨김]`/`[표시]` 클릭 → `PATCH /api/admin/coupons/{id}/visible` 즉시 호출 → 성공 시 리스트 재조회
  - CouponFormModal [저장] → POST/PATCH 호출 → 성공 시 모달 닫기 + 리스트 재조회

- **⚠ T1 선결 필요**: T1 (BE 단방향 전환) 이 완료되어야 T3 (4 capability 정합 검증) 통과 가능. 등록 후 readback NPE (`A.6 R1`) 는 T1 해소로 제거

- **acceptance criteria 매핑** (T2, T3):
  - [ ] T2: `AdminRoutes.jsx` 의 `/admin/content/coupon` 라우트 주석 해제
  - [ ] T2: `AdminCouponListPage.jsx` 신규 작성 + 4 capability 폼 동작
  - [ ] T3: list (GET) → create (POST) → update (PATCH) → visible toggle (PATCH) 4 capability 모두 `site_coupons` 단일 출처 동작
  - [ ] T3: createCoupon 흐름에서 V1 `coupons` readback 없음 (NPE 위험 제거)

---

## 4. 컴포넌트 재사용 매핑 (이미 구현된 부분)

coupons 는 ★ **표준 패턴** 도메인 (`fe-map.md ★ Owner 확정 #4`). 다른 도메인이 이 도메인을 정렬 기준으로 사용.

| 컴포넌트 (coupons 현행) | figma 명칭 | 재사용 방향 |
|---|---|---|
| `CouponCard` (in `components/couponCard/`) | `C / CouponCard / action-focused`, `C / CouponCard / default`, `C / CouponCard / default--expired` | 현행 구현 유지. active/expired variant 확인 후 figma 토큰 정렬만 필요 |
| `CouponListVertical` (in `containers/public/`) | (16:628~16:718 세로 스크롤 래퍼) | 현행 유지. SectionHeader + CouponCard 반복 패턴 |
| `CouponListHorizontal` (in `containers/public/`) | `CouponScrollGrid` (9:9) | 현행 유지. 가로 스크롤 컨테이너 |
| `SectionBlock` (패턴 — events 표준) | `C / SectionHeader` (16:628, 16:682, 10:3) | accent bar + 섹션 타이틀 패턴. events 에서 동일 컴포넌트 사용 중이면 import 재사용 |
| `LabelBadge` / `Chip` (패턴) | `C / Badge / code` (16:634, 9:5 등) | couponCode 뱃지 — 현행 구현 확인 후 재사용 또는 동일 패턴 정렬 |
| `PrimaryActionButton` | `C / PrimaryActionButton / default`, `/ disabled` | 현행 구현 확인 후 재사용 |

> **이미 구현된 화면이 있음 (Screen 1, 2 — live)** → design-sync 단계에서 figma vs 코드 비교 권장.

---

## 5. 신규 컴포넌트

| 컴포넌트 | 화면 | figma node | 비고 |
|---|---|---|---|
| `AdminCouponListPage.jsx` | Screen 3.3 (AdminCouponListPage) | 미정 | T2 acceptance — 파일 자체 신규 작성 필요. PC 어드민 레이아웃 준수 |
| `CouponFormModal` (또는 `CouponForm`) | Screen 3.3 내부 | 미정 | 등록/수정 공용 폼. AdminCouponListPage 내 sub-컴포넌트 또는 동일 파일에 배치 (`feedback_component_decomposition` — 반복/변형/외부재사용 충족 여부에 따라 분리 결정) |

---

## 6. figma 미반영 사항

| 항목 | 설명 | 우선순위 | 후속 조치 |
|---|---|---|---|
| AdminCouponListPage 전체 | admin figma 미진행. list table / form modal / visible toggle 모두 figma frame 없음 | P0 (T2) | design-sync 단계 보류. admin 디자인팀에 figma 신규 작성 요청 또는 개발 주도 구현 후 figma 사후 반영 |
| empty state (최신 쿠폰 0건) | figma 에 active 0건 empty state frame 없음 | P1 | 코드 현행 동작 그대로 유지. figma 에 empty state frame 추가 요청 |
| loading state | figma 에 skeleton/spinner frame 없음 | P1 | 코드 현행 동작 그대로. figma 추가 요청 |
| error state | figma 에 error frame 없음 | P1 | 동일 |
| CouponListHorizontal empty state | active 0건 일 때 mini 섹션 처리 (hide vs empty message) | P1 | 현행 코드 동작 확인 후 결정 |

---

## 7. design-sync 입력

- **분류**: **live** (public 모바일 — Screen 1, 2) + **partial-mock** (admin — Screen 3, 라우트 주석)
- **권장**: Screen 1 (`/coupons`) + Screen 2 (HomeScreen Coupon Section) → **design-sync 진행 권장** (live, figma node 2건 매칭 완료)
- **admin (Screen 3)**: design-sync **보류** — admin figma 미진행. T2 구현 완료 후 figma 작성 → design-sync 진행

### 비교 대상 화면 라우트 + figma node 페어

| 화면 | 라우트 | 진입 컴포넌트 | figma node | design-sync 여부 |
|---|---|---|---|---|
| Screen 1: CouponScreen | `/coupons` | `CouponScreen.jsx` (+ `CouponListVertical.jsx`) | `16-624` | 권장 (live) |
| Screen 2: CouponListHorizontal | `/` (HomeScreen 내 섹션) | `CouponListHorizontal.jsx` | `10-2` | 권장 (live) |
| Screen 3: AdminCouponListPage | `/admin/content/coupon` | `AdminCouponListPage.jsx` (신규) | 미정 | 보류 (figma 미진행, T2 미구현) |

### design-sync 시 주요 체크 포인트

- `C / CouponCard / action-focused` vs `C / CouponCard / default` 차이 — 현행 코드에서 variant 구분 여부
- `PrimaryActionButton / default` (#6d4ad3) vs `/ disabled` (#272033) 토큰 정렬
- `C / Badge / code` 뱃지 스타일 (#332947, rounded-4px) — 현행 코드 정렬 여부
- 배경 컬러 — active 카드: `#1f1a29`, expired 카드: `#18141f` 구분
- 섹션 구분선 (4px `#0f0a14`) 구현 여부
- T4 시간대 정합 fix 후 만료 라벨 렌더링 로직 변경 여부 확인

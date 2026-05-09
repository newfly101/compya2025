# events 화면기획서 (Wireframe)

> 입력: `docs/prd/domains/events.md` Part B + Figma MCP (node: 3-18, 16-775)
> 생성: prd-wireframe-generator
> 갱신: 2026-05-09

---

## 1. 도메인 컨텍스트 (Part A 요약 — read-only)

- **분류**: live (public) + partial-mock (admin 라우트 주석) — Part A.1
- **활성 라우트 / 핵심 화면** (Part A.2):
  - `/events` → `EventScreen.jsx` (모바일, live)
  - `/` 의 일부 → `EventListHorizontal.jsx` (HomeScreen 차용, 모바일)
  - `/admin/content/event` → 라우트 lazy import 자체 주석 + 컴포넌트 파일 부재 (Part A.2)
- **알려진 위험 차단성** (Part A.6):
  - R4: `POST /api/upload/events` permitAll — admin 가드 부재. 모바일 리뉴얼 직접 차단 아님, 보안 별개 fix (T3)
  - `EventCard.jsx:13` dead navigate fallback — T5 제거 대상

---

## 2. 기능 → 화면 매핑 (Part B → wireframe)

| 기능 (Part B) | 우선순위 | 매핑 화면 | 화면 상태 (state) | figma node |
|---|---|---|---|---|
| T1: admin 라우트 활성화 + AdminEventListPage 신규 작성 | P0 | Screen 3: AdminEventListPage | list / loading / empty / error | 미진행 (텍스트 wireframe) |
| T2: admin 4 capability 동작 정합 검증 | P0 | Screen 3: AdminEventListPage | list / create-form / edit-form / visible-toggle | 미진행 (텍스트 wireframe) |
| T3: R4 `POST /api/upload/events` admin 가드 (BE 보안) | P0 | Screen 3 (이미지 업로드 UI — create/edit form 내부) | n/a (BE 변경, 화면 구조 변화 없음) | 해당 없음 |
| T4: (결번 — drop) | — | — | — | — |
| T5: dead navigate fallback 제거 (`EventCard.jsx:13`) | P0 | Screen 1 + Screen 2 (카드 인터랙션 정정) | loaded (카드 탭 동작) | 16-775 (Screen 1), 3-18 (Screen 2) |

---

## 3. 화면별 wireframe

### 3.1 EventScreen — `/events` 풀화면

- **라우트**: `/events` (Part A.2 cite)
- **진입 컴포넌트**: `web/src/domains/events/mobile/EventScreen.jsx`
- **figma node**: `16-775` (https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=16-775)
- **figma metadata** (get_metadata 결과):
  - frame 명: "User — 이벤트 페이지 (Component-Based)"
  - 사이즈: 375×1580px (모바일)
  - 핵심 자식 컴포넌트:
    - `C / PageHeader` (375×52px) — 뒤로가기 + "이벤트" 타이틀
    - `C / SectionHeader` × 2 — "진행중 이벤트" / "종료된 이벤트"
    - `C / EventCard / default` × 5 (343×228px each) — 진행중 3건
    - `C / EventCard / expired` × 1 (343×228px) — 종료 1건 (figma 에서 종료 3건 표시)
    - `C / Thumbnail` (343×120px) — 이미지 배너 영역
    - `C / StatusBadge / active` (41×20px) — "진행중" / "종료" 배지
    - `C / ExternalIndicator` (52×20px) — "상세 보기 →" 링크
- **screenshot**: `_assets/events/event-screen-full.png` (figma node 16-775)

- **레이아웃 구성** (top → bottom):
  - `MobileLayout` — GlobalTopBar (variant: page, 타이틀 "이벤트") — 도메인 자체 헤더 X (`feedback_no_domain_header`)
    - figma 의 `C / PageHeader` (node 16:776) 는 GlobalTopBar 에 해당. 도메인 내부에 별도 헤더 컴포넌트 신규 작성 금지
  - Section A: `C / SectionHeader` "진행중 이벤트" (보라색 accent bar #a86af0 + 텍스트)
  - Section B: `EventListVertical` — `C / EventCard / default` 반복 (진행중 이벤트 목록)
    - 카드당 구성: `C / Thumbnail` (120px 높이 이미지) + `C / StatusBadge` ("진행중", 보라 #6c5ce7) + 이벤트명 텍스트 + 날짜 텍스트 + 구분선 + `C / ExternalIndicator` ("상세 보기 →")
  - Divider: 8px 높이 구분 구획 (`#0a080d`, node 16:842)
  - Section C: `C / SectionHeader` "종료된 이벤트"
  - Section D: `EventListVertical` — `C / EventCard / expired` 반복 (종료 이벤트 목록)
    - 종료 카드: 썸네일 위에 `C / StatusBadge` ("종료", 회색 #2a2e3a) + 본문 텍스트 opacity 0.6 + "종료된 이벤트입니다" 텍스트 (ExternalIndicator 자리)

- **데이터 source**:
  - API: `GET /api/events/external` (Part A.3 cite) — `useEventList` 훅이 호출
  - DTO: `baseEventDTO` (`domains/events/store/dto.js`)
  - 필드 참조: `event.title`, `event.startDate`, `event.endDate`, `event.thumbnail`, `event.externalLink`, `event.visible`

- **상태 분기**:
  - `loading`: 스켈레톤 카드 N개 표시 (figma 미명시 — coupons 패턴 준용)
  - `loaded`: 진행중 섹션 + 종료 섹션 — 위 레이아웃 그대로
  - `empty` (진행중 0건): "현재 진행중인 이벤트가 없습니다" 안내 텍스트 (figma 미명시 — 텍스트 fallback)
  - `error`: "이벤트 정보를 불러올 수 없습니다" 안내 텍스트 (figma 미명시)

- **유저 액션**:
  - 카드 탭 → `event.externalLink` 외부 URL 새 탭 이동 (`window.open(event.externalLink, '_blank')`)
    - T5: `EventCard.jsx:13` 의 dead navigate fallback 제거 후 동작 기준. 라우트 신설 없음
  - 종료 이벤트 카드 탭 → 동일하게 `event.externalLink` 외부 URL 이동 (externalLink 있는 경우)
  - TopBar 뒤로가기 (←) → 이전 화면 (GlobalTopBar 제공, 도메인 구현 X)

- **acceptance criteria 매핑** (Part B T5 기준):
  - [ ] `EventCard.jsx:13` dead navigate fallback 라인 제거
  - [ ] 카드 탭 = `event.externalLink` 외부 이동만 (navigate 없음)
  - [ ] 라우트 `/events/{id}` 신설 없음

---

### 3.2 HomeScreen 미니 — EventListHorizontal

- **라우트**: `/` 의 HomeScreen 내 섹션 (Part A.2 cite)
- **진입 컴포넌트**: `web/src/domains/events/mobile/containers/public/EventListHorizontal.jsx`
- **figma node**: `3-18` (https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=3-18)
- **figma metadata** (get_metadata 결과):
  - frame 명: "Event Section"
  - 사이즈: 375×182px (HomeScreen 내 섹션 블록)
  - 핵심 자식 컴포넌트:
    - 섹션 타이틀: "진행 중인 이벤트" (보라 accent bar + 텍스트, node 3:19-3:20)
    - "전체 보기 →" 링크 (node 3:21, 우측 정렬, color #7c6f8f)
    - `EvtCard_0` (167.5×124px) + `EvtCard_1` (167.5×124px) — 2열 가로 카드
    - 카드 내부: `Thumb` (167.5×72px 이미지) + `C / StatusBadge / active` + 이벤트명 + 날짜(단축형 "~04.05 23:59")
- **screenshot**: `_assets/events/event-section-home.png` (figma node 3-18)

- **레이아웃 구성** (top → bottom):
  - GlobalTopBar 내부 (HomeScreen 영역 — 도메인 자체 헤더 없음)
  - 섹션 헤더 행: 보라 accent bar + "진행 중인 이벤트" + 우측 "전체 보기 →"
  - 가로 스크롤 컨테이너 (`EventListHorizontal`):
    - 미니 `EvtCard` 반복 (167.5×124px per card)
    - 카드 내부: 썸네일 이미지(상단 72px) + `StatusBadge` + 이벤트명(12px) + 단축 날짜(10px)
    - figma 기준 2개 표시, 실제는 가로 스크롤로 N개

- **데이터 source**:
  - API: `GET /api/events/external` (Part A.3 cite) — `useEventList` 훅 공유 (EventScreen 과 동일 API)
  - 표시 필드: `event.title`, `event.endDate` (단축), `event.thumbnail`, 배지: 진행중/종료 여부

- **상태 분기**:
  - `loading`: 스켈레톤 2개 카드 (미니 사이즈)
  - `loaded`: 가로 스크롤 카드 목록 (진행중 이벤트 우선 노출)
  - `empty` (진행중 0건): 섹션 자체 숨김 또는 "진행중 이벤트 없음" 안내 (coupons 패턴 준용)
  - `error`: 섹션 숨김 또는 에러 텍스트

- **유저 액션**:
  - "전체 보기 →" 탭 → `/events` 라우트 이동 (내부 navigate)
  - 카드 탭 → `event.externalLink` 외부 URL 새 탭 이동 (T5 적용)
    - T5 이후 동작 기준: dead navigate fallback 없음

- **acceptance criteria 매핑** (Part B T5 기준):
  - [ ] HomeScreen 미니 카드도 동일하게 `event.externalLink` 외부 이동만
  - [ ] 전체 보기 → `/events` navigate

---

### 3.3 AdminEventListPage — PC 어드민

- **라우트**: `/admin/content/event` (Part A.2 — 라우트 lazy import 주석 상태, T1 에서 주석 해제)
- **진입 컴포넌트**: `AdminEventListPage.jsx` (파일 부재 → T1 신규 작성 대상)
- **figma node**: 미진행 — 텍스트 wireframe (admin Figma 보류, B.6 cite)
- **보안**: admin 라우트 `FE AuthGuard` + BE URL 가드 `/api/admin/**` hasRole(ADMIN) 보호 (Part A.5). T3 (R4) fix 완료 후 이미지 업로드도 보호됨

#### 레이아웃 구성 (coupons 패턴 그대로)

```
[PC Admin Layout]
┌─────────────────────────────────────────────────────┐
│ GlobalAdminTopBar                                   │
├──────────────┬──────────────────────────────────────┤
│ SideNav      │  Content Area                        │
│              │  ┌──────────────────────────────────┐│
│  > 이벤트    │  │ 페이지 타이틀: "이벤트 관리"    ││
│              │  │ [+ 이벤트 등록] 버튼 (우측)      ││
│              │  ├──────────────────────────────────┤│
│              │  │ 이벤트 목록 테이블               ││
│              │  │  ID | 제목 | 기간 | 표시여부 | 액션│
│              │  │  ─────────────────────────────── ││
│              │  │  1  | 리그... | 03.18~04.05 | ON | [수정][토글]│
│              │  │  2  | 가위... | 03.23~04.15 | ON | [수정][토글]│
│              │  │  ...                              ││
│              │  └──────────────────────────────────┘│
└──────────────┴──────────────────────────────────────┘
```

#### 테이블 컬럼 명세

| 컬럼 | 데이터 필드 | 비고 |
|---|---|---|
| ID | `event.id` | 정렬 기준 |
| 제목 | `event.title` | 텍스트 truncate |
| 기간 | `event.startDate ~ event.endDate` | "YYYY.MM.DD ~ YYYY.MM.DD" |
| 외부링크 | `event.externalLink` | 클릭 시 새 탭 이동 (표시는 아이콘/단축) |
| 썸네일 | `event.thumbnail` | 이미지 미리보기 small |
| 표시여부 | `event.visible` | ON/OFF 토글 스위치 |
| 액션 | — | [수정] 버튼 |

#### 4 capability UI 명세

**List (목록 조회)**
- API: `GET /api/admin/events/external` (Part A.3 admin endpoint 1번)
- 상태: loading → 테이블 skeleton / loaded → 행 렌더 / empty → "등록된 이벤트가 없습니다" / error → "목록 조회 실패"

**Create (이벤트 등록 폼)**
- 트리거: [+ 이벤트 등록] 버튼 → modal 또는 별도 form 영역 노출 (coupons 패턴 준용: 모달)
- API: `POST /api/admin/events` (Part A.3 admin endpoint 2번)
- `POST /api/upload/events` — 썸네일 이미지 업로드 (T3 R4 fix 후 ADMIN 가드 정상 작동)
- 폼 필드: 제목 / 외부링크 URL / 기간(시작~종료) / 썸네일 이미지 업로드 / 표시여부 토글
- 제출 성공 → 목록 갱신 + 모달 닫기

**Update (이벤트 수정 폼)**
- 트리거: 목록 행 [수정] 버튼 → 동일 폼 모달 (기존 데이터 prefill)
- API: `PATCH /api/admin/events/{id}` (Part A.3 admin endpoint 3번)
- 썸네일 재업로드 시 `POST /api/upload/events` 재호출
- 제출 성공 → 목록 갱신 + 모달 닫기

**Visible Toggle (노출 토글)**
- 트리거: 표시여부 토글 스위치 클릭 → 즉시 API 호출 (confirm dialog 없음, coupons 패턴 준용)
- API: `PATCH /api/admin/events/{id}/visible` (Part A.3 admin endpoint 4번)
- 성공 → 해당 행 visible 상태 갱신 / 실패 → 원복 + 에러 토스트

#### T3 보안 명시

- R4 (Part A.5, A.6): `POST /api/upload/events` 현재 permitAll — admin 가드 외부에 있음
- T3 완료 후: SecurityConfig 에 `/api/upload/**` hasRole(ADMIN) 추가 또는 path → `/api/admin/upload/...` 이동
- 화면 구조 자체는 변화 없음. admin 이미지 업로드 폼은 T3 완료 전에도 UI 작성 가능 (가드 유효성만 다름)

#### 데이터 source

- API: `GET /api/admin/events/external`, `POST /api/admin/events`, `PATCH /api/admin/events/{id}`, `PATCH /api/admin/events/{id}/visible` (Part A.3 admin 4 endpoint 전체)
- Upload: `POST /api/upload/events` (`infra/uploads/store/api.js:3`)
- DTO: `baseEventDTO` (`domains/events/store/dto.js`)
- Store: `domains/events/store/admin/{api,endpoints,thunks}.js` (이미 파일 존재 — T1 에서 컴포넌트만 신규)

#### acceptance criteria 매핑 (Part B T1, T2 기준)

- [ ] `/admin/content/event` 라우트 lazy import 주석 해제 (T1)
- [ ] `AdminEventListPage.jsx` 컴포넌트 파일 신규 작성 (T1)
- [ ] 기존 `events/store/admin/*` 와 연결 (T1)
- [ ] list (GET), create (POST), update (PATCH/{id}), visible toggle (PATCH/{id}/visible) 4 endpoint 모두 BE 정상 응답 확인 (T2)
- [ ] `baseEventDTO` 기준 DTO 매핑 정합 확인 (T2)
- [ ] T3: 비ADMIN 토큰으로 `POST /api/upload/events` 호출 시 401/403 반환 (T3 완료 후 검증)

---

## 4. 컴포넌트 재사용 매핑

| 재사용 후보 컴포넌트 (coupons 패턴) | events 도메인 매핑 여부 | 비고 |
|---|---|---|
| `CouponCard` → `EventCard` | 구조 유사 (썸네일+제목+날짜+인터랙션) — 별도 구현체 존재 (`eventCard/`) | coupons 카드와 별도지만 구조 패턴 동일 |
| `SectionBlock` → `C / SectionHeader` | 매칭 (보라 accent bar + 섹션명 패턴 동일) — figma node 16:779, 16:843 | events 도 동일 토큰 사용 확인됨 (색상 #a86af0) |
| `LabelBadge` / `Chip` → `C / StatusBadge` | 매칭 — "진행중" (#6c5ce7) / "종료" (#2a2e3a) 배지 동일 패턴 | coupons 의 상태 배지와 variant 통일 가능 |
| `EventListVertical` | events 전용 (`containers/public/`) — 재사용 후보 아님 (이미 구현) | ★ 표준 패턴 보존 |
| `EventListHorizontal` | events 전용 (`containers/public/`) — 이미 구현 | HomeScreen 차용 패턴 |
| coupons 어드민 폼 모달 | `AdminEventListPage` create/update 폼 — coupons 패턴 그대로 신규 작성 | 4 capability 구조 동일 |

> 이미 구현된 화면이 있음 (live 분류) — **design-sync 단계에서 figma vs 코드 비교 필요**.

---

## 5. 신규 컴포넌트

| 컴포넌트 | 위치 (예정) | figma node | 비고 |
|---|---|---|---|
| `AdminEventListPage.jsx` | `web/src/domains/events/mobile/` 또는 admin 전용 경로 | 미정 (admin figma 미진행) | T1 신규 작성. coupons `AdminCouponListPage` 패턴 그대로 |

- public 화면(`EventScreen`, `EventListHorizontal`, `EventCard`)은 이미 구현 — 신규 컴포넌트 아님

---

## 6. figma 미반영 사항

| 항목 | 상태 | 비고 |
|---|---|---|
| AdminEventListPage (admin 4 capability) | figma 미진행 | T1/T2 텍스트 wireframe 정의. figma 도착 시 design-sync 진행 |
| `C / EventCard / expired` 탭 인터랙션 | figma 에서 "종료된 이벤트입니다" 텍스트 표시 — 탭 동작 미명시 | externalLink 있으면 외부 이동, 없으면 비활성 처리 (구현 단계 결정) |
| empty state (진행중 0건) | figma 에 empty 화면 없음 | 텍스트 fallback 정의 (coupons 패턴 준용). design-sync 때 figma 추가 요청 |
| loading skeleton | figma 에 skeleton 없음 | 구현 단계에서 coupons skeleton 패턴 준용 |

---

## 7. design-sync 입력

- **도메인 분류**: live (public) + partial-mock (admin 라우트 주석)
  - public 화면 (`EventScreen`, `EventListHorizontal`) → **design-sync 진행 권장** (live 분류, figma frame 2개 매칭 완료)
  - AdminEventListPage → **design-sync 보류** (figma 미진행 + 컴포넌트 미구현)

- **권장 design-sync 입력**:

| 화면 | 라우트 | figma node | design-sync 여부 |
|---|---|---|---|
| EventScreen (풀화면) | `/events` | `16-775` | 권장 (live) |
| EventListHorizontal (HomeScreen 미니) | `/` (HomeScreen 섹션) | `3-18` | 권장 (live) |
| AdminEventListPage | `/admin/content/event` | 미정 | 보류 (figma 미진행) |

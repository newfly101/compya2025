# 도메인: events

> ★ **표준 패턴** (`fe-map.md ★ Owner 확정 #4`). coupons 와 함께 다른 도메인 정렬 기준.

## A.1 현재 상태

- **분류**: **live** (public) + **partial-mock** (admin 라우트 주석)
- **모바일 전환 진척도**: ★ **표준** (coupons 와 동일 구조)
- 폴더 구조 (★ 표준):
  ```
  domains/events/
  ├── mobile/
  │   ├── EventScreen.jsx
  │   ├── components/eventCard/
  │   ├── containers/public/
  │   │   ├── EventListHorizontal.jsx
  │   │   └── EventListVertical.jsx
  │   └── hooks/useEventList.js
  └── store/
      ├── admin/    { api.js, endpoints.js, thunks.js }
      ├── public/   { api.js, endpoints.js, thunks.js }
      ├── slices.js
      └── dto.js (events 만 — `baseEventDTO`)
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| EventPage → EventScreen | `/events` | `web/src/domains/events/mobile/EventScreen.jsx` | 모바일 | live |
| (HomeScreen 미니 리스트) | `/` 의 일부 | `domains/events/mobile/containers/public/EventListHorizontal.jsx` | 모바일 | HomeScreen 차용 |
| AdminEventPage (PC admin) | `/admin/content/event` ★ 라우트 주석 | (lazy import 자체가 주석. 파일 자체 미존재) | PC 어드민 | Owner 확정: 디자인 미진행 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/event/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/events/external` | `EventController#getExternalEventList` (`event/controller/EventController.java:21`) | permitAll | "external" 만 노출 |
| GET | `/api/admin/events/external` | `AdminEventController#getExternalEventList` (`AdminEventController.java:26`) | ADMIN | |
| POST | `/api/admin/events` | `AdminEventController#insertNewEvent` (line 32) | ADMIN | |
| PATCH | `/api/admin/events/{id}` | `AdminEventController#updateExternalEvent` (line 40) | ADMIN | |
| PATCH | `/api/admin/events/{id}/visible` | `AdminEventController#updateExternalEventVisible` (line 48) | ADMIN | |

> 참고: 옛 `.http` 파일 (`src/main/resources/test/event/getEventList.http:1`) 이 `/api/events/list/external` 호출 — stale, 현재 라우트 `/api/events/external` 와 불일치 (`be/dead-suspects.md F`).

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/events/store/public/api.js:4` | GET | `/events/external` | `useEventList` | `/events`, `/` (HomeScreen) |
| `domains/events/store/admin/api.js:9` | GET | `/admin/events/external` | (admin hook) | `/admin/content/event` ★ 주석 |
| `domains/events/store/admin/api.js:14` | POST | `/admin/events` | (admin) | (admin event) |
| `domains/events/store/admin/api.js:18` | PATCH | `/admin/events/{id}` | (admin) | (admin event) |
| `domains/events/store/admin/api.js:22` | PATCH | `/admin/events/{id}/visible` | (admin) | (admin event) |
| `infra/uploads/store/api.js:3` | POST | `/upload/{directory}` | `requestUploadImage` (events admin upload wrapper) | (admin event 폼) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #7, #27-28, #29)

- **매칭됨**: 5건 (public 1, admin 4)
- **매칭됨 (관련)**: `POST /api/upload/events` — ★ admin 가드 부재 (R4)
- FE 만 호출 (BE 부재): 0
- BE 만 노출 (호출 없음): 0

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `events` | V1 | ⚪ legacy(이전완료) | — (mapper 0건) | site_events 로 이전 |
| `site_events` | V2 | 🔵 active | `mapper/site/event/EventMapper.xml:21,40,56,61,86,115` | 6 stmt — 마이그 정상 완료 |

**dual pair**: `events ↔ site_events` — V2 단방향 (이전 완료, V1 mapper 0건). 컬럼 100% 동일 (TIMESTAMP↔DATETIME 차이만).

## A.5 권한 / 가드

- 사용자 (`/events/external`): permitAll
- admin (`/admin/events*`): SecurityConfig URL 가드 `/api/admin/**` hasRole(ADMIN)
- ★ `@PreAuthorize("hasRole('ADMIN')")` 부착되어 있으나 `@EnableMethodSecurity` 미선언 → decorative (R6). URL 가드로 자연 보호
- ★ **R4 위험 — admin 가드 누락**: `POST /api/upload/events` (`UploadController.java:18`) — `/api/upload/...` 라 `/api/admin/**` 매칭 밖, permitAll. event admin 화면이 이 endpoint 사용 (이미지 업로드)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🚨 **R4: `/api/upload/events` admin 가드 부재** | `auth-and-flags.md:64`, `risk-and-priority.md #4` | ◐ 모바일 리뉴얼 직접 차단 아님, 보안 별개 fix |
| Owner 정책: events 는 ★ **표준 패턴** | `fe-map.md ★ Owner 확정 #4` | admin 라우트 주석 = 디자인 미진행 상태 |
| 옛 `.http` 파일 stale path (`/api/events/list/external`) | `be/dead-suspects.md F` | 운영 영향 없음 (dev fixture). 정리 시 갱신/삭제 |

## A.7 dead 항목 (이 도메인 안)

- 도메인 자체에 dead 없음
- **관련 dead**: `web/src/domains/admin/store/{api,endpoints,thunks}.js` 전체 주석 (구 events admin 의 구버전, 현재는 `events/store/admin/*` 사용) — `dead-confirmed.md 1-C` 즉시 삭제 가능

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **R4 fix 시점**: SecurityConfig 에 `/api/upload/**` hasRole(ADMIN) 추가 또는 path 를 `/api/admin/upload/...` 로 이동 — 보안 라운드 별개 진행
- admin 라우트 (`/admin/content/event`) 디자인 도착 시 활성화 — 별도 admin 라운드

---

## B.1 라운드 scope + 가드레일

- **이번 라운드 scope**: public + admin + R4 보안 fix
- **가드레일**:
  - admin 라우트는 주석 해제 + AdminEventListPage 컴포넌트 신규 작성 (T1). admin Figma 는 미진행 → 텍스트 wireframe 수준
  - public FE 컴포넌트는 그대로 (★ 표준 패턴 보존). store/dto.js 의 `baseEventDTO` 유지
  - schema 변경 없음 — V1 `events` 테이블 이전 완료 (Part A.4), V2 `site_events` 단일 소스
  - 도메인 자체 헤더 없음 (글로벌 `MobileLayout TopBar` 사용 — `feedback_no_domain_header`)

## B.2 기능 요구사항 (task 단위)

- [ ] **T1: admin 라우트 활성화 + AdminEventListPage 컴포넌트 신규 작성** — P0
  - ⚠ **상태 (2026-05-09)**: 본 라운드 admin UI legacy 통째 폐기 라운드와 정합. T1 미진행 상태 (events 도메인 `feature/admin/` 폴더 자체 부재 — Part B v1 결정 미반영) → **신규 admin UI 기획 라운드 후 재구현**. 어느 도메인 우선 진행할지 사용자 결정 필요 (admin.md TODO 참조). 데이터 레이어 (`store/admin/{api, endpoints, thunks, dto, slices}`) 보존 상태이므로 신규 UI 만 작성 가능
  - 사용자 시나리오: admin 이 `/admin/content/event` 진입 → AdminEventListPage 로 admin event list 화면 진입. 현재 라우트 lazy import 자체가 주석 + 컴포넌트 파일 부재 상태 → 라우트 주석 해제 + 컴포넌트 신규 작성
  - acceptance criteria:
    - `/admin/content/event` 라우트 활성화 (lazy import 주석 해제)
    - `AdminEventListPage` 컴포넌트 파일 신규 작성 (텍스트 wireframe 수준 — admin Figma 미진행)
    - 기존 `events/store/admin/*` (api/endpoints/thunks) 와 연결
  - 의존 API/테이블: A.3 admin 4 endpoint, `site_events`
  - figma node: 미진행 (admin Figma 보류 — design-sync 보류)

- [ ] **T2: admin 4 capability 동작 정합 검증** — P0
  - 사용자 시나리오: T1 컴포넌트가 admin 4 capability (list / create / update / visible toggle) 를 호출 시 BE 정상 응답 + DTO 매핑 정합
  - acceptance criteria:
    - list (`GET /admin/events/external`), create (`POST /admin/events`), update (`PATCH /admin/events/{id}`), visible toggle (`PATCH /admin/events/{id}/visible`) 4 endpoint 모두 BE 정상 응답
    - DTO 매핑 정합 (`baseEventDTO` 기준)
    - T1 컴포넌트와 연결 동작 검증
  - 의존: A.3 admin 4 endpoint, `site_events` (mapper 6 stmt)
  - figma node: 해당 없음 (검증 task)

- [ ] **T3: R4 `POST /api/upload/events` admin 가드 추가 (BE 보안)** — P0
  - 사용자 시나리오: admin 이 이벤트 등록/수정 시 이미지 업로드 → `POST /api/upload/events` 호출. 현재 permitAll → ADMIN 가드 적용 필요
  - acceptance criteria:
    - SecurityConfig 에 `/api/upload/**` 경로 hasRole(ADMIN) 추가 **또는** path 를 `/api/admin/upload/...` 로 이동 (BE 라운드에서 결정)
    - 비ADMIN 토큰으로 호출 시 401/403 반환
    - admin 화면 의 업로드 정상 동작 확인
  - 의존 API/테이블: `POST /api/upload/{directory}` (Part A.3 FE 호출 표 마지막 row)
  - figma node: 해당 없음
  - cite: `risk-and-priority.md #4`, `auth-and-flags.md:64`

- [ ] T4: ~~(결번)~~
  - **drop 사유**: 외부 URL HTTPS = admin 책임. 별도 task 불필요 → drop. 재번호 매기지 않고 **결번 유지** (history trace 용)

- [ ] **T5: dead navigate fallback 제거** — P0
  - 사용자 시나리오: `EventCard.jsx:13` 의 dead navigate fallback 코드 제거. 라우트 신설 X
  - acceptance criteria:
    - `web/src/domains/events/mobile/components/eventCard/EventCard.jsx:13` 의 dead navigate fallback 라인 제거
    - 카드 인터랙션 = 외부 deeplink (`event.externalLink`) 만 유지
    - 라우트 신설 없음
  - 의존: 클라이언트 only
  - figma node: 해당 없음

## B.3 신규 기능

- 신규 화면: 1건 (T1 — `AdminEventListPage` 컴포넌트 신규 작성, 라우트는 기존 주석 해제)
- 신규 API: 0건 (T3 는 기존 endpoint 의 가드 변경)
- 신규 테이블: 0건
- **결론**: AdminEventListPage 컴포넌트 1건 신규 + R4 보안 가드 + dead navigate 제거. schema/route 추가 없음

## B.4 우선순위

| Task | 우선순위 | Phase | 비고 |
|---|---|---|---|
| T1 admin 라우트+컴포넌트 신규 | **P0** | 모바일 리뉴얼 admin | 컴포넌트 파일 부재 → 신규 작성 |
| T2 admin 4 capability QA | **P0** | 모바일 리뉴얼 admin | T1 후속 검증 |
| T3 R4 보안 가드 | **P0** | 모바일 리뉴얼 보안 | events 직접 흡수 |
| T4 (결번) | — | — | drop |
| T5 dead navigate 제거 | **P0** | 모바일 리뉴얼 정리 | EventCard.jsx:13 |

## B.5 KPI / 성공지표

- 미정 (Owner 결정 보류)

## B.6 디자인 / Figma 참조

- admin Figma: **미진행** (텍스트 wireframe → design-sync 보류)
- public 화면: wireframe-generator 단계에서 figma node ID 입력 시 본 섹션 갱신

## B.7 ★ Owner 결정 (이번 라운드)

| 항목 | 결정 | 사유 |
|---|---|---|
| events 라운드 scope | public + admin + R4 보안 fix | 도메인 일괄 정리 |
| 카드 인터랙션 | (가) 외부 deeplink (`event.externalLink`) | 단순 외부 이동 |
| 시간대 fix | 불필요 | 단순 노출 |
| T4 task | **drop** (외부 URL HTTPS = admin 책임) | 별도 task 불필요 |
| T5 fallback 제거 | 라우트 신설 X, dead navigate 코드만 제거 | EventCard.jsx:13 |
| admin Figma | **미진행** (텍스트 wireframe → design-sync 보류) | 디자인 도착 전이라도 컴포넌트 신규 작성은 진행 |

## B.8 cite

- Part A.3 (API), Part A.4 (DB), Part A.5 (가드), Part A.6 (R4)
- `docs/reconciliation/risk-and-priority.md #4` (R4)
- `docs/reconciliation/auth-and-flags.md:64` (`/api/upload/events` permitAll)
- `docs/reconciliation/fe-map.md ★ Owner 확정 #4` (★ 표준 패턴)
- `docs/prd/_overview.md § 7` (Phase), `§ 8` (Owner 결정)

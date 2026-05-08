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

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역

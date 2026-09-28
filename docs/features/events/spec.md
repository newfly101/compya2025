---
feature: events
version: 1.0.4
status: active
created: 2026-01-29
updated: 2026-09-28
---

# events

## 1. 무엇을 하는 기능인가

노출 중인 카페(공식)·자체 이벤트를 하나의 목록으로 "진행중"/"종료" 두 그룹으로 보여준다. 외부 링크가 있는 이벤트는 카드 클릭 시 그 링크를 새 탭으로 연다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 이벤트 목록 (SC-03-01) | `/events` | 홈(SC-07-01) "진행 중인 이벤트" 섹션 더보기 |
| 관리자 — 이벤트 관리 (SC-01-01 내부 탭) | `/admin/event` | 관리자 셸(SC-01-01) 상단 탭 |

이벤트에는 상세 페이지가 없다. 외부 링크가 없는 이벤트는 클릭해도 화면 전환이 없다(크롤러가 404를 만나는 것을 막기 위한 의도적 설계).

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-EVT-01 | 노출 조건 | 공개 목록은 `is_visible = TRUE` **AND** `event_type = 'OFFICIAL'` 인 행만 반환한다. 내부(INTERNAL) 이벤트는 노출을 켜도 공개 화면에 새지 않는다 | `EventMapper.xml` |
| REQ-EVT-02 | 진행중/종료 판정 | BE는 상태 필드를 안 내려주고, 관리자·공개 화면 모두 KST 기준 현재 시각과 `expireAt` 을 같은 분 단위로 비교한다(과거엔 관리자만 날짜 단위 UTC 비교여서 최대 9시간 오차가 있었으나 통일됨) | `useEventList.js`, `AdminEventScreen.jsx:131-132` |
| REQ-EVT-03 | "예정(upcoming)" 상태 없음 | 시작일(`startAt`)이 미래여도 이를 확인하는 로직이 없어, 등록 즉시 "진행중"으로 표시된다 | `EventMapper.xml`, `useEventList.js` |
| REQ-EVT-04 | 열어 둔 화면의 자정 전환 | KST 자정 1회 타임아웃 + 탭 복귀(포커스) 시 재계산으로, 화면을 열어 둔 채 자정을 넘겨도 "종료"로 재분류된다 | `EventScreen.jsx` |
| REQ-EVT-05 | 정렬 순서 | 정렬 주인은 FE로 확정됐다 — BE는 `start_at DESC` 로 참고용으로 내려주고, FE가 받은 뒤 `id` 내림차순으로 재정렬한 결과가 실제 노출 순서다 | `EventMapper.xml`, `store/public/thunks.js` |
| REQ-EVT-06 | 외부 링크 유무 처리 | `externalLink` 는 nullable — 링크가 없으면 카드를 클릭 불가능한 요소로 렌더한다. **외부 링크를 필수로 강제**하는 것은 확정됐으나 DB `NOT NULL` 제약·폼 검증 추가는 아직 반영되지 않았다 | `EventCard.jsx`, `sql/V2/CREATE_04_TABLE_SITE.sql:58`(현재 nullable) |
| REQ-EVT-07 | 편집 저장이 손대지 않은 시각을 유지 | 등록·수정 폼에 시각 입력(선택) 칸이 있어, 비우면 서버 기본값(시작 12:00 / 종료 23:59:59)이 채워지고, 편집 시에는 원본 시각이 유지된다(제목만 고쳐도 종료 시각이 안 바뀜) | `AdminEventScreen.jsx` |
| REQ-EVT-08 | 권한 | 공개 조회는 누구나. 등록/수정/노출 토글/삭제/일괄 작업은 `AdminEventController` 클래스 레벨 ADMIN 권한자만 | `AdminEventController.java` |
| REQ-EVT-09 | 일괄 처리 부분 실패 | 서버가 구분해 응답하는 `successIds`/`failedIds` 를 화면이 그대로 반영 — 성공분만 반영 + 실패 건수 배너 | `admin/thunks.js` |
| REQ-EVT-10 | 관리자 목록 상한 | `size=1000` 전량 조회 방식이라 1000건을 넘으면 잘릴 수 있다 — 근본 해결(서버 페이징)은 아직 없고 경고 배너로만 안내한다 | `AdminEventScreen.jsx` |
| REQ-EVT-11 | 캐시 갱신 시점 | 실제 쓰기가 있는 6개 메서드(12곳)가 트랜잭션 커밋 **전**에 캐시를 비운다 — TTL이 없어 동시 조회가 옛 값으로 캐시를 재채울 수 있는 위험이 남아 있다(코드 문제, 승인 대기) | `EventAdminServiceImpl.java` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 이벤트 정의 | `site_events`(`id`, `event_type` ENUM OFFICIAL/INTERNAL, `title`, `start_at`, `expire_at`, `image_url`, `external_link` nullable, `is_visible`, `created_at`, `updated_at`) | CHECK `expire_at > start_at`. `event_type` 은 공개 조회 필터에만 쓰이고 그 외 표시·정렬에는 영향 없음 |
| 공개 목록 | `GET /api/events/external` | 인증 불필요 |
| 관리자 노출 목록 | `GET /api/admin/events/external` | ADMIN, FE가 호출하지 않는 미사용 경로(정리 대상) |
| 관리자 전체 목록 | `GET /api/admin/events` | ADMIN, 필터·페이지네이션 파라미터 지원 |
| 등록 | `POST /api/admin/events` | ADMIN |
| 수정 | `PATCH /api/admin/events/{id}` | ADMIN, 항상 전체 필드 덮어쓰기 |
| 노출 토글 | `PATCH /api/admin/events/{id}/visible` | ADMIN |
| 삭제 | `DELETE /api/admin/events/{id}` | ADMIN |
| 일괄 삭제 | `DELETE /api/admin/events/bulk` | ADMIN, 부분 실패 허용 |
| 일괄 노출 변경 | `PATCH /api/admin/events/bulk/visible` | ADMIN, 부분 실패 허용 |
| 카드 클릭 GA4 이벤트 | `pushEvent`(GA4) `event_click` | 파라미터 `event_id`·`event_title`. 전송 메커니즘은 `.claude/rules/fe/fe-analytics.md` |

## 5. 하지 않는 것

- "예정(upcoming)" 상태 관리 — 시작일이 되면 자동으로 노출을 바꾸는 기능은 설계에 없다. 등록 즉시 노출이 현재 동작이다.
- 외부 링크가 없는 이벤트의 상세 화면 — 만들지 않기로 확정, 대신 외부 링크를 필수로 강제하는 방향으로 정리 중(§3 REQ-EVT-06).
- 관리자 목록의 진짜 서버 페이지네이션 — 화면 구조 변경이 필요한 더 큰 작업이라 이번 범위 밖, 경고 배너로만 완화.

## 6. 확인 필요

❓ 외부 링크 필수화(REQ-EVT-06)는 방향은 확정됐으나 DB `NOT NULL` 전환·폼 검증 추가가 아직 반영되지 않았다 — 코드/DDL 작업 필요.

❓ 캐시 커밋 전 evict(REQ-EVT-11)의 최종 안전판(TTL)은 운영 설정 변경 승인 대기 사안이다.

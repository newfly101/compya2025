---
feature: notices
version: 1.0.5
status: active
created: 2026-01-29
updated: 2026-09-28
---

# notices

## 1. 무엇을 하는 기능인가

운영자가 등록한 사이트 자체 공지(INTERNAL, "사이트 공지")와 외부 채널 공지(EXTERNAL, "공식 공지")를 한 목록에서 나눠 보여주고, 상단에 중요 공지 1건을 고정 노출한다. 카드를 누르면 제목 기반 slug 주소로 상세 화면으로 이동한다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 공지 목록 (SC-04-01) | `/notices` | 홈(SC-07-01) "공지사항" 섹션 더보기 |
| 공지 상세 (SC-04-02) | `/notice/:slug` | 공지 목록 카드 클릭 |
| 관리자 — 공지 목록/관리 (SC-01-01 내부 탭) | `/admin/notice` | 관리자 셸(SC-01-01) 상단 탭 |
| 관리자 — 공지 글쓰기 (SC-04-03) | `/admin/notice/write`, `/admin/notice/write/:id` | 관리자 공지 목록의 글쓰기/수정 버튼 — 관리자 셸을 벗어나는 유일한 전체 페이지 예외 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-NTC-01 | 노출 조건 | 공개 목록·상세 모두 `is_visible = TRUE` 인 행만. 관리자 화면은 노출 여부와 무관하게 전체를 본다(의도된 설계 — 관리자는 숨긴 공지도 봐야 함) | `NoticeMapper.xml` |
| REQ-NTC-02 | 내부/외부 구분 | `source` 컬럼이 INTERNAL(본문 있음, "사이트 공지")/EXTERNAL(외부 링크 있음, "공식 공지") 둘 중 하나. DB CHECK 제약으로 본문·링크 상호배타를 강제 | `sql/V2/CREATE_04_TABLE_SITE.sql`(`chk_site_notices_source_payload`) |
| REQ-NTC-03 | 정렬 순서 | 정렬 주인은 FE로 확정 — BE는 `is_pinned DESC, published_at DESC, id DESC` 로 참고용으로 내려주고, FE가 `source`별로 나눈 뒤 `id` 내림차순으로 재정렬한다 | `NoticeMapper.xml`, `store/public/thunks.js` |
| REQ-NTC-04 | 고정(pinned) 노출 | DB에는 여러 건이 동시에 고정일 수 있지만, 화면은 배열에서 처음 찾은 고정 공지 1건만 "중요 공지" 카드로 보여준다. 여러 건일 때 우선순위 규칙은 없다 | `useNoticeList.js` |
| REQ-NTC-05 | 관리자·공개 상태 분리 | 관리자·공개 화면은 완전히 분리된 상태를 쓴다 — 어드민이 로그인 중이어도 숨긴 공지나 어드민 오류 문구가 공개 화면에 섞이지 않는다 | `store/slices.js` |
| REQ-NTC-06 | 상세 조회 방식 | 별도 API 없이 목록 데이터에서 slug로 재검색해 표시한다. slug에는 항상 `id` 접미어가 붙어, 제목이 숫자로만 돼 있어도 id로 오인되지 않는다(과거엔 무한 리다이렉트 가능성이 있었음) | `mobile/noticeSlug.js` |
| REQ-NTC-07 | 공개 목록의 본문 제외 | 목록 SQL은 본문(`content`) 컬럼을 포함하지 않고 행 상한(LIMIT 200)을 둔다 — 본문은 상세 진입 시에만 별도 조회 | `NoticeMapper.xml` |
| REQ-NTC-08 | 본문 조회 실패 표시 | 상세 화면에서 본문만 못 불러오면 제목·날짜는 그대로 두고 본문 자리에만 실패 안내(`StateBox`)를 표시한다 | `store/slices.js`(`contentError`), `NoticeDetailScreen.jsx` |
| REQ-NTC-09 | 본문 HTML 살균 | 저장 시 서버가 먼저 살균(`Jsoup Safelist.relaxed()`)한 뒤 빈 문자열 여부를 검증하고(순서 고정), 화면 렌더 시 `DOMPurify` 로 다시 살균한다 — 이중 방어 | `AdminNoticeServiceImpl.java`, `RichContent.jsx` |
| REQ-NTC-10 | 링크 안전 처리 | 본문 안의 `<a>` 태그는 항상 `target="_blank"` + `rel="noopener noreferrer"` 강제 | `RichContent.jsx` |
| REQ-NTC-11 | 외부 공지 카드 접근성 | 외부 공지 카드는 `<a href={externalUrl}>` 로 렌더돼 키보드·스크린리더로도 열 수 있다 | `OfficialNoticeCard.jsx` |
| REQ-NTC-12 | 권한 | 공개 조회는 누구나. 등록/수정/삭제/노출·고정 토글/일괄 작업은 `AdminNoticeController` 클래스 레벨 ADMIN 권한자만 | `AdminNoticeController.java` |
| REQ-NTC-13 | 일괄 처리 부분 실패 | 서버가 구분해 응답하는 `successIds`/`failedIds` 를 화면이 그대로 반영 — 성공분만 반영 + 실패 건수 배너 | `admin/thunks.js` |
| REQ-NTC-14 | 저장 직후 화면 반영 | 등록·수정 후 화면은 폼 입력값이 아니라 서버 응답(등록일·수정일 포함)을 그대로 반영한다 | `admin/thunks.js` |
| REQ-NTC-15 | 캐시 갱신 시점 | 실제 쓰기가 있는 7개 메서드(24곳)가 트랜잭션 커밋 **전**에 `notice`/`noticeDetail` 두 캐시를 비운다 — TTL이 없어 동시 조회가 옛 값을 재채울 위험이 남아 있다(코드 문제, 승인 대기) | `AdminNoticeServiceImpl.java` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 공지 정의 | `site_notices`(`id`, `source` ENUM INTERNAL/EXTERNAL, `title`, `summary` nullable, `content` nullable, `external_url` nullable, `image_url` nullable, `is_visible`, `is_pinned`, `published_at` nullable, `created_at`, `updated_at`) | `published_at` 은 "게시 시각" 설명이 있으나 노출 조건에는 쓰이지 않음(예약 발행 미구현) |
| 공개 목록 | `GET /api/notices` | 인증 불필요 |
| 공개 상세 | `GET /api/notices/{noticeId}` | 인증 불필요, 현재 FE는 호출하지 않음(외부 클라이언트용으로 남음) |
| 관리자 목록 | `GET /api/admin/notices` | ADMIN, 노출 여부 무관 전체 |
| 관리자 단건 | `GET /api/admin/notices/{noticeId}` | ADMIN |
| 등록 | `POST /api/admin/notices` | ADMIN, 저장 시 본문 살균 |
| 수정 | `PUT /api/admin/notices/{noticeId}` | ADMIN, 저장 시 본문 재살균 |
| 노출 토글 | `PATCH /api/admin/notices/{noticeId}/visible` | ADMIN |
| 고정 토글 | `PATCH /api/admin/notices/{noticeId}/pinned` | ADMIN, 화면 어디도 호출하지 않는 미사용 경로(정리 대상, 코드에는 아직 남아 있음) |
| 삭제 | `DELETE /api/admin/notices/{noticeId}` | ADMIN |
| 일괄 삭제 | `DELETE /api/admin/notices/bulk` | ADMIN, 부분 실패 허용 |
| 일괄 노출 변경 | `PATCH /api/admin/notices/bulk/visible` | ADMIN, 부분 실패 허용 |
| 새로고침 | `POST /api/admin/notices/refresh` | ADMIN, `'public'` 키만 좁혀서 비움 |

## 5. 하지 않는 것

- 예약 발행(미래 시각 등록 시 그때까지 숨김) — `published_at` 컬럼은 있으나 노출 조건에 쓰지 않는다. 등록 UI에도 발행일시 입력 자체가 없다.
- 진짜 서버 페이지네이션 — 공개 목록은 LIMIT 200 고정이며, 200건을 넘어서면 오래된 공지가 목록·slug 조회에서 빠진다.
- 여러 고정 공지의 우선순위 규칙 — 배열에서 먼저 발견된 1건만 쓴다.

## 6. 확인 필요

❓ 공지 수가 200건을 넘어서는 시점에 진짜 페이지네이션 UI를 도입할지는 기획 결정 사안이다(REQ-NTC-07 관련).

❓ 캐시 커밋 전 evict(REQ-NTC-15)의 최종 안전판(TTL)은 운영 설정 변경 승인 대기 사안이다.

🟨 `PATCH /{noticeId}/pinned` 미사용 API·관련 썽크 삭제는 방향은 확정됐으나 코드 정리가 아직 반영되지 않았다.

---
feature: quiz
version: 1.0.3
status: active
created: 2026-03-29
updated: 2026-09-28
---

# quiz

## 1. 무엇을 하는 기능인가

관리자가 회차(`round`)와 정답 이미지를 등록하면 홈 화면에 최신 1건이 노출되는 게임 내 "컴프야 퀴즈" 이벤트다. 문항·선택지·정답 텍스트가 없고, 사용자가 응시하거나 채점받는 기능도 없다 — 정답 이미지만 게시하는 것이 확정 사양이며 구현 누락이 아니다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 홈 퀴즈 섹션 (SC-07-01 내부) | `/` (홈 화면 내 섹션, 독립 경로 없음) | 홈(SC-07-01) 마운트 시 자동 노출 |
| 관리자 — 퀴즈 관리 (SC-01-01 내부 탭) | `/admin/quiz` | 관리자 셸(SC-01-01) 상단 탭 |

퀴즈 전용 독립 공개 화면은 만들지 않기로 확정됐다 — 홈 섹션 하나로 끝나는 것이 정해진 범위다.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-QZ-01 | 최신 노출 기준 | `round` 내림차순 최신 1건을 홈에 노출한다(과거엔 등록 순서인 `id` 내림차순이라 회차를 역순으로 백필하면 어긋났으나, 회차가 도메인의 유일한 순서 축이라 수정됨) | `QuizMapper.xml`(`selectLatestVisible`, `ORDER BY round DESC`) |
| REQ-QZ-02 | 회차 유일성 | `round` 는 `UNIQUE KEY uq_round` — 중복 등록 시 409(`QUIZ_ROUND_DUPLICATED`) | `sql/V3/CREATE_05_fun.sql`, `QuizAdminServiceImpl.java` |
| REQ-QZ-03 | 제목은 저장값이 아님 | 응답마다 `"🎉컴프야 퀴즈 이벤트 {round}회 정답"` 형태로 서버가 합성한다 | `QuizMapStruct.java` |
| REQ-QZ-04 | 노출 토글 없음 | `is_visible` 컬럼은 폐기됐고(V3에서 DROP) 모든 행이 노출 대상이다 — 대응 FE 토글 UI도 없음 | `sql/V3/CREATE_05_fun.sql` |
| REQ-QZ-05 | 부분 수정 | 회차만, 또는 이미지 URL만 보내 수정해도 안 보낸 필드는 기존 값을 유지한다(과거엔 빈 값으로 덮어써지거나 둘 다 안 보내면 500이었음) | `QuizMapStruct` 매핑 옵션, `QuizAdminServiceImpl.java` |
| REQ-QZ-06 | 회차 입력 하한 | 관리자 화면 회차 입력은 `min="1"` 로 브라우저가 차단, 서버도 `@Min(1)` 검증 | `AdminQuizScreen.jsx`, `QuizRequest.java` |
| REQ-QZ-07 | 이미지 URL 필수 여부 | DB는 `image_url NOT NULL` 인데, 관리자 화면 입력창에는 아직 `required` 가 없다 — FE에서도 필수로 강제하는 방향이 확정됐으나 반영 전 | `sql/V3/CREATE_05_fun.sql`, `AdminQuizScreen.jsx`(회차만 `required`) |
| REQ-QZ-08 | 등록·수정 직후 화면 반영 | 목록은 폼 입력값이 아니라 서버 응답(합성 제목·저장 시각 포함)을 그대로 반영한다 | `admin/thunks.js` |
| REQ-QZ-09 | 빈 테이블 캐시 | 퀴즈가 0건이어도 조회 결과가 `null`로 정상 캐시에 올라간다(과거엔 예외를 던져 캐시가 전혀 안 탔음). "없으면 404" 판정은 컨트롤러가 한다 | `QuizUserServiceImpl.java` |
| REQ-QZ-10 | 권한 | 공개 조회(`/api/quiz/latest`)는 누구나. `AdminQuizController` 전체는 ADMIN 권한자만 | `AdminQuizController.java` |
| REQ-QZ-11 | 삭제 방식 | 삭제 표시 컬럼 없이 행을 실제로 지운다(하드 삭제) — 유일 제약과 충돌할 옛 행이 남지 않아 공지·이벤트에서 있는 "삭제 코드 재등록 충돌"이 없다 | [0004](../../decisions/0004-soft-delete-boundary.md) |
| REQ-QZ-12 | 캐시 갱신 시점 | 쓰기 메서드 4곳(8곳)이 트랜잭션 커밋 **전**에 캐시를 비운다 — TTL이 없어 이론적으로 옛 값이 재채워질 위험이 남아 있다(코드 문제, 승인 대기) | `QuizAdminServiceImpl.java` |
| REQ-QZ-13 | 정답 이미지 공개 시점 통제 없음 | 저장 즉시 전체 공개되며, 화면 문구는 "매주 금요일 12시 공개"를 약속한다. 공개 시각을 담을 컬럼이 없어 DB 구조 변경(컬럼 추가)이 필요하다 — 사용자 승인 사안 | `fun_quiz` 테이블, 화면 안내 문구(`QuizSection.jsx`) |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 퀴즈 회차 | `fun_quiz`(`id`, `round` UNIQUE, `image_url` NOT NULL, `created_at`, `updated_at`) | 문항·선택지·정답 텍스트 컬럼 없음(확정 사양) |
| 최신 조회 | `GET /api/quiz/latest` | 인증 불필요, `round DESC` 1건 |
| 관리자 목록 | `GET /api/admin/quiz` | ADMIN, 전체 목록 |
| 등록 | `POST /api/admin/quiz` | ADMIN |
| 수정 | `PATCH /api/admin/quiz/{id}` | ADMIN, 부분 수정 |
| 삭제 | `DELETE /api/admin/quiz/{id}` | ADMIN, 하드 삭제 |
| 일괄 삭제 | `DELETE /api/admin/quiz/bulk` | ADMIN, 부분 실패 허용 |
| 이미지 업로드 | `POST /api/upload/events` | ADMIN, 공용 업로드 API(S3), quiz 전용 엔드포인트 아님 |

## 5. 하지 않는 것

- 사용자 응시·채점·보상 지급 — 저장소 전체에 참여 기록 테이블·제출 API·적립 연동이 없다. "정답 : 100스타" 문구는 화면 안내일 뿐 뒷단 구현 대상이 아니다.
- 퀴즈 전용 독립 공개 화면 — 홈 섹션 하나로 끝나는 것이 확정된 범위다.
- 다음 회차 자동 제안(DDL 주석에 남은 "round+1 자동 제안") — 폐기 확정, 실제 구현 없음.
- 퀴즈 이름 재명명 — "퀴즈" 명칭·정답 이미지만 게시하는 형태 유지가 확정 사양이다.

## 6. 확인 필요

🔴 정답 이미지 공개 시점 통제(REQ-QZ-13)는 `fun_quiz` 테이블에 컬럼을 추가해야 한다 — DDL 변경은 test=운영 동일 인스턴스라 사용자 승인이 먼저 필요하다. 승인 전까지는 "다음 회차 정답을 미리 입력하지 않는다"는 운영 규칙으로 대응한다.

❓ 이미지 URL 화면 필수화(REQ-QZ-07)는 방향은 확정됐으나 코드 반영 전이다.

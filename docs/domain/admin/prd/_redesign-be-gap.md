# 어드민 재디자인 — 서버 작업 목록

기준: `_api-inventory.md`(기존 API 조사) + `design_handoff_admin/README.md`(재디자인 명세) 대조.

## 요약 (있음/없음 매트릭스)

| 기능 | 퀴즈 | 이벤트 | 쿠폰 | 공지 | 유저 |
|---|---|---|---|---|---|
| 목록 total count | 없음 | 없음 | 없음 | 없음 | 없음 |
| 서버 검색/필터/정렬 | 없음(전량) | 일부(type/visible) | 없음(전량) | 일부(source/visible/pinned) | 일부(nickname/role/status) |
| 일괄 삭제 | 없음 | 없음 | 없음 | 없음 | 없음 |
| 일괄 숨김 | 없음 | 없음 | 없음 | 없음 | 없음 |
| 개별 노출 토글 | **없음(필드 자체 없음)** | 있음 | 있음 | 있음 | 해당없음(상태변경으로 대체) |
| 상단 고정 토글 | - | - | - | 있음(BE, FE 미연결) | - |

## 새로 만들어야 하는 API

### 공통 — 목록 total count (5개 도메인 전부)
프로토타입이 번호식 페이지네이션(8개/페이지)을 쓴다. 현재 5개 도메인 모두 count 쿼리가 없다(이벤트/유저는 이미 페이징 파라미터는 받지만 count 없음, 퀴즈/쿠폰/공지는 페이징 자체가 없음).
- 필요 작업: `SELECT COUNT(*)` 매퍼 추가 + 응답에 `totalCount`(또는 `totalPages`) 포함. 이벤트·유저는 매퍼/쿼리 파라미터가 이미 있어 count 만 추가하면 됨. 퀴즈·쿠폰·공지는 페이징 파라미터(`page`/`size`) 자체부터 추가해야 함.
- 난이도: 낮음(이벤트/유저) / 중간(퀴즈/쿠폰/공지 — 페이징 신규)
- DB 변경: 불필요

### 공통 — 일괄 삭제 / 일괄 숨김 (5개 도메인 전부)
`DELETE /api/admin/{domain}/{id}`, `PATCH /api/admin/{domain}/{id}/visible` 형태의 단건 API만 있고, 여러 id 를 한 번에 처리하는 API 가 전혀 없다(전 컨트롤러 확인 완료 — bulk/batch 엔드포인트 0개).
- 필요 작업: `DELETE /api/admin/{domain}/bulk` (`{ ids: number[] }` body) + `PATCH /api/admin/{domain}/bulk/visible` 신규. 유저는 노출 개념이 없어 일괄 삭제/숨김 대상에서 제외(유저는 원래 삭제 API 자체가 없음).
- 난이도: 낮음(기존 단건 로직 반복 처리로 구현 가능, 서비스 레이어에 for-loop 또는 IN 절 매퍼 추가)
- DB 변경: 불필요

### 퀴즈 — 노출(visible) 필드 자체가 없음
`fun_quiz` 테이블에 `id/round/image_url/created_at/updated_at` 만 있다. `visible` 컬럼이 DB·엔티티·응답 DTO 어디에도 없다. **주의**: `QuizVisibleRequest.java` 라는 DTO 파일은 존재하지만 컨트롤러에 `/visible` 엔드포인트가 없어 죽은 코드다 — 과거 작업 흔적으로 보임, 실제로 동작하지 않는다.
- 필요 작업: `fun_quiz` 에 `visible` 컬럼 추가 + `PATCH /api/admin/quiz/{id}/visible` 엔드포인트 연결(DTO는 이미 있음) + 목록/등록/수정 응답에 `visible` 반영.
- 난이도: 중간
- **DB 변경 필요 [확인필요]**: `fun_quiz.visible BOOLEAN` 컬럼 추가

### 퀴즈 — 홈 노출 규칙이 명세와 다르게 구현됨
`QuizUserServiceImpl.getLatest()` → `QuizMapper.selectLatestVisible()` 확인 결과, 이름과 달리 **`ORDER BY id DESC LIMIT 1`** 뿐이다. `visible` 필터도 없고(애초에 컬럼이 없음), `image_url IS NOT NULL` 체크도 없고, 정렬도 `round` 가 아닌 `id` 기준이다. 프로토타입 규칙(회차+이미지+노출 ON 중 가장 큰 회차 1개)과 불일치.
- 필요 작업: 위 visible 컬럼 추가와 함께 쿼리를 `WHERE visible = true AND image_url IS NOT NULL ORDER BY round DESC LIMIT 1` 로 수정.
- 난이도: 낮음(쿼리 수정)
- DB 변경: 위 항목과 동일 건

### 퀴즈 — 회차 자동 부여 (`max(round)+1`)
`QuizAdminServiceImpl.createQuiz()` 에 자동 부여 로직이 없다. `QuizRequest.round` 를 그대로 저장할 뿐(null 이면 `insertQuiz` 가 `round=null` 로 시도 → UNIQUE 제약과 무관하게 그냥 실패하거나 null 저장).
- 필요 작업: `round` 가 null 로 오면 서버가 `SELECT MAX(round)+1` 계산 후 저장하는 분기 추가(프론트 "자동 부여 ON" 체크 시 round 를 아예 안 보내는 방식과 맞춤).
- 난이도: 낮음
- DB 변경: 불필요

### 공지 — 상단 고정 토글 · 단건조회 · 삭제 FE 미연결 (BE는 이미 존재)
`_api-inventory.md` 에 이미 정리됨. 재확인 완료 — `PATCH /{noticeId}/pinned`, `GET /{noticeId}`, `DELETE /{noticeId}` 3종 모두 BE 존재. 신규 BE 개발 불필요.

### 홈 탭 — "지금 홈에 노출 중" 요약 API
전 컨트롤러 대상 `summary`/`dashboard` 검색 결과 어드민 요약 API 없음(무관한 `NoticeSummaryResponse` 하나만 검색됨, 공지 공개목록용).
- 대안: 기존 API 조합으로 클라이언트에서 계산 가능 — 퀴즈는 목록에서 최대 round(단, 위 visible 버그 먼저 고쳐야 정확), 이벤트는 목록+visible 필터로 진행중 카운트, 쿠폰은 목록+expireAt 비교로 사용가능 카운트, 공지는 목록+isPinned 필터로 고정 제목. 신규 BE 없이도 가능하나 **요청이 4~5개로 분산**된다.
- 신규 전용 API(`GET /api/admin/home/summary`)를 만들면 요청 1개로 축소 가능. 우선순위는 낮음(성능 이슈가 아니면 클라이언트 조합으로 충분).
- 난이도: 낮음~중간
- DB 변경: 불필요

## 기존 API 로 대체 가능한 것

- **쿠폰 만료 필터(사용가능/만료)** — 서버 판단 로직 없음. 하지만 목록 API 가 전량(`List<CouponResponse>`)을 내려주고 각 항목에 `expireAt` 이 있으므로, 클라이언트에서 `expireAt > now()` 비교로 칩 필터링 가능. 데이터량이 적은 지금은 서버 작업 불필요.
- **쿠폰/퀴즈 검색·정렬** — 두 도메인 다 전량 조회이므로 검색/정렬은 클라이언트 처리로 충분(위 count/페이징 항목과 별개로, 검색 자체는 신규 API 없이 가능).
- **이벤트 진행중/종료 칩** — `visible` + `expireAt` 조합을 클라이언트에서 계산 가능, 서버 판단 불필요.

## DB 스키마 변경이 필요한 항목

- **[확인필요] `fun_quiz.visible BOOLEAN` 컬럼 추가** — 프로토타입의 퀴즈 노출 토글·홈 노출 규칙 전체가 이 컬럼에 의존한다. 컬럼이 생기기 전까지는 퀴즈 노출 토글 UI 자체를 만들 수 없다(값을 저장할 곳이 없음).
- 그 외 4개 도메인(이벤트/쿠폰/공지/유저)은 스키마 변경 불필요 — 필요한 필드가 이미 다 있음.

## 주의 / 사용자 확인 필요

- **퀴즈 visible 컬럼 추가는 DB 마이그레이션이라 스스로 결정하지 않음.** 컬럼 추가 여부·기본값(신규/기존 row 모두 `true` 로 둘지)·마이그레이션 타이밍 사용자 확인 필요.
- **`QuizVisibleRequest.java` 는 죽은 코드** — 위 컬럼 추가 시 재사용하면 되지만, 지금 상태로는 아무 데도 연결 안 돼 있다는 점을 재설계 착수 전 알아둘 것.
- **`QuizMapper.selectLatestVisible()` 이름과 동작 불일치** — 이름은 "visible 최신"이지만 실제로는 단순 `id DESC LIMIT 1`. visible 컬럼 추가 시 반드시 같이 고칠 것(안 고치면 홈 화면에 숨김 처리한 퀴즈가 계속 노출됨).
- **이벤트 `eventType`(OFFICIAL/INTERNAL) vs 프로토타입 "출처 공식 고정"** — DB/API 는 이미 두 타입 다 지원한다(스키마 변경 불필요). 프로토타입은 등록 폼에 출처 필드를 아예 안 두고 "공식"으로 고정하겠다는 뜻인데, 이는 FE 정책 결정 사항(등록 시 `eventType=OFFICIAL` 고정 전송)이지 BE 변경 대상 아님. INTERNAL 타입을 앞으로 아예 안 쓸지, 남겨둘지는 기획 확인 필요.
- **이미지 업로드 엔드포인트가 `/api/upload/events` 로 이벤트 전용처럼 명명돼 있으나 실제로는 범용**(도메인 검증 로직 없음, 확장자 화이트리스트: jpg/jpeg/png/gif/webp, 용량 5MB, 매직넘버 검증까지 있음). 공지 본문 이미지 삽입에 **그대로 재사용 가능**하나 경로명이 오해 소지 있음 — 그대로 쓸지 `/api/upload/images` 로 리네이밍할지는 결정 필요(리네이밍은 사소한 BE 변경이지만 FE 동시 수정 필요).
- **유저 상태 ENUM**: `ACTIVE`/`BLOCKED`/`WITHDRAWN`/`SUSPENDED` 4종, 프로토타입의 활성/비활성/탈퇴/영구정지와 1:1 대응(BLOCKED=비활성, SUSPENDED=영구정지로 매핑 추정) — 스키마 변경 불필요, 라벨 매핑만 FE에서 하면 됨.

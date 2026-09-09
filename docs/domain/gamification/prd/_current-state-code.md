# 게이미피케이션 도입 전 현황 실측 (코드 기반, read-only)

> 조사일 2026-09-04. 기획/코드수정 없음 — 실측 보고서.
> 대상: `src/main/java/**`(BE), `web/src/**`(FE), `sql/V2/**`, `docs/global-guide/develop/specs/db/*.md`

---

## § 1. 유저 계정 실측

### 1.1 `site_users` 테이블 (`sql/V2/site/CREATE_TABLE_SITE.sql:67`)

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | BIGINT PK | |
| oauth_provider | VARCHAR(20) NOT NULL | 현재 `NAVER` 유일 |
| oauth_provider_id | VARCHAR(100) NOT NULL | |
| oauth_nickname / oauth_email / oauth_profile_image / oauth_age_range | VARCHAR | OAuth 원본 스냅샷 |
| service_nickname | VARCHAR(20) NULL | 서비스 자체 닉 (미설정 NULL) |
| user_role | ENUM(ADMIN,USER) DEFAULT USER | |
| user_status | ENUM(ACTIVE,BLOCKED,WITHDRAWN,SUSPENDED) DEFAULT ACTIVE | |
| created_at / updated_at / last_login_at | DATETIME | `last_login_at` 존재 — 연속로그인 업적의 기반 컬럼 후보 |
| UNIQUE | `(oauth_provider, oauth_provider_id)` | |

운영 실측(`prod-actual-state.md:84`): `site_users` 123 rows (2026-08-20 스냅샷). 별도 `user_roles`/`users`(legacy)는 이전 완료.

`site_refresh_tokens` (`sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql`) — refresh token SHA-256 hash 저장, `user_id→site_users` FK, rotation 방식(DELETE+INSERT). 운영 2 rows.

### 1.2 로그인 방식 / 세션 유지

- 소셜 로그인만 존재, provider는 **네이버 단일** (`OAuthProvider` enum, `NaverOAuthService`)
- 흐름: `AuthController.naverCallback` (`src/main/java/.../oauth/controller/AuthController.java:33`) → `AuthService.loginWithNaver` → access/refresh 쿠키 발급
- 인증 채널: **HttpOnly 쿠키 단일** — `Authorization` 헤더 차단 (`JwtAuthFilter.resolveToken`, `security/filter/JwtAuthFilter.java:67`)
- access token: `ACCESS_TOKEN` 쿠키, 매 요청 `JwtAuthFilter`가 검증 후 `request.setAttribute("userId", ...)` — 이 attribute 가 전 도메인 공통 "로그인 유저 식별자" 진입점
- session 자체는 STATELESS (`SecurityConfig.java:47`) — 서버 세션 없음, JWT + refresh DB row 만

### 1.3 로그인 필요 기능 (실측)

| 기능 | 근거 |
|---|---|
| `/api/users/me` 조회/수정/탈퇴 | `UserController.java:29,40,53` — `requireUserId` |
| 게시글 좋아요/싫어요 (`PostReactionController`) | `savePostReaction`/`deletePostReaction` — `requireUserId` |
| 댓글 좋아요/싫어요/작성/수정/삭제 (`CommentController`) | `CommentController.java:40,42,47,51,80,82` |
| 댓글 반응 (`CommentReactionController`) | `CommentReactionController.java:37,40,44,47` |
| 신고 (`ReportController`) | `ReportController.java:25,29,31` |
| `/api/admin/**`, `/api/upload/**` | `SecurityConfig.java:62-63` — `hasRole("ADMIN")` |

⭐ 그 외 전체 (`quiz`, `coupon`, `event`, `notice`, `historyMode`, `legendCard` 등)는 `SecurityConfig.java:64` `permitAll` — 비로그인 접근 가능.

---

## § 2. 기존 유저 행동 기록 자산

DB에 **유저 행동이 실제로 남는 테이블**은 다음 2종뿐:

| 테이블 | 이벤트 | 쌓이는 시점 | 운영 row 수 |
|---|---|---|---|
| `site_post_reaction` | 게시글 좋아요/싫어요 | `PostReactionController.savePostReaction` 호출 시 | **0** (`prod-actual-state.md:94`) |
| `site_comment_reaction` | 댓글 좋아요/싫어요 | 동일 패턴 | **0** (`:95`) |
| `site_report` | 신고 | `ReportController` POST 시 | **0** (`:96`) |
| `site_post` / `site_comment` | 유저 작성 글/댓글 | 작성 API 호출 시 | **0** (`:90,93`) |

그 외:
- **퀴즈**: `fun_quiz` 테이블에 유저 응답/정답 기록 컬럼 자체가 없음 (`round`, `image_url`, `is_visible`만). `QuizController`(`quiz/controller/QuizController.java`)는 `GET /api/quiz/latest` 단일 — **제출 API 없음**. 응답은 서비스 밖(오프라인/타 채널)에서 처리되는 것으로 추정.
- **쿠폰**: `CouponController`는 `GET /api/coupons` 단일 조회만. 발급/사용 로그 테이블 없음.
- **이벤트**: `site_events`에 `user_id` 컬럼 없음, 참여/클릭 기록 테이블 없음.
- **방문/조회 로그**: `AccessLogFilter`(`config/filter/AccessLogFilter.java:47`)가 있으나 `log.info`로 **애플리케이션 로그 파일에만 기록**, DB 미저장. 조회수는 `site_post.view_count` 컬럼 하나만 예외적으로 DB에 누적 (`PostService.getPostDetailAndIncreaseViewCount`).

**결론: 로그인 유저의 실제 행동 이력이 DB에 남는 자산은 사실상 없음** (해당 API 존재하나 운영 트래픽 0건). 추측 아님 — `prod-actual-state.md` row count 실측.

---

## § 3. 게이미피케이션 hook 후보 (실측 기반)

| 접점 | 위치(파일:라인) | 로그인 필요 | 현재 DB 기록 여부 | 업적 트리거 가능성 |
|---|---|---|---|---|
| 네이버 로그인 성공 | `AuthController.java:33` (`naverCallback`) | - | `site_users.last_login_at` 갱신 (실제 갱신 코드는 `AuthServiceImpl` 내부, 본 조사에서 라인 미확인) | 상 — 연속로그인 업적 기반 컬럼 존재 |
| 게시글 좋아요/싫어요 | `PostReactionController.java:37` | 필요 | O (row 0건이지만 테이블 有) | 상 |
| 댓글 좋아요/싫어요 | `CommentReactionController.java:37,44` | 필요 | O (0건) | 상 |
| 댓글 작성/수정/삭제 | `CommentController.java:40,47,80` | 필요 | O (0건) | 상 |
| 게시글 조회 | `PostController.getPostDetail` (`PostController.java:44`) → `PostService.getPostDetailAndIncreaseViewCount` | 불필요 | O (`site_post.view_count`, 유저 unit 아닌 글 unit) | 하 — 유저별 식별 안 됨 |
| 신고 | `ReportController.java:25,29` | 필요 | O (0건) | 중 (악용 방지 설계 필요) |
| 닉네임 변경 | `UserController.java:40` (`updateMe`) | 필요 | O (`site_users.service_nickname`) | 하 (1회성) |
| 회원 탈퇴 | `UserController.java:53` | 필요 | O (`user_status=WITHDRAWN`) | - |
| 퀴즈 열람 | `QuizController.java:22` | 불필요 | X (제출 자체가 없음) | 하 — 신규 제출 API 설계 필요 |
| 쿠폰 열람 | `CouponController.java:22` | 불필요 | X | 하 |
| 외부 이벤트 열람 | `EventController.java:22` | 불필요 | X | 하 |
| 히스토리 모드 / 레전드 재료 탐색 (인기 페이지 상위권) | `FunHistoryModeController.java`, `FunPlayerLegendController.java` | 불필요 | X (조회 전용, 유저 식별 없음) | 하 — 현재 구조로는 트리거 불가, 클라이언트 이벤트 신설 필요 |

⭐ 공통 패턴: 로그인 필요 API는 전부 `request.getAttribute("userId")` 방식 재사용 중 — 신규 업적 API도 동일 패턴으로 붙이면 인증 배관은 재사용 가능. 단 **트래픽 자체가 0건**이라 "이미 쌓인 데이터로 업적 소급 부여"는 불가능, 신규 도입 시점부터 카운트 시작해야 함.

---

## § 4. 유저 생성/수정 가능 데이터 현황

- 현재 유저가 직접 입력·수정 가능한 것: **닉네임 하나뿐** (`UserController.updateMe`, `site_users.service_nickname`)
- 프로필 이미지 등은 OAuth 스냅샷(`oauth_profile_image`)만 있고 유저가 직접 바꾸는 기능 없음

### community 도메인 "동결" 실측

| 레이어 | 상태 |
|---|---|
| DB 테이블 | 전부 존재하고 운영 스키마에 생성됨 (`site_post`, `site_comment`, `site_post_reaction`, `site_comment_reaction`, `site_report`, `site_board`, `site_tag`) — 단 전부 **0 rows** (`prod-actual-state.md:90-96`) |
| BE API | 조회 API(`PostController` 등)는 완성, **쓰기 API도 이미 구현되어 있음** (댓글 작성/반응/신고 — `CommentController`, `PostReactionController`, `ReportController`가 실제 로직 보유, 인증 체크까지 붙어있음) |
| FE (모바일, 현재 라이브) | `PublicRoutes.jsx:21` 주석: "2026-08-31 읽기 전용 재오픈 (글쓰기/댓글/좋아요는 서버 인증 정비 후)". `community/mobile/CommunityScreen.jsx`는 **Redux 미사용, mock 데이터**(`@/data/community/*.js`) 기반 (`community/README.md:87,30`). BE 미연결 상태 |
| FE (PC/admin, `feature/`,`page/`) | 별도 코드 존재, BE 연동됨 (관리자용) — README에 "이번 작업 대상 아님"으로 명시, 모바일과 분리 |
| 미구현 명시 항목 | `community/README.md:145` "글쓰기 / 좋아요 / 싫어요 / 댓글 입력" — 모바일 FAB 버튼은 있으나 `TODO` 주석으로 액션 미연결 |

**요약**: community는 "BE 코드가 없어서 동결"이 아니라 **BE는 완성, 모바일 FE 미연결 + 실사용 데이터 0건**인 상태. 게이미피케이션에 "댓글/좋아요 활동 업적"을 얹으려면 이 도메인의 FE-BE 연결이 선행돼야 실제 이벤트가 발생함.

---

## § 5. 광고 관련 흔적

- `web/index.html`에 **AdSense 계정 메타 태그 이미 존재**: `<meta name="google-adsense-account" content="ca-pub-8723423525807131">` (라인 39)
- 같은 파일에 자동광고 스크립트 로드 (`pagead2.googlesyndication.com/.../adsbygoogle.js?client=ca-pub-8723423525807131`, 라인 45)
- 주석(라인 42-44): "2026-08-30 반려 사유가 '게시자 콘텐츠가 없는 화면에 Google 게재 광고'였다. 수동 슬롯(`<ins class="adsbygoogle">`)이 없어 자동광고가 빈 화면에도 광고를 넣던 것이 원인." → **AdSense 심사 1회 반려 이력 있음**, 현재 자동광고 방식 유지 중으로 보임(수동 슬롯 삽입 여부는 컴포넌트 레벨 미확인)
- GA(`gtag`, `G-KCC3QTZWZW`)와 GTM(`GTM-KX7TBGFX`)도 별도로 붙어 있음 (§배경의 GA 수치 출처로 추정)
- `web/src/infra/analytics/ga.js`, `README.md` 존재 — GA 커스텀 이벤트 전송 인프라 기존재. 게이미피케이션 이벤트도 이 경로 재사용 가능해 보이나 이벤트 종류는 본 조사에서 상세 확인 안 함(미확인)

---

## § 6. 신규 테이블 추가 시 제약

### 6.1 Mapper 구조

- 경로 컨벤션: `mapper/{site|fun}/{domain}/{Name}Mapper.xml` (Java interface는 `domain/{site|fun}/{domain}/repository/mapper/{Name}Mapper.java`)
- 예시 3개: `mapper/site/community/PostReactionMapper.xml`, `mapper/site/oauth/RefreshTokenMapper.xml`, `mapper/fun/quiz/QuizMapper.xml`
- ⚠ 기존 결함: `mapper/fun/playerCard/*.xml`은 namespace 불일치로 바인딩 안 되는 사례 존재 (`docs/global-guide/develop/specs/db/tables.md:86-90`) — 신규 mapper 작성 시 namespace = Java 인터페이스 FQCN 재확인 필수

### 6.2 SQL 파일 네이밍

- `sql/V2/site/CREATE_TABLE_SITE.sql` (전체 테이블 1파일에 순차 DDL)
- `sql/V2/fun/CREATE_TABLE_FUN.sql`
- `sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql` (V3부터 테이블 단위 개별 파일로 분리되는 추세)
- 신규 게이미피케이션 테이블은 `sql/V3/{site|fun}/CREATE_TABLE_{NAME}.sql` 개별 파일 패턴이 최신 관례로 보임(미확정 — 결정 필요 사안)

### 6.3 site DB / fun DB 분리 사유

- 코드/문서상 **명시적 사유 서술은 발견 못함** (미확인). 다만 실질 사용 패턴상: `site_*` = 운영 콘텐츠(유저/게시판/공지/쿠폰/이벤트), `fun_*` = 게임 콘텐츠(카드/팀/퀴즈/히스토리모드) 로 관례적 구분. `docs/global-guide/develop/specs/db/tables.md:11,61`의 섹션 제목("V2 site_ (운영 콘텐츠)" / "V2 fun_ (게임 콘텐츠)")이 유일한 근거이며 물리적으로 같은 스키마(`compyafun`) 내 prefix 구분으로 보임(별도 DB 인스턴스 분리 여부는 미확인).
- 게이미피케이션 테이블(업적/포인트)은 유저(site_users) FK가 필요하므로 **site_ prefix**가 자연스러움. `fun_` 소속 콘텐츠(카드/스킬)와 연동되는 트리거라면 조인 필요 — 스키마가 같다면 문제 없음.

### 6.4 공통 컬럼 체크리스트 (기존 문서 인용, `tables.md:164-170`)

- `id BIGINT AUTO_INCREMENT PRIMARY KEY`, `created_at`/`updated_at` 자동 컬럼, FK `ON DELETE CASCADE` 명시, ENUM은 Java enum과 이름/순서 일치 필수(기존에 2건 불일치 사례 있음 — 반면교사)

---

## § 7. 자체 평가

### 확인 못 한 것 / 추측

| 항목 | 상태 |
|---|---|
| `AuthServiceImpl` 내부에서 `last_login_at` 실제 갱신 로직 라인 | 미확인 (파일 존재는 확인, 라인 단위 미열람) |
| site DB / fun DB가 물리적으로 다른 인스턴스인지 같은 스키마 내 구분인지 | 미확인 — `compyafun` 단일 스키마명만 확인됨, 추가 검증 필요 |
| GA 커스텀 이벤트 종류(`infra/analytics/ga.js` 상세) | 미확인 — 파일 내용 미열람 |
| AdSense 수동 슬롯이 현재 화면에 실제로 삽입됐는지 | 미확인 — index.html 스크립트 로드만 확인, 컴포넌트 레벨 `<ins>` 태그 사용처 미검색 |
| 퀴즈 정답 제출/채점이 서비스 밖 어디서 이뤄지는지 (댓글? 외부 링크?) | 미확인 — 추측 금지, "확인 안 됨"으로만 기재 |

### 게이미피케이션 도입 시 가장 큰 기술적 걸림돌 3가지

1. **행동 데이터 자산이 사실상 0건** — API/테이블은 있지만 `site_post`, `site_post_reaction`, `site_comment_reaction`, `site_report` 운영 row 수가 전부 0 (`prod-actual-state.md:90-96`). 업적을 "이미 한 행동"에 소급 적용할 근거가 없고, 신규 도입 시점부터 처음 쌓아야 함.
2. **community 모바일 FE가 mock 데이터 기반이라 실제 유저 액션이 서버에 도달하지 않음** — BE 인증/쓰기 API는 완성돼 있으나 (`PostReactionController`, `CommentController`) 모바일 FE는 Redux도 안 쓰고 정적 JSON을 쓰는 상태(`community/README.md:87`). 좋아요/댓글 기반 업적을 만들려면 이 FE-BE 연결이 선행 과제.
3. **퀴즈/쿠폰/이벤트가 전부 단방향 조회 API뿐** — 인기 페이지 상위인 퀴즈(`QuizController`)조차 제출 엔드포인트가 없어 "퀴즈 N회 참여" 같은 업적은 신규 API 설계부터 시작해야 함. 로그인 없이도 접근 가능한 콘텐츠(퀴즈/쿠폰/이벤트/히스토리모드/레전드재료 — 트래픽 상위 대부분)가 `permitAll`이라 유저 식별 자체가 안 되는 구조적 한계도 있음.

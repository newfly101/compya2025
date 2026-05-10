# DB tables

> baseline: `sql/V2/{site,fun}/*.sql`, `sql/V3/site/*.sql`, `sql/CREATE_TABLE.sql`(legacy V1), `sql/CREATE_TABLE_KBO.sql`.
> 분류: 🔵 V2 active / 🔵⏸ V2 보류 / 🟢 legacy 운영 / 🟢⚠ legacy 폐기예정 / ⚪ legacy 이전완료 / 🟣 shared(legacy 운영) / 🟣⏸ shared(BE 미연결).

---

## 1. V2 site_ (운영 콘텐츠)

| 테이블 | 정의 | PK | FK | UNIQUE / INDEX | 분류 |
|---|---|---|---|---|---|
| `site_users` | `sql/V2/site/CREATE_TABLE_SITE.sql:67` | id | — | `uk_oauth(oauth_provider, oauth_provider_id)` | 🔵 active |
| `site_coupons` | `sql/V2/site/CREATE_TABLE_SITE.sql:1` | id | — | `coupon_code UNIQUE` | 🔵 active |
| `site_notices` | `sql/V2/site/CREATE_TABLE_SITE.sql:14` | id | — | `idx_visible_pinned_created`, `idx_source`, `idx_published_at`, `chk_source_payload` | 🔵 active |
| `site_events` | `sql/V2/site/CREATE_TABLE_SITE.sql:45` | id | — | `idx_visible_period(is_visible, start_at, expire_at)`, `chk_expire_after_start` | 🔵 active |
| `site_board` | `sql/V2/site/CREATE_TABLE_SITE.sql:105` | id | — | `code UNIQUE`, `idx_board_list(is_deleted, is_visible, sort_order, id)` | 🔵 active |
| `site_post` | `sql/V2/site/CREATE_TABLE_SITE.sql:136` | id | `board_id→site_board` | `idx_post_list`, `idx_post_popular`, `idx_post_author`, `idx_post_report` | 🔵 active |
| `site_comment` | `sql/V2/site/CREATE_TABLE_SITE.sql:183` | id | `post_id→site_post`, `parent_comment_id→site_comment` (self) | `idx_comment_list`, `idx_comment_parent` | 🔵 active |
| `site_tag` | `sql/V2/site/CREATE_TABLE_SITE.sql:220` | id | — | `code UNIQUE` | 🔵 active |
| `site_post_tag` | `sql/V2/site/CREATE_TABLE_SITE.sql:239` | (post_id, tag_id) | `post_id→site_post (CASCADE)`, `tag_id→site_tag` | `idx_post_tag_by_tag(tag_id, post_id)` | 🔵 active |
| `site_post_reaction` | `sql/V2/site/CREATE_TABLE_SITE.sql:257` | id | `post_id→site_post (CASCADE)` | `uq_post_reaction_user(post_id, user_id)`, `idx_post_reaction_user(user_id, post_id)` | 🔵 active |
| `site_comment_reaction` | `sql/V2/site/CREATE_TABLE_SITE.sql:280` | id | `comment_id→site_comment (CASCADE)` | `uq_comment_reaction_user`, `idx_comment_reaction_user` | 🔵 active |
| `site_report` | `sql/V2/site/CREATE_TABLE_SITE.sql:303` | id | — | `uq_report_user_target(target_type, target_id, reporter_id)`, `idx_report_admin`, `idx_report_target` | 🔵 active |
| `site_refresh_tokens` | `sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql:10` | id | `user_id→site_users (CASCADE)` | `uk_refresh_token_hash`, `idx_refresh_user_id`, `idx_refresh_expires_at` | 🔵 active |

### 1.1 site_users — OAuth 사용자

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| oauth_provider | VARCHAR(20) NOT NULL | `NAVER` (현재 유일) |
| oauth_provider_id | VARCHAR(100) NOT NULL | provider 고유 ID |
| oauth_nickname / oauth_email / oauth_profile_image / oauth_age_range | VARCHAR | OAuth 원본 |
| service_nickname | VARCHAR(20) NULL | 서비스 자체 닉 (미설정 NULL) |
| user_role | ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER' | |
| user_status | ENUM('ACTIVE','BLOCKED','WITHDRAWN','SUSPENDED') NOT NULL DEFAULT 'ACTIVE' | |
| created_at / updated_at / last_login_at | DATETIME | |

### 1.2 site_notices — 공지

CHECK 제약: `(source='INTERNAL' AND content NOT NULL AND external_url NULL) OR (source='EXTERNAL' AND content NULL AND external_url NOT NULL)`

서비스 단에서 동일 검증 (`AdminNoticeServiceImpl.validateSourcePayload`) — 이중 안전망.

### 1.3 site_post / site_comment — 카운터 denormalization

`view_count`, `comment_count`, `like_count`, `dislike_count`, `report_count` — 매 조회 COUNT 회피 위해 row 에 누적 컬럼. INSERT/DELETE 시 application 단에서 update 책임 (PostService 카운터 메서드).

### 1.4 site_refresh_tokens

- `token_hash` = SHA-256(raw refresh) hex 64 문자
- 평문 미저장. cookie 의 raw 를 hash 해서 비교
- rotation: refresh 호출 시 기존 row DELETE + 신규 row INSERT
- `revoked_at` NULL = 활성 (현재는 revoked_at 사용 안 함, DELETE 만 함 — 명시적 revocation 미사용)

---

## 2. V2 fun_ (게임 콘텐츠)

| 테이블 | 정의 | PK | FK | UNIQUE / INDEX | 분류 |
|---|---|---|---|---|---|
| `fun_teams` | `sql/V2/fun/CREATE_TABLE_FUN.sql:1` | id | `latest_team_id→fun_teams (self)` | `uk_fun_teams_code_period(team_code, start_year)`, `idx_fun_teams_latest_team_id` | 🔵⏸ V2 보류 (mapper 0건) |
| `fun_player_card` | `sql/V2/fun/CREATE_TABLE_FUN.sql:21` | id | `team_id→fun_teams` | `uk_card_code`, `idx_*_player_id`, `idx_*_team_id`, `idx_*_grade`, `idx_*_role`, `idx_*_grade_year` | 🔵 active ⚠ namespace mismatch |
| `fun_player_card_hitter_stats` | `sql/V2/fun/CREATE_TABLE_FUN.sql:51` | card_id | `card_id→fun_player_card (CASCADE)` | — | 🔵 active ⚠ namespace mismatch |
| `fun_player_card_pitcher_stats` | `sql/V2/fun/CREATE_TABLE_FUN.sql:66` | card_id | `card_id→fun_player_card (CASCADE)` | — | 🔵 active ⚠ namespace mismatch |
| `fun_player_card_pitcher_pitch_grades` | `sql/V2/fun/CREATE_TABLE_FUN.sql:81` | card_id | `card_id→fun_player_card (CASCADE)` | — | 🔵 active ⚠ namespace mismatch |
| `fun_player_card_positions` | `sql/V2/fun/CREATE_TABLE_FUN.sql:101` | id | `card_id→fun_player_card (CASCADE)` | `uk_fun_player_card_positions(card_id, position_code)`, `idx_*_card_id`, `idx_*_position_code` | 🔵⏸ V2 보류 — JSON→정규화 의도, BE 미사용 |
| `fun_quiz` | `sql/V2/fun/CREATE_TABLE_FUN.sql:117` | id | — | `uq_round` | 🔵 active |

### 2.1 fun_player_card

| 컬럼 | 타입 | 설명 |
|---|---|---|
| card_code | VARCHAR(60) UNIQUE | `GRADE_ROLE_TEAM_PLAYER_YEAR` 규칙 |
| player_id | CHAR(36) NULL | UUID. fun_players FK 추후 (현재 미존재) |
| player_name | VARCHAR(50) | |
| team_id | BIGINT NULL | → fun_teams |
| player_role | ENUM(HITTER, PITCHER) | |
| card_grade | ENUM(LEGEND, EPIC, PLATINUM, MVP, NATIONAL, ALLSTAR, GOLDEN) | ⚠ Java enum `CardGrade` 와 불일치 (`dual-management.md` 참조) |
| season_year | SMALLINT | LEGEND=9999, 일반=실연도 |
| overall_rating | SMALLINT | |

### 2.2 ⚠ fun_player_card mapper namespace mismatch

`mapper/fun/playerCard/PlayerCardMapper.xml` 의 namespace 가 `domain.fun.playerCard.mapper.PlayerCardMapper` (존재 안 함) 인데, Java 인터페이스는 `domain.fun.playerCard.repository.mapper.FunPlayerCardMapper`. statement id (`insert/update/findById/findByCardCode/findAll/deleteById`) 가 같음 — 양쪽 클래스 간 바인딩 안 됨. 운영 시 실제 SQL 실행 흐름은 `unused-apis.md` / `dead-suspects.md` 추가 검증 필요.

`PlayerCardHitterStatsMapper.xml`, `PitcherStats`, `PitcherPitchGradesMapper`, `PositionsMapper` 도 같은 mismatch 패턴. → `mapper-mapping.md` 에서 상세.

---

## 3. V1 legacy

| 테이블 | 정의 | 분류 |
|---|---|---|
| `users` | `sql/CREATE_TABLE.sql:205` | ⚪ 이전완료 (→ site_users) |
| `user_roles` | `sql/CREATE_TABLE.sql:222` | ⚪ 이전완료 (→ site_users 흡수) |
| `events` | `sql/CREATE_TABLE.sql:237` | ⚪ 이전완료 (→ site_events) |
| `coupons` | `sql/CREATE_TABLE.sql:255` | 🟢 legacy (`mapper/site/coupon/CouponMapper.xml` 가 `site_coupons` 만 사용 — 사실상 미참조 ❓) |
| `boards` / `posts` / `tags` / `posts_tags` | `sql/CREATE_TABLE.sql:275~357` | ⚪ 이전완료 (→ site_*) |
| `notices` | `sql/CREATE_TABLE.sql:398` | ⚪ 이전완료 (→ site_notices) |
| `quiz_answers` | `sql/CREATE_TABLE.sql:530` | ⚪ 이전완료 (→ fun_quiz) |
| `teams` | `sql/CREATE_TABLE.sql:16` | 🟢 legacy (`mapper/TeamMapper.xml` — Player/Skill 도메인이 사용) |
| `player_legend` | `sql/CREATE_TABLE.sql:37` | 🟢⚠ 폐기예정 — `mapper/player/PlayerCardMapper.xml` 사용 |
| `player_legend_hitter_career` / `player_legend_pitcher_career` | `sql/CREATE_TABLE.sql:70, 107` | 🟢⚠ 폐기예정 — `mapper/player/PlayerCareer.xml` 사용 |
| `legend_pitcher_pitch_slot` | `sql/CREATE_TABLE.sql:141` | 🟢⚠ 폐기예정 (mapper 0건) |
| `player_skills` | `sql/CREATE_TABLE.sql:3` | 🟣 shared 운영 — `mapper/PlayerSkills.xml` |
| `skill_pitcher_grade_stat` | `sql/CREATE_TABLE.sql:179` | 🟣 shared 운영 (mapper 0건 — orphan 의심) |
| `coach` | `sql/CREATE_TABLE.sql:359` | 🟣⏸ shared(BE 미연결로 분류했으나 mapper 존재 — 사용 검증 필요) |
| `coach_skill_condition` | `sql/CREATE_TABLE.sql:369` | 🟣⏸ 동일 |
| `coach_skill_buff` | `sql/CREATE_TABLE.sql:383` | 🟣⏸ 동일 |
| `player_card` | `sql/CREATE_TABLE.sql:420` | 🟢 legacy (V2 `fun_player_card` 와 양쪽 운영) |
| `player_card_hitter_attributes` | `sql/CREATE_TABLE.sql:469` | 🟢 legacy |
| `player_card_pitcher_attributes` | `sql/CREATE_TABLE.sql:485` | 🟢 legacy |
| `skill_score_config` | `sql/CREATE_TABLE.sql:502` | 🟣 shared 운영 |
| `kbo_team_code_mappings` | `sql/CREATE_TABLE.sql:542` | 🔵⏸ 보류 (시드만) |

---

## 4. KBO 신규 (`sql/CREATE_TABLE_KBO.sql`)

| 테이블 | PK | FK | INDEX | 분류 |
|---|---|---|---|---|
| `kbo_seasons` | season_year | — | — | 🔵⏸ |
| `kbo_teams` | team_code | — | — | 🔵⏸ |
| `kbo_games` | game_id | season_year, home_team_code, away_team_code | `idx_games_date`, `idx_games_season`, `idx_games_status`, `idx_games_date_status`, `idx_games_home_team`, `idx_games_away_team` | 🔵⏸ (kbocrol/python 별도 서비스가 사용 추정) |
| `kbo_players` | player_code | team_code | — | 🔵⏸ |
| `kbo_batter_logs` | (game_id, player_code) | game_id, player_code | `idx_batter_logs_player`, `idx_batter_logs_date`, `idx_batter_logs_season`, `idx_batter_logs_team`, `idx_batter_logs_player_date`, `idx_batter_logs_player_opposing` | 🔵⏸ |

> Spring Boot BE 는 KBO 도메인 mapper 미정의. `kbocrol/` (Python) 이 별도 batch 로 적재.

---

## 5. site_post 카운터 갱신 정책

`site_post.{view_count, comment_count, like_count, dislike_count, report_count}` 는 모두 application denormalization. 갱신 주체:

| 카운터 | 갱신 경로 |
|---|---|
| view_count | `PostService.getPostDetailAndIncreaseViewCount` (controller `GET /api/posts/{id}` 진입 시) |
| comment_count | `PostService.increasePostCommentCount/decrease...` (호출 누락 의심 — `dead-suspects.md`) |
| like_count / dislike_count | `PostReactionService` 가 reaction 저장 시 갱신 책임 ❓ — 명시적 호출 grep 필요 |
| report_count | `PostService.increasePostReportCount` (호출 누락 의심) + `CommentController#increaseCommentReportCount` |

---

## 6. CHECK 제약 사용처

| 테이블 | CHECK |
|---|---|
| `site_notices` | `chk_site_notices_source_payload` — INTERNAL ↔ content 필수 / EXTERNAL ↔ external_url 필수 |
| `site_events` | `chk_site_events_expire_after_start` — `expire_at > start_at` |
| `legend_pitcher_pitch_slot` (legacy) | `chk_pitch` — 각 pitch grade 가 'C','B','A','S' 중 하나 또는 NULL |
| `player_card` (legacy) | `chk_grade_year` — LEGEND ↔ season_year NULL / 그 외 ↔ NOT NULL |

---

## 7. 신규 테이블 추가 체크리스트

- [ ] **prefix 결정** — `site_` (운영) / `fun_` (게임) / `kbo_` (KBO 데이터)
- [ ] **CREATE_TABLE_*.sql 위치** — `sql/V{n}/{site|fun}/CREATE_TABLE_*.sql` 또는 별도 신규 sql 파일
- [ ] **공통 컬럼** — `id BIGINT AUTO_INCREMENT PRIMARY KEY`, `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
- [ ] **soft delete 사용 시** — `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`
- [ ] **노출 제어** — `is_visible BOOLEAN NOT NULL DEFAULT TRUE`
- [ ] **목록 정렬 기본** — `is_pinned DESC, created_at DESC, id DESC` 패턴이면 복합 인덱스 추가
- [ ] **ENUM 컬럼** — Java enum 과 이름·순서 일치 확인 (`dual-management.md` 검증)
- [ ] **FK** — `ON DELETE CASCADE` 사용 시 정합성 의도 명시
- [ ] **인덱스** — 외래키 + 검색 패턴별 복합 인덱스 (`(board_id, is_deleted, is_visible, ...)` 같은 prefix-aware)

---

## 8. 일탈 / 이슈

| # | 항목 | 영향 |
|---|---|---|
| 1 | `fun_player_card.card_grade` ENUM ↔ Java `CardGrade` 불일치 (DB: GOLDEN / Java: GOLDENGLUB+HERO+NORMAL) | dual-management.md |
| 2 | `player_skills.grade` ENUM ↔ Java `Grade` 불일치 (DB: 4개, Java: 5개+EPIC) | dual-management.md |
| 3 | `mapper/fun/playerCard/*Mapper.xml` namespace 불일치 | mapper-mapping.md |
| 4 | `coupons` legacy 테이블 — V2 `site_coupons` 와 dual-write 정책 ❓ (코드상 site_coupons 만 사용) | dead-suspects.md |
| 5 | `kbo_team_code_mappings` 시드만 있고 mapper 없음 | 보류 |
| 6 | `legend_pitcher_pitch_slot` mapper 0 건 | dead-suspects |
| 7 | `skill_pitcher_grade_stat` mapper 0 건 | orphan |
| 8 | KBO 테이블 자체 BE Mapper 없음 (kbocrol Python 만) | 의도된 분리 |

---

## 9. 환경 / 연결

- `application.properties` mybatis: `mapper-locations=classpath:mapper/**/*.xml`, `map-underscore-to-camel-case=true`, `default-enum-type-handler=EnumTypeHandler`
- DB driver: `mariadb-java-client`
- HikariCP: `maximum-pool-size=5`, `minimum-idle=5`, `connection-timeout=30000`
- 운영 vs 로컬 DB: 운영 = `application-prod.properties` 평문 직접 (jdbc:mariadb://127.0.0.1:3306/compyafun) — ⚠ 운영 환경에서 외부 DB 인지 검증 필요

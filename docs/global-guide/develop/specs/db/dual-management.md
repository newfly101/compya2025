# DB dual-management

> ⚠️ 2026-08-20: coach/skill(코치) 도메인 서버·DB·시드 완전 삭제됨. 아래 coach 관련 서술은 삭제 이전 기록.

> Java enum ↔ DB ENUM / Java entity field ↔ DB column 정합성 검증.
> baseline: `domain/**/enums/*.java`, `common/enums/`, `sql/**/*.sql`.
> **결정 (2026-08-20)**: kbo 6종 완전 삭제 확정. 아래 kbo_* 예외 서술은 삭제 이전 기록.

---

## 1. ENUM 정합 매트릭스

### 1.1 ✓ 정합 (Java ↔ DB 동일)

| Java enum | DB column | 값 | 위치 |
|---|---|---|---|
| `oauth.UserRole` | `site_users.user_role` | ADMIN, USER | OK |
| `oauth.UserStatus` | `site_users.user_status` | ACTIVE, BLOCKED, WITHDRAWN, SUSPENDED | OK |
| `oauth.OAuthProvider` | (사용 미확인 — `site_users.oauth_provider` VARCHAR 임) | NAVER | DB 가 ENUM 아님 |
| `notice.NoticeSource` | `site_notices.source` | INTERNAL, EXTERNAL | OK |
| `event.EventType` | `site_events.event_type` | OFFICIAL, INTERNAL | OK |
| `community.LinkType` | `site_post.link_type` | INTERNAL, EXTERNAL | OK |
| `community.ReactionType` | `site_post_reaction.reaction`, `site_comment_reaction.reaction` | LIKE, DISLIKE | OK |
| `community.ReportTargetType` | `site_report.target_type` | POST, COMMENT | OK |
| `community.ReportReason` | `site_report.reason` | SPAM, OBSCENE, ABUSE, MISINFORMATION, OTHER | OK |
| `community.ReportStatus` | `site_report.status` | PENDING, REVIEWED, DISMISSED | OK |
| `community.UserRoleType` | `site_post.author_type`, `site_comment.author_type` | ADMIN, USER | OK (별도 enum 정의 — DB enum 동일) |
| `community.ReadRoleType` | `site_board.read_role` | ALL, LOGIN | OK |
| `common.enums.fun.PlayerRole` | `fun_player_card.player_role` | HITTER, PITCHER | OK |
| `common.enums.site.Target` | `player_skills.target`, `skill_score_config.target`, `coach.role`, `coach_skill_*.target` | HITTER, PITCHER | OK (Target 이 PlayerRole 의 site 버전) |
| `skill.CoachPosition` | `coach.position` (VARCHAR(2) — DB 가 VARCHAR) | M, HD, HC, DC, PC, BC | DB 가 ENUM 아님. application 단 검증만 |
| `skill.CoachSkillGrade` | `coach_skill_condition.grade`, `coach_skill_buff.grade` | MASTER, PLATINUM | OK |

### 1.2 ⚠ 불일치 — 즉시 수정 필요

| Java enum | DB column | Java 값 | DB 값 | 차이 |
|---|---|---|---|---|
| **`common.enums.fun.CardGrade`** | `fun_player_card.card_grade` | LEGEND, EPIC, MVP, ALLSTAR, GOLDENGLUB, NATIONAL, PLATINUM, HERO, NORMAL (9개) | LEGEND, EPIC, PLATINUM, MVP, NATIONAL, ALLSTAR, **GOLDEN** (7개) | Java 에만 GOLDENGLUB (오타?), HERO, NORMAL. DB 에는 GOLDEN |
| **`common.enums.site.Grade`** | `player_skills.grade` | LEGEND, EPIC, PLATINUM, HERO, NORMAL (5개) | LEGEND, PLATINUM, HERO, NORMAL (4개) | Java 에 EPIC 있음. DB 에 없음 |

#### 1.2.1 CardGrade 영향

- INSERT 시 Java `CardGrade.GOLDENGLUB` / `HERO` / `NORMAL` 사용 → DB ENUM 위반 → `DataIntegrityViolationException`
- INSERT 시 DB `GOLDEN` 값 (다른 시스템에서 적재 시) → MyBatis EnumTypeHandler 가 Java enum 으로 매핑 시 **`GOLDEN` 이 Java enum 에 없어 IllegalArgumentException**
- **현재 fun/playerCard mapper namespace 가 mismatch 라 실제 SQL 미실행 → 영향 잠복 중**. namespace 수정 직후 폭발

수정 옵션:
- A. Java `CardGrade` 를 DB ENUM 과 동일하게 (LEGEND, EPIC, PLATINUM, MVP, NATIONAL, ALLSTAR, GOLDEN)
- B. DB ENUM 에 GOLDENGLUB / HERO / NORMAL 추가 (또는 GOLDEN ↔ GOLDENGLUB 통일)
- C. Java enum 단계적 정리 — `common.enums.site.Grade` 와 통합

권고: A. + GOLDENGLUB 라는 오타로 보이는 값을 GOLDEN 으로 정정.

#### 1.2.2 Grade (player_skills.grade) 영향

- `player_skills` 테이블에 `grade='EPIC'` row 가 들어가면 DB ENUM 위반
- mapper SELECT 결과가 Java `Grade.EPIC` 으로 매핑되는 경우 없음 (DB 에 EPIC 없음)
- 현재 운영 데이터에 EPIC 미사용 → 잠복

수정: Java `Grade` 에서 EPIC 제거 또는 DB ENUM 에 EPIC 추가.

---

## 2. Java entity field ↔ DB column 정합

### 2.1 ✓ 표준 (underscore↔camelCase)

`mybatis.configuration.map-underscore-to-camel-case=true` 활성. 대부분 자동.

### 2.2 ⚠ 컬럼 alias 오타 (event)

| 위치 | XML | Java field | 영향 |
|---|---|---|---|
| `mapper/site/event/EventMapper.xml:31, 47` | `event_type AS evemtType` | `EventEntity.eventType` | admin select 결과의 `eventType` field 가 항상 null |

### 2.3 ⚠ entity field 누락

| Java entity | DB column | 누락 field |
|---|---|---|
| `QuizEntity` | `fun_quiz.is_visible` | `isVisible` 필드 자체 없음. select 쿼리도 누락 → 노출 제어 무력 |
| `RefreshTokenEntity` | `site_refresh_tokens.revoked_at` | `revokedAt` 필드 정의됨 (코드 존재). 사용 0건 (mapper select 에 미포함) |

### 2.4 ⚠ DB CHECK 제약과 Java validation 이중 관리

| 테이블 | DB CHECK | Java 검증 | 정합 |
|---|---|---|---|
| `site_notices` | `chk_source_payload` (INTERNAL→content 필수, EXTERNAL→externalUrl 필수) | `AdminNoticeServiceImpl.validateSourcePayload` 동일 | OK (이중 안전망) |
| `site_events` | `chk_expire_after_start` (`expire_at > start_at`) | (Java 검증 없음) | DB 에만 의존 → BAD_REQUEST 응답 어려움 (DataIntegrityViolation 500 으로 떨어짐) |
| `player_card` (legacy) | `chk_grade_year` (LEGEND ↔ year NULL) | (Java 검증 없음) | 동일 |
| `legend_pitcher_pitch_slot` | `chk_pitch` (값 'C','B','A','S' 또는 NULL) | (Java 검증 없음) | DB 만 |

권고: DB CHECK 가 있는 컬럼은 application 단에서도 검증 추가 — `BaseException(<X>_INVALID_PAYLOAD, BAD_REQUEST)` 로 변환.

---

## 3. 컬럼 타입 ↔ Java type

### 3.1 시간

| DB | Java |
|---|---|
| `DATETIME`, `TIMESTAMP` | `LocalDateTime` |
| `DATE` | `LocalDate` (legacy `birth_date`) |

### 3.2 BOOLEAN ↔ boolean / Boolean

| 사용처 | Java type | 비고 |
|---|---|---|
| `CouponEntity.visible` | `boolean` (primitive) | NOT NULL DEFAULT 라 OK |
| `NoticeEntity.isVisible / isPinned` | `Boolean` (wrapper) | partial update 시 null 허용 위해 wrapper |
| `EventEntity.visible` | `boolean` | (확인 필요 — Lombok 으로 추정) |
| `PostEntity.isPinned / isVisible / isDeleted` | `Boolean` | partial update |

> 일관성 없음. 신규는 `Boolean` (wrapper) 통일 권장. partial update / 명시적 null 구분 가능.

### 3.3 카운터

`INT NOT NULL DEFAULT 0` ↔ Java `Integer` (wrapper). `PostServiceImpl.createPost` 가 null check 후 default 0 setter — wrapper 의 의도된 사용.

### 3.4 SMALLINT (player attributes)

`fun_player_card.season_year SMALLINT` ↔ Java `Short`. `overall_rating SMALLINT` ↔ `Short`. Lombok 자동.

### 3.5 JSON (legacy)

`player_legend.{positions, traits, attributes}` JSON ↔ Java `String` (raw JSON). 변환은 `JsonUtils.toList / toObject` 가 service 단에서 수행. V2 에서는 `fun_player_card_positions` 정규화 테이블로 분리 의도.

---

## 4. 시간대 / 정밀도

| 영역 | 값 |
|---|---|
| MariaDB | 시스템 timezone (검증 필요 — 운영 환경에 따라 KST 또는 UTC) |
| Java `LocalDateTime` | timezone-naive |
| 직렬화 | `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")` 분 단위 정밀도 |
| DB column | `DATETIME` 초 단위 정밀도 (microseconds 미사용) |

⚠ 운영 timezone 불일치 시 ON UPDATE CURRENT_TIMESTAMP 와 application created `LocalDateTime.now()` 가 시간 차이 발생. ops 트랙에서 `serverTimezone=Asia/Seoul` JDBC 옵션 검증 필요.

---

## 5. ID 전략

- 모든 BIGINT PK 는 `AUTO_INCREMENT`. application 단 ID 생성 안 함
- `useGeneratedKeys="true" keyProperty="id"` 로 INSERT 후 entity.id 채우기
- 예외: `kbo_seasons` (PK = season_year), `kbo_teams` (PK = team_code), `kbo_games` (PK = game_id VARCHAR), `kbo_players` (PK = player_code) — 자연 키
- `fun_player_card_*_stats` (card_id PK → fun_player_card.id 와 1:1)

---

## 6. CASCADE 정책

| FK | ON DELETE |
|---|---|
| `site_post_tag.post_id → site_post.id` | CASCADE |
| `site_post_reaction.post_id → site_post.id` | CASCADE |
| `site_comment_reaction.comment_id → site_comment.id` | CASCADE |
| `site_refresh_tokens.user_id → site_users.id` | CASCADE |
| `fun_player_card_*_stats.card_id → fun_player_card.id` | CASCADE (4개 모두) |
| `fun_player_card_positions.card_id → fun_player_card.id` | CASCADE |
| `legacy player_card_*_attributes.card_id → player_card.id` | CASCADE |
| `legacy player_legend_*_career.name → player_legend.name` | CASCADE + ON UPDATE CASCADE |
| `legacy legend_pitcher_pitch_slot.pitcher_name → player_legend.name` | CASCADE |
| `legacy posts_tags.post_id → posts.id` | CASCADE |

⚠ `site_post.board_id → site_board.id` 는 CASCADE 없음 — 게시판 삭제 시 게시글 RESTRICT (보존). 의도된 동작.

---

## 7. 신규 도메인 dual-management 체크리스트

- [ ] **enum 추가 시 DB ENUM ↔ Java enum 1:1 매칭** — 이름·순서 동일
- [ ] **DB DEFAULT 값** — Java entity 의 wrapper type 사용 시 null 허용 의도와 정합
- [ ] **DB CHECK 제약 = Java validation** — 두 쪽 모두 작성. 영향 없을 수도 있지만 BAD_REQUEST 응답 가능하게
- [ ] **컬럼 alias 사용 시** — typo 검증 (`evemtType` 같은 사례)
- [ ] **`is_visible` 같은 visibility 컬럼** — entity field 정의 + select WHERE filter 명시
- [ ] **시간 직렬화 포맷** — `@JsonFormat(pattern = "yyyy-MM-dd HH:mm")` 일관 적용
- [ ] **timezone** — Application LocalDateTime ↔ DB DATETIME 시간대 일치 (JDBC `serverTimezone`)

---

## 8. 우선순위 fix 항목

| 우선 | 항목 | 영향 |
|---|---|---|
| 高 | `CardGrade` Java enum ↔ DB ENUM 정합 (GOLDENGLUB→GOLDEN, HERO/NORMAL 재검토) | fun/playerCard 운영 시 즉시 폭발 |
| 高 | `Grade` (player_skills) Java enum 의 EPIC 처리 | 데이터 입력 시 ENUM 위반 |
| 高 | EventMapper.xml `evemtType` 오타 수정 | admin eventType null |
| 高 | `QuizEntity.isVisible` 필드 추가 + select WHERE 추가 | 노출 제어 동작 |
| 中 | DB CHECK 미러링 Java validation 추가 (events 만료, player_card grade-year) | BAD_REQUEST 응답 변환 |
| 中 | timezone 정합성 검증 | created_at vs LocalDateTime.now() drift |
| 低 | Boolean ↔ boolean 일관성 (entity 필드) | partial update 표현력 |

# DB dead-suspects

> ⚠️ 2026-08-20: coach/skill(코치) 도메인 서버·DB·시드 완전 삭제됨. 아래 coach 관련 서술은 삭제 이전 기록.

> mapper 0건 / SELECT 0건 / 컬럼 미사용 의심 항목.
> 검증 필수 — runtime profile / 마이그레이션 흔적 없으면 제거 후보.
> **결정 (2026-08-20)**: kbo_team_code_mappings 포함 kbo 6종은 완전 삭제 확정. 아래 kbo 서술은 삭제 이전 기록.

---

## 1. mapper 참조 0건 (orphan 테이블)

| 테이블 | 정의 | 비고 |
|---|---|---|
| `legend_pitcher_pitch_slot` | `sql/CREATE_TABLE.sql:141` | legacy. mapper XML 없음. 운영에서 fun/playerCard 의 `pitcher_pitch_grades` 가 대체 |
| `skill_pitcher_grade_stat` | `sql/CREATE_TABLE.sql:179` | legacy. mapper 없음. 점수 계산은 `skill_score_config` 가 담당 |
| `kbo_team_code_mappings` | `sql/CREATE_TABLE.sql:542` | 시드만 존재. KBO 도메인 BE 미구현 |
| `fun_teams` | `sql/V2/fun/CREATE_TABLE_FUN.sql:1` | V2 의도. mapper 0건 — 구현 보류 |
| `fun_player_card_positions` | `sql/V2/fun/CREATE_TABLE_FUN.sql:101` | XML 존재하나 namespace mismatch (실제 바인딩 안 됨). JSON→정규화 의도 미완 |

---

## 2. legacy 이전완료 (V2 짝 있음, 운영 미사용)

| legacy 테이블 | V2 짝 | mapper 참조 | 비고 |
|---|---|---|---|
| `users` | `site_users` | 0 | OAuth 가 site_users 만 사용 |
| `user_roles` | `site_users` (흡수) | 0 | role/status 컬럼 통합 |
| `events` | `site_events` | 0 | EventMapper 가 site_events 만 |
| `boards` | `site_board` | 0 | BoardMapper 가 site_board 만 |
| `posts` | `site_post` | 0 | |
| `tags` | `site_tag` | 0 | |
| `posts_tags` | `site_post_tag` | 0 | |
| `notices` | `site_notices` | 0 | |
| `quiz_answers` | `fun_quiz` | 0 | 컬럼 차이 — `title` 컬럼이 V1 에만 있음 |

> 이전완료 테이블은 백업 후 `DROP TABLE` 가능. ops 트랙에서 일괄 제거 필요.

---

## 3. legacy 운영 (mapper 참조 1+ 건이지만 V2 미정 / 폐기예정)

| 테이블 | 사용 mapper | 분류 | 비고 |
|---|---|---|---|
| `coupons` | (사실상 미사용) | ⚠ legacy(폐기예정 의심) | 코드 grep 결과 `CouponMapper.xml` 가 `site_coupons` 만 사용. 기존 spec 의 "dual-write 정책" 진위 ❓ |
| `teams` | `mapper/TeamMapper.xml` | 🟢 legacy | Player/Skill 도메인이 사용. V2 `fun_teams` 와 병존 |
| `player_legend` | `mapper/player/PlayerCardMapper.xml` (selectPlayersByPosition) | 🟢⚠ 폐기예정 | KBO 신규 데이터로 대체 의도 |
| `player_legend_hitter_career` / `player_legend_pitcher_career` | `mapper/player/PlayerCareer.xml` | 🟢⚠ 폐기예정 | 동일 |
| `player_skills` | `mapper/PlayerSkills.xml` | 🟣 shared 운영 | 마이그 미정 |
| `player_card` | `mapper/player/PlayerCardMapper.xml` (insert 만) | 🟢 legacy | V2 `fun_player_card` 와 양쪽 운영 ❓ insert 만 사용 — select 0건 |
| `player_card_hitter_attributes` / `player_card_pitcher_attributes` | `mapper/player/PlayerCardMapper.xml` | 🟢 legacy | insert 만 사용 |
| `coach` / `coach_skill_condition` / `coach_skill_buff` | `mapper/CoachMapper.xml` | 🟣⏸ shared(BE 미연결로 분류 but mapper 존재) | 운영 진위 검증 |
| `skill_score_config` | `mapper/SkillScoreConfigMapper.xml` | 🟣 shared 운영 | |

---

## 4. 컬럼 미사용 / orphan

### 4.1 `site_refresh_tokens.revoked_at`
- DDL: `revoked_at DATETIME NULL COMMENT 'NULL = 활성'`
- 사용처: select WHERE 절 / update SET 절 모두 0건
- 실제 revocation 은 row DELETE 로 처리 (`AuthServiceImpl.refresh` rotation 때 deleteByHash)
- 권고: 명시적 revocation 추적이 필요하면 컬럼 활용. 아니면 컬럼 제거

### 4.2 `site_post.report_count`, `comment_count` 갱신 누락 의심
- `PostService.increasePostCommentCount` / `increasePostReportCount` 메서드 정의 — controller 노출 없음
- DB 의 carry counter 가 DB SQL 단에서 자동 갱신되지 않음 → application 호출 필요
- 갱신 호출 누락 시 카운터 값이 항상 0 유지

### 4.3 `fun_quiz.is_visible`
- DDL: NOT NULL DEFAULT TRUE
- mapper select 쿼리에 컬럼 자체 미포함
- entity `QuizEntity` 에 매핑 필드 없음
- `QuizMapper.selectLatestVisible` 이름과 달리 `WHERE is_visible=true` 필터 없음 — visible 제어 동작 안 함

### 4.4 `legend_pitcher_pitch_slot` 컬럼 전부
- 테이블 자체 mapper 0건 → 컬럼 모두 미사용
- pitch grade 데이터는 V2 `fun_player_card_pitcher_pitch_grades` 가 대체

---

## 5. 인덱스 미사용 의심

### 5.1 `site_post.idx_post_report (report_count DESC, id DESC)`
- 의도: 신고 많은 글 admin dashboard
- `AdminReportController` 가 `report_count` 정렬 사용 안 함 — 모든 신고 list / status 별 list 만
- 사용 검증 필요 ❓

### 5.2 `site_post_reaction.idx_post_reaction_user (user_id, post_id)`
- 의도: 마이페이지 — 유저 반응 글 목록
- 컨트롤러 `GET /api/post-reactions/users/{userId}` 정의 있음 — FE 호출 검증 필요

### 5.3 `idx_batter_logs_player_opposing` (KBO)
- 의도: 안타 예측 모델용 (선수 vs 상대팀 상대전적)
- BE 사용 0건. kbocrol Python 또는 별도 분석 시스템 사용

---

## 6. SQL 파일 dead

| 파일 | 상태 |
|---|---|
| `sql/DROP_TABLE.sql` | DDL 변경 시 수동 실행용. 운영 미적용 |
| `sql/insertData/INSERT_DATA_TABLE.sql` | seed 데이터. 마이그 후 미참조 |
| `sql/insertData/INSERT_KBO_DATA_TABLE.sql` | KBO 시드 |
| `sql/insertData/legendPlayer.sql` | legacy 선수 seed |
| `sql/insertData/skillGradeStat.sql` | legacy `skill_pitcher_grade_stat` seed (테이블 자체 dead) |
| `sql/updateData/updateDescription.sql` | one-shot 데이터 패치. 적용 후 dead |
| `sql/updateData/updateLegendAttribute.sql` | 동일 |
| `sql/V2/site/INSERT_SITE_COUPONS_DATA.sql` | seed |
| `sql/V2/site/INSERT_SITE_EVENTS_DATA.sql` | seed |
| `sql/insertData/INSERT_SKILL_SCORE_CONFIG.sql` | seed |
| `sql/compyafun-v3_fun.sql` | V3 dump 파일. 정합성 검증 후 정리 |

---

## 7. 정리 우선순위

| 우선 | 항목 | 이유 |
|---|---|---|
| 高 | fun/playerCard 5개 mapper namespace 수정 | 운영 SQL 실행 안 됨 |
| 高 | EventMapper.xml `evemtType` 오타 수정 | admin 화면 eventType 항상 null |
| 高 | QuizMapper `selectLatestVisible` is_visible filter 추가 | 노출 제어 무력화 중 |
| 中 | legacy 이전완료 9개 테이블 백업 + DROP | 스키마 청결 |
| 中 | RefreshToken 만료 cleanup batch 추가 | 테이블 비대 방지 |
| 中 | Post counter 갱신 호출 명시 (PostReactionService 호출) | 카운터 동기화 |
| 低 | seed SQL 파일 archive 디렉토리로 이동 | repo 정리 |
| 低 | `revoked_at` 컬럼 활용 또는 제거 | 명시적 revocation |

---

## 8. 검증 필요 ❓

- coupons (legacy) ↔ site_coupons dual-write 가 실제 운영 정책인지
- player_card / player_card_attributes (legacy) insert-only 운영의 의도
- coach 계열 3개 — DB 만 있고 BE 미연결 분류 vs mapper 존재 (모순)
- KBO 테이블 BE 통합 일정 (현재 kbocrol Python 만 적재)

# tables.md — 전체 테이블 인벤토리 (DB 단독, 프로젝트 전체 1회)

> 입력: `docs/map/db-map.md` (Owner 확정 섹션 우선) + `sql/**` + MyBatis Mapper (interface + xml).
> 본 문서는 db-map.md 의 보강판이다. 컬럼 단위 diff 는 `dual-management.md` 에서 다룬다.
> ★ Owner 확정에 따른 분류 라벨이 본 표의 단일 진실(SoT) 이다.

## 분류 라벨 정의

- 🟢 **legacy** — V1 위치 + 운영 중 (mapper 참조 1건 이상)
- 🟢⚠ **legacy(폐기예정)** — V1 위치, 운영 중이지만 V2 통폐합 계획 (Owner 5번 항목)
- ⚪ **legacy(이전완료)** — V1 위치, mapper 0건, V2 짝으로 이전 (Owner 검증 됨)
- 🔵 **active(V2)** — V2 위치, mapper 참조 1건 이상, 운영 중
- 🔵⏸ **new(V2 보류)** — V2 의도이지만 mapper 미연결 / 미배포
- 🟣 **shared(legacy 운영)** — V1 위치, V2 짝 없음, mapper 참조 1건 이상 (Owner 4번 항목 — 재구조화 보류)
- 🟣⏸ **shared(BE 미연결)** — Owner 4번 그룹1: coach 계열 — DB 만 있고 BE 미연결 의도 (단, mapper 발견됨 → BE 검증 필요)

---

## 전체 테이블 표

| # | 테이블명 | 정의 (file:line) | PK | FK | 주요 인덱스 | Mapper xml (참조) | 분류 |
|---:|---|---|---|---|---|---|---|
| 1 | `player_skills` | `sql/CREATE_TABLE.sql:3` | `id` | — | `uk_skill_code_target(skill_code,target)` | `mapper/PlayerSkills.xml:8` | 🟣 shared(legacy 운영) |
| 2 | `teams` | `sql/CREATE_TABLE.sql:16` | `id` | `latest_team_id→teams.id` | `uk_team_code`, `idx_latest_team_id` | `mapper/TeamMapper.xml:12,17` | 🟢 legacy |
| 3 | `player_legend` | `sql/CREATE_TABLE.sql:37` | `id` | `team_id→teams.id` | `uk_card_code`, `uk_player_legend_name`, `idx_team_id`, `idx_role` | `mapper/player/PlayerCardMapper.xml:22` | 🟢⚠ legacy(폐기예정) |
| 4 | `player_legend_hitter_career` | `sql/CREATE_TABLE.sql:70` | `id` | `name→player_legend.name` | `uk_player_hitter_name` | `mapper/player/PlayerCareer.xml:21` | 🟢⚠ legacy(폐기예정) |
| 5 | `player_legend_pitcher_career` | `sql/CREATE_TABLE.sql:107` | `id` | `name→player_legend.name` | `uk_player_pitcher_name` | `mapper/player/PlayerCareer.xml:37` | 🟢⚠ legacy(폐기예정) |
| 6 | `legend_pitcher_pitch_slot` | `sql/CREATE_TABLE.sql:141` | `id` | `pitcher_name→player_legend.name` | `pk_pitcher_pitch_slot_name(pitcher_name)`, `chk_pitch` | — | 🟢⚠ legacy(폐기예정, mapper 0건) |
| 7 | `skill_pitcher_grade_stat` | `sql/CREATE_TABLE.sql:179` | `id` | `(skill_code,target)→player_skills` | `uk_skill_grade(skill_code,target,grade)` | — | 🟣 shared(legacy 운영, mapper 0건 — orphan 의심) |
| 8 | `users` | `sql/CREATE_TABLE.sql:205` | `id` | — | `uk_provider(provider,provider_id)` | — | ⚪ legacy(이전완료, site_users) |
| 9 | `user_roles` | `sql/CREATE_TABLE.sql:222` | `user_id` | `user_id→users.id` | — | — | ⚪ legacy(이전완료, site_users 흡수) |
| 10 | `events` | `sql/CREATE_TABLE.sql:237` | `id` | — | `idx_events_visible_period`, `CHECK(expire_at>start_at)` | — | ⚪ legacy(이전완료, site_events) |
| 11 | `coupons` | `sql/CREATE_TABLE.sql:255` | `id` | — | `coupon_code UNIQUE`, `idx_coupons_visible_period`, `idx_coupons_expire_at` | `mapper/site/coupon/CouponMapper.xml:45` (selectCouponById 만) | 🟢 legacy (Owner: 의도된 dual-write — `dual-management.md` 참고) |
| 12 | `boards` | `sql/CREATE_TABLE.sql:275` | `id` | — | `code UNIQUE` | — | ⚪ legacy(이전완료, site_board) |
| 13 | `posts` | `sql/CREATE_TABLE.sql:298` | `id` | `board_id→boards.id` | `idx_board_visible_created`, `idx_board_pinned_created`, `idx_author` | — | ⚪ legacy(이전완료, site_post) |
| 14 | `tags` | `sql/CREATE_TABLE.sql:331` | `id` | — | `code UNIQUE` | — | ⚪ legacy(이전완료, site_tag) |
| 15 | `posts_tags` | `sql/CREATE_TABLE.sql:348` | `(post_id,tag_id)` | `post_id→posts.id`, `tag_id→tags.id` | — | — | ⚪ legacy(이전완료, site_post_tag) |
| 16 | `coach` | `sql/CREATE_TABLE.sql:359` | `id` | — | — | `mapper/CoachMapper.xml:8` | 🟣⏸ shared(BE 미연결) — but mapper 존재 (Owner 기억과 어긋남, BE 검증 필요) |
| 17 | `coach_skill_condition` | `sql/CREATE_TABLE.sql:369` | `id` | — | `uk_condition(grade,target,name)` | `mapper/CoachMapper.xml:18` | 🟣⏸ shared(BE 미연결) — mapper 존재, 동상 |
| 18 | `coach_skill_buff` | `sql/CREATE_TABLE.sql:383` | `id` | — | `uk_buff(grade,target,name)` | `mapper/CoachMapper.xml:13` | 🟣⏸ shared(BE 미연결) — mapper 존재, 동상 |
| 19 | `notices` | `sql/CREATE_TABLE.sql:398` | `id` | — | `chk source-payload` | — | ⚪ legacy(이전완료, site_notices) |
| 20 | `player_card` | `sql/CREATE_TABLE.sql:420` | `id` | `team_id→teams.id` | `uk_card_code`, `idx_team_id`, `idx_grade`, `idx_role`, `idx_season_year`, `idx_grade_year`, `chk_grade_year` | `mapper/player/PlayerCardMapper.xml:32` (insertPlayerCard) | 🟢 legacy (V2 fun_player_card 와 양쪽 병존) |
| 21 | `player_card_hitter_attributes` | `sql/CREATE_TABLE.sql:469` | `card_id` | `card_id→player_card.id` | — | `mapper/player/PlayerCardMapper.xml:64` | 🟢 legacy |
| 22 | `player_card_pitcher_attributes` | `sql/CREATE_TABLE.sql:485` | `card_id` | `card_id→player_card.id` | — | `mapper/player/PlayerCardMapper.xml:84` | 🟢 legacy |
| 23 | `skill_score_config` | `sql/CREATE_TABLE.sql:502` | `id` | `(skill_code,target)→player_skills` | `uk_skill_condition(skill_code,target,condition_type,condition_value)` | `mapper/SkillScoreConfigMapper.xml:16` | 🟣 shared(legacy 운영) |
| 24 | `quiz_answers` | `sql/CREATE_TABLE.sql:530` | `id` | — | `uq_round` | — | ⚪ legacy(이전완료, fun_quiz) |
| 25 | `kbo_team_code_mappings` | `sql/CREATE_TABLE.sql:542` | `id` | `internal_team_id→teams.id` | `uq_external_team_mapping(source_system,external_team_code)` | — | 🔵⏸ new(V2 보류, 시드만 있음) |
| 26 | `kbo_seasons` | `sql/CREATE_TABLE_KBO.sql:10` | `season_year` | — | — | — | 🔵⏸ new(V2 보류) |
| 27 | `kbo_teams` | `sql/CREATE_TABLE_KBO.sql:31` | `team_code` | — | — | — | 🔵⏸ new(V2 보류) |
| 28 | `kbo_games` | `sql/CREATE_TABLE_KBO.sql:62` | `game_id` | `season_year→kbo_seasons`, `home_team_code→kbo_teams`, `away_team_code→kbo_teams` | `idx_games_date`, `idx_games_season`, `idx_games_status`, `idx_games_date_status`, `idx_games_home_team`, `idx_games_away_team` | `mapper/kbo/KboGameMapper.xml:37,71,89` | 🔵⏸ new(V2 보류, mapper 일부 존재) |
| 29 | `kbo_players` | `sql/CREATE_TABLE_KBO.sql:201` | `player_code` | `team_code→kbo_teams.team_code` | — | — | 🔵⏸ new(V2 보류) |
| 30 | `kbo_batter_logs` | `sql/CREATE_TABLE_KBO.sql:225` | `(game_id,player_code)` | `game_id→kbo_games`, `player_code→kbo_players` | `idx_batter_logs_player`, `idx_batter_logs_date`, `idx_batter_logs_season`, `idx_batter_logs_team`, `idx_batter_logs_player_date`, `idx_batter_logs_player_opposing` | — | 🔵⏸ new(V2 보류, kbocrol 전용 추정) |
| 31 | `fun_teams` | `sql/V2/fun/CREATE_TABLE_FUN.sql:1` | `id` | `latest_team_id→fun_teams.id` | `uk_fun_teams_code_period(team_code,start_year)`, `idx_fun_teams_latest_team_id` | — | 🔵⏸ new(V2 보류, mapper 0건 — 불완전 마이그) |
| 32 | `fun_player_card` | `sql/V2/fun/CREATE_TABLE_FUN.sql:21` | `id` | `team_id→fun_teams.id` | `uk_fun_player_card_card_code`, `idx_*_player_id`, `idx_*_team_id`, `idx_*_grade`, `idx_*_role`, `idx_*_grade_year` | `mapper/fun/playerCard/PlayerCardMapper.xml:25,50,64,81,98,115` | 🔵 active(V2) — ⚠ namespace mismatch (BE 인터페이스 `FunPlayerCardMapper` vs xml `PlayerCardMapper`) |
| 33 | `fun_player_card_hitter_stats` | `sql/V2/fun/CREATE_TABLE_FUN.sql:51` | `card_id` | `card_id→fun_player_card.id` | — | `mapper/fun/playerCard/PlayerCardHitterStatsMapper.xml:20,42,53,65` | 🔵 active(V2) — ⚠ namespace mismatch |
| 34 | `fun_player_card_pitcher_stats` | `sql/V2/fun/CREATE_TABLE_FUN.sql:66` | `card_id` | `card_id→fun_player_card.id` | — | `mapper/fun/playerCard/PlayerCardPitcherStatsMapper.xml:20,42,53,65` | 🔵 active(V2) — ⚠ namespace mismatch |
| 35 | `fun_player_card_pitcher_pitch_grades` | `sql/V2/fun/CREATE_TABLE_FUN.sql:81` | `card_id` | `card_id→fun_player_card.id` | — | `mapper/fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml:25,57,73,90` | 🔵 active(V2) — ⚠ namespace mismatch |
| 36 | `fun_player_card_positions` | `sql/V2/fun/CREATE_TABLE_FUN.sql:101` | `id` | `card_id→fun_player_card.id` | `uk_fun_player_card_positions(card_id,position_code)`, `idx_*_card_id`, `idx_*_position_code` | `mapper/fun/playerCard/PlayerCardPositionsMapper.xml:19,35,44,49,59,69,80` | 🔵⏸ new(V2 보류) — Owner: JSON→정규화 의도, 미완·방치, 1:N (player_card.positions JSON 과 1:1 짝 아님) |
| 37 | `fun_quiz` | `sql/V2/fun/CREATE_TABLE_FUN.sql:117` | `id` | — | `uq_round` | `mapper/fun/quiz/QuizMapper.xml:15,29,41,46,51,61` | 🔵 active(V2) |
| 38 | `site_coupons` | `sql/V2/site/CREATE_TABLE_SITE.sql:1` | `id` | — | `coupon_code UNIQUE` | `mapper/site/coupon/CouponMapper.xml:17,32,50,70,92` | 🔵 active(V2) — Owner: dual-write 정책 |
| 39 | `site_notices` | `sql/V2/site/CREATE_TABLE_SITE.sql:14` | `id` | — | `idx_*_visible_pinned_created`, `idx_*_source`, `idx_*_published_at`, `chk source-payload` | `mapper/site/notice/NoticeMapper.xml:26,48,71,92,111,119,144,159,166,173` | 🔵 active(V2) |
| 40 | `site_events` | `sql/V2/site/CREATE_TABLE_SITE.sql:45` | `id` | — | `idx_*_visible_period`, `chk expire>start` | `mapper/site/event/EventMapper.xml:21,40,56,61,86,115` | 🔵 active(V2) |
| 41 | `site_users` | `sql/V2/site/CREATE_TABLE_SITE.sql:67` | `id` | — | `uk_oauth(oauth_provider,oauth_provider_id)` | `mapper/UserMapper.xml:25,33,62,85` | 🔵 active(V2) |
| 42 | `site_board` | `sql/V2/site/CREATE_TABLE_SITE.sql:105` | `id` | — | `code UNIQUE`, `idx_board_list` | `mapper/site/community/BoardMapper.xml:46,67,89,110,117,145,161,169` | 🔵 active(V2) |
| 43 | `site_post` | `sql/V2/site/CREATE_TABLE_SITE.sql:136` | `id` | `board_id→site_board.id` | `idx_post_list`, `idx_post_popular`, `idx_post_author`, `idx_post_report` | `mapper/site/community/PostMapper.xml:57,85,114,142,170,179,218,231,238,245,252,258,264,270,276,282,288,294` | 🔵 active(V2) |
| 44 | `site_comment` | `sql/V2/site/CREATE_TABLE_SITE.sql:183` | `id` | `post_id→site_post.id`, `parent_comment_id→site_comment.id` | `idx_comment_list`, `idx_comment_parent` | `mapper/site/community/CommentMapper.xml:46,69,91,97,106,135,143,150,156,162,168,174,180` | 🔵 active(V2) |
| 45 | `site_tag` | `sql/V2/site/CREATE_TABLE_SITE.sql:220` | `id` | — | `code UNIQUE` | `mapper/site/community/TagMapper.xml:29,44,60,75,84,101,111,118` | 🔵 active(V2) |
| 46 | `site_post_tag` | `sql/V2/site/CREATE_TABLE_SITE.sql:239` | `(post_id,tag_id)` | `post_id→site_post.id`, `tag_id→site_tag.id` | `idx_post_tag_by_tag` | `mapper/site/community/PostTagMapper.xml:17,26,33,43,49` | 🔵 active(V2) |
| 47 | `site_post_reaction` | `sql/V2/site/CREATE_TABLE_SITE.sql:257` | `id` | `post_id→site_post.id` | `uq_post_reaction_user(post_id,user_id)`, `idx_post_reaction_user` | `mapper/site/community/PostReactionMapper.xml:23,35,47,56,69,76` | 🔵 active(V2) |
| 48 | `site_comment_reaction` | `sql/V2/site/CREATE_TABLE_SITE.sql:280` | `id` | `comment_id→site_comment.id` | `uq_comment_reaction_user(comment_id,user_id)`, `idx_comment_reaction_user` | `mapper/site/community/CommentReactionMapper.xml:23,35,47,56,69,76` | 🔵 active(V2) |
| 49 | `site_report` | `sql/V2/site/CREATE_TABLE_SITE.sql:303` | `id` | — | `uq_report_user_target(target_type,target_id,reporter_id)`, `idx_report_admin`, `idx_report_target` | `mapper/site/community/ReportMapper.xml:33,49,66,84,100,110,132,141` | 🔵 active(V2) |

**총 49 테이블** (V1 위치 30 + V2 위치 19).

---

## 분류별 집계 (Owner 확정 기준)

| 분류 | 개수 | 테이블 |
|---|---:|---|
| 🟢 legacy (운영 중) | 4 | `teams`, `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes` |
| 🟢⚠ legacy(폐기예정) | 4 | `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career`, `legend_pitcher_pitch_slot` |
| ⚪ legacy(이전완료) | 8 | `users`, `user_roles`, `events`, `boards`, `posts`, `tags`, `posts_tags`, `notices`, `quiz_answers` (= 9개. 1개 추가) |
| 🟣 shared(legacy 운영) | 3 | `player_skills`, `skill_score_config`, `skill_pitcher_grade_stat`(orphan 의심) |
| 🟣⏸ shared(BE 미연결, mapper 발견) | 3 | `coach`, `coach_skill_condition`, `coach_skill_buff` |
| 🔵 active(V2) | 13 | `fun_player_card`, `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`, `fun_quiz`, `site_coupons`, `site_notices`, `site_events`, `site_users`, `site_board`, `site_post`, `site_comment`, `site_tag`, `site_post_tag`, `site_post_reaction`, `site_comment_reaction`, `site_report` |
| 🔵⏸ new(V2 보류) | 8 | `fun_teams`, `fun_player_card_positions`, `kbo_seasons`, `kbo_teams`, `kbo_games`(mapper 일부), `kbo_players`, `kbo_batter_logs`, `kbo_team_code_mappings` |

> ⚪ legacy(이전완료) 는 표 본문 9개로 카운트. `events`(10), `boards`(12), `posts`(13), `tags`(14), `posts_tags`(15), `notices`(19), `quiz_answers`(24), `users`(8), `user_roles`(9) — 전부 mapper 0건 + V2 짝 존재.

---

## 발견사항 (DB 단독 분석 한계 명시)

1. **fun/playerCard 5개 mapper xml 의 namespace mismatch**:
   - xml namespace: `com.dawne.com2usbaseball.domain.fun.playerCard.mapper.PlayerCardMapper` (5개 모두 `mapper.*` 직속)
   - java 인터페이스 위치: `com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.FunPlayerCardMapper` 등 (`.repository.mapper.*`)
   - → MyBatis 가 namespace 로 인터페이스를 못 찾으면 매퍼 자체가 빈 디바인딩 또는 NoStatement 예외 가능. **runtime-analyzer / BE-analyzer 확인 필수**.
   - xml 위치: `src/main/resources/mapper/fun/playerCard/*.xml:6` (5개 파일 동일 패턴)
   - 자바 위치: `src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/repository/mapper/*.java`
   - Owner 의 "fun_player_card_positions 방치" 진술과 일치하는 정황 (전체 fun/playerCard 미완)

2. **`legend_pitcher_pitch_slot` mapper 0건**: db-map.md 본문에서 `fun_player_card_pitcher_pitch_grades` 와 짝 후보로 분류했으나, mapper 가 없어 실제 SELECT/INSERT 구문이 발견되지 않음. legacy 운영 데이터로 채워져만 있는 상태일 수 있음 → runtime 행수 검증 필요.

3. **`skill_pitcher_grade_stat` mapper 0건 + 시드만 있음**: V2 짝 없고 mapper 없음. orphan 가능성. runtime 행수 / 실서비스 SQL 검색 별도 확인 필요.

4. **`kbo_team_code_mappings`**: 시드 (`INSERT_KBO_DATA_TABLE.sql`) 만 존재, mapper 없음. KBO 도메인 보류 상태와 일치.

5. **`coach*` 그룹**: Owner 기억상 "BE 코드 미연결" 인데 `CoachMapper.xml` 발견 + `domain.skill.repository.mapper.CoachMapper.java` 도 존재. namespace 정상. **BE-analyzer 가 service 레이어 호출 여부 확인 필요**.

# mapper-mapping.md — MyBatis Mapper ↔ 테이블 매핑

> 입력: `src/main/resources/mapper/**/*.xml` (XML 정의) + `src/main/java/.../*Mapper.java` (interface)
> + `src/main/resources/application.properties` (mybatis.mapper-locations).
>
> 본 프로젝트는 **JPA 미사용** — 모든 DB 접근은 MyBatis. 인터페이스는 모두 `@Mapper` 어노테이션.
>
> 통계: **xml 25 파일 / java interface 25 파일 (FunPlayerCard 1쌍 namespace mismatch)** , 총 **145 statement** (select 68 / insert 21 / update 43 / delete 13).

## 설정 (application.properties)

```
mybatis.mapper-locations=classpath:mapper/**/*.xml          (line 21)
mybatis.type-aliases-package=com.dawne.com2usbaseball.entity,com.dawne.com2usbaseball.dto    (line 22)
mybatis.configuration.map-underscore-to-camel-case=true     (line 24)
```

DB: MariaDB (line 10–11), schema = `compyafun` (CREATE_TABLE.sql:1 `USE compyafun`).

---

## Mapper 인벤토리 (xml ↔ interface ↔ 참조 테이블)

| # | Mapper xml (file:ns line) | Interface (java) | namespace | 참조 테이블 | 메서드 수 | select / insert / update / delete |
|---:|---|---|---|---|---:|---|
| 1 | `mapper/CoachMapper.xml:4` | `domain/skill/repository/mapper/CoachMapper.java` | `domain.skill.repository.mapper.CoachMapper` | `coach`, `coach_skill_buff`, `coach_skill_condition` | 3 | 3 / 0 / 0 / 0 |
| 2 | `mapper/PlayerSkills.xml:4` | `domain/skill/repository/mapper/PlayerSkillsMapper.java` | `domain.skill.repository.mapper.PlayerSkillsMapper` | `player_skills` | 1 | 1 / 0 / 0 / 0 |
| 3 | `mapper/SkillScoreConfigMapper.xml:4` | `domain/skill/repository/mapper/SkillScoreConfigMapper.java` | `domain.skill.repository.mapper.SkillScoreConfigMapper` | `skill_score_config` | 1 | 1 / 0 / 0 / 0 |
| 4 | `mapper/TeamMapper.xml:4` | `domain/player/repository/mapper/TeamMapper.java` | `domain.player.repository.mapper.TeamMapper` | `teams` | 2 | 2 / 0 / 0 / 0 |
| 5 | `mapper/UserMapper.xml:5` | `domain/oauth/repository/mapper/UserMapper.java` | `domain.oauth.repository.mapper.UserMapper` | `site_users` | 4 | 2 / 1 / 1 / 0 |
| 6 | `mapper/kbo/KboGameMapper.xml:5` | `domain/kbo/repository/mapper/KboGameMapper.java` | `domain.kbo.repository.mapper.KboGameMapper` | `kbo_games` | 3 | 3 / 0 / 0 / 0 |
| 7 | `mapper/player/PlayerCardMapper.xml:4` | `domain/player/repository/mapper/PlayerCardMapper.java` | `domain.player.repository.mapper.PlayerCardMapper` | **`player_legend`**, `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes` | 4 | 1 / 3 / 0 / 0 |
| 8 | `mapper/player/PlayerCareer.xml:4` | `domain/player/repository/mapper/LegendPlayerCareerMapper.java` | `domain.player.repository.mapper.LegendPlayerCareerMapper` | `player_legend_hitter_career`, `player_legend_pitcher_career` | 2 | 2 / 0 / 0 / 0 |
| 9 | `mapper/fun/quiz/QuizMapper.xml:5` | `domain/quiz/repository/mapper/QuizMapper.java` | `domain.quiz.repository.mapper.QuizMapper` | `fun_quiz` | 6 | 3 / 1 / 1 / 1 |
| 10 | `mapper/fun/playerCard/PlayerCardMapper.xml:6` ⚠ | `domain/fun/playerCard/repository/mapper/FunPlayerCardMapper.java` | `domain.fun.playerCard.mapper.PlayerCardMapper` ⚠ | `fun_player_card` | 6 | 3 / 1 / 1 / 1 |
| 11 | `mapper/fun/playerCard/PlayerCardHitterStatsMapper.xml:6` ⚠ | `domain/fun/playerCard/repository/mapper/PlayerCardHitterStatsMapper.java` | `domain.fun.playerCard.mapper.PlayerCardHitterStatsMapper` ⚠ | `fun_player_card_hitter_stats` | 4 | 1 / 1 / 1 / 1 |
| 12 | `mapper/fun/playerCard/PlayerCardPitcherStatsMapper.xml:6` ⚠ | `domain/fun/playerCard/repository/mapper/PlayerCardPitcherStatsMapper.java` | `domain.fun.playerCard.mapper.PlayerCardPitcherStatsMapper` ⚠ | `fun_player_card_pitcher_stats` | 4 | 1 / 1 / 1 / 1 |
| 13 | `mapper/fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml:6` ⚠ | `domain/fun/playerCard/repository/mapper/PlayerCardPitcherPitchGradesMapper.java` | `domain.fun.playerCard.mapper.PlayerCardPitcherPitchGradesMapper` ⚠ | `fun_player_card_pitcher_pitch_grades` | 4 | 1 / 1 / 1 / 1 |
| 14 | `mapper/fun/playerCard/PlayerCardPositionsMapper.xml:6` ⚠ | `domain/fun/playerCard/repository/mapper/PlayerCardPositionsMapper.java` | `domain.fun.playerCard.mapper.PlayerCardPositionsMapper` ⚠ | `fun_player_card_positions` | 7 | 3 / 1 / 1 / 2 |
| 15 | `mapper/site/coupon/CouponMapper.xml:5` | `domain/coupon/repository/mapper/CouponMapper.java` | `domain.coupon.repository.mapper.CouponMapper` | **`site_coupons`** + **`coupons`** ★ | 6 | 3 / 1 / 2 / 0 |
| 16 | `mapper/site/notice/NoticeMapper.xml:6` | `domain/notice/repository/mapper/NoticeMapper.java` | `domain.notice.repository.mapper.NoticeMapper` | `site_notices` | 10 | 5 / 1 / 3 / 1 |
| 17 | `mapper/site/event/EventMapper.xml:5` | `domain/event/repository/mapper/EventMapper.java` | `domain.event.repository.mapper.EventMapper` | `site_events` | 6 | 3 / 1 / 2 / 0 |
| 18 | `mapper/site/community/BoardMapper.xml:6` | `domain/community/repository/mapper/BoardMapper.java` | `domain.community.repository.mapper.BoardMapper` | `site_board` | 8 | 4 / 1 / 3 / 0 |
| 19 | `mapper/site/community/PostMapper.xml:6` | `domain/community/repository/mapper/PostMapper.java` | `domain.community.repository.mapper.PostMapper` | `site_post` | 18 | 5 / 1 / 12 / 0 |
| 20 | `mapper/site/community/CommentMapper.xml:6` | `domain/community/repository/mapper/CommentMapper.java` | `domain.community.repository.mapper.CommentMapper` | `site_comment` | 13 | 4 / 1 / 8 / 0 |
| 21 | `mapper/site/community/TagMapper.xml:6` | `domain/community/repository/mapper/TagMapper.java` | `domain.community.repository.mapper.TagMapper` | `site_tag` | 8 | 4 / 1 / 3 / 0 |
| 22 | `mapper/site/community/PostTagMapper.xml:6` | `domain/community/repository/mapper/PostTagMapper.java` | `domain.community.repository.mapper.PostTagMapper` | `site_post_tag` | 5 | 2 / 1 / 0 / 2 |
| 23 | `mapper/site/community/PostReactionMapper.xml:6` | `domain/community/repository/mapper/PostReactionMapper.java` | `domain.community.repository.mapper.PostReactionMapper` | `site_post_reaction` | 6 | 3 / 1 / 1 / 1 |
| 24 | `mapper/site/community/CommentReactionMapper.xml:6` | `domain/community/repository/mapper/CommentReactionMapper.java` | `domain.community.repository.mapper.CommentReactionMapper` | `site_comment_reaction` | 6 | 3 / 1 / 1 / 1 |
| 25 | `mapper/site/community/ReportMapper.xml:6` | `domain/community/repository/mapper/ReportMapper.java` | `domain.community.repository.mapper.ReportMapper` | `site_report` | 8 | 5 / 1 / 1 / 1 |

**합계: 145 statement** (select 68 / insert 21 / update 43 / delete 13).

---

## 다중 테이블 참조 mapper (dual-write / cross-table 식별)

총 25개 mapper 중 **2개**가 한 mapper 안에서 여러 테이블을 참조한다 (JOIN 은 0건):

### A. `mapper/site/coupon/CouponMapper.xml` ★★★ — V1+V2 양쪽 참조

| Statement id | line | 대상 테이블 |
|---|---:|---|
| `selectCouponListForUser` | 17 | `site_coupons` |
| `selectCouponList` | 32 | `site_coupons` |
| **`selectCouponById`** | **45** | **`coupons`** ⚠ legacy 단독 SELECT |
| `insertCoupon` | 50 | `site_coupons` |
| `updateCouponById` | 70 | `site_coupons` |
| `updateCouponVisible` | 92 | `site_coupons` |

→ **5/6 statement 가 site_coupons 단독, 1/6 만 legacy `coupons`**. 단일 mapper 내 V1/V2 양쪽 사용. Owner 확정상 dual-write 의도지만 **mapper 단계에서는 dual-write 가 아니라 dual-read fallback** 패턴 (자세한 분석은 `dual-management.md` §1).

### B. `mapper/player/PlayerCardMapper.xml` ★★ — 4 테이블 cross 참조

| Statement id | line | 대상 테이블 |
|---|---:|---|
| `selectPlayersByPosition` | 22 | **`player_legend`** ⚠ (네임은 PlayerCard 인데 legend SELECT) |
| `insertPlayerCard` | 32 | `player_card` |
| `insertHitterAttribute` | 64 | `player_card_hitter_attributes` |
| `insertPitcherAttribute` | 84 | `player_card_pitcher_attributes` |

→ 한 mapper 가 4개 테이블 (`player_legend`, `player_card`, hitter/pitcher attributes) 을 다룸. legend SELECT + card INSERT 조합 — service 레이어에서 legend 데이터를 읽어와 player_card 로 변환 INSERT 하는 경로일 가능성. 단, V2 fun_player_card 와의 양쪽 INSERT 흐름은 mapper 단독으로는 식별 불가 (BE-analyzer 영역).

---

## 단일 테이블 참조 mapper (정규)

23개 mapper 가 단일 테이블만 참조. 분포:

- **player_legend 계열 read-only**: `PlayerCareer.xml` (career 2 테이블)
- **single-table CRUD 풀세트**: site/* 11개, fun/playerCard 5개, fun/quiz 1개, kbo 1개
- **read-only**: TeamMapper, PlayerSkills, SkillScoreConfig, CoachMapper

---

## namespace mismatch 발견 (★ 중요 위험)

`mapper/fun/playerCard/` 5개 xml 파일의 namespace 가 java 인터페이스 패키지와 어긋남:

| xml namespace 선언 | java 인터페이스 실제 위치 | 일치 |
|---|---|---|
| `domain.fun.playerCard.mapper.PlayerCardMapper` | `domain.fun.playerCard.repository.mapper.FunPlayerCardMapper` | ✗ (`.repository.` 누락 + 클래스명 `Fun` 접두사) |
| `domain.fun.playerCard.mapper.PlayerCardHitterStatsMapper` | `domain.fun.playerCard.repository.mapper.PlayerCardHitterStatsMapper` | ✗ (`.repository.` 누락) |
| `domain.fun.playerCard.mapper.PlayerCardPitcherStatsMapper` | `domain.fun.playerCard.repository.mapper.PlayerCardPitcherStatsMapper` | ✗ |
| `domain.fun.playerCard.mapper.PlayerCardPitcherPitchGradesMapper` | `domain.fun.playerCard.repository.mapper.PlayerCardPitcherPitchGradesMapper` | ✗ |
| `domain.fun.playerCard.mapper.PlayerCardPositionsMapper` | `domain.fun.playerCard.repository.mapper.PlayerCardPositionsMapper` | ✗ |

→ MyBatis 가 namespace 의 fully-qualified class 를 못 찾으면 (a) interface binding 실패, (b) statement 호출 시 `BindingException: Invalid bound statement` 발생 가능. **runtime 검증 필수**. Owner 의 "fun_player_card_positions 방치" 진술과 직결되는 정황.

다른 모든 mapper 는 xml namespace 와 java 인터페이스 패키지가 일치 (검증 완료).

---

## 도메인별 mapper 묶음

| 도메인 | mapper xml | 참조 테이블 (요약) |
|---|---|---|
| **player (legacy)** | TeamMapper, PlayerCardMapper(player), PlayerCareer | `teams`, `player_legend`, `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes`, `player_legend_hitter_career`, `player_legend_pitcher_career` |
| **fun.playerCard (V2)** | PlayerCardMapper(fun), PlayerCardHitterStatsMapper, PlayerCardPitcherStatsMapper, PlayerCardPitcherPitchGradesMapper, PlayerCardPositionsMapper | `fun_player_card`, `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`, `fun_player_card_positions` |
| **skill** | PlayerSkills, SkillScoreConfigMapper, CoachMapper | `player_skills`, `skill_score_config`, `coach`, `coach_skill_buff`, `coach_skill_condition` |
| **oauth/user** | UserMapper | `site_users` |
| **coupon** | CouponMapper | `site_coupons`, `coupons` |
| **notice** | NoticeMapper | `site_notices` |
| **event** | EventMapper | `site_events` |
| **community (V2)** | BoardMapper, PostMapper, CommentMapper, TagMapper, PostTagMapper, PostReactionMapper, CommentReactionMapper, ReportMapper | `site_board`, `site_post`, `site_comment`, `site_tag`, `site_post_tag`, `site_post_reaction`, `site_comment_reaction`, `site_report` |
| **quiz (V2)** | QuizMapper(fun) | `fun_quiz` |
| **kbo (보류)** | KboGameMapper | `kbo_games` (kbo_seasons/teams/players/batter_logs 는 mapper 0건) |

---

## 누락된 mapper (테이블은 있는데 mapper 0건)

`tables.md` 에서 mapper 0건으로 분류된 테이블:

| 테이블 | 분류 | 비고 |
|---|---|---|
| `users`, `user_roles` | ⚪ 이전완료 | site_users 흡수 |
| `events` | ⚪ 이전완료 | site_events |
| `boards`, `posts`, `tags`, `posts_tags` | ⚪ 이전완료 | site_* |
| `notices` | ⚪ 이전완료 | site_notices |
| `quiz_answers` | ⚪ 이전완료 | fun_quiz |
| `legend_pitcher_pitch_slot` | 🟢⚠ legacy(폐기예정) | mapper 0건 — 시드만 |
| `skill_pitcher_grade_stat` | 🟣 shared | mapper 0건 — orphan 의심 |
| `kbo_team_code_mappings` | 🔵⏸ new(보류) | 시드만 |
| `kbo_seasons`, `kbo_teams`, `kbo_players`, `kbo_batter_logs` | 🔵⏸ new(보류) | 인라인 INSERT 만 |
| `fun_teams` | 🔵⏸ new(보류) | 불완전 마이그 |

자세한 처리는 `dead-suspects.md` 참조.

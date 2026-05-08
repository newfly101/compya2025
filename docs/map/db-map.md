# DB 지도

> Scout 산출물. 컬럼 단위 분석은 의도적으로 제외. CREATE 시점만 봤음.
> reconciler 가 BE/FE 매핑과 합쳐 docs/map/domains.md 로 합칠 입력.

---

## 마이그레이션 디렉토리 구조

레포에는 **공식 V1 폴더가 없음**. 관례적으로 "V1 = 루트 sql/ 의 평탄한 CREATE_TABLE*.sql 묶음", "V2 = sql/V2/ 하위 도메인별 분기" 로 식별됨. Flyway/Liquibase 같은 버전 마이그레이션 도구는 미사용 (파일에 V1__/V2__ prefix 없음).

```
sql/
├── CREATE_TABLE.sql         ← 통합 레거시 (file:1..560)  [27 테이블 - "V1" 위치]
├── CREATE_TABLE_KBO.sql     ← KBO 전용 (file:1..304)    [5 테이블 - "V1" 위치, 신규 도메인이라 V2 와 시기 겹침]
├── DROP_TABLE.sql           ← 레거시 일괄 드롭 (1..29)
├── insertData/              ← 마스터데이터 시드 5 파일 (player_skills, teams, player_legend*, skill_*, kbo_team_code_mappings)
├── updateData/              ← 마스터데이터 보정 2 파일 (player_skills, player_legend)
└── V2/
    ├── fun/
    │   └── CREATE_TABLE_FUN.sql    ← (1..127)  [6 테이블 - "V2" 위치, fun_* prefix]
    └── site/
        ├── CREATE_TABLE_SITE.sql   ← (1..337)  [11 테이블 - "V2" 위치, site_* prefix]
        ├── INSERT_SITE_COUPONS_DATA.sql
        └── INSERT_SITE_EVENTS_DATA.sql
```

- **★ src/main/resources/db/** **존재하지 않음** — Flyway 마이그레이션 없음
- 파일 자체에 날짜/버전 번호 없음 → 시기 추정은 "도메인 prefix + 사용 mapper 분포" 로만 가능
- MyBatis 매핑 (`src/main/resources/mapper/`) 만 존재. **JPA `@Entity` 0 건** → "JPA 매핑" 컬럼은 전부 N/A. 대신 "MyBatis 매핑 (mapper.xml)" 으로 의미 치환

---

## 전체 테이블 목록

| 테이블명 | 추정 도메인 | 정의 위치 (file:line) | 생성 시기 | 분류 추정 | 짝(pair) 후보 | MyBatis 매핑 | insert/update 시드 |
|---|---|---|---|---|---|---|---|
| `player_skills` | skill | sql/CREATE_TABLE.sql:3 | V1 | 🟣 shared | — | PlayerSkills.xml | INSERT_DATA_TABLE.sql, updateDescription.sql |
| `teams` | player/team | sql/CREATE_TABLE.sql:16 | V1 | 🟢 legacy | **fun_teams** | TeamMapper.xml | INSERT_DATA_TABLE.sql |
| `player_legend` | player | sql/CREATE_TABLE.sql:37 | V1 | 🟢 legacy | (fun_player_card 통합) | PlayerCardMapper.xml | legendPlayer.sql, updateLegendAttribute.sql |
| `player_legend_hitter_career` | player | sql/CREATE_TABLE.sql:70 | V1 | 🟢 legacy | — | PlayerCareer.xml | INSERT_DATA_TABLE.sql |
| `player_legend_pitcher_career` | player | sql/CREATE_TABLE.sql:107 | V1 | 🟢 legacy | — | PlayerCareer.xml | INSERT_DATA_TABLE.sql |
| `legend_pitcher_pitch_slot` | player | sql/CREATE_TABLE.sql:141 | V1 | 🟢 legacy | **fun_player_card_pitcher_pitch_grades** | — | INSERT_DATA_TABLE.sql |
| `skill_pitcher_grade_stat` | skill | sql/CREATE_TABLE.sql:179 | V1 | 🟣 shared | — | — | skillGradeStat.sql |
| `users` | oauth/user | sql/CREATE_TABLE.sql:205 | V1 | 🟢 legacy | **site_users** | — (없음) | — |
| `user_roles` | oauth/user | sql/CREATE_TABLE.sql:222 | V1 | 🟢 legacy | (site_users 컬럼 통합) | — | — |
| `events` | event | sql/CREATE_TABLE.sql:237 | V1 | 🟢 legacy | **site_events** | — (없음) | — |
| `coupons` | coupon | sql/CREATE_TABLE.sql:255 | V1 | 🟢 legacy | **site_coupons** | CouponMapper.xml (line 45 - **legacy 잔존 SELECT**) | — |
| `boards` | community | sql/CREATE_TABLE.sql:275 | V1 | 🟢 legacy | **site_board** | — | — |
| `posts` | community | sql/CREATE_TABLE.sql:298 | V1 | 🟢 legacy | **site_post** | — | — |
| `tags` | community | sql/CREATE_TABLE.sql:331 | V1 | 🟢 legacy | **site_tag** | — | — |
| `posts_tags` | community | sql/CREATE_TABLE.sql:348 | V1 | 🟢 legacy | **site_post_tag** | — | — |
| `coach` | coach/skill | sql/CREATE_TABLE.sql:359 | V1 | 🟣 shared | — | CoachMapper.xml | — |
| `coach_skill_condition` | coach/skill | sql/CREATE_TABLE.sql:369 | V1 | 🟣 shared | — | CoachMapper.xml | — |
| `coach_skill_buff` | coach/skill | sql/CREATE_TABLE.sql:383 | V1 | 🟣 shared | — | CoachMapper.xml | — |
| `notices` | notice | sql/CREATE_TABLE.sql:398 | V1 | 🟢 legacy | **site_notices** | — | — |
| `player_card` | player | sql/CREATE_TABLE.sql:420 | V1 | 🟢 legacy | **fun_player_card** | PlayerCardMapper.xml | — |
| `player_card_hitter_attributes` | player | sql/CREATE_TABLE.sql:469 | V1 | 🟢 legacy | **fun_player_card_hitter_stats** | PlayerCardMapper.xml | — |
| `player_card_pitcher_attributes` | player | sql/CREATE_TABLE.sql:485 | V1 | 🟢 legacy | **fun_player_card_pitcher_stats** | PlayerCardMapper.xml | — |
| `skill_score_config` | skill | sql/CREATE_TABLE.sql:502 | V1 | 🟣 shared | — | SkillScoreConfigMapper.xml | INSERT_SKILL_SCORE_CONFIG.sql |
| `quiz_answers` | quiz | sql/CREATE_TABLE.sql:530 | V1 | 🟢 legacy | **fun_quiz** | — | — |
| `kbo_team_code_mappings` | kbo | sql/CREATE_TABLE.sql:542 | V1 (KBO 결합) | 🟣 shared | — | — | INSERT_KBO_DATA_TABLE.sql |
| `kbo_seasons` | kbo | sql/CREATE_TABLE_KBO.sql:10 | V1 (신규 도메인) | 🟣 shared | — | — | (파일 내 인라인 INSERT) |
| `kbo_teams` | kbo | sql/CREATE_TABLE_KBO.sql:31 | V1 (신규 도메인) | 🟣 shared | — | — | (인라인 INSERT) |
| `kbo_games` | kbo | sql/CREATE_TABLE_KBO.sql:62 | V1 (신규 도메인) | 🟣 shared | — | KboGameMapper.xml | (인라인 INSERT/UPDATE) |
| `kbo_players` | kbo | sql/CREATE_TABLE_KBO.sql:201 | V1 (신규 도메인) | 🟣 shared | — | — | — |
| `kbo_batter_logs` | kbo | sql/CREATE_TABLE_KBO.sql:225 | V1 (신규 도메인) | 🟣 shared | — | — | — |
| `fun_teams` | player/team | sql/V2/fun/CREATE_TABLE_FUN.sql:1 | V2 | 🔵 new | **teams** | — | — |
| `fun_player_card` | player | sql/V2/fun/CREATE_TABLE_FUN.sql:21 | V2 | 🔵 new | **player_card** | fun/playerCard/PlayerCardMapper.xml | — |
| `fun_player_card_hitter_stats` | player | sql/V2/fun/CREATE_TABLE_FUN.sql:51 | V2 | 🔵 new | **player_card_hitter_attributes** | fun/playerCard/PlayerCardHitterStatsMapper.xml | — |
| `fun_player_card_pitcher_stats` | player | sql/V2/fun/CREATE_TABLE_FUN.sql:66 | V2 | 🔵 new | **player_card_pitcher_attributes** | fun/playerCard/PlayerCardPitcherStatsMapper.xml | — |
| `fun_player_card_pitcher_pitch_grades` | player | sql/V2/fun/CREATE_TABLE_FUN.sql:81 | V2 | 🔵 new | **legend_pitcher_pitch_slot** | fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml | — |
| `fun_player_card_positions` | player | sql/V2/fun/CREATE_TABLE_FUN.sql:101 | V2 | 🔵 new | (player_card.positions JSON 컬럼이 정규화된 형태로 추정) | fun/playerCard/PlayerCardPositionsMapper.xml | — |
| `fun_quiz` | quiz | sql/V2/fun/CREATE_TABLE_FUN.sql:117 | V2 | 🔵 new | **quiz_answers** | fun/quiz/QuizMapper.xml | — |
| `site_coupons` | coupon | sql/V2/site/CREATE_TABLE_SITE.sql:1 | V2 | 🔵 new | **coupons** | site/coupon/CouponMapper.xml | INSERT_SITE_COUPONS_DATA.sql |
| `site_notices` | notice | sql/V2/site/CREATE_TABLE_SITE.sql:14 | V2 | 🔵 new | **notices** | site/notice/NoticeMapper.xml | — |
| `site_events` | event | sql/V2/site/CREATE_TABLE_SITE.sql:45 | V2 | 🔵 new | **events** | site/event/EventMapper.xml | INSERT_SITE_EVENTS_DATA.sql |
| `site_users` | oauth/user | sql/V2/site/CREATE_TABLE_SITE.sql:67 | V2 | 🔵 new | **users** (+ user_roles 흡수) | UserMapper.xml | — |
| `site_board` | community | sql/V2/site/CREATE_TABLE_SITE.sql:105 | V2 | 🔵 new | **boards** | site/community/BoardMapper.xml | — |
| `site_post` | community | sql/V2/site/CREATE_TABLE_SITE.sql:136 | V2 | 🔵 new | **posts** | site/community/PostMapper.xml | — |
| `site_comment` | community | sql/V2/site/CREATE_TABLE_SITE.sql:183 | V2 | 🔵 new | (V1 에 댓글 테이블 없음 — 신규) | site/community/CommentMapper.xml | — |
| `site_tag` | community | sql/V2/site/CREATE_TABLE_SITE.sql:220 | V2 | 🔵 new | **tags** | site/community/TagMapper.xml | — |
| `site_post_tag` | community | sql/V2/site/CREATE_TABLE_SITE.sql:239 | V2 | 🔵 new | **posts_tags** | site/community/PostTagMapper.xml | — |
| `site_post_reaction` | community | sql/V2/site/CREATE_TABLE_SITE.sql:257 | V2 | 🔵 new | (V1 미존재 — 신규) | site/community/PostReactionMapper.xml | — |
| `site_comment_reaction` | community | sql/V2/site/CREATE_TABLE_SITE.sql:280 | V2 | 🔵 new | (V1 미존재 — 신규) | site/community/CommentReactionMapper.xml | — |
| `site_report` | community | sql/V2/site/CREATE_TABLE_SITE.sql:303 | V2 | 🔵 new | (V1 미존재 — 신규) | site/community/ReportMapper.xml | — |

**총 테이블 수: 49개** (V1 위치 30개 + V2 위치 19개 / KBO 5개를 V1 안의 신규 도메인으로 분리해 보면 V1-legacy 25 + V1-newDomain 5 + V2 19)

---

## 도메인별 그룹

- **player/card/team** (15): `teams`, `fun_teams`, `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career`, `legend_pitcher_pitch_slot`, `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes`, `fun_player_card`, `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`, `fun_player_card_positions`
- **skill / coach** (6): `player_skills`, `skill_pitcher_grade_stat`, `skill_score_config`, `coach`, `coach_skill_condition`, `coach_skill_buff`
- **community / board** (12): `boards`, `posts`, `tags`, `posts_tags`, `site_board`, `site_post`, `site_comment`, `site_tag`, `site_post_tag`, `site_post_reaction`, `site_comment_reaction`, `site_report`
- **user / oauth** (3): `users`, `user_roles`, `site_users`
- **notice** (2): `notices`, `site_notices`
- **event** (2): `events`, `site_events`
- **coupon** (2): `coupons`, `site_coupons`
- **quiz** (2): `quiz_answers`, `fun_quiz`
- **kbo** (6): `kbo_seasons`, `kbo_teams`, `kbo_games`, `kbo_players`, `kbo_batter_logs`, `kbo_team_code_mappings`

---

## ★ 중복/유사 (pair) 후보

가장 중요한 결과. **"이름 매칭 + 도메인 매칭 + V1↔V2 위치 매칭"** 으로 식별. **삭제 가능 여부는 판정하지 않음** — reconciler 가 BE/FE 사용처 보고 판정.

| pair A (V1) | pair B (V2) | 유사 근거 | 우선 검토 사유 |
|---|---|---|---|
| `coupons` | `site_coupons` | 동일 도메인 + 컬럼 패턴 동일 + V1/V2 prefix | 🔥 **CouponMapper.xml 가 둘 다 참조** (line 45 `FROM coupons`, line 50 `INSERT INTO site_coupons`) — 마이그레이션 진행 중 잔존 가능성 |
| `events` | `site_events` | 동일 도메인 + 컬럼 패턴 동일 | EventMapper 는 site_events 만 사용 → coupons 보다 마이그레이션 진척도 높아 보임 |
| `notices` | `site_notices` | 동일 도메인 + 컬럼 동일 + INTERNAL/EXTERNAL CHECK 제약 동일 | NoticeMapper 는 site_notices 만 사용 |
| `boards` | `site_board` | 동일 도메인 (community) + 같은 code/name/role 구조 | BoardMapper 는 site_board 만 사용. 단수/복수 네이밍 차이 |
| `posts` | `site_post` | 동일 도메인 + author/board_id 구조 동일 | site_post 가 like/dislike/report counter 추가됨 — V2 가 superset |
| `tags` | `site_tag` | 동일 도메인 + code/name 구조 동일 | 단수/복수 네이밍 차이 |
| `posts_tags` | `site_post_tag` | 매핑 테이블, 동일 PK 구조 | 단수/복수 네이밍 차이 |
| `users` (+ `user_roles`) | `site_users` | OAuth 컬럼 동일, V2 가 user_roles 를 단일 테이블로 흡수 | UserMapper 는 site_users 만 사용 → users/user_roles 는 mapper 미참조 |
| `teams` | `fun_teams` | KBO 팀 마스터, latest_team_id 구조 동일 | TeamMapper 는 teams 만 사용 / PlayerCardMapper(fun) 는 fun_teams 미참조. **불완전 마이그레이션** |
| `player_card` | `fun_player_card` | 카드 메인 테이블, card_code/grade/role 동일 | PlayerCardMapper(player) 는 player_card 사용, PlayerCardMapper(fun) 는 fun_player_card 사용 → 양쪽 살아있음 |
| `player_card_hitter_attributes` | `fun_player_card_hitter_stats` | 카드 타자 스탯, accuracy/power/speed 동일 (단 `contact` → `discipline` 컬럼 리네임됨) | 명칭 변경 의도 확인 필요 |
| `player_card_pitcher_attributes` | `fun_player_card_pitcher_stats` | 카드 투수 스탯, control/velocity/stamina 동일 | 컬럼 동일 |
| `legend_pitcher_pitch_slot` | `fun_player_card_pitcher_pitch_grades` | 투수 구종 등급 (포심/투심/슬라이더 등) | 키 구조가 pitcher_name(레전드 한정) → card_id(카드 단위) 로 변경. **레전드 특화 → 카드 일반화** |
| `quiz_answers` | `fun_quiz` | 퀴즈 회차 + 이미지 URL | round/image_url 동일. quiz_answers 는 title 보유, fun_quiz 는 미보유 |

**총 pair 후보 14개**.

---

## Orphan 테이블

마이그레이션 파일에는 존재하지만 mapper.xml 에서 SQL 참조가 발견되지 않은 것:

| 테이블 | 비고 |
|---|---|
| `users` | mapper 0 건. site_users 로 이전된 듯 — but DB 실데이터/FK 잔존 가능성 (orphan 후보) |
| `user_roles` | mapper 0 건. site_users 가 user_role/user_status 컬럼으로 흡수 |
| `events` | mapper 0 건. site_events 로 이전 |
| `boards`, `posts`, `tags`, `posts_tags` | 4 개 모두 mapper 0 건. site_* 로 이전 |
| `notices` | mapper 0 건. site_notices 로 이전 |
| `quiz_answers` | mapper 0 건. fun_quiz 로 이전 |
| `skill_pitcher_grade_stat` | 시드 (`skillGradeStat.sql`) 만 존재, mapper 미참조. **orphan 가능성** — 코드에서 안 쓰는데 시드만 박힌 케이스인지 확인 필요 |
| `kbo_team_code_mappings` | 시드만 있고 mapper 미참조 |
| `kbo_players`, `kbo_batter_logs` | KBO 신규 테이블이지만 mapper 미참조. kbocrol Python 크롤러 전용일 가능성 (지시문 따라 무시 대상) |

⚠ "mapper 미참조 = 미사용" 으로 단정 금지. Java 측 직접 SQL/raw query 가능성, 관리자 화면 한정 사용 가능성 있음. reconciler 단계에서 BE 코드 참조 확인 필요.

---

## suffix/prefix 의심 테이블

- `_old`, `_bak`, `_tmp`, `_v2`, `_new`, `_legacy` suffix **없음** — 깔끔
- prefix 패턴:
  - **`fun_*`** (6개) → V2 신규
  - **`site_*`** (11개) → V2 신규
  - **`kbo_*`** (6개) → 신규 도메인 (V1 위치지만 시기상 V2 와 동시기 추정)
  - **`player_*` / `coach_*` / `skill_*`** → V1 도메인 묶음
  - **`legend_*`** prefix (1개: `legend_pitcher_pitch_slot`) — `player_legend_*` 시리즈와 prefix 가 어긋남. 일관성 결함이지만 이전/별칭 관계 아님 추정

---

## 모호한 영역

1. **`kbo_*` 테이블이 V1 위치(sql/) 인데 명백히 신규 작업**. KBO 도메인 스키마 파일이 V2 폴더로 옮겨가지 않은 이유가 (a) "신규지만 레거시 PC 가 함께 참조" 인지 (b) "단순히 폴더 정리 안 됨" 인지 모호. → 사람 확정 필요
2. **`coupons` ↔ `site_coupons`** — CouponMapper.xml 단일 파일이 양쪽을 동시 SELECT/INSERT 함. **마이그레이션 도중인지 의도된 dual-write 인지** 모호. 가장 검토 1순위
3. **`fun_player_card_positions`** 가 V1 의 어떤 테이블 짝인지 명확하지 않음. V1 `player_card.positions` 가 JSON 컬럼이었는데 V2 에서 정규화 테이블로 분리된 케이스로 추정되지만 컬럼 단위 검토 금지 원칙상 추정에 머무름. 별도 신규일 가능성도 있음
4. **`coach`, `coach_skill_*`, `skill_score_config`, `player_skills`** — V2 짝 없음. legacy 그대로 운영 중인지 / 신규 미정인지 불명. PC 운영 의존 여부 BE 확인 필요
5. **`player_legend*`** vs **`fun_player_card`** — fun_player_card 의 `card_grade` ENUM 에 `LEGEND` 가 포함됨. V1 의 `player_legend` + 그 career 테이블들이 V2 에서 통합되었는지 (LEGEND 카드는 fun_player_card 로 일원화) 또는 별도 유지인지 모호. PlayerCardMapper(player) 가 여전히 `player_legend` 를 참조 중이라 양쪽 살아있음

---

## 참고 — 사용 ORM

- **JPA `@Entity` 0 건** (`Com2usbaseballApplication.java` 의 어노테이션은 `@SpringBootApplication` 만)
- 전부 **MyBatis** (`src/main/resources/mapper/*.xml`)
- → 위 표의 "MyBatis 매핑" 컬럼이 사실상 "JPA 매핑" 자리를 대체함

---

## ★ Owner 확정 (오너 의도 — 모호 영역 해소)

> Scout 가 추정/모호로 남긴 항목에 대한 오너의 실제 의도. analyzer 단계는 이걸 사실(constraint)로 받아들이고 진행한다.

### 1. `kbo_*` 가 V1 폴더(`sql/`)에 남은 이유 — **보류 중인 미완 작업**
- 의도: KBO 도메인은 **신규 작업**. Python 크롤러(`kbocrol/`)로 데이터 채우려다 **v2 모바일 UI 리뉴얼로 우선순위 전환** → 보류 상태
- 현재 폴더가 V1 위치인 건 단순히 정리 안 된 것. **의도상 V2 신규 도메인**
- 후속 결정: 모바일 리뉴얼 마무리 후 재진입 시 `sql/V2/kbo/` 로 이동 필요
- analyzer 가 알아야 할 점: kbo_* 테이블은 "legacy 운영 중" 으로 보면 **틀림**. 운영 데이터 거의 없음 추정 (kbocrol 미가동)

### 2. `coupons` ↔ `site_coupons` (CouponMapper 양쪽 동시 사용) — **의도된 dual-write 맞음**
- 의도: 진행 중인 마이그레이션이 아니라 **의도된 dual-write 운영**
- 후속 결정: dual-write 유지를 정책으로 굳히는지 / 단방향으로 정리하는지는 별도 product 의사결정. analyzer 는 "dual-write 의도됨" 을 전제로 매핑 분석
- analyzer 가 알아야 할 점: dual-write 가 깨지면 양쪽 데이터 불일치 → 운영 사고. 절대 한 쪽 row 만 다루는 코드 신규 추가 금지

### 3. `fun_player_card_positions` — **JSON 컬럼 정규화 의도, 미완**
- 의도: V1 `player_card.positions` 가 **JSON 컬럼이라 DB 콘솔에서 보기 불편** → 정규화된 별도 테이블로 분리하려고 신규 생성
- 현재 상태: 프로젝트 규모 커지면서 오너 본인도 헷갈려서 **방치 중**. fun_player_card 와 연결 마무리 안 됨
- 후속 결정: fun_player_card 통폐합 작업의 일부로 함께 진행 예정
- analyzer 가 알아야 할 점: V1 `player_card.positions` (JSON) ↔ V2 `fun_player_card_positions` (정규화 행) 는 **데이터 형태가 달라 1:N 관계**. 짝(pair) 으로 분류는 맞지만 컬럼 1:1 매칭은 안 됨

### 4. `coach`, `coach_skill_*` (그룹 1) / `player_skills`, `skill_score_config`, `skill_pitcher_grade_stat` (그룹 2) — **두 갈래 보류**
- **그룹 1 (coach 계열)**: 추가 기획 후 진행 예정 — 단 ~~BE 코드 아직 작성 안 함~~ → ✅ **BE wired 확정 (Owner 기억 정정)**
  - `CoachSkillServiceImpl` + `CoachRepository` + `CoachMapper.xml` + `@Cacheable` (Caffeine) + `GET /api/skills/coach` 공개 모두 작동 중
  - 즉 그룹 1 은 "DB + BE 모두 운영 중" 으로 재분류. 추가 기획은 **신규 기능 확장** 의미이지 "현재 미작동" 의미가 아님
  - reconciler/be-db-mismatch §A 에서 spot-check 로 확정
- **그룹 2 (skill 계열)**: V2 기반으로 **table 재구조화 후 적용 필요**. 게임사 업데이트 시 컬럼 변경/상향/하향 발생 → 컬럼 추가 여지 두려고 보류 중
- 후속 결정:
  - 그룹 1: 신규 기획 시 V2 fun_/site_ 패턴으로 이전 검토
  - 그룹 2: V2 폴더로 이전 + 재구조화. 우선순위는 모바일 리뉴얼 마무리 이후
- analyzer 가 알아야 할 점:
  - ~~coach_* 는 "DB 만 살아있고 BE 미연결"~~ → 정정: coach_* 는 운영 중. dead-suspects 후보 아님
  - skill_* 는 V1 그대로 운영 중. V2 짝 테이블 신설 전까지 dual 로 분류 X

### 5. `player_legend*` ↔ `fun_player_card` (LEGEND ENUM) — **fun_player_card 로 통폐합 계획, 배포는 legacy**
- 의도: `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career`, `legend_pitcher_pitch_slot` 모두 **V2 `fun_player_card` 로 통폐합** 계획 (LEGEND 카드를 일반 카드 시스템에 흡수)
- 현재 상태: 작업 진행 중이었으나, **배포 버전은 구 legacy 기반**이라 player_legend* 는 운영 중. PlayerCardMapper(player) 가 player_legend 참조하는 것도 그래서
- 후속 결정: 배포가 V2 fun_ 기반으로 전환되면 player_legend* 폐기
- analyzer 가 알아야 할 점:
  - `player_legend*` 4개 테이블은 "운영 중 legacy + 폐기 예정" 두 속성을 동시에 가짐
  - LEGEND 카드 데이터의 single source of truth 결정이 product 의사결정 미정 (V1 vs V2)

---

## ★ 정정 사항 (db-map.md 본문 추정 → Owner 확정 기준 갱신 필요)

본문 표/그룹의 다음 분류는 위 Owner 확정에 따라 수정/갱신 필요. analyzer 단계 진입 전에 본 섹션을 우선 신뢰할 것:

| 본문 분류 | Owner 확정 후 분류 | 사유 |
|---|---|---|
| `kbo_*` 6개 = "V1 위치 (신규 도메인)" / 🟣 shared | **🔵 V2 신규 (보류)** | 폴더만 V1 위치, 의도는 V2 신규 |
| `coupons` ↔ `site_coupons` "마이그레이션 진행 중 잔존 가능성" | **의도된 dual-write (운영 정책)** | 마이그 아님 |
| `fun_player_card_positions` "1:1 짝 후보" | **1:N 정규화 관계 (JSON → 행)** | 컬럼 단위 매칭 아님 |
| `coach`, `coach_skill_*` "shared 운영 중" | **BE 코드 미연결 (의도상 미완)** | 오너 기억 — BE analyzer 가 검증 필요 |
| `skill_*` "shared 운영 중" | **legacy 운영 + V2 재구조화 보류** | V2 짝 신설 전까지 단일 운영 |
| `player_legend*` "legacy" | **legacy 운영 + 폐기 예정 (fun_player_card 통합 계획)** | 배포가 legacy 기반이라 살아있음 |

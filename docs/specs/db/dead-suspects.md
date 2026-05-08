# dead-suspects.md — Mapper 0건 테이블 / suffix 의심 / 정적 분석 한계 명시

> 입력: `tables.md` (전체 49 테이블) + `mapper-mapping.md` (참조 25개).
> 본 문서는 **DB + mapper 단독 정적 분석** 결과. 실제 운영 데이터 row 수는 다음 단계 `legacy-db-runtime-analyzer` 에서 확인 필요.
>
> Owner 확정 카테고리에 따른 분류:
>   - `kbo_*` 6개: "신규 보류, mapper 미참조 정상" (Owner 1)
>   - `users`/`user_roles`/`events`/`boards`/`posts`/`tags`/`posts_tags`/`notices`/`quiz_answers`: "site_*/fun_* 로 이전, mapper 0건 정상" (Owner 정황)
>   - `coach*`: "DB 만 살아있고 BE 미연결" 의도였으나 **mapper 발견됨 → Owner 기억과 어긋남** (Owner 4그룹1)
>   - `skill_*`: "V2 재구조화 보류" — mapper 1건만 있고, 일부는 시드만 있음

## ⚠ 정적 분석 한계 (전제)

1. **`mapper 0건` 이 곧 `미사용` 은 아님**:
   - Java 측 `@SqlSession` 또는 raw JDBC 사용처가 있을 수 있음 (본 프로젝트는 미발견 추정 — JPA 0건 + mapper-locations 외 SQL 검색 대상 없음)
   - 관리자 화면 / 배치성 SQL 이 mapper 외부에 정의됐을 가능성
   - mapper 외부 SQL 파일 (`sql/insertData/`, `sql/updateData/`) 은 운영 시드/패치성으로 본 분석에서 제외
2. **fun/playerCard 5개 mapper 의 namespace mismatch** (mapper-mapping.md 참고): mapper 가 존재해도 MyBatis binding 실패 가능. "mapper 1건 이상이면 운영 중" 단정 X
3. **운영 row 수**: 본 단계에서는 0행/N행 구분 불가. row 수가 0인 테이블도 mapper 만 보면 활성처럼 보임 → runtime 단계 필수

---

## 1. Mapper 0건 테이블 — 분류별 처리

총 **49 - 25(mapper로 참조됨) - … 추가 보정** = mapper 참조 0건 테이블 약 **22개**. 분류:

### 1-A. ⚪ 이전완료 정상 (V2 로 이전, 운영은 V2) — 9개

| 테이블 | V2 짝 (mapper) | 처리 |
|---|---|---|
| `users` | `site_users` (`mapper/UserMapper.xml`) | 정상. 운영 검증만 필요 (FK 잔존, ban_reason 데이터 손실 여부) |
| `user_roles` | `site_users` 흡수 | 정상. user_roles row 가 site_users.user_role/user_status 로 이전됐는지 검증 필요 |
| `events` | `site_events` (`mapper/site/event/EventMapper.xml`) | 정상 |
| `notices` | `site_notices` (`mapper/site/notice/NoticeMapper.xml`) | 정상. image_url, published_at V2 만 추가 |
| `boards` | `site_board` (`mapper/site/community/BoardMapper.xml`) | 정상 |
| `posts` | `site_post` (`mapper/site/community/PostMapper.xml`) | 정상. counter 컬럼은 V2 만 |
| `tags` | `site_tag` (`mapper/site/community/TagMapper.xml`) | 정상 (단/복수만) |
| `posts_tags` | `site_post_tag` (`mapper/site/community/PostTagMapper.xml`) | 정상 |
| `quiz_answers` | `fun_quiz` (`mapper/fun/quiz/QuizMapper.xml`) | 정상. ⚠ `title` 컬럼 V2 손실 |

→ **runtime 검증 요청**: 각 legacy 테이블의 row 수 = V2 짝 row 수 인지. 양쪽 합쳐 총 row 가 어느 한쪽에 몰려 있어야 정상 (이전 후 legacy 는 freeze).

### 1-B. 🔵⏸ new(V2 보류) — kbo_* 5개 + fun_teams + kbo_team_code_mappings + fun_player_card_positions — 8개

| 테이블 | mapper 상태 | Owner 진술 |
|---|---|---|
| `kbo_seasons` | mapper 0건 (인라인 INSERT 1건만 sql:23) | Owner 1: "kbo 보류, 데이터 거의 없음 추정" — **정상** |
| `kbo_teams` | mapper 0건 (인라인 INSERT 10팀 sql:42) | Owner 1: 보류 — **정상** |
| `kbo_games` | mapper 1건 (`KboGameMapper.xml` 3 SELECT 만) | 일부 read-only mapper 만 — Owner 1 진술과 부분 일치 (read 만 동작, write 는 kbocrol 외부에서?) |
| `kbo_players` | mapper 0건 | Owner 1: 보류 — **정상** |
| `kbo_batter_logs` | mapper 0건 | Owner 1: 보류 — kbocrol 전용 추정 |
| `kbo_team_code_mappings` | mapper 0건 (시드만 `INSERT_KBO_DATA_TABLE.sql`) | 보류 — **정상** |
| `fun_teams` | mapper 0건 | Owner: **불완전 마이그**. fun_player_card.team_id FK 가 fun_teams 를 참조하므로, fun_teams 가 비어있다면 fun_player_card insert 실패 위험 |
| `fun_player_card_positions` | mapper **있음** (PlayerCardPositionsMapper.xml — 풀세트 CRUD) but ⚠ namespace mismatch | Owner 3: "JSON→정규화 의도, 미완·방치". mapper 작성됐으나 실제 호출 가능 여부는 namespace 문제 때문에 의문 |

### 1-C. 🟢⚠ legacy(폐기예정), mapper 0건 — 1개

| 테이블 | 처리 |
|---|---|
| `legend_pitcher_pitch_slot` | mapper 0건. Owner 5: V2 `fun_player_card_pitcher_pitch_grades` 로 통폐합 계획. 시드 (`INSERT_DATA_TABLE.sql`) 로만 read-only 데이터 채워졌을 가능성 높음. **runtime row 수 검증 필요** |

### 1-D. 🟣 shared, mapper 0건 — orphan 의심 — 1개

| 테이블 | 처리 |
|---|---|
| `skill_pitcher_grade_stat` | mapper 0건, V2 짝 없음, 시드 (`skillGradeStat.sql`) 만 존재. **orphan 가능성 가장 높음**. Owner 4그룹2: "skill_* 는 V2 재구조화 보류" → 신규 짝 없음 + mapper 없음 + 시드만 있으면 사실상 dead. 단 단정은 runtime 후 |

---

## 2. Mapper 발견 but Owner 진술상 "미연결" 인 테이블 (★ 검증 필요)

### 2-A. coach 계열 3개 — Owner 4 그룹1

| 테이블 | mapper | Owner 진술 |
|---|---|---|
| `coach` | `mapper/CoachMapper.xml:8` (selectAllCoaches) | "BE 코드 아직 작성 안 함" — **mapper 발견됨, 어긋남** |
| `coach_skill_condition` | `mapper/CoachMapper.xml:18` (selectAllCoachSkillCondition) | 동상 |
| `coach_skill_buff` | `mapper/CoachMapper.xml:13` (selectAllCoachSkillBuff) | 동상 |

→ Owner 의 기억과 mapper 존재가 충돌. 확인 항목:
1. `domain/skill/repository/mapper/CoachMapper.java` 인터페이스 존재 (확인 완료) — namespace 일치
2. service / controller 레이어에서 호출되는지 (BE-analyzer 영역, runtime 으로 일부 검증 가능)
3. 운영 row 수 (시드 없음 — `sql/insertData/` 에 coach 관련 시드 파일 없음)
4. 만약 row 0 + 호출 0 이면 Owner 진술 일치, mapper 는 미사용 코드로 남음

---

## 3. suffix / prefix 의심 패턴

### 3-A. suffix 검사

`_old`, `_bak`, `_tmp`, `_v2`, `_new`, `_legacy`, `_archive`, `_temp`: **모두 0건**. 깨끗.

### 3-B. prefix 패턴 (재확인)

| prefix | 개수 | 분류 | 비고 |
|---|---:|---|---|
| `fun_*` | 6 | 🔵 V2 신규 | 5 active, 1 보류(positions) — 전부 namespace mismatch 위험 |
| `site_*` | 11 | 🔵 V2 신규 | 모두 mapper 있고 namespace 정상 |
| `kbo_*` | 6 | 🔵⏸ V2 신규(보류) | mapper 1건 (kbo_games), 5건은 0건 |
| `player_*` | 5 | 🟢/🟢⚠ legacy | player_legend 계열 4개 폐기예정, player_card/attrs 3개 운영 중 |
| `legend_*` | 1 | 🟢⚠ legacy | 단일 테이블 prefix 일관성 결함 (`legend_pitcher_pitch_slot`) |
| `coach_*` | 3 (coach + skill_buff + skill_condition) | 🟣⏸ BE 미연결 추정 | mapper 발견 — 검증 필요 |
| `skill_*` | 3 | 🟣 shared | 1 mapper 있음, 1 mapper 0건 (orphan 의심), 1 mapper 있음 |

---

## 4. orphan 후보 우선순위 (runtime 검증 요청 우선순위)

| 우선순위 | 테이블 | 판단 근거 | 검증 액션 |
|---:|---|---|---|
| ★★★ | `skill_pitcher_grade_stat` | V2 짝 없음 + mapper 0건 + 시드만 | row 수 + 코드 grep 추가 |
| ★★ | `legend_pitcher_pitch_slot` | mapper 0건 + V2 짝 있음(fun_player_card_pitcher_pitch_grades) | row 수, V2 짝 row 와 비교 |
| ★★ | `kbo_team_code_mappings` | 시드만, mapper 0건 | row 수 (시드 행 수 만 있으면 정상) |
| ★★ | `coach`, `coach_skill_buff`, `coach_skill_condition` | mapper 있음 but Owner 미연결 진술 | row 수 + service 호출 grep |
| ★ | `kbo_*` 5개 (games 외) | Owner 진술상 보류 | row 수 0 예상 — 0이면 진술 일치 |
| ★ | `fun_teams` | 마이그 미완 | row 수 0이면 fun_player_card 의 team_id FK 가 NULL 만 가능 |
| ★ | `fun_player_card_positions` | mapper 있고 namespace mismatch | namespace 수정 후 재가동 또는 제거 결정 필요 |

---

## 5. 종합 요청 (runtime-analyzer 입력)

| 항목 | 검증 요청 |
|---|---|
| dual-write 정합성 | `coupons` vs `site_coupons` row 수 동기화 — Owner 진술이 정책이라면 양쪽 일치, 아니면 불일치 (★1순위) |
| 마이그 완료성 | `users`/`user_roles` 합 = `site_users` row 수, `events` = `site_events`, `boards` = `site_board`, `posts` = `site_post`, `tags` = `site_tag`, `posts_tags` = `site_post_tag`, `notices` = `site_notices`, `quiz_answers` = `fun_quiz` |
| 고립 테이블 | `skill_pitcher_grade_stat`, `legend_pitcher_pitch_slot`, `kbo_team_code_mappings` row 수 |
| 보류 도메인 | `kbo_seasons/teams/players/batter_logs/games`, `fun_teams`, `fun_player_card_positions` row 수 |
| BE 미연결 의심 | `coach`, `coach_skill_buff`, `coach_skill_condition` row 수 + 컨트롤러 노출 여부 |
| FK 정합성 | `fun_player_card.team_id` 가 모두 NULL 이거나 fun_teams.id 와 매칭되는지 (fun_teams row 수 0이면 NULL 만 가능) |
| namespace mismatch 영향 | fun/playerCard 5개 mapper 가 실제 호출 시 BindingException 발생하는지 |

# 운영 DB 실측 현황 (compyafun, 2026-08-20)

> JDBC 로 운영 MariaDB 를 직접 조회한 raw 데이터 기반 현황 문서. "모바일 v2 기준 안 쓰는 테이블" 판정의 근거 자료.
> 원인 추론 없음 — 행수/갱신시각/정의위치 등 사실만 기록. 판단이 필요한 항목은 "미확인"으로 남김.

## §1 개요

| 항목 | 값 |
|---|---|
| 조회 대상 | MariaDB 10.5.29, 스키마 `compyafun` |
| 조회 시각 | 2026-08-20 저녁 |
| BASE TABLE 총수 | 53 |
| VIEW / PROCEDURE / TRIGGER | 0건 (전체 조회 결과 없음) |
| 기준일 (§5 최근 30일 계산) | 2026-08-20 |

계열별 개수

| 계열 | 개수 | 스키마 파일 |
|---|---|---|
| legacy V1 (site 계열) | 10 | `sql/CREATE_TABLE.sql` |
| legacy V1 (선수·스킬 계열) | 14 | `sql/CREATE_TABLE.sql` |
| KBO | 6 | `sql/CREATE_TABLE_KBO.sql` (+ 1개 legacy 파일 정의, §2-3 비고 참조) |
| V2 site_ | 12 | `sql/V2/site/CREATE_TABLE_SITE.sql` |
| V2 fun_ | 7 | `sql/V2/fun/CREATE_TABLE_FUN.sql` (fun_quiz 는 `sql/compyafun-v3_fun.sql` 이 최신 정의) |
| V3 wiki_ | 3 | `sql/V3/site/CREATE_WIKI_TABLES.sql` |
| V3 site_refresh_tokens | 1 | `sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql` |
| **합계** | **53** | |

> 각주: `UPDATE_TIME` 은 MariaDB InnoDB 메타데이터 값으로, **서버 재시작 시 초기화될 수 있음** (특히 통계 미갱신 상태에서 NULL/blank 로 보일 수 있음). 아래 표의 "갱신 없음" 표기는 "실제로 변경이 없었다"가 아니라 "이 값을 신뢰하기 어렵다"로 해석할 것.

---

## §2 계열별 전수 목록

### 2-1. legacy V1 (site 계열) — `sql/CREATE_TABLE.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| users | 305 | 2026-08-20 22:40:16 | CREATE_TABLE.sql:205 | V2 site_users 로 대응 (§3) |
| user_roles | 305 | 2026-08-14 22:21:11 | CREATE_TABLE.sql:222 | users.id FK, V2 site_users 로 role/status 통합 |
| events | 33 | 2026-08-12 07:51:33 | CREATE_TABLE.sql:237 | V2 site_events 로 대응 (§3) |
| coupons | 50 | 2026-08-12 07:56:17 | CREATE_TABLE.sql:255 | V2 site_coupons 로 대응 (§3) |
| boards | 4 | 2026-02-08 15:26:06 | CREATE_TABLE.sql:275 | V2 site_board 로 대응 (§3) |
| posts | 242 | 2026-02-08 15:26:21 | CREATE_TABLE.sql:298 | V2 site_post 로 대응 (§3) |
| tags | 6 | 2026-02-08 15:27:53 | CREATE_TABLE.sql:331 | V2 site_tag 로 대응 (§3) |
| posts_tags | 0 | 갱신 없음 (생성 2026-02-03 02:08:10) | CREATE_TABLE.sql:348 | V2 site_post_tag 로 대응 (§3) |
| notices | 0 | 갱신 없음 (생성 2026-02-08 11:54:16) | CREATE_TABLE.sql:398 | V2 site_notices 로 대응 (§3) |
| quiz_answers | 5 | 2026-05-08 17:45:59 | CREATE_TABLE.sql:530 | V2/V3 fun_quiz 로 대응 (추가 발견 pair, §3) |

### 2-2. legacy V1 (선수·스킬 계열) — `sql/CREATE_TABLE.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| teams | 20 | 2026-01-19 02:36:32 | CREATE_TABLE.sql:16 | V2 fun_teams 로 대응 (§3) |
| player_skills | 92 | 2026-02-04 19:49:44 | CREATE_TABLE.sql:3 | V2/V3 대응 테이블 미확인 |
| player_legend | 62 | 2026-01-23 01:40:58 | CREATE_TABLE.sql:37 | V2/V3 대응 테이블 미확인 |
| player_legend_hitter_career | 40 | 2026-01-21 23:23:43 | CREATE_TABLE.sql:70 | player_legend.name FK, V2/V3 대응 미확인 |
| player_legend_pitcher_career | 22 | 2026-01-21 23:26:25 | CREATE_TABLE.sql:107 | player_legend.name FK, V2/V3 대응 미확인 |
| legend_pitcher_pitch_slot | 22 | 2026-01-22 23:19:57 | CREATE_TABLE.sql:141 | player_legend.name FK, V2/V3 대응 미확인 |
| skill_pitcher_grade_stat | 120 | 2026-01-23 01:15:16 | CREATE_TABLE.sql:179 | player_skills FK, V2/V3 대응 미확인 |
| skill_score_config | 97 | 2026-03-28 18:37:11 | CREATE_TABLE.sql:502 | player_skills FK, V2/V3 대응 미확인 |
| coach | 6 | 2026-02-04 23:56:54 | CREATE_TABLE.sql:359 | V2/V3 대응 테이블 미확인 (FK 없음) |
| coach_skill_condition | 23 | 2026-02-05 00:05:48 | CREATE_TABLE.sql:369 | V2/V3 대응 테이블 미확인 |
| coach_skill_buff | 24 | 2026-02-05 00:15:08 | CREATE_TABLE.sql:383 | V2/V3 대응 테이블 미확인 |
| player_card | 0 | 갱신 없음 (생성 2026-02-25 07:10:39) | CREATE_TABLE.sql:420 | V2 fun_player_card 로 대응 (§3) |
| player_card_hitter_attributes | 0 | 갱신 없음 (생성 2026-02-25 07:10:41) | CREATE_TABLE.sql:469 | V2 fun_player_card_hitter_stats 로 대응 (§3) |
| player_card_pitcher_attributes | 0 | 갱신 없음 (생성 2026-02-25 07:10:43) | CREATE_TABLE.sql:485 | V2 fun_player_card_pitcher_stats 로 대응 (§3) |

### 2-3. KBO 계열 — `sql/CREATE_TABLE_KBO.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| kbo_games | 735 | 2026-08-20 09:00:00 | CREATE_TABLE_KBO.sql:62 | 가장 활발히 갱신되는 테이블 |
| kbo_batter_logs | 530 | 2026-04-02 01:25:26 | CREATE_TABLE_KBO.sql:225 | kbo_games/kbo_players FK |
| kbo_players | 167 | 2026-04-02 01:25:26 | CREATE_TABLE_KBO.sql:201 | kbo_teams FK |
| kbo_teams | 10 | 갱신 없음 (생성 2026-04-02 00:59:53) | CREATE_TABLE_KBO.sql:31 | |
| kbo_seasons | 1 | 갱신 없음 (생성 2026-04-02 00:59:53) | CREATE_TABLE_KBO.sql:10 | |
| kbo_team_code_mappings | 10 | 2026-04-02 22:46:36 | **CREATE_TABLE.sql:542 (legacy 파일)** | ⚠️ `kbo_` 접두사이나 정의는 legacy `CREATE_TABLE.sql` 안에 위치 (파일 위치 drift). FK 대상이 legacy `teams` (§6, §7) |

### 2-4. V2 site_ 계열 — `sql/V2/site/CREATE_TABLE_SITE.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| site_users | 123 | 2026-08-20 18:43:09 | CREATE_TABLE_SITE.sql:67 | users+user_roles 통합 대응 (§3) |
| site_coupons | 28 | 2026-04-03 23:52:40 | CREATE_TABLE_SITE.sql:1 | coupons 대응 (§3) |
| site_events | 21 | 2026-04-04 01:46:26 | CREATE_TABLE_SITE.sql:45 | events 대응 (§3) |
| site_notices | 6 | 2026-04-04 12:46:25 | CREATE_TABLE_SITE.sql:14 | notices 대응 (§3) |
| site_refresh_tokens | 2 | 2026-08-20 18:43:09 | (V3 파일, §2-6) | site_users FK |
| site_board | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:105 | boards 대응 (§3) |
| site_post | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:136 | posts 대응 (§3) |
| site_tag | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:220 | tags 대응 (§3) |
| site_post_tag | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:239 | posts_tags 대응 (§3) |
| site_comment | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:183 | legacy 대응 없음 (신규 기능) |
| site_post_reaction | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:257 | legacy 대응 없음 (신규 기능) |
| site_comment_reaction | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:280 | legacy 대응 없음 (신규 기능) |
| site_report | 0 | 갱신 없음 (생성 2026-04-04 05:24:04) | CREATE_TABLE_SITE.sql:303 | legacy 대응 없음 (신규 기능) |

### 2-5. V2 fun_ 계열 — `sql/V2/fun/CREATE_TABLE_FUN.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| fun_teams | 20 | 2026-04-03 00:09:13 | CREATE_TABLE_FUN.sql:1 | teams 대응 (§3) |
| fun_player_card | 0 | 갱신 없음 (생성 2026-04-03 00:05:27) | CREATE_TABLE_FUN.sql:21 | player_card 대응 (§3) |
| fun_player_card_hitter_stats | 0 | 갱신 없음 (생성 2026-04-03 00:25:17) | CREATE_TABLE_FUN.sql:51 | player_card_hitter_attributes 대응 (§3) |
| fun_player_card_pitcher_stats | 0 | 갱신 없음 (생성 2026-04-03 00:25:20) | CREATE_TABLE_FUN.sql:66 | player_card_pitcher_attributes 대응 (§3) |
| fun_player_card_pitcher_pitch_grades | 0 | 갱신 없음 (생성 2026-04-03 00:25:22) | CREATE_TABLE_FUN.sql:81 | legacy 대응 없음 (신규 세분화 테이블) |
| fun_player_card_positions | 0 | 갱신 없음 (생성 2026-04-03 00:25:24) | CREATE_TABLE_FUN.sql:101 | legacy 대응 없음 (player_card.positions longtext 대체 추정, 원인 미확인) |
| fun_quiz | 0 | 갱신 없음 (생성 2026-05-09 15:31:34) | **`sql/compyafun-v3_fun.sql`이 최신 정의** (CREATE_TABLE_FUN.sql:117 은 구버전, §6) | quiz_answers 대응 (§3) |

### 2-6. V3 wiki_ 계열 — `sql/V3/site/CREATE_WIKI_TABLES.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| wiki_pitch | 0 | 갱신 없음 (생성 2026-05-31 19:57:32) | CREATE_WIKI_TABLES.sql:7 | legacy 대응 없음 (신규) |
| wiki_pitch_grade | 0 | 갱신 없음 (생성 2026-05-31 19:57:38) | CREATE_WIKI_TABLES.sql:20 | wiki_pitch FK |
| wiki_stat_influence | 0 | 갱신 없음 (생성 2026-05-31 19:57:41) | CREATE_WIKI_TABLES.sql:34 | legacy 대응 없음 (신규) |

### 2-7. V3 site_refresh_tokens — `sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql`

| 테이블 | 행수 | 최종 갱신 | 스키마 정의 위치 | 비고 |
|---|---|---|---|---|
| site_refresh_tokens | 2 | 2026-08-20 18:43:09 | CREATE_TABLE_REFRESH_TOKENS.sql:10 | site_users FK, legacy 대응 없음 (신규 인증 체계) |

**형상 drift 총평**: 운영 53 테이블 전부가 4개 스키마 파일(`CREATE_TABLE.sql`, `CREATE_TABLE_KBO.sql`, `V2/site`, `V2/fun`, `V3/*`) 중 하나에 정의를 갖고 있음. **스키마 파일에 없는데 운영에만 있는 테이블 / 스키마엔 있는데 운영에 없는 테이블은 발견되지 않음.** 단, 아래 2건은 "정의 위치 자체의 drift":
1. `kbo_team_code_mappings` — 이름은 KBO 계열이지만 legacy `CREATE_TABLE.sql` 안에 정의됨.
2. `fun_quiz` — `CREATE_TABLE_FUN.sql`(V2, is_visible 컬럼 있음)과 `compyafun-v3_fun.sql`(V3, is_visible 컬럼 DROP) 두 파일에 **서로 다른 컬럼 구조로 중복 정의**. 운영 실측 컬럼은 V3 쪽과 일치 (§6).

---

## §3 legacy ↔ V2 대응쌍 비교

| legacy 테이블 (행수/최종갱신) | V2 테이블 (행수/최종갱신) | 어느 쪽이 살아있나 | 컬럼 구조 차이 요약 |
|---|---|---|---|
| users (305 / 2026-08-20 22:40:16) | site_users (123 / 2026-08-20 18:43:09) | ⚠️ 둘 다 최근 갱신 — §6 위험신호 | site_users 가 users+user_roles 를 하나로 통합 (user_role, user_status 컬럼 내장) + email(관리자표시용)/oauth_provider 등 명칭 정리 |
| user_roles (305 / 2026-08-14 22:21:11) | site_users (위와 동일) | site_users 로 흡수 | user_roles.role/status → site_users.user_role/user_status 로 통합 |
| coupons (50 / 2026-08-12 07:56:17) | site_coupons (28 / 2026-04-03 23:52:40) | ⚠️ legacy 최근 갱신 — §6 위험신호 | 컬럼 구조 거의 동일 (site_coupons 는 expire_at/is_visible 의 MUL 인덱스만 제거) |
| events (33 / 2026-08-12 07:51:33) | site_events (21 / 2026-04-04 01:46:26) | ⚠️ legacy 최근 갱신 — §6 위험신호 | 컬럼 구조 거의 동일 (1:1 매핑) |
| notices (0 / 갱신없음) | site_notices (6 / 2026-04-04 12:46:25) | site_notices 쪽이 활성 | site_notices 가 image_url, published_at 컬럼 추가 |
| boards (4 / 2026-02-08 15:26:06) | site_board (0 / 갱신없음, 생성 2026-04-04) | 판단 보류 — boards 최종갱신이 site_board 생성보다 이전이라 이관 이후 무변경으로 추정되나, site_board 실사용 여부는 행수 0 이라 미확인 | site_board 가 use_comment/use_like/use_tag/is_deleted/sort_order 5개 컬럼 확장 |
| posts (242 / 2026-02-08 15:26:21) | site_post (0 / 갱신없음, 생성 2026-04-04) | 판단 보류 (위와 동일 사유) | site_post 가 is_deleted/comment_count/like_count/dislike_count/report_count 5개 컬럼 확장 (댓글·반응·신고 기능 연동) |
| tags (6 / 2026-02-08 15:27:53) | site_tag (0 / 갱신없음, 생성 2026-04-04) | 판단 보류 (위와 동일 사유) | 컬럼 구조 거의 동일 |
| posts_tags (0 / 갱신없음) | site_post_tag (0 / 갱신없음) | 미확인 (양쪽 다 갱신 이력 없음) | 컬럼 구조 동일 (post_id+tag_id 복합 PK) |
| player_card (0 / 갱신없음) | fun_player_card (0 / 갱신없음) | 미확인 (양쪽 다 행수 0) | player_card.name→player_name, role→player_role, overall→overall_rating 개명. player_card.back_number/birth_date/bat_throw/traits(longtext) 는 fun_player_card 에 대응 컬럼 없음 (컬럼 소실 여부 원인 미확인). positions(longtext) → fun_player_card_positions 별도 테이블로 분리 |
| player_card_hitter_attributes (0) | fun_player_card_hitter_stats (0) | 미확인 | contact → discipline 개명, 나머지 4개(accuracy/power/speed/defense) 동일 |
| player_card_pitcher_attributes (0) | fun_player_card_pitcher_stats (0) | 미확인 | 5개 컬럼(control/velocity/stamina/fastball/breaking) 동일. 신규로 fun_player_card_pitcher_pitch_grades(구종별 등급 10종) 가 추가 분리됨 — legacy 에 대응 없음 |
| teams (20 / 2026-01-19 02:36:32) | fun_teams (20 / 2026-04-03 00:09:13) | fun_teams 쪽이 최근 | teams.city → fun_teams.city_name 개명 외 동일 |
| **quiz_answers** (5 / 2026-05-08 17:45:59) — 추가 발견 pair | **fun_quiz** (0 / 갱신없음, 생성 2026-05-09 15:31:34) | 판단 보류 — fun_quiz 행수 0, quiz_answers 는 5행 보유 | quiz_answers(title 컬럼 있음, is_visible 있음) → fun_quiz 는 title 없음(서버 동적 생성 정책, V3 주석 근거) + is_visible 도 V3 정의에서 DROP됨. round/image_url 은 동일 |

**대응쌍 탐색 결과**: 문제에서 제시된 10개 쌍 확인 완료 + `quiz_answers ↔ fun_quiz` 1개 쌍 추가 발견. `coach`/`coach_skill_buff`/`coach_skill_condition`/`player_skills`/`player_legend*`/`skill_pitcher_grade_stat`/`skill_score_config`/`legend_pitcher_pitch_slot` (레전드·스킬·코치 시스템 8개 테이블)은 V2/V3 스키마 파일 어디에도 대응 테이블이 없음 — 대응쌍 매칭 불가, 대응 없음으로 확인.

---

## §4 행수 0 테이블

총 22개.

| 계열 | 테이블 |
|---|---|
| legacy 선수·스킬 (3) | player_card, player_card_hitter_attributes, player_card_pitcher_attributes |
| legacy site (1) | notices |
| V2 fun_ (6) | fun_player_card, fun_player_card_hitter_stats, fun_player_card_pitcher_pitch_grades, fun_player_card_pitcher_stats, fun_player_card_positions, fun_quiz |
| V2 site_ (8) | site_board, site_post, site_tag, site_post_tag, site_comment, site_post_reaction, site_comment_reaction, site_report |
| V3 wiki_ (3) | wiki_pitch, wiki_pitch_grade, wiki_stat_influence |
| posts_tags (1, legacy) | posts_tags |

---

## §5 최근 30일 갱신 테이블 (기준일 2026-08-20, `update_time` ≥ 2026-07-21)

갱신 시각 내림차순.

| 순위 | 테이블 | 최종 갱신 |
|---|---|---|
| 1 | users | 2026-08-20 22:40:16 |
| 2 | site_users | 2026-08-20 18:43:09 |
| 2 | site_refresh_tokens | 2026-08-20 18:43:09 |
| 4 | kbo_games | 2026-08-20 09:00:00 |
| 5 | user_roles | 2026-08-14 22:21:11 |
| 6 | coupons | 2026-08-12 07:56:17 |
| 7 | events | 2026-08-12 07:51:33 |

이 외 46개 테이블은 `update_time` 이 2026-07-21 이전이거나 값 없음 (§1 각주 참조).

---

## §6 위험 신호

### 6-1. legacy 가 V2 보다 최근 갱신 (원인 미확인)

| 대응쌍 | legacy 최종 갱신 | V2 최종 갱신 | 차이 |
|---|---|---|---|
| users ↔ site_users | 2026-08-20 22:40:16 | 2026-08-20 18:43:09 | legacy 가 약 4시간 뒤 |
| coupons ↔ site_coupons | 2026-08-12 07:56:17 | 2026-04-03 23:52:40 | legacy 가 약 4개월 뒤 |
| events ↔ site_events | 2026-08-12 07:51:33 | 2026-04-04 01:46:26 | legacy 가 약 4개월 뒤 |

원인 미확인 — 별도 조사 필요 (예: 배치/스케줄러가 legacy 테이블을 계속 쓰고 있는지, 관리자 화면이 legacy API 를 호출하는지 등은 이 문서 범위 밖).

### 6-2. 참고 (행수 기준, update_time 비교 불가)

- `quiz_answers` (5행, 최종 갱신 2026-05-08) ↔ `fun_quiz` (0행, update_time 기록 없음) — fun_quiz 쪽이 갱신 이력 자체가 없어 시각 비교 불가. 행수만 보면 legacy 쪽에 실 데이터가 남아있고 V2 쪽은 비어있음. 원인 미확인.

### 6-3. 형상 drift

- `kbo_team_code_mappings` — `kbo_` 접두사지만 정의 위치가 legacy `sql/CREATE_TABLE.sql:542`. FK 대상도 legacy `teams` 테이블 (V2 `fun_teams` 아님). §7 FK 표 참조.
- `fun_quiz` — `sql/V2/fun/CREATE_TABLE_FUN.sql:117` 과 `sql/compyafun-v3_fun.sql` 두 곳에 서로 다른 컬럼 구조로 중복 정의됨 (V2 정의엔 `is_visible` 있음, V3 정의는 DROP). 운영 실측 컬럼은 V3 정의와 일치 — V2 파일 쪽 정의는 stale.
- 스키마 파일에 없는데 운영에만 존재하는 테이블, 또는 스키마엔 있는데 운영에 없는 테이블은 **발견되지 않음** (§2 하단 총평 참조).

---

## §7 FK 관계

| 자식 테이블.컬럼 → 부모 테이블.컬럼 | 제약명 |
|---|---|
| fun_player_card.team_id → fun_teams.id | fk_fun_player_card_team |
| fun_player_card_hitter_stats.card_id → fun_player_card.id | fk_fun_player_card_hitter_stats_card |
| fun_player_card_pitcher_pitch_grades.card_id → fun_player_card.id | fk_fun_player_card_pitcher_pitch_grades_card |
| fun_player_card_pitcher_stats.card_id → fun_player_card.id | fk_fun_player_card_pitcher_stats_card |
| fun_player_card_positions.card_id → fun_player_card.id | fk_fun_player_card_positions_card |
| fun_teams.latest_team_id → fun_teams.id (자기참조) | fk_fun_teams_latest_team |
| kbo_batter_logs.game_id → kbo_games.game_id | fk_batter_logs_game |
| kbo_batter_logs.player_code → kbo_players.player_code | fk_batter_logs_player |
| kbo_games.away_team_code → kbo_teams.team_code | fk_games_away_team |
| kbo_games.home_team_code → kbo_teams.team_code | fk_games_home_team |
| kbo_games.season_year → kbo_seasons.season_year | fk_games_season |
| kbo_players.team_code → kbo_teams.team_code | fk_players_team |
| **kbo_team_code_mappings.internal_team_id → teams.id (legacy)** | fk_external_team_mappings_internal_team |
| legend_pitcher_pitch_slot.pitcher_name → player_legend.name | fk_legend_pitcher_pitch_slot |
| player_card.team_id → teams.id | fk_card_team |
| player_card_hitter_attributes.card_id → player_card.id | fk_card_hitter_attr |
| player_card_pitcher_attributes.card_id → player_card.id | fk_card_pitcher_attr |
| player_legend.team_id → teams.id | fk_legend_team |
| player_legend_hitter_career.name → player_legend.name | fk_legend_hitter_career |
| player_legend_pitcher_career.name → player_legend.name | fk_legend_pitcher_career |
| posts.board_id → boards.id | posts_ibfk_1 |
| posts_tags.post_id → posts.id | posts_tags_ibfk_1 |
| posts_tags.tag_id → tags.id | posts_tags_ibfk_2 |
| site_comment.parent_comment_id → site_comment.id (자기참조) | fk_comment_parent |
| site_comment.post_id → site_post.id | fk_comment_post |
| site_comment_reaction.comment_id → site_comment.id | fk_comment_reaction_comment |
| site_post.board_id → site_board.id | fk_post_board |
| site_post_reaction.post_id → site_post.id | fk_post_reaction_post |
| site_post_tag.post_id → site_post.id | fk_post_tag_post |
| site_post_tag.tag_id → site_tag.id | fk_post_tag_tag |
| site_refresh_tokens.user_id → site_users.id | fk_refresh_user |
| skill_pitcher_grade_stat.skill_code → player_skills.skill_code | fk_skill_grade_stat_skill |
| skill_pitcher_grade_stat.target → player_skills.target | fk_skill_grade_stat_skill |
| skill_score_config.skill_code → player_skills.skill_code | fk_score_config_skill |
| skill_score_config.target → player_skills.target | fk_score_config_skill |
| teams.latest_team_id → teams.id (자기참조) | fk_latest_team |
| user_roles.user_id → users.id | fk_user_roles_user |
| wiki_pitch_grade.pitch_code → wiki_pitch.code | fk_wiki_pitch_grade_code |

**삭제 시 걸리는 관계 요약**
- `teams` 삭제 시 → player_card, player_legend, kbo_team_code_mappings, teams(자기참조) 가 걸림 (legacy 계열이 아직 `teams` 를 참조 중 — §6-3 참조)
- `users` 삭제 시 → user_roles 가 걸림
- `player_legend` 삭제 시 → player_legend_hitter_career, player_legend_pitcher_career, legend_pitcher_pitch_slot 가 걸림
- `player_skills` 삭제 시 → skill_pitcher_grade_stat, skill_score_config 가 걸림
- `fun_player_card` 삭제 시 → fun_player_card_hitter_stats/pitcher_stats/pitcher_pitch_grades/positions 4개가 걸림
- `site_post` 삭제 시 → site_comment, site_post_reaction, site_post_tag 가 걸림
- `site_board` 삭제 시 → site_post 가 걸림
- `wiki_pitch` 삭제 시 → wiki_pitch_grade 가 걸림

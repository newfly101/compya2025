---
created: 2026-09-13
updated: 2026-09-28
---

# sql/ 폴더 참고

`sql/README.md` · `sql/V2/README.md` · `sql/V2_insert/README.md` · `sql/V3/README.md` · `sql/V3_insert/README.md` 5편을 통합. 죽은 테이블 목록은 [`sql-folder-map.md`](./sql-folder-map.md), 커뮤니티 v1↔v2 현황은 [`community-db-state.md`](./community-db-state.md).

## 1. 폴더 지도 · 접두사 체계

| 폴더 | 내용 |
|---|---|
| `sql/V2/` | 구버전 스키마 — DDL(`CREATE_01~04`) + ALTER/MIGRATE/DROP 이력 |
| `sql/V2_insert/` | 구버전 데이터 — INSERT 시드 + UPDATE(1회성 데이터 보정) |
| `sql/V3/` | 현행 스키마 — DDL(`CREATE_01~08`) |
| `sql/V3_insert/` | 현행 데이터 — INSERT 전용 |

| 접두사 | 동작 | 자동 실행 |
|---|---|---|
| `CREATE_NN_` | 테이블 생성 (번호 순) | 가능 — 빈 DB 에 순서대로 실행 |
| `INSERT_` | 데이터 적재 | 가능 — 대상 `CREATE_` 이후 |
| `UPDATE_` | 데이터 보정 | ⛔ 사람이 확인 후 |
| `ALTER_` | 스키마 변경 | ⛔ 사람이 확인 후 (현재 두 폴더 모두 파일 0개 — 전부 `CREATE_` 로 흡수됨) |
| `DROP_` | 삭제 | ⛔ 사람이 확인 후 |
| `MIGRATE_` | 여러 동작이 섞인 이관 | ⛔ 사람이 확인 후 |

⚠️ `CREATE_` 파일은 운영 DB 스키마와 완전히 일치하는 **완전본**이다(2026-09-13 `mysqldump --no-data` 실측 대조). 이후 나온 `ALTER_` 는 반영 즉시 해당 `CREATE_` 에 합치고 원본은 지운다.

## 2. V3 현행 DDL 실행 순서

| 파일 | 테이블 | 실행 순서 근거 |
|---|---|---|
| `CREATE_01_data_history_mode.sql` | `data_history_round`(70) · `data_history_roster`(1750, FK→round) | 독립 |
| `CREATE_02_data_player_legend.sql` | `data_player_legend`(74) · `_material`(592) · `_stat`(74) · `data_pitch_type`(10, 마스터) · `_pitch`(132) | `CREATE_03` 보다 먼저 — `data_pitch_type` 을 카드 쪽이 FK 참조. `_material.player_card_id` 컬럼은 여기서 선언, FK 는 아직 없음(`data_player_card` 가 없어서) |
| `CREATE_03_data_player_card.sql` | `data_player_card`(11150, `sub_position_code` 포함) · `_stat`(12412) · `_pitch`(21007, FK→`data_pitch_type`) | `data_pitch_type` 의존으로 `CREATE_02` 다음. **파일 끝에서 `data_player_legend_material.player_card_id`→`data_player_card(id)` FK(`fk_dplm_card`)를 건다** |
| `CREATE_04_data_player_skill.sql` | `data_player_skill`(92) · `_tier`(540) · `_tier_value`(877) | 독립 |
| `CREATE_05_fun.sql` | `fun_quiz`(5, `DROP TABLE IF EXISTS` 후 재생성) | 독립. V2 의 동명 `fun_quiz` 를 최종 덮어씀 (§6) |
| `CREATE_06_site_refresh_tokens.sql` | `site_refresh_tokens`(324, FK→`site_users`) | ⚠️ V2 의존 — `site_users` 선행 필요 |
| `CREATE_07_site_user_event.sql` | `site_user_event`(2) · `_daily`(0) | 독립. user_id FK 미설정(앱 레벨) |
| `CREATE_08_site_statistic_support_click.sql` | `statistic_support_click`(0, 신규) | 독립. `site_users` 만 있으면 됨, FK 미설정 |

값 채우기(스키마 아님): `sub_position_code`(642건) → `V2_insert/UPDATE_sub_position.sql`, `_material.player_card_id`(444건) → `V2/UPDATE_material_card_id_link.sql`. `INSERT_` 로 두 테이블을 채운 뒤 실행.

빠진 DDL: `fun_teams` → `V2/CREATE_03_TABLE_FUN.sql`, `site_users`/`site_coupons`/`site_events`/`site_notices`/`site_board` 등 site_* 본체 → `V2/CREATE_04_TABLE_SITE.sql`.

## 3. V3_insert 시드

| 파일 | 내용 | 크기 | DDL 위치 |
|---|---|---|---|
| `INSERT_data_history_mode.sql` | `data_history_round`/`_roster` | 193KB | `CREATE_01` |
| `INSERT_data_player_legend.sql` | `data_player_legend`+`_material` | 82KB | `CREATE_02` |
| `INSERT_data_player_legend_stat.sql` | `_stat`+`_pitch` | 21KB | `CREATE_02` |
| `INSERT_data_pitch_type.sql` | `data_pitch_type` 마스터(10종) | <1KB | `CREATE_02` |
| `INSERT_data_player_card.sql` | `data_player_card` | 1.1MB | `CREATE_03` |
| `INSERT_data_player_card_stat.sql` | `_stat`+`_pitch` | 2.9MB | `CREATE_03` |
| `INSERT_data_player_skill.sql` | `data_player_skill`+`_tier`+`_tier_value` | 154KB | `CREATE_04` |

⚠️ 대용량 3종(최대 2.9MB)은 다른 세션이 수정 중일 수 있다 — 통째로 열어 읽지 말 것. 실행 순서: `data_pitch_type` → `data_player_legend` → `data_player_card`.

## 4. V2 구버전 DDL · ALTER · DROP

| 파일 | 테이블 | 실행 순서 근거 |
|---|---|---|
| `CREATE_01_TABLE_V1.sql` | `boards`/`posts`/`tags`/`posts_tags` | 독립. 2026-09-27 실측으로 `teams`/`users`/`user_roles`/`events`/`coupons`/`notices`/`quiz_answers` 삭제됨 |
| `CREATE_03_TABLE_FUN.sql` | `fun_teams`, `fun_quiz`(V3 가 최종 덮어씀, §6) | 독립 |
| `CREATE_04_TABLE_SITE.sql` | `site_coupons`/`_notices`/`_events`/`_users`/`_user_oauth_accounts`/`_board`/`_post`/`_comment`/`_tag`/`_post_tag`/`_post_reaction`/`_comment_reaction`/`_report` | 독립 (내부 FK 만) |

| 파일 | 무엇을 바꾸나 | 비고 |
|---|---|---|
| `DROP_v1_tables.sql` | V1 초기화 참고용 | ⛔ 실행 금지 (운영 데이터 삭제 + FK 순서 오류로 도중 실패 전례) |
| `UPDATE_material_card_id_link.sql` | `_material.player_card_id` 값 연결(444건) | `INSERT_data_player_card.sql` 후 실행 |
| `MIGRATE_user_restructure.sql` | 유저 개편 1~3단계 병합 | 스키마는 이미 `CREATE_04` 에 흡수됨 — 구버전 운영 DB 이관 절차 기록용. 마지막 섹션(03) 비가역 |
| `MIGRATE_community_v1_to_v2.sql` | v1(`posts`/`boards`) → v2(`site_post`/`site_board`) | ⚠️ 아직 미실행 — 상세 [`community-db-state.md`](./community-db-state.md) |

## 5. V2_insert 시드 · UPDATE

| 파일 | 대상 | 비고 |
|---|---|---|
| `INSERT_DATA_TABLE.sql` | `teams` | `CREATE_01_TABLE_V1.sql` 후 |
| `INSERT_SITE_COUPONS_DATA.sql` | `site_coupons` | `CREATE_04_TABLE_SITE.sql` 후 |
| `INSERT_SITE_EVENTS_DATA.sql` | `site_events` | 〃 |
| `INSERT_LEGEND_PLAYER.sql` | `player_legend` | ⚠️ 대상 DDL 이 2026-09-27 삭제됨 — 실행 불가(죽은 파일), 정리 결정 대기 |

| 파일 | 내용 |
|---|---|
| `UPDATE_sub_position.sql` | 부포지션 값 채우기(642건). 컬럼 자체는 `V3/CREATE_03` 에 이미 있음 |
| `UPDATE_small_fixes.sql` | 짧은 보정 3건 병합(공지 날짜·백인천 재료·재료 선수명 접미). 섹션별 독립 실행 가능 |
| `UPDATE_player_names_positions.sql` | 선수 이름·포지션 보정 2건 병합. ⚠️ 순서 고정 |
| `UPDATE_history_roster_position.sql` | `data_history_roster.position_code` 채우기(1744/1750건). 자동 생성, 리포트는 삭제됨(§6) |
| `UPDATE_legend_attribute.sql` | `player_legend.attributes` 개별 보정(22건) |
| `UPDATE_material_position.sql` | 레전드 재료 선수 포지션 채우기(444건). 자동 생성 |

## 6. 주의

- **`UPDATE_`/`ALTER_`/`DROP_`/`MIGRATE_` 는 자동 순서 실행 금지.** 이유: 전제조건이 파일마다 다르고, 이미 적용됐는지가 운영 DB 상태에 따라 다르며, 일부는 "아직 실행하지 말 것"이 파일 안에 명시돼 있다(`MIGRATE_community_v1_to_v2.sql`). 각 파일은 위 표에서 내용을 확인하고 파일 맨 위 주석의 실행 조건을 읽은 뒤 사람이 하나씩 적용한다.
- **덮어쓰기 관계**: `V2/CREATE_03_TABLE_FUN.sql` 의 `fun_quiz` 는 `V3/CREATE_05_fun.sql` 이 `DROP` 후 재생성 — 최종 스키마는 V3 가 이긴다. `V2/CREATE_04_TABLE_SITE.sql` 의 `site_users` 는 유저 개편 3단계까지 반영된 최종 형태(`public_id`/`profile_image`/`email`/`withdrawn_at` 포함, `oauth_*` 컬럼 없음) — 뒤에 별도 ALTER 불필요.
- **빈 DB 스키마 만드는 법**(운영과 동일한 현재 스키마만 필요할 때, V2 전부 실행 불필요 — 죽은 테이블은 [`sql-folder-map.md`](./sql-folder-map.md)): ① `V2/CREATE_03_TABLE_FUN.sql` → ② `V2/CREATE_04_TABLE_SITE.sql` → ③ `V3/CREATE_01`~`CREATE_07` 번호 순.
- `UPDATE_history_roster_position.report.md`(자동 생성 리포트)는 2026-09-28 삭제됨 — 생성 스크립트(`scripts/gen_history_roster_position.py`)가 저장소에 없어 재생성되지 않는다.

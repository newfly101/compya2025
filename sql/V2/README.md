# V2 — 구버전 스키마 (DDL · ALTER/MIGRATE/DROP)

2026-09-13 접두사 재편: `CREATE_NN_`(순서대로 실행하면 스키마 완성) / `UPDATE_`·`ALTER_`·`DROP_`·`MIGRATE_`(그 외, 자동 실행 금지)로 통일했다. 같은 날 2차 재편에서 운영 DB 덤프와 대조해 컬럼 추가류 `ALTER_` 는 전부 `CREATE_` 에 흡수하고 원본은 지웠다 — 지금 이 폴더에 남은 `ALTER_` 파일은 없다.

## CREATE_NN_ — DDL (FK 의존 순서)

| 파일 | 테이블 | 실행 순서 근거 |
|---|---|---|
| `CREATE_01_TABLE_V1.sql` | `teams` `users` `user_roles` `events` `coupons` `boards` `posts` `tags` `posts_tags` `notices` `quiz_answers` (+주석 `player_card` 3종) | `teams` 를 `CREATE_02` 가 FK 로 참조 — 반드시 먼저 |
| `CREATE_02_TABLE_PLAYER_LEGEND_V1.sql` | `player_legend` `player_legend_hitter_career` `player_legend_pitcher_career` `legend_pitcher_pitch_slot` | `player_legend.team_id` → `CREATE_01` 의 `teams(id)` FK |
| `CREATE_03_TABLE_FUN.sql` | `fun_teams` `fun_quiz`(V3 가 최종 덮어씀, 아래 참고) (+주석 `fun_player_card*` 4종) | 독립 (FK 없음) |
| `CREATE_04_TABLE_SITE.sql` | `site_coupons` `site_notices` `site_events` `site_users` `site_user_oauth_accounts` `site_board` `site_post` `site_comment` `site_tag` `site_post_tag` `site_post_reaction` `site_comment_reaction` `site_report` | 독립 (내부 FK만, `site_board`→`site_post`→`site_comment`/`site_tag` 순으로 파일 내부에 이미 정렬됨) |

⚠️ `CREATE_01`/`CREATE_02` 는 **죽은 테이블**이다 (`teams`/`player_legend*` → `fun_teams`/`data_player_legend*` 로 대체됨, 상세는 `sql/test-README.md`). 이 두 파일은 `users`/`user_roles`/`events`/`coupons`/`notices`/`quiz_answers` 처럼 운영에서 이미 사라진 테이블도 갖고 있다 — v1 이관 흐름 재현용으로 그대로 뒀다. 빈 DB에 현재 운영 스키마만 만들 때는 생략 가능 — 자세한 건 `sql/README.md` 참고.

⚠️ `CREATE_03_TABLE_FUN.sql` 의 `fun_quiz` 는 `sql/V3/CREATE_05_fun.sql` 에서 `DROP TABLE IF EXISTS fun_quiz` 후 재생성된다(컬럼 구성이 다르다 — `is_visible` 없음) — 최종 스키마는 V3 쪽이 이긴다.

⚠️ `CREATE_04_TABLE_SITE.sql` 의 `site_users` 는 **유저 개편 3단계까지 반영된 최종 형태**다 (2026-09-13 운영 덤프 대조). `oauth_provider` 등 6개 컬럼은 없고 대신 `public_id`/`profile_image`/`email`/`withdrawn_at` 이 있으며, OAuth 원본은 여기 새로 추가한 `site_user_oauth_accounts` 테이블(원래 `MIGRATE_user_restructure.sql` 안에만 있던 CREATE 문을 이관)이 갖는다.

## UPDATE_ / MIGRATE_ / DROP_ — 자동 실행 금지

`CREATE_` 만으로는 만들어지지 않는, 데이터 보정·이관·삭제 이력이다. 순서·전제조건이 파일마다 달라 **사람이 내용을 읽고 직접 실행**해야 한다 — 일괄 실행 스크립트에 포함하지 않는다.

| 파일 | 무엇을 바꾸나 | 비고 |
|---|---|---|
| `DROP_v1_tables.sql` | V1 스키마 초기화 참고용 | ⛔ 실행 금지 (운영 데이터 삭제 + FK 순서 오류로 도중 실패) |
| `UPDATE_material_card_id_link.sql` | `data_player_legend_material.player_card_id` 값 연결(444건) | 컬럼·FK 는 이미 `CREATE_02`/`CREATE_03` 에 있음. `INSERT_data_player_card.sql` 실행 후 이 파일로 값만 채운다 |
| `MIGRATE_user_restructure.sql` | 유저 개편 1~3단계 병합 (구 `USER_RESTRUCTURE_01/02/02B/03A/03`) | **스키마 목적으로는 이미 `CREATE_04`에 흡수됨** — 이 파일은 "기존에 구버전 스키마로 떠 있는 운영 DB"를 새 형태로 옮기는 이관 절차 기록용으로 남긴다. 파일 내 섹션 순서대로만 실행. 마지막 섹션(03)은 **비가역** |
| `MIGRATE_community_v1_to_v2.sql` | v1 커뮤니티(`posts`/`boards`) → v2(`site_post`/`site_board`) 이관 | ⚠️ **아직 미실행** — `posts` 237행이 이관 전 상태 |

`MIGRATE_user_restructure.sql` 은 되돌리기 가능한 앞 3섹션(01/02/02B)과 사전검증(03A), 비가역 마지막 섹션(03)을 한 파일에 순서대로 담았다 — 섹션 구분은 파일 내 `-- ── 원본: ... ──` 주석 참고.

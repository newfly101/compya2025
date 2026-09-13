# sql/ 폴더 맵

2026-09-13 파일명 접두사 재편 — 실제 SQL 동작 기준 6체계로 통일. 하위 폴더는 전부 없앴다(평탄화).

죽은 테이블(코드가 더 이상 쓰지 않는 테이블) 목록: `docs/global-guide/develop/specs/db/sql-folder-map.md`
커뮤니티 v1↔v2 데이터 현황: `sql/community_README.md`

| 폴더 | 내용 |
|---|---|
| `V2/` | 구버전 스키마 — DDL(`CREATE_01~04`) + ALTER/MIGRATE/DROP 이력 |
| `V2_insert/` | 구버전 데이터 — INSERT 시드 + UPDATE(1회성 데이터 보정) |
| `V3/` | 현행 스키마 — DDL(`CREATE_01~07`) |
| `V3_insert/` | 현행 데이터 — INSERT 전용 |

각 폴더 상세는 폴더 안 `README.md` 참고.

## 접두사 체계

| 접두사 | 동작 | 자동 실행 |
|---|---|---|
| `CREATE_NN_` | 테이블 생성 (번호 순) | 가능 — 빈 DB 에 순서대로 실행하면 됨 |
| `INSERT_` | 데이터 적재 | 가능 — 대상 `CREATE_` 이후 실행 |
| `UPDATE_` | 데이터 보정 | ⛔ 사람이 확인 후 |
| `ALTER_` | 컬럼 추가·이름 변경 등 스키마 변경 | ⛔ 사람이 확인 후 |
| `DROP_` | 삭제 | ⛔ 사람이 확인 후 |
| `MIGRATE_` | 여러 동작이 섞인 이관 작업 | ⛔ 사람이 확인 후 |

⚠️ **`CREATE_` 파일은 운영 DB 스키마와 완전히 일치하는 "완전본"이다** — 2026-09-13 운영 DB `mysqldump --no-data` 실측 덤프와 테이블·컬럼·인덱스·FK·CHECK 를 전부 대조해 갱신했다. 이후 나온 `ALTER_`(컬럼 추가 등)는 반영 즉시 해당 `CREATE_` 문에 합치고 원본 `ALTER_` 파일은 지운다 — `CREATE_` 만 순서대로 실행하면 **컬럼 하나 빠짐없이 지금 운영과 같은 스키마**가 나와야 한다. `UPDATE_`/`MIGRATE_`/`DROP_` 은 스키마가 아니라 데이터·이관 이력이라 `CREATE_` 에 흡수되지 않는다.

## 빈 DB 에 스키마 만드는 법

**운영과 동일한 현재 스키마만 필요하면(테스트 DB 등) V2 전부를 실행할 필요 없다.** V2 의 원본 스키마(`teams`/`users`/`player_legend` 등)는 이미 `fun_teams`/`site_users`/`data_player_legend*` 로 대체된 죽은 테이블이 섞여 있다 (`docs/global-guide/develop/specs/db/sql-folder-map.md` 참고). 다만 **V3 는 site_users 등 일부를 V2 가 만든 테이블 위에 이어 붙이므로 V2 중 살아있는 부분은 반드시 필요**하다.

실행 순서 (번호 순):

1. `V2/CREATE_03_TABLE_FUN.sql` — `fun_teams` (V3 카드/재료가 참조하는 `team_code` 도메인)
2. `V2/CREATE_04_TABLE_SITE.sql` — `site_users` / `site_user_oauth_accounts` 등 site_* 본체 (V3 `site_refresh_tokens` 가 FK 로 참조). **site_users 는 이미 유저 개편 3단계까지 반영된 최종 형태**(`public_id`/`profile_image`/`email`/`withdrawn_at` 포함, `oauth_*` 컬럼 없음)라 뒤에 별도 ALTER 를 돌릴 필요가 없다
3. `V3/CREATE_01_data_history_mode.sql` → `CREATE_02_data_player_legend.sql` → `CREATE_03_data_player_card.sql` → `CREATE_04_data_player_skill.sql` → `CREATE_05_fun.sql` → `CREATE_06_site_refresh_tokens.sql` → `CREATE_07_site_user_event.sql` (번호 순 그대로)
   - `CREATE_03_data_player_card.sql` 맨 끝에서 `data_player_legend_material.player_card_id` FK(`fk_dplm_card`)를 건다 — `CREATE_02` 가 컬럼만 먼저 선언하고 FK 는 `data_player_card` 가 생기는 이 시점에 붙인다

`V2/CREATE_01_TABLE_V1.sql` / `CREATE_02_TABLE_PLAYER_LEGEND_V1.sql` 은 죽은 테이블(V1 레거시)이라 위 순서에 없다 — v1 이관 흐름 자체를 재현하고 싶을 때만 맨 앞에 추가로 실행한다(그 경우 `CREATE_02_TABLE_PLAYER_LEGEND_V1.sql` 이 `teams` FK 로 `CREATE_01_TABLE_V1.sql` 을 필요로 한다). 이 두 파일은 `users`/`user_roles`/`events`/`coupons`/`notices`/`quiz_answers` 등 운영에서 이미 지워진 테이블도 갖고 있다 — 그대로 둔다(V1 시점 재현용이므로 덤프와 안 맞는 게 정상).

빈 DB 에 `CREATE_` 만 순서대로 실행하면 **운영과 동일한 최종 스키마**가 나온다. `UPDATE_`/`MIGRATE_`/`DROP_` 파일은 스키마가 아니라 **과거 이력·데이터 보정**이라 새 DB 에는 대부분 필요 없다 — 예외는 `V2/UPDATE_material_card_id_link.sql`(레전드 재료 ↔ 카드 연결, `INSERT_` 로 두 테이블을 채운 뒤 실행)과 `V2_insert/UPDATE_sub_position.sql` 류처럼 컬럼은 있는데 값은 `INSERT_` 시드에 없는 데이터 보정들이다. 이런 건 각 폴더 README 표에서 개별로 확인한다.

## UPDATE_ / ALTER_ / DROP_ / MIGRATE_ 란

`CREATE_`(스키마 최초 생성) / `INSERT_`(데이터 적재) 어디에도 속하지 않는 전부 — 컬럼 추가/삭제(`ALTER_`), 데이터 일괄 보정(`UPDATE_`), 삭제(`DROP_`), 여러 단계로 나뉜 마이그레이션(`MIGRATE_`).

**자동으로 순서대로 실행하면 안 된다** — 이유:
- 실행 전제조건이 파일마다 다르다 (예: `MIGRATE_user_restructure.sql` 은 3단계 중 마지막이 비가역, 앞 단계가 끝났는지 사람이 확인해야 진행 가능)
- 이미 적용됐는지 여부가 운영 DB 상태에 따라 다르다 (재실행하면 에러가 나거나, 반대로 아무 일도 안 일어나는 것을 전제로 짠 파일도 있다)
- 일부는 "아직 실행하지 말 것" 이 파일 안에 명시돼 있다 (`V2/MIGRATE_community_v1_to_v2.sql` — `posts` 237행이 아직 이관 전이다)

각 파일은 폴더 README 표에서 "무엇을 바꾸는지" 확인하고, 파일 맨 위 주석의 실행 조건을 읽은 뒤 하나씩 사람이 적용한다.

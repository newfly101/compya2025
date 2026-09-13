# V3 — 현행 스키마 (DDL)

2026-09-13 접두사 재편: 테이블 접두사별 하위 폴더(`data_history/` 등)를 없애고 평탄화, `CREATE_NN_` 로 실행 순서를 번호로 고정했다. 각 파일의 INSERT 는 `sql/V3_insert/` 안 동일 이름 파일에 있다 (행수는 2026-09-13 실측). 같은 날 2차 재편에서 운영 DB 덤프와 전 테이블을 대조해 `sub_position_code` 컬럼과 `fk_dplm_card` FK 를 CREATE 문에 흡수했다 — 이제 이 폴더에 `ALTER_` 파일은 없다.

## CREATE_NN_ — FK 의존 순서

| 파일 | 테이블 | 실행 순서 근거 |
|---|---|---|
| `CREATE_01_data_history_mode.sql` | `data_history_round`(70) · `data_history_roster`(1750, FK→round) | 독립 — 내부 FK만 |
| `CREATE_02_data_player_legend.sql` | `data_player_legend`(74) · `data_player_legend_material`(592, FK→legend) · `data_player_legend_stat`(74, FK→legend) · `data_pitch_type`(10, 마스터) · `data_player_legend_pitch`(132, FK→legend·pitch_type) | **`CREATE_03` 보다 먼저** — `data_pitch_type` 을 카드 쪽 `data_player_card_pitch` 가 FK 로 참조. `data_player_legend_material.player_card_id` 컬럼은 여기서 선언하지만 FK 는 아직 안 건다(`data_player_card` 가 없어서) |
| `CREATE_03_data_player_card.sql` | `data_player_card`(11150, `sub_position_code` 포함) · `data_player_card_stat`(12412, FK→card) · `data_player_card_pitch`(21007, FK→card, FK→`CREATE_02`의 `data_pitch_type`) | `data_pitch_type` 의존 때문에 `CREATE_02` 다음. **파일 맨 끝에서 `data_player_legend_material.player_card_id` → `data_player_card(id)` FK(`fk_dplm_card`)를 건다** — 두 테이블이 다 있어야 하므로 여기가 최초 시점 |
| `CREATE_04_data_player_skill.sql` | `data_player_skill`(92) · `_tier`(540, FK→skill) · `_tier_value`(877, FK→tier) | 독립 |
| `CREATE_05_fun.sql` (구 `compyafun-v3_fun.sql`) | `fun_quiz`(5, `DROP TABLE IF EXISTS` 후 재생성) | 독립. `sql/V2/CREATE_03_TABLE_FUN.sql` 의 동명 `fun_quiz` 를 이 파일이 최종적으로 덮어씀 |
| `CREATE_06_site_refresh_tokens.sql` (구 `CREATE_TABLE_REFRESH_TOKENS.sql`) | `site_refresh_tokens`(324, FK→`site_users`) | ⚠️ **V2 의존** — `sql/V2/CREATE_04_TABLE_SITE.sql` 의 `site_users` 가 먼저 있어야 함 |
| `CREATE_07_site_user_event.sql` | `site_user_event`(2) · `site_user_event_daily`(0) | 독립 (user_id 는 FK 미설정, 앱 레벨 정합성) |
| `CREATE_08_site_statistic_support_click.sql` | `statistic_support_click`(0, 신규) | 독립 — `site_users` 만 있으면 됨. FK 미설정(CREATE_07 관례) |

## 데이터 값 채우기 (스키마 아님 — 다른 폴더)

`data_player_card.sub_position_code` 값(642건)과 `data_player_legend_material.player_card_id` 값(444건 연결)은 컬럼·FK 가 여기 있어도 **값 자체는 INSERT_ 시드에 없다** — `sql/V2_insert/UPDATE_sub_position.sql`, `sql/V2/UPDATE_material_card_id_link.sql` 이 각각 채운다. `INSERT_` 로 두 테이블을 채운 뒤에 실행한다.

## 빠진 것 — 다른 폴더에 있음

- `fun_teams`(20행) DDL — `sql/V2/CREATE_03_TABLE_FUN.sql`
- `site_users`/`site_user_oauth_accounts`/`site_coupons`/`site_events`/`site_notices`/`site_board` 등 site_* 본체 — `sql/V2/CREATE_04_TABLE_SITE.sql`

⚠️ `CREATE_02_data_player_legend.sql` 은 이름이 비슷한 `sql/V2/CREATE_02_TABLE_PLAYER_LEGEND_V1.sql`(언더스코어 없는 `player_legend*`, V1 legacy·죽은 테이블) 과 다른 테이블군이다 — 혼동 금지.

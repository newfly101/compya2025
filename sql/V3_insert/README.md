# V3_insert — 현행 데이터 (INSERT 전용)

2026-09-13 접두사 재편: 하위 폴더를 없애고 평탄화, 파일명을 `..._INSERT.sql` 접미 → `INSERT_...` 접두 형식으로 통일했다. DDL 은 `sql/V3/` 안 동일 대상 파일에 있다.

| 파일 | 내용 | 크기 | DDL 위치 |
|---|---|---|---|
| `INSERT_data_history_mode.sql` | `data_history_round` / `data_history_roster` INSERT | 193KB | `sql/V3/CREATE_01_data_history_mode.sql` |
| `INSERT_data_player_legend.sql` | `data_player_legend` + `data_player_legend_material` INSERT | 82KB | `sql/V3/CREATE_02_data_player_legend.sql` |
| `INSERT_data_player_legend_stat.sql` | `data_player_legend_stat` + `data_player_legend_pitch` INSERT | 21KB | 〃 |
| `INSERT_data_pitch_type.sql` | `data_pitch_type` 마스터 시드 (10종) | <1KB | 〃 (`data_pitch_type` 테이블) |
| `INSERT_data_player_card.sql` | `data_player_card` INSERT | 1.1MB | `sql/V3/CREATE_03_data_player_card.sql` |
| `INSERT_data_player_card_stat.sql` | `data_player_card_stat` + `data_player_card_pitch` INSERT | 2.9MB | 〃 |
| `INSERT_data_player_skill.sql` | `data_player_skill` + `_tier` + `_tier_value` INSERT | 154KB | `sql/V3/CREATE_04_data_player_skill.sql` |

⚠️ `INSERT_data_history_mode.sql` / `INSERT_data_player_card.sql` / `INSERT_data_player_card_stat.sql` 은
대용량(최대 2.9MB)이고 **다른 세션이 수정 중일 수 있다** — 이번 재편에서 이름만 바꾸고 내용은 건드리지 않았다. 통째로 열어 읽지 말 것.

실행 순서: `sql/V3/` 쪽 `CREATE_NN_` 번호와 동일하게 CREATE 후 INSERT — `data_pitch_type` → `data_player_legend` → `data_player_card` 순으로 하면 FK 문제가 없다.

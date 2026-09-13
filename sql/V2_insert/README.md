# V2_insert — 구버전 데이터 (INSERT · UPDATE)

2026-09-13 접두사 재편: `INSERT_`(시드 데이터) / `UPDATE_`(1회성 데이터 보정, 자동 실행 금지)로 통일했다. 같은 날 2차 재편에서 `sub_position_code` 컬럼 자체는 `sql/V3/CREATE_03_data_player_card.sql` 로 옮기고, 여기 남은 파일은 값만 채우는 UPDATE 다.

## INSERT_ — 시드 데이터

| 파일 | 대상 테이블 | 비고 |
|---|---|---|
| `INSERT_DATA_TABLE.sql` | `teams` | `sql/V2/CREATE_01_TABLE_V1.sql` 실행 후 |
| `INSERT_SITE_COUPONS_DATA.sql` | `site_coupons` | `sql/V2/CREATE_04_TABLE_SITE.sql` 실행 후 |
| `INSERT_SITE_EVENTS_DATA.sql` | `site_events` | 〃 |
| `INSERT_LEGEND_PLAYER.sql` (구 `legendPlayer.sql`) | `player_legend` | `sql/V2/CREATE_02_TABLE_PLAYER_LEGEND_V1.sql` 실행 후. 죽은 테이블 계열 — 상세는 `sql/test-README.md` |

## UPDATE_ — 1회성 데이터 보정 (자동 실행 금지)

| 파일 | 내용 |
|---|---|
| `UPDATE_sub_position.sql` (구 `addSubPositionFromStatSheet.sql`) | 부포지션 값 채우기 — 타자 스탯 시트 기준 (642건 UPDATE). ⚠️ 컬럼(`sub_position_code`) 자체는 `sql/V3/CREATE_03_data_player_card.sql` 에 이미 있다 — 이 파일은 컬럼을 만들지 않는다 |
| `UPDATE_small_fixes.sql` | 짧은 보정 3건 병합 — 공지 `published_at` 과거분 채우기(3줄, 원래 V2), 백인천 레전드 재료 교정(8줄), 레전드 재료 선수명 동명이인 접미 보정(8줄). 섹션별 독립 실행 가능 |
| `UPDATE_player_names_positions.sql` | 선수 이름·포지션 보정 2건 병합 — 스탯 입력 시트 기준(21건) → 최종본 재대조(16건). ⚠️ **순서 고정**, 파일 내 앞 섹션을 먼저 실행 |
| `UPDATE_history_roster_position.sql` + `UPDATE_history_roster_position.report.md` | `data_history_roster.position_code` 채우기 (1744/1750건). 자동 생성(`scripts/gen_history_roster_position.py`), 결과 리포트 동봉 |
| `UPDATE_legend_attribute.sql` | `player_legend.attributes` 개별 보정 (선동열 등 22건) |
| `UPDATE_material_position.sql` | 레전드 재료 선수 포지션 채우기 (444건). 자동 생성(`scripts/gen_material_position_update.py`) |

`UPDATE_player_names_positions.sql` 안 두 섹션은 실행 순서가 있다(FromStatSheet → FinalCrosscheck) — 같은 대상이라 한 파일로 합쳤고, 파일 내 섹션 구분 주석(`-- ── 원본: ... ──`)이 순서를 명시한다.

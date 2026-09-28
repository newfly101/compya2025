---
created: 2026-09-13
updated: 2026-09-28
---

# sql/ 폴더 참고

2026-09-28 재편 — `V2`/`V2_insert`/`V3`/`V3_insert` 세대 구분을 없애고 실측 기준
`v.2.0.0/` + `draft/` 구조로 바꿨다. 옛 V2/V3 문서는 이 파일이 대체한다.
테이블·도메인·mapper 매핑은 [`database-notes.md`](./database-notes.md) §3~4 가 정본.

## 1. 폴더 지도

| 폴더 | 내용 | 실행 |
|---|---|---|
| `sql/v.2.0.0/01_site.sql` | site_ 실측 8종 DDL (community 제외) | 자동 — 파일 안 순서대로 |
| `sql/v.2.0.0/02_data.sql` | data_ 실측 13종 DDL | 자동 — 파일 안 순서대로 |
| `sql/v.2.0.0/03_fun.sql` | fun_ 2종 + `statistic_support_click` DDL | 자동 — 파일 안 순서대로 |
| `sql/v.2.0.0/insert/<table>.sql` | 테이블당 1파일, 시드·마스터 데이터 (16개 — 나머지 20개 실측 테이블은 seed 없음, 앱이 채움) | 자동 — 대상 DDL 이후. `fun_teams.sql` 은 `latest_team_id` 실측 대조 후 실행(§6) |
| `sql/v.2.0.0/applied/*.sql` | 이미 운영 반영된 1회성 UPDATE/MIGRATE/ALTER (8개, `kst_timestamp_to_datetime.sql` 포함). 머리에 반영 상태 주석 | ⛔ 재실행 금지 — 빈 DB 재현 시에만 사용 |
| `sql/draft/community/` | 동결 도메인 — v1 4종 + v2 8종 DDL + 이관/DROP 스크립트 | ⛔ 전부 사람 확인 후 |
| `sql/draft/pending/` | 계획분 테이블 DDL (현재 0개 — §5) | 해당 없음 |

## 2. 재현 순서 (빈 DB에 운영과 같은 스키마 + 데이터 만들기)

```
01_site.sql → 02_data.sql → 03_fun.sql
  → insert/*.sql (테이블 순서 무관, 전부 FK 자식 없는 시드성 데이터)
  → applied/*.sql (아래 §4 예외 제외)
```

community(`draft/community/`)는 재현 대상이 아니다 — 현재 운영 스키마엔 없는(부활 미확정) 도메인.

## 3. 실측 36테이블 ↔ 파일 대응표 (2026-09-27 실측, database-notes.md 기준)

| 접두 | 개수 | DDL 파일 | 비고 |
|---|---|---|---|
| `site_` (community 제외) | 8 | `01_site.sql` | site_users→site_user_oauth_accounts→site_refresh_tokens FK 순서 고정 |
| `data_` | 13 | `02_data.sql` | data_player_legend(+data_pitch_type) 가 data_player_card 보다 먼저 — FK 관계는 파일 내부 주석 참고 |
| `fun_` + 접두없음 | 3 | `03_fun.sql` | `fun_teams`·`fun_quiz`·`statistic_support_click` |
| `site_`(community) | 8 | `draft/community/v2_community.sql` | 0행, 코드는 완비 — v1 이관 전 |
| 접두없음(v1 community) | 4 | `draft/community/v1_community.sql` | `boards`(4)·`posts`(242)·`tags`(6)·`posts_tags`(0), 실데이터 보유 |

행수는 대부분 2026-09-13 실측(`sql-folder-map.md`, 이 재편 이전 문서) 기준이고 `data_player_card` 만
2026-09-28 기준(11,668)으로 최신화했다 — 각 DDL 파일 머리 주석에 표기.

## 4. 알려진 접두 불일치 3건 (이름은 안 바꿈 — mapper·엔티티 동반 수정 필요)

| 테이블 | 실제 접두 | 결에 맞는 접두 | 이유 |
|---|---|---|---|
| `fun_teams` | `fun_` | `data_` | 게임에서 받아오는 참조 데이터 — 관리자 콘텐츠가 아님 |
| `fun_quiz` | `fun_` | `site_` | 관리자가 등록하는 사이트 콘텐츠 — 게임 데이터가 아님 |
| `statistic_support_click` | 없음 | `site_` | 파일명은 이미 `site_...`인데 테이블명만 접두 누락 |

## 5. draft/pending/ 이 비어있는 이유

2026-09-13(40테이블) → 2026-09-27(36테이블) 사이 `teams`·`player_legend`·
`player_legend_hitter_career`·`player_legend_pitcher_career`·`legend_pitcher_pitch_slot`
5개가 운영 DB에서 DROP 됐고, 그 DDL도 저장소에서 함께 삭제됐다(이 재편 이전에 이미 없었음).
"DDL은 있는데 실측엔 없는" 계획분 테이블이 현재 0개라 pending/ 은 README만 있다.

## 6. 이번 재편에서 제외한 죽은 파일 (git 이력에는 남음)

| 원본 | 대상 테이블 | 사유 |
|---|---|---|
| `V2_insert/INSERT_DATA_TABLE.sql` | `teams` | 테이블이 DB에 없음(§5) — 단, `teams` INSERT 20행은 컬럼 대응시켜 `insert/fun_teams.sql` 로 복원함(2026-09-28 보완). 같은 파일 안의 `player_legend_hitter_career`/`player_legend_pitcher_career`/`legend_pitcher_pitch_slot` INSERT 는 대응 테이블이 없어 제외 유지 |
| `V2_insert/INSERT_LEGEND_PLAYER.sql` | `player_legend` | 동상 |
| `V2_insert/UPDATE_legend_attribute.sql` | `player_legend` | 동상 |

⚠️ `insert/fun_teams.sql` 의 `latest_team_id` 값(자기참조 FK)은 옛 `teams` 테이블의 INSERT 순서 기반
위치값을 그대로 옮긴 것 — fun_teams 의 실제 AUTO_INCREMENT id 와 대조 전에는 실행 금지. 상세는 파일 머리 주석.

## 7. applied/small_fixes.sql 상태 (2026-09-28 해소)

`applied/small_fixes.sql` — 3구획 병합 파일인데 1구획(`site_notices.published_at` 보정)은 원본 주석에 '실행하지 말 것' 이었으나 2026-09-28 사용자가 실행해 반영됨 — 이제 3구획 전부 반영 상태.
"실행하지 말 것"이 명시된 **미반영** 상태다. 나머지 2구획(`data_player_legend_material` 보정)만 반영 완료.
파일 머리 주석에 구획별 상태를 표기해뒀다 — 일괄 "이미 반영됨"으로 오독하지 말 것.

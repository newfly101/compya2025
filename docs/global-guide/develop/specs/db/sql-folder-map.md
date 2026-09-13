# sql/ 폴더 맵 — 운영 DB 40테이블 기준 재편 (2026-09-13)

이 문서는 `sql/` 폴더를 운영 DB 실제 상태(40테이블) 기준으로 재편한 근거와 결과다.
DDL/INSERT 분리, 접두사별 폴더 분류, legacy 격리 판단 근거를 담는다.

관련 선행 문서(더 깊은 맥락 — 이 재편 작업의 범위 밖):
`table-classification.md`(53테이블 시점 전수 분류) · `dead-suspects.md` · `prod-actual-state.md` ·
`legacy-write-origin.md` · `code-table-inventory.md`

---

## 1. 운영 DB 40테이블 × DDL 파일

| 테이블 | 행수 | DDL 파일 | BE 참조(2026-09-13 실측) |
|---|---:|---|---|
| `boards` | 4 | `sql/V1/CREATE_TABLE_V1.sql` | 0건 |
| `data_history_roster` | 1750 | `sql/V3/data_history/data_history_mode.sql` | 있음 |
| `data_history_round` | 70 | 〃 | 있음 |
| `data_pitch_type` | 10 | `sql/V3/data_player_legend/data_player_legend_stat.sql` | 있음 |
| `data_player_card` | 11150 | `sql/V3/data_player_card/data_player_card.sql` | 있음 |
| `data_player_card_pitch` | 21007 | `sql/V3/data_player_card/data_player_card_stat.sql` | 있음 |
| `data_player_card_stat` | 12412 | 〃 | 있음 |
| `data_player_legend` | 74 | `sql/V3/data_player_legend/data_player_legend.sql` | 있음 |
| `data_player_legend_material` | 592 | 〃 | 있음 |
| `data_player_legend_pitch` | 132 | `sql/V3/data_player_legend/data_player_legend_stat.sql` | 있음 |
| `data_player_legend_stat` | 74 | 〃 | 있음 |
| `data_player_skill` | 92 | `sql/V3/data_player_skill/data_player_skill.sql` | 있음 |
| `data_player_skill_tier` | 540 | 〃 | 있음 |
| `data_player_skill_tier_value` | 877 | 〃 | 있음 |
| `fun_quiz` | 5 | `sql/V3/fun/compyafun-v3_fun.sql` | 있음 |
| `fun_teams` | 20 | `sql/V2/fun/CREATE_TABLE_FUN.sql` (V3 파일 없음) | 0건(substring 매치는 URL/주석) |
| `legend_pitcher_pitch_slot` | 22 | `sql/_legacy/player_legend_v1/` (격리) | **0건** |
| `player_legend` | 62 | 〃 | **0건** |
| `player_legend_hitter_career` | 40 | 〃 | **0건** |
| `player_legend_pitcher_career` | 22 | 〃 | **0건** |
| `posts` | 237 | `sql/V1/CREATE_TABLE_V1.sql` | 0건 |
| `posts_tags` | 0 | 〃 | 0건 |
| `site_board` | 0 | `sql/V2/site/CREATE_TABLE_SITE.sql` | 있음(mapper), FE 미도달 |
| `site_comment` | 0 | 〃 | 있음(mapper) |
| `site_comment_reaction` | 0 | 〃 | 있음(mapper) |
| `site_coupons` | 51 | 〃 | 있음 |
| `site_events` | 36 | 〃 | 있음 |
| `site_notices` | 11 | 〃 | 있음 |
| `site_post` | 0 | 〃 | 있음(mapper), FE 미도달 |
| `site_post_reaction` | 0 | 〃 | 있음(mapper) |
| `site_post_tag` | 0 | 〃 | 있음(mapper) |
| `site_refresh_tokens` | 324 | `sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql` | 있음 |
| `site_report` | 0 | `sql/V2/site/CREATE_TABLE_SITE.sql` | 있음(mapper) |
| `site_tag` | 0 | 〃 | 있음(mapper) |
| `site_user_event` | 2 | `sql/V3/site/site_user_event.sql` | 있음 |
| `site_user_event_daily` | 0 | 〃 | **없음**(2026-09-13 재확인 — 아래 §8) |
| `site_user_oauth_accounts` | 497 | **없음** — `sql/migration/USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql` 안에만 | 있음 |
| `site_users` | 497 | `sql/V2/site/CREATE_TABLE_SITE.sql` | 있음 |
| `tags` | 6 | `sql/V1/CREATE_TABLE_V1.sql` | 0건 |
| `teams` | 20 | 〃 | **0건** (실측 — 아래 §2 참조) |

`site_*` 본체(users/coupons/events/notices/board/post/comment/tag 등)는 `sql/V2/site/CREATE_TABLE_SITE.sql`
하나에 몰려 있다. `sql/V3/site/`는 그 이후 증분(refresh_tokens, user_event, oauth ALTER)만 담는다.
V2는 프로젝트 컨벤션(`CLAUDE.md` 산출물 위치 룰: "DB schema → sql/V2/{site,fun}/*.sql")에 따라 그대로 뒀다.

---

## 2. DDL 파일이 없는 테이블

| 테이블 | 실제 정의 위치 | 사유 |
|---|---|---|
| `site_user_oauth_accounts` | `sql/migration/USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql` (라인 34) | 마이그레이션 스크립트로만 생성. 별도 canonical DDL 파일 없음 — migration/ 은 그대로 두는 원칙이라 옮기지 않음 |
| `fun_teams` | `sql/V2/fun/CREATE_TABLE_FUN.sql` | V3 fun 통합 파일(`compyafun-v3_fun.sql`)에는 아직 이관 안 됨 |

**추가 발견 (요청 예시에 없었지만 확인됨)**: `data_pitch_type` / `data_player_card_pitch` / `data_player_legend_pitch` /
`data_player_skill_tier` / `data_player_skill_tier_value` 는 각각 `data_player_legend_stat.sql` /
`data_player_card_stat.sql` / `data_player_skill.sql` 안에 부모 테이블과 같이 정의돼 있었다(별도 파일 아님) — 정상, 문제 없음.

---

## 3. 운영 DB에 없는 DDL (미적용 또는 폐기)

`sql/V1/CREATE_TABLE_V1.sql` 안에 DDL은 있으나 현재 40테이블에 없는 것들:

| 테이블 | 상태 |
|---|---|
| `users`, `user_roles` | 40테이블에 없음. `site_users`로 컷오버 완료 추정(2026-08-20 시점 `table-classification.md`엔 305행으로 운영 중이었음 — 그 사이 DROP 된 것으로 보임) |
| `events` | 없음. `site_events`로 컷오버 완료 추정 |
| `coupons` | 없음. `site_coupons`로 컷오버 완료 추정 |
| `notices` | 없음. `site_notices`로 컷오버 완료 추정 |
| `quiz_answers` | 없음. `fun_quiz`로 컷오버 완료 추정 |
| `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes` | 파일 내 **주석 처리**. 파일 자체 코멘트(2026-09-02)에 "데이터 0건, DROP 확정, 실행문은 `sql/cleanup/drop_player_card_v1_v2.sql`" 명시 — 그 cleanup 스크립트는 현재 리포지토리에 없음(이미 실행돼 지워졌거나 별도 관리) |

`sql/V2/fun/CREATE_TABLE_FUN.sql` 안에도 주석 처리된 `fun_player_card` / `fun_player_card_hitter_stats` /
`fun_player_card_pitcher_stats` / `fun_player_card_pitcher_pitch_grades` / `fun_player_card_positions` 5종이
있다 — 전부 미적용, 40테이블에 없음. 손대지 않음(V2 유지 원칙).

---

## 4. 레거시 판정 — player_legend* 4종

| 테이블 | 행수 | BE 참조 |
|---|---:|---|
| `player_legend` | 62 | 0건 |
| `player_legend_hitter_career` | 40 | 0건 |
| `player_legend_pitcher_career` | 22 | 0건 |
| `legend_pitcher_pitch_slot` | 22 | 0건 |

**근거**: `mapper/player/*.xml` (`TeamMapper.xml` / `PlayerCardMapper.xml` / `PlayerCareer.xml`) 이
`table-classification.md`(2026-08-20 시점)엔 "살아 있다"고 기록돼 있었으나, 오늘(2026-09-13) 리포지토리에
**이 파일들이 존재하지 않는다** — 그 사이 삭제된 것으로 보인다. `grep -rw player_legend src/main` 도 0건.
즉 이전 문서의 "v2 mapper 살아있음" 판정은 **지금은 무효**고, 본 작업의 전제(0건)가 현재 사실과 일치한다.

**격리 위치**: `sql/_legacy/player_legend_v1/`
- `CREATE_TABLE_PLAYER_LEGEND_V1.sql` (구 `sql/CREATE_TABLE.sql`에서 분리)
- `INSERT_DATA_TABLE.sql`, `legendPlayer.sql` (구 `sql/insertData/`, 시드 데이터)

삭제하지 않았다 — 사용자 결정 대기(§7).

---

## 5. 재편 전후 폴더 구조

**이전(발췌)**
```
sql/CREATE_TABLE.sql, DROP_TABLE.sql        # V1 baseline, 전 테이블 혼재
sql/compyafun-v3_fun.sql                    # 미배치
sql/V3/data/*.sql (+ *_INSERT.sql)          # data_ 전체가 한 폴더, DDL/INSERT 혼재
sql/insertData/, sql/updateData/, sql/migration/
```

**이후**
```
sql/
├── V1/                     CREATE_TABLE_V1.sql, DROP_TABLE.sql (V1 잔존, player_legend* 제외)
├── V2/                     (변경 없음 — site/fun DDL 본체)
├── V3/
│   ├── data_history/       data_history_mode.sql
│   ├── data_player_card/   data_player_card.sql, data_player_card_stat.sql
│   ├── data_player_legend/ data_player_legend.sql, data_player_legend_stat.sql
│   ├── data_player_skill/  data_player_skill.sql
│   ├── fun/                compyafun-v3_fun.sql
│   └── site/               CREATE_TABLE_REFRESH_TOKENS.sql, site_user_event.sql, oauth/
├── V3_insert/               (V3와 동일 접두사 체계, INSERT 전용)
├── _legacy/player_legend_v1/  격리된 legacy DDL + 시드
├── migration/, updateData/ (변경 없음, updateData 에 1개 파일 추가 — §6)
```

---

## 6. 유지한 것 — migration/, updateData/ (+ 예외 1건)

지시대로 `sql/migration/`, `sql/updateData/` 는 **구조를 건드리지 않았다** — 스키마 변경/데이터 보정 이력이라
DDL·INSERT 분류 기준에 맞지 않는다.

**예외**: `sql/V3/data/data_player_legend_fix.sql` (백인천'82 재료 오류 교정 UPDATE 문)을
`sql/updateData/data_player_legend_fix.sql` 로 옮겼다. 이 파일은 DDL이 아니라 1회성 `UPDATE` 데이터
보정 스크립트로, `updateData/`의 기존 파일들(`fixMaterialPlayerNameSuffix.sql` 등)과 성격이 동일한데
DDL 폴더(`V3/data/`)에 잘못 놓여 있었다. `updateData/`에 새 파일을 추가하는 것이지 그 폴더의 기존 구조를
바꾸는 게 아니라 지시 위반이 아니라고 판단했다.

**옮기지 않고 제안만 하는 항목**: 없음 — migration/updateData 는 그대로가 맞다고 판단.

---

## 7. 사용자 결정 필요

### 7-1. player_legend* 4종(146행) 실제 삭제 여부
BE 참조 0건 확정(§4). 삭제하면 146행 소실. 보류/유지/폐기 3택 1 — 상세 선택지는 `table-classification.md` §5-1.

### 7-2. 커뮤니티 v1 (`boards`/`posts`/`tags`/`posts_tags`, 237~250행) 을 어떻게 할지
`table-classification.md` §5-2 에 **"① v2 에서 부활 확정"** 으로 이미 기록돼 있으나, 실행(계정 병합 →
`posts.author_id` 재매핑 → 이관 → legacy DROP)은 **아직 안 됐다** — `site_board`/`site_post`/`site_tag`
가 지금도 0행이다. 이번 재편에서 이 4테이블 DDL은 격리하지 않고 `sql/V1/CREATE_TABLE_V1.sql`에 그대로 뒀다
(재확인 필요: 이 결정이 여전히 유효한지, 아니면 재검토할지).

### 7-3. `teams` (20행) — 참조 실측 결과가 이전 문서와 다르다
`table-classification.md`(2026-08-20)는 "v2 `player/TeamMapper.xml`이 아직 legacy `teams`를 읽는다"고
기록했지만, 오늘 그 매퍼 파일이 존재하지 않는다. 현재는 `fun_teams`(V2 fun) 코드 주석에 "두 테이블이
컬럼이 사실상 같고 병존 중" 이라 적혀 있을 뿐 실제 SQL 참조는 양쪽 다 0건이다. `teams` DDL 을
player_legend*와 같이 `_legacy/`로 옮길지, 아니면 커뮤니티처럼 별도 결정 사안으로 둘지 확인이 필요하다.
지금은 `sql/V1/CREATE_TABLE_V1.sql`에 그대로 두고 헤더에 이 사실만 남겨뒀다.

### 7-4. `fun_teams` ↔ `teams` 중복
행수 20/20 동일 — 이관 완료로 보이나 어느 쪽을 canonical로 할지 결정 안 됨(`table-classification.md` §5-4 선수카드 덩어리와 연동).

---

## 8. `sql/test-README.md` 폐기 흡수 (2026-09-13)

`sql/test-README.md`(죽은 테이블 40개 전수 판정 문서)를 커뮤니티 문서(`sql/community_README.md`) 분리 작업 중 지웠다.
커뮤니티 8종(`site_board`/`site_post`/`site_tag`/`site_post_tag`/`site_comment`/`site_comment_reaction`/`site_post_reaction`/`site_report`)과
v1 4종(`boards`/`posts`/`tags`/`posts_tags`)은 그쪽으로 옮겼고, 그 외 정보는 이미 본 문서 §1~7 에 포함돼 있어 별도 절 없이 흡수 완료:

- `player_legend` 계열 4종(§4), `teams`/`fun_teams` 중복(§7-4) — 이미 기록돼 있던 내용과 동일
- **`site_user_event_daily` 코드 참조 재확인**: 옛 문서는 "있음"으로 기록했으나 2026-09-13 `grep -rn site_user_event_daily src/main --include=*.xml --include=*.java` 결과 0건 — 위 §1 표를 "없음"으로 정정했다. `site_user_event`(2행, 참조 있음)과 세트로 만들어졌으나 집계 기능 자체가 구현되지 않은 것으로 보인다

옛 문서의 "살아있는 테이블 30개" 목록은 본 문서 §1 표가 더 상세한 상위 호환이라 별도로 옮기지 않았다.

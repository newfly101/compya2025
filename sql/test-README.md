# 죽은 테이블 목록 (2026-09-13 기준)

**운영 DB 40개 테이블 중 코드가 더 이상 쓰지 않는 것은 10개. 그중 데이터가 남은 것은 8개.**
판정 기준: mapper XML(`src/main/resources/mapper/**`) + Java 전수에서 `FROM`/`JOIN`/`INSERT INTO`/`UPDATE`/`DELETE FROM` 뒤에 오는 테이블명 검색(단어 경계 매칭, 엔드포인트/클래스명 오검출 배제).

---

## 1. 죽은 테이블 중 데이터가 있는 것 (먼저 볼 것)

| 테이블 | 행수 | 무엇으로 교체됐나 | 데이터를 버려도 되는가 |
|---|---|---|---|
| `posts` | 237 | `site_post` (커뮤니티 v2) | **아니오.** `sql/V2/V1_TO_V2_COMMUNITY.sql` 이 이 데이터를 `site_post` 로 옮기는 스크립트인데 **아직 미실행**(스크립트 주석에 명시). `site_post` 는 현재 0건 — 이관 전에는 유일한 실제 데이터다 |
| `boards` | 4 | `site_board` | **아니오**, 위와 동일 사유. `site_board` 도 현재 0건 |
| `player_legend` | 62 | `data_player_legend`(74행, V3 재설계) | 예. V3 는 단순 이관이 아니라 재료·스탯 구조를 새로 설계한 것 — 롤백 대비 며칠 보관 후 폐기 권고 |
| `player_legend_hitter_career` | 40 | V3 쪽 대응 테이블 없음(통산 성적 자체가 V3 스펙에서 빠짐) | 예. 단, "통산 성적"을 V3 에 다시 넣을 계획이 있는지는 기획 확인 필요 |
| `player_legend_pitcher_career` | 22 | 〃 | 예, 위와 동일 |
| `legend_pitcher_pitch_slot` | 22 | `data_player_legend_pitch`(132행) | 예 |
| `tags` | 6 | `site_tag` | 예. `posts_tags` 연결이 0건이라 옮길 태그 매핑 자체가 없었다(마이그레이션 스크립트 주석 확인) |
| `teams` | 20 | `fun_teams`(20행, 이미 병행 적재됨) | 예. 행수가 같아 이관이 이미 끝난 상태로 보인다 |

⚠️ `posts`/`boards` 는 나머지 6개와 성격이 다르다 — **아직 이관되지 않은 유일한 원본**이라 삭제 후보가 아니라 "이관 실행 대기" 상태다.

## 2. 죽은 테이블 중 비어 있는 것 (행수 0)

| 테이블 | 사유 |
|---|---|
| `posts_tags` | `posts`↔`tags` 연결 테이블. 애초에 연결된 적이 없어(0건) 이관 스크립트도 옮길 대상이 없다고 명시 |
| `site_user_event_daily` | `site_user_event`(2건, 살아있음)의 일별 집계용으로 보이나 코드에서 전혀 참조 안 됨. 만들어 두고 구현이 안 된 것으로 추정 |

## 3. 살아있는 테이블 (30개)

| 테이블 | 행수 | 참조 mapper |
|---|---|---|
| `data_history_round`/`data_history_roster` | 70/1750 | `mapper/fun/historyMode/FunHistoryModeMapper.xml` |
| `data_pitch_type` | 10 | `mapper/fun/legendStat/FunLegendStatMapper.xml`, `mapper/fun/playerCard/PlayerCardMapper.xml` |
| `data_player_card`/`_stat`/`_pitch` | 11150/12412/21007 | `mapper/fun/playerCard/PlayerCardMapper.xml`, `mapper/fun/mileage/MileageMapper.xml` |
| `data_player_legend`/`_material` | 74/592 | `mapper/fun/legendCard/PlayerLegendMapper.xml`, `PlayerLegendMaterialMapper.xml`, `historyMode`, `legendStat`, `mileage`, `playerCard` |
| `data_player_legend_stat`/`_pitch` | 74/132 | `mapper/fun/legendStat/FunLegendStatMapper.xml` |
| `data_player_skill`/`_tier`/`_tier_value` | 92/540/877 | `mapper/fun/playerSkill/PlayerSkillMapper.xml` |
| `fun_quiz` | 5 | `mapper/fun/quiz/QuizMapper.xml` |
| `fun_teams` | 20 | `mapper/fun/team/FunTeamMapper.xml` |
| `site_coupons`/`site_events`/`site_notices` | 51/36/11 | `CouponMapper.xml`/`EventMapper.xml`/`NoticeMapper.xml` |
| `site_refresh_tokens` | 324 | `mapper/site/oauth/RefreshTokenMapper.xml` |
| `site_users`/`site_user_oauth_accounts` | 497/497 | `mapper/site/oauth/UserMapper.xml`, `UserOAuthAccountMapper.xml` |
| `site_user_event` | 2 | `mapper/site/analytics/AnalyticsEventMapper.xml` |
| `site_board`/`site_post`/`site_tag`/`site_post_tag`/`site_comment`/`site_comment_reaction`/`site_post_reaction`/`site_report` | 전부 0 | `mapper/site/community/*` (§5 참고 — 코드는 살아있으나 화면 동결) |

## 4. 판정 애매

- **커뮤니티 (`site_board`/`site_post`/`site_tag`/`site_post_tag`/`site_comment`/`site_comment_reaction`/`site_post_reaction`/`site_report`)**: mapper 코드는 전부 살아있어 "살아있는 테이블"로 분류했지만, 프로젝트 문서상 커뮤니티 화면은 **동결** 상태이고 실제 데이터는 아직 v1(`boards`/`posts`/`tags`)에만 있어 이 8개 테이블은 현재 전부 0건이다. 코드·스키마는 살아있는데 실사용 데이터는 없는 상태 — "이관 대기 중" 으로 보는 게 정확하다.
- `site_user_event_daily`: 코드 참조는 0건이라 "죽은 테이블"로 분류했지만, `site_user_event`(살아있음)와 세트로 설계된 흔적이 있어 "아직 구현 안 된 예정 테이블"일 가능성도 있다.

## 5. 사용자 결정 필요

1. **`sql/V2/V1_TO_V2_COMMUNITY.sql` 를 실행할 것인가** — 실행해야 `posts`(237)/`boards`(4) 데이터가 `site_post`/`site_board` 로 옮겨지고, 그 뒤에야 v1 쪽(`boards`/`posts`/`posts_tags`/`tags`)을 진짜 삭제 후보로 볼 수 있다. 스크립트 자체가 "애드센스 노출 위험 → noindex 권고" 경고를 담고 있어 실행 여부는 정책 판단이 필요하다.
2. **`player_legend_hitter_career`/`player_legend_pitcher_career`(통산 성적, 62행)** — V3 스펙에 대응 테이블이 없다. 통산 성적을 아예 기능에서 뺀 것인지, V3 로 이관할 계획이 남아있는지 확인 필요.
3. **`teams`/`player_legend`/`legend_pitcher_pitch_slot`** — 코드 참조 0건 + 이미 V2/V3 로 완전히 대체된 것으로 보여 삭제 후보로 추천하나, 최종 DROP 실행은 본 세션 범위 밖(요청대로 DROP 문 작성하지 않음).

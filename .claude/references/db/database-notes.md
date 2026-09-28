# DB 스키마 색인

기준일 2026-09-28. 이 문서는 지도다 — 상세 내용은 각 문서로 링크만 걸고 옮겨 적지 않는다. 어디를 봐야 할지 모를 때 여기서 시작한다.

기술 스택: MariaDB (10.5.29) + MyBatis (JPA 아님, XML 매퍼 수동 작성).

---

## 1. 먼저 알아야 할 것

- ⚠️ **테스트 DB 와 운영 DB 가 같은 인스턴스다.** `sql/` 안의 DDL 을 실행하면 즉시 운영에 반영된다. 스키마를 바꾸기 전에는 반드시 사용자에게 먼저 확인한다. (`ALTER TABLE` 실패 시 중간 상태로 남은 전례가 이미 한 번 있다 — `sql/V2/DROP_v1_tables.sql`.)
- **JPA 가 아니라 MyBatis** 라서 테이블 생성·변경은 전부 `sql/` 폴더의 DDL 파일을 사람이 손으로 관리한다. 엔티티만 고친다고 스키마가 바뀌지 않는다.
- **시각(시간대) 처리에 알려진 위험이 있다** — 서버·DB 어디에도 타임존이 명시돼 있지 않고, 같은 테이블 안에 `TIMESTAMP`/`DATETIME` 타입이 섞여 있는 곳이 있다 (`site_coupons`, `site_notices`). 상세: [`kst-timezone.md`](../consistency-audit/_common/kst-timezone.md)
- **문서보다 `sql/` 폴더 자체가 더 최신이다.** 아래 § 6 의 db 전용 문서 9편은 대부분 2026-08-20 시점(테이블 53개) 기준이고, 그 뒤로 대규모 정리가 있었다. 지금 실제 운영 DB는 **36개 테이블**이다 (2026-09-27 실측, [`db-verification.md`](../consistency-audit/_common/db-verification.md)). 테이블 존재 여부는 이 문서 § 3 과 [`sql-folders.md`](./sql-folders.md) § 2·4 를 기준으로 보고, 그 9편 문서는 정책·이슈 설명 참고용으로만 본다.

---

## 2. 이 문서가 왜 필요했나

DB 문서가 9편 2,235줄로 흩어져 있어 "어느 문서를 봐야 하나"를 알 수 없는 상태였다. 이 문서 하나로 "테이블이 몇 개고 뭘 담고 있나 → 상세는 어디" 순서로 찾아갈 수 있게 만드는 것이 목적이다. 테이블 목록 표(§ 3)만은 이 문서 안에 실제로 있다 — 그게 색인의 존재 이유다.

---

## 3. 테이블 전체 목록 (실측 36개, 2026-09-27 기준)

상태 값: **사용중**(mapper 가 실제로 조회) / **미사용**(mapper 참조 0건) / **의심**(테이블은 있으나 기능 미완성). 근거: [`db-verification.md`](../consistency-audit/_common/db-verification.md) § 8, [`sql-folders.md`](./sql-folders.md) § 2·4.

### 3-1. 접두사 없음 — v1 커뮤니티 잔존 (4개)

| 테이블 | 무엇을 담나 | 쓰는 도메인 | 상태 | 상세 문서 |
|---|---|---|---|---|
| `boards` | v1 게시판 정의 | community (레거시) | 미사용 — 단 이관 스크립트가 원본으로 참조해 **삭제 보류** | [`community-db-state.md`](./community-db-state.md) |
| `posts` | v1 게시글 (242행, 실데이터 있음) | community (레거시) | 미사용 — 삭제 보류(위와 동일 사유) | 〃 |
| `tags` | v1 태그 정의 | community (레거시) | 미사용 — 삭제해도 됨 | 〃 |
| `posts_tags` | v1 게시글-태그 연결 (0행) | community (레거시) | 미사용 — 삭제해도 됨 | 〃 |

### 3-2. `site_` — 사이트 운영 콘텐츠 (15개)

| 테이블 | 무엇을 담나 | 쓰는 도메인 | 상태 | 상세 문서 |
|---|---|---|---|---|
| `site_users` | 계정 (public_id/email/withdrawn_at — 유저 개편 3단계 반영 완료, OAuth 원본 컬럼 없음) | authentication, users | 사용중 | [`mapper-mapping.md`](../global-guide/develop/specs/db/mapper-mapping.md) §4.5 (구버전 컬럼 기준 — § 1 참고) |
| `site_user_oauth_accounts` | 소셜 로그인 원본 (provider+제공자ID UNIQUE) | authentication | 사용중 | `sql/V2/CREATE_04_TABLE_SITE.sql` |
| `site_refresh_tokens` | 로그인 세션 refresh 토큰 (해시 저장) | authentication | 사용중 — 단 만료 정리 인덱스만 있고 정리 배치 없음 | `tables.md` § 1.4 |
| `site_coupons` | 쿠폰 | coupons | 사용중 | [`coupons-definition-table.md`](../code-review-v2/prd/coupons/coupons-definition-table.md) |
| `site_events` | 이벤트 | events | 사용중 | [`events-definition-table.md`](../code-review-v2/prd/events/events-definition-table.md) |
| `site_notices` | 공지 | notices | 사용중 | [`notices-definition-table.md`](../code-review-v2/prd/notices/notices-definition-table.md) |
| `site_board` | 게시판 정의 (v2, 0행) | community (동결) | 사용중(코드는 완성, 데이터는 아직 없음) | [`community-db-state.md`](./community-db-state.md) |
| `site_post` | 게시글 (v2, 0행) | community (동결) | 사용중(위와 동일) | 〃 |
| `site_comment` | 댓글 (v1엔 없던 신규 기능) | community (동결) | 사용중 | 〃 |
| `site_tag` | 태그 정의 (v2, 0행) | community (동결) | 사용중 | 〃 |
| `site_post_tag` | 게시글-태그 연결 | community (동결) | 사용중 | 〃 |
| `site_post_reaction` | 게시글 반응(좋아요 등) | community (동결) | 사용중 | 〃 |
| `site_comment_reaction` | 댓글 반응 | community (동결) | 사용중 | 〃 |
| `site_report` | 신고 | community (동결) | 사용중 | 〃 |
| `site_user_event` | 사용자 행동 이벤트 기록 | analytics (내부 로깅) | 사용중 | `mapper/site/analytics/AnalyticsEventMapper.xml` |
| `site_user_event_daily` | 일별 집계 (0행) | analytics | 의심 — 집계 배치 자체가 아직 구현 안 됨(사용자 확인된 보류 작업) | [`db-verification.md`](../consistency-audit/_common/db-verification.md) § 8 |

> 표 행수가 15개가 아니라 16개로 보이는 건 `site_user_event_daily` 를 사용중 그룹에 같이 적어서다 — 실제로는 위 "의심" 표기가 맞는 상태다.

### 3-3. `fun_` — 사이트가 직접 운영하는 게임 콘텐츠 (2개)

| 테이블 | 무엇을 담나 | 쓰는 도메인 | 상태 | 상세 문서 |
|---|---|---|---|---|
| `fun_teams` | 구단 마스터 | players | 사용중 | `mapper/fun/team/FunTeamMapper.xml` |
| `fun_quiz` | 퀴즈 회차 | quiz | 사용중 | [`quiz-definition-table.md`](../code-review-v2/prd/quiz/quiz-definition-table.md) — ⚠ `fun_` 접두사이나 실제론 관리자가 등록하는 사이트 콘텐츠 (게임 데이터 아님, § 7 참고) |

### 3-4. `data_` — 게임 데이터 (13개)

| 테이블 | 무엇을 담나 | 쓰는 도메인 | 상태 | 상세 문서 |
|---|---|---|---|---|
| `data_player_card` | 선수 카드 (11,668건) | players | 사용중 | [`players-definition-table.md`](../code-review-v2/prd/players/players-definition-table.md) |
| `data_player_card_stat` | 카드별 스탯 | players | 사용중 | 〃 |
| `data_player_card_pitch` | 카드별 구종 등급 | players | 사용중 | 〃 |
| `data_player_legend` | 레전드 마스터 (74명) | legendStats, historyLegend | 사용중 | [`legendStats-definition-table.md`](../code-review-v2/prd/legendStats/legendStats-definition-table.md) |
| `data_player_legend_material` | 레전드 재료 (592행) | legendStats | 사용중 | 〃 |
| `data_player_legend_stat` | 레전드 스탯 | legendStats | 사용중 | 〃 |
| `data_player_legend_pitch` | 레전드 구종 등급 | legendStats | 사용중 | 〃 |
| `data_pitch_type` | 구종 마스터 (10종) | legendStats, players | 사용중 | 〃 |
| `data_history_round` | 히스토리 모드 회차 (70개) | historyLegend | 사용중 | [`historyLegend-definition-table.md`](../code-review-v2/prd/historyLegend/historyLegend-definition-table.md) |
| `data_history_roster` | 히스토리 모드 로스터 (1,750행) | historyLegend | 사용중 | 〃 |
| `data_player_skill` | 스킬 마스터 (92종) | playerSkills | 사용중 | [`playerSkills-definition-table.md`](../code-review-v2/prd/playerSkills/playerSkills-definition-table.md) |
| `data_player_skill_tier` | 스킬 티어 (540개) | playerSkills | 사용중 | 〃 |
| `data_player_skill_tier_value` | 티어별 수치 (877개) | playerSkills | 사용중 | 〃 |

> `mileage` 도메인은 전용 테이블이 없다 — `data_player_card` / `data_player_legend_material` 을 조회해 계산한다 (`mapper/fun/mileage/MileageMapper.xml`).

### 3-5. 접두사 없음 — 신규 (1개)

| 테이블 | 무엇을 담나 | 쓰는 도메인 | 상태 | 상세 문서 |
|---|---|---|---|---|
| `statistic_support_click` | 응원 클릭 통계 (0행, 신규) | odds (확인 필요) | 사용중(코드는 붙음, 데이터 미확인) | `sql/V3/CREATE_08_site_statistic_support_click.sql` — ⚠ 36개 중 유일하게 `site_`/`data_`/`fun_` 어디에도 안 속함 |

---

## 4. 도메인 ↔ 테이블 매핑

| 도메인 | 주요 테이블 | 매퍼 위치 |
|---|---|---|
| authentication / users | `site_users`, `site_user_oauth_accounts`, `site_refresh_tokens` | `mapper/site/oauth/*.xml` |
| coupons | `site_coupons` | `mapper/site/coupon/CouponMapper.xml` |
| events | `site_events` | `mapper/site/event/EventMapper.xml` |
| notices | `site_notices` | `mapper/site/notice/NoticeMapper.xml` |
| quiz | `fun_quiz` | `mapper/site/quiz/QuizMapper.xml` |
| community (동결) | `site_board`/`post`/`comment`/`tag`/`post_tag`/`post_reaction`/`comment_reaction`/`report` (+ 레거시 `boards`/`posts`/`tags`) | `mapper/site/community/*.xml` |
| players | `data_player_card`, `data_player_card_stat`, `data_player_card_pitch`, `fun_teams` | `mapper/fun/playerCard/PlayerCardMapper.xml`, `mapper/fun/team/FunTeamMapper.xml` |
| legendStats | `data_player_legend`, `data_player_legend_material`, `data_player_legend_stat`, `data_player_legend_pitch`, `data_pitch_type` | `mapper/fun/legendCard/*.xml`, `mapper/fun/legendStat/FunLegendStatMapper.xml` |
| historyLegend (BE 패키지명 `historyMode`) | `data_history_round`, `data_history_roster` | `mapper/fun/historyMode/FunHistoryModeMapper.xml` |
| playerSkills | `data_player_skill`, `data_player_skill_tier`, `data_player_skill_tier_value` | `mapper/fun/playerSkill/PlayerSkillMapper.xml` |
| mileage | (전용 테이블 없음 — `data_player_card`/`data_player_legend_material` 조회) | `mapper/fun/mileage/MileageMapper.xml` |
| admin / 내부 로깅 | `site_user_event`, `site_user_event_daily` | `mapper/site/analytics/AnalyticsEventMapper.xml` |
| odds (확인 필요) | `statistic_support_click` | `mapper/site/statistics/StatisticSupportClickMapper.xml` |

---

## 5. sql 폴더 구조

2026-09-13 재편으로 하위 폴더를 없애고 4개 폴더로 평탄화했다. 상세: [`sql-folders.md`](./sql-folders.md)

| 폴더 | 내용 | 실행 |
|---|---|---|
| `sql/V2/` | 구버전 스키마 DDL (`CREATE_01_TABLE_V1`, `CREATE_03_TABLE_FUN`, `CREATE_04_TABLE_SITE`) + `UPDATE_`/`MIGRATE_`/`DROP_` 이력 | `CREATE_` 는 순서대로 자동 실행 가능. 나머지는 사람이 조건 확인 후 |
| `sql/V2_insert/` | V2 시드 데이터 (`INSERT_`) + 1회성 데이터 보정 (`UPDATE_`) | `INSERT_` 는 대상 `CREATE_` 이후 자동 가능. `UPDATE_` 는 수동 |
| `sql/V3/` | 현행 스키마 DDL (`CREATE_01`~`CREATE_08`, 번호 = FK 의존 순서) | 순서대로 자동 실행 가능 |
| `sql/V3_insert/` | V3 시드 데이터 (`INSERT_` 전용) | 대상 `CREATE_` 이후 자동 가능 |

`CREATE_` 파일은 2026-09-13 운영 DB 덤프와 대조해 갱신된 "완전본"이다 — 컬럼 추가류 `ALTER_` 는 전부 흡수되어 지금은 남아있지 않다. 빈 DB에 스키마만 만들 때는 `V2/CREATE_03` → `V2/CREATE_04` → `V3/CREATE_01`~`08` 순으로 실행하면 된다 (`V2/CREATE_01_TABLE_V1.sql` 은 community v1 잔존 스키마라 별도 판단).

---

## 6. 상세 문서 지도

| 무엇을 알고 싶을 때 | 어느 문서 | 비고 |
|---|---|---|
| 테이블 정의 전체(PK/FK/INDEX), CHECK 제약 | [`tables.md`](../global-guide/develop/specs/db/tables.md) | 2026-08-20 기준, 53테이블 시절 — 지금 존재하는 테이블(§ 3-2·3-3) 서술만 유효 |
| 53테이블 시절 전수 분류·삭제 판단 근거 | [`table-classification.md`](../global-guide/develop/specs/db/table-classification.md) | 2026-08-20, 712줄. **대부분 대상 테이블이 지금은 DB 에 없다.** 커뮤니티 v1→v2 부활 결정(§5-2)만 지금도 유효 |
| 운영 DB 실측값(행수·갱신시각) — 옛 시점 | [`prod-actual-state.md`](../global-guide/develop/specs/db/prod-actual-state.md) | 2026-08-20, 53테이블. 최신 실측은 [`db-verification.md`](../consistency-audit/_common/db-verification.md)(2026-09-27) 사용 |
| 매퍼 ↔ 테이블 1:1 매핑, XML namespace 정합성 | [`mapper-mapping.md`](../global-guide/develop/specs/db/mapper-mapping.md) | 2026-08-20. `fun/playerCard` namespace mismatch 등 지금도 있는 코드 이슈는 유효, 대상 테이블 컬럼 서술은 옛 스키마 기준 |
| sql 폴더 재편 배경 (V1→_legacy 격리 등) | [`sql-folder-map.md`](../global-guide/develop/specs/db/sql-folder-map.md) | 2026-09-13. 40테이블 시점 — 이후 § 5 구조로 한 번 더 재편됨(`sql-folders.md` 가 최신) |
| 코드가 실제로 참조하는 테이블 전수 grep 결과 | [`code-table-inventory.md`](../global-guide/develop/specs/db/code-table-inventory.md) | 2026-08-20, 53테이블 시절. 방법론(§2 참조 맵 만드는 법)은 참고할 만하나 테이블 목록은 낡음 |
| 미사용 의심 테이블·컬럼·인덱스 근거 | [`dead-suspects.md`](../global-guide/develop/specs/db/dead-suspects.md) | 2026-08-20. 지금 없는 테이블 다수 포함 — § 3-1 목록으로 대체됨 |
| Java enum ↔ DB ENUM, 컬럼 alias 오타 등 코드-DB 정합 이슈 | [`dual-management.md`](../global-guide/develop/specs/db/dual-management.md) | 2026-08-20. `CardGrade`/`Grade` enum 불일치, `EventMapper` alias 오타는 **지금도 유효한 코드 이슈** (테이블이 남아있는 한) |
| legacy 테이블을 실제로 누가 쓰는지(쓰기 경로 추적) | [`legacy-write-origin.md`](../global-guide/develop/specs/db/legacy-write-origin.md) | 2026-08-20. `master`/`v2.0.0-refactor-mobile` 브랜치 비교 — 당시 legacy 4테이블(`users`/`user_roles`/`coupons`/`events`)은 지금 DB 에 없음 |
| 코드 참조 개수 (`sql/` 각 파일이 뭘 만드나) | [`sql-folders.md`](./sql-folders.md) | 2026-09-13, **가장 최신 — 우선 참조** |
| 커뮤니티 v1↔v2 데이터 이관 현황 | [`community-db-state.md`](./community-db-state.md) | 2026-09-13 |
| 운영 DB 실측(최신) — 추정 항목 확정 | [`db-verification.md`](../consistency-audit/_common/db-verification.md) | 2026-09-27, **가장 최신 실측 — 우선 참조** |
| 시각(타임존) 처리 이슈 | [`kst-timezone.md`](../consistency-audit/_common/kst-timezone.md) | 2026-09-27 |
| 도메인별 테이블 정의(컬럼 단위) | `docs/code-review-v2/prd/{도메인}/{도메인}-definition-table.md` | 도메인별 최신, § 3~4 링크 참고 |

---

## 7. 정리 대상 / 미확인

| 항목 | 내용 | 근거 |
|---|---|---|
| `tags`, `posts_tags` (v1) | mapper 참조 0건, 이관 스크립트도 안 씀 — 지금 삭제해도 안전 | `community-db-state.md` |
| `boards`, `posts` (v1, 246행) | 이관 스크립트(`sql/V2/MIGRATE_community_v1_to_v2.sql`)가 원본으로 아직 참조 중 — 이관 전에는 삭제 불가. 이관 여부 자체가 운영 정책(애드센스 재심사 영향) 결정 대기 | 〃 |
| `site_user_event_daily` | 테이블은 있으나 집계 배치 미구현. 사용자가 "별도 브랜치에서 처리 예정"으로 이미 확인한 보류 항목 | `db-verification.md` § 8 |
| `statistic_support_click` | 어느 도메인이 이 데이터를 쓰는지 이 라운드에서 확인 못함 — 매퍼 파일명(`site/statistics`)만 확인, 화면 연결은 미확인 | 확인 필요 |
| `fun_quiz` 접두사 | 사이트 콘텐츠인데 게임 데이터 접두사(`fun_`)를 달고 있음 — 이름 정리는 별도 결정 사안 | `db-verification.md` § 9 |
| `site_refresh_tokens` 만료 정리 | 만료 시각 인덱스는 있는데 정리 배치가 없음 — 토큰 테이블이 계속 쌓임 | `db-verification.md` § 11 |
| DB 문서 9편 중 6편이 2026-08-20 시점(53테이블) 기준 | 지금 36테이블과 크게 다름 — 재작성 또는 폐기 여부는 별도 결정 사안 (이번 라운드 범위 아님) | § 6 표 참고 |

---

## 8. 관련 문서

- [`./setup.md`](./setup.md)
- `./api.md` (미작성 — 확인 필요)
- `./deploy.md` (미작성 — 확인 필요)
- [`../_roadmap/requirements.md`](../_roadmap/requirements.md) (경로 확인 필요 — 이번 라운드에서 존재 검증 안 함)

# 운영 DB 53테이블 최종 분류

기준일 2026-08-20 · 대상 스키마 `compyafun` (MariaDB 10.5.29) · 판정 브랜치 `v2.0.0-refactor-mobile`

## 갱신 이력

**2026-08-20 (2차 갱신)** — v2 브랜치에서 **skill·wiki 도메인 코드가 전부 제거**됐다(BE Java 54개 + mapper XML 4개 + FE 31개, `compileJava`·`test`·`vite build` 통과). 이에 따라:

- `player_skills` 를 "v2 `/wiki/skill/:target` 이 도달하므로 유지(C)" 로 본 판정이 **무효**가 됐다 — v2 화면 자체가 없어졌다. `wiki_*` 3종을 "v2 가 쓸 빈 그릇(C)" 으로 본 판정도 같이 무효다.
- 재판정 결과 **즉시 삭제 가능(A)이 2개 → 5개**로 늘고(`wiki_*` 3종 추가), skill·coach 5종은 "운영만 쓰는 legacy(B)" 로 이동했다.
- 코드는 사라졌는데 **데이터가 남은 테이블**이 생겨 카테고리 **F** 를 신설했다(§3-F).
- `master`(운영) 사용 여부는 이번에도 `git show master:<path>` 로 직접 조회해 확정했다 — 판정 근거 열에 경로를 남겼다.

⚠️ **미해결 — 사용자 확인 필요**: `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 은 KBO 6종까지 DROP 하도록 작성돼 있으나, **KBO 는 크롤러가 계속 쓰므로 현상 유지**가 확정 결정이다(§5-5). 또한 그 스크립트는 **아직 실행되지 않았다**(파일 주석에 명시) — DB 테이블 53개는 전부 실재한다. 스크립트의 KBO 절은 보류 표시가 필요하다.

교차검증 입력 4종: `prod-actual-state.md`(실측) · `code-table-inventory.md`(코드 참조) · `../fe/v2-endpoint-reach.md`(화면 도달) · `legacy-write-origin.md`(쓰기 주체)

보강 조사: `master` 브랜치 mapper XML 15개 전수 조회 — "운영(master) 사용" 축을 추정이 아닌 코드 근거로 확정 (§8-6, §8-7, §8-8)

---

## §1 결론 요약

### 지금 당장 안전하게 지울 수 있는 테이블 — 5개

| 테이블 | 행수 | 왜 안전한가 |
|---|---|---|
| `notices` | 0 | v2 코드·화면 미참조 + `master` NoticeMapper.xml 이 **빈 파일**(SQL 0건) + FK 양방향 0건 + 데이터 없음 |
| `posts_tags` | 0 | v2 코드·화면 미참조 + `master` 어느 mapper 도 미참조 + 데이터 없음 + 이 테이블을 참조하는 자식 없음(자기가 부모를 참조할 뿐) |
| `wiki_stat_influence` | 0 | wiki 도메인 코드가 v2 에서 제거됨 + `master` 에 wiki 참조 **0건**(`git grep wiki_ master` 무결과) + 데이터 없음 + FK 양방향 0건 |
| `wiki_pitch_grade` | 0 | 동상. `wiki_pitch` 를 FK 참조하는 자식이므로 `wiki_pitch` 보다 먼저 삭제 |
| `wiki_pitch` | 0 | 동상. `wiki_pitch_grade` 의 FK 부모라 마지막에 삭제 |

이 5개 외에는 **오늘 지워도 되는 테이블이 없다.** 나머지 48개는 운영 장애가 나거나(§7), 데이터가 소실되거나(§3-F), 사용자 결정이 필요하다(§5).

### 카테고리별 개수

| 코드 | 이름 | 개수 | 한 줄 판정 |
|---|---|---|---|
| A | 즉시 삭제 가능 | **5** | 4축 전부 미사용 + 데이터 0 + 삭제 제약 없음 |
| B | v2 배포 후 삭제 | **9** | 운영(master)만 쓰는 legacy. v2 컷오버(+ 필요 시 데이터 병합)가 선행돼야 삭제 가능 |
| C | 유지 | **6** | v2 화면이 실제로 도달하는 테이블 |
| D | 판단 보류 | **30** | 레전드·선수카드·커뮤니티·KBO 덩어리. 기획 결정이 나와야 갈림(§5) |
| E | 데이터 이관 필요 | **1** | `quiz_answers`(5행) → `fun_quiz`(0행). v2 대상은 `fun_quiz` 로 확정, 5행 처리만 남음 |
| F | 코드 소멸·데이터 잔존 | **2** | v2·master 어느 쪽에도 읽는 코드가 없는데 행이 남아 있다. 지우면 데이터가 사라진다(§3-F) |
| | **합계** | **53** | |

### 한눈에 보는 구조

- v2 모바일이 실제로 굴리는 테이블은 **6개뿐** (`site_*` 5 + `fun_quiz`) — skill·wiki 코드 제거로 10개에서 4개 줄었다
- 운영 서버(`master` 구코드)가 굴리는 테이블은 **21개** — skill·wiki 제거 후 **v2 와 겹치는 테이블은 0개**가 됐다(이전에는 `player_skills` 1개가 겹쳤다)
- 나머지 **30개(57%)** 는 "누가 주인인지" 기획이 정해야 판정이 끝난다
- 데이터가 있는데 읽는 코드가 사라진 것이 **2개(142행)** — 삭제 전 사용자 확인 필요(§3-F)

---

## §2 전수 분류표 (53행)

표기: 참조 / 도달 / 사용 = O(있음) · X(없음) · △(조건부, 근거 열 참조)

### 2-1. legacy V1 — site 계열 (10)

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `users` | legacy site | 305 | 2026-08-20 22:40 | X | X | **O** | **B** | master `UserMapper.xml` 이 네이버 로그인마다 INSERT/UPDATE. v2 는 `site_users` 만 씀 |
| `user_roles` | legacy site | 305 | 2026-08-14 22:21 | X | X | **O** | **B** | master 신규 가입 시 INSERT. v2 는 `site_users.user_role` / `user_status` 로 흡수 |
| `coupons` | legacy site | 50 | 2026-08-12 07:56 | X | X | **O** | **B** | master `coupon/CouponMapper.xml` INSERT/UPDATE (관리자 조작 시) |
| `events` | legacy site | 33 | 2026-08-12 07:51 | X | X | **O** | **B** | master `event/EventMapper.xml` INSERT/UPDATE |
| `boards` | legacy site | 4 | 2026-02-08 15:26 | X | X | **O** | **D** | master `BoardMapper.xml` 활성. v2 대응 `site_board` 는 0행 + 라우트 주석처리 — 커뮤니티 결정 대기 |
| `posts` | legacy site | 242 | 2026-02-08 15:26 | X | X | **O** | **D** | master `PostMapper.xml` 활성. 242행 보유 — 커뮤니티 결정 대기 |
| `tags` | legacy site | 6 | 2026-02-08 15:27 | X | X | **O** | **D** | master `TagMapper.xml` 활성 — 커뮤니티 결정 대기 |
| `posts_tags` | legacy site | 0 | 없음 (생성 2026-02-03) | X | X | X | **A** | master 포함 어느 mapper 도 미참조 + 0행 + 참조하는 자식 없음 |
| `notices` | legacy site | 0 | 없음 (생성 2026-02-08) | X | X | X | **A** | master `NoticeMapper.xml` 이 빈 파일 + 0행 + FK 0건 |
| `quiz_answers` | legacy site | 5 | 2026-05-08 17:45 | X | X | **O** | **E** | master `quiz/QuizAnswerMapper.xml` 활성. v2 대상은 `fun_quiz`(FE 도달 확정)인데 0행 → 5행 이관 판단 필요 |

### 2-2. legacy V1 — 선수·스킬 계열 (14)

> ✅ **확인**: `player_legend` · `player_legend_hitter_career` · `player_legend_pitcher_career` 는 이번 삭제 대상이 아니다. v2 작업트리에 `src/main/resources/mapper/player/PlayerCareer.xml` · `player/PlayerCardMapper.xml` · `player/TeamMapper.xml` 이 **그대로 살아 있다**(직접 조회 확인). skill 계열과 혼동 금지.

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `player_skills` | legacy 선수 | 92 | 2026-02-04 19:49 | X | X | **O** | **B** | v2 skill 도메인 코드 제거로 참조 0건(`grep player_skills src/main/` 무결과). `master:src/main/resources/mapper/PlayerSkills.xml` 이 `SELECT ... FROM player_skills` → **운영 활성**. 92행 잔존 → §3-B 데이터 처리 필요 |
| `teams` | legacy 선수 | 20 | 2026-01-19 02:36 | **O** | X | **O** | **D** | v2 `TeamMapper.xml` 이 아직 legacy `teams` 를 읽음(`fun_teams` 아님). 3개 테이블이 FK 로 물려 있음(§6-4) |
| `player_legend` | legacy 선수 | 62 | 2026-01-23 01:40 | **O** | X | **O** | **D** | v2 `PlayerCardMapper.xml:selectPlayersByPosition` 참조하나 FE 미도달. 자식 3개 |
| `player_legend_hitter_career` | legacy 선수 | 40 | 2026-01-21 23:23 | **O** | X | **O** | **D** | `PlayerCareer.xml` 참조, FE 미도달 |
| `player_legend_pitcher_career` | legacy 선수 | 22 | 2026-01-21 23:26 | **O** | X | **O** | **D** | 동상 |
| `legend_pitcher_pitch_slot` | legacy 선수 | 22 | 2026-01-22 23:19 | X | X | X | **F** | mapper 0건 (v2·master 양쪽 — master 참조는 `sql/CREATE_TABLE.sql` 등 DDL·시드뿐). 22행 보유 + `player_legend` FK 자식 |
| `skill_pitcher_grade_stat` | legacy 선수 | 120 | 2026-01-23 01:15 | X | X | X | **F** | mapper 0건 (v2·master 양쪽 — master 참조는 `sql/insertData/skillGradeStat.sql` 시드뿐). 120행 보유 + `player_skills` FK 자식 |
| `skill_score_config` | legacy 선수 | 97 | 2026-03-28 18:37 | X | X | **O** | **B** | v2 skill 도메인 제거로 참조 0건. `master:src/main/resources/mapper/SkillScoreConfigMapper.xml` 이 `FROM skill_score_config` → 운영 활성. 97행 잔존 |
| `coach` | legacy 선수 | 6 | 2026-02-04 23:56 | X | X | **O** | **B** | v2 참조 0건(coach 코드가 `domain/skill` 안에 있어 함께 제거). `master:src/main/resources/mapper/CoachMapper.xml` 이 `FROM coach` → 운영 활성 |
| `coach_skill_condition` | legacy 선수 | 23 | 2026-02-05 00:05 | X | X | **O** | **B** | 동상 (`master` CoachMapper.xml `FROM coach_skill_condition`) |
| `coach_skill_buff` | legacy 선수 | 24 | 2026-02-05 00:15 | X | X | **O** | **B** | 동상 (`master` CoachMapper.xml `FROM coach_skill_buff`) |
| `player_card` | legacy 선수 | 0 | 없음 (생성 2026-02-25) | △ | X | **O** | **D** | mapper 에 INSERT 만 있고 SELECT 0건. 0행 + 자식 2개 + `teams` FK 부모 |
| `player_card_hitter_attributes` | legacy 선수 | 0 | 없음 (생성 2026-02-25) | △ | X | **O** | **D** | INSERT 만 |
| `player_card_pitcher_attributes` | legacy 선수 | 0 | 없음 (생성 2026-02-25) | △ | X | **O** | **D** | INSERT 만 |

### 2-3. KBO 계열 (6)

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `kbo_games` | KBO | 735 | 2026-08-20 09:00 | X | X | **O** | **D** | Python 크롤러가 매일 09:00 / 23:30 UPSERT + master `kbo/KboGameMapper.xml` 이 SELECT. **가장 활발한 테이블** |
| `kbo_players` | KBO | 167 | 2026-04-02 01:25 | X | X | X | **D** | 크롤러 23:45 UPSERT. BE mapper 0건 (v2·master 양쪽) |
| `kbo_batter_logs` | KBO | 530 | 2026-04-02 01:25 | X | X | X | **D** | 크롤러 23:45 UPSERT |
| `kbo_teams` | KBO | 10 | 2026-04-02 00:59 | X | X | X | **D** | 크롤러가 쓰진 않으나 `kbo_games` / `kbo_players` FK 부모 — 지우면 크롤러 INSERT 실패 |
| `kbo_seasons` | KBO | 1 | 2026-04-02 00:59 | X | X | X | **D** | `kbo_games.season_year` FK 부모 — 동상 |
| `kbo_team_code_mappings` | KBO | 10 | 2026-04-02 22:46 | X | X | X | **D** | 시드만 존재, mapper 0건. **legacy `teams` 를 FK 참조** — `teams` 삭제의 걸림돌(§6-4) |

### 2-4. V2 site_ 계열 (12) + V3 `site_refresh_tokens` (1)

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `site_users` | V2 site | 123 | 2026-08-20 18:43 | **O** | **O** | X | **C** | 로그인 / `GET /users/me` / `/admin/user` 도달 |
| `site_refresh_tokens` | V3 site | 2 | 2026-08-20 18:43 | **O** | **O** | X | **C** | 토큰 회전 (refresh / logout) 도달 |
| `site_coupons` | V2 site | 28 | 2026-04-03 23:52 | **O** | **O** | X | **C** | `/coupons`, `/admin/coupon` 도달 |
| `site_events` | V2 site | 21 | 2026-04-04 01:46 | **O** | **O** | X | **C** | `/events`, `/admin/event` 도달 |
| `site_notices` | V2 site | 6 | 2026-04-04 12:46 | **O** | **O** | X | **C** | `/notices`, `/admin/notice` 도달 (수정·노출토글에 FE 결함 있으나 조회는 정상) |
| `site_board` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | mapper·Controller 완비. FE 커뮤니티 라우트 통째 주석 — 부활 여부 결정 대기 |
| `site_post` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상. 자식 3개 |
| `site_tag` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상 |
| `site_post_tag` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상 |
| `site_comment` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상. legacy 대응 없는 신규 기능 |
| `site_post_reaction` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상 |
| `site_comment_reaction` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상 |
| `site_report` | V2 site | 0 | 없음 (생성 2026-04-04) | **O** | X | X | **D** | 동상. FK 0건 |

### 2-5. V2 fun_ 계열 (7)

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `fun_quiz` | V2 fun | 0 | 없음 (생성 2026-05-09) | **O** | **O** | X | **C** | 홈 화면 `GET /quiz/latest` → `QuizMapper.selectLatestVisible` 도달 확정. **0행이라 현재 홈 퀴즈가 빈 상태** |
| `fun_teams` | V2 fun | 20 | 2026-04-03 00:09 | X | X | X | **D** | 데이터 20행은 `teams` 에서 이관 완료 상태로 보이나 **코드가 아직 legacy `teams` 를 읽음**. 선수카드 결정에 종속 |
| `fun_player_card` | V2 fun | 0 | 없음 (생성 2026-04-03) | △ | X | X | **D** | Controller 까지 연결되나 XML namespace ≠ Java FQCN → 호출 시 예외 위험(§8-2). 0행 |
| `fun_player_card_hitter_stats` | V2 fun | 0 | 없음 (생성 2026-04-03) | △ | X | X | **D** | mapper 는 있으나 Repository/Service 미주입 = 호출 경로 없음 |
| `fun_player_card_pitcher_stats` | V2 fun | 0 | 없음 (생성 2026-04-03) | △ | X | X | **D** | 동상 |
| `fun_player_card_pitcher_pitch_grades` | V2 fun | 0 | 없음 (생성 2026-04-03) | △ | X | X | **D** | 동상 |
| `fun_player_card_positions` | V2 fun | 0 | 없음 (생성 2026-04-03) | △ | X | X | **D** | 동상 |

### 2-6. V3 wiki_ 계열 (3)

| 테이블 | 계열 | 행수 | 최종갱신 | v2 코드참조 | v2 화면도달 | 운영(master)사용 | 카테고리 | 근거 |
|---|---|---|---|---|---|---|---|---|
| `wiki_pitch` | V3 wiki | 0 | 없음 (생성 2026-05-31) | X | X | X | **A** | v2 wiki 도메인(BE 22 + FE 31 파일) 제거로 참조 0건. `master` 에도 wiki 참조 0건(`git grep wiki_ master` 무결과 — v3 신규 테이블이라 애초에 없음). 0행 |
| `wiki_pitch_grade` | V3 wiki | 0 | 없음 (생성 2026-05-31) | X | X | X | **A** | 동상. `wiki_pitch` FK 자식 → 부모보다 먼저 DROP |
| `wiki_stat_influence` | V3 wiki | 0 | 없음 (생성 2026-05-31) | X | X | X | **A** | 동상. FK 양방향 0건 |

### 2-7. 검산

| 계열 | 개수 |
|---|---|
| legacy site | 10 |
| legacy 선수·스킬 | 14 |
| KBO | 6 |
| V2 site_ + V3 refresh_tokens | 13 |
| V2 fun_ | 7 |
| V3 wiki_ | 3 |
| **합계** | **53** ✅ |

| 카테고리 | 개수 | 갱신 전 | 증감 |
|---|---|---|---|
| A 즉시 삭제 | 5 | 2 | +3 (`wiki_*` 3종) |
| B v2 배포 후 삭제 | 9 | 4 | +5 (`player_skills` · `skill_score_config` · `coach` 3종) |
| C 유지 | 6 | 10 | −4 (`player_skills` · `wiki_*` 3종 이탈) |
| D 판단 보류 | 30 | 36 | −6 (B 로 4, F 로 2) |
| E 데이터 이관 필요 | 1 | 1 | — |
| F 코드 소멸·데이터 잔존 | 2 | (신설) | +2 (`legend_pitcher_pitch_slot` · `skill_pitcher_grade_stat`) |
| **합계** | **53** ✅ | **53** | |

---

## §3 카테고리별 상세

### A — 즉시 삭제 가능 (5)

| 테이블 | 행수 | 조치 |
|---|---|---|
| `posts_tags` | 0 | 백업 불필요(0행). 삭제 전 `SELECT COUNT(*)` 재확인만 |
| `notices` | 0 | 동상 |
| `wiki_pitch_grade` | 0 | 동상. `wiki_pitch` 의 FK 자식 → 먼저 |
| `wiki_stat_influence` | 0 | 동상. FK 없음 |
| `wiki_pitch` | 0 | 동상. `wiki_pitch_grade` 의 FK 부모 → 마지막 |

조치 SQL (실행은 사용자 승인 후):

```sql
-- 사전 확인 — 5개 전부 0 이어야 함
SELECT 'posts_tags' AS t, COUNT(*) AS c FROM posts_tags
UNION ALL SELECT 'notices',            COUNT(*) FROM notices
UNION ALL SELECT 'wiki_pitch_grade',   COUNT(*) FROM wiki_pitch_grade
UNION ALL SELECT 'wiki_stat_influence',COUNT(*) FROM wiki_stat_influence
UNION ALL SELECT 'wiki_pitch',         COUNT(*) FROM wiki_pitch;

DROP TABLE posts_tags;
DROP TABLE notices;

-- wiki 3종은 이 순서 (자식 → 부모)
DROP TABLE wiki_pitch_grade;
DROP TABLE wiki_stat_influence;
DROP TABLE wiki_pitch;
```

`posts_tags` / `notices` 는 순서 제약 없음. wiki 3종만 `wiki_pitch_grade` → `wiki_pitch` 순서를 지켜야 한다.

### B — v2 배포 후 삭제 (9)

**B-1. 운영 인증·쿠폰·이벤트 legacy (4) — 데이터 병합 필요**

| 테이블 | 행수 | 데이터 이관 필요 | 조치 방법 |
|---|---|---|---|
| `users` | 305 | **필요** — `site_users` 123행과 병합 (182행 격차) | ① v2 컷오버 → ② 계정 병합(§4-2) → ③ 병합 검증 → ④ `user_roles` 먼저 DROP 후 `users` DROP |
| `user_roles` | 305 | **필요** — `site_users.user_role` / `user_status` 로 흡수 | `users` 병합과 동일 트랜잭션에서 처리. `users` 보다 먼저 DROP |
| `coupons` | 50 | **필요 여부 확인** — `site_coupons` 28행이 부분집합인지 별개인지 미확인 | 컬럼 8개가 완전히 동일 → `coupon_code` 기준 차집합 INSERT 후 DROP |
| `events` | 33 | **필요 여부 확인** — `site_events` 21행, 동상 | 컬럼 동일(타입만 timestamp ↔ datetime) → 차집합 INSERT 후 DROP |

**B-2. 운영 skill·coach (5) — v2 대응 테이블 없음, 병합 대상 없음** ← 이번 갱신에서 D 로부터 이동

| 테이블 | 행수 | master 근거 (직접 조회) | 조치 방법 |
|---|---|---|---|
| `player_skills` | **92** | `master:src/main/resources/mapper/PlayerSkills.xml` | v2 는 더 이상 안 씀. 운영 PC 사이트 스킬 기능 종료 선언 + 컷오버 후 DROP. **92행은 옮길 곳이 없다 → §3-F 와 같은 데이터 손실 확인 대상** |
| `skill_score_config` | **97** | `master:src/main/resources/mapper/SkillScoreConfigMapper.xml` | 동상. `player_skills` 의 FK 자식이므로 부모보다 먼저 DROP |
| `coach` | 6 | `master:src/main/resources/mapper/CoachMapper.xml` | 동상. `coach_skill_*` 2개를 먼저 DROP |
| `coach_skill_condition` | 23 | 동상 | FK 제약 없음 |
| `coach_skill_buff` | 24 | 동상 | FK 제약 없음 |

⚠️ B 9개 모두 **운영 서버가 지금도 쓰고 있다.** v2 배포 컷오버 전에 지우면 즉시 장애(§7-1, §7-4).
⚠️ B-2 5종은 **v2 에 대응 테이블이 없다** — 컷오버해도 데이터가 갈 곳이 없다. 삭제는 곧 **242행(92+97+6+23+24) 폐기**다.

### C — 유지 (6)

| 테이블 | v2 도달 경로 |
|---|---|
| `site_users` | 로그인 / `GET /users/me` / `/admin/user` |
| `site_refresh_tokens` | `POST /auth/refresh`, `/auth/logout` |
| `site_coupons` | `/`, `/coupons`, `/admin/coupon` |
| `site_events` | `/`, `/events`, `/admin/event` |
| `site_notices` | `/`, `/notices`, `/notice/:id`, `/admin/notice` |
| `fun_quiz` | `/`(홈) `GET /quiz/latest` |

조치: 삭제 금지. 단 `fun_quiz` 는 **행수 0** 이라 홈 화면 퀴즈가 빈 채로 뜬다 — 데이터 투입이 별건으로 필요하다(§5-3).

> 이전 판정에서 C 에 있던 `player_skills` · `wiki_pitch` · `wiki_pitch_grade` · `wiki_stat_influence` 4개는 **v2 도달 경로가 코드째 사라져** 각각 B / A 로 이동했다. FE 에는 `MENU_GROUPS.js` · `QUICK_MENUS.js` 의 `/skill` 항목이 `comingSoon: true` 인 껍데기로만 남아 있고, 어떤 API 도 호출하지 않는다.

### D — 판단 보류 (30)

4개 덩어리로 묶인다. 각 덩어리의 결정 선택지는 §5.

| 덩어리 | 개수 | 테이블 |
|---|---|---|
| 레전드 | 4 | `teams`, `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career` |
| 커뮤니티 | 11 | legacy `boards` / `posts` / `tags` + v2 `site_board` / `site_post` / `site_tag` / `site_post_tag` / `site_comment` / `site_post_reaction` / `site_comment_reaction` / `site_report` |
| 선수카드 | 9 | legacy `player_card` / `player_card_hitter_attributes` / `player_card_pitcher_attributes` + v2 `fun_player_card` / `fun_player_card_hitter_stats` / `fun_player_card_pitcher_stats` / `fun_player_card_pitcher_pitch_grades` / `fun_player_card_positions` / `fun_teams` |
| KBO | 6 | `kbo_games`, `kbo_players`, `kbo_batter_logs`, `kbo_teams`, `kbo_seasons`, `kbo_team_code_mappings` |
| **합계** | **30** ✅ | |

조치: 결정 전까지 **아무것도 지우지 않는다.** 다만 결정과 무관하게 확정된 사실 3가지 —

- `teams` 는 v2 `player/TeamMapper.xml` 이 아직 읽고 있으므로 어느 결정이든 코드 전환이 선행돼야 삭제 가능
- `player_legend` 3종도 v2 `player/PlayerCardMapper.xml` · `player/PlayerCareer.xml` 이 살아 있다 — **skill 삭제와 무관하게 그대로다**
- `fun_player_card*` 5개는 지금 상태로는 **호출 경로가 없다** — "살아있는 v2 기능"으로 오해 금지(§8-1)

### E — 데이터 이관 필요 (1)

| 테이블 | 조치 |
|---|---|
| `quiz_answers` (5행) | v2 대상은 `fun_quiz` 로 확정(FE 홈 화면 도달). `fun_quiz` 가 0행이라 **지금 홈 화면 퀴즈가 비어 있는 상태**. 5행 이관(또는 신규 회차부터 시작) 결정 후 `quiz_answers` 는 B 절차로 삭제 |

이관 SQL 초안 (실행 금지, 검토용):

```sql
INSERT INTO fun_quiz (round, image_url, created_at, updated_at)
SELECT round, image_url, created_at, updated_at
FROM quiz_answers
WHERE is_visible = 1          -- 노출 정책 결정에 따라 조정
ORDER BY round;
```

### F — 코드 소멸·데이터 잔존 (2) 🔴 사용자 확인 필요

v2·master **어느 브랜치에도 이 테이블을 읽는 mapper 가 없다.** 그런데 행이 남아 있다. 즉 지금 지워도 코드는 아무 데도 안 깨지지만, **데이터는 영구히 사라진다.**

| 테이블 | 행수 | 코드 축 확인 결과 | FK 관계 | 삭제 시 잃는 것 |
|---|---|---|---|---|
| `skill_pitcher_grade_stat` | **120** | v2 mapper 0건 / master mapper 0건. master 참조는 `sql/insertData/skillGradeStat.sql`(시드) · `sql/CREATE_TABLE.sql`(DDL) 뿐 | `player_skills` 의 FK 자식 | 스킬 × 등급별 스탯표 120행 |
| `legend_pitcher_pitch_slot` | **22** | 동상. master 참조는 `sql/CREATE_TABLE.sql` · `sql/insertData/INSERT_DATA_TABLE.sql` 뿐 | `player_legend` 의 FK 자식 | 레전드 투수 구종 슬롯 22행 |

**권고: 지우기 전에 덤프를 뜬다.** 두 테이블 모두 자식이 없으므로 순서 제약 없이 DROP 가능하다.

```sql
-- 삭제 전 백업 (권고)
-- mysqldump -u<user> -p compyafun skill_pitcher_grade_stat legend_pitcher_pitch_slot > backup_F.sql

DROP TABLE skill_pitcher_grade_stat;   -- 부모 player_skills 는 남김 (B)
DROP TABLE legend_pitcher_pitch_slot;  -- 부모 player_legend 는 남김 (D)
```

⚠️ `legend_pitcher_pitch_slot` 은 레전드 결정(§5-1)이 "유지"로 나면 다시 필요해질 수 있다 — 레전드 결정 전에 지우지 않는 편이 안전하다. `skill_pitcher_grade_stat` 은 스킬 기능이 v2 에서 사라진 것이 확정이라 상대적으로 안전하다.

---

## §4 데이터 이관 필요 쌍

### 4-1. v2 대응 테이블이 완전히 비어 있는 쌍 (legacy > 0, v2 = 0)

| legacy (행수) | V2 대응 (행수) | 컬럼 구조 차이 | 이관 난이도 | 비고 |
|---|---|---|---|---|
| `quiz_answers` (5) | `fun_quiz` (0) | v2 가 `title` · `is_visible` 2컬럼을 **의도적으로 제거**(V3 마이그레이션). `round` / `image_url` / `created_at` / `updated_at` 동일 | **낮음** | v2 대상 확정. 지금 홈 퀴즈가 비어 있음 → 우선순위 높음 |
| `boards` (4) | `site_board` (0) | v2 가 `use_comment` / `use_like` / `use_tag` 3컬럼 추가. 나머지 동일 | **낮음** | 신규 3컬럼은 기본값으로 채우면 됨. 커뮤니티 결정 대기(§5-2) |
| `tags` (6) | `site_tag` (0) | 컬럼 8개 완전 동일 (`created_at` / `updated_at` 타입만 timestamp → datetime) | **낮음** | 사실상 그대로 복사. 커뮤니티 결정 대기 |
| `posts` (242) | `site_post` (0) | v2 가 `is_deleted` + 카운터 4개(`comment_count` / `like_count` / `dislike_count` / `report_count`) 추가. **`author_id` 가 legacy `users.id` 기준** | **중간~높음** | 카운터는 0 으로 채우면 되나, `author_id` 를 `site_users.id` 로 **재매핑**해야 함 → §4-2 계정 병합이 선행돼야 함. 242행 = 유일한 커뮤니티 실데이터 |

### 4-2. 양쪽 다 데이터가 있으나 legacy 가 더 많은 쌍 (격차 보정)

| legacy (행수) | V2 대응 (행수) | 컬럼 구조 차이 | 이관 난이도 | 비고 |
|---|---|---|---|---|
| `users` (305) | `site_users` (123) | `provider` → `oauth_provider`, `provider_id` → `oauth_provider_id`, `nickname` → `service_nickname` 개명. v2 가 `email` / `user_role` / `user_status` / `updated_at` 4컬럼 추가 | **높음** | 182행 격차. `site_users` 에 이미 123행이 있어 **중복 병합** 필요 — `(oauth_provider, oauth_provider_id)` 를 병합 키로. `id` 가 어긋나면 `site_refresh_tokens` · `site_post.author_id` 정합이 깨짐 |
| `user_roles` (305) | `site_users` (컬럼 흡수) | `role` → `user_role`, `status` → `user_status` 로 흡수. **`ban_reason` 은 v2 에 대응 컬럼 없음** | **중간** | `users` 병합과 동일 트랜잭션에서 처리. `ban_reason` 소실 여부를 결정해야 함 |
| `coupons` (50) | `site_coupons` (28) | **컬럼 8개 완전 동일** | **낮음** | 22행 격차. `coupon_code` 로 차집합 판정 후 INSERT |
| `events` (33) | `site_events` (21) | 컬럼 10개 동일 (`created_at` / `updated_at` 타입만 timestamp → datetime) | **낮음** | 12행 격차. `title` + `start_at` 등으로 차집합 판정 |

### 4-3. 이관은 끝났는데 코드가 안 따라간 쌍

| legacy (행수) | V2 대응 (행수) | 컬럼 구조 차이 | 이관 난이도 | 비고 |
|---|---|---|---|---|
| `teams` (20) | `fun_teams` (20) | `city` → `city_name` 개명, v2 가 `updated_at` 추가 | **이관 불필요** | 행수 동일 = 데이터 이관 완료 추정. 문제는 **v2 `TeamMapper.xml` 이 아직 legacy `teams` 를 읽는다**는 것 — 데이터 작업이 아니라 코드 전환 작업 |

### 4-4. 이관 대상 없음 (양쪽 다 0행)

`posts_tags` ↔ `site_post_tag`, `player_card` ↔ `fun_player_card`, `player_card_hitter_attributes` ↔ `fun_player_card_hitter_stats`, `player_card_pitcher_attributes` ↔ `fun_player_card_pitcher_stats` — 4쌍 모두 양쪽 0행이라 옮길 데이터가 없다.

### 4-5. v2 대응 테이블 자체가 없는 것

`player_legend`(62) · `player_legend_hitter_career`(40) · `player_legend_pitcher_career`(22) · `legend_pitcher_pitch_slot`(22) · `player_skills`(92) · `skill_pitcher_grade_stat`(120) · `skill_score_config`(97) · `coach`(6) · `coach_skill_condition`(23) · `coach_skill_buff`(24)

→ 총 **508행**. V2/V3 스키마 파일 어디에도 대응 테이블이 없다. 옮길 곳이 없으므로 "이관"이 아니라 "이 데이터를 남길 것인가"의 결정 문제다.

이 10개는 이번 갱신에서 **두 갈래로 갈렸다**:

| 갈래 | 테이블 (행수) | 소계 | 상태 |
|---|---|---|---|
| **스킬·코치 — v2 결정 완료(폐기)** | `player_skills`(92) · `skill_score_config`(97) · `coach`(6) · `coach_skill_condition`(23) · `coach_skill_buff`(24) → B / `skill_pitcher_grade_stat`(120) → F | **362행** | v2 코드가 사라졌으므로 "v2 에서 쓸까"는 이미 답이 났다. 남은 결정은 **운영 종료 시점**과 **데이터 폐기 승인**뿐 |
| **레전드 — 결정 대기** | `player_legend`(62) · `player_legend_hitter_career`(40) · `player_legend_pitcher_career`(22) → D / `legend_pitcher_pitch_slot`(22) → F | **146행** | v2 mapper 3종이 **살아 있다**. 화면 도달만 없는 상태 → §5-1 |

---

## §5 사용자 결정 대기

### 5-1. 레전드 (4테이블, 146행) — 스킬·코치는 결정 완료로 분리됨

> **결정 완료된 부분 (2026-08-20)**: 스킬·코치 6종(`player_skills` 92 · `skill_score_config` 97 · `skill_pitcher_grade_stat` 120 · `coach` 6 · `coach_skill_condition` 23 · `coach_skill_buff` 24, 합 362행)은 **v2 에서 폐기 확정**이다 — 서버·화면 코드가 실제로 제거됐다. 따라서 아래 선택지의 대상이 아니다. 남은 실행 항목은 두 가지뿐: (a) 운영 PC 사이트의 스킬·코치 기능 종료 선언 → 컷오버 후 DROP(§3-B-2), (b) `skill_pitcher_grade_stat` 120행 폐기 승인(§3-F).

대상: `player_legend`(62), `player_legend_hitter_career`(40), `player_legend_pitcher_career`(22), `legend_pitcher_pitch_slot`(22) + FK 부모 `teams`(20)

| 결정 선택지 | 선택 시 영향받는 테이블 | 결과 |
|---|---|---|
| ① **v2 에서도 계속 쓴다** (레전드 화면을 모바일로 재구현) | 4개 + `teams` 유지 (C 로 전환) | 삭제 0개. v2 mapper 3종이 이미 살아 있으므로 **FE 화면만 만들면 된다** |
| ② **폐기한다** (v2 범위에서 제외) | 4개 + `teams` 삭제 대상 — 단 `teams` 는 `kbo_team_code_mappings` FK 때문에 KBO 결정(§5-5)이 먼저 나와야 함 | 운영 PC 사이트의 레전드 기능이 같이 죽음 → 운영 종료 선언 선행. 146행 소실 |
| ③ **보류 유지** | 4개 그대로 D / F | 비용 거의 0. 판단만 미뤄짐 |

**권고: ③ 보류 유지 → 로드맵 결정 후 ① 또는 ②.** 근거 — 스킬·wiki 는 코드를 실제로 지워 결정이 끝났지만, **레전드 계열은 v2 mapper(`player/PlayerCardMapper.xml`, `player/PlayerCareer.xml`)가 그대로 남아 있다.** 즉 코드 축에서 아직 "폐기" 신호가 없다. 62 + 40 + 22 = 124행의 레전드 실데이터도 있어 성급히 지울 이유가 없다. 다만 `legend_pitcher_pitch_slot`(22행)만은 양쪽 mapper 0건이라 §3-F 로 분리해 뒀다.

⚠️ 어느 선택지든 §7-4 를 먼저 읽을 것 — 운영 PC 사이트가 이 테이블들을 지금 서빙 중이다.

### 5-2. 커뮤니티 (11테이블, legacy 252행 / v2 0행)

대상: legacy `boards`(4) / `posts`(242) / `tags`(6) + v2 `site_board` / `site_post` / `site_tag` / `site_post_tag` / `site_comment` / `site_post_reaction` / `site_comment_reaction` / `site_report` (전부 0행)

| 결정 선택지 | 선택 시 영향받는 테이블 | 결과 |
|---|---|---|
| ① **v2 에서 부활** (라우트 주석 해제 + 화면 구현) | v2 8개 유지 (C 로 전환), legacy 3개는 이관 후 삭제 (B) | §4-1 `posts` 이관이 필요하고, 그 전에 §4-2 계정 병합이 선행돼야 함(`author_id` 재매핑) |
| ② **완전 폐기** | 11개 전부 삭제 대상 | legacy 252행 소실 + 운영 PC 커뮤니티 기능 종료. BE 컨트롤러 11개 · mapper 8개 · FE 화면 2개도 같이 제거 대상 |
| ③ **보류 유지** (현상 유지) | 11개 그대로 D | 0행 v2 테이블 8개가 계속 방치. 비용은 거의 없으나 판단이 계속 미뤄짐 |

**결정: ① v2 에서 부활 (확정).** `site_*` 커뮤니티 8종은 **유지**하고, legacy `posts` 242건은 **이관 대상**이다.

근거 — BE 는 컨트롤러 11개 · mapper 8개가 완비돼 있어 부활 비용이 사실상 FE 화면 구현뿐이다. 커뮤니티 코드는 이번 skill·wiki 제거에서 **손대지 않았다** — v2 작업트리에 `mapper/site/community/*.xml` 8개가 전부 살아 있다(직접 확인).

남은 실행 순서: ① §4-2 계정 병합(`users` → `site_users`) → ② `posts.author_id` 재매핑 → ③ `boards` / `tags` / `posts` 이관 → ④ legacy 3종 DROP(B 절차).

단, **`posts_tags`(legacy, 0행)만은 어느 결정이든 지금 삭제 가능** — 이미 A 로 분류(§3-A).

### 5-3. 퀴즈 (`quiz_answers` 5행 ↔ `fun_quiz` 0행)

| 결정 선택지 | 선택 시 영향받는 테이블 | 결과 |
|---|---|---|
| ① **5행 이관** | `fun_quiz` 에 5행 INSERT → 컷오버 후 `quiz_answers` 삭제 | 홈 화면 퀴즈가 즉시 채워짐. `title` 은 서버 동적 생성 정책이라 버려도 무방 |
| ② **신규 회차부터 시작** | `quiz_answers` 를 백업 후 삭제, `fun_quiz` 는 빈 채로 유지 | 다음 회차 업로드 전까지 홈 퀴즈가 계속 빈 상태 |

**권고: ①.** 근거 — v2 대상이 `fun_quiz` 라는 것은 **이미 확정**됐다(홈 화면 `GET /quiz/latest` → `QuizMapper.selectLatestVisible` → `fun_quiz` 도달). 컬럼 구조도 `round` / `image_url` 만 옮기면 되는 최저 난이도. 남은 판단은 `is_visible = 0` 인 행을 옮길지 여부뿐이다.

⚠️ 삭제는 **운영 컷오버 이후.** `quiz_answers` 는 master `quiz/QuizAnswerMapper.xml` 이 지금 읽고 있다(§7-5).

### 5-4. 선수카드 (9테이블, 사실상 전부 0행)

대상: legacy `player_card` / `player_card_hitter_attributes` / `player_card_pitcher_attributes` + v2 `fun_player_card` / `fun_player_card_hitter_stats` / `fun_player_card_pitcher_stats` / `fun_player_card_pitcher_pitch_grades` / `fun_player_card_positions` / `fun_teams`(20행)

| 결정 선택지 | 선택 시 영향받는 테이블 | 결과 |
|---|---|---|
| ① **v2(`fun_*`) 라인 채택** | legacy 3개 삭제, `fun_*` 6개 유지 (C 로 전환) | `fun_player_card*` 5개의 **namespace 불일치와 미주입을 먼저 고쳐야** 실제로 동작함(§8-1, §8-2). `fun_teams` 도 코드 전환 필요 |
| ② **legacy 라인 유지** | `fun_*` 6개 삭제, legacy 3개 유지 | v2 방향과 역행. `fun_teams`(20행)도 버려짐 |
| ③ **양쪽 다 폐기** (선수카드를 v2 범위에서 제외) | 9개 전부 삭제 대상 | 카드 데이터 손실 0(전부 0행). `fun_teams` 20행과 `teams` FK 연쇄만 별도 처리 |

**권고: ① 또는 ③ — ② 는 제외.** 근거 — 카드 테이블은 양쪽 다 **행수 0** 이라 데이터 손실 리스크가 없고, v2 스키마(`fun_*`)가 더 정규화돼 있다(구종 등급 · 포지션이 별도 테이블로 분리). 다만 현재 `fun_player_card*` 5개는 **Repository / Service 어디에도 주입되지 않아 호출 경로가 없고**, `fun_player_card` 는 XML namespace 가 Java 인터페이스 FQCN 과 달라 호출 시 예외가 날 상태 — 즉 "이미 만들어진 v2 기능"이 아니라 "미완성 스캐폴딩"이다. 선수카드가 로드맵에 없다면 ③ 이 정리 비용 대비 이득이 크다.

### 5-5. KBO (6테이블, 1453행)

대상: `kbo_games`(735), `kbo_batter_logs`(530), `kbo_players`(167), `kbo_teams`(10), `kbo_seasons`(1), `kbo_team_code_mappings`(10)

| 결정 선택지 | 선택 시 영향받는 테이블 | 결과 |
|---|---|---|
| ① **v2 에서 활용** (경기 일정 · 기록 화면 신설) | 6개 전부 유지 (C 로 전환) | 크롤러 계속 가동. BE mapper 를 v2 쪽에 새로 만들어야 함(현재 v2 브랜치 mapper 0건) |
| ② **수집만 계속, 화면은 안 만듦** (현상 유지) | 6개 유지하되 D 그대로 | 크롤러가 매일 쌓지만 아무도 안 봄. 비용은 낮으나 목적 불명 상태 지속 |
| ③ **폐기** (크롤러 중단 + 테이블 삭제) | 6개 삭제. **부수 효과: `kbo_team_code_mappings` 가 없어지면 legacy `teams` 의 FK 걸림돌 1개가 풀림**(§6-4) | 1453행 소실. 크롤러(`kbocrol/`)도 함께 폐기 |

**결정: ② 현상 유지 (확정).** 크롤러가 계속 쓰므로 KBO 6종은 건드리지 않는다.

근거 — `kbo_games` 는 **오늘 09:00 에도 갱신된 가장 활발한 테이블**이고 크롤러가 어딘가에서 계속 돌고 있다(정확한 호스트는 리포지토리 밖 정보라 미규명). 지금 지우면 크롤러가 즉시 실패한다(§7-6). skill·wiki 코드 제거는 KBO 와 무관하다 — 이번 갱신에서 KBO 6종의 판정은 **변하지 않았다**.

🔴 **스크립트 불일치 — 조치 필요**: `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 의 `-- 1. KBO 계열 (6개)` 절은 위 결정과 **정면으로 충돌**한다. 그 절은 `kbo_batter_logs` · `kbo_games` · `kbo_players` · `kbo_teams` · `kbo_seasons` · `kbo_team_code_mappings` 를 DROP 하도록 작성돼 있다. 스크립트는 아직 실행되지 않았으나(파일 주석 명시), **KBO 절만 주석 처리하거나 제거해야 한다.** 같은 파일의 wiki 절(3개)은 §3-A 와 일치해 그대로 유효하고, skill·coach 절(6개)은 §3-B-2 / §3-F 와 대상은 같으나 **"컷오버 전에는 실행 금지"** 라는 조건이 빠져 있다.

> 부수 효과 확인: KBO 를 유지하기로 했으므로 `kbo_team_code_mappings` 도 남는다 → **`teams` 의 FK 걸림돌 1개는 그대로 유지된다**(§6-4).

---

## §6 삭제 시 FK 연쇄 / 삭제 순서

운영 DB FK 제약 **38건**(복합 컬럼 행 기준) / 서로 다른 제약명 기준 **36건**. 아래는 카테고리별 실행 가능한 순서.

### 6-1. A 그룹 — 지금 실행 가능 (5개)

```sql
DROP TABLE posts_tags;   -- 자식 없음. 자기가 posts/tags 를 참조할 뿐이라 걸림 없음
DROP TABLE notices;      -- FK 양방향 0건

-- wiki 3종 — 이 순서를 지킬 것
DROP TABLE wiki_pitch_grade;    -- wiki_pitch 를 FK 참조하는 자식 → 먼저
DROP TABLE wiki_stat_influence; -- FK 양방향 0건 → 아무 때나
DROP TABLE wiki_pitch;          -- wiki_pitch_grade 의 FK 부모 → 마지막
```

`posts_tags` / `notices` / `wiki_stat_influence` 3개는 서로 순서 제약이 없다. `wiki_pitch_grade` → `wiki_pitch` 만 순서를 지켜야 한다 (거꾸로 하면 FK 때문에 실패).

**skill 제거로 인한 삭제 순서 변화 없음** — wiki 3종은 wiki 계열 안에서만 FK 로 묶여 있고, 다른 51개 테이블 어느 것도 wiki 를 참조하지 않으며 wiki 도 밖을 참조하지 않는다. 즉 A 그룹이 3개 늘었어도 **기존 2개의 삭제 순서에는 영향이 없다.**

### 6-2. B 그룹 — v2 컷오버 완료 후

**B-1 (인증·쿠폰·이벤트) — 계정 병합 완료 후**

```sql
-- 1) user_roles 를 먼저 (users 를 FK 참조: fk_user_roles_user)
DROP TABLE user_roles;
-- 2) 그 다음 users
DROP TABLE users;
-- 3) FK 없음 — 순서 무관
DROP TABLE coupons;
DROP TABLE events;
```

`users` 를 먼저 지우려 하면 `fk_user_roles_user` 때문에 실패한다.

**B-2 (skill·coach) — 운영 스킬·코치 기능 종료 선언 후**

```sql
-- coach 계열 — coach_skill_* 2개는 FK 제약 없음, 개념상 자식이므로 먼저
DROP TABLE coach_skill_buff;
DROP TABLE coach_skill_condition;
DROP TABLE coach;

-- skill 계열 — player_skills 의 FK 자식 2개를 반드시 먼저
DROP TABLE skill_pitcher_grade_stat;  -- ⚠️ 120행 (§3-F — 백업 후)
DROP TABLE skill_score_config;        -- ⚠️  97행
DROP TABLE player_skills;             -- ⚠️  92행 — 부모, 마지막
```

⚠️ `player_skills` 를 먼저 지우려 하면 `skill_pitcher_grade_stat` · `skill_score_config` 두 자식의 FK 때문에 실패한다. **기존 `sql/DROP_TABLE.sql` 이 정확히 이 실수를 저지르고 있다**(§7-7).

### 6-3. D 그룹이 삭제로 결정될 경우 — 덩어리별 순서

**커뮤니티 legacy** (`posts_tags` 는 A 에서 이미 처리됨)

```
posts  →  boards, tags
```

`posts.board_id → boards.id` (`posts_ibfk_1`). `posts` 를 먼저, 그 다음 `boards` / `tags`.

**커뮤니티 v2**

```
site_comment_reaction → site_comment → site_post_reaction, site_post_tag → site_post → site_board, site_tag
site_report  (FK 0건 — 아무 때나)
```

`site_comment` 는 자기참조 FK(`fk_comment_parent`)가 있으나 테이블 통째 DROP 에는 영향 없음.

**선수카드 legacy**

```
player_card_hitter_attributes, player_card_pitcher_attributes  →  player_card  →  (teams)
```

**선수카드 v2**

```
fun_player_card_hitter_stats, fun_player_card_pitcher_stats,
fun_player_card_pitcher_pitch_grades, fun_player_card_positions  →  fun_player_card  →  fun_teams
```

`fun_teams` 는 자기참조(`fk_fun_teams_latest_team`) — DROP 에는 영향 없음.

**레전드**

```
legend_pitcher_pitch_slot,                                   (F — 22행, 백업 후 단독 삭제 가능)
player_legend_hitter_career, player_legend_pitcher_career   →  player_legend  →  (teams)
```

`legend_pitcher_pitch_slot` 은 자식이 없으므로 부모(`player_legend`)를 남긴 채 단독으로 지울 수 있다.

**KBO** — 현상 유지 결정(§5-5)이라 아래는 참고용

```
kbo_batter_logs  →  kbo_games, kbo_players  →  kbo_teams, kbo_seasons
kbo_team_code_mappings  →  (teams)
```

### 6-4. ⚠️ `teams` 삭제의 4중 걸림 — skill 제거 후에도 **변화 없음**

`teams` 를 지우려면 아래 **4개 제약이 전부 먼저 해소**돼야 한다. skill·wiki 계열 어느 테이블도 `teams` 를 FK 참조하지 않으므로 이번 코드 제거로 **걸림돌이 줄지 않았다.**

| 걸리는 것 | 제약명 | 어느 덩어리 소속인가 | 이번 갱신 후 상태 |
|---|---|---|---|
| `player_card.team_id` | `fk_card_team` | 선수카드 (§5-4) | D — 미결정, 걸림 유지 |
| `player_legend.team_id` | `fk_legend_team` | 레전드 (§5-1) | D — 미결정, 걸림 유지 |
| **`kbo_team_code_mappings.internal_team_id`** | `fk_external_team_mappings_internal_team` | **KBO (§5-5)** | **현상 유지 확정 → 걸림 영구 유지** |
| `teams.latest_team_id` (자기참조) | `fk_latest_team` | — | DROP 에는 영향 없음 |

즉 **KBO 현상 유지가 확정된 이상 `teams` 는 당분간 삭제 불가**다. 레전드·선수카드 결정이 나도 `kbo_team_code_mappings` 가 남아 막는다. 게다가 v2 `player/TeamMapper.xml` 이 아직 `FROM teams` 를 읽고 있어 코드 축에서도 살아 있다.

가정상 전부 삭제로 결정될 경우 유효한 순서:

```
1) kbo_team_code_mappings                                  ← 현재 결정으로는 실행 불가
2) player_card_hitter_attributes, player_card_pitcher_attributes  →  player_card
3) legend_pitcher_pitch_slot, player_legend_hitter_career, player_legend_pitcher_career  →  player_legend
4) teams                                                   ← v2 TeamMapper.xml 코드 전환 선행
```

---

## §7 위험 경고 — 지금 지우면 운영 장애가 나는 테이블

운영 서버는 `master` 브랜치 구코드로 떠 있는 것으로 추정된다(코드·갱신시각 정황 일치, 배포 이력 자체는 미확인). 아래는 `master` mapper XML 15개를 전수 조회해 확정한 목록이다.

### 7-1. 🔴 최상 — 즉시 서비스 중단 (4개)

| 테이블 | 무엇이 깨지나 | 근거 |
|---|---|---|
| `users` | **네이버 로그인 전면 불가** | master `UserMapper.xml` 이 로그인마다 INSERT/UPDATE. 실측 최종갱신 **오늘 22:40** |
| `user_roles` | **신규 가입 불가** + 권한 판정 실패 | 동일 경로. 실측 08-14 갱신 |
| `coupons` | 관리자 쿠폰 등록 · 수정 · 노출토글 실패 | master `coupon/CouponMapper.xml`. 실측 08-12 갱신 |
| `events` | 관리자 이벤트 등록 · 수정 · 노출토글 실패 | master `event/EventMapper.xml`. 실측 08-12 갱신 |

### 7-2. ✅ 해소 — v2 화면 즉사 (0개)

이전 판정에서 이 자리에 있던 `player_skills` 는 **더 이상 v2 화면 위험이 아니다.** v2 skill 도메인(BE 31 + FE 7 파일)과 wiki 도메인(BE 22 + FE 31 파일)이 제거돼 `/wiki/skill/:target` 화면 자체가 없어졌다. `compileJava` · `test` · `vite build` 전부 통과 = 참조 깨짐 0건.

⚠️ 단 `player_skills` 는 **운영(master) 위험으로 자리를 옮겼을 뿐 사라진 게 아니다** — §7-4 참조.

**현재 v2 화면이 즉사하는 테이블은 §3-C 의 6개**(`site_users` · `site_refresh_tokens` · `site_coupons` · `site_events` · `site_notices` · `fun_quiz`)뿐이다.

### 7-3. 🟠 상 — 운영 커뮤니티 중단 (3개)

| 테이블 | 무엇이 깨지나 | 근거 |
|---|---|---|
| `posts` | 운영 게시글 조회 · 작성 실패 + **242행 소실**(유일한 커뮤니티 실데이터) | master `PostMapper.xml` 의 SELECT / INSERT / UPDATE 활성 |
| `boards` | 게시판 목록 · 상세 실패 | master `BoardMapper.xml` 활성 |
| `tags` | 태그 조회 실패 | master `TagMapper.xml` 활성 |

### 7-4. 🟠 상 — 운영 PC 사이트 스킬 · 레전드 · 코치 중단 (12개)

skill·wiki 제거로 **v2 축의 위험은 사라졌지만 운영(master) 축은 그대로다.** 아래 "참조하는 곳" 열이 이번 갱신에서 바뀐 부분이다.

| 테이블 | 참조하는 곳 (갱신 후) | 무엇이 깨지나 |
|---|---|---|
| `player_skills` | **master 만** (`master:mapper/PlayerSkills.xml`) — v2 참조 소멸 | 운영 PC 스킬 백과사전 실패 + **92행 소실** |
| `skill_score_config` | **master 만** (`master:mapper/SkillScoreConfigMapper.xml`) — v2 참조 소멸 | 운영 `GET /api/skills/score-config` 실패 + **97행 소실** |
| `coach` / `coach_skill_condition` / `coach_skill_buff` | **master 만** (`master:mapper/CoachMapper.xml`) — v2 참조 소멸 | 운영 `GET /api/skills/coach` 실패 + 53행 소실 |
| `teams` | master `TeamMapper.xml` + v2 `player/TeamMapper.xml` **양쪽** (변화 없음) | 팀 정보 전면 실패 |
| `player_legend` | master · v2 `player/PlayerCardMapper.xml` **양쪽** (변화 없음) | 레전드 선수 조회 실패 |
| `player_legend_hitter_career` / `player_legend_pitcher_career` | master · v2 `player/PlayerCareer.xml` **양쪽** (변화 없음) | 레전드 커리어 조회 실패 |
| `player_card` (+ `player_card_hitter_attributes` / `player_card_pitcher_attributes`) | master · v2 `player/PlayerCardMapper.xml` INSERT (변화 없음) | 관리자 카드 생성 API 실패 (0행이라 데이터 손실은 없음) |

> 위 5종(`player_skills` · `skill_score_config` · `coach` 3종)이 §3-B-2 로 이동한 이유가 바로 이것이다 — **v2 는 안 쓰지만 운영은 쓴다** = 컷오버 후 삭제.

### 7-4-1. 🟡 중 — 코드는 없는데 데이터가 사라지는 것 (2개)

| 테이블 | 행수 | 코드 영향 | 데이터 영향 |
|---|---|---|---|
| `skill_pitcher_grade_stat` | 120 | **없음** (v2·master mapper 0건) | 120행 영구 소실 |
| `legend_pitcher_pitch_slot` | 22 | **없음** (v2·master mapper 0건) | 22행 영구 소실 |

장애는 안 나지만 **되돌릴 수 없다.** 삭제 전 덤프 필수(§3-F).

### 7-5. 🟠 상 — 운영 퀴즈 중단 (1개)

| 테이블 | 무엇이 깨지나 | 근거 |
|---|---|---|
| `quiz_answers` | 운영 퀴즈 정답 화면 실패 + 5행 소실 | master `quiz/QuizAnswerMapper.xml` 의 SELECT / INSERT / UPDATE 활성. **v2 `fun_quiz` 는 0행이라 대체 불가** |

### 7-6. 🟠 상 — 크롤러 중단 (5개)

| 테이블 | 무엇이 깨지나 | 근거 |
|---|---|---|
| `kbo_games` | 크롤러 09:00 / 23:30 작업 즉시 실패 + master `kbo/KboGameMapper.xml` SELECT 실패 | 실측 최종갱신 **오늘 09:00** = 크롤러 스케줄 시각과 정확히 일치 |
| `kbo_players` / `kbo_batter_logs` | 크롤러 23:45 작업 실패 | 크롤러 UPSERT 대상 |
| `kbo_teams` / `kbo_seasons` | 크롤러가 직접 쓰진 않으나 위 3개의 **FK 부모** → INSERT 자체가 실패 | `fk_games_home_team` / `fk_games_away_team` / `fk_players_team` / `fk_games_season` |

### 7-7. 🔴 스크립트 위험 — SQL 2개 실행 금지

**(a) `sql/DROP_TABLE.sql` — 실행 절대 금지**

이 파일은 **라이브 테이블을 통째로 DROP** 하도록 작성돼 있다. 포함된 것 중 위험한 것:

- `player_skills` — §7-4 (운영 PC 스킬 기능 중단 + 92행 소실). *skill 코드 제거로 v2 즉사 위험은 없어졌으나 운영 위험은 그대로다*
- `teams` — §7-4 (master · v2 양쪽 참조)
- `users`, `user_roles`, `events`, `coupons` — §7-1
- `boards`, `posts`, `tags` — §7-3
- `skill_pitcher_grade_stat`, `legend_pitcher_pitch_slot` — §7-4-1 (데이터 142행 무경고 소실)

게다가 **FK 순서도 틀려 있다** — 첫 문장 `DROP TABLE player_skills;` 부터 `skill_score_config`(목록에 없음)의 FK 때문에 실패하고, `DROP TABLE teams;` 도 `player_card` · `kbo_team_code_mappings`(둘 다 목록에 없음) 때문에 실패한다. 즉 **중간까지만 지워지고 멈추는 최악의 형태**로 실패한다.

**(b) `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` — 부분 수정 후에만 사용**

| 절 | 대상 | 본 문서 판정과 대조 |
|---|---|---|
| 1. KBO 계열 (6개) | `kbo_*` 6종 | 🔴 **충돌 — 삭제하면 안 됨.** KBO 는 현상 유지 확정(§5-5). 이 절은 주석 처리 필요 |
| 2. WIKI 계열 (3개) | `wiki_*` 3종 | ✅ **일치.** §3-A 와 대상·순서 모두 동일 — 지금 실행 가능 |
| 3. SKILL 계열 (3개) | `skill_pitcher_grade_stat` · `skill_score_config` · `player_skills` | 🟠 **조건부.** 대상·순서는 맞으나 **운영 컷오버 전 실행 금지**(§7-4). 209행 백업 필요 |
| 4. COACH 계열 (3개) | `coach_skill_buff` · `coach_skill_condition` · `coach` | 🟠 **조건부.** 동일 조건 |

파일 주석에 "작성만 하고 아직 실행하지 않았다"고 적혀 있으며, **실측상 53개 테이블이 전부 실재하므로 미실행이 맞다.**

조치 권고: `sql/DROP_TABLE.sql` 은 실행 금지 주석 또는 `sql/_deprecated_/` 이동. `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 은 KBO 절 제거 + skill·coach 절에 컷오버 조건 주석 추가. (본 문서는 산출물 1개만 작성하므로 이번 작업에서 파일 수정은 하지 않음)

### 7-8. 안전 확인 — 위 어디에도 없는 테이블

`notices` · `posts_tags` · `wiki_pitch` · `wiki_pitch_grade` · `wiki_stat_influence` **5개**만이 v2 · master · 크롤러 어느 쪽에서도 참조되지 않고 데이터도 0이다. → §1 즉시 삭제 목록.

wiki 3종의 근거를 다시 적으면: v2 wiki 도메인 코드가 제거됐고, `master` 브랜치에는 `git grep -l wiki_ master` 가 **아무것도 반환하지 않는다**(wiki 는 V3 신규 테이블이라 애초에 구코드에 없다). 크롤러는 `kbo_*` 만 건드린다.

---

## §8 입력 문서 간 상충 판정

| # | 항목 | 문서 A 기재 | 문서 B 기재 | 판정 | 근거 |
|---|---|---|---|---|---|
| 1 | `fun_player_card_*` 4종 상태 | `tables.md`(구 문서, `code-table-inventory.md` §5 인용): "🔵 active ⚠ namespace mismatch" | `code-table-inventory.md` §2/§4: "의심(코드 데드)" — Repository/Service 미주입 | **B(코드 데드)가 맞음. "active" 는 과장** | ① 실측 행수 **4개 전부 0** ② 코드 전체 grep 상 인터페이스명이 자기 정의 파일에서만 등장 = 주입 지점 0 ③ XML namespace `...playerCard.mapper.*` ≠ Java FQCN `...playerCard.repository.mapper.*` ④ v2 FE 라우트 0건. 네 축이 전부 미사용을 가리킴 |
| 2 | `fun_player_card` 상태 | `code-table-inventory.md` §2: "사용중이나 위험" | `v2-endpoint-reach.md` §5.6: "불확실 — 신규 재구축 스캐폴딩으로 보이나 FE 미연결. 공개용 `FunPlayerCardController` 는 빈 클래스" | **"사용중" 표기 부적절 — 미사용(스캐폴딩)이 맞음** | Controller → Service → Repository 체인은 존재하나 ① namespace 불일치로 호출 시 `BindingException` 위험 ② 실측 0행 = 한 번도 INSERT 된 적 없음 ③ 공개 Controller 가 메서드 0개 ④ FE 호출 0건. "연결선이 그려져 있다"와 "동작한다"는 다름 |
| 3 | `coach` / `coach_skill_buff` / `coach_skill_condition` | `dead-suspects.md`(구): "BE 미연결 — 검증 필요 ❓" | `code-table-inventory.md` §2: "`SkillController` 까지 완전 연결, 사용중 확정" | ~~둘 다 각자의 축에서는 맞음~~ → **2026-08-20 갱신으로 무의미해짐. v2 축은 "미연결"조차 아니라 코드가 없다** | v2 `domain/skill/**` 31개 파일과 `mapper/skill/CoachMapper.xml` 이 제거돼 `SkillController` 자체가 없다. 남은 것은 `master:mapper/CoachMapper.xml` 하나 → 운영 단일 축. 분류 **D → B**(§3-B-2) |
| 4 | `player_skills` 분류 | 본 작업 지시의 보류 후보 목록: "레전드·코치·스킬 8테이블 — v2 대응 테이블 없음" | `v2-endpoint-reach.md` §3: `/wiki/skill/:target` → `GET /skills/{target}` → `PlayerSkillsMapper.selectSkillsByTarget` **도달 확정** | ~~C(유지)~~ → **2026-08-20 갱신으로 뒤집힘. B(v2 배포 후 삭제)** | 도달 근거였던 `/wiki/skill/:target` 화면과 `PlayerSkillsMapper` 가 **양쪽 다 삭제**됐다(`grep player_skills src/main/ web/src/` 무결과). 즉 `v2-endpoint-reach.md` §3 은 이제 stale 이다. 운영 축(`master:mapper/PlayerSkills.xml`)만 남아 §7-4 위험으로 이동 |
| 12 | `wiki_*` 3종 분류 (**신규**) | 이전 본 문서 §2-6: "`/wiki/game-info/:target` + `/admin/wiki/pitches` 도달 → C(유지), v2 가 쓸 빈 그릇" | 2026-08-20 코드 실측: v2 wiki 도메인 BE 22 + FE 31 파일 제거, `master` 에 wiki 참조 0건 | **C → A(즉시 삭제 가능).** 3개 모두 0행 + 코드 0건 + FK 는 wiki 내부에만 존재 | `git grep -l wiki_ master` 무결과 + 작업트리 `grep -ril wiki_pitch src/main/ web/src/` 무결과. "v2 가 쓸 빈 그릇"이라는 근거가 소멸했고, 대체할 근거가 어느 축에도 없다 |
| 13 | `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 의 KBO 절 (**신규**) | 스크립트 주석: "kbo(승부예측) … 도메인 완전 폐기 결정" | 확정된 사용자 결정(§5-5): "KBO 6종 — 크롤러가 계속 쓰므로 현상 유지" | **사용자 결정이 우선 — KBO 절은 실행하면 안 된다** | `kbo_games` 실측 최종갱신이 오늘 09:00 = 크롤러 스케줄과 일치(§7-6). 스크립트 자체가 "아직 실행하지 않았다"고 명시하고 있어 실제 피해는 없으나, **파일과 결정이 어긋난 상태로 방치하면 오실행 위험**이 있다 → §9 액션 3 |
| 5 | `quiz_answers` ↔ `fun_quiz` 중 어느 쪽이 v2 대상인가 | 본 작업 지시: "어느 쪽이 v2 대상인지 미확정" / `prod-actual-state.md` §3: "판단 보류" | `v2-endpoint-reach.md` §3: 홈 화면 `GET /quiz/latest` → `QuizMapper.selectLatestVisible` → `fun_quiz` **도달 확정** | **v2 대상은 `fun_quiz` 로 확정. 남은 미확정은 "5행을 옮길 것인가"뿐** | FE 도달 근거가 명확. 따라서 `quiz_answers` 는 D 가 아니라 **E(데이터 이관 필요)** 로 분류 — E 정의(legacy>0 & v2 대응=0)에도 정확히 부합 |
| 6 | KBO 테이블을 BE 가 쓰는가 | `code-table-inventory.md` §3: "`kbo_*` 6개 전부 BE mapper **없음**" | 본 문서 보강 조사: `master` 에 **`mapper/kbo/KboGameMapper.xml` 존재**(`SELECT ... FROM kbo_games`) | **둘 다 맞음 — 브랜치 축 차이. v2 기준 0건, 운영(master) 기준 `kbo_games` 1건** | `git ls-tree master -- src/main/resources/mapper` 로 파일 존재 확인 + 내용 grep 으로 `kbo_games` 참조 확인. `code-table-inventory.md` 는 v2 브랜치만 조사 범위였음(문서 서두 명시) — 오류가 아니라 범위 차이 |
| 7 | `quiz_answers` 를 코드가 쓰는가 | `code-table-inventory.md` §3: "mapper 전무" | 본 문서 보강 조사: `master` 에 **`mapper/quiz/QuizAnswerMapper.xml` 존재**(SELECT / INSERT / UPDATE 전부) | **#6 과 동일한 브랜치 축 차이. 운영은 지금도 `quiz_answers` 를 쓴다** | 동일 방법으로 확인. 이 때문에 `quiz_answers` 는 §7-5 위험 목록에 들어감 — v2 컷오버 전 삭제 금지 |
| 8 | `notices` 를 운영이 쓰는가 | `prod-actual-state.md` §3: "`site_notices` 쪽이 활성"(legacy `notices` 는 0행) | 본 문서 보강 조사: `master` `NoticeMapper.xml` 이 **statement 0개인 빈 파일** | **`notices` 는 운영에서도 미사용 확정 → A(즉시 삭제 가능)** | master mapper 파일 내용 직접 확인 — `<mapper>` 태그 안이 비어 있음. 파일 존재만 보고 "사용중"이라 판단했다면 오판이었을 지점 |
| 9 | `fun_quiz.is_visible` 누락이 버그인가 | `dead-suspects.md` §4.3 / `mapper-mapping.md`: "노출 제어 무력화 **버그**" | `code-table-inventory.md` §5: "V3 마이그레이션이 의도적으로 DROP — 코드만으론 확정 불가, DB 실물 확인 필요" | **버그 아님 — 의도된 스키마 변경으로 확정** | 실측 컬럼 조회상 `fun_quiz` 는 `id` / `round` / `image_url` / `created_at` / `updated_at` **5개뿐**(`is_visible` · `title` 없음) = V3 정의와 일치. `QuizMapper.xml` 도 `is_visible` 을 어디서도 참조하지 않음. DB 와 코드가 서로 일관 → `sql/V2/fun/CREATE_TABLE_FUN.sql:117` 정의 쪽이 stale |
| 10 | `teams` vs `fun_teams` 중 어느 쪽이 살아있나 | `prod-actual-state.md` §3: "`fun_teams` 쪽이 최근"(2026-04-03 갱신) | `code-table-inventory.md` §3: "`fun_teams` 는 mapper 참조 **0건**, `TeamMapper.xml` 은 legacy `teams` 만 참조" | **데이터는 `fun_teams` 가 최신, 코드는 `teams` 를 읽음 — 절반만 이관된 상태** | 실측 양쪽 20행 동일 = 데이터 복사는 끝남. master · v2 `TeamMapper.xml` 둘 다 `FROM teams` 확인. "누가 살아있나"가 아니라 **"코드가 이관을 안 따라갔다"** 가 정확한 기술 |
| 11 | `posts` 최근 갱신 원인 | `legacy-write-origin.md` §1/§6: "미규명 — `master` `PostMapper.xml` 은 존재하나 쓰기 경로 미추적" | 본 문서 보강 조사: master `PostMapper.xml` 에 `INSERT INTO posts` / `UPDATE posts` 확인 | **master 가 쓰기 주체로 확정 — 미규명 해소** | grep 으로 INSERT / UPDATE 문 확인. 다만 실측 최종갱신 2026-02-08 로 최근 활동은 아님(운영 커뮤니티 글쓰기가 뜸한 것과 부합) |

---

## §9 다음 액션 (우선순위)

| 순위 | 액션 | 선행 조건 | 관련 § |
|---|---|---|---|
| 1 | **A 그룹 5개 DROP** — `notices` / `posts_tags` / `wiki_pitch_grade` / `wiki_stat_influence` / `wiki_pitch` | 없음 (사용자 승인만) | §1, §3-A, §6-1 |
| 2 | 🔴 **F 그룹 데이터 폐기 승인** — `skill_pitcher_grade_stat`(120) / `legend_pitcher_pitch_slot`(22) 덤프 후 DROP 여부 | **사용자 확인** | §3-F, §7-4-1 |
| 3 | `sql/cleanup/DROP_KBO_WIKI_SKILL.sql` 의 **KBO 절 제거** + skill·coach 절에 컷오버 조건 주석 | 없음 | §5-5, §7-7 |
| 4 | `sql/DROP_TABLE.sql` 실행 금지 표시 또는 격리 | 없음 | §7-7 |
| 5 | `quiz_answers` 5행 → `fun_quiz` 이관 판단 | §5-3 결정 | §4-1, §5-3 |
| 6 | 운영 PC 사이트 **스킬·코치 기능 종료 선언** (B-2 5종의 선행 조건) | 운영 공지 | §3-B-2, §7-4 |
| 7 | 보류 3덩어리 기획 결정 (레전드 / 선수카드 / — 커뮤니티·KBO 는 결정 완료) | 로드맵 확정 | §5-1, §5-4 |
| 8 | v2 컷오버 + 계정 병합 설계 (`users` 305 ↔ `site_users` 123) | 배포 계획 | §4-2 |
| 9 | 커뮤니티 legacy 이관 (`boards` 4 / `tags` 6 / `posts` 242) | 8번 완료 (`author_id` 재매핑) | §4-1, §5-2 |
| 10 | B 그룹 9개 DROP | 6·8·9번 완료 + 운영 검증 | §3-B, §6-2 |

**한 줄 요약**: 즉시 지울 수 있는 5개(`notices` · `posts_tags` · `wiki_*` 3종) 외 48개는 전부 운영이 쓰고 있거나(21개), v2 가 쓰고 있거나(6개), 크롤러가 쓰고 있거나(5개), 데이터가 남아 사용자 확인이 필요하거나(2개), 기획 결정이 안 난 것이다.

---

## §10 최종 검산

| 계열 | 개수 | 카테고리 | 개수 |
|---|---|---|---|
| legacy site | 10 | A 즉시 삭제 가능 | 5 |
| legacy 선수·스킬 | 14 | B v2 배포 후 삭제 | 9 |
| KBO | 6 | C 유지 | 6 |
| V2 site_ + V3 refresh_tokens | 13 | D 판단 보류 | 30 |
| V2 fun_ | 7 | E 데이터 이관 필요 | 1 |
| V3 wiki_ | 3 | F 코드 소멸·데이터 잔존 | 2 |
| **합계** | **53** ✅ | **합계** | **53** ✅ |

카테고리별 명단 (중복 없음, 누락 없음):

- **A (5)** — `notices`, `posts_tags`, `wiki_pitch`, `wiki_pitch_grade`, `wiki_stat_influence`
- **B (9)** — `users`, `user_roles`, `coupons`, `events`, `player_skills`, `skill_score_config`, `coach`, `coach_skill_condition`, `coach_skill_buff`
- **C (6)** — `site_users`, `site_refresh_tokens`, `site_coupons`, `site_events`, `site_notices`, `fun_quiz`
- **D (30)** — `teams`, `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career` (4) / `boards`, `posts`, `tags`, `site_board`, `site_post`, `site_tag`, `site_post_tag`, `site_comment`, `site_post_reaction`, `site_comment_reaction`, `site_report` (11) / `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes`, `fun_player_card`, `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`, `fun_player_card_positions`, `fun_teams` (9) / `kbo_games`, `kbo_players`, `kbo_batter_logs`, `kbo_teams`, `kbo_seasons`, `kbo_team_code_mappings` (6)
- **E (1)** — `quiz_answers`
- **F (2)** — `skill_pitcher_grade_stat`, `legend_pitcher_pitch_slot`

5 + 9 + 6 + 30 + 1 + 2 = **53** ✅

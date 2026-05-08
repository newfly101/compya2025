# dual-table-usage.md — V1↔V2 dual pair 사용 분포

> 입력: `docs/specs/db/dual-management.md` (16 pair), `docs/specs/be/{services,endpoints}.md`, `docs/specs/fe/api-calls.md`, `docs/map/db-map.md ★ Owner 확정`

---

## 분류 라벨

- 🟢 **신규 만 사용** — V2(site_*/fun_*) 단방향. 마이그레이션 완료 정상.
- 🟡 **legacy 만 사용** — V1 그대로 운영. V2 짝은 스키마만 존재.
- 🔵 **둘 다 사용 (정상 dual-read fallback)** — V2 위주, V1 일부 read fallback (의도 가능)
- 🔴 **둘 다 사용 (비정상 갭)** — Owner 진술 vs 실 코드 불일치 ★
- ⚫ **어디서도 안 씀** — V1·V2 모두 mapper 0건 (orphan)
- 🟠 **양쪽 INSERT 흐름 살아있음 (병존)** — single source of truth 미정

---

## 16 페어 사용 분포 표

| # | pair (V1 ↔ V2) | BE 사용 분포 | FE 사용 분포 | 분류 | 결론 / 권장 액션 |
|---:|---|---|---|---|---|
| 1 | `coupons` ↔ `site_coupons` | mapper: site_coupons (5 stmt INSERT/UPDATE/SELECT) + coupons (1 stmt: selectCouponById). service: `CouponAdminServiceImpl#createCoupon` 가 site_coupons INSERT → coupons readback (★ NPE 위험). `updateCoupon` 가 coupons read → site_coupons UPDATE | 모두 `/coupons` (public list) + `/admin/coupons*` 호출. 단일 endpoint 만 사용 | 🔴 **dual-write 정책 ↔ 코드 갭** | ★ **Owner 결정 필수**. 현재 코드는 dual-read fallback + V2-only write 패턴. `coupons` 에 신규 row 가 들어가는 경로가 mapper 상에 없음. dual-management.md §1 참조 |
| 2 | `teams` ↔ `fun_teams` | mapper: teams (TeamMapper.xml — selectTeamById, selectTeamAll). fun_teams: **mapper 0건**. `AdminPlayerCardServiceImpl#getAllPlayerTeamInfo` 가 teams 만 SELECT | `/admin/player/teams` 호출 (admin player form) → V1 teams 응답 받음 | 🟡 **legacy 만 사용** | FE 가 보는 데이터는 V1 teams 단독. ⚠ fun_player_card.team_id FK 가 fun_teams 참조 → fun_teams row 0 이면 V2 INSERT 시 FK 위반. **권장 액션**: V2 작업 재개 시 fun_teams 시드부터 |
| 3 | `player_legend` ↔ `fun_player_card` (LEGEND 통합) | mapper: player_legend SELECT (1 stmt: selectPlayersByPosition). `PlayerCardServiceImpl#getPlayerInfo` 가 player_legend 만 read. fun_player_card 는 V2 컨트롤러 빈 클래스라 호출 0 | `/player/{playerType}` (legacy `/simulate` 라우트 주석) 호출 → player_legend 응답 | 🟡 **legacy 만 사용** | Owner 진술과 일치 (배포는 legacy). 라우트 주석 처리 + thunk 살아있음 → legacy 운영 미사용 + 코드 잔존 |
| 4 | `player_legend_hitter_career` ↔ (V2 짝 없음) | mapper: PlayerCareer.xml (selectCareerByHitter) — 위 #3 과 함께 묶여 호출 | 동상 | 🟡 legacy 만 | V2 짝 미설계. LEGEND 통폐합 시 별도 처리 미결 |
| 5 | `player_legend_pitcher_career` ↔ (V2 짝 없음) | 동상 (selectCareerByPitcher) | 동상 | 🟡 legacy 만 | 동상 |
| 6 | `legend_pitcher_pitch_slot` ↔ `fun_player_card_pitcher_pitch_grades` | V1: **mapper 0건**. V2: PlayerCardPitcherPitchGradesMapper.xml (4 stmt) ⚠ namespace mismatch | (호출 경로 없음 — V2 컨트롤러 빈 클래스) | ⚫ **어디서도 안 씀 (현재)** | V1 은 시드만 가능성, V2 는 namespace mismatch 로 호출 시 깨짐. 통폐합 작업 미완 |
| 7 | `player_card` ↔ `fun_player_card` | V1: PlayerCardMapper.xml insertPlayerCard (1 INSERT 만). V2: fun/playerCard/PlayerCardMapper.xml CRUD 풀세트 ⚠ namespace mismatch. `AdminPlayerCardServiceImpl#createPlayerCardInfo` 가 V1 만 INSERT | `/admin/player` (POST, legacy admin) 호출 → V1 player_card INSERT | 🟠 **양쪽 스키마 살아있음, 실제 INSERT 는 V1 만** | dual-write 부재. `fun_player_card` 는 빈 컨트롤러라 INSERT 경로 없음. **single source of truth 미정** — Owner 결정 필요 |
| 8 | `player_card_hitter_attributes` ↔ `fun_player_card_hitter_stats` | V1: insertHitterAttribute. V2: 풀세트 mapper ⚠ namespace mismatch. service: `createPlayerCardInfo` 가 V1 만 INSERT | 동상 (admin player form) | 🟠 양쪽 살아있음, V1 만 INSERT | ⚠ **`contact` → `discipline` 컬럼 리네임 의미 검증 필요** (dual-management.md §6). 단순 리네임 vs 능력치 재정의 — Owner 결정 1순위 |
| 9 | `player_card_pitcher_attributes` ↔ `fun_player_card_pitcher_stats` | V1: insertPitcherAttribute. V2: 풀세트 ⚠ namespace mismatch. service: V1 만 INSERT | 동상 | 🟠 양쪽 살아있음, V1 만 INSERT | 컬럼 100% 동일. dual-write 추가만 하면 정합성 유지 |
| 10 | `events` ↔ `site_events` | V1 mapper: **0건**. V2 mapper: EventMapper.xml (6 stmt). service 는 site_events 만 호출 | `/events/external`, `/admin/events*` 호출 → 모두 V2 | 🟢 **신규 만 사용** | 마이그 정상 완료. V1 events 는 폐기 가능 |
| 11 | `notices` ↔ `site_notices` | V1 mapper: 0건. V2 mapper: NoticeMapper.xml (10 stmt) | `/notices`, `/notices/{id}`, `/admin/notices*` → 모두 V2 | 🟢 **신규 만 사용** | 정상 완료 |
| 12 | `boards` ↔ `site_board` | V1 mapper: 0건. V2 mapper: BoardMapper.xml (8 stmt) | `/admin/community` (board admin) → V2 (단 path prefix 미스매치 의심, fe-be-mismatch.md #35 참조) | 🟢 **신규 만 사용** | 정상 완료 |
| 13 | `posts` ↔ `site_post` | V1 mapper: 0건. V2 mapper: PostMapper.xml (18 stmt) | admin post 만 사용. user community 모바일은 mock-only — BE 미연결 | 🟢 **신규 만 사용** (admin 만) | 모바일 community 가 mock 인 동안 BE_ONLY 35+건 (fe-be-mismatch.md). 다음 마일스톤 차단성 |
| 14 | `tags` ↔ `site_tag` | V1 mapper: 0건. V2 mapper: TagMapper.xml | `/admin/community` tag 만 호출 | 🟢 신규 만 | 동상 |
| 15 | `posts_tags` ↔ `site_post_tag` | V1 mapper: 0건. V2 mapper: PostTagMapper.xml | (FE 호출 0건) | 🟢 신규 만 (admin 도구만) | BE 미사용 의심 — admin community 화면이 tag 매핑 호출하는지 확인 필요 |
| 16 | `users`(+`user_roles`) ↔ `site_users` | V1 mapper: 0건. V2 mapper: UserMapper.xml | `/users/me`, `/auth/**` 모두 V2 | 🟢 신규 만 | 정상 완료. ⚠ `ban_reason` V2 손실 |
| 17 | `quiz_answers` ↔ `fun_quiz` | V1 mapper: 0건. V2 mapper: QuizMapper(fun).xml | `/quiz/latest` (BE) ↔ FE path `/quiz-answers/latest` 미스매치 + dispatch 누락. admin quiz 는 path 미스매치 (`/admin/quiz` ↔ `/admin/quiz-answers`) | 🟢 **신규 만 사용** (BE 측) ★ FE path 오타 | ⚠ V2 에 `title` 컬럼 없음. fe-be-mismatch.md #8, #31–34 참조 |
| 18 | `fun_player_card_positions` (1:N 정규화) | mapper 풀세트 (PlayerCardPositionsMapper.xml) ⚠ namespace mismatch. **service / controller 호출 0건** (services.md V2 부분에 호출 없음) | (호출 경로 없음) | ⚫ **어디서도 안 씀 (현재)** | Owner 진술 (방치 중) 일치. V2 통폐합 작업 시 함께 진행 |

---

## ★ 이미 확정된 항목 검증 결과

### `coupons` ↔ `site_coupons` — 🔴 BE/DB 양쪽 분석 결과 "dual-write 정책 ↔ 코드 갭"

- **확정**: Owner 진술 ("의도된 dual-write 운영") ↔ 실 코드 (V2-only write + V1 단건 read fallback) 불일치
- 위치: `auth-and-flags.md:79`, `dual-management.md §1`, `services.md:64-66`
- 영향: `CouponAdminServiceImpl#createCoupon` 흐름이 site_coupons INSERT 후 coupons 에서 readback → coupons 에 시드 row 없으면 즉시 NPE
- FE 영향: `/admin/coupons*` 어드민 라우트 주석 처리 → 현재 운영 호출 0. 단 admin 진입 즉시 차단
- **권장 액션**: Owner 결정 — (1) dual-write 정책 굳히기 / (2) 단방향 정리 (coupons 폐기). runtime-analyzer 가 운영 row 수 검증 필수

### `teams` ↔ `fun_teams` — 🟡 legacy 만 사용

- **확정**: FE 가 보는 데이터는 V1 teams 단독 (`/admin/player/teams` 응답)
- DB analyzer 우려 검증: fun_teams row 수 0 가능성 (mapper 0건 + 시드 0건) → fun_player_card.team_id FK 위반 위험은 **실제로 발생할 일이 없음** (V2 컨트롤러 빈 클래스 + FE 호출 0건)
- **권장 액션**: V2 player_card 작업 재개 시 fun_teams 시드부터 (teams 의 row 를 fun_teams 로 복사)

### `player_legend*` ↔ `fun_player_card` — 🟡 legacy 운영, 통폐합 계획

- **확정**: 배포는 legacy 기반. legacy `/player/{playerType}` 만 호출 (단 FE 라우트 `/simulate` 주석 처리 → 운영 미사용)
- V2 fun_player_card 컨트롤러 빈 클래스 + namespace mismatch + 빈 DTO → 호출되면 깨짐. 호출 경로 없어서 운영 영향 0
- **권장 액션**: 모바일 리뉴얼 후 V2 통폐합 작업 시 (1) namespace 수정 (2) DTO 채우기 (3) fun_teams 시드 (4) service dual-write 또는 단방향 결정

### `fun_player_card_positions` — ⚫ 어디서도 안 씀

- **확정**: mapper 풀세트는 있지만 namespace mismatch + service / controller 호출 0건
- Owner 진술 ("방치 중") 일치
- **권장 액션**: V2 통폐합 시 활성화 또는 namespace 정리 후 폐기 결정

---

## 종합 통계

| 분류 | 개수 | pair |
|---|---:|---|
| 🟢 신규 만 사용 (정상 완료) | 7 | events, notices, boards, posts, tags, posts_tags, users(+user_roles), quiz_answers (8 — boards/site_board 포함) |
| 🟡 legacy 만 사용 | 5 | teams↔fun_teams, player_legend, player_legend_hitter_career, player_legend_pitcher_career |
| 🟠 양쪽 살아있음, single source 미정 | 3 | player_card, player_card_hitter_attributes, player_card_pitcher_attributes |
| 🔴 dual-write 갭 (정책↔코드 불일치) | 1 | **coupons ↔ site_coupons** ★ |
| ⚫ 어디서도 안 씀 (현재) | 2 | legend_pitcher_pitch_slot↔fun_*_pitch_grades, fun_player_card_positions |

**가장 중요한 결론**: 16 pair 중 **결정 필요 항목은 5건** (#1 coupon, #7-9 player_card 묶음, #6 pitch_grades). 나머지는 정상 완료.

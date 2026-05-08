# be-db-mismatch.md — BE endpoint/service ↔ DB 테이블 매핑

> 입력: `docs/specs/be/{endpoints,services}.md`, `docs/specs/db/{tables,mapper-mapping,dual-management}.md`, `docs/map/db-map.md` Owner 확정 섹션

---

## 1. 매핑 표 (controller → service → mapper → table)

| # | Endpoint prefix | Service entry | Mapper(xml) | 참조 테이블 | namespace 정상? | 비고 |
|---:|---|---|---|---|---|---|
| 1 | `/api/auth/**` | `AuthServiceImpl#loginWithNaver` (services.md:12) | UserMapper | `site_users` | 🟢 | NaverOAuth + JWT 발급 |
| 2 | `/api/users/me` | `UserServiceImpl#findActiveUserById` (services.md:15) | UserMapper | `site_users` | 🟢 | |
| 3 | `/api/boards`, `/api/admin/boards` | `BoardServiceImpl` | BoardMapper.xml | `site_board` | 🟢 | |
| 4 | `/api/posts`, `/api/admin/posts` | `PostServiceImpl` | PostMapper.xml (18 statement) | `site_post` | 🟢 | |
| 5 | `/api/comments`, `/api/admin/comments` | `CommentServiceImpl` | CommentMapper.xml (13) | `site_comment` | 🟢 | |
| 6 | `/api/post-reactions` | `PostReactionServiceImpl` | PostReactionMapper.xml | `site_post_reaction` (+ `site_post` counter UPDATE) | 🟢 | |
| 7 | `/api/comment-reactions` | `CommentReactionServiceImpl` | CommentReactionMapper.xml | `site_comment_reaction` (+ `site_comment` counter UPDATE) | 🟢 | |
| 8 | `/api/tags`, `/api/admin/tags` | `TagServiceImpl`, `AdminTagServiceImpl` | TagMapper.xml | `site_tag` | 🟢 | |
| 9 | `/api/post-tags` | `PostTagServiceImpl` | PostTagMapper.xml | `site_post_tag` | 🟢 | |
| 10 | `/api/reports`, `/api/admin/reports` | `ReportServiceImpl`, `AdminReportServiceImpl` | ReportMapper.xml | `site_report` | 🟢 | |
| 11 | `/api/coupons`, `/api/admin/coupons` | `CouponUserServiceImpl`, `CouponAdminServiceImpl` | CouponMapper.xml (★ V1+V2 cross) | `site_coupons` (5 stmt) + `coupons` (1 stmt — selectCouponById 만) | 🟢 | ★ ★ ★ **dual-write 정책 vs 코드 갭** — `auth-and-flags.md:79` 참조. INSERT/UPDATE 는 site_coupons 단독, findById 는 coupons 만 → createCoupon readback 시 NPE 위험 |
| 12 | `/api/events`, `/api/admin/events` | `EventUserServiceImpl`, `EventAdminServiceImpl` | EventMapper.xml | `site_events` | 🟢 | |
| 13 | `/api/notices`, `/api/admin/notices` | `NoticeServiceImpl`, `AdminNoticeServiceImpl` | NoticeMapper.xml (10) | `site_notices` | 🟢 | jsoup sanitize |
| 14 | `/api/quiz/latest`, `/api/admin/quiz` | `QuizUserServiceImpl`, `QuizAdminServiceImpl` | QuizMapper(fun).xml | `fun_quiz` | 🟢 | |
| 15 | `/api/skills/{target}` | `PlayerSkillsServiceImpl` | PlayerSkills.xml | `player_skills` | 🟢 | |
| 16 | `/api/skills/coach` | `CoachSkillServiceImpl` (services.md:94) | CoachMapper.xml | `coach`, `coach_skill_buff`, `coach_skill_condition` (3 SELECT) | 🟢 | ★ Owner 기억 정정 확정 — BE wired + 캐시까지 적용. mapper namespace 정상 |
| 17 | `/api/skills/score-config` | `SkillScoreConfigServiceImpl` | SkillScoreConfigMapper.xml | `skill_score_config` | 🟢 | |
| 18 | `/api/kbo/matches/today`, `/{matchId}` | `KboGameServiceImpl` | KboGameMapper.xml (3 SELECT) | `kbo_games` | 🟢 | ⚠ Owner: kbocrol 미가동 → 운영 row 거의 0 추정 |
| 19 | `/api/player/{position}` (LEGACY) | `PlayerCardServiceImpl#getPlayerInfo` | player/PlayerCardMapper.xml + PlayerCareer.xml + TeamMapper.xml | `player_legend` (selectPlayersByPosition), `player_legend_hitter_career`, `player_legend_pitcher_career`, `teams` | 🟢 | LEGEND 통폐합 후 폐기 예정 |
| 20 | `/api/admin/player/teams` (LEGACY) | `AdminPlayerCardServiceImpl#getAllPlayerTeamInfo` | TeamMapper.xml | `teams` | 🟢 | V1 단독 |
| 21 | `POST /api/admin/player` (LEGACY) | `AdminPlayerCardServiceImpl#createPlayerCardInfo` | player/PlayerCardMapper.xml (insert 3건) | `player_card` + `player_card_hitter_attributes` + `player_card_pitcher_attributes` | 🟢 | V2 fun_player_card 와 양쪽 INSERT 흐름은 **mapper 단계에서 식별 안 됨** — service 가 V1 만 호출. dual-write 부재 |
| 22 | `/api/player-cards` (V2 빈 컨트롤러) | (호출 경로 없음 — 빈 클래스) | fun/playerCard/PlayerCardMapper.xml | `fun_player_card` | 🔴 ★ **namespace mismatch** | xml namespace `domain.fun.playerCard.mapper.PlayerCardMapper` ↔ java `domain.fun.playerCard.repository.mapper.FunPlayerCardMapper` (mapper-mapping.md:102). 컨트롤러 호출 없으니 운영 영향 0 |
| 23 | `POST /api/admin/player-cards` (V2) | `FunPlayerCardServiceImpl#create` (services.md:117 — 빈 DTO) | fun/playerCard/PlayerCardMapper.xml | `fun_player_card` (INSERT) | 🔴 **namespace mismatch** | ★ 호출 시 BindingException 또는 NoStatement 가능. + 빈 DTO 라 INSERT NULL → fun_player_card NOT NULL 위반 + FK→fun_teams 위반 (fun_teams row 0 추정) |
| 24 | `PUT /api/admin/player-cards/{id}` (V2) | `FunPlayerCardServiceImpl#update` | fun/playerCard/PlayerCardMapper.xml | `fun_player_card` (UPDATE) | 🔴 동상 | 동상 |
| 25 | `GET /api/admin/player-cards/{id}` (V2) | `FunPlayerCardServiceImpl#getById` | fun/playerCard/PlayerCardMapper.xml | `fun_player_card` (SELECT) | 🔴 동상 | 응답 항상 `{}` (빈 record) |
| 26 | (없음 — 컨트롤러 노출 0) | `FunPlayerCardServiceImpl#getByCardCode/getAll/delete` | 동상 | 동상 | 🔴 동상 | dead 코드 |
| 27 | (없음 — fun_player_card 의 stats/positions/pitch_grades 통합 호출 컨트롤러 없음) | — | fun/playerCard/PlayerCard{HitterStats,PitcherStats,PitcherPitchGrades,Positions}Mapper.xml | `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`, `fun_player_card_positions` | 🔴 4개 mapper 모두 namespace mismatch | **호출되어도 모두 깨질 위험.** 현재 호출 경로 없음 (V2 작업 보류) |
| 28 | `POST /api/upload/events` | `UploadServiceImpl#uploadImage` | (DB 미사용 — S3 직접) | (없음) | n/a | ★ admin 가드 부재 별도 위험 |
| 29 | `GET /api/dev/test-token` | `JwtProvider#createAccessToken` | (DB 미사용) | (없음) | n/a | ★ 인증 우회 위험 |

---

## 2. 검증 포인트별 결론

### A. coach 도메인

- **결론: BE wired + DB mapper 살아있음 → Owner 기억 정정 확정**
- BE: `CoachSkillServiceImpl#getCoachSkillSet` (services.md:94) → `CoachRepository` → CoachMapper.xml (3 SELECT 통합 호출)
- DB: `coach`, `coach_skill_buff`, `coach_skill_condition` 3개 mapper 발견 + namespace 정상 (mapper-mapping.md:26)
- 컨트롤러: `GET /api/skills/coach` (endpoints.md:228) — `@Cacheable("coachSkills")` 부착
- ⚠ **운영 row 수 0 가능성**: `sql/insertData/` 에 coach 시드 파일 없음 (db/dead-suspects.md:84). 시드 없이 mapper 만 살아있으면 응답이 빈 List 일 수 있음 — runtime 검증 필요
- **권장 액션**: db-map.md `★ Owner 확정 4번` 항목을 "BE 미연결" → "BE 연결됨 (단 운영 데이터 0 추정)" 으로 수정

### B. V2 `fun_player_card` 모듈 작동 불능

- **결론: 빈 DTO + namespace mismatch + fun_teams FK 위험 → 호출되면 100% 깨짐**
- BE 빈 DTO (be/dead-suspects.md:21):
  - `FunPlayerCardCreateRequest` 0 필드
  - `FunPlayerCardUpdateRequest` 0 필드
  - `FunPlayerCardResponse` 0 필드
- DB namespace mismatch (mapper-mapping.md:102): xml namespace 가 java 패키지와 어긋남
- `fun_teams` row 수 0 추정 (db/dead-suspects.md:53) → fun_player_card.team_id FK 위반 위험
- **호출 path 추적**:
  - `/api/player-cards/**` (FunPlayerCardController): **빈 컨트롤러** → 호출 자체 불가
  - `/api/admin/player-cards/**` (FunAdminPlayerCardController): 매핑 3개 살아있지만 **FE 호출 0건** (spot-check: `grep "/player-cards" web/src` 0 매칭)
- **운영 영향: 0건**. 단 V2 작업 재개 시 4개 항목 (DTO + namespace + fun_teams 시드 + 통합 호출 흐름) 모두 fix 필요
- **권장 액션**: 모바일 player_card 화면 신규 생성 전까지 V2 모듈 동결. figma-spec-validator 가 player_card 화면을 발견하면 차단

### C. coupon dual-write 정책 ↔ 코드 갭

- **결론: Owner 진술 vs mapper/service 실태 불일치 — product 결정 필수**
- Owner 확정 (db-map.md `★ Owner 확정 2번`): "의도된 dual-write 운영"
- 실제 코드 (auth-and-flags.md:79–93, dual-management.md:53):
  - INSERT/UPDATE: **site_coupons 단독**
  - SELECT (목록): site_coupons
  - SELECT (단건 `selectCouponById`): **coupons 만**
  - `createCoupon` 흐름: site_coupons INSERT → 받은 id 로 coupons 에서 readback → coupons 에 동일 id 가 없으면 **즉시 IllegalState/NPE**
  - `updateCoupon` 흐름: coupons 에서 findById → site_coupons UPDATE → 데이터 불일치 진행
- **결정 옵션**:
  1. dual-write 정책 굳히기: service 레이어에 `coupons` INSERT/UPDATE 추가
  2. 단방향 정리: `selectCouponById` 도 site_coupons 로 변경 + coupons 폐기
- runtime 검증: 운영 환경에서 createCoupon 이 현재 동작 중인지 (= coupons 에 시드 row 가 있는지) — `legacy-db-runtime-analyzer` 우선 항목

### D. 권한 가드 누락 2건

- `POST /api/upload/events` (auth-and-flags.md:64): permitAll → S3 무차별 PUT
- `GET /api/dev/test-token` (auth-and-flags.md:62): permitAll → 누구나 ADMIN JWT 발급
- 둘 다 **DB 영향은 아니지만** runtime-analyzer 단계 전에 **즉시 fix 권장** (모바일 리뉴얼과 별개)

### E. `@PreAuthorize` decorative

- 3개 컨트롤러 (AdminCoupon, AdminEvent, AdminPlayerCard) 가 `@PreAuthorize("hasRole('ADMIN')")` 부착
- `@EnableMethodSecurity` 미선언 → method-level security 비활성 → 어노테이션 무시됨
- 다행히 모두 `/api/admin/**` prefix 라 SecurityConfig URL 가드로 자연 보호. 단 **향후 `/api/admin/**` 외 경로에 사용하면 가드 부재**
- **권장 액션**: 코드 정리 (어노테이션 제거 또는 `@EnableMethodSecurity` 추가)

---

## 3. cross-table 위험 요약

| 위험 | 위치 | 영향 |
|---|---|---|
| 🔥 coupon dual-write 갭 | CouponMapper.xml + CouponAdminServiceImpl | createCoupon NPE / 데이터 불일치 |
| 🔥 fun_player_card 5개 mapper namespace mismatch | mapper/fun/playerCard/*.xml | V2 호출 시 BindingException (현재 호출 0건) |
| 🔥 fun_player_card.team_id → fun_teams FK 위반 | fun_teams row 0 추정 | V2 INSERT 시 FK 위반 |
| ⚠ player_card 와 fun_player_card 양쪽 INSERT 흐름 부재 | service 단 dual-write 미구현 | LEGEND 카드 single source of truth 미정 |
| ⚠ legend_pitcher_pitch_slot mapper 0건 | sql 시드만 있음 | 운영 read-only 마스터 데이터 (정상 가능성 높음) |
| ⚠ skill_pitcher_grade_stat orphan | mapper 0건 + V2 짝 없음 + 시드만 | dead 가능성 — runtime 검증 필요 |
| ⚠ contact ↔ discipline 컬럼 의미 변경 | hitter_attributes ↔ fun_*_hitter_stats | 단순 리네임 vs 능력치 재정의 — Owner 결정 필요 |

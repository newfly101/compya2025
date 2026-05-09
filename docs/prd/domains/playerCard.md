# 도메인: playerCard

> ★ Legacy PC 폐기 — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 admin / 모바일 재구현 예정). FE 폴더 통째 삭제 + admin 라우트 + reducer 주석. BE / DB 보류 (운영 데이터 보존). 아래 § TODO 참조.

## TODO (2026-05-09 — 기획 IA 작업 우선)

> 사용자 정책 (2026-05-09): "playerCard 는 legacy 만 남음. 사용자 특화 컨텐츠 (240명 user 기반) 로 변경 예정. 폴더 + 연관 파일 삭제 → 기획 IA 후 다시 코드 개발 진행"

### 즉시 (P0)

- [ ] **기획 IA 작업 재개** — `prd-ia-interactive` sub-agent 호출 (`/prd-pipeline playerCard`)
  - 사용자 특화 컨텐츠 scope 재정의 (240명 user 데이터 활용 컨셉)
  - simulate 도메인과 통합 검토 (둘 다 사용자 특화 컨텐츠 후보)
  - V2 `fun_player_card*` schema 활용 검토 (이미 운영 중인 V1 `player_card*` / `player_legend*` 와 정합)
  - admin player 페이지 신규 기획 (Owner 결정 #2: contact ↔ discipline 컬럼 의미 / 결정 #5: V2 통폐합 진입 시점 동시 해소 필요)

### IA 완료 후 코드 개발 (P1)

- [ ] playerCard.md Part B v1 확정사항 코드 반영
- [ ] `web/src/domains/playerCard/**` 모바일 표준 패턴 신규 작성
- [ ] admin 라우트 (`/admin/content/player`) + reducer 주석 해제 + 동작 확인

### 본 라운드 (2026-05-09) 처리 결과

- `web/src/domains/playerCard/**` 폴더 통째 폐기 (25 파일: feature/admin/pages 1 + feature/admin/components 8 + feature/admin/hooks 5 + store 5 + config 1 + utils 1 + scss 4)
- 외부 호출 주석 처리:
  - `web/src/app/router/routes/AdminRoutes.jsx` (`AdminPlayerPage` lazy import + `/admin/content/player` active 라우트 주석)
  - `web/src/app/store/store.js` (`playerCardReducer` import + reducer 등록 주석)

### 보존 항목 (의도)

- DB: `player_card`, `player_card_hitter_attributes`, `player_card_pitcher_attributes`, `player_legend*` (4 테이블), `teams`, `fun_player_card*` (5 테이블), `fun_teams` — 운영 데이터 보존 (재도입 시 schema 활용)
- BE 의존성 있는 클래스 보류 (BE 통째 미터치):
  - V1 `domain/player/**` 전체 (Controller·Service·Repository·Mapper·Entity·DTO) — `domain.skill.*` 4 파일이 `PlayerSkillsEntity` import 중 (의존성 검증 결과 BE 삭제 unsafe)
  - V2 `domain/fun/playerCard/**` (빈 컨트롤러 + 빈 DTO + namespace mismatch mapper) — 외부 의존성 없으나 본 FE 정리 라운드 scope 외 (BE 일괄 정리 라운드 후속)
  - `mapper/player/*.xml`, `mapper/fun/playerCard/*.xml` 미터치
  - SecurityConfig: `/api/admin/**` ADMIN 가드 일괄 처리 (도메인별 path 가드 없음 → 정리 항목 없음)

---

## A.1 현재 상태

- **분류**: **PC 레거시 잔존** (V1 admin live) + **미구현/스켈레톤** (V2 fun_player_card 작동 불능)
- **모바일 전환 진척도**: 모바일 화면 **현재 없음**. PC 어드민만 운영 (V1 기반). V2 모듈은 보류
- 폴더 구조:
  ```
  domains/playerCard/
  ├── feature/admin/                 # PC 어드민 (V1 LEGACY 호출)
  │   ├── pages/AdminPlayerPage.jsx
  │   ├── components/
  │   └── hooks/{useAdminPlayerMeta, useAdminPlayerForm}.js
  └── store/admin/    { api.js, endpoints.js, thunks.js }
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| AdminPlayerPage | `/admin/content/player` | `web/src/domains/playerCard/feature/admin/pages/AdminPlayerPage.jsx` | PC 어드민 | live (V1 LEGACY API 호출) |
| (모바일 player_card 화면) | (없음) | (없음) | n/a | ★ **figma 도착 시 V2 모듈 fix 4건 차단 발생** |

## A.3 API 엔드포인트

### BE 노출

#### V1 LEGACY (`domain/player/*`) — 운영 중

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/player/{position}` | `PlayerCardController#getLegendPlayerByPosition` (`player/controller/PlayerCardController.java:20`) | permitAll | player_legend* + teams 조회 |
| GET | `/api/admin/player/teams` | `AdminPlayerCardController#getPlayerTeams` (`AdminPlayerCardController.java:31`) | ADMIN | teams (V1) 만 |
| POST | `/api/admin/player` | `AdminPlayerCardController#createPlayerCard` (line 36) | ADMIN | player_card + hitter/pitcher attribute 복합 INSERT |

> 같은 컨트롤러에 `getAllPlayerCardList`, `getPlayerCardListByGrade`, `updatePlayerCard`, `updatePlayerCardAttribute`, `createPlayerCardList`, `createPlayerCardAttributeList` **주석으로만** 존재 (file:21-58). 미구현. `be/dead-suspects.md C`

#### V2 신규 (`domain/fun/playerCard/*`) — ★ 작동 불능

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| (none) | — | `FunPlayerCardController` (`fun/playerCard/controller/FunPlayerCardController.java:9`) | — | ★ **빈 컨트롤러**. mapping 0개. Bean 만 등록 |
| POST | `/api/admin/player-cards` | `FunAdminPlayerCardController#create` (`FunAdminPlayerCardController.java:16`) | ADMIN | ★ DTO 빈 record (필드 0). 호출 시 NULL INSERT → fun_player_card NOT NULL 위반 |
| PUT | `/api/admin/player-cards/{id}` | `FunAdminPlayerCardController#update` (line 21) | ADMIN | ★ 빈 record |
| GET | `/api/admin/player-cards/{id}` | `FunAdminPlayerCardController#get` (line 27) | ADMIN | ★ 응답 record 항상 `{}` |

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/playerCard/store/admin/api.js:9` | GET | `/admin/player/teams` | `useAdminPlayerMeta`, `useAdminPlayerForm` | `/admin/content/player` |
| (admin form 내부) | POST | `/admin/player` (V1 LEGACY) | (admin form dispatch) | `/admin/content/player` |
| (호출 0건) | — | `/player-cards/**` (V2) | — | (FE 가 V2 호출 안 함, spot-check 확인) |
| (호출 0건) | — | `/admin/player-cards/**` (V2) | — | (FE 가 V2 호출 안 함) |
| `domains/simulate/store/api.js:8` | GET | `/player/{playerType}` (V1 LEGACY) | `usePlayerCardData` | `/simulate/{pitcher,hitter}` ★ 라우트 주석 |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #14-20)

- **매칭됨 (V1 admin 정상)**: 2건 (`/admin/player/teams`, `POST /admin/player`)
- **MATCH(legacy)**: `/player/{playerType}` — `/simulate` 라우트 주석 처리. 운영 미사용
- **⚫ DEAD_BOTH**: `/api/player-cards` (V2 빈 컨트롤러) — FE 호출 0건 + BE 매핑 0개
- **🔴 BE_ONLY (V2)**: `POST/PUT/GET /api/admin/player-cards*` 3건 — 호출 0건. 빈 DTO + namespace mismatch

## A.4 DB 테이블 + Mapper

### V1 (운영 중)

| 테이블 | 분류 | Mapper xml | 비고 |
|---|---|---|---|
| `teams` | 🟢 legacy | `mapper/TeamMapper.xml:12,17` | 2 stmt |
| `player_legend` | 🟢⚠ legacy(폐기예정) | `mapper/player/PlayerCardMapper.xml:22` (selectPlayersByPosition) | LEGEND 통폐합 계획 |
| `player_legend_hitter_career` | 🟢⚠ legacy(폐기예정) | `mapper/player/PlayerCareer.xml:21` | |
| `player_legend_pitcher_career` | 🟢⚠ legacy(폐기예정) | `mapper/player/PlayerCareer.xml:37` | |
| `legend_pitcher_pitch_slot` | 🟢⚠ legacy(폐기예정, mapper 0건) | — | 시드만 가능성. runtime 검증 필요 |
| `player_card` | 🟢 legacy | `mapper/player/PlayerCardMapper.xml:32` | INSERT 만 (read 없음 — runtime 검증 필요) |
| `player_card_hitter_attributes` | 🟢 legacy | `mapper/player/PlayerCardMapper.xml:64` | INSERT 만 |
| `player_card_pitcher_attributes` | 🟢 legacy | `mapper/player/PlayerCardMapper.xml:84` | INSERT 만 |

### V2 (스켈레톤, 작동 불능)

| 테이블 | 분류 | Mapper xml | 비고 |
|---|---|---|---|
| `fun_teams` | 🔵⏸ new(보류) | — (mapper 0건) | ⚠ 불완전 마이그. row 0 추정 → fun_player_card.team_id FK 위반 위험 |
| `fun_player_card` | 🔵 active | `mapper/fun/playerCard/PlayerCardMapper.xml:25,50,64,81,98,115` | ⚠ namespace mismatch — `domain.fun.playerCard.mapper.PlayerCardMapper` ↔ java `domain.fun.playerCard.repository.mapper.FunPlayerCardMapper` |
| `fun_player_card_hitter_stats` | 🔵 active | `PlayerCardHitterStatsMapper.xml` | ⚠ namespace mismatch |
| `fun_player_card_pitcher_stats` | 🔵 active | `PlayerCardPitcherStatsMapper.xml` | ⚠ namespace mismatch |
| `fun_player_card_pitcher_pitch_grades` | 🔵 active | `PlayerCardPitcherPitchGradesMapper.xml` | ⚠ namespace mismatch |
| `fun_player_card_positions` | 🔵⏸ new(보류) | `PlayerCardPositionsMapper.xml` | ⚠ namespace mismatch + service/controller 호출 0건. Owner: 방치 중 (1:N 정규화 미완) |

### dual pair

| pair (V1 ↔ V2) | 분류 | 비고 |
|---|---|---|
| `teams ↔ fun_teams` | 🟡 legacy 만 | TeamMapper 가 V1 만 SELECT. fun_teams mapper 0건 + 시드 0건 (불완전 마이그) |
| `player_card ↔ fun_player_card` | 🟠 양쪽 살아있음, V1 만 INSERT | service `createPlayerCardInfo` 가 V1 만 INSERT. dual-write 부재 |
| `player_card_hitter_attributes ↔ fun_player_card_hitter_stats` | 🟠 + ★ R8 contact↔discipline 컬럼 의미 검증 필요 | `dual-management.md §6` |
| `player_card_pitcher_attributes ↔ fun_player_card_pitcher_stats` | 🟠 동일 컬럼 100% | dual-write 추가만 하면 정합성 유지 |
| `player_legend* ↔ fun_player_card` (LEGEND 통폐합) | 🟡 legacy 만 사용 | 4 V1 테이블 → 1 V2 테이블 흡수. 배포는 legacy 기반 |
| `legend_pitcher_pitch_slot ↔ fun_player_card_pitcher_pitch_grades` | ⚫ 어디서도 안 씀 | V1 mapper 0건, V2 namespace mismatch |
| `fun_player_card_positions` | ⚫ 어디서도 안 씀 (1:N 정규화) | Owner: 방치 |

## A.5 권한 / 가드

- public V1 (`/api/player/{position}`): permitAll
- admin V1 (`/api/admin/player*`): SecurityConfig URL 가드 + ★ `@PreAuthorize` decorative (R6)
- admin V2 (`/api/admin/player-cards*`): SecurityConfig URL 가드

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🔥 **R2: V2 `fun_player_card` 모듈 작동 불능** | `be/dead-suspects.md A,B`, `mapper-mapping.md:96-108`, `dual-management.md §4`, `risk-and-priority.md #2` | ★ 모바일 player_card 화면 신규 작업 시 차단 |
| - 빈 컨트롤러 (`FunPlayerCardController`) | — | 매핑 0개 |
| - 빈 DTO 3개 (`FunPlayerCardCreateRequest/UpdateRequest/Response`) | — | 호출 시 NULL INSERT |
| - 5개 mapper namespace mismatch | — | BindingException 가능 |
| - fun_teams row 0 추정 | — | fun_player_card.team_id FK 위반 |
| - service 통합 호출 흐름 미완 (fun_player_card + stats + positions) | — | |
| 🔥 **R8: `contact ↔ discipline` 컬럼 의미 변경** | `dual-management.md §6`, `risk-and-priority.md #8` | ★ 모바일 player_card 화면 작업 진입 전 결정 필요 |
| ⚠ player_card vs fun_player_card single source of truth 미정 | `dual-table-usage.md #7` | Owner 결정 #5 |
| ⚠ AdminPlayerCardController 주석 핸들러 6개 (미구현) | `be/dead-suspects.md C` | 정리 가능 |
| ⚠ Owner 정책: player_legend* → fun_player_card 통폐합 계획, 배포 legacy | `db-map.md ★ Owner 확정 #5` | LEGEND 카드 single source of truth 결정 미정 |
| ⚠ `legend_pitcher_pitch_slot` mapper 0건 | `db/dead-suspects.md 1-C` | runtime 검증 필요 |

### R2 권장 fix (Phase 3, figma 도착 시)

1. DTO 필드 채우기: `FunPlayerCardCreateRequest`, `FunPlayerCardUpdateRequest`, `FunPlayerCardResponse`
2. 5개 mapper xml namespace 수정 (`domain.fun.playerCard.mapper.*` → `domain.fun.playerCard.repository.mapper.*`)
3. `fun_teams` 시드 (teams 의 row 복사)
4. service 가 fun_player_card + stats + positions 통합 호출하도록 정리

## A.7 dead 항목 (이 도메인 안)

- AdminPlayerCardController 주석 핸들러 6개 — 정리 가능 (`be/dead-suspects.md C`). V2 통폐합 시 V2 쪽 신규 구현
- V2 fun_player_card 모듈 — dead 가 아니라 **미완 스켈레톤**. 작업 재개 자리. 보존 (`dead-confirmed.md 3-A`)
- `coupons` 테이블과 별개로, 본 도메인은 dual pair 결정 필요 항목 다수

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #2 (🔥)**: contact ↔ discipline 컬럼 의미 — (A) 단순 표기 정정 / (B) 능력치 재정의
- **결정 #5 (⚠)**: V2 통폐합 진입 시점 — (A) 모바일 리뉴얼 마무리 후 / (B) figma 에 player_card 화면 등장 시 즉시 V2 fix
- **추가 결정 (LEGEND 카드 SoT)**: `player_legend*` ↔ `fun_player_card` 어느 쪽이 master? (LEGEND 카드 데이터 단일 진실)
- **runtime 검증 필요**:
  - `fun_teams` row 수 (0 추정 검증)
  - `legend_pitcher_pitch_slot` row 수 (시드만인지)
  - `player_card` row 수 (INSERT 만 mapper, read 경로 없음)

---

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역

# 도메인: dictionary

> ★ Legacy PC 보류 (`fe-map.md ★ Owner 확정 #1`). 라우트 주석 처리 = 운영 미사용. **삭제 금지** (코드 기능 참고용 보존).

## A.1 현재 상태

- **분류**: **PC 레거시 잔존 (운영 미사용)**
- **모바일 전환 진척도**: 미진행 — 살릴지 버릴지 별도 결정 미정 (Owner 확정)
- 폴더 구조 (PC 전용):
  ```
  domains/dictionary/
  ├── page/{DictionaryHomePage, DictionaryPage}.jsx
  ├── feature/{components, hooks, config}/
  └── store/    { api.js, endpoints.js, thunks.js, slices.js }
  ```
- store 등록: `dictionary` (`web/src/app/store/store.js:16`) — 상시 로딩, 번들 사이즈 영향

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| DictionaryHomePage | `/dictionary` ★ 라우트 주석 | `web/src/domains/dictionary/page/DictionaryHomePage.jsx` | PC 전용 | 라우트 주석 처리 |
| DictionaryPage (pitcher/hitter) | `/dictionary/pitcher`, `/dictionary/hitter` ★ 라우트 주석 | `web/src/domains/dictionary/page/DictionaryPage.jsx` | PC 전용 | 라우트 주석 처리 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/skill/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/skills/{target}` | `SkillController#playerTypeSkills` (`skill/controller/SkillController.java:21`) | permitAll | player_skills 테이블, target=PITCHER/HITTER |
| GET | `/api/skills/coach` | `SkillController#coachSkills` (line 26) | permitAll | ★ Owner 기억 정정 — coach + coach_skill_buff + coach_skill_condition 결합 + Caffeine cache (`coachSkills`). FE 호출 0건 |
| GET | `/api/skills/score-config` | `SkillController#skillScoreConfig` (line 31) | permitAll | skill_score_config |

> ★ Spring 매핑 충돌 의심: `/api/skills/{target}` enum binding 이 `coach`, `score-config` 를 잡으려 시도. static path 가 우선 매칭되는지 검증 필요 (`endpoints.md:231`).

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/dictionary/store/api.js:8` | GET | `/skills/{playerType}` | `requestPlayerSkillSet` | `usePitcherSkillChange`, `useHitterSkillChange`, `PlayerDictionaryView` ★ legacy PC, 라우트 주석 |
| (호출 0건 — coach skills) | GET | `/skills/coach` | — | (FE 미연결) |
| (simulate 도메인에서 사용) | GET | `/skills/score-config` | `useSkillScoreConfig` | (legacy `/simulate/{pitcher,hitter}`) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #9-11)

- **🟡 MATCH(legacy)**: `/skills/{target}`, `/skills/score-config` — legacy PC 만 사용
- **🔴 BE_ONLY**: `/skills/coach` — BE wired (★ Owner 기억 정정 확정), FE 미연결. 향후 coach 화면 작업 시 thunk 신설 권장

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `player_skills` | V1 | 🟣 shared(legacy 운영) | `mapper/PlayerSkills.xml:8` | 시드: `INSERT_DATA_TABLE.sql`, `updateDescription.sql` |
| `skill_score_config` | V1 | 🟣 shared(legacy 운영) | `mapper/SkillScoreConfigMapper.xml:16` | 시드: `INSERT_SKILL_SCORE_CONFIG.sql` |
| `skill_pitcher_grade_stat` | V1 | 🟣 shared(legacy 운영, mapper 0건 — orphan 의심) | — | 시드만 (`skillGradeStat.sql`). runtime 검증 필요 |
| `coach` | V1 | 🟣⏸ shared(BE 미연결 의도) → ★ **BE 연결 확정** | `mapper/CoachMapper.xml:8` | Owner 기억과 어긋남 (mapper + service + cache 모두 wired) |
| `coach_skill_condition` | V1 | 🟣⏸ → ★ **BE 연결** | `mapper/CoachMapper.xml:18` | |
| `coach_skill_buff` | V1 | 🟣⏸ → ★ **BE 연결** | `mapper/CoachMapper.xml:13` | |

### dual pair

- skill_* / coach_* 모두 V2 짝 없음. Owner 4 그룹2: V2 재구조화 보류 (게임사 업데이트 대비 컬럼 변경 여지)

## A.5 권한 / 가드

- 라우트 주석 처리. 운영 진입 0
- BE endpoint (`/api/skills/*`): permitAll

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| Owner 정책: legacy PC. 살릴지 버릴지 결정 미정. **삭제 금지** | `fe-map.md ★ Owner 확정 #1` | 정리 라운드 (Owner 결정 #4) |
| store 등록 (`dictionaryReducer`) 상시 로딩 → 번들 사이즈 영향 | `fe/dead-suspects.md` 정리 권고 2 | 동적 import (lazy) 검토 가치 |
| ★ Owner 기억 정정: coach 도메인 — "BE 미연결" 진술 → 실제 wired (mapper + service + cache + endpoint 노출) | `db-map.md ★ Owner 확정 #4`, `be/dead-suspects.md H`, `services.md:94` | 운영 row 수 0 가능성 — runtime 검증 |
| Owner 4 그룹2: skill_* V2 재구조화 보류. V2 짝 신설 전까지 dual 분류 X | `db-map.md ★ Owner 확정 #4` | — |
| ⚠ orphan 의심: `skill_pitcher_grade_stat` (mapper 0건 + V2 짝 없음 + 시드만) | `db/dead-suspects.md 1-D` | runtime 검증 필요 |

## A.7 dead 항목 (이 도메인 안)

- Owner 정책상 **보존** (기능 참고용). dead 처리 금지
- 단 store 등록 영향은 별도 라운드 검토 가치
- FE skill 관련 mock 데이터 (`web/src/data/skill/*` — HITTER_POINTS, HITTER_RECOMMEND, HITTER_SKILLS, PITCHER_RECOMMEND, pitcherComboPresets, pitcherPositionScore, pitcherSkillMeta) — legacy 사용. 보존

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #4**: dictionary 도메인 운명 — (A) 유지 / (B) 동적 import / (C) 폐기
- coach 도메인 노출 / FE 연결 시점 (★ BE 살아있는데 FE 호출 0건)
- skill_* 의 V2 재구조화 시점

> **Part B 생략 / 보류 명시** — Owner 정책상 legacy PC 보존, 모바일 작업 대상 아님. Part B 는 살릴지 결정 후 작성.

---

## B.1 기능 요구사항 (보류)

> Owner 정책: legacy PC 보존. Part B 는 살릴지 폐기인지 결정 후 작성.

- (보류)

## B.2 신규 기능 (보류)

- (보류)

## B.3 우선순위 (보류)

## B.4 KPI / 성공지표 (보류)

## B.5 디자인 / Figma 참조 (보류)

---

## TODO (2026-05-09 — 기획 IA 작업 우선)

> 사용자 정책 (2026-05-09): "dictionary 는 legacy 로만 남아있음. 디자인이 PC 기준이라 폴더 통째 삭제. 기획 IA 후 다시 코드 개발 진행"

### 즉시 (P0)

- [ ] **기획 IA 작업 재개** — `prd-ia-interactive` sub-agent 호출 (`/prd-pipeline dictionary`)
  - 모바일 dictionary scope 재정의 (선수 / 코치 / 팀 / 스킬 사전 등 어떤 컨텐츠가 모바일에 노출될지)
  - BE 보존 정책 검토: V1 `player_skills` / `skill_score_config` / `skill_pitcher_grade_stat` 테이블은 보류 유지 (`_overview.md § 1.3`). 모바일 재도입 시 schema 활용 가능
  - admin dictionary scope 분리 결정

### IA 완료 후 코드 개발 (P1)

- [ ] dictionary.md Part B v1 확정사항 코드 반영 (FE / BE / mapper / SQL)
- [ ] `src/domains/dictionary/**` 모바일 표준 패턴 신규 작성 (본 라운드 폐기된 PC 디자인 대체)
- [ ] 외부 호출 (라우트 / 메뉴 / 컴포넌트 등) 주석 해제 + 동작 확인

### 본 라운드 (2026-05-09) 처리 결과

- `web/src/domains/dictionary/**` 폴더 통째 폐기 (35 파일 — PC legacy 디자인)
- 외부 호출 주석 처리 (실제 주석 처리한 파일):
  - `web/src/app/store/store.js` — `dictionaryReducer` import + reducer 등록 주석
  - `web/src/app/router/routes/PublicRoutes.jsx` — `DictionaryHome` / `Dictionary` lazy import 주석 (route 등록은 이전 라운드부터 이미 주석 상태 — `commit c2955b7` 보고)
  - `web/src/app/wrapper/parts/hooks/useHeaderNav.js` — `/dictionary` 헤더 메뉴 항목 주석
  - `web/src/domains/simulate/feature/hooks/usePitcherSkillChange.js` — `requestPlayerSkillSet` import + dispatch + `state.dictionary` selector 주석 (simulate 도 PC legacy)
  - `web/src/domains/simulate/feature/hooks/useHitterSkillChange.js` — 동일 (PITCHER → HITTER)
- 모바일 활성 도메인 영향 0건 (home / coupons / events / notices / quiz / historyMode / profile / authentication 모두 dictionary 미참조 grep 검증)
- 기획 IA 미진행 (P0 후속)

### 보존 항목 (의도)

- BE: `domain/skill/SkillController` (`/api/skills/{target}`, `/api/skills/coach`, `/api/skills/score-config`) — 모바일 재도입 시 BE 활용 가능
- DB: `player_skills`, `skill_score_config`, `skill_pitcher_grade_stat`, `coach`, `coach_skill_buff`, `coach_skill_condition` — 운영 데이터 보존
- BE 단독 도메인 `domain/skill/coach/*` (`GET /api/skills/coach`) — 본 라운드 무관 (FE 호출 0건)

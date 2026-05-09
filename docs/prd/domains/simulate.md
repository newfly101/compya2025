# 도메인: simulate

> ★ Legacy PC 폐기 — 2026-05-09 (사용자 특화 컨텐츠 240명 user 기반 신규 기획 IA 후 모바일 재구현 예정). FE 폴더 통째 삭제 + 외부 호출 주석. BE / DB 보류 (운영 데이터 보존). 아래 § TODO 참조.

## TODO (2026-05-09 — 기획 IA 작업 우선)

> 사용자 정책 (2026-05-09): "simulate 는 legacy 만 남음. 사용자 특화 컨텐츠 (240명 user 기반) 로 변경 예정. 폴더 + 연관 파일 삭제 → 기획 IA 후 다시 코드 개발 진행"

### 즉시 (P0)

- [ ] **기획 IA 작업 재개** — `prd-ia-interactive` sub-agent 호출 (`/prd-pipeline simulate`)
  - 사용자 특화 컨텐츠 scope 재정의 (240명 user 데이터 활용 컨셉)
  - 모바일 simulate scope 재정의 (시뮬레이션 흐름 / 입력 / 결과 표시 등)
  - playerCard 도메인과 통합 검토 (둘 다 사용자 특화 컨텐츠 후보)
  - admin / DB / BE 보존 정책 검토 (현재 BE `domain.player.*` + `domain.skill.*` 의존 잔존)

### IA 완료 후 코드 개발 (P1)

- [ ] simulate.md Part B v1 확정사항 코드 반영
- [ ] `web/src/domains/simulate/**` 모바일 표준 패턴 신규 작성
- [ ] 외부 호출 (라우트 / store reducer / 메뉴) 주석 해제 + 동작 확인

### 본 라운드 (2026-05-09) 처리 결과

- `web/src/domains/simulate/**` 폴더 통째 폐기 (27 파일: page 3 + feature 13 + store 4 + scss 4 + hooks 3)
- 외부 호출 주석 처리:
  - `web/src/app/store/store.js` (`simulateReducer` import + reducer 등록 주석)
  - `web/src/app/router/routes/PublicRoutes.jsx` (`SkillSimulator` / `PitcherSkillChange` / `HitterSkillChange` lazy import 주석 — 라우트 등록은 이미 주석 dead 상태 유지)
- 기획 IA 미진행 (P0 후속)

### 보존 항목 (의도)

- DB: `player_skills`, `skill_*`, `player_card*`, `player_legend*`, `teams`, `fun_player_card*`, `fun_teams` — 운영 데이터 보존
- BE 의존성 있는 클래스 보류:
  - `domain.player.entity.PlayerSkillsEntity` 가 `domain.skill.repository.PlayerSkillsRepository` / `domain.skill.repository.mapper.PlayerSkillsMapper` / `domain.skill.service.PlayerSkillsServiceImpl` / `domain.skill.service.support.SkillItemConvertor` 에서 import — `domain/player/**` BE 통째 삭제 시 4 파일 컴파일 실패 → 본 라운드 BE 미터치
  - `domain/fun/playerCard/**` (V2 빈 컨트롤러) — 외부 의존성 없으나 BE 일괄 정리 라운드까지 보류
  - `kbocrol/**` 미터치 (별도 시스템)

---

## A.1 현재 상태

- **분류**: **PC 레거시 잔존 (운영 미사용)**
- **모바일 전환 진척도**: 미진행 — 살릴지 버릴지 별도 결정 미정
- 폴더 구조 (PC 전용):
  ```
  domains/simulate/
  ├── page/{SkillSimulator, skillChange/{Pitcher,Hitter}SkillChange}.jsx
  ├── feature/components/**, feature/hooks/**
  └── store/    { api.js, endpoints.js, thunks.js, slices.js }
  ```
- store 등록: `simulate` (`web/src/app/store/store.js`) — 상시 로딩
- 자체 BE 컨트롤러 없음 — skill + player API 호출

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| SkillSimulator | `/simulate` ★ 라우트 주석 | `web/src/domains/simulate/page/SkillSimulator.jsx` | PC 전용 | 라우트 주석 |
| PitcherSkillChange | `/simulate/pitcher` ★ 라우트 주석 | `web/src/domains/simulate/page/skillChange/PitcherSkillChange.jsx` | PC 전용 | |
| HitterSkillChange | `/simulate/hitter` ★ 라우트 주석 | `web/src/domains/simulate/page/skillChange/HitterSkillChange.jsx` | PC 전용 | |

## A.3 API 엔드포인트

### BE 노출

자체 컨트롤러 없음. skill + player 도메인 호출.

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/simulate/store/api.js:8` | GET | `/player/{playerType}` (V1 LEGACY) | `usePlayerCardData` (`requestPlayerCardInfo`) | `/simulate/{pitcher,hitter}` |
| `domains/dictionary/store/api.js:18` (simulate 도 같이 사용) | GET | `/skills/score-config` | `useSkillScoreConfig` | `/simulate/*` |
| `domains/dictionary/store/api.js:8` | GET | `/skills/{playerType}` | `usePitcherSkillChange`, `useHitterSkillChange` | `/simulate/*` |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #9-11, #14)

- **🟡 MATCH(legacy)**: 모두 매칭되나 라우트 주석 — 운영 미사용

## A.4 DB 테이블 + Mapper

자체 도메인 테이블 없음. 의존:

- **dictionary 도메인**: `player_skills`, `skill_score_config`, (skill_pitcher_grade_stat orphan 의심)
- **playerCard 도메인 (V1)**: `player_legend*`, `player_card*`, `teams`

## A.5 권한 / 가드

- 라우트 주석 처리. 운영 진입 0
- BE endpoint (`/api/player/*`, `/api/skills/*`): permitAll

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| Owner 정책: legacy PC. **삭제 금지** | `fe-map.md ★ Owner 확정 #1` | 정리 라운드 (Owner 결정 #4) |
| store 등록 (`simulateReducer`) 상시 로딩 → 번들 사이즈 영향 | `fe/dead-suspects.md` 정리 권고 2 | 동적 import 검토 |
| FE skill mock 데이터 (`web/src/data/skill/**`) — legacy 사용 | `fe/state-and-data.md:77-83` | 보존 |
| sessionStorage + AES 캐싱 (`web/src/global/utils/crypto/storageCrypto.js` — `skill-v2-{type}`, `skill-score-config`, `info-{type}`) | `fe/state-and-data.md:11` | legacy 사용 — 동결 |

## A.7 dead 항목 (이 도메인 안)

- Owner 정책상 **보존**. dead 처리 금지

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #4**: simulate 도메인 운명 — (A) 유지 / (B) 동적 import / (C) 폐기
- 모바일 재작성 시 dictionary + simulate 합칠지 분리할지

> **Part B 생략 / 보류 명시** — Owner 정책상 legacy PC 보존, 모바일 작업 대상 아님.

---

## B.1 기능 요구사항 (보류)

> Owner 정책: legacy PC 보존. Part B 는 살릴지 폐기인지 결정 후 작성.

- (보류)

## B.2 신규 기능 (보류)

- (보류)

## B.3 우선순위 (보류)

## B.4 KPI / 성공지표 (보류)

## B.5 디자인 / Figma 참조 (보류)

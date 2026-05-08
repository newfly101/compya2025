# 도메인: kbo

> ★ Legacy PC 보류 + **신규 도메인 보류 상태** (`db-map.md ★ Owner 확정 #1`, `fe-map.md ★ Owner 확정 #1`). 라우트 주석 처리. kbocrol Python 크롤러 미가동 → 운영 데이터 거의 0 추정. **삭제 금지**.

## A.1 현재 상태

- **분류**: **PC 레거시 잔존 + 신규 도메인 보류**
  - FE 측: 라우트 주석 처리 (Legacy PC 분류와 비슷한 패턴)
  - BE 측: KboGameController 1개 컨트롤러 wired
  - DB 측: V2 신규 도메인 의도지만 sql/V2/ 로 미이동 (V1 위치 잔존)
  - 외부: kbocrol Python 크롤러 (`kbocrol/`) — BE 와 직접 통신 없음, DB 공유만. Owner 진술: kbocrol 미가동 → 운영 row 0 추정
- **모바일 전환 진척도**: 미진행. 모바일 리뉴얼 마무리 후 재진입 시 sql/V2/kbo/ 로 이동 필요

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| KBOLeaguePage | `/kbo` ★ 라우트 주석 | `web/src/domains/kbo/feature/public/pages/KBOLeaguePage.jsx` | PC 추정 | 라우트 주석 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/kbo/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/kbo/matches/today` | `KboGameController#getTodayMatches` (`kbo/controller/KboGameController.java:20`) | permitAll | kbo_games + 양팀 최근 5경기 W/L/D + cache(`kboMatches::today`) |
| GET | `/api/kbo/matches/{matchId}` | `KboGameController#getMatchDetail` (line 29) | permitAll | null 반환 가능 |

> Owner: kbocrol 미가동 → 운영 row 거의 0 추정. wired 정상이지만 라이브 데이터 부재 (`be-db-mismatch.md #18`).

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/kbo/store/public/api.js:5` | GET | `/kbo/matches/today` | `requestGetTodayMatches` (`useTodayMatches`) | `/kbo` ★ 라우트 주석 |
| `domains/kbo/store/public/api.js:10` | GET | `/kbo/matches/{matchId}` | `requestGetMatchDetail` (정의만, dispatch 0건) | (없음) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #12-13)

- **🟡 MATCH(legacy)**: `/kbo/matches/today` — legacy 라우트 주석
- **⚫ DEAD_BOTH**: `/kbo/matches/{matchId}` — thunk 정의만 dispatch 0건 + 라우트 주석. 살리려면 KBO 도메인 재진입 필요

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `kbo_seasons` | V1 위치 (의도상 V2 신규 보류) | 🔵⏸ new(V2 보류) | — | 인라인 INSERT 만 (`sql/CREATE_TABLE_KBO.sql:23`) |
| `kbo_teams` | V1 위치 (의도상 V2) | 🔵⏸ new(V2 보류) | — | 인라인 INSERT 10팀 (`sql:42`) |
| `kbo_games` | V1 위치 (의도상 V2) | 🔵⏸ new(V2 보류, mapper 일부) | `mapper/kbo/KboGameMapper.xml:37,71,89` | 3 SELECT 만 |
| `kbo_players` | V1 위치 (의도상 V2) | 🔵⏸ new(V2 보류) | — | mapper 0건 |
| `kbo_batter_logs` | V1 위치 (의도상 V2) | 🔵⏸ new(V2 보류) | — | kbocrol 전용 추정 |
| `kbo_team_code_mappings` | V1 위치 | 🔵⏸ new(V2 보류) | — | 시드만 (`INSERT_KBO_DATA_TABLE.sql`) |

> Owner 확정 #1: kbo_* 가 V1 폴더(`sql/`) 에 남은 이유 = 보류 중인 미완 작업. 모바일 리뉴얼 마무리 후 재진입 시 `sql/V2/kbo/` 로 이동 필요.

### dual pair

- V1↔V2 dual 없음. 신규 도메인 (V1 짝 없음)

## A.5 권한 / 가드

- 라우트 주석 처리. 운영 진입 0
- BE endpoint (`/api/kbo/matches/*`): permitAll
- ★ admin 짝 없음 (kbo 컨트롤러는 admin 없음 — `be-map.md ★ 모호 영역 #5`. 정상 추정)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| Owner 정책: legacy PC. **삭제 금지** | `fe-map.md ★ Owner 확정 #1` | 정리 라운드 (Owner 결정 #4) |
| Owner 확정 #1: kbo 도메인 자체 보류. kbocrol 미가동 → 운영 데이터 거의 0 | `db-map.md ★ Owner 확정 #1`, `be/dead-suspects.md G` | 동결 상태 |
| store 등록 (`kboReducer`) 상시 로딩 → 번들 사이즈 영향 | `fe/dead-suspects.md` 정리 권고 2 | 동적 import 검토 |
| `requestGetMatchDetail` thunk 정의만 dispatch 0건 | `fe/dead-suspects.md D` | 라우트 주석 자체로도 dead. 분류 C+D 중복 |
| ⚠ admin 짝 결손 (정상 추정) | `be-map.md ★ 모호 영역 #5` | 운영 도구 누락 여부 확인 |

## A.7 dead 항목 (이 도메인 안)

- Owner 정책상 **보존**. 라우트 주석 + thunk 살아있음. 정리 라운드에서 운명 결정
- ⚫ DEAD_BOTH: `requestGetMatchDetail` (thunk 정의만 + 라우트 주석)

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #4**: kbo 도메인 운명 — (A) 유지 / (B) 동적 import / (C) 폐기
- 모바일 리뉴얼 마무리 후 재진입 시점 결정
- kbocrol Python 크롤러 가동 정책 (외부 시스템 — 본 PRD 범위 외)
- DB 폴더 위치 정리 (V1 → sql/V2/kbo/ 이동) 시점

> **Part B 생략 / 보류 명시** — Owner 정책상 legacy PC + 신규 보류 도메인. 모바일 작업 대상 아님.

---

## B.1 기능 요구사항 (보류)

> Owner 정책: legacy PC + 신규 보류. Part B 는 재진입 결정 후 작성.

- (보류)

## B.2 신규 기능 (보류)

- (보류)

## B.3 우선순위 (보류)

## B.4 KPI / 성공지표 (보류)

## B.5 디자인 / Figma 참조 (보류)

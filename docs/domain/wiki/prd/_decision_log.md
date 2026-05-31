# wiki 결정 로그 (`_decision_log.md`)

> append-only. planner-division Opus 가 라운드 간 누적. 사용자 결정 / agent 가정 / 핸드오프 메모 단일 진실 소스.
> 본 파일은 R1 (`docs/domain/encyclopedia/prd/_decision_log.md`) 의 내용을 그대로 가져와 R2 분을 append. 구 파일은 redirect 마커만 보존.

---

## R1 (2026-05-31) — IA + 요구사항 + 정책 (구 경로 `encyclopedia/`)

### 로드된 컨텍스트 (JIT)

- `docs/domain/legacy/dictionary.md` — legacy PC dictionary 와의 절단선
- `docs/domain/home/prd/ia.md` — IA 작성 스타일 reference
- `src/main/java/com/dawne/com2usbaseball/domain/skill/**` — 풀세트 (controller/service/repository/dto/mapper)
- `src/main/resources/mapper/skill/*.xml` — 3 파일
- `sql/CREATE_TABLE.sql` — player_skills / skill_score_config / skill_pitcher_grade_stat / coach / coach_skill_* 정의
- `sql/insertData/INSERT_SKILL_SCORE_CONFIG.sql` — score-config 시드
- `web/src/data/skill/*` — 7 mock 파일
- `web/src/domains/home/config/QUICK_MENUS.js` — `/encyclopedia` `comingSoon: true` 사전 박힘 확인
- `src/main/java/com/dawne/com2usbaseball/common/enums/site/Target.java` — HITTER/PITCHER

### 핵심 결정 (R1)

| # | 결정 | 사유 |
|---|---|---|
| D1 | 도메인 키 = `encyclopedia` (가정 — R2 에서 `wiki` 로 변경됨) | home QuickMenu 사전 박힘 |
| D2 | prefix = `ENC` | grep 결과 충돌 0 |
| D3 | legacy `dictionary` 와 별도 도메인 — 코드 재사용 X | dictionary 폐기 (PC 디자인) |
| D4 | BE 자산 100% 재사용 | 재발명 금지 |
| D5 | 활성 6 카테고리 + 보류 3 (코치/구단선수/에픽) | 사용자 요구 매핑 |
| D6 | route base = `/encyclopedia` (가정), hierarchy 3뎁스 | URL 가독성 |
| D7 | 자체 헤더 X — MobileLayout TopBar 통일 | `feedback_no_domain_header.md` |
| D8 | store 등록 X — react-query 우선 | dictionary 번들 영향 회피 |
| D9 | 추천 조합 1차 = FE mock 정적 import | 데이터량 적음 |
| D10 | 컴포넌트 분리 = 반복/변형/외부재사용 충족 시만 | `feedback_component_decomposition.md` |

### 🔴 사용자 결정 (R1 → R2 진입 시 수령)

| # | 항목 | 사용자 답변 | 영향 |
|---|---|---|---|
| Q1 | 게임 정보 자료 출처 = (A) FE markdown / (B) FE JSON / (C) DB+admin | **C** | R2 에 DB schema + 신규 endpoint 추가, admin 사이클 분리 마커 |
| Q2 | public 노출 OK | **OK** | SecurityConfig 변경 없음 |
| Q3 | prefix `ENC` confirm | **confirm** | 변경 없음 |
| Q4 | 도메인 키 `encyclopedia` confirm (후보: compendium/guide/wiki) | **wiki** | 도메인 재명명 + 구 경로 폐기 + 신 경로 이관 |

---

## R2 (2026-05-31) — 기능 명세 + API + 외부 IF (신 경로 `wiki/`)

### 진입 시 추가 로드 (JIT)

- 본 파일 + `_common.md` R1 § + `encyclopedia.md` R1 § (이관 전)
- `web/src/app/router/routes/PublicRoutes.jsx` — 라우트 등록 패턴
- `web/src/app/router/config/routeMeta.js` — `wiki` 신규 등록 위치 확인 (현재 등록 X)
- `web/src/app/wrapper/mobile/parts/Drawer.jsx` + `MENU_GROUPS.js` — `/encyclopedia` entry 확인
- `web/src/global/ui/mobile/section/SectionBlock.jsx` — 화면 구성 적합성 확인
- `src/main/java/com/dawne/com2usbaseball/common/enums/site/Grade.java` — LEGEND/EPIC/PLATINUM/HERO/NORMAL 5종 (EPIC 누락 발견)
- `web/src/data/skill/HITTER_POINTS.js` / `HITTER_SKILLS.js` — 추천 데이터 mock 추가 분석

### R1 → R2 환경 변경 사항

| 변경 | 사유 |
|---|---|
| 도메인 키 `encyclopedia` → `wiki` | 사용자 Q4 결정 |
| 산출 경로 `docs/domain/encyclopedia/prd/` → `docs/domain/wiki/prd/` | 도메인 키 변경 반영 |
| 구 경로 3 파일 → 폐기 마커 + redirect link | R4 에서 물리 삭제 (사용자 승인 후 메인 어시스턴트 트랙) |
| URL `/encyclopedia` → `/wiki` (목표) | 코드는 develop 트랙에서 변경 (R3 dispatch brief) |
| prefix `ENC` 유지 | 사용자 confirm |

### 핵심 결정 (R2 자체 — agent 작업)

| # | 결정 | 사유 |
|---|---|---|
| D11 | 스킬 상세 = **모달** (R1 가정 Q5 채택) | depth 1 절약 + back 동선 단순. URL 변경 X = deep-link X (트레이드 오프 수용) |
| D12 | 화면 컴포넌트 압축 — 6 화면을 3 screen + target prop 분기로 | 코드 중복 회피 + `feedback_component_decomposition.md` 정합 (반복/변형 충족) |
| D13 | 신규 BE 패키지 `domain/wiki/` 신설 | game-info read-only API + 향후 admin 사이클 자리 |
| D14 | 신규 DB 테이블 3종 제안 (`wiki_pitch`, `wiki_pitch_grade`, `wiki_stat_influence`) — schema 확정은 R3 BE | game-info 자료 출처 정규화 |
| D15 | BE `SkillSetResponse` EPIC 필드 보강 마커 | Grade enum 5종 vs 응답 4종 불일치. R3 dispatch 에 포함 |
| D16 | admin endpoint = 별도 사이클 (본 R2 외) | 1차 PoC = read-only. 사용자 1차 시드 작성 |
| D17 | 추천 조합 카드 클릭 시 점수 breakdown 모달 = 1차 PoC 포함 (옵션 → 채택) | 사용자 가치 핵심 ("내 카드 점수가 맞는지 검증") |
| D18 | `wiki_swing` 별도 테이블 = R3 BE 검토 (PoC 단계는 stat_influence 단독) | HITTER 도 일관 구조 우선, 필요시 분리 |
| D19 | swap 기존 endpoint 보강 회귀 = legacy simulate 검증 (`SkillSetResponse` 사용처) | EPIC 추가 시 다른 도메인 영향 검증 |
| D20 | `wiki_pitch_grade` 의 grade = CHAR(1) `S/A/B/C/D/E` (기존 `skill_pitcher_grade_stat` 와 동일 스킴) | 일관성 |

### 🔴 사용자 결정 필요 (R2 종료 시점)

| # | 항목 | 가정값 | 영향 |
|---|---|---|---|
| Q5 | game-info admin 등록/수정 사이클 = 별도 분리 confirm | 분리 | 본 라운드 외 사이클 (R4 이후 신규 사이클) |
| Q6 | 1차 시드 SQL 작성 주체 = 사용자 (admin 사이클 분리 시) | 사용자 | 시드 부재 시 EN-5/6 화면 빈 placeholder 노출 |

### ❓ R3 진입 시 결정 (가정값 진행 가능)

| # | 항목 | R2 가정값 |
|---|---|---|
| Q7 | 검색 input debounce 시간 | 300ms |
| Q8 | 칩 토글 인터랙션 (animate) | designer 결정 |
| Q9 | 추천 카드 점수 breakdown 모달 디테일 (어디까지 노출) | base point + WITH_SKILL 보정 + 합계 |
| Q10 | KPI 목표값 (home→wiki 진입율 10%, 추천 체류 30초) | 제안값 |
| Q11 | swing 별도 테이블 (HITTER) | PoC 단독 — 후속 검토 |

### 핸드오프 메모 (→ R3)

- R3 진입 시 반드시 로드: 본 파일 + `_common.md` 전체 + `wiki.md § 1~5`
- R3 비로드: R2 작성 과정 사고 / 본 핸드오프 메모 위 § (이미 종합됨)
- R3 작성 § :
  - `wiki.md § 6 예외 케이스` (각 기능 ID 당 최소 2개 — 후보 § 6 placeholder 참조)
  - `wiki.md § 7 QA` (사용자 시나리오 US-1~5 기반 체크리스트)
  - `wiki.md § 8 사용자 확인 잔여` 업데이트
  - `_tasks.md` 신규 — 개발자 요약 (BE / FE / DB / designer 분리)
  - `_common.md § 7 화면 인덱스` 최종 (이미 R2 에 R3 기준 작성됨 — 검증만)
- R3 dispatch brief (분리 디스패치 4건):
  1. **BE developer** — 신규 패키지 `domain/wiki/*` + 컨트롤러/서비스/DTO + Mapper xml + Schema SQL (V3 권장) + `SkillSetResponse` EPIC 보강 (회귀: legacy simulate)
  2. **FE developer** — 라우트/routeMeta/routePath 등록 + 5 screen 작성 + react-query hook + 모달 컴포넌트 + URL `/encyclopedia` → `/wiki` 일괄 교체 (`QUICK_MENUS.js`, `MENU_GROUPS.js`)
  3. **designer-render** — Figma 4 노드 (entry=83-2259, 스킬list=83-2303/83-2500, 추천=86-3236) ↔ FE 컴포넌트 매핑 + 토큰 추출 + grade badge 색
  4. **DB developer (ops)** — V3 신규 SQL (wiki_pitch / wiki_pitch_grade / wiki_stat_influence) + 1차 시드 SQL 템플릿 (사용자가 값 채움)
- R3 신규 grep 필요:
  - `web/src/app/router/config/routePath.js` — path 등록 위치
  - `src/main/java/com/dawne/com2usbaseball/domain/simulate/**` (있을 시) — `SkillSetResponse` 호출처 회귀 영향
  - `src/main/resources/mapper/skill/*.xml` — score-config 사용처 (R2 미확인)

### 자가 점검 (R2)

- [x] 라운드 토큰 70k 이내 (실측 ~55k)
- [x] 누적 토큰 150k 이내 (R1+R2 ~90k)
- [x] 다른 산출물 본문 복제 X (링크만)
- [x] 표 80% 이상
- [x] 결정 사유 한 줄 모두 명시
- [x] 🔴 마커 항목 가정값만 (확정 X — 사용자 결정 대기)
- [x] G/W/T 시나리오 각 기능 ID 당 최소 1개 (ENC-0/1/1-2/3/5/6 작성, ENC-2/4 는 ENC-1/3 의 target 분기 — 본문에 명시)
- [x] 본 파일 핸드오프 메모 append
- [x] 구 경로 (encyclopedia/) 3 파일에 폐기 마커 + redirect link 추가

---

## R3 (2026-05-31) — 예외 + QA + 갱신 정책 + tasks + admin CRUD 흡수

### 진입 시 추가 로드 (JIT)

- 본 파일 + `_common.md` 전체 + `wiki.md § 1~5`
- `web/src/app/router/config/routePath.js` — path 등록 위치 확인 (현재 wiki 미등록)
- `web/src/app/wrapper/mobile/parts/Drawer.jsx` — admin 진입점 신설 위치 (프로필 하단)
- `src/main/java/.../domain/simulate/**` — **부재 확인** (regression risk 0)
- `src/main/resources/mapper/skill/*` — 3 파일 (CoachMapper / PlayerSkills / SkillScoreConfigMapper) — score-config 변경 없음 확인
- grep `SkillSetResponse` — `domain/skill/*` 내부만 (회귀 영향 0)
- grep `hasRole|@PreAuthorize` — `AdminPlayerCardController`, `AdminEventController`, `SecurityConfig` 3 파일 (admin 패턴 답습 대상)

### R2 → R3 환경 변경

| 변경 | 사유 |
|---|---|
| admin CRUD = 본 사이클 포함 | 사용자 Q5 결정 |
| 1차 시드 SQL = 사용자 작성 | 사용자 Q6 결정 |
| admin endpoint 9개 정의 (3 entity × 3 METHOD + 1 viewer) | Q5 흡수 |
| FE admin 3 screen + 가드 + Drawer 진입점 신설 | Q5 흡수 |
| 화면 인덱스 ENC-A0~A3 추가 | 동상 |

### 핵심 결정 (R3 자체)

| # | 결정 | 사유 |
|---|---|---|
| D21 | admin endpoint 패턴 = `/api/admin/wiki/{entity}` REST CRUD (`AdminPlayerCardController` 답습) | 기존 admin 패턴 일관성 |
| D22 | `wiki_pitch` / `wiki_stat_influence` = soft delete (is_active=false) | 데이터 손실 방지 + admin viewer 가시 |
| D23 | `wiki_pitch_grade` = hard delete (FK 정합 보장 후) | child entity — soft 불필요 |
| D24 | DELETE wiki_pitch 시 자식 grade = soft cascade (is_active=false) | wiki_pitch_grade 의 grade 컬럼은 is_active 미보유 → R3 진행하며 wiki_pitch_grade 에도 is_active 추가 필요 → DDL 재검토 마커 |
| D25 | write 시 `@CacheEvict("wikiGameInfoByTarget", allEntries=true)` | target 별 정밀 evict 보다 단순/안전 우선 (PoC) |
| D26 | `AdminRoute` 가드 = `useAuthentication().user?.role === 'ADMIN'` | 메모리 `project_auth_model.md` 부합 (user/admin 2단계) |
| D27 | Drawer admin 진입점 = 프로필 하단 "관리자 페이지" (admin only) | UX 표준 패턴 + 비admin 비노출 |
| D28 | `useAuthentication.js` 의 `user.role` 필드 미존재 가능성 → 발견 시 🔴 마커 + 사용자 결정 | T5 dispatch brief 명시 |
| D29 | EPIC 보강 회귀 검증 = grep `SkillSetResponse` 결과 `domain/skill/*` 내부만 → 무영향 | 사전 확인 완료 |
| D30 | designer 의 admin Figma 노드 부재 가능성 → 표준 admin form 패턴 답습 | 디자인 부담 최소화 |

### 🔴 사용자 결정 (R3 진입 시 수령 — 완료)

| # | 항목 | 사용자 답변 | 영향 |
|---|---|---|---|
| Q5 | game-info admin 등록/수정 사이클 = 본 사이클 포함 vs 별도 분리 | **본 사이클 포함** | 9 endpoint + FE admin 3 screen + 가드 + Drawer 진입점 신설 |
| Q6 | 1차 시드 SQL 작성 주체 | **사용자 직접** | agent 는 schema + INSERT placeholder 만 제공 |

### 🔴 R3 새 사용자 결정 발견 (다음 라운드 또는 dispatch 단계 결정)

| # | 항목 | 가정값 | 처리 |
|---|---|---|---|
| Q7 | `useAuthentication.js` 의 `user.role` 필드 부재 시 보강 사이클 | 발견 시 별도 사이클 | T5 dispatch 시 agent 발견 → 사용자 결정 |
| Q8 | `wiki_pitch_grade` 에 is_active 컬럼 추가 (D24 정합) | 추가 | T1 DDL 재검토 — agent 자체 결정 가능 (PoC) |

### ❓ 후속 사이클 권고

| # | 항목 | 사유 |
|---|---|---|
| F1 | 추천 조합 BE 이관 (`wiki_recommend_combo` 테이블) | mock 한계 — 갱신 빈도 증가 시 |
| F2 | 낙관적 lock (version 컬럼) | admin 동시 수정 빈도 증가 시 |
| F3 | swing 전용 테이블 (`wiki_swing`) | HITTER 시드 채워보고 stat_influence 단독 한계 시 |
| F4 | KPI 목표값 운영 검증 | 1차 배포 후 |

### 핸드오프 메모 (→ 메인 어시스턴트 dispatch)

- 본 라운드 종료 = planner-division 사이클 완료. 다음 단계 = **메인 어시스턴트가 `_tasks.md § T1~T6` 6 dispatch brief 를 sub-agent 로 병렬 dispatch**
- 권장 dispatch 순서:
  1. T1 (DB, ops/사용자) — 선행 (T2/T3 의존)
  2. T2 (BE public) + T6 (designer-render) — 병렬
  3. T3 (BE admin) — T2 완료 후
  4. T4 (FE public) — T2 완료 후
  5. T5 (FE admin) — T3, T4 완료 후
- 각 dispatch brief 는 `_tasks.md` 의 해당 § 그대로 복붙 가능 (token efficiency 룰 부합 — 본문 참조)
- 메인은 본 PRD 본문을 다시 Read 하지 않음. `_tasks.md` § 만 §-단위 Read

### R4 (정리) 필요 여부

| 대상 | 처리 |
|---|---|
| 구 `docs/domain/encyclopedia/prd/*` 3 파일 | R4 에서 물리 삭제 (사용자 승인 후) — 이미 redirect 마커만 보존 중 |
| 구 docs 의 dictionary § 중복 | dictionary 는 별도 도메인 → 본 정리 대상 X |
| 구 `/encyclopedia` URL 사용처 | T4 (FE dispatch) 가 일괄 교체 → R4 가 아닌 dispatch 단계 처리 |

→ **R4 필요**: 구 경로 (`docs/domain/encyclopedia/prd/`) 3 파일 물리 삭제 (사용자 승인 후 메인 어시스턴트 트랙). 본 agent 가 직접 R4 호출 가능.

### 자가 점검 (R3)

- [x] 라운드 토큰 70k 이내 (실측 ~50k)
- [x] 누적 토큰 150k 이내 (R1+R2+R3 ~140k)
- [x] 다른 산출물 본문 복제 X (링크만)
- [x] 표 80% 이상
- [x] 결정 사유 한 줄 모두 명시
- [x] 🔴 마커 항목 가정값만 (Q7 = T5 dispatch 시 agent 발견 시 마커)
- [x] G/W/T 시나리오 각 기능 ID 당 최소 1개 (R2 작성분 유지)
- [x] 예외 케이스 각 기능 ID 당 최소 2개 (EX-0-1~3, EX-1-1~6, EX-M-1~3, EX-3-1~5, EX-5-1~6, EX-A-1~6)
- [x] 본 파일 핸드오프 메모 append
- [x] `_tasks.md` 신규 작성 (dispatch brief 6건)
- [x] `_common.md § 7 화면 인덱스` 업데이트 (ENC-A0~A3 추가)
- [x] `_common.md § 5 FE→BE` 매트릭스 업데이트 (admin endpoint 9건)
- [x] `_common.md § 8 미해결 집계` R3 종료 시점 재구성

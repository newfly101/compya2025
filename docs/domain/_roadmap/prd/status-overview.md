# 프로젝트 현황 진단 + 로드맵 골격 (초안)

- 기준일: 2026-09-26 (코드·문서 실측, 브랜치 `v2.0.0-refactor-mobile`)
- 목적: 일정 수립 전, **무엇이 있고 무엇이 비었는지** 한 장으로 본다. 날짜는 사용자가 정한다 — 이 문서의 날짜 칸은 전부 `TBD`.
- 참고: [v1-mobile-gap.md](./v1-mobile-gap.md) · [2026-09-release-log.md](./2026-09-release-log.md) · [decisions-2026-08-31.md](./decisions-2026-08-31.md) · [test-docs-leftover.md](./test-docs-leftover.md)
- 범례: ✅ 완료 · 🟡 부분 · ❌ 없음 · ➖ 해당 없음(정적 화면 등)

---

## 1. 도메인 식별 — 목록끼리 어긋난 곳

### 1.1 네 군데 목록 대조

| 도메인 | CLAUDE.md § 10 | `docs/domain/*` | FE `web/src/domains/*` | BE `domain/*` | DB (`sql/V2`,`sql/V3`) |
|---|---|---|---|---|---|
| home | ✅ | ❌ | `home` | ➖ (집계) | ➖ |
| coupons | ✅ | ❌ | `coupons` | `coupon` | `site_coupons` |
| events | ✅ | ❌ | `events` | `event` | `site_events` |
| notices | ✅ | ❌ | `notices` | `notice` | `site_notices` |
| users | ✅ | `account` | `users` | `oauth` | `site_users`, `site_user_oauth_accounts` |
| authentication | ✅ | ❌ | `authentication` | `oauth` | `site_refresh_tokens` |
| quiz | ✅ | ❌ | `quiz` (관리자만) | `quiz` | `fun_quiz` |
| historyMode | ✅ | ❌ | `historyLegend` | `fun/historyMode` | `data_history_*` |
| community (동결) | ✅ | `community` | `community` | `community` | `site_post` 외 8 |
| admin | ✅ | `admin` | `admin` | `admin` | ➖ |
| legendStats | **누락** | ❌ | `legendStats` | `fun/legendStat`, `fun/legendCard` | `data_player_legend*` |
| mileage | **누락** | `mileage` | `mileage` | `fun/mileage` | (data_* 재사용) |
| players (선수 백과) | **누락** | ❌ (`_roadmap` 에 조사 2건) | `players` | `fun/playerCard` | `data_player_card*` |
| playerSkills (스킬 백과) | **"삭제됨"으로 표기** | ❌ | `playerSkills` | `fun/playerSkill` | `data_player_skill*` |
| odds (확률 공시) | **누락** | `odds` | `odds` (정적 데이터) | ❌ | ❌ |
| guides | **누락** | `guides` | `guides` (정적) | ❌ | ❌ |
| policy (약관 등) | **누락** | ❌ | `policy` | ❌ | ❌ |
| analytics | **누락** | `analytics` | `infra/analytics` | `analytics` | `site_user_event*` |
| statistics (후원 클릭) | **누락** | ❌ | `home/.../SupportSection` | `statistics` | `statistic_support_click` |
| gamification | **누락** | `gamification` | ❌ | ❌ | ❌ |

### 1.2 불일치 요약

| # | 종류 | 내용 | 근거 |
|---|---|---|---|
| M1 | 목록 누락 | CLAUDE.md 의 "살아있는 도메인" 10개에 실제 운영 중인 9개가 빠짐 (legendStats·mileage·players·playerSkills·odds·guides·policy·analytics·statistics) | `web/src/app/router/routes/PublicRoutes.jsx` |
| M2 | 잘못된 삭제 표기 | CLAUDE.md 는 `skill`(스킬 백과사전) 을 삭제 도메인으로 적었으나, 2026-09 `/skills` 로 **재오픈** 됨 | `2026-09-release-log.md` § 2, `ROUTE_PATHS.player_skills` |
| M3 | 문서만 있음 | `gamification` — 기획 4건, 코드 0 | `docs/domain/gamification/prd/` |
| M4 | 코드만 있음 | home·coupons·events·notices·authentication·historyMode·legendStats·playerSkills·policy 는 기획 폴더 없음 | `docs/domain/` 목록 |
| M5 | 이름 불일치 | 같은 도메인이 층마다 다른 이름: historyMode↔historyLegend / users↔oauth↔account / players↔playerCard / legendStats↔legendStat+legendCard / 복수형(FE)↔단수형(BE) | 위 표 |
| M6 | 경로 오기 | CLAUDE.md § 4 의 `sql/V2/{site,fun}/*.sql` 은 없는 경로. 실제는 `sql/V2/CREATE_0N_*` 평면 + `sql/V3/CREATE_0N_*` | `sql/V3/README.md` |
| M7 | 오래된 문서 | `v1-mobile-gap.md` 는 "퀴즈 관리 화면 없음", "wiki/kbo 제거 조사 중" 이라 적혀 있으나 이미 반영됨 (`f4b21eb` 퀴즈 관리, wiki/kbo 삭제) | `web/src/domains/quiz/mobile/admin/AdminQuizScreen.jsx` |
| M8 | 삭제 도메인 잔재 | 코드상 잔재 없음 (`coach` 는 레전드 재료 종류 `MaterialType.COACH` 로 무관) | `grep coach\|kbo\|wiki` |

---

## 2. 도메인별 현황 매트릭스

기획 = `docs/domain/{d}/prd` 또는 `_roadmap` · 디자인 = `docs/domain/{d}/design` 또는 Figma 링크 · 테스트 = `src/test/**`(FE 테스트는 전 도메인 0건)

| 도메인 | 기획(prd) | 디자인 | FE | BE | DB schema | 테스트 |
|---|---|---|---|---|---|---|
| home | ❌ 기준선 없음 (`v1-mobile-gap.md` § 4) | 🟡 전역 `DESIGN.md` 만 | ✅ `web/src/domains/home` | ➖ | ➖ | ❌ |
| coupons | 🟡 관리자 쪽만 (`admin/prd/admin-screens.md`) | 🟡 관리자만 (`admin/design`) | ✅ `domains/coupons` | ✅ `domain/coupon` | ✅ `sql/V2/CREATE_04_TABLE_SITE.sql` | ❌ |
| events | 🟡 관리자 쪽만 | 🟡 관리자만 | ✅ `domains/events` | ✅ `domain/event` | ✅ `CREATE_04_TABLE_SITE.sql` | ❌ |
| notices | 🟡 관리자 쪽만 | 🟡 관리자만 | ✅ `domains/notices` | ✅ `domain/notice` | ✅ `CREATE_04_TABLE_SITE.sql` | ❌ |
| users (마이페이지) | ✅ `account/prd/user-features-index.md` | ❌ | ✅ `domains/users` | ✅ `oauth/UserController` | ✅ `sql/V2/MIGRATE_user_restructure.sql` | ❌ |
| authentication | ❌ | ➖ | ✅ `domains/authentication` | ✅ `oauth/AuthController` | ✅ `sql/V3/CREATE_06_site_refresh_tokens.sql` | ❌ |
| quiz | 🟡 `v1-mobile-gap.md` § 2 뿐 | ❌ | 🟡 관리자 화면 + 홈 섹션, 공개 화면 없음 | ✅ `quiz/QuizController` | ✅ `sql/V3/CREATE_05_fun.sql` | ❌ |
| historyMode | ❌ | ❌ | ✅ `domains/historyLegend` | ✅ `fun/historyMode` | ✅ `sql/V3/CREATE_01_data_history_mode.sql` | ❌ |
| legendStats | 🟡 조사만 (`_roadmap/prd/player-name-stat-sheet-crosscheck.md`) | ❌ | ✅ `domains/legendStats` | ✅ `fun/legendStat` | ✅ `sql/V3/CREATE_02_data_player_legend.sql` | ❌ |
| mileage | ✅ `mileage/prd/` (6건) | 🟡 명세만, prd 폴더 안 (`design-spec-v2.md`) | 🟡 계산기 탭 서버 미연동 | ✅ `fun/mileage` | ➖ data_* 재사용 | ✅ `MileageMapperTest` |
| players | 🟡 조사만 (`_roadmap/prd/player-card-excel-db-fullscan.md`) | ❌ | 🟡 리스트형 작업 중 (미커밋 이력) | ✅ `fun/playerCard` | ✅ `sql/V3/CREATE_03_data_player_card.sql` | ✅ `PlayerCardMapperTest` |
| playerSkills | ❌ | ❌ | ✅ `domains/playerSkills` | ✅ `fun/playerSkill` | ✅ `sql/V3/CREATE_04_data_player_skill.sql` | ✅ `PlayerSkillMapperTest` |
| odds | ✅ `odds/prd/odds-mobile-plan.md` | ❌ | ✅ 정적 (`web/src/data/odds`) | ➖ | ➖ | ❌ |
| guides | ✅ `guides/prd/guides-content-plan.md` | ❌ | ✅ `domains/guides` | ➖ | ➖ | ❌ |
| policy | 🟡 결정 기록만 (`decisions-2026-08-31.md`) | ❌ | ✅ `domains/policy` | ➖ | ➖ | ❌ |
| community | ✅ `community/prd/community-status.md` | ❌ | 🟡 읽기 전용 | ✅ 컨트롤러 14개 | ✅ `CREATE_04_TABLE_SITE.sql` | ❌ |
| admin | ✅ `admin/prd/` (12건) | ✅ `admin/design/` (6건) | ✅ `domains/admin` (셸+탭) | ✅ `domain/admin` + `Admin*Controller` | ➖ | ❌ |
| analytics | ✅ `analytics/prd/user-event-tracking.md` | ➖ | ✅ `web/src/infra/analytics` | ✅ `domain/analytics` | ✅ `sql/V3/CREATE_07_site_user_event.sql` | ✅ `AnalyticsEventGuardTest` |
| statistics | ❌ | ❌ | 🟡 홈 후원 섹션 | ✅ `domain/statistics` | ✅ `sql/V3/CREATE_08_*` | ❌ |
| gamification | ✅ `gamification/prd/` (4건) | ❌ | ❌ | ❌ | ❌ | ❌ |
| 스킬 시뮬레이터 | ❌ (보류) | ❌ | ❌ (`comingSoon`) | ❌ | ❌ | ❌ |

**숫자로 보기** (➖ 제외, 21행)

| 열 | ✅ | 🟡 | ❌ |
|---|---|---|---|
| 기획 | 8 | 7 | 6 |
| 디자인 | 1 | 5 | 13 |
| FE | 14 | 5 | 2 |
| 테스트 | 4 | 0 | 17 |

- **Figma 링크**: `docs/domain/**` 전체에 `figma.com` URL **0건**. Figma 원본 파일이 문서 어디에도 연결돼 있지 않다.

---

## 3. 프로젝트 구조 — 트랙 → agent → skill/command/workflow

- agent 는 `.claude/agents/*.md` (`_deprecated_/` 제외). skill 은 agent 본문에 명시 참조가 없어 **이름 접두사 기준**으로 연결했다.
- 점선 = 폐기되었거나 폐기 agent 를 부르는 연결 (정비 대상).

```mermaid
flowchart LR
  subgraph T["트랙"]
    TP["planner"]
    TD["designer"]
    TV["develop"]
    TO["ops"]
  end

  subgraph A["agents"]
    PL["planner-lite (sonnet)"]
    PD["planner-division (opus)"]
    DR["designer-render (sonnet)"]
    DV["designer-review (sonnet)"]
    DA["developer-analyze (sonnet)"]
    BE["backend-developer (sonnet)"]
    FE["frontend-developer (sonnet)"]
    DI["developer-integrate (opus)"]
    OPSX["전용 agent 없음"]
  end

  subgraph S["skills"]
    SP["planner/ia, requirements, feature-spec, endpoint-spec-draft, edge-cases, policy-draft, qa-checklist"]
    SDA["designer/analyze"]
    SDP["designer/plugin-code (폐기)"]
    SV["developer/analyze, dispatch-plan, integrate-review"]
  end

  subgraph C["commands / workflows"]
    C1["/auto-create-content"]
    C2["/code-to-design"]
    W1["workflows/multi-feature-parallel"]
    DEP["_deprecated_: planner, designer, developer"]
  end

  TP --> PL
  TP --> PD
  TD --> DR
  TD --> DV
  TV --> DA
  TV --> BE
  TV --> FE
  TV --> DI
  TO --> OPSX

  PL --> SP
  PD --> SP
  DR --> SDA
  DV --> SDA
  DR -.-> SDP
  DA --> SV
  DI --> SV

  C1 --> BE
  C1 --> FE
  W1 --> PL
  W1 --> PD
  W1 --> DR
  W1 --> DA
  W1 --> BE
  W1 --> FE
  W1 --> DI
  C2 -.-> DEP
  C1 -.-> DEP
```

| 관찰 | 근거 |
|---|---|
| ops 트랙에 agent·skill·가이드가 하나도 없다 | CLAUDE.md § 10 "⏳ ops 미작성" |
| `/code-to-design` 이 폐기 agent(`planner`/`designer`/`developer`) 를 `subagent_type` 으로 부른다 | `.claude/commands/code-to-design.md` |
| `/auto-create-content` 도 기획·디자인·분석 단계를 폐기 agent(`planner`/`designer`/`developer`)로 부른다 — 현행 agent 는 BE/FE 단계만 | `.claude/commands/auto-create-content.md` |
| 현행 agent 풀을 끝까지 잇는 흐름은 `workflows/multi-feature-parallel` 하나뿐 (`designer-review` 는 어디서도 호출 안 됨) | `.claude/workflows/multi-feature-parallel.md` |
| `designer/plugin-code` skill 은 "폐기 — 호출 금지" 인데 파일이 남아 있다 | `.claude/skills/designer/plugin-code/SKILL.md` |
| 로드맵·일정을 다루는 agent/skill 이 없다 (planner skill 7개는 모두 기능 단위) | `.claude/skills/planner/*` |

---

## 4. 공백 분석 — 로드맵 수립을 막는 것

| 우선 | 공백 | 왜 막는가 | 해소 산출물 | 트랙 |
|---|---|---|---|---|
| P0 | 일정·마일스톤 문서 없음 | 버전·기한·완료 기준이 어디에도 없다. `_roadmap/prd/` 는 조사·기록뿐 | `_roadmap/prd/roadmap.md` (본 문서 § 5 를 확정본으로) | planner |
| P0 | 도메인 정본 목록 불일치 (M1·M2·M5) | agent 가 CLAUDE.md 를 믿고 "스킬 백과사전은 삭제됨" 같은 틀린 전제로 일한다 | CLAUDE.md § 10 갱신 + 도메인 이름 대응표 | ops(메타) |
| P0 | 보류·미결 항목 결정 대기 | 스킬 시뮬레이터 / 커뮤니티 쓰기 / 로그인 전용 선수카드 / 업적(gamification) / 마이페이지 재기획 — 어느 것이 다음인지 정해지지 않았다 | 결정 기록 1건 | 사용자 |
| P1 | 운영 중 도메인 9개에 기획 문서 없음 (M4) | 현재 동작이 곧 사양. 개선 범위·완료 조건을 적을 기준선이 없다 | 도메인별 `prd/ia.md` (reverse 모드) | planner |
| P1 | 디자인 문서·Figma 링크 부재 | admin 외엔 디자인 산출물 0, Figma URL 0건 → designer 트랙 착수 불가 | Figma 정본 URL + 도메인별 `design/*.md` | designer |
| P1 | ops 가이드 미작성 | BE 배포가 수동(`deploy-be.yml` 은 `workflow_dispatch` 만), 운영 설정 파일(`application-prod.properties`)이 리포에 없음 — 위치 확인 필요 | `docs/convention/ops.md` | ops |
| P1 | 테스트 공백 | BE 매퍼 테스트 4건, FE 0건. 회귀 기준이 없어 Phase 3 완료 조건을 못 건다 | 도메인별 최소 테스트 기준 | develop |
| P2 | 진행 중 작업의 끝이 없음 | 선수 백과사전 리스트형 · 마일리지 계산기 서버 연동 · 퀴즈 공개 화면 · 이벤트 타입 선택 UI · 재활성화 안내 | 각 항목 완료 조건 | planner/develop |
| P2 | 오래된 문서 (M7) · 폐기 agent 호출 (§ 3) | 잘못된 현황이 다시 인용된다 | 문서 갱신, command 수정 | ops(메타) |
| P3 | 이름 체계 통일 (M5) | 검색·자동화에서 누락이 생긴다. 당장 막지는 않음 | 이름 대응표만 먼저 | develop |
| P3 | 광고(AdSense) 승인 이후 작업 | `ADS_ENABLED=false` 상태 — 승인 결과 대기 | `docs/convention/adsense.md` 후속 | ops |

---

## 5. 로드맵 골격 (제안)

날짜 칸은 전부 `TBD` — 사용자가 채운다. 각 Phase 는 앞 Phase 의 완료 조건을 입력으로 쓴다.

```mermaid
flowchart LR
  P0["Phase 0 기반 정비"] --> P1["Phase 1 기획 확정"]
  P1 --> P2["Phase 2 디자인"]
  P2 --> P3["Phase 3 구현"]
  P3 --> P4["Phase 4 운영"]
  P4 -. "지표 피드백" .-> P1
```

### Phase 0 — 기반 정비 · 시작 `TBD` · 종료 `TBD`

| 대상 | 산출물 | 완료 조건 |
|---|---|---|
| 전역 | CLAUDE.md § 4·§ 10 갱신 (도메인 19개 정본, SQL 경로) | § 1.1 표와 CLAUDE.md 목록이 일치 |
| 전역 | 도메인 이름 대응표 (FE / BE / docs / DB) | M5 전 항목 한 줄씩 매핑 |
| `.claude` | `/code-to-design`·`/auto-create-content` 의 폐기 agent 호출 교체, `plugin-code` 정리 | `_deprecated_` agent 호출 0건 |
| `_roadmap` | `v1-mobile-gap.md` 현행화 또는 "보관" 표시 | M7 해소 |
| ops | `docs/convention/ops.md` (배포·환경·설정 위치·보안) | 수동 배포 절차를 문서만 보고 재현 가능 |

### Phase 1 — 기획 확정 · 시작 `TBD` · 종료 `TBD`

| 대상 | 산출물 | 완료 조건 |
|---|---|---|
| 기획 없는 운영 도메인 (home·coupons·events·notices·authentication·historyMode·legendStats·playerSkills·policy) | `docs/domain/{d}/prd/ia.md` (reverse) | 도메인마다 화면·시나리오·우선순위 1장 |
| 진행 중 (players·mileage·quiz) | `requirements.md` + 완료 조건 | 남은 작업이 체크리스트로 닫힘 |
| 보류 후보 (시뮬레이터·커뮤니티 쓰기·로그인 전용 카드·gamification·마이페이지) | 우선순위 결정 기록 + 선택된 것만 `feature-spec.md` | 다음 구현 대상 1~2개 확정 |
| 전역 | `_roadmap/prd/roadmap.md` (버전·마일스톤) | 날짜 또는 버전 단위가 확정 |

### Phase 2 — 디자인 · 시작 `TBD` · 종료 `TBD`

| 대상 | 산출물 | 완료 조건 |
|---|---|---|
| 전역 | Figma 정본 파일 URL 기록, `DESIGN.md` 토큰 ↔ Figma 변수 대조 | 토큰 불일치 0 또는 목록화 |
| Phase 1 확정 도메인 | `docs/domain/{d}/design/*.md` + Figma 화면 | 기획 화면 전부에 Figma 프레임 대응 |
| 운영 중 도메인 | design-sync 보고서 (코드 ↔ Figma) | 차이 목록 + 수정 여부 결정 |

### Phase 3 — 구현 · 시작 `TBD` · 종료 `TBD`

| 대상 | 산출물 | 완료 조건 |
|---|---|---|
| 진행 중 마무리 | 선수 백과 리스트형, 마일리지 계산기 서버 연동, 퀴즈 공개 화면, 이벤트 타입 UI, 재활성화 안내 | 각 Phase 1 체크리스트 전부 ✅ |
| Phase 1 선택 신규 기능 | BE·FE·DB 코드 (`/auto-create-content` 흐름) | developer-integrate 정합 보고 mismatch 0 |
| 테스트 | 도메인별 최소 테스트 (BE 매퍼·서비스, FE 주요 화면) | 합의한 최소 기준 충족 |

### Phase 4 — 운영 · 시작 `TBD` · 종료 `TBD`

| 대상 | 산출물 | 완료 조건 |
|---|---|---|
| 배포 | 배포 체크리스트, 롤백 절차 | 문서대로 배포·롤백 1회 성공 |
| 지표 | analytics 이벤트 기반 도메인별 사용량 보고 | 다음 Phase 1 우선순위 입력으로 사용 |
| 수익·정책 | 광고 승인 후 활성화, 정책 페이지 갱신일 | `ADS_ENABLED` 결정 기록 |

---

## 6. 도구 후보 매핑 (연결 안 함 — 후보만)

정체가 불확실한 도구는 추측하지 않고 `확인 필요` 로 둔다.

| 도구 | 종류 | 알려진 용도 | 쓰일 Phase | 트랙 | 비고 |
|---|---|---|---|---|---|
| figma | MCP | 디자인 읽기·쓰기, design-sync | 2, 3 | designer | **연결됨**. 단 정본 파일 URL 미기록 (§ 4 P1) |
| playwright | MCP | 브라우저 자동화 — 화면 E2E, 스크린샷 | 3, 4 | develop, designer | FE 테스트 0건 공백을 채울 1순위 후보 |
| mobbin | MCP | 앱·웹 UI 레퍼런스 라이브러리 | 1, 2 | designer, planner | MCP 제공 형태는 확인 필요 |
| refero | MCP | UI 레퍼런스 라이브러리 | 2 | designer | MCP 제공 형태는 확인 필요 |
| nicelydone | MCP | UI 레퍼런스(플로우) 사이트로 알려짐 | 2 | designer | 확인 필요 |
| layweb | MCP | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 |
| inspoAI | MCP | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 |
| impeccable | skill | 디자인 품질 가이드 (`PRODUCT.md`·`DESIGN.md` 형식) | 0, 2 | designer | `PRODUCT.md` 에 `impeccable:product-schema` 표식 — 이미 쓴 흔적 있음 |
| taste | skill | 확인 필요 | 확인 필요 | designer 추정 | 확인 필요 |
| emilkowalski | skill | 확인 필요 (인물명 — 인터랙션·애니메이션 관련일 가능성) | 2, 3 추정 | designer, develop | 확인 필요 |
| 포니테일 | 플러그인 | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 |
| 옴니라우트 | 플러그인 | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 |
| 그래피파이 | 플러그인 | 확인 필요 (코드베이스 지식 그래프 도구일 가능성) | 0 추정 | ops 추정 | 확인 필요 |
| archify | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 | 확인 필요 |

**Phase 별 묶음 (현재 확인된 것만)**

| Phase | 도구 |
|---|---|
| 0 기반 정비 | impeccable (PRODUCT/DESIGN 현행화) |
| 1 기획 | mobbin (경쟁·레퍼런스 흐름 조사) |
| 2 디자인 | figma · mobbin · refero · impeccable |
| 3 구현 | figma (design-sync) · playwright |
| 4 운영 | playwright (배포 후 스모크 테스트) |

---

## 7. 사용자 결정 필요

1. **로드맵 단위** — 날짜 마일스톤 / 버전(v2.1, v2.2 …) / 주차 중 무엇으로 끊을까?
2. **다음 구현 대상** — 스킬 시뮬레이터 · 커뮤니티 쓰기 · 로그인 전용 선수카드 · 업적(gamification) · 마이페이지 재기획 중 Phase 3 의 첫 1~2개는?
3. **도메인 정본** — CLAUDE.md § 10 을 § 1.1 의 19개로 갱신할까? 이름 기준은 FE 폴더명 / BE 패키지명 / docs 폴더명 중 어느 쪽?
4. **Figma 정본** — 기준으로 삼을 Figma 파일 URL 은? (현재 문서에 0건)
5. **미확인 도구** — layweb · inspoAI · taste · emilkowalski · 포니테일 · 옴니라우트 · 그래피파이 · archify 의 링크 또는 한 줄 설명.

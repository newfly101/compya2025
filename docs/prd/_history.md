# PRD 작업 히스토리

> docs/prd/domains/*.md 와 관련된 모든 작업 (IA 확정, wireframe 생성, design-sync, 코드 반영, 폐기) 을 누적 추적.
> 새 항목은 **표 위쪽에 추가** (최신이 위). 시간순 역정렬.

---

## 표기 규칙

### 컬럼

| 컬럼 | 의미 |
|---|---|
| **Date** | 작업 일자 (YYYY-MM-DD) |
| **Domain** | 대상 도메인 (예: coupons, mobile). cross-domain 작업은 `_cross` 또는 다중 도메인 콤마 구분 |
| **Type** | 작업 종류 (아래 표기) |
| **Action** | 한 줄 요약 |
| **Files Changed** | 변경 / 추가 / 삭제 파일 (path 명시) |
| **Impact** | 영향 범위 (라우트, 컴포넌트, BE endpoint 등 — Part A cite 가능하면 cite) |
| **Commit** | 관련 git commit 해시 (있다면) |
| **By** | 수행 주체 (`agent: prd-ia-interactive` / `manual` / `agent: prd-design-sync` 등) |
| **Notes** | 추가 메모 (Owner 결정 사유, follow-up 항목 등) |

### Type 분류

| Type | 의미 |
|---|---|
| `IA-CONFIRM` | prd-ia-interactive 가 Part B 확정 (`docs/prd/domains/{domain}.md` Edit) |
| `WIREFRAME` | prd-wireframe-generator 가 화면기획서 생성/갱신 (`docs/prd/wireframes/{domain}.md`) |
| `DESIGN-SYNC` | prd-design-sync 가 figma↔코드 갭 분석 산출 (`docs/prd/design-sync/{domain}.md`) |
| `CODE` | 도메인 관련 실제 코드 변경 (web/, src/main/, sql/) |
| `DEPRECATE` | 폐기 작업 (코드 삭제 + PRD 파일 삭제 등). 사유 + 영향 명시 필수 |
| `OWNER-DECISION` | ★ Owner 결정 5건 중 하나 확정 (또는 보류 → 결정 전환) |
| `RUNTIME-VERIFY` | runtime-analyzer 결과로 Part A 사실 보강 (예: row 수 검증 결과 반영) |
| `REVERT` | 이전 작업 되돌림 |
| `MIGRATE` | 폴더 구조 / 파일 이동 (예: home 을 표준 패턴으로 정렬) |

### Files Changed 표기 컨벤션

- `+ path/to/file.md` — 신규 파일
- `~ path/to/file.md` — 수정 파일
- `- path/to/file.md` — 삭제 파일
- 동일 도메인 다수 변경 시 `path/to/dir/*` 약식 허용 (단 무엇이 바뀌었는지 Action / Notes 에 풀어 쓸 것)

### Impact 표기 컨벤션

- 라우트: `route: /coupons`
- 컴포넌트: `component: CouponScreen.jsx`
- BE endpoint: `endpoint: GET /api/coupons`
- DB 테이블: `table: site_coupons`
- 다중 도메인 영향: `cross-domain: home, community`
- 영향 없음: `none`

---

## 갱신 주체별 룰

### Agent 자동 갱신
- `prd-ia-interactive`: Part B Edit 후 종료 보고 직전에 본 파일 상단 표에 `IA-CONFIRM` row append
- `prd-wireframe-generator`: 산출물 Write 후 `WIREFRAME` row append
- `prd-design-sync`: 산출물 Write 후 `DESIGN-SYNC` row append
- 각 agent 가 본 파일에 직접 append. 표 헤더는 절대 변경 X — row 만 위쪽에 삽입

### 수동 갱신 (사용자 또는 어시스턴트)
- 코드 변경 / 폐기 / Owner 결정 / runtime 검증 / migration 은 작업 직후 사용자 또는 어시스턴트가 본 파일에 추가
- commit 해시는 commit 후 갱신 권장 (빈 칸 → 후속 채움 OK)

---

## 작업 히스토리 (최신이 위)

| Date | Domain | Type | Action | Files Changed | Impact | Commit | By | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-05-09 | mobile | DEPRECATE | `domains/mobile/` 폴더 + `MobileHomePage` 통째 폐기 + PRD 파일 제거 (Owner 결정 #3 → ✅ 즉시 폐기 채택) | `- web/src/domains/mobile/**` (17 파일: MobileHomePage.jsx + 8 컴포넌트 jsx/scss), `- docs/prd/domains/mobile.md` | route: 영향 없음 (HomeScreen 이 활성 진입), component: MobileHomePage 등 dead chain 17건, import 0건 (`fe/dead-suspects.md A`, `dead-confirmed.md 1-A`) | (대기) | manual | "도메인 아닌 dead 더미 폴더라 삭제, 기능이 아님" — Owner 명시. Part B 작성 없이 도메인 자체 제거 |
| 2026-05-09 | _meta | INIT | PRD 작업 히스토리 추적 문서 신설 + 3개 PRD agent 에 history append 의무 추가 | `+ docs/prd/_history.md`, `~ .claude/agents/prd-ia-interactive.md`, `~ .claude/agents/prd-wireframe-generator.md`, `~ .claude/agents/prd-design-sync.md` | none (메타 문서) | (대기) | manual | 본 표는 PRD 도메인 작업 시작 전 baseline. 향후 모든 도메인 작업 누적 |

---

## Type 별 최근 작업 빠른 인덱스

각 Type 마지막 N 건 빠른 참조용. 누적 표가 길어지면 빠른 스캔 위해 갱신.

### 최근 IA-CONFIRM
- (없음 — 도메인 작업 시작 전)

### 최근 WIREFRAME
- (없음)

### 최근 DESIGN-SYNC
- (없음)

### 최근 DEPRECATE
- 2026-05-09 — mobile 도메인 통째 폐기 (`web/src/domains/mobile/**` + `docs/prd/domains/mobile.md`). Owner 결정 #3 ✅ (A) 즉시 폐기 채택

### 최근 OWNER-DECISION
- 2026-05-09 — 결정 #3 ✅ (A) 즉시 폐기. `domains/mobile/` 통째 제거. 잔여 4건 미결

---

## ★ Owner 결정 5건 추적

`docs/prd/_overview.md § 8` 의 5건 결정 상태. 결정 시 `OWNER-DECISION` row 추가 + 본 섹션도 갱신.

| # | 결정 항목 | 차단성 | 분산 도메인 | 상태 | 결정일 | 결정 내용 |
|---:|---|---|---|---|---|---|
| 1 | coupon dual-write 정책 | 🔥 admin coupon 차단 | coupons | ☐ 미결 | — | runtime row 수 검증 후 결정 예정 |
| 2 | contact ↔ discipline 컬럼 의미 | 🔥 모바일 player_card 차단 | playerCard | ☐ 미결 | — | Owner 도메인 의도 명확화 필요 |
| 3 | MobileHomePage / domains/mobile/ 폐기 | ◐ 직접 차단 X | mobile (주), home | ✅ 결정 | 2026-05-09 | (A) 즉시 폐기. `domains/mobile/` 폴더 + `mobile.md` PRD 통째 제거 완료 |
| 4 | legacy PC 도메인 운명 | ◐ 정리 라운드 | dictionary, simulate, kbo | ☐ 미결 | — | 정리 라운드까지 보류 OK |
| 5 | V2 통폐합 진입 시점 | ⚠ figma 결과 따라 | playerCard (주), coupons | ☐ 미결 | — | figma 도착 시 결정 |

> 결정 시 row 의 상태를 ✅ 로 변경 + 결정일 / 결정 내용 채우고, 누적 표에도 `OWNER-DECISION` 별도 row 추가.

---

## 도메인별 진척도 스냅샷

각 도메인의 PRD pipeline 진행 상태. agent 가 작업 완료 시 갱신 의무.

| Domain | Part A | Part B (IA) | Wireframe | Design-Sync | 코드 반영 | 폐기 |
|---|---|---|---|---|---|---|
| home | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| community | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| coupons (★ 표준) | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| events (★ 표준) | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| notices | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| historyMode | ✅ baseline | ☐ | ☐ | n/a (mock-only) | — | — |
| profile | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| authentication | ✅ baseline | ☐ | n/a (인프라성) | n/a | — | — |
| quiz | ✅ baseline | ☐ | ☐ | ☐ | — | — |
| playerCard | ✅ baseline | ☐ (figma 도착 시) | ☐ | ☐ | — | — |
| admin | ✅ baseline | ☐ | n/a (PC 어드민) | n/a | — | — |
| dictionary | ✅ baseline | 보류 (legacy PC) | n/a | n/a | — | — |
| simulate | ✅ baseline | 보류 (legacy PC) | n/a | n/a | — | — |
| kbo | ✅ baseline | 보류 (legacy PC + 신규 보류) | n/a | n/a | — | — |
| mobile | ✅ baseline (제거됨) | n/a (폐기 완료) | n/a | n/a | ✅ 2026-05-09 | ✅ 2026-05-09 |

### 진척도 마커

- ✅ 완료
- ☐ 미진행 / 대기
- 🔄 진행 중
- n/a 해당 없음 (도메인 분류상)
- 보류 (Owner 정책)

> 도메인 작업 완료 시 해당 셀을 ✅ 로 갱신 + 누적 표에 row 추가. 폐기 시 도메인 row 자체는 본 표에서 삭제 X (히스토리 보존 — 마지막 컬럼 폐기 ✅ 표시).

# 도메인: historyMode

## A.1 현재 상태

- **분류**: **mock-only** (BE 미연동, 100% 정적 import)
- **모바일 전환 진척도**: 모바일 전용 (`mobile/` 만 존재). 메모상 리뉴얼 완료. 토큰 scss 분리됨 (`fe-map.md` 행 45)
- 폴더 구조:
  ```
  domains/historyMode/
  └── mobile/
      ├── HistoryModeScreen.jsx
      ├── components/{chip, stageCard}/
      └── hooks/useHistoryMode.js
  ```
- store/Redux 사용 없음 (`fe/state-and-data.md:25` — historyMode 슬라이스 자체가 store 에 없음)

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| HistoryModePage → HistoryModeScreen | `/mode/history` | `web/src/domains/historyMode/mobile/HistoryModeScreen.jsx` | 모바일 단일 | mock-only. filterSection (Chip×N), summary, StageCard×N, detail |

> 참고: `PublicRoutes.jsx` 내 주석된 구 `mode/history` 라우트는 `LegendCalendar` (lazy import 자체가 주석, 파일 미존재 추정) — 현재 활성 라우트는 모바일 `HistoryModeScreen`. (`fe/routes-and-screens.md:68`)

## A.3 API 엔드포인트

### BE 노출

해당 도메인의 BE 엔드포인트 **없음**.

### FE 호출

- 호출 없음. mock 만 사용.

| 사용 mock | 위치 |
|---|---|
| `LegendMeta.js` | `web/src/data/historyMode/LegendMeta.js` ↔ `useHistoryMode.js:4` |
| `LegendStuff.js` | `web/src/data/historyMode/LegendStuff.js` ↔ `useHistoryMode.js:3` |

### 매칭 결과

- 매칭됨: 0건 (BE 없음 — mock 단독)
- FE 만 호출: 0
- BE 만 노출: 0

## A.4 DB 테이블 + Mapper

해당 도메인의 DB 테이블 **없음**. mock 단독.

## A.5 권한 / 가드

- 라우트 `/mode/history` permitAll (라우터 단 가드 없음)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| mock-only 화면 — figma-spec-validator 가 BE schema 와 정합성 검증할 base 없음 (`risk-and-priority.md #10`) | `fe/state-and-data.md:100` | ⚠ figma-spec-validator 단계에서 mock 으로 운영 OK 결론. 향후 dictionary BE 와 연결 결정 시 별도 라운드 |
| 메모상 리뉴얼 완료 — 모바일 4 상태 단일 화면 구조, 데이터 모델·도메인 로컬 토큰 정리 (사용자 메모 `project_history_mode_mobile`) | 사용자 메모 | 안정 (우선순위 낮음) |

## A.7 dead 항목 (이 도메인 안)

- `web/src/data/HistoryMode.js` (대문자 H, 단수) — import 0건 dead. 실제 사용 데이터는 `data/historyMode/` (소문자, 폴더) — `fe/dead-suspects.md A`

## A.8 ★ Owner 결정 필요 (도메인 한정)

- 향후 BE 연동 필요성 (현재 보류 OK, mock 운영 안정)

---

## B.1 도메인 정의 (v1, 2026-05-09 background 모드 확정)

- **분류 (A.1 cite)**: **mock-only** — BE 엔드포인트 0건 (A.3) / DB 테이블 0건 (A.4) / Redux 슬라이스 없음 (A.1)
- **모바일 단일 화면 구조**: `HistoryModeScreen.jsx` 1 파일이 4 가지 상태 분기를 모두 인라인 처리 (memory `project_history_mode_mobile` 정합)
  - 상태 1: 초기 (검색 + 포지션 chip + 구단 chip + EmptyState)
  - 상태 2: 구단 선택 후 (+ 레전드 chip 행 노출 — `showLegendRow = teamFilter !== "all"`)
  - 상태 3: 선수 선택 (+ LegendSummaryCard + StageList + 세션 EmptyState)
  - 상태 4: 스테이지 선택 (SearchFilterSection → CompactSearchBar 전환 + StageDetailCard)
- **글로벌 TopBar 사용** (memory `feedback_no_domain_header`): `MobileLayout` home variant 그대로. 도메인 자체 헤더·뒤로가기 버튼 없음
- **컴포넌트 분해 정책** (memory `feedback_component_decomposition`): 반복 렌더되는 `Chip` (포지션·구단·레전드 3 위치 변형), `StageCard` (`allMatchedStages.map`) 만 별도 파일. summary / detail / empty / compactBar 등 1 회 사용 영역은 Screen 인라인 유지
- **데이터 소스**: `@/data/historyMode/LegendMeta.js`, `@/data/historyMode/LegendStuff.js` 정적 import (`useHistoryMode.js:2-3`)

## B.2 기능 / 작업 항목

> Part A.6 위험 + A.7 dead + memory 정책에서 도출된 task 만 등재. 임의 항목 추가 금지.

### P0 (모바일 리뉴얼 차단성)

해당 없음 — Part A.6 위험 2 건 모두 차단성 없음:
- 위험 1: figma-spec-validator BE schema 정합성 검증 base 없음 → "mock 운영 OK" 결론 (`risk-and-priority.md #10`). 향후 BE 연결 결정 시 별도 라운드
- 위험 2: 메모상 리뉴얼 완료 → 안정 (우선순위 낮음)

### P1 (다음 마일스톤 — 정합성 / dead 정리)

- [ ] **T1: dead 파일 제거 — `web/src/data/HistoryMode.js`** (대문자 H, 단수)
  - 출처: Part A.7 dead 항목 (`fe/dead-suspects.md A`)
  - 사용자 시나리오: (개발자) 신규 기여자가 `data/historyMode/` (소문자 폴더) 와 `data/HistoryMode.js` (대문자 단일 파일) 중 어느 것이 활성인지 헷갈리지 않도록 dead 단일 파일 제거
  - acceptance criteria:
    - `web/src/data/HistoryMode.js` 파일 삭제
    - 전체 코드베이스 grep `data/HistoryMode` 매치 0 건 (현재 0 건 — Grep 검증 완료)
    - import 변경 없음 (활성 데이터는 `@/data/historyMode/{LegendMeta,LegendStuff}.js` — 변동 없음)
  - 의존 API/테이블: 없음 (mock-only)
  - 의존 컴포넌트: 없음 (import 0 건)
  - 우선순위: P1
  - figma node: n/a (코드 정리)

### P2 (보류)

해당 없음.

## B.3 신규 기능

해당 없음 — mock-only 분류로 BE 도입 전까지 신규 화면·API·테이블 정의하지 않음. 향후 BE dictionary 연결 결정 시 별도 라운드 (Part A.6 위험 1 cite).

## B.4 KPI / 성공지표

측정 안 함 (mock-only — 실제 사용자 행동 / 정확도 / 응답시간 KPI 정의 보류). BE 도입 시점에 재정의.

## B.5 디자인 / Figma 참조

- **Figma 파일**: `https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/컴프야펀` (memory `project_history_mode_mobile` cite)
- **4 화면 노드** (단일 페이지 4 상태 — memory cite):
  - `18-1908` 초기 — 검색 + 포지션·구단 chip + EmptyState (B.1 상태 1)
  - `18-1949` 구단 선택 후 — 레전드 chip 행 노출 (B.1 상태 2)
  - `66-544` 선수 선택 — LegendSummaryCard + StageList + 세션 EmptyState (B.1 상태 3)
  - `66-688` 스테이지 선택 — CompactSearchBar 전환 + StageDetailCard (B.1 상태 4)
- **wireframe-generator 단계**: 위 4 노드 → 상태 분기 wireframe 1 본 합성 (mock-only 라 단일 화면 4 상태 wireframe)
- **design-sync 단계**: **보류** — mock-only 분류로 BE 노출 schema 가 없어 figma-spec-validator 가 정합성 검증할 base 없음 (A.6 위험 1). BE 도입 시점에 재실행

## B.6 Cross-domain 영향

- **글로벌 `MobileLayout` TopBar 의존** (memory `feedback_no_domain_header`): home variant 햄버거 + 컴프야펀 로고로 navigation 일원화. `useSetTopBar({ variant: "page", title })` 호출 안 함
- **진입점**: Home 의 SectionBlock `to` 링크 또는 직접 URL `/mode/history` (Part A.2)
- **이탈**: 글로벌 TopBar 햄버거 (Drawer) / 로고 클릭 (→ Home)

## B.7 후속 작업 (별도 라운드)

- **BE 도입 시점**: dictionary 시스템 BE 연결 결정 (현재 보류 OK — A.6 위험 1, A.8 Owner 결정). 결정 시:
  - LegendMeta / LegendStuff 의 BE schema 정의 → mapper / DTO / endpoint 추가
  - 본 PRD `Part B` 재작성 라운드 (P0/P1 task 신설)
  - design-sync 재실행 (figma-spec-validator base 확보)
- **figma 작업자 actionable 갱신 명세**: 본 라운드는 mock-only 라 design-sync 보류 — figma 측 갱신 요청 항목 정리도 BE 도입 후

## B.8 Owner 결정 해소 기록

- **memory `project_history_mode_mobile` 사용자 확정 사항** (2026-05-07):
  - ✅ 4 상태 단일 화면 구조 (별도 페이지 분리 X)
  - ✅ 글로벌 `MobileLayout` TopBar 사용 (도메인 자체 헤더 X — `feedback_no_domain_header`)
  - ✅ 컴포넌트 분해 최소화 — Chip, StageCard 만 분리, 나머지 인라인 (`feedback_component_decomposition`)
  - ✅ Badge 시스템 회피 (구단 카운트는 chip 안 텍스트 결합 — `Chip.jsx` count prop 패턴)
  - ✅ 신규 글로벌 색상 추가 금지 — 4 종 도메인 로컬 토큰 (`historyMode.tokens.scss`) 으로 처리
  - ✅ Redux 미사용 — `useHistoryMode` hook 안에서 useState/useMemo 만 (정적 import 데이터 기반)
- **Part A.8 ★ Owner 결정 (도메인 한정)**: 향후 BE 연동 필요성 → **보류 (현재 mock 운영 안정)**. BE 도입 결정 시 별도 라운드 (B.7)

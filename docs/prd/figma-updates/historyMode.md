# historyMode Figma 갱신 명세서

> figma 작업자 actionable 명세 — 본 문서만 보고 figma 수정 가능하도록 정리.
> 입력: `docs/prd/wireframes/historyMode.md` (figma 매칭 결과 + figma 미반영 사항) + 사용자 제공 figma 3 frame (66-688 / 18-2516 / 66-652) MCP 직접 검증 (2026-05-09)
> 작성: 2026-05-09
> 작성 주체: manual (사용자 요청)

---

## 0. 메타

| 항목 | 값 |
|---|---|
| **도메인** | historyMode |
| **분류** | mock-only — BE 통신 없이 FE 단순 계산 로직 (사용자 재확인 2026-05-09) |
| **figma file** | `VCVQzOpSIpwpZw11gxG7N1` (컴프야펀) |
| **figma node (사용자 제공 3건)** | `66-688` (최종본 — 상태 4 스테이지 선택 완료), `18-2516` (EmptyState ⚾ 컴포넌트 frame), `66-652` (EmptyState 📋 컴포넌트 frame) |
| **figma URL** | <br>- 최종본: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=66-688<br>- EmptyState ⚾: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=18-2516<br>- EmptyState 📋: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=66-652 |
| **이전 라운드 4 frame (wireframe 매칭)** | `18-1908` (상태 1 초기), `18-1949` (상태 2 구단 선택), `66-544` (상태 3 선수 선택), `66-688` (상태 4 스테이지 선택) — 본 명세서는 이 4 frame 모두에 적용되는 정합 항목 포함 |
| **source-of-truth** | **코드** (사용자 명시 — "코드 = source of truth"). figma 가 코드 기준으로 갱신됨 |
| **코드 진입점** | `web/src/domains/historyMode/mobile/HistoryModeScreen.jsx` (단일 파일 4 상태 분기 인라인) |
| **코드 hook** | `web/src/domains/historyMode/mobile/hooks/useHistoryMode.js` (useState / useMemo 만 — Redux/BE 호출 0건) |
| **코드 sub-컴포넌트** | `Chip.jsx` (포지션·구단·레전드 3 위치 변형), `StageCard.jsx` (allMatchedStages.map 반복) — 그 외 sub 분리 없음 (memory `feedback_component_decomposition` 정합) |
| **데이터 소스** | `@/data/historyMode/LegendMeta.js`, `@/data/historyMode/LegendStuff.js` 정적 import (BE 통신 없음) |
| **연관 PRD scope** | `docs/prd/domains/historyMode.md` Part B v1 (B.1 / B.5 / B.7) — mock-only 분류, 4 상태 단일 화면, 글로벌 TopBar 통일, FE 단순 계산 로직 |
| **작성일** | 2026-05-09 |

### scope 기준 (본 명세서가 따르는 v1 IA)

- **포함**: SearchFilterSection (상태 1/2/3) + CompactSearchBar (상태 4 전환) + LegendSummaryCard + StageList (StageCard 반복) + StageDetailCard + EmptyState 2종 (⚾ 검색 안내 / 📋 세션 안내)
- **figma 에서 정리 대상**: `C / PageHeader` (도메인 헤더 — memory `feedback_no_domain_header` 정책 위반), v0.2.0 버전 텍스트, PlayerRow 선수명 표기 포맷 (apostrophe 누락)

### 사용자 정책 재확인 (2026-05-09)

- **BE 통신 없이 FE 단순 계산 로직**: useState/useMemo + 정적 mock import 만 (`useHistoryMode.js`). axios/fetch/dispatch 0건 grep 검증 완료
- **사용자 선택에 의한 화면 전환 (state machine)**: 4 상태 분기 = `(query, teamFilter, selectedStage)` 조합으로 단일 화면 안에서 분기 (별도 페이지 X)
- **컴포넌트 분해 최소화**: Chip + StageCard 만 별도 파일. SearchFilterSection / LegendSummaryCard / StageDetailCard / EmptyState / CompactSearchBar 등 1 회 사용 영역은 `HistoryModeScreen.jsx` 인라인 유지

---

## 1. figma 3 frame 역할 매핑 (사용자 제공 라운드)

| frame | 역할 | wireframe 매핑 (4 상태) | 비고 |
|---|---|---|---|
| `66-688` | **최종본 UI (사용자 명시)** — 상태 4 스테이지 선택 완료 (375×1079px) | 상태 4 (이전 라운드 매칭 그대로) | PageHeader / SearchBar(compact) / LegendSummaryCard / StageList ×3 (1 selected variant) / SDHdr / StageDetailCard. 신규 추가 frame 아님 — 이전 라운드 매칭 동일 |
| `18-2516` | **EmptyState ⚾ 컴포넌트 frame** (343×72px) | 상태 1 (`/mode/history` 초기) + 상태 2 (구단 선택 후 / 선수 미선택) 의 EmptyState 노드 | 사용자 선택 단계 화면 1 — figma 에서 EmptyState 를 단독 컴포넌트로 분리 정의. 이전 4 frame 안에서 referenced 되는 sub-frame 으로 보임 |
| `66-652` | **EmptyState 📋 컴포넌트 frame** (343×72px) | 상태 3 (선수 선택 후 / 스테이지 미선택) 의 SDHdr 하단 EmptyState 노드 | 사용자 선택 단계 화면 2 — figma 에서 EmptyState 를 단독 컴포넌트로 분리 정의 |

> 즉 `18-2516` / `66-652` 는 figma 에서 **EmptyState 컴포넌트의 단독 정의 frame** 으로 분리되어 있음. 이전 라운드 4 frame (`18-1908` / `18-1949` / `66-544`) 안에 instance 로 들어있던 EmptyState 가 별도 frame 으로도 존재하는 구조. 본 명세서는 4 frame + 2 EmptyState frame 모두에 동일 정합 항목 적용.

---

## 2. 우선순위 분류

| 우선순위 | 의미 | 본 명세 항목 |
|---|---|---|
| **P0 (블로킹)** | memory 정책 (`feedback_no_domain_header`) 또는 사용자 정책 (`코드 = SoT`) 직접 위반 — 즉시 정리 필수 | U1 (도메인 PageHeader 제거 — 4 frame 전체) |
| **P1 (정합)** | 코드 = source-of-truth 정합 — figma 가 코드와 어긋나서 디자인 검토 시 혼선 | U2 (PlayerRow 선수명 apostrophe 정합), U3 (v0.2.0 버전 텍스트 제거), U4 (StageList 선택 강조 variant 명시) |
| **P2 (일반)** | 메타데이터 보강 — 디자인 시스템 일관성 | U5 (EmptyState 컴포넌트 frame 의 부모 정합) |

> P0 1건, P1 3건, P2 1건 = 총 5건. 추가로 통일성 OK 5건 (3절) 은 figma 작업 불필요.

---

## 3. 수정 명세 (figma 작업자 actionable list)

### U1. 도메인 `C / PageHeader` 프레임 제거 (4 frame 전체)

| 항목 | 값 |
|---|---|
| 우선순위 | **P0 (블로킹 — memory 정책 위반)** |
| wireframe 출처 | `wireframes/historyMode.md § 4 figma 관찰사항` + `§ 7 figma 미반영 사항` |
| 대상 figma node | `66-689` (최종본 66-688 의 PageHeader). 동일 패턴이 `18-1908`, `18-1949`, `66-544` 4 frame 모두에 존재 |
| 위치 (Before) | 각 frame 의 (x=0, y=0, 375×52px) 위치에 `C / PageHeader` 프레임 — `←` (back arrow) + `히스토리모드 재료 탐색기` 타이틀 + (일부 frame) `v0.2.0` 버전 텍스트 |
| 변경 (After) | **4 frame 모두에서 `C / PageHeader` 프레임 통째 제거**. 그 자리에 글로벌 `MobileLayout > GlobalTopBar (home variant — 햄버거 + 컴프야펀 로고)` 프레임을 instance 로 배치 (다른 도메인 figma frame 과 동일 구조) |
| 사유 | 코드 `HistoryModeScreen.jsx` 는 도메인 자체 헤더를 0 건 렌더하지 않음 — 글로벌 `MobileLayout` 의 home variant TopBar 가 햄버거 + 컴프야펀 로고로 navigation 일원화 (memory `feedback_no_domain_header`). figma 처럼 `← + 히스토리모드 재료 탐색기` 도메인 헤더가 있으면 실제 구현과 시각 정렬 불일치 → 디자인 검토 시 잘못된 navigation 모델 전달 |
| 검증 | figma 4 frame (`18-1908`, `18-1949`, `66-544`, `66-688`) 모두 자식 노드 목록에 `C / PageHeader` 프레임 없음 확인. 글로벌 TopBar instance 가 (x=0, y=0) 위치에 배치됨 |

---

### U2. PlayerRow 선수명 표기 포맷 정합 (apostrophe 누락 수정)

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| 출처 | figma `66-688` `C / StageDetailCard` PlayerRow_0/1/2 (66:794, 66:799, 66:803) MCP 직접 검증 |
| 대상 figma node | `66:794` ("이종범92"), `66:799` ("박정태92"), `66:803` ("염종석92") + 동일 패턴이 `66-544` 의 PlayerRow 들에도 존재 가능 |
| 위치 (Before) | 선수명 + 연도 결합 텍스트 = `이종범92`, `박정태92`, `염종석92` (apostrophe 없음) |
| 변경 (After) | `이종범'92`, `박정태'92`, `염종석'92` (apostrophe `'` + 2자리 연도). 모든 PlayerRow + StageCard playerChip + LegendSummaryCard MatCard 의 선수명 표기를 동일 포맷으로 통일 |
| 사유 | 코드 `useHistoryMode.js:5` 의 `fmt(player, years) = ${player}'${String(years).slice(-2)}` 가 source-of-truth. 즉 모든 표시 위치에서 `선수명'YY` 포맷 사용. figma 의 일부 노드만 apostrophe 누락 — figma 내부 inconsistency (`66:714 = "이종운'92"` 는 정상, `66:794 = "이종범92"` 는 누락) |
| 검증 | figma 의 모든 "선수명+연도" 텍스트 노드에서 apostrophe `'` 가 선수명과 2자리 연도 사이에 존재. 4 frame + EmptyState frame 의 자식 노드 검색 시 누락 케이스 0 건 |

---

### U3. v0.2.0 버전 텍스트 제거 (관련 frame)

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| wireframe 출처 | `wireframes/historyMode.md § 7 figma 미반영 사항` |
| 대상 figma node | `18-1908`, `18-1949` 의 PageHeader 우측 (실제 노드 id 는 figma 작업자가 확인) — `66-688` 메타에는 v0.2.0 텍스트 미발견 (이미 정리됐을 수 있음 — 확인 필요) |
| 위치 (Before) | PageHeader 프레임 우측에 `v0.2.0` 텍스트 |
| 변경 (After) | 텍스트 노드 제거 (U1 PageHeader 제거 시 자동 해소되지만 별도 명시) |
| 사유 | 코드에 버전 텍스트 렌더링 0 건. 글로벌 TopBar 도 버전 표시 없음. figma 작업 시 자체 트래킹용으로 추정되나 실제 화면에 노출되지 않으므로 frame 외부 (예: 페이지 메타 description) 로 옮길 것 |
| 검증 | figma 4 frame 자식 노드 검색 시 "v0" 또는 "버전" 텍스트 0 건 |

---

### U4. StageCard 선택/비선택 variant 명시 분리

| 항목 | 값 |
|---|---|
| 우선순위 | **P1 (정합)** |
| 출처 | figma `66-688` 의 3 개 StageCard 노드 (66:737 selected / 66:752 default / 66:767 default) MCP 직접 검증 |
| 대상 figma node | `66:737` (StageCard selected variant), `66:752`, `66:767` (StageCard default variant) — `C / StageCard / compact` 컴포넌트 |
| 위치 (Before) | figma 에서 StageCard 가 단일 컴포넌트로 정의되어 있고 selected / default 표기는 인스턴스 단위로 색상만 다름. variant property 미정의 (`isSelected` 라는 boolean variant 없음) |
| 변경 (After) | `C / StageCard / compact` 에 `selected: boolean` variant 추가. <br>- `selected=false`: bg `#18141f` (`--color-bg-overlay`), border `rgba(255,255,255,0.06)` (`--color-border`), title color `rgba(255,255,255,0.6)` (`--color-text-secondary`), session chip bg `#272033` + color `rgba(255,255,255,0.38)` <br>- `selected=true`: bg `rgba(168,106,240,0.08)` (`--color-history-brand-alpha-08`), border `#a86af0` (`--color-brand`), title color `rgba(255,255,255,0.92)` + semibold (`--color-text-primary`), session chip bg `rgba(168,106,240,0.15)` + color `#a86af0` |
| 사유 | 코드 `StageCard.jsx` 는 단일 컴포넌트가 `isSelected` prop 으로 분기 — 한 파일 안에 selected / default 모두 처리. figma 도 동일 구조로 variant 분기 명시하면 디자인 시스템 정합성 + design-sync 단계에서 자동 매칭 가능 |
| 검증 | figma `C / StageCard / compact` 컴포넌트 properties 패널에 `selected: Boolean` variant 표시. 인스턴스 4 개 (66:737/66:752/66:767) 모두 variant 명시적 설정 (66:737=true, 나머지=false) |

---

### U5. EmptyState 컴포넌트 frame 의 부모 정합 (`18-2516`, `66-652`)

| 항목 | 값 |
|---|---|
| 우선순위 | **P2 (일반)** |
| 출처 | 사용자 제공 3 frame 중 2 건이 EmptyState 단독 frame — 의도 추정 검증 필요 |
| 대상 figma node | `18-2516` (⚾ EmptyState), `66-652` (📋 EmptyState) |
| 위치 (Before) | 두 frame 모두 `C / EmptyState` 라는 동일 이름 컴포넌트로 정의 (343×72px) — 단지 아이콘과 텍스트만 다름 |
| 변경 (After) | 두 frame 을 **단일 `C / EmptyState` 컴포넌트의 variant** 로 통합 (예: `variant: "search" | "session"`). <br>- `variant="search"`: ⚾ + "레전드 선수 이름을 검색하거나 하단의 레전드 칩을 클릭하세요" (상태 1/2 전용) <br>- `variant="session"`: 📋 + "스테이지를 선택하면 세션 상세 정보가 표시됩니다" (상태 3 전용) |
| 사유 | 코드 `HistoryModeScreen.jsx:170-186, 344-351` 는 동일 `<div className={styles.empty}>` 마크업을 3 위치에서 재사용 (icon + text 만 prop 으로 분기). figma 도 단일 컴포넌트 + variant 로 합치면 코드 구조 정합. 별도 frame 2 건은 인스턴스 stale 상태 |
| 검증 | figma `C / EmptyState` 컴포넌트 properties 패널에 `variant` 표시. `18-2516` / `66-652` 자체 frame 은 instance 로 변환 또는 archive |
| 주의 | 추가로 코드에는 **3 번째 EmptyState** 가 존재 — `hasQuery && !hasResults` 일 때 🔍 + "{query} 선수가 레전드 재료로 등장하는 세션이 없습니다" (검색 결과 없음 케이스, `HistoryModeScreen.jsx:179-186`). figma 에 **이 variant 도 추가** 필요 — 현재 figma 에 누락 |

---

## 4. 통일성 OK (수정 불필요 — 참조용)

figma MCP 검증 결과 코드와 일치하여 figma 작업 불필요한 항목:

| # | 항목 | 판정 |
|---|---|---|
| OK1 | LegendSummaryCard 토큰 (66:700) | bg `#1f1a29` (`--color-bg-card`) + border `rgba(255,255,255,0.12)` (`--color-border-strong`) + 상단 accent bar `#a86af0` 3px — 코드 `HistoryModeScreen.module.scss .summary` 와 일치 |
| OK2 | StageDetailCard 토큰 (66:785) | bg `#1f1a29` + border `rgba(255,255,255,0.12)` + SELECTED STAGE badge `bg rgba(168,106,240,0.15)` color `#a86af0` 8px bold — 코드 `.detail` 와 일치 |
| OK3 | PlayerRow_0 (target) variant (66:792) | bg `rgba(168,106,240,0.06)` (`--color-history-brand-alpha-06`) + border `rgba(168,106,240,0.15)` (`--color-brand-alpha-15`) + 40px height — 코드 `.playerRowTarget` 와 일치 |
| OK4 | StgHdr / SDHdr 섹션 헤더 (66:733/66:782) | 좌측 accent bar 3×12px `#a86af0` + 제목 12px semibold `rgba(255,255,255,0.92)` — 코드 `.sectionHead` 와 일치 |
| OK5 | EmptyState 텍스트 (18-2516, 66-652) | 텍스트 내용 코드와 정확히 일치 (`레전드 선수 이름을 검색하거나 하단의 레전드 칩을 클릭하세요` / `스테이지를 선택하면 세션 상세 정보가 표시됩니다`) |

---

## 5. 코드 = source-of-truth 검증 근거 (figma 작업자 참고)

본 명세서가 figma 를 코드 기준으로 갱신해야 한다고 판단한 핵심 정책:

### 5.1 사용자 명시 정책 (2026-05-09 재확인)

> **historyMode 컨텐츠는 BE 통신 없이 FE 단순 계산 로직으로 작동** + **사용자 선택 단계에 의해 화면 전환 (state machine 형태)**

→ 즉 4 상태는 `(query, teamFilter, selectedStage)` 3 변수의 조합으로 결정되며, 모든 분기는 정적 mock 위에서 동작. figma 도 별도 페이지 분리 없이 단일 화면 4 상태로 표현되어야 함 (현재 4 frame 분리는 figma 표현 편의일 뿐 — 실제 라우트 1 개).

### 5.2 BE 호출 0건 grep 검증

```
grep -r "axios|fetch\(|dispatch\(|useSelector|useDispatch|api\." web/src/domains/historyMode/
→ No matches found
```

### 5.3 memory 정책 정합 (3건 — 사용자 확정 사항)

- **`project_history_mode_mobile`**: 4 상태 단일 화면 구조 — `HistoryModeScreen.jsx` 1 파일 안에서 분기 (별도 페이지 X)
- **`feedback_no_domain_header`**: 도메인 자체 헤더 금지 — 글로벌 `MobileLayout` TopBar 통일 → U1 근거
- **`feedback_component_decomposition`**: 컴포넌트 분해 최소화 — Chip / StageCard 만 분리, 나머지 인라인 → figma 도 sub-frame 과분리 지양 권장 (참고)

---

## 6. 검증 방법 (figma 수정 후 재진행)

### 6.1 figma MCP 로 자기 검증

```
mcp__figma-dev-mode__get_metadata     (node-id=66-688) → C / PageHeader 자식 노드 0 건 확인
mcp__figma-dev-mode__get_metadata     (node-id=18-1908) → 동일 (PageHeader 제거 확인)
mcp__figma-dev-mode__get_metadata     (node-id=18-1949) → 동일
mcp__figma-dev-mode__get_metadata     (node-id=66-544)  → 동일
mcp__figma-dev-mode__get_design_context (node-id=66-688) → PlayerRow apostrophe 적용 확인 (U2)
mcp__figma-dev-mode__get_screenshot   (node-id=66-688) → 시각 결과 검토 (글로벌 TopBar instance + apostrophe)
```

각 U항목의 **검증** 컬럼을 기준으로 metadata 결과 대조.

### 6.2 design-sync 재진행 시점

본 도메인은 mock-only 분류로 design-sync 가 **현재 보류** 상태 (`docs/prd/domains/historyMode.md` § A.6 / § B.5 cite). BE dictionary 연결 결정 시점에 design-sync 재진행 — 그 시점에 본 명세서 적용 결과를 baseline 으로 figma-spec-validator 가 검증.

### 6.3 figma 작업자 → 어시스턴트 반환 형식

figma 수정 완료 보고 시 다음 형식으로 어시스턴트에 알림:

```
historyMode figma 갱신 완료. 적용 항목: U1, U2, U3 ...
미적용 항목: U4 (사유: ...)
design-sync 재진행 트리거 (BE 도입 후 별도 라운드).
```

---

## 7. 변경 이력

| 일자 | 작업 | 비고 |
|---|---|---|
| 2026-05-09 | 본 문서 신규 작성 | 사용자 제공 figma 3 frame (66-688 / 18-2516 / 66-652) MCP 직접 검증 → wireframe figma 미반영 사항과 합쳐 actionable 5건 정리 |

---

## 8. 참조

- IA 결정 (Part B v1): `docs/prd/domains/historyMode.md` § B.1 (4 상태 단일 화면), § B.5 (figma node 4건), § B.7 (design-sync 보류)
- wireframe: `docs/prd/wireframes/historyMode.md` § 3 (화면별 wireframe 4 상태), § 4 (figma 관찰사항 — 글로벌 TopBar 불일치), § 7 (figma 미반영 사항)
- 코드 진입점: `web/src/domains/historyMode/mobile/HistoryModeScreen.jsx`
- 코드 hook: `web/src/domains/historyMode/mobile/hooks/useHistoryMode.js`
- 코드 sub-컴포넌트: `web/src/domains/historyMode/mobile/components/{chip,stageCard}/`
- 코드 스타일: `web/src/domains/historyMode/mobile/HistoryModeScreen.module.scss` + 도메인 토큰 `historyMode.tokens.scss`
- 글로벌 표준 컴포넌트: `web/src/app/wrapper/mobile/MobileLayout.jsx` (글로벌 TopBar home variant)
- memory 정책: `project_history_mode_mobile`, `feedback_no_domain_header`, `feedback_component_decomposition`

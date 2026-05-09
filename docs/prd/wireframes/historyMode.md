# historyMode 화면기획서 (Wireframe)

> 입력: `docs/prd/domains/historyMode.md` Part B v1 + Figma MCP (메인 4 frame: 18-1908 / 18-1949 / 66-544 / 66-688 + EmptyState 컴포넌트 frame 2 건: 18-2516 / 66-652)
> 생성: prd-wireframe-generator
> 갱신: 2026-05-09 (figma 3 frame 추가 라운드 — 66-688 / 18-2516 / 66-652 MCP 직접 검증 + figma-updates 명세 5건 신설)

---

## 1. 도메인 컨텍스트 (Part A 요약 — read-only)

- **분류**: mock-only — BE 엔드포인트 0건 / DB 테이블 0건 / Redux 슬라이스 없음 (Part A.1)
- **활성 라우트**: `/mode/history` → `HistoryModeScreen.jsx` 단일 파일 (Part A.2)
- **모바일 전용**: `domains/historyMode/mobile/` 만 존재. PC 라우트 없음
- **알려진 위험 차단성** (Part A.6 cite):
  - figma-spec-validator BE schema 정합성 검증 base 없음 → "mock 운영 OK" 결론 (`risk-and-priority.md #10`) — 차단 아님
  - 메모상 리뉴얼 완료 (4 상태 단일 화면 / 글로벌 TopBar / 컴포넌트 분해 최소화) — 안정
- **dead 정리 대상**: `web/src/data/HistoryMode.js` (대문자 H, 단수) — import 0건 (Part A.7, T1 P1)

---

## 2. 기능 → 화면 매핑 (Part B → wireframe)

| 기능 (Part B) | 우선순위 | 매핑 화면 | 화면 상태 (state) | figma node |
|---|---|---|---|---|
| B.1 4 상태 단일 화면 — 상태 1 (초기) | P0 구조 | HistoryModeScreen | 초기: 검색 + 포지션/구단 chip + EmptyState | 18-1908 |
| B.1 4 상태 단일 화면 — 상태 2 (구단 선택 후) | P0 구조 | HistoryModeScreen | 구단 chip 활성화 + 레전드 chip 행 노출 | 18-1949 |
| B.1 4 상태 단일 화면 — 상태 3 (선수 선택 후) | P0 구조 | HistoryModeScreen | LegendSummaryCard + StageList + 세션 EmptyState | 66-544 |
| B.1 4 상태 단일 화면 — 상태 4 (스테이지 선택 완료) | P0 구조 | HistoryModeScreen | CompactSearchBar 전환 + StageDetailCard 노출 | 66-688 |
| B.2 T1 dead 파일 제거 | P1 | (코드 정리 — UI 무관) | n/a | n/a |

---

## 3. 화면별 wireframe

### 3.1 HistoryModeScreen — 단일 화면 4 상태 분기

- **라우트**: `/mode/history` (Part A.2 cite)
- **진입 컴포넌트**: `web/src/domains/historyMode/mobile/HistoryModeScreen.jsx`
- **figma 파일**: `https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/` (컴프야펀)
- **데이터 소스**:
  - mock: `web/src/data/historyMode/LegendMeta.js` (useHistoryMode.js:4 정적 import)
  - mock: `web/src/data/historyMode/LegendStuff.js` (useHistoryMode.js:3 정적 import)
  - API 없음 (mock-only — Part A.3)
- **상태 관리**: `useHistoryMode` hook 내부 `useState` / `useMemo` 만. Redux 없음 (Part A.1)
- **글로벌 TopBar**: `MobileLayout` home variant 그대로 — 햄버거 + 컴프야펀 로고. 도메인 자체 헤더 없음 (memory `feedback_no_domain_header`)
  - 주의: figma node 4건 모두 `C / PageHeader` 프레임이 존재하지만 이는 figma 표현용 레이아웃 참조. 실제 구현에서는 글로벌 MobileLayout TopBar 사용, 도메인 PageHeader 별도 생성 금지

---

#### 상태 1 — 초기 상태

- **figma node**: `18-1908` (375×319px)
- **figma 컴포넌트**: `C / PageHeader` (52px), `C / SearchFilterSection` (343×155px), `C / EmptyState` (343×72px)
- **레이아웃 (top → bottom)**:

```
[ MobileLayout GlobalTopBar (home variant — 햄버거 + 로고) ]
─────────────────────────────────────────────
[ C / SearchFilterSection ]
  └ SearchInput  (높이 36px)
      placeholder: "레전드 선수 이름 검색"  icon: 🔍  clear: ✕
  └ 포지션 행  (라벨 + Chip×3)
      - Chip: 전체 [selected=true, color=#a86af0]
      - Chip: 타자 [selected=false]
      - Chip: 투수 [selected=false]
  └ 구단 행  (라벨 + Chip×10, wrap)
      - Chip(52px×25px): KT {n} / 두산 {n} / LG {n} / NC {n} / 롯데 {n} /
        삼성 {n} / SSG {n} / 키움 {n} / 한화 {n} / KIA {n}
      각 chip 안 텍스트 = "구단명 카운트" 결합 (Badge 별도 시스템 X — B.8 cite)
─────────────────────────────────────────────
[ C / EmptyState ]
  icon: ⚾  text: "레전드 선수 이름을 검색하거나 하단의 레전드 칩을 클릭하세요"
```

- **상태 분기 조건**: `teamFilter === "all"` AND 검색어 없음 AND 선수 미선택
- **유저 액션**:
  - 포지션 Chip 탭 → `positionFilter` 변경 → chip selected 상태 전환 (해당 chip active)
  - 구단 Chip 탭 → `teamFilter` 변경 → 상태 2 로 전환 (레전드 chip 행 노출)
  - SearchInput 입력 → `searchQuery` 변경 → (쿼리 매칭 선수 있으면 상태 3 과 유사한 결과 노출)
- **acceptance criteria 매핑** (B.2 T1 제외 — 구조 관련):
  - [ ] EmptyState 가 아무 선택 없을 때 노출됨 (초기 진입 시 확인)
  - [ ] 포지션 chip 전체가 기본 selected
  - [ ] 구단 chip 에 카운트 수치가 포함된 텍스트 렌더링 (배지 분리 X)

---

#### 상태 2 — 구단 선택 후

- **figma node**: `18-1949` (375×385px)
- **figma 컴포넌트**: `C / PageHeader` (52px), `C / SearchFilterSection` (343×221px, 높이 확장), `C / EmptyState` (343×72px)
- **레이아웃 (top → bottom)**:

```
[ MobileLayout GlobalTopBar (home variant) ]
─────────────────────────────────────────────
[ C / SearchFilterSection (높이 증가 — 레전드 행 추가됨) ]
  └ SearchInput (상태 1 동일)
  └ 포지션 행 (상태 1 동일)
  └ 구단 행
      - 선택된 구단 chip: selected=true (active color #a86af0, bg rgba(168,106,240,0.15))
      - 예시: 롯데 [selected=true]
  └ 레전드 행 (신규 — showLegendRow = teamFilter !== "all")
      라벨: "레전드 :"
      Chip(52px×25px)×N: 해당 구단 레전드 선수명 (예: 박정태 / 손아섭 / 윤학길 / 이대호 / 전준호B / 최동원)
─────────────────────────────────────────────
[ C / EmptyState ]
  icon: ⚾  text: "레전드 선수 이름을 검색하거나 하단의 레전드 칩을 클릭하세요"
```

- **상태 분기 조건**: `teamFilter !== "all"` AND `selectedLegend === null`
- **유저 액션**:
  - 레전드 Chip 탭 → `selectedLegend` 설정 → 상태 3 으로 전환
  - 구단 Chip 재탭 (active → inactive) → `teamFilter = "all"` → 상태 1 복귀 + 레전드 행 숨김
  - 구단 Chip 다른 구단 탭 → `teamFilter` 변경 → 레전드 목록 갱신 유지
- **acceptance criteria 매핑**:
  - [ ] 구단 chip 선택 시 레전드 행이 SearchFilterSection 안에 추가 노출됨
  - [ ] 레전드 행의 chip 은 선택 구단의 LegendMeta 에서 필터링된 선수만 표시
  - [ ] EmptyState 는 레전드 미선택 상태에서 유지됨

---

#### 상태 3 — 선수 선택 후 (레전드 선택)

- **figma node**: `66-544` (375×1079px)
- **figma 컴포넌트**: `C / PageHeader` (52px), `C / SearchFilterSection` (343×221px), `C / LegendSummaryCard` (343×271px), `StgHdr` (375×36px), `C / StageCard / compact` ×N (343×105px), `SDHdr` (375×36px), `C / EmptyState` (343×72px)
- **레이아웃 (top → bottom)**:

```
[ MobileLayout GlobalTopBar (home variant) ]
─────────────────────────────────────────────
[ C / SearchFilterSection ]
  └ SearchInput: 선수명 입력 완료 상태 (예: "전준호")
  └ 포지션 행 (유지)
  └ 구단 행: 선택 구단 active 유지 (예: 롯데 [selected=true])
  └ 레전드 행: 선택 선수 chip active (예: 전준호B [selected=true, color=#a86af0])
─────────────────────────────────────────────
[ C / LegendSummaryCard ] (343×271px, bg #1f1a29, 상단 accent bar 3px #a86af0)
  상단 배지 행: "레전드 재료" badge + "총 N개 세션" badge (color=#a86af0)
  선수명 (20px bold): 전준호B
  구단·포지션 (12px): 롯데 자이언츠 · 타자
  divider
  "필요 재료 카드"  N종 (color=#a86af0, right-align)
  MatCard 목록 (bg #272033, rounded 5px, 24px height):
    1. 이종운'92          Day 4
    2. 이종범'11          Day 10
    3. 정수빈'19          Day 13
  divider
  DayRow: 📅 등장 Day    Day 4, Day 10, Day 13
  SesRow: 🎯 획득 세션 수    3개
─────────────────────────────────────────────
[ StgHdr ] (섹션 헤더 — 보라 accent bar 3px)
  "획득 가능 히스토리 스테이지"   N개 (right-align)
─────────────────────────────────────────────
[ C / StageCard / compact ] ×N (scrollable, allMatchedStages.map)
  StageCard 구조 (343×105px, bg #18141f):
    상단: Day{N} badge (bg #2e263c) + 세션{N} badge (bg #272033)
    제목: 히스토리 이벤트명 (12px, single-line ellipsis)
    메타: "Day{N} · 세션{N} · 재료 N종" (10px, muted)
    재료 chip 행: ⭐ {목표선수} (color=#a86af0) + 기타 선수 chip
─────────────────────────────────────────────
[ SDHdr ] (섹션 헤더 — 보라 accent bar 3px)
  "세션 상세 정보"
─────────────────────────────────────────────
[ C / EmptyState ] (세션 미선택 상태)
  icon: 📋  text: "스테이지를 선택하면 세션 상세 정보가 표시됩니다"
```

- **상태 분기 조건**: `selectedLegend !== null` AND `selectedStage === null`
- **유저 액션**:
  - StageCard 탭 → `selectedStage` 설정 → 상태 4 로 전환 (SDHdr 아래 EmptyState → StageDetailCard 교체)
  - 레전드 Chip 재탭 → `selectedLegend = null` → 상태 2 복귀 (LegendSummaryCard + StageList 숨김)
- **acceptance criteria 매핑**:
  - [ ] 선수 선택 시 LegendSummaryCard 가 SearchFilterSection 하단에 노출
  - [ ] StageList 가 LegendSummaryCard 아래 스크롤 영역에 렌더링
  - [ ] 세션 미선택 상태에서 SDHdr + EmptyState(📋) 가 StageList 하단에 노출

---

#### 상태 4 — 스테이지 선택 완료 (전체 플로우)

- **figma node**: `66-688` (375×1079px)
- **figma 컴포넌트**: `C / PageHeader` (52px), `SearchBar` (compact, 343×36px), `C / LegendSummaryCard` (343×271px), `StgHdr2` (375×36px), `C / StageCard / compact` ×N (선택 항목 active variant), `SDHdr` (375×36px), `C / StageDetailCard` (343×257px)
- **레이아웃 (top → bottom)**:

```
[ MobileLayout GlobalTopBar (home variant) ]
─────────────────────────────────────────────
[ SearchBar ] (compact — SearchFilterSection → CompactSearchBar 전환)
  bg #1f1a29, border rgba(255,255,255,0.12), height 36px
  내용: 🔍 {선수명} {구단·포지션} (compact 1줄 요약)  ✕
  — 클릭 시 SearchFilterSection 확장 복귀 (상태 3 방향)
─────────────────────────────────────────────
[ C / LegendSummaryCard ] (상태 3 동일 — 선수 요약 유지)
─────────────────────────────────────────────
[ StgHdr2 ] (섹션 헤더)
  "획득 가능 히스토리 스테이지"   N개
─────────────────────────────────────────────
[ C / StageCard / compact ] ×N
  선택된 StageCard: active variant
    bg: rgba(168,106,240,0.08), border: #a86af0 (선택 강조)
    세션 배지: color=#a86af0 (selected 표시)
    제목: 12px bold, text-rgba(255,255,255,0.92)
  미선택 StageCard: 상태 3 동일 스타일
─────────────────────────────────────────────
[ SDHdr ] (섹션 헤더)
  "세션 상세 정보"
─────────────────────────────────────────────
[ C / StageDetailCard ] (343×257px, bg #1f1a29, border rgba(255,255,255,0.12))
  상단 배지: "SELECTED STAGE" (bg rgba(168,106,240,0.15), text #a86af0, 8px bold)
  스테이지 제목: "Day{N} · 세션{N}" (15px bold)
  이벤트명: 1줄 (12px, ellipsis)
  divider
  "세션 재료 선수 목록" 라벨
  PlayerRow ×N (40px height):
    PlayerRow_0 (목표 재료): bg rgba(168,106,240,0.06), border rgba(168,106,240,0.15)
      — {레전드 요약명} ▶ {카드명+연도}   ⭐ 목표 (우측)
    PlayerRow_1~N (기타): bg 없음 (plain row)
      — {레전드 요약명} ▶ {카드명+연도}
```

- **상태 분기 조건**: `selectedLegend !== null` AND `selectedStage !== null`
- **유저 액션**:
  - CompactSearchBar 탭 → SearchFilterSection 확장 (상태 3 방향 전환)
  - CompactSearchBar ✕ 탭 → `selectedLegend = null`, `selectedStage = null` → 상태 1 또는 2 복귀
  - 다른 StageCard 탭 → `selectedStage` 변경 → StageDetailCard 내용 교체 (상태 4 유지)
  - 활성 StageCard 재탭 → `selectedStage = null` → EmptyState 복귀 (상태 3)
- **acceptance criteria 매핑**:
  - [ ] 스테이지 선택 시 SearchFilterSection → CompactSearchBar 전환 (1줄 요약 형태)
  - [ ] 선택된 StageCard 에 active variant 적용 (border #a86af0 + bg rgba(168,106,240,0.08))
  - [ ] StageDetailCard 가 SDHdr 하단에 노출되고 PlayerRow 목록 렌더링
  - [ ] PlayerRow_0 (목표 재료) 는 purple accent 하이라이트 적용

---

## 4. figma 관찰사항 — 글로벌 TopBar 불일치 (중요)

> figma 4개 frame 모두 `C / PageHeader` 프레임을 포함하며 ← 뒤로가기, "히스토리모드 재료 탐색기" 타이틀, v0.2.0 버전 텍스트를 포함한다.
> 이는 figma 에서 단독 화면 문서화용 헤더이며, **실제 구현에서는 사용하지 않는다.**
> 실제 구현: `MobileLayout` 의 글로벌 TopBar home variant (memory `feedback_no_domain_header` 정책 cite).
> **design-sync 시점에 figma 작업자에게 도메인 PageHeader 제거 요청 필요** (figma 미반영 사항 — 6절 참조).

---

## 5. 컴포넌트 재사용 매핑 (이미 구현된 부분)

| 컴포넌트 | historyMode 매핑 | 위치 | 재사용 여부 |
|---|---|---|---|
| `Chip` | 포지션·구단·레전드 3위치 변형 — 단일 파일 `selected` prop으로 스타일 분기 | `domains/historyMode/mobile/components/chip/Chip.jsx` | 이미 구현 (분리됨) |
| `StageCard` | `allMatchedStages.map` 반복 렌더 — compact variant | `domains/historyMode/mobile/components/stageCard/StageCard.jsx` | 이미 구현 (분리됨) |
| `MobileLayout` TopBar | 도메인 진입 공통 — home variant | `web/src/app/wrapper/mobile/MobileLayout.jsx` | 글로벌 재사용 |

> **컴포넌트 분해 정책** (memory `feedback_component_decomposition`):
> Chip + StageCard 만 별도 파일. 나머지 (SearchFilterSection, LegendSummaryCard, StageDetailCard, EmptyState, CompactSearchBar 등) 는 `HistoryModeScreen.jsx` 인라인 유지. 1회 사용 영역이므로 별도 파일 분리 금지.

**표준 패턴 (coupons / events) 컴포넌트 비교** (`_overview.md § 1.3` 표준 패턴):

| 표준 컴포넌트 | historyMode 매핑 여부 |
|---|---|
| `CouponCard` / `EventCard` | 해당 없음 (StageCard 가 독자 패턴) |
| `SectionBlock` (섹션 구획) | StgHdr / SDHdr 가 섹션 헤더 역할 — 단 accent bar 3px 구현은 historyMode 도메인 로컬 (표준 SectionBlock 과 다름) |
| `LabelBadge`, `Chip` | Chip 은 historyMode 도메인 로컬 Chip.jsx 사용 — 글로벌 Chip 있다면 통합 검토 대상 (design-sync 보류) |

---

## 6. 신규 컴포넌트 (없음 — 기존 구현 완료)

> 4 상태 단일 화면 구조 및 컴포넌트 분해 정책에 따라 신규 컴포넌트 추가 없음.
> `HistoryModeScreen.jsx` 인라인으로 모든 상태 처리. Chip + StageCard 이미 별도 파일로 구현됨.

없음.

---

## 7. figma 미반영 사항

| 항목 | 내용 | design-sync 요청 여부 |
|---|---|---|
| 도메인 PageHeader 프레임 | figma 4개 frame 모두 `C / PageHeader` (← + 타이틀 + 버전) 포함 — 실제 구현은 글로벌 TopBar 사용 (memory `feedback_no_domain_header`) | BE 도입 후 design-sync 시 figma 작업자에게 PageHeader 제거 요청 — **2026-05-09 figma-updates 명세 U1 으로 별도 분리** (`docs/prd/figma-updates/historyMode.md`) |
| v0.2.0 버전 텍스트 | figma 18-1908 / 18-1949 의 PageHeader 우측에 "v0.2.0" 텍스트 — 실제 구현 불필요 | figma 갱신 대상 (design-sync 보류) — **U3** |
| PlayerRow 선수명 apostrophe 누락 | figma `66-688` 의 PlayerRow_0/1/2 (66:794/66:799/66:803) 가 `이종범92` / `박정태92` / `염종석92` 로 apostrophe 없음. 코드 `useHistoryMode.js:5` `fmt(player, years) = ${player}'${YY}` 가 source-of-truth → figma 내부 inconsistency (`66:714 = 이종운'92` 는 정상) | figma 갱신 대상 — **U2** |
| StageCard selected variant 미정의 | figma `C / StageCard / compact` 컴포넌트가 selected 인스턴스 (66:737) / default 인스턴스 (66:752/66:767) 분기를 색상만 다르게 표현. variant property 미정의 — 코드 `StageCard.jsx` 는 `isSelected` prop 단일 컴포넌트 분기 | figma 갱신 대상 — **U4** |
| EmptyState 컴포넌트 단일화 | figma 에 `18-2516` (⚾) / `66-652` (📋) 가 별도 frame 으로 정의 — 코드 `HistoryModeScreen.jsx` 는 동일 마크업 3 위치 재사용 (3 번째: `🔍 검색 결과 없음` 케이스 figma 누락) | figma 갱신 대상 — **U5** |

### 7.1 figma 사용자 제공 3 frame 매핑 (2026-05-09 추가 라운드)

| frame | 역할 | wireframe 매핑 |
|---|---|---|
| `66-688` | 최종본 UI (사용자 명시) — 상태 4 스테이지 선택 완료 | 상태 4 (이전 라운드와 동일) |
| `18-2516` | EmptyState ⚾ 컴포넌트 frame (343×72px) | 상태 1/2 의 EmptyState 노드 단독 정의 |
| `66-652` | EmptyState 📋 컴포넌트 frame (343×72px) | 상태 3 의 SDHdr 하단 EmptyState 단독 정의 |

> 사용자 정책 재확인 (2026-05-09): **historyMode 컨텐츠는 BE 통신 없이 FE 단순 계산 로직으로 작동** + **사용자 선택 단계에 의해 화면 전환 (state machine 형태)**. 즉 18-2516 / 66-652 는 신규 상태가 아니라 기존 4 상태 안의 EmptyState 컴포넌트가 figma 에서 단독 frame 으로 분리된 것. wireframe 4 상태 매핑은 변동 없음.

### 7.2 figma 갱신 명세서 (별도 분리)

본 wireframe 의 § 4 + § 7 에서 도출된 figma 갱신 항목은 figma 작업자용 actionable 명세서로 별도 분리:

- **`docs/prd/figma-updates/historyMode.md`** (2026-05-09 신설)
- 갱신 항목 5건 (P0×1 / P1×3 / P2×1) — U1 ~ U5
- 검증 방법 + figma MCP 자기 검증 가이드 포함
- 본 도메인은 mock-only 라 design-sync 재진행은 BE 도입 후 (B.7 cite). figma 갱신은 그 사이에 진행 가능

---

## 8. design-sync 입력

- **도메인 분류**: mock-only (Part A.1 cite)
- **현재 구현 상태**: 모바일 전용 구현 완료 (메모 `project_history_mode_mobile` — 안정). BE 없음.
- **design-sync 진행 여부**: **보류**
  - mock-only 분류 — BE 노출 schema 없어 figma-spec-validator 가 정합성 검증할 base 없음 (Part A.6 위험 1 cite, `risk-and-priority.md #10`)
  - BE dictionary 연결 결정 후 별도 라운드 (Part B.5, B.7 cite)
- **design-sync 재진행 트리거**: BE 연결 결정 (Part B.7 / A.8 Owner 결정 보류 해소 시점)
- **design-sync 입력 예약 (재진행 시)**:

| 화면 | 라우트 | figma node | 비고 |
|---|---|---|---|
| HistoryModeScreen 상태 1 | `/mode/history` | 18-1908 | 초기 상태 |
| HistoryModeScreen 상태 2 | `/mode/history` | 18-1949 | 구단 선택 후 |
| HistoryModeScreen 상태 3 | `/mode/history` | 66-544 | 선수 선택 후 |
| HistoryModeScreen 상태 4 | `/mode/history` | 66-688 | 스테이지 선택 완료 |

> 재진행 시 figma 갱신 요청 항목: C / PageHeader 제거 (도메인 헤더 → 글로벌 TopBar 정렬), v0.2.0 버전 텍스트 제거

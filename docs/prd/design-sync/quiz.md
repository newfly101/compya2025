# quiz Design Sync (Figma vs 실제 구현 비교)

> 입력:
> - `docs/prd/wireframes/quiz.md` (wireframe + figma node 매핑)
> - `docs/prd/domains/quiz.md` Part A.2 (실제 구현 컴포넌트 위치)
> - Figma MCP node-id=2:34 (get_metadata / get_design_context / get_screenshot)
> 생성: prd-design-sync
> 갱신: 2026-05-09

---

## 1. 비교 대상 매핑

| 화면 | 라우트 | figma node | 실제 구현 컴포넌트 |
|---|---|---|---|
| HomeScreen > QuizSection | `/` (섹션 내부) | `2:34` (Quiz Section frame) | `web/src/domains/home/components/section/quiz/QuizSection.jsx` (L1-24) |

- **Figma frame 크기**: 375x251px (iPhone 375 기준)
- **Figma 내 하위 구조** (get_metadata 결과):
  - `2:35` Rectangle — 섹션 제목 좌측 accent bar (3x13px, x=16, y=18)
  - `2:36` text "컴프야 퀴즈 888회 정답" — 섹션 제목 (x=25, y=16, 13px)
  - `2:38` QuizCard frame (x=16, y=42, 343x186px, border-radius=10px)
    - `5:2` Rectangle — 카드 배경 (#1f1a29)
    - `17:1310` 퀴즈 이미지 — 400x185px overflow (카드 너비 초과)
    - `5:3`, `5:4` — empty state placeholder (hidden=true)
  - `8:4` 안내문 text (x=16, y=232, 10px)

---

## 2. 컴포넌트 단위 비교

### 2.1 HomeScreen > QuizSection vs figma node 2:34

#### figma 측 (MCP get_design_context 결과 — node 2:34)

- **섹션 제목 영역** (node 2:35 + 2:36):
  - accent bar: `#a86af0` (brand-purple), 3x13px, border-radius 2px, left=16px
  - 제목 텍스트: `"컴프야 퀴즈 888회 정답"`, font-size 13px, font-weight semibold, color `rgba(255,255,255,0.92)`, left=25px
  - 제목은 figma frame 내에 직접 포함 (SectionBlock 바깥이 아닌 Quiz Section frame 내부)
- **QuizCard** (node 2:38):
  - 위치: left=16px, top=42px (섹션 frame 기준)
  - 크기: 343x186px → aspect-ratio 계산: 343/186 ≒ 1.844 (약 16/8.68, 16:9 아님)
  - border: `rgba(255,255,255,0.12)` (`border-strong` 토큰)
  - border-radius: 10px
  - 배경: `#1f1a29` (`--color-bg-card`)
  - overflow: clip
  - 이미지: 400x185px (카드 너비 343px 초과 — full-bleed overflow 의도)
- **안내문** (node 8:4):
  - text: `"※ 매주 금요일에 신규 퀴즈가 등장합니다. 보상은 목요일까지 수령해주세요."`
  - font-size: 10px, font-weight: regular, color: `rgba(255,255,255,0.6)` (`text-secondary`)
  - left=16px, top=232px, width=342px
- **empty state** (node 5:3, 5:4): hidden=true — 스크린샷에서 보이지 않음 (loaded 상태 기준)

#### 실제 구현 측

- **컴포넌트 트리** (depth 2-3):
  - `HomeScreen.jsx:46-49` — `SectionBlock` wrapping `QuizSection`
    - `SectionBlock` (`web/src/global/ui/mobile/section/SectionBlock.jsx:5`) — title prop 전달
      - `SectionHeader` (`SectionBlock.jsx:3`) — 제목 + accent bar 렌더
    - `QuizSection.jsx:4` — quiz prop = null (현재 mock)
      - `<div className={styles.quizCard}>` (L7)
        - loaded: `<img src={quiz.imageUrl} />` (L9)
        - empty: `<div className={styles.empty}>` (L11-14)
      - `<p className={styles.quizNotice}>` (L17)

- **import 출처**:
  - `SectionBlock`: `@/global/ui/mobile/section/SectionBlock.jsx` — 글로벌 표준 재사용
  - `QuizSection.module.scss`: 도메인 자체 스타일

- **현재 title 값**: `MOCK_QUIZ.round` 로부터 `"컴프야 퀴즈 ${MOCK_QUIZ.round}회 정답"` (HomeScreen.jsx:47) — mock 의존

#### 갭 분석

| # | 항목 | figma (node 2:34) | 실제 구현 | 갭 종류 | 권장 액션 |
|---|---|---|---|---|---|
| G1 | **섹션 제목 위치** | Quiz Section frame 내부에 accent bar + 제목 직접 포함 (node 2:35, 2:36) | `SectionBlock > SectionHeader` 컴포넌트가 제목 렌더 — QuizSection 외부 | 구조 차이 | **figma 수정 권장**: 섹션 헤더는 글로벌 `SectionBlock/SectionHeader` 패턴으로 frame 외부에 존재. figma의 2:35, 2:36을 Quiz Section frame 밖으로 분리하거나 SectionBlock 개념으로 재구성 |
| G2 | **카드 aspect-ratio** | 343x186px → 비율 약 343:186 (1.84:1) | `aspect-ratio: 16/9` = 1.78:1 (`QuizSection.module.scss:5`) | 디자인 토큰 차이 | **figma 수정 권장**: 16:9 비율이 표준 카드 패턴과 일치. figma의 186px을 `343/16*9 ≒ 193px`으로 맞추거나, 혹은 figma 비율이 의도라면 코드에 `aspect-ratio: 343/186` 변경 필요 (spot-check 필요) |
| G3 | **카드 border 색상** | `rgba(255,255,255,0.12)` = `--color-border-strong` (node 2:38) | `border: 1px solid var(--color-border)` = `rgba(255,255,255,0.06)` (`QuizSection.module.scss:4`) | 디자인 토큰 차이 | **figma 수정 권장**: 다른 카드 (CouponCard, EventCard) 가 `--color-border` 사용 — 통일성 우선. figma를 `rgba(255,255,255,0.06)`으로 수정 권장 |
| G4 | **카드 좌우 여백** | `left=16px`, 카드 width=343px (375-16-16=343) — 좌우 16px 패딩 | `SectionBlock` padding: `$layout-h-pad` = 16px. QuizSection 내부 별도 padding 없음 → 카드가 section 전체 너비 차지 | 레이아웃 차이 | **통일성 OK**: SectionBlock의 `$layout-h-pad` 16px가 적용되어 결과적으로 동일. 실제 렌더 결과는 figma와 일치 |
| G5 | **안내문 텍스트 내용** | `"※ 매주 금요일에 신규 퀴즈가 등장합니다. 보상은 목요일까지 수령해주세요."` (node 8:4) | `"※ 매주 금요일 12:00에 신규 퀴즈가 등장합니다. 정답 : 100스타(★)"` (`QuizSection.jsx:18`) | 콘텐츠 차이 | **spot-check 필요**: 두 텍스트가 다름. figma는 "보상 목요일까지 수령" / 코드는 "12:00 + 100스타" 명시. 어느 쪽이 최신 운영 정책인지 Owner 확인 필요. 현재는 코드 유지 권장 (기능 2 ac: L17-19 텍스트 변경 금지) |
| G6 | **안내문 텍스트 색상** | `rgba(255,255,255,0.6)` = `--color-text-secondary` (node 8:4) | `color: var(--color-text-muted)` = `rgba(255,255,255,0.38)` (`QuizSection.module.scss:36`) | 디자인 토큰 차이 | **figma 수정 권장**: 안내문은 muted(0.38) 처리가 시각 계층상 적합. 다른 도메인 안내문도 muted 사용 — 통일성 우선. figma를 `rgba(255,255,255,0.38)`로 수정 권장 |
| G7 | **섹션 제목 font-size** | 13px, semibold (node 2:36) | `@include text-section-title` = 15px, semibold (`SectionHeader` → `Section.module.scss:16`) | 디자인 토큰 차이 | **figma 수정 권장**: `text-section-title` (15px)이 모든 SectionBlock 제목의 표준. 다른 섹션과 통일성 유지 위해 figma를 15px로 수정 권장 |
| G8 | **empty state 구현** | node 5:3, 5:4 (hidden=true) — 실질적으로 비어있는 상태 미반영 | `<div className={styles.empty}><span>🖼️</span><span>이미지가 없습니다</span></div>` (QuizSection.jsx:11-14) | figma 미반영 | **figma 추가 요청**: empty state frame을 visible=true로 별도 variant 또는 frame으로 추가 필요. 현재 hidden 처리만 되어 있어 디자인 검토 불가 |
| G9 | **이미지 overflow 처리** | 이미지 레이어 400x185px (카드 343px 초과, center 정렬, overflow clip) | `img { width:100%; height:100%; object-fit:cover; }` (QuizSection.module.scss:9-13) + `overflow:hidden` on quizCard | 구현 방식 차이 | **통일성 OK**: object-fit:cover + overflow:hidden이 figma의 overflow clip + 중앙 정렬과 동일 시각 결과. 코드 유지 |
| G10 | **round 정보 표시 위치** | 섹션 제목에 "888회" 포함 (figma 2:36) | `SectionBlock title` prop에 `"컴프야 퀴즈 ${MOCK_QUIZ.round}회 정답"` 전달 (HomeScreen.jsx:47) | 통일성 OK | R9 fix 후 `state.quiz.latest.round` 로 대체 — 구조적으로 동일. 단 현재 MOCK_QUIZ 의존 (R9 fix 대상) |

---

## 3. 재사용 / 통일성 위반 발견

### 3.1 SectionHeader 표준 패턴 — 통일성 OK (단 figma 갭 존재)

- 실제 구현: `SectionBlock > SectionHeader` (글로벌 표준 컴포넌트) 사용 — 표준 패턴 준수
- figma (node 2:34): 섹션 제목 accent bar + title을 Quiz Section frame 내부에 직접 포함
- **판정**: figma가 표준 컴포넌트 구조(`SectionBlock`)와 다른 구조 제시 → **figma 수정 권장** (G1)
- SectionHeader의 accent bar(`|` span, color `--color-brand`)와 figma의 accent Rectangle(`#a86af0` = `--color-brand`)은 동일 색상 — 색상 토큰은 정합

### 3.2 border 토큰 차이 — figma가 더 강한 border 사용

- figma: `rgba(255,255,255,0.12)` (`--color-border-strong`)
- 코드: `var(--color-border)` = `rgba(255,255,255,0.06)`
- **판정**: CouponCard, EventCard 등 표준 카드들이 모두 `--color-border` 사용 → 통일성 우선. figma 수정 권장 (G3)

### 3.3 안내문 color 토큰 차이 — figma가 더 밝은 색상 사용

- figma: `--color-text-secondary` (0.60)
- 코드: `--color-text-muted` (0.38)
- **판정**: 안내문/부가 설명류는 muted(0.38) 처리가 시각 계층상 표준 — 코드 유지, figma 수정 권장 (G6)

### 3.4 font-size 차이

- figma: 제목 13px
- 코드: `text-section-title` = 15px
- **판정**: 15px이 모든 SectionBlock 제목의 표준 — figma 수정 권장 (G7)

---

## 4. figma 갱신 요청 항목 (Owner 검토 필요)

| # | figma node | 변경 요청 | 사유 | 표준 컴포넌트 reference |
|---|---|---|---|---|
| F1 | `2:35`, `2:36` (accent bar + 제목) | Quiz Section frame 내부에서 분리, SectionBlock 레벨로 재배치 | 글로벌 `SectionBlock > SectionHeader` 패턴과 구조 불일치 (G1) | `global/ui/mobile/section/SectionBlock.jsx`, `SectionHeader.jsx` |
| F2 | `2:38` QuizCard frame | height 186px → 193px으로 수정 (16:9 비율 맞춤: 343/16*9≒193) | 코드 `aspect-ratio: 16/9` 표준과 일치시킴 (G2) — 단 의도적 비율이라면 유지 (spot-check) | `QuizSection.module.scss:5` |
| F3 | `2:38` QuizCard border | `rgba(255,255,255,0.12)` → `rgba(255,255,255,0.06)` | `--color-border` 토큰 표준 (CouponCard/EventCard 동일 적용) (G3) | `_colors.scss:$color-white-06` |
| F4 | `8:4` 안내문 | color `rgba(255,255,255,0.6)` → `rgba(255,255,255,0.38)` | `--color-text-muted` 토큰 — 안내문 표준 (G6) | `semantic/_color.scss:--color-text-muted` |
| F5 | `2:36` 제목 텍스트 | font-size 13px → 15px, font-weight semibold 유지 | `text-section-title` 표준 (G7) | `mixins/_typography.scss:@mixin text-section-title` |
| F6 | `5:3`, `5:4` (empty state) | hidden=true 해제 + empty state variant frame 별도 구성 | 코드의 empty placeholder 구현체가 figma에 미반영 (G8) | `QuizSection.jsx:11-14` |

---

## 5. 코드 수정 제안

> 본 프로젝트 원칙상 코드 수정 제안은 figma가 더 정확한 경우만 — 이번 분석에서는 해당 없음.
> 아래 항목은 design-sync 와 별개로 R9 fix (Part A.6) 로 이미 추적 중인 기술 부채 재확인.

| # | 항목 | 현재 코드 | 수정 방향 | 출처 |
|---|---|---|---|---|
| C1 (R9 fix) | `HomeScreen.jsx:47-48` — MOCK_QUIZ 의존, quiz prop 미전달 | `quiz={<QuizSection />}` (quiz prop 없음), `MOCK_QUIZ.round` mock 사용 | R9 fix: `dispatch(requestLatestQuizAnswer())` + `quiz={latestQuiz}` props 전달 | `quiz.md A.6 R9 권장 fix`, `wireframes/quiz.md 부록 A` |

> ★ C1 은 design-sync 코드 수정 제안이 아니라 R9 fix 선행 조건 재확인. design-sync 관점에서 figma와의 갭은 아님 (round 값은 figma가 mock "888회", 코드도 현재 MOCK 사용으로 동일 상황).

---

## 6. 미해결 / spot-check 필요

| # | 항목 | 사유 | 권장 후속 조치 |
|---|---|---|---|
| S1 | **안내문 텍스트 내용** (G5) | figma: "보상은 목요일까지 수령" / 코드: "12:00에 + 100스타(★)" — 텍스트가 다름. 어느 쪽이 최신 운영 정책인지 불명확 | Owner에게 운영 정책 확인 후 figma 또는 코드 중 하나로 통일. 현재 코드 보존 (기능 2 ac 준수) |
| S2 | **카드 aspect-ratio 의도** (G2) | figma 카드 비율 약 343:186 (1.84:1) vs 코드 16:9(1.78:1). 차이는 약 7px. 의도된 비율인지 아니면 figma 작업 오차인지 불명확 | Owner/디자이너에게 의도 확인. 코드 16:9가 표준이라면 figma F2 수정. |
| S3 | **empty state figma 미반영** (G8) | figma의 empty state (5:3, 5:4)가 hidden=true로만 처리됨. 실제 empty UI 디자인이 정의된 곳 없음 | figma에 empty state variant 추가 요청 (F6). loading state도 별도 frame 없음 — 동일 요청 |
| S4 | **스크린샷 컨텍스트** | figma 스크린샷에 "정답입니다! 우편함에서 보상을 확인하세요!" 모달 오버레이가 보임 — v2 scope 외 기능(정답 제출/보상) UI가 figma에 존재 | 해당 모달은 v2 scope 외 (B.1 "별도 인터랙션 없음"). figma에 stale frame 정리 필요 여부 Owner 확인 |

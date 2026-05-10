# home 도메인 디자인 분석 (Step 2)

> **워크플로우**: `/code-to-design home` Step 2 — 분석만 (code.ts 작성 X)
> **선행 산출물**: `docs/domain/home/prd/*.md` (Step 1b reverse) + `web/src/domains/home/**` 코드 baseline
> **다음 단계**: Step 3 사용자 HITL → Step 4 figma-plugin/domains/home.ts 작성
> **작성일**: 2026-05-11

---

## 1. frame 목록

총 **7 frame** (F1~F7). 모두 mobile-lg 폭 `428px` 단일 viewport. 높이는 컨텐츠 합 (Hug) — wrapper F1 만 풀-페이지 고정.

| F# | name | 사이즈 (W × H) | layout | sizing 의도 | 핵심 구성 | 4 배수 |
|---|---|---|---|---|---|---|
| F1 | `Home mobile wrapper` | 428 × 자동(≈ 1860) | VERTICAL, gap 0 | W FIXED / H AUTO | TopBar(home) + Hero + Quick + 4 × SectionBlock | 428=4×107 OK / 0 OK |
| F2 | `Hero section` | 428 × 160 | (정적) — image bg + flex-col end | W FIXED / H FIXED 160 | bg image + linear-gradient overlay + heroBadge + heroTitle + heroSub | 428 / 160=4×40 OK |
| F3 | `Quick section` | 428 × 자동 | grid (4-col, gap 8, padding 16) | W FIXED / H AUTO | 3 × `.quickItem` (icon 52×52 + label) | 428 / 8/16/52 OK (12 그리드는 NA) |
| F4 | `Quiz section block` | 428 × 자동 | SectionBlock VERTICAL gap 12 padding 16 | W FIXED / H AUTO | SectionHeader (`| 컴프야 퀴즈 정답`) + `.quizCard` (aspect 16:9, empty placeholder) + `.quizNotice` | 428 / 12/16 OK |
| F5 | `Coupon section block` | 428 × 자동 | SectionBlock VERTICAL gap 12 padding 16 | W FIXED / H AUTO | SectionHeader (`| 최신 쿠폰` + 전체보기) + **placeholder** (CouponListHorizontal 외부 도메인) | 동일 |
| F6 | `Notice section block` | 428 × 자동 | SectionBlock VERTICAL gap 12 padding 16 | W FIXED / H AUTO | SectionHeader (`| 공지사항` + 전체보기) + `.noticeList` (3 × `.item` dot+content+date) | 428 / 12/16 OK / dot 6 raw |
| F7 | `Event section block` | 428 × 자동 | SectionBlock VERTICAL gap 12 padding 16 | W FIXED / H AUTO | SectionHeader (`| 진행 중인 이벤트` + 전체보기) + **placeholder** (EventListHorizontal 외부 도메인) | 동일 |

> **F8 빈 상태 frame 신설 여부** — 별도 frame 작성하지 않음. 빈 상태는 각 섹션 frame (F4 Quiz empty / F6 Notice empty) 안의 분기 텍스트로 처리하는 게 코드 분기 (FS-HOME-QUIZ-03 / EC-HOME-NOTICE-01) 와 1:1 정합. 별도 frame 은 합성 wrapper F1 의 의도와 어긋남.

### F1 합성 순서 (`HomeScreen.jsx` L53-86 1:1)

```
F1 Home mobile wrapper
├── (TopBar home) — 글로벌 layer 재사용 (applayout F2 의 buildTopBarHome(false) 호출)
├── F2 HeroSection
├── F3 QuickSection
├── F4 SectionBlock(Quiz)        ← title 동적 (quizSectionTitle, to 없음)
├── F5 SectionBlock(Coupon)      ← title 최신 쿠폰, to /coupons
├── F6 SectionBlock(Notice)      ← title 공지사항, to /notices
└── F7 SectionBlock(Event)       ← title 진행 중인 이벤트, to /events
```

---

## 2. 토큰 매핑

home 코드가 사용하는 SCSS 변수/CSS var → `figma-plugin/shared/tokens.ts` Tokens namespace 매핑.

### 2.1 색상

| 코드 사용 | scss 원본 | Tokens 매핑 | raw 값 | 비고 |
|---|---|---|---|---|
| `var(--color-bg-deepest)` | `$color-bg-900` | `COLOR.bgDeepest` | `#0f0a14` | F1 wrapper bg / Hero gradient end |
| `var(--color-bg-deep)` | `$color-bg-800` | `COLOR.bgDeep` | `#140f1f` | F3 quickMenu bg |
| `var(--color-bg-card)` | `$color-bg-600` | `COLOR.bgCard` | `#1f1a29` | F4 quizCard bg / F6 notice item bg |
| `var(--color-bg-elevated)` | `$color-bg-500` | `COLOR.bgElevated` | `#332947` | F3 quickIcon bg |
| `var(--color-brand)` | `$color-brand-400` | `COLOR.brand` | `#a86af0` | SectionHeader `.accent` ('|' bar) |
| `var(--color-brand-violet)` | `$color-brand-600` | `COLOR.brandViolet` | `#6c5ce7` | F2 heroBadge bg / F6 notice dot |
| `var(--color-text-primary)` (white-92) | `$color-white-92` | `ALPHA.textPrimary` | rgba(1,1,1,0.92) | heroTitle / quickItem text / notice title |
| `var(--color-text-secondary)` (white-60) | `$color-white-60` | `ALPHA.textSecondary` | rgba(1,1,1,0.60) | heroSub / quickLabel |
| `var(--color-text-muted)` (white-38) | `$color-white-38` | `ALPHA.textMuted` | rgba(1,1,1,0.38) | emptyText / quizNotice / notice sub/date / SectionHeader `.more` |
| `var(--color-border)` (white-06) | `$color-white-06` | `ALPHA.border` | rgba(1,1,1,0.06) | quizCard border / notice item border |
| `#fff` (raw — heroBadge color) | — | `COLOR.white` | `#ffffff` | ⚠️ 코드 hardcoded 1건 — HOME-NFR-02 위반 (Step 3 HITL 대상) |
| `rgba(0,0,0,0.06) → bgDeepest` (Hero `::before` gradient) | raw | (custom GradientPaint) | 시작 rgba(0,0,0,0.06) / 끝 `#0f0a14` | F2 overlay — figma `GRADIENT_LINEAR` 적용 |

### 2.2 spacing

| 코드 사용 | scss | Tokens | raw | 사용처 |
|---|---|---|---|---|
| `$space-1` | 4 | `SPACE.s1` | 4 | F2 heroSub margin-top / F6 noticeList gap |
| `$space-2` | 8 | `SPACE.s2` | 8 | F3 quickMenu gap / quickItem gap / heroBadge padding |
| `$space-3` | 12 | `SPACE.s3` | 12 | SectionBlock gap (sectionHead↔children) / notice item gap / notice item paddingRight |
| `$space-5` | 20 | `SPACE.s5` | 20 | F2 hero paddingTop/Bottom (vertical) / SectionBlock paddingTop/Bottom (`$layout-h-pad` 의 v 축에서 20 추정 — `.section` 의 첫 인자가 20) |
| `$layout-h-pad` | 16 | `LAYOUT.hPad` | 16 | F2 hero padding-horizontal / F3 quickMenu padding / SectionBlock padding-horizontal |
| `$layout-section-sep` | 8 | (LAYOUT.sectionSep 추가 ❓) | 8 | `.sep` (현재 home 에서 미사용 — dead style) |

> ⚠️ `.section { padding: $layout-h-pad $layout-h-pad; }` (`Section.module.scss` L2) — 주석 `20px 16px` 와 실제 코드 16/16 불일치. 코드 baseline (16/16) 우선. Step 4 작성 시 paddingTop/Bottom/Left/Right 모두 `SPACE.s4 (16)`.
> 동일 이슈 `.quickMenu` L7: `padding: $layout-h-pad` (16) — 주석 `20px 16px` 무시.

### 2.3 radius

| 코드 사용 | scss | Tokens | raw | 사용처 | 4 배수? |
|---|---|---|---|---|---|
| `$radius-sm` | 4 | `RADIUS.sm` | 4 | F2 heroBadge | OK |
| `$radius-xl` | 10 | `RADIUS.xl` | 10 | F3 quickIcon / F4 quizCard / F6 notice item | NO — 토큰 그대로 유지 (룰 § 1 예외) |
| `$radius-full` | 9999 | `RADIUS.full` | 9999 | F6 notice dot | (예외 pill) |

### 2.4 타이포 (mixin → FS / FW 매핑)

`web/src/global/styles/mixins/_typography.scss` 의 mixin 별 매핑 (코드 read 시 mixin 정의 확보 X — 다음 추정. Step 4 작성 직전 mixin 파일 read 필요).

| mixin | 추정 size / weight / lh | Tokens 매핑 | 사용처 | 마커 |
|---|---|---|---|---|
| `@include text-badge` | 9~10 / 600 / 1.5 | `FS.fs9` 또는 `fs10` + `FW_SEMIBOLD` | F2 heroBadge | ❓ mixin read 필요 |
| `@include text-hero` | 22~28 / 700 / 1.2 | `FS.fs22` + `FW_BOLD` 추정 | F2 heroTitle | ❓ mixin read 필요 |
| `@include text-caption` | 12 / 400 / 1.5 | `FS.fs12` + `FW_REGULAR` | F2 heroSub / SectionHeader more | 🟨 |
| `@include text-micro` | 10 / 400 / 1.5 | `FS.fs10` + `FW_REGULAR` | F3 quickLabel / F6 notice sub/date / quizNotice | 🟨 |
| `@include text-page-title` | 17 / 600 / 1.2 | `FS.fs17` + `FW_SEMIBOLD` | F3 quickIcon (emoji 크기) | 🟨 |
| `@include text-section-title` | 13~15 / 700 / 1.2 | `FS.fs15` 또는 `fs13` + `FW_BOLD` | SectionHeader title | ❓ mixin read 필요 |
| `@include text-body` | 12~13 / 500 / 1.5 | `FS.fs13` + `FW_SEMIBOLD` 추정 | F6 notice title | 🟨 |
| `@include text-ellipsis` | (overflow rule) | N/A — figma 측 `textTruncation = 'ENDING'` 적용 | F6 notice title/sub | — |

→ Step 4 들어가기 **직전** `web/src/global/styles/mixins/_typography.scss` 1회 read 필수. 위 ❓ 항목 (text-badge / text-hero / text-section-title) 의 정확값 확정 후 작성.

---

## 3. 컴포넌트 매핑 (코드 → figma 자식 구조)

### 3.1 F2 HeroSection (`HeroSection.jsx`)

```
F2 hero  (W 428 / H 160 / image bg + linear-gradient overlay / flex-col end / padding 20 16)
├── (overlay rect)   — figma 측 `GRADIENT_LINEAR` fill (top rgba(0,0,0,0.06) → bottom #0f0a14)
├── heroBadge  (H 20 / pad 0 8 / radius 4 / bg brandViolet / text "컴투스프로야구 2026" 9~10pt white)
├── heroTitle  (text "컴프야펀" / text-hero / textPrimary)
└── heroSub    (text "야구 게임 종합 정보 사이트" / text-caption / textSecondary / mt 4)
```

**구현 노트**:
- `background-image: url("@/assets/new/compyafun2026.jpg")` — figma 측 외부 자산 도입 금지 (🔴) → **placeholder rectangle** (bgCard `#1f1a29`) + 텍스트 `이미지 placeholder` 로 대체. 실제 이미지 fill 은 Step 4 사용자 결정 후 또는 figma 수동 작업.
- `::before` overlay 는 figma fill 의 `GRADIENT_LINEAR` 로 hero frame 자체에 적용 (별도 rectangle 1장 보다는 fills 배열 다중 paint 가 깔끔).
- flex `justify: flex-end` → `primaryAxisAlignItems = 'MAX'`.

### 3.2 F3 QuickSection (`QuickSection.jsx`)

```
F3 quickMenu  (grid 4 col gap 8 padding 16 / bg bgDeep)
└── 3 × quickItem  (현재 baseline 3건 — comingSoon 2 + 정상 1)
     ├── quickIcon  (W/H 52 / aspect 1:1 / radius 10 / bg bgElevated / text emoji 17pt)
     └── quickLabel (text "스킬\n시뮬레이터" — multi-line / text-micro / textSecondary / center)
```

**구현 노트**:
- `display: grid` `grid-template-columns: repeat(4, 1fr)` — figma 는 native grid 없음. **HORIZONTAL auto-layout + 각 item width = (428 - 16×2 - 8×3) / 4 = 93** (4 배수 X). 또는 itemSpacing=8 + `layoutWrap = 'WRAP'` 로 4-col 자동 wrap. Step 4 에서 `layoutWrap` 사용 우선 (figma plugin API 지원).
- 3 col 만 채우면 4번째 cell 공백. comingSoon 메뉴 (id 1, 2) 는 일반 메뉴와 시각적 동일 — 별도 dim 처리 없음 (코드 baseline 그대로).
- `\n` multi-line — figma text node 는 `\n` 자동 줄바꿈. `whiteSpace: pre-line` 동등.
- click intercept 동작은 figma 정적 표현 불가 — 주석 처리 (`// comingSoon → RenewalNoticeModal trigger`).

### 3.3 F4 QuizSection (`QuizSection.jsx`) — empty state 우선

```
F4 SectionBlock(quiz)  (VERTICAL gap 12 padding 16)
├── SectionHeader
│   └── h2 sectionTitle
│       ├── '|' accent (brand)
│       └── text "컴프야 퀴즈 정답"  ← title 분기 default (latest null)
│   (to 없음 → 전체보기 미노출)
├── quizCard  (W 100% / aspect 16:9 / radius 10 / border 1 white-06 / bg bgCard)
│   └── empty container (absolute inset:0 / flex-col-center gap 8)
│        ├── emptyIcon  (emoji 🖼️ / 28pt / opacity 0.4)
│        └── emptyText  (text "이미지가 없습니다" / text-caption / textMuted)
└── quizNotice (text "※ 매주 금요일 12:00 ..." / text-micro / textMuted)
```

**구현 노트**:
- aspect 16:9 → height = (428 - 16×2) × 9/16 = **221.625** (4 배수 X) → 반올림 **220** (4×55) 또는 **224** (4×56) 권고 (Step 4 결정).
- empty container 의 absolute inset:0 — figma 측 quizCard 가 부모 + flex-col-center 1 child 로 자연 정렬. absolute 미사용 권고.

### 3.4 F5 / F7 외부 도메인 섹션 (Coupon / Event)

home 책임 X. SectionHeader + **placeholder** 만 그림.

```
F5 SectionBlock(coupon)
├── SectionHeader
│   ├── accent '|' + "최신 쿠폰"
│   └── more link "전체 보기 →"  → ROUTE_META.COUPONS.path
└── placeholder rect (W 100% / H 120 / bg bgCard / radius 10 / dashed border 1 white-06)
    └── text "CouponListHorizontal placeholder\n(coupons 도메인 책임)"  centered textMuted
```

F7 동일 — 텍스트만 "EventListHorizontal placeholder".

> ⚠️ **외부 자산 도입 X** — 실제 CouponCard / EventCard 디자인은 coupons / events 도메인 figma 작업 시 별도 처리. home figma 는 합성 wrapper 만 책임.

### 3.5 F6 NoticeSection (`NoticeSection.jsx`)

```
F6 SectionBlock(notice)  (VERTICAL gap 12 padding 16)
├── SectionHeader
│   ├── accent '|' + "공지사항"
│   └── more link → /notices
└── noticeList (flex-col gap 4)
     └── 3 × item  (flex-row gap 12 / padding 8 12 / radius 10 / bg bgCard / border 1 white-06)
          ├── dot  (W/H 6 / radius full / bg brandViolet)  ← 4 배수 X (raw)
          ├── content (flex-col gap 2 / flex 1 / overflow hidden)
          │    ├── title  (text-body / textPrimary / ellipsis)
          │    └── sub    (text-micro / textMuted / ellipsis)
          └── date   (text-micro / textMuted / no-shrink)
```

**구현 노트**:
- 3건 mock 텍스트 (figma 측):
  - item 1: title "리뉴얼 안내" / sub "사이트 디자인이 개편되었습니다" / date "2026-05-09"
  - item 2: title "쿠폰 이벤트" / sub "신규 쿠폰 코드 배포" / date "2026-05-07"
  - item 3: title "정답 발표" / sub "5월 1주차 퀴즈 정답" / date "2026-05-03"
- 빈 배열 시 동작 (현재 빈 `<ul>`) — Step 3 미정 (placeholder 추가 vs 섹션 hide).
- dot 6px raw — `.noticeList .dot { width: 6px; height: 6px }` — Step 4 에서 4 배수 위반 표 기록 후 그대로 유지 (4 → 너무 작음 / 8 → 비례 깨짐).

---

## 4. 글로벌 의존 (이미 applayout 에 그려진 layer 처리)

| 글로벌 의존 | applayout 측 상태 | home 측 처리 |
|---|---|---|
| `TopBar variant=home` (guest) | applayout F2 의 `buildTopBarHome(false)` 함수 존재 | **재사용** — `home.ts` 에서 `ApplayoutDomain.buildTopBarHome` export 후 호출. 또는 동일 함수 내부 복제 (namespace 분리 시) — 후자가 더 깔끔. Step 4 결정. |
| `MobileLayout` (appWrapper + pageContent) | applayout F1 에 1 frame 존재 | **F1 wrapper 흉내 X** — home 도메인 frame 자체가 page-content 영역. TopBar 만 그리고 그 아래 home 섹션들 자연 합성. applayout F1 의 page-content padding-top 52 룰은 home frame 내부에서 TopBar → 섹션 순서로 자연 표현. |
| `SectionBlock` + `SectionHeader` | applayout 미반영 (글로벌 mobile/section UI) | **home 측 신규 layer** — `buildSectionHeader(title, to?)` + `buildSectionBlock(title, to?, children)` 헬퍼 함수를 `home.ts` 내부에 정의. 재사용 가능 (4섹션). |
| `RenewalNoticeModal` | applayout F6 에 이미 그려짐 | **재사용 X 신규 X** — home frame 에 표시 X (overlay state). Quick comingSoon 클릭 동작은 도메인 정적 frame 의 범위 외. 분석 노트 1줄만 명시. |
| `CouponListHorizontal` (외부 도메인 component) | 미반영 | **placeholder** (§ 3.4) — coupons 도메인 figma 작업 시 별도 |
| `EventListHorizontal` (외부 도메인 component) | 미반영 | **placeholder** (§ 3.4) — events 도메인 figma 작업 시 별도 |

---

## 5. 미정 사항 정리 (Step 3 HITL 대기)

### Step 1b planner 식별 (3건) — 디자인 영향

| ID | 항목 | planner 마커 | 디자인 영향 | 권고 default (Step 4 적용 시) |
|---|---|---|---|---|
| P-01 | 비로그인 접근 정책 (auth guard 없음) | ❓ | TopBar variant=home 의 **guest 상태** 1종만 그림. user 상태 frame 별도 생성 X (home 첫 진입은 guest 가정) | guest 1종만 |
| P-02 | NoticeSection 빈 배열 UX | ❓ | F6 의 **empty state 추가 frame 여부** | 별도 frame 없이 빈 `<ul>` 동등 — F6 의 noticeList placeholder text "등록된 공지가 없습니다" 1줄 추가 안 함. 정책 확정까지 3건 mock 만 |
| P-03 | Hero.heroBadge `#fff` 토큰화 | ❓ | F2 heroBadge color — 코드 baseline (`#fff` raw) 그대로 사용. 토큰화 결정 시 `--color-text-primary-inverse` 또는 `COLOR.white` 매핑 (이미 tokens.ts 에 있음) | `COLOR.white` raw 그대로. 토큰 결정 시 namespace 단어만 교체 |
| P-04 | Quiz broken image / thunk 실패 fallback | ❓ | F4 의 **추가 state frame 여부** | 별도 frame 없이 empty placeholder 1종만. broken fallback frame 은 정책 확정 후 |

### 디자인 관점 추가 미정 (Step 4 들어가기 전 결정 필요)

| ID | 항목 | 옵션                                                                                                                       | 권고 default                                                | 마커 |
|---|---|--------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|---|
| D-01 | Hero 이미지 배경 처리 | (A) bgCard placeholder rect + 텍스트 / (B) figma 측 외부 이미지 파일 import / (C) 단색 brand-dark fill                                | (A) — 외부 자산 도입 금지 룰 + Step 4 자동화 정합                       | 🟨 |
| D-02 | F3 Quick 4-col grid 표현 방식 | (A) HORIZONTAL + layoutWrap='WRAP' + itemSpacing 8 / (B) 2 row × HORIZONTAL (4 + 0) 수동 / (C) figma grid (API 지원 X)       | (A) layoutWrap (figma plugin API 2024 이후 지원)              | 🟨 |
| D-03 | F3 Quick 비어있는 4번째 cell | (A) 공백 유지 (3 items + 빈 1 cell) / (B) cell 자체 미생성 (3 items only horizontal)                                               | (A) — grid 일관성, 향후 메뉴 추가 대비                               | 🟨 |
| D-04 | F4 quizCard aspect 16:9 height 4-배수 정합 | (A) 220 (-1.6) / (B) 224 (+2.4) / (C) raw 221.6 그대로                                                                      | (B) 224 — 16:9 근사 + 4 배수 + 살짝 큼                           | 🟨 |
| D-05 | F2 hero overlay 표현 | (A) fills 다중 paint (image + gradient) / (B) hero frame 자체 GRADIENT_LINEAR + 별도 image rect 아래 / (C) overlay rect 별도 layer | (A) — 코드 `::before` 1:1 충실                                | 🟨 |
| D-06 | SectionHeader  accent | (A) text node ("\|" 문자) / (B) rectangle 2×16 brand color                                                                 | (A) — 코드 1:1 (`<span class="accent"></span>`)            | 🟨 |
| D-07 | F5/F7 외부 도메인 placeholder 사이즈 | (A) H 120 fixed / (B) 실제 CouponCard / EventCard 추정 사이즈                                                                   | (A) 120 fixed + dashed border + 안내 텍스트                    | 🟨 |
| D-08 | home.ts 와 applayout.ts buildTopBarHome 공유 방식 | (A) applayout namespace export → home 측 호출 / (B) home 내부 복제 (코드 중복)                                                      | (A) — DRY, namespace 간 함수 공유. tokens.ts 와 helpers.ts 패턴 동일 | 🟨 |
| D-09 | home.ts 산출 frame 의 page 배치 | (A) applayout 옆 별도 그리드 (예: row 5 부터) / (B) 새 figma page 신설                                                               | (A) — 같은 page 내 좌측 row 4 또는 row 5 부터 col 0~2              | 🟨 |
| D-10 | F3 quickIcon 의 emoji 크기 (text-page-title 추정 17pt) | mixin read 후 확정                                                                                                          | 17pt (text-page-title) 추정 — Step 4 직전 mixin read 시 확정     | ❓ |

### 강제 HITL 4 분야 점검

| 분야 | 발견 항목 | 결과 |
|---|---|---|
| 디자인 토큰 파괴적 변경 | 없음 | ✓ |
| 컴포넌트 라이브러리 구조 변경 | 없음 (SectionBlock/Header 신규 layer 작성은 home.ts 내부 한정 — 글로벌 컴포넌트 정의 변경 X) | ✓ |
| 레이아웃 컨벤션 변경 | 없음 (모바일 우선 / 글로벌 TopBar 사용 / 도메인 헤더 미작성 — 사용자 메모 `feedback_no_domain_header` 준수) | ✓ |
| 외부 자산 도입 | Hero `compyafun2026.jpg` — home.ts 에서는 placeholder 만 (D-01) | ✓ — placeholder 처리로 회피 |

→ **HITL 강제 중단 사항 없음**. Step 3 는 정책 ❓ 4건 + 디자인 default 10건 사용자 검토 후 Step 4 진입.

---

## 6. 4px Grid 사후검증 예고

각 frame 별 4 배수 정합 예상 결과. Step 4 작성 후 grep 검증 시 동일 표 생성 권고.

| frame | 사이즈 | padding | gap | radius | 비-4배수 항목 | 처리 |
|---|---|---|---|---|---|---|
| F1 | 428 × auto | 0 | 0 | 0 | 428 (=4×107 OK) | OK |
| F2 hero | 428 × 160 | 20/20/16/16 | (정적) | badge 4 | (없음 — 모두 4 배수) | OK |
| F2 heroBadge | auto × 20 | 0/8/0/8 | 0 | 4 | (없음) | OK |
| F3 quickMenu | 428 × auto | 16/16/16/16 | 8 | 0 | (없음) | OK |
| F3 quickIcon | 52 × 52 | 0 | 0 | 10 (radius-xl) | radius 10 | 토큰 예외 — 유지 |
| F4 quizCard | (428-32) × 224 권고 | 0 | 0 | 10 | radius 10 / 221.6→224 반올림 | 토큰 예외 + 반올림 |
| F4 empty inner | auto | 0 | 8 | 0 | (없음) | OK |
| F4 emptyIcon | auto (text 28pt) | — | — | — | font-size 28 (=4×7 OK) | OK |
| F5/F7 placeholder | (428-32) × 120 | — | — | 10 | radius 10 | 토큰 예외 |
| F6 item | (428-32) × auto | 8/12/8/12 | 12 | 10 | padding 8/12 / radius 10 | OK (모두 4 배수) + 토큰 예외 |
| F6 dot | 6 × 6 | — | — | 9999 | **dot 6 × 6** | raw 유지 (4px 너무 작음 / 8px 비례 깨짐) — 위반 표 기록 |
| SectionBlock | 428 × auto | 16/16/16/16 | 12 | 0 | (없음) | OK |

**위반 합계** (Step 4 작성 후 design-report.md 에 기록 예고):
- raw 6 (notice dot) × 1 — 사용자 pin 유지
- radius-xl 10 × 4 (quickIcon / quizCard / notice item / placeholder) — 토큰 예외 그대로
- quizCard height 221.625 → 224 반올림 1건 (D-04)

→ 모두 §1 룰 § 1 "예외 허용" 또는 §9.6 "코드 ↔ 4 배수 충돌 시 코드 baseline 우선" 으로 해결 가능. 신규 위반 0건 예상.

---

## 7. Step 4 작성 직전 추가 read 필요 항목

다음 파일은 본 분석에서 read 하지 않음 — Step 4 시작 시 read 필수:

| 파일 | 필요 이유 |
|---|---|
| `web/src/global/styles/mixins/_typography.scss` | text-badge / text-hero / text-section-title / text-body 정확 size / weight / lh 확정 (§ 2.4 ❓ 3건) |
| `web/src/global/styles/mixins/_flex.scss` | `flex-col` / `flex-center` / `flex-col-center` / `flex-col-end` mixin 확인 (figma layoutMode 매핑 검증) |
| `web/src/global/styles/mixins/_layout.scss` | 추가 layout mixin 있는지 (현재 home 코드 직접 사용 흔적 없음) |
| `figma-plugin/shared/helpers.ts` | `makeFrame` / `makeText` / `applySizing` 시그니처 재확인 (Step 4 작성 시 정확 호출) |
| `figma-plugin/code.ts` (entry) | home 도메인 추가 시 entry 의 `await ApplayoutDomain.run()` 외 `await HomeDomain.run()` 추가 위치 결정 |

---

## 8. 산출물 정리

- 본 문서 (`docs/domain/home/design/design-analysis.md`) — Step 2 분석 결과
- **다음 단계**: Step 3 사용자 HITL (P-01~04 + D-01~10 + ❓ 항목 검토) → Step 4 `figma-plugin/domains/home.ts` 작성 (분석에서 정한 default 또는 사용자 결정값 반영)

### Step 4 frame 빌더 시그니처 예고 (참고용 — 작성 X)

```typescript
namespace HomeDomain {
  // F1 합성 wrapper
  function buildF1(): FrameNode { /* TopBar + F2~F7 합성 */ }

  // F2 Hero
  function buildF2(): FrameNode { /* image placeholder + gradient + badge + title + sub */ }

  // F3 Quick (4-col grid via layoutWrap)
  function buildF3(): FrameNode { /* QUICK_MENUS 3건 + 1 빈 cell */ }

  // F4 Quiz (empty state default)
  function buildF4(title: string): FrameNode { /* SectionBlock(title) + quizCard empty + notice */ }

  // F5 / F7 외부 도메인 placeholder
  function buildExternalSection(title: string, to: string, label: string): FrameNode { /* SectionHeader + placeholder rect */ }

  // F6 Notice
  function buildF6(): FrameNode { /* SectionBlock + 3 mock items */ }

  // 헬퍼
  function buildSectionHeader(title: string, to?: string): FrameNode { /* | accent + title + (전체 보기) */ }

  export async function run(): Promise<void> { /* 7 frame 격자 배치 */ }
}
```

---

## 9. 사용자 확인 필요 항목 (Step 3 입력 요약)

다음 14건 사용자 답변 후 Step 4 진입:

**Planner ❓ 4건** (디자인 default 함께 명시 — 사용자가 default OK 면 그대로 진행):
- P-01 비로그인 접근 정책 (default: guest 1종만)
- P-02 NoticeSection 빈 배열 UX (default: empty frame 없이 mock 3건만)
- P-03 Hero badge `#fff` 토큰화 (default: `COLOR.white` raw 그대로)
- P-04 Quiz broken image / thunk 실패 fallback (default: empty placeholder 1종만)

**Designer 🟨 10건** (default 권고 — OK 면 자동 진행):
- D-01 ~ D-10 — § 5 표 참조

→ 사용자가 default 14건 모두 OK 응답 시 Step 4 즉시 진입 가능.

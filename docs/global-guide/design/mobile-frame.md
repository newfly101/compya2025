# Mobile-First Frame 전략

> Figma frame ↔ 코드 wrapper 폭 통일 + **320 ~ 480 fluid** 대응 + 8pt grid 컨벤션 + **rem/em 단위 강제** (도메인 px 금지).
> 본 프로젝트 = com2usbaseball, mobile-first 단일 (PC layout 없음). Figma: 컴프야펀 design file 단일 소스.
> 1차 참조 — 코드 컨벤션은 [frontend-developer.md](../../develop/frontend-developer.md), Figma plugin 은 [figma-plugin-rules.md](./figma-plugin-rules.md).

---

## 1. 통상 모바일 first frame width

| 폭 | 디바이스 | 본 프로젝트 위치 |
|---|---|---|
| 320px | iPhone SE 1세대, Galaxy Fold(contracted) | **지원 하한** (보호 대상, `$bp-mobile-sm`) |
| 375px | iPhone X / 12 / 13 mini / 14 mini | fluid 중간 (`$bp-mobile`) |
| 390px | iPhone 12/13/14/15 | fluid 중간 |
| 414px | iPhone Pro Max | fluid 중간 |
| 428px | iPhone 14/15 Pro Max | fluid 중간 (`$bp-mobile-lg`) |
| **480px** | 대형 모바일 / wrapper 한도 | ⭐ **기준 frame (상한)** (`$layout-wrapper-max`) |

선택 근거 (현 컨벤션 — 사용자 결정): **480 단일 상한** + 320 보호. fluid 구간 320~480 을 단일 시각 컨벤션으로 통일.
- Figma frame = **480px** (코드 wrapper 와 1:1)
- 375 / 390 / 414 / 428 폭은 별도 frame 없이 **하나의 480 frame 안에서 padding / clamp / % 로 자연 축소**
- 320 폭만 보호 query (`@include small-mobile`) 로 hard fallback

---

## 2. Frame 통일 표준 (Figma → 코드)

| 영역 | 표준값 | 본 프로젝트 토큰/파일 |
|---|---|---|
| Figma frame width | **480px** | `figma-plugin/domains/{feature}.ts` 의 `createFrame(name, 480, ...)` |
| Figma frame height | content auto | 높이는 컨텐츠 자유 |
| 코드 wrapper max-width | **480px** (`$layout-wrapper-max`) | `_spacing.scss` → `body` + `page-layout` mixin + TopBar + Drawer 일괄 정합 |
| 코드 wrapper width | 100% | 동상 |
| 코드 wrapper margin | `0 auto` (중앙 정렬) | 동상 |
| 외곽 padding (H_PAD) | **1rem (16px)** | `$space-4` (`_spacing.scss`) |
| Card width | 448px (480 - 16×2) | `$layout-card-width` ⚠️ 기존 343 → 448 갱신 필요 (Track 0) |
| TopBar height | 3.25rem (52px) | `$layout-topbar-height` |
| BottomBar height | 3.5rem (56px) | `$layout-bottombar-height` |

⭐ Figma 480 ↔ 코드 480 max + `width:100%` — tablet/PC 에서도 좌우 여백 + 중앙 정렬로 모바일 형태 유지. 320~480 구간은 **fluid (clamp / % / auto)** 자연 축소 (responsive-mobile-first.md § 2).

---

## 3. 가장 작은 모바일 (320px) 보호 전략

### 3.1 필수 CSS 보호 패턴

| 속성 | 값 | 이유 |
|---|---|---|
| `box-sizing` | `border-box` | padding 폭 계산 (global reset 적용) |
| `min-width` (flex/grid 자식) | `0` | overflow 방지 |
| `max-width` (img / video) | `100%` | 미디어 가로 넘침 차단 |
| `overflow-wrap` | `anywhere` | 긴 단어/URL 줄바꿈 |
| `word-break` | `keep-all` | 한글 단어 단위 줄바꿈 |
| body | `overflow-x: hidden` (or 자식 `min-width: 0`) | 가로 스크롤 차단 |

### 3.2 320 미만 보호 media query (유일 허용)

본 프로젝트 적용: **`h-pad` mixin 자체에 내장** (`_layout.scss`). 도메인 SCSS 가 `@include h-pad` 만 하면 320 미만에서 자동 축소 (16 → 12, `$layout-h-pad-sm`).

```scss
// _layout.scss — 본 프로젝트 적용 예
@mixin h-pad {
  padding-left: $layout-h-pad;
  padding-right: $layout-h-pad;

  @media (max-width: $bp-mobile-sm) {
    padding-left: $layout-h-pad-sm;   // 12px
    padding-right: $layout-h-pad-sm;
  }
}
```

도메인 SCSS 가 추가 보호 필요 시:

```scss
@media (max-width: $bp-mobile-sm) {
  .title { font-size: $font-size-13; }
}
```

### 3.3 fluid spacing

```scss
// 작은 폭에서 자연 축소
padding-inline: clamp(12px, 3vw, 16px);
```

### 3.4 금지

- ❌ 절대 width (`width: 480px`) — 항상 `max-width` + `width: 100%`
- ❌ horizontal scroll 유발 (flex 자식 `min-width: 0` 미설정)
- ❌ `white-space: nowrap` + 긴 한글 (가로 overflow)
- ❌ **px 단위 직접 사용 (도메인 SCSS)** — § 4.4 참조

---

## 4. 8pt Grid System (4px sub-grid)

### 4.1 본 프로젝트 실 토큰 (`web/src/global/styles/variables/_spacing.scss`)

> ⚠️ **토큰 raw 값은 px** (`16px` 등) — 글로벌 토큰 정의 파일은 px 사용 허용. **도메인 SCSS 에서는 토큰만 호출** (`$space-4`). 직접 px X.

| 토큰 | raw | rem 환산 (16px base) | 용도 |
|---|---|---|---|
| `$space-1` | 4px | 0.25rem | 아이콘 내부, 뱃지 패딩 |
| `$space-2` | 8px | 0.5rem | 섹션 구분선, gap 최소 |
| `$space-3` | 12px | 0.75rem | 인풋 내부 패딩 |
| `$space-4` | 16px | 1rem | **화면 수평 패딩 (H_PAD)** |
| `$space-5` | 20px | 1.25rem | 카드 내부 상하 패딩 |
| `$space-6` | 24px | 1.5rem | 섹션 간 gap |
| `$space-8` | 32px | 2rem | 섹션 상단 여백 |
| `$space-10` | 40px | 2.5rem | — |
| `$space-12` | 48px | 3rem | 페이지 상단 여백 |

base unit = `$space-base: 8px`. 모든 spacing **4의 배수** (8의 배수 우선).

### 4.2 컴포넌트 height (4의 배수)

| 값 (px) | rem | 용도 | 토큰 (신설 권장) |
|---|---|---|---|
| 32px | 2rem | small chip / icon button | `$control-height-xs` |
| 36px | 2.25rem | search input / chip row | `$control-height-sm` |
| 40px | 2.5rem | secondary button | `$control-height-md` |
| 44px | 2.75rem | **tap target 최소** | `$control-height-tap` |
| 48px | 3rem | primary button | `$control-height-lg` |
| 52px | 3.25rem | TopBar | `$layout-topbar-height` (기존) |
| 56px | 3.5rem | BottomBar | `$layout-bottombar-height` (기존) |

### 4.3 px 단위 사용 룰 (도메인 강제 — 신규)

| 영역 | px 허용 | rem/em 강제 | 토큰 강제 |
|---|---|---|---|
| `web/src/global/styles/variables/**` | ✅ | — | — (raw 정의) |
| `web/src/global/styles/mixins/**` | ✅ (1px border 등 hairline 만) | ✅ font-size 는 토큰 호출 | — |
| `web/src/global/styles/base/**` | ✅ (reset / html font-size 16px) | ✅ | — |
| `web/src/global/styles/semantic/**` | ✅ | — | — |
| `web/src/global/ui/**` (재사용 컴포넌트) | ❌ (예외: 1px border, 0.5px hairline, 100%) | ✅ | ✅ (가능한 토큰) |
| `web/src/domains/**` (도메인) | ❌ | ✅ font-size 는 토큰 또는 rem/em | ✅ **토큰 강제** |
| `web/src/app/wrapper/**` (wrapper) | 🟡 layout constant 만 (`$layout-*` 토큰 raw) | ✅ font-size 토큰 호출 | ✅ |

⭐ **도메인 SCSS px 금지 룰** (사용자 결정 — 2026-05-31):
1. **font-size 는 반드시 rem 또는 em** — 직접 `font-size: 14px` 금지. `$font-size-*` 토큰 (이미 rem 단위) 또는 `clamp(...)` 사용
2. **padding / margin / gap 는 반드시 토큰** — `$space-*` 만
3. **border-radius 는 반드시 토큰** — `$radius-*` 만
4. **width / height 는 토큰 또는 rem/em 또는 % / vw / fr** — 직접 px 금지 (예외: `1px` border, `0.5px` hairline, `100%`)
5. **breakpoint 는 px** (`@media (max-width: $bp-mobile-sm)`) — 브라우저 권장
6. line-height / letter-spacing 은 unitless 또는 em (이미 토큰 정합)

위반 패턴 자동 검출 (frontend-developer agent 가 grep):
```
# 도메인 SCSS px 직사용 grep (web/src/domains/**/*.scss)
grep -rEn '^[^/]*:\s*[0-9]+px' web/src/domains/  # px 직사용 (주석 제외)
```

### 4.4 금지

- ❌ 토큰 외 매직 spacing (13px, 17px, 21px ...) — 항상 `$space-*`
- ❌ 인라인 `style={{ padding: 14 }}` — SCSS 토큰만
- ❌ Figma 그리드 미설정 (반드시 `View > Layout grid > 4px` 스냅)
- ❌ **도메인 SCSS 의 `font-size: 14px`** — `$font-size-*` 토큰 또는 `1rem` / `em`
- ❌ **도메인 SCSS 의 모든 px 직사용** (예외: 1px border, 0.5px hairline, 100% 외 width)

---

## 5. Tap Target (모바일 접근성)

| 가이드 | 최소 | 본 프로젝트 |
|---|---|---|
| Apple HIG | 44 × 44 pt | **44px 채택** (8pt 호환) |
| Material Design | 48 × 48 dp | — |
| WCAG 2.5.5 | 44 × 44 CSS px | 만족 |

규칙:
- 작은 아이콘 버튼도 padding 으로 tap 영역 44 확보 — **visual size ≠ tap target**
- 인접 tap target 간 최소 간격 **8px** (`$space-2`)
- icon 24px + padding 10px = 44px tap area

---

## 6. Fluid Typography (rem 강제 + 작은 폭 자동 축소)

### 6.1 본 프로젝트 실 토큰 (`_font.scss`)

⭐ **모든 토큰이 이미 rem 단위로 정합됨** (16px base). 도메인은 토큰 호출만 — px 직접 사용 금지.

| 토큰 | rem | px 환산 | 용도 |
|---|---|---|---|
| `$font-size-9` | 0.5625rem | 9px | badge / code label |
| `$font-size-10` | 0.625rem | 10px | micro / link |
| `$font-size-11` | 0.6875rem | 11px | caption / date |
| `$font-size-12` | 0.75rem | 12px | body |
| `$font-size-13` | 0.8125rem | 13px | body-bold / 공지 제목 |
| `$font-size-15` | 0.9375rem | 15px | section-title |
| `$font-size-17` | 1.0625rem | 17px | topbar logo |
| `$font-size-22` | 1.375rem | 22px | page-title |
| `$font-size-28` | 1.75rem | 28px | hero |

### 6.2 rem / em 단위 강제 룰 (도메인 — 신규)

| 위치 | 사용 | 비고 |
|---|---|---|
| 글로벌 font scale 토큰 | **rem 단위로 정의** (현재 정합) | 16px html base |
| 도메인 `font-size:` 직접 작성 | **금지** | `$font-size-*` 토큰 호출 |
| 부득이 토큰 외 사이즈 필요 시 | **rem 또는 em** | `font-size: 1.125rem;` (`18px` 등가) |
| 자식 상대 크기 | **em** | `font-size: 0.9em;` (부모 대비 축소) |
| line-height | unitless | `1.5` (현재 토큰 정합) |
| letter-spacing | em | `-0.02em` (현재 토큰 정합) |

⭐ rem 사용 이유:
- 사용자 브라우저 폰트 크기 설정 (16px → 20px) 시 비례 확대 — 접근성 (WCAG 1.4.4)
- 320~480 fluid 와 함께 작은 폭에서 자연 축소

### 6.3 fluid 권장 (작은 폭에서만 축소가 필요할 때)

```scss
// 320 ~ 480 사이 자연 축소 (rem 기반)
font-size: clamp($font-size-13, calc(0.8125rem + 0.3vw), $font-size-15);
```

⭐ 본 프로젝트는 토큰 기본값으로 충분 (320 미만에서만 `_spacing` 축소 query 사용). hero/title 처럼 큰 글자에만 `clamp` 적용.

### 6.4 rem ↔ px 변환 helper (Track 0 신설 예정)

도메인이 부득이 토큰 외 사이즈 필요 시 SCSS function 사용:

```scss
// mixins/_typography.scss (Track 0 신설)
@function rem($px) {
  @return calc($px / 16) * 1rem;
}

// 사용 예 (도메인)
.foo { font-size: rem(14); }  // → 0.875rem
```

---

## 7. 화면별 width 통일 체크리스트 (FE/디자이너 공용)

- [ ] Figma frame width = **480**
- [ ] 코드 wrapper `max-width: $layout-wrapper-max (480px)` + `width: 100%` + `margin: 0 auto`
- [ ] 외곽 padding = **1rem (16px, `$space-4`)**
- [ ] 모든 spacing = `$space-*` 토큰 (4의 배수)
- [ ] **font-size 는 rem (토큰 호출) — 도메인 SCSS px 금지**
- [ ] **도메인 SCSS 의 모든 px 직사용 금지** (예외: 1px border, 0.5px hairline, 100%)
- [ ] 이미지/미디어 `max-width: 100%`
- [ ] flex/grid 자식 `min-width: 0`
- [ ] 한글 `word-break: keep-all` + `overflow-wrap: anywhere` (`hangul-safe` mixin)
- [ ] tap target ≥ 44px (`tap-target` mixin)
- [ ] `body` 또는 wrapper `overflow-x: hidden`
- [ ] 320 미만 보호 query 적용 (필요 시 `@include small-mobile`)

---

## 8. 자주 발생하는 실수 (안티패턴)

| 안티패턴 | 증상 | 해결 |
|---|---|---|
| Figma frame 375 / 390 / 414 / 480 혼용 | 코드 적용 시 비율 깨짐 | **480 단일 통일** |
| `width: 480px` 절대값 (wrapper 가 아닌 곳) | 320 폭에서 가로 스크롤 | `max-width: $layout-wrapper-max` + `width: 100%` |
| **도메인 `font-size: 14px`** | 사용자 브라우저 확대 무시 + 접근성 위반 | rem 토큰 (`$font-size-13` 등) 또는 `rem(14)` |
| **도메인 `padding: 11px`** | 토큰 우회 + 8pt 위반 | `$space-3` (12px) 매핑 |
| **도메인 `border-radius: 5px`** | 토큰 우회 | `$radius-sm` (4px) 또는 `$radius-md` (6px) |
| 13px, 17px, 21px magic spacing | 그리드 어긋남 | `$space-*` 토큰만 |
| `font-size: 16px` 고정 | 320 에서 잘림 + 사용자 확대 무시 | 토큰 + `clamp` (rem 기반) |
| tap target 32px | 미스 탭 ↑ | padding 으로 44 확보 (`tap-target` mixin) |
| `white-space: nowrap` + 긴 한글 | 가로 overflow | `hangul-safe` mixin |
| flex 자식 `min-width` 미설정 | 자식 폭이 부모 초과 | `min-width: 0` |
| Figma `Layout grid` 미적용 | 매직 spacing 발생 | `View > Layout grid > 4px` |
| `width: 320px` 모달 (gutter 0) | 320 폭에서 좌우 0 | `max-width: calc(100% - 2rem)` |

---

## 9. 본 프로젝트 현황 / 권고

### 9.1 본 프로젝트 적용 상태 (2026-05-31)

| 항목 | 값 | 위치 |
|---|---|---|
| spacing 토큰 | `$space-1 ~ $space-12` (raw px, 4 ~ 48px) | `_spacing.scss` |
| font 토큰 | `$font-size-9 ~ $font-size-28` (**rem 단위 정합 ✓**) | `_font.scss` |
| `$layout-screen-width` | 375px (legacy — 480 으로 갱신 권장) | `_spacing.scss` |
| `$layout-wrapper-max` | **480px** (코드 wrapper 한도) | `_spacing.scss` |
| `$layout-card-width` | 343px (Figma 375 - 16×2) — **448px (480-16×2) 로 갱신 권장** | `_spacing.scss` ⚠️ Track 0 |
| `$layout-h-pad` | 16px (1rem) | `_spacing.scss` |
| `$layout-h-pad-sm` | 12px (0.75rem, 320 미만 보호) | `_spacing.scss` |
| breakpoints | `$bp-mobile-sm:320, $bp-mobile:375, $bp-mobile-lg:428, $bp-tablet:768, $bp-desktop:1024` | `_breakpoints.scss` |
| 글로벌 wrapper | `<MobileLayout>` + `page-layout` mixin (max-width 480 + margin-inline auto) | `MobileLayout.jsx` + `_layout.scss` |
| body | `max-width: $layout-wrapper-max` + `margin: 0 auto` + `overflow-x: hidden` | `_base.scss` |
| TopBar / Drawer | `max-width: $layout-wrapper-max` (480) | `parts/TopBar.module.scss`, `parts/Drawer.module.scss` |
| `h-pad` mixin | 320 미만 자동 축소 (16 → 12) 내장 | `_layout.scss` |
| html font-size | 16px (rem base) | `base/_base.scss:20` |

### 9.2 권고 (잔여)

- ⚠️ Figma 산출물 frame width **480 통일** (현재 375/390 혼용 — 디자이너 정렬 필요)
- ⚠️ `$layout-screen-width: 375px` → `480px` 갱신, `$layout-card-width: 343px` → `448px` 갱신 (Track 0)
- ⚠️ 도메인 SCSS px 직사용 (현재 발견 ~40건) — Track 1~4 에서 토큰/rem 매핑
- ⚠️ 320 미만에서 큰 typography (`$font-size-22+`) 잘리는 경우 — 도메인 SCSS 에 case-by-case `@include small-mobile` 추가 권장
- ⚠️ 모달 2종 (`ResponseModal`, `RenewalNoticeModal`) 매직 컬러 + width:320px gutter 0 — Track 1 에서 처리

---

## 10. 참조

- 반응형 모드 / Figma frame 권장: [`.claude/conventions/responsive-mobile-first.md`](../../../.claude/conventions/responsive-mobile-first.md)
- Figma plugin code.ts 패턴: [`.claude/conventions/figma-plugin.md`](../../../.claude/conventions/figma-plugin.md), [figma-plugin-rules.md](./figma-plugin-rules.md)
- FE 코드 컨벤션: [`.claude/conventions/fe-code-base.md`](../../../.claude/conventions/fe-code-base.md), [frontend-developer.md](../../develop/frontend-developer.md)
- 실 SCSS 토큰: `web/src/global/styles/variables/{_spacing,_font,_breakpoints}.scss`
- 글로벌 wrapper: `web/src/app/wrapper/mobile/MobileLayout.jsx`

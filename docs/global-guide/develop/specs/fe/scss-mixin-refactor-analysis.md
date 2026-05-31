# SCSS Mixin-First Refactor 분석문서

> 입력: `docs/global-guide/design/mobile-frame.md` (헌법) + 현재 글로벌 SCSS + 표준 Badge 3종
> 모드: mobile-first 단일 (PC/admin 영역 제외)
> 작성일: 2026-05-31
> 작성자: developer-analyze (테크리드)

---

## § 1. 현황 요약 + 가정값

### 1.1 정합 확인 (1줄)

mobile-frame.md (480 wrapper / 320 보호 / 8pt grid / fluid type) 와 현재 글로벌 SCSS 토큰·mixin 상태 **일치**. `body` / `page-layout` / `TopBar` / `Drawer` 가 모두 `$layout-wrapper-max:480` 정합되었고, `h-pad` mixin 에 320 미만 자동 축소 (16→12) 내장됨.

### 1.2 본 라운드 작업 가정값

| 항목 | 가정 | 비고 |
|---|---|---|
| HITL 4분야 | 위험 없음 | 법무/결제/권한/db 변경 없는 순수 SCSS 리팩토링 |
| 모드 | mobile-first 단일 | PC/admin 영역 (`domains/community/feature/components/admin/**`, `user/post/pc/**`) **제외** |
| **기준 frame width** | **480px 단일** (320~480 fluid) | 사용자 결정 (2026-05-31) — mobile-frame.md § 1, § 2 갱신 완료 |
| **도메인 px 직사용** | **금지** | mobile-frame.md § 4.3 룰. 예외: 1px border, 0.5px hairline, 100% |
| **도메인 font-size** | **rem 또는 토큰 (`$font-size-*`) 만** | font 토큰은 이미 rem 정합. 직접 px 금지. `rem()` SCSS function 신설 (Track 0) |
| Badge JSX 시그니처 | 변경 금지 | variant 추가 제안만 별도 마킹 |
| 토큰 rename / 삭제 | 금지 | destructive 회피. 신규 추가만 |
| 토큰 신설 위치 | `_spacing.scss` / `_radius.scss` / `_typography.scss` / 신규 mixin file | 변경 사항은 `@forward` 추가 |
| `$layout-screen-width` | 375 → **480** 갱신 (Track 0) | mobile-frame § 1 일관 |
| `$layout-card-width` | 343 → **448** 갱신 (Track 0) | 480 - 16×2 |
| Bash 사용 | 본 분석은 read-only | 실 작업은 frontend-developer agent 가 수행 |

### 1.3 미해결 / 위험 항목 (마커)

| 마커 | 항목 | 위치 | 권고 |
|---|---|---|---|
| 🔴 | `bg-image` mixin 깨짐 — `$url` 변수 미정의 (직접 호출 시 컴파일 에러) | `mixins/_background.scss:7` | Track 0 에서 `$url: null` 파라미터화 또는 mixin 시그니처 변경 (`@mixin bg-image($url, ...)`) |
| 🟨 | `VisibleToggle.module.scss` 전체 주석처리 — dead file | `global/ui/visibleToggle/` | Track 0 또는 별도 cleanup. 본 분석에서는 touch X |
| 🟨 | `ResponseModal` / `RenewalNoticeModal` 매직 컬러 다수 (`#1e1e1e`, `#e5e7eb`, `#6366f1`) + **font-size px 직사용** (`15px`, `42px`) | `global/ui/{responseModal,renewalNoticeModal}/` | Track 1 에서 토큰화 + rem 매핑 |
| 🟨 | `HistoryModeScreen.module.scss` 매직 spacing (`6px`, `9px`, `11px`, `15px`, `20px`) + font-size px (`8px`, `20px`) 다수 | 한 화면에서 30+회 | Track 3 에서 token-only + rem 매핑. 11 → `$space-3`(12), 9 → `$space-2`(8), 6 → `$space-1`(4) 또는 `$space-2`(8), 20px font → `$font-size-22` |
| 🟨 | `$layout-screen-width: 375` 와 mobile-frame.md § 1 (480 단일) 불일치 | `_spacing.scss:21` | Track 0 에서 480 으로 갱신 (호출처 grep 후 변경) |
| 🟨 | `$layout-card-width: 343px` (Figma 375 기준) | `_spacing.scss:23` | Track 0 에서 448 으로 갱신 (480 - 16×2) |

---

## § 2. mixin 후보 식별 (2회 이상 반복 raw CSS 패턴)

> 발견 위치 = `file:line` (line 은 발견 시점 기준). 권고는 (a) 신규 mixin / (b) 기존 mixin 대체 두 종류.

### 2.1 카드 베이스 (`card-base`) — ⭐ 최우선 신설

도메인 어디서나 반복: `background-color + border + border-radius + padding`

| 발견 | 시안값 |
|---|---|
| `domains/coupons/.../CouponCard.module.scss:1-9` | bg-card + border + radius-xl + padding `$space-3 $space-4` |
| `domains/events/.../EventCard.module.scss:2-13` | bg-card + border + radius-xl |
| `domains/notices/.../NoticeCard.module.scss:2-12` | bg-card + border + radius-xl (featured) |
| `domains/notices/.../NoticeCard.module.scss:74-83` | bg-overlay + border + radius-lg (regular) |
| `domains/notices/.../OfficialNoticeCard.module.scss:2-12` | bg-deepest + border + radius-lg |
| `domains/community/.../hotPostCard/HotPostCard.module.scss:1-11` | bg-overlay + border + radius-sm |
| `domains/community/.../postRow/PostRow.module.scss:1-10` | bg-overlay + border + radius-sm |
| `domains/historyMode/.../HistoryModeScreen.module.scss:15-21` (filterSection) | bg-card + border + radius-sm + padding 11px |
| `domains/historyMode/.../HistoryModeScreen.module.scss:235-243` (summary) | bg-card + border-strong + radius-sm |
| `domains/historyMode/.../HistoryModeScreen.module.scss:397-404` (detail) | bg-card + border-strong + radius-sm |
| `domains/historyMode/.../stageCard/StageCard.module.scss:1-13` | bg-overlay + border + radius-sm |
| `domains/home/.../notice/NoticeSection.module.scss:9-20` (item) | bg-card + border + radius-xl |

**권장 mixin**:

```scss
// _layout.scss 또는 새 _surface.scss
@mixin card-base(
  $bg: var(--color-bg-card),
  $border: 1px solid var(--color-border),
  $radius: $radius-xl,
  $pad: $space-4
) {
  background-color: $bg;
  border: $border;
  border-radius: $radius;
  padding: $pad;
}
```

호출 예: `@include card-base;` (defaults) / `@include card-base($bg: var(--color-bg-overlay), $radius: $radius-sm, $pad: $space-3 $space-4);`

### 2.2 chip-base (`chip-base`) — ⭐ 신설

작은 라운드 + 인라인 패딩 + nowrap

| 발견 | 시안값 |
|---|---|
| `domains/community/.../categoryChip/CategoryChip.module.scss:1-18` | flex-center + 6px $space-3 + radius-sm + bg-card + border |
| `domains/historyMode/.../chip/Chip.module.scss:1-19` | flex-center + 6px $space-2 + radius-sm + bg-history-chip + border |
| `domains/historyMode/.../HistoryModeScreen.module.scss:260-269` (summaryTag/Accent) | bg-chip-bg-strong + radius 2px + 4px 6px |
| `domains/historyMode/.../stageCard/StageCard.module.scss:26-50` (day/sessionChip) | bg-chip + radius 2px + 4px 6px + h:20 |
| `domains/historyMode/.../stageCard/StageCard.module.scss:83-94` (playerChip) | bg-chip + radius 2px + 4px 6px |

**권장 mixin**:

```scss
@mixin chip-base(
  $size: md,
  $bg: var(--color-bg-card),
  $color: var(--color-text-secondary),
  $border: 1px solid var(--color-border)
) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  background-color: $bg;
  color: $color;
  border: $border;
  white-space: nowrap;
  flex-shrink: 0;
  @if $size == sm { padding: $space-1 $space-2; height: 20px; @include text-badge; }
  @else if $size == md { padding: $space-1 $space-3; @include text-caption; }
  @else if $size == lg { padding: $space-2 $space-3; @include text-body; }
}
```

### 2.3 reset-button (`reset-button`) — 신설

`background:none + border:none + padding:0 + cursor:pointer` 4쌍 반복

| 발견 |
|---|
| `domains/historyMode/.../HistoryModeScreen.module.scss:61-72` (clearButton) |
| `domains/historyMode/.../HistoryModeScreen.module.scss:163-175` (compactClear) |
| `domains/community/.../components/section/Section.module.scss:36-48` (action) |

```scss
@mixin reset-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
```

### 2.4 pressable (`pressable`) — 신설

`cursor:pointer + transition:opacity + &:active{opacity:0.85}` 8쌍 반복

| 발견 |
|---|
| `app/wrapper/mobile/parts/TopBar.module.scss:80-82` (loginBtn) |
| `domains/coupons/.../CouponCard.module.scss:42-45` (couponGoBtn) |
| `domains/events/.../EventCard.module.scss:9-13` (eventCard) |
| `domains/notices/.../NoticeCard.module.scss:7-12, 80-83` (featuredCard, card) |
| `domains/notices/.../OfficialNoticeCard.module.scss:7-12` |
| `domains/community/.../categoryChip/CategoryChip.module.scss:11-18` |
| `domains/historyMode/.../chip/Chip.module.scss:13-19` |
| `domains/historyMode/.../stageCard/StageCard.module.scss:6-13` |

```scss
@mixin pressable($opacity: 0.85, $duration: 0.15s) {
  cursor: pointer;
  transition: opacity #{$duration} ease;
  &:active { opacity: $opacity; }
}
```

### 2.5 hangul-safe (`hangul-safe`) — 신설

한글 줄바꿈 보호. mobile-frame.md § 3.1 필수 패턴이나 현재 단 1곳만 적용 (`NoticeDetailScreen.title:56` `word-break: keep-all`).

```scss
@mixin hangul-safe {
  word-break: keep-all;
  overflow-wrap: anywhere;
}
```

### 2.6 tap-target (`tap-target`) — 신설

≥ 44×44 보장. 현재 `Drawer.menuItem:137 height:52`, `EventCard` 등 자연스럽게 만족하나 명시적 mixin 없음. WCAG 2.5.5 + Apple HIG 충족.

```scss
@mixin tap-target($size: 44px) {
  min-width: $size;
  min-height: $size;
}
```

### 2.7 line-clamp (`line-clamp`) — 신설

여러 줄 ellipsis (`-webkit-line-clamp`). 현재 3곳 raw 반복 + 글로벌 `.ellipsis-2` 클래스만 있음.

| 발견 |
|---|
| `domains/notices/.../NoticeCard.module.scss:60-63` (featuredTitle, 2줄) |
| `domains/community/.../hotPostCard/HotPostCard.module.scss:39-43` (title, 2줄) |
| `domains/community/.../postRow/PostRow.module.scss:45-48` (title, 2줄) |
| `base/_base.scss:109-114` (.ellipsis-2 클래스) |

```scss
@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 2.8 thumb-box (`thumb-box`) — 신설

`width + height + bg + border-radius + overflow:hidden + center img` 카드 썸네일

| 발견 |
|---|
| `domains/community/.../hotPostCard/HotPostCard.module.scss:13-28` (88px) |
| `domains/community/.../postRow/PostRow.module.scss:79-95` (56px) |
| `domains/notices/.../NoticeCard.module.scss:108-122` (64px) |
| `domains/events/.../EventCard.module.scss:16-29` (full width × var) |
| `domains/notices/.../NoticeCard.module.scss:14-27` (featured 160px) |

```scss
@mixin thumb-box($w: 64px, $h: 64px, $bg: var(--color-bg-card), $radius: $radius-sm) {
  width: $w;
  height: $h;
  background-color: $bg;
  border-radius: $radius;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
}
```

### 2.9 absolute-fill (`absolute-fill`) — 신설 / `overlay` 보강

기존 `overlay($z:0)` 가 `position:absolute + inset:0` 만. `position:fixed + inset:0` 패턴이 모달 3곳 반복.

| 발견 |
|---|
| `global/ui/responseModal/ResponseModal.module.scss:3-11` |
| `global/ui/renewalNoticeModal/RenewalNoticeModal.module.scss:3-11` |
| `app/wrapper/mobile/parts/Drawer.module.scss:10-29` |

```scss
@mixin modal-backdrop($bg: rgba(0, 0, 0, 0.55), $z: $z-modal-bg) {
  position: fixed;
  inset: 0;
  background-color: $bg;
  z-index: $z;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2.10 fluid-typography (`text-fluid`) — 신설 (선택)

mobile-frame.md § 6.2. hero / title 큰 글자 320 미만 보호.

```scss
@mixin text-fluid($min, $preferred, $max) {
  font-size: clamp($min, $preferred, $max);
}
```

### 2.11 safe-area-bottom (`safe-area-bottom`) — 신설 (선택)

`env(safe-area-inset-bottom)` — bottom bar / FAB. 현재 `CommunityScreen.fab:36 bottom:20px` 만. 향후 BottomBar 도입 대비.

```scss
@mixin safe-area-bottom($base: 0) {
  padding-bottom: calc(#{$base} + env(safe-area-inset-bottom));
}
```

### 2.12 기존 mixin 대체 가능 사례 (raw 작성됨)

| 위치 | 현재 raw | 권장 대체 |
|---|---|---|
| `domains/home/.../HomeScreen.module.scss:14-18` (.sep) | 8px + bg-card + flex-shrink:0 | `@include section-sep;` (기존) |
| `domains/notices/.../containers/.../NoticeList.module.scss` (없음 — `@include flex-col($space-3)` 사용 OK) | — | OK |
| `domains/historyMode/.../HistoryModeScreen.module.scss:8-12` (.body) | `display:flex; flex-direction:column; gap:12px; padding:12px $layout-h-pad` | `@include flex-col($space-3); padding: $space-3 $layout-h-pad;` |
| `domains/historyMode/.../HistoryModeScreen.module.scss:23-37` (.searchInputBox) | flex + align-items: center + padding | `@include flex-row(0, center)` + padding |
| `domains/home/.../section/notice/NoticeSection.module.scss:1-7` (.noticeList) | flex-col + gap | `@include flex-col($space-1);` |
| `domains/home/.../section/notice/NoticeSection.module.scss:9-20` (.item) | flex + gap + bg + border + radius + padding | `@include flex-row($space-3); @include card-base(...);` |
| `domains/coupons/.../CouponCard.module.scss:5-9` | flex + col + gap | `@include flex-col($space-2);` |
| `domains/coupons/.../CouponCard.module.scss:17-22` (.couponTop) | flex + between + gap | `@include flex-between; gap: $space-2;` |
| `domains/events/.../EventCard.module.scss:50-60` (.badge) | flex + position absolute + radius + text-badge | `@include flex-center;` 추가 |
| `global/ui/responseModal/ResponseModal.module.scss:3-11` | flex + center + fixed inset | `@include modal-backdrop;` (신설 후) |
| `global/ui/renewalNoticeModal/RenewalNoticeModal.module.scss:3-11` | 동일 | 동일 |
| `domains/historyMode/.../HistoryModeScreen.module.scss:178-189` (.empty) | flex + col + center + bg + border + radius | `@include flex-col-center; @include card-base($bg: ..., $radius: $radius-sm, $pad: 15px);` |

### 2.13 mixin 요약 표

| # | 신/대체 | mixin | 신설 위치 (권장) | 우선순위 |
|---|---|---|---|---|
| 1 | 신설 | `card-base` | `mixins/_layout.scss` 또는 신규 `mixins/_surface.scss` | P0 |
| 2 | 신설 | `chip-base` | `mixins/_layout.scss` | P0 |
| 3 | 신설 | `reset-button` | `mixins/_layout.scss` | P1 |
| 4 | 신설 | `pressable` | `mixins/_layout.scss` | P0 |
| 5 | 신설 | `hangul-safe` | `mixins/_typography.scss` | P0 (mobile-frame § 3.1) |
| 6 | 신설 | `tap-target` | `mixins/_layout.scss` | P1 |
| 7 | 신설 | `line-clamp($n)` | `mixins/_typography.scss` | P0 |
| 8 | 신설 | `thumb-box` | `mixins/_layout.scss` | P1 |
| 9 | 신설 | `modal-backdrop` | `mixins/_layout.scss` | P1 |
| 10 | 신설 | `text-fluid` | `mixins/_typography.scss` | P2 |
| 11 | 신설 | `safe-area-bottom` | `mixins/_layout.scss` | P2 |
| 12 | 수정 | `bg-image` (`$url` 파라미터화) | `mixins/_background.scss` | 🔴 P0 (현재 깨짐) |
| 13 | 대체 | flex/flex-col/flex-between 누락 | (각 도메인) | P1 |
| 14 | 대체 | section-sep, h-pad, scroll-row 미사용 | (각 도메인) | P1 |

---

## § 3. 토큰 신설/매핑

### 3.1 magic value 발견 + 권고

| 매직값 | 발견 위치 | 권고 | 신설/대체 토큰 |
|---|---|---|---|
| `13px` | `MobileLayout.module.scss:14` (loading font-size) | 🟡 대체 | `$font-size-13` (있음) |
| `2px` (radius, sep dot, accent bar) | `HistoryModeScreen:213,216,254,265,406`, `StageCard:30,42,86` | ✅ 신설 | `$radius-xs: 2px` (`_radius.scss`) |
| `3px` (border-strip, divider 두께) | `Drawer.module.scss:152`, `HistoryModeScreen:213,247`, `NoticeDetailScreen:66` | 🟡 콘텐츠 의도 (액센트 strip) | 유지 또는 `$border-strip:3px` |
| `5px` (borderRadius) | `HistoryModeScreen:329` (summaryMatItem) | ✅ 8pt 정합 위반 — `$radius-sm:4px` 또는 `$radius-md:6px` 으로 매핑 | 매핑 |
| `6px` (gap, padding) | `HistoryModeScreen:208,361,389` 등 다수 | ❌ 컨텐츠 의도 모호 — 8pt 권고는 `$space-1(4)` 또는 `$space-2(8)` 매핑 | `$space-2` 매핑 권장 |
| `9px`, `11px`, `15px` (padding) | `HistoryModeScreen:18,36,140,182,240,402` | ✅ 8pt 정합 위반 — `$space-3(12)` 또는 `$space-4(16)` 매핑 | `$space-3` 매핑 권장 |
| `8px` (StageCard.playerRow:65 padding) | `StageCard:65` | 🟡 대체 | `$space-2` |
| `20px` (CommunityScreen.fab bottom) | `CommunityScreen:37` | 🟡 대체 | `$space-5` |
| `4px` (line-height/transform 등) | `Drawer:51` | 🟡 대체 | `$space-1` |
| `14px` (RenewalNoticeModal modal radius) | `RenewalNoticeModal:18` | ❌ 매직 — 신설 또는 `$radius-2xl(12)`/`$radius-xl(10)` 매핑 | `$radius-2xl` 매핑 권장 |
| `200px` (TopBar.pageTitle max-width) | `TopBar:120` | 🟡 화면 폭 의존 — 유지 권장 (또는 `$pagetitle-max:200px`) | 유지 |
| `52px` (Drawer.menuItem height, quickIcon size) | `Drawer:137`, `QuickSection:25` | 🟡 매직 — `$tap-target-lg:52px` 신설 또는 `$layout-topbar-height` 재사용 | 신설 권고 |
| `36px` (chipRow / compactBar / autoComplete trigger) | `HistoryModeScreen:34,133,206` 다수 | ✅ 신설 — 작은 컨트롤 표준 height | `$control-height-sm:36px` (`_spacing.scss`) |
| `42px` (modal iconSuccess) | `ResponseModal:24,30` | ❌ 매직 — `$font-size-*` 스케일에 없음 | font-size 신설 또는 px 유지 |
| `#1e1e1e` (modal bg) | `ResponseModal:15`, `RenewalNoticeModal:17` | ✅ 매직 — `var(--color-bg-elevated)` 또는 신규 `--color-bg-modal` 매핑 | 토큰 매핑 |
| `#e5e7eb` (modal text) | `ResponseModal:39`, `RenewalNoticeModal:27` | ✅ 매직 — `var(--color-text-primary)` 매핑 | 토큰 매핑 |
| `#6366f1`, `#4f46e5` (modal btn) | `ResponseModal:48,55`, `RenewalNoticeModal:38,45` | ✅ 매직 — `var(--color-brand-violet)` 매핑 | 토큰 매핑 |
| `#4ade80`, `#f87171` (modal icon) | `ResponseModal:25,31` | ✅ 매직 — status success/danger 매핑 | 토큰 매핑 |
| `9999` (z-index) | `ResponseModal:11`, `RenewalNoticeModal:11` | ✅ 매직 — `$z-modal` (410) 또는 `$z-toast` (500) 매핑 | `$z-modal-bg` |
| `50` (z-index for fab) | `CommunityScreen:37` | 🟡 대체 | `$z-dropdown` (100) 또는 `$z-sticky` (200) |
| `8px` (border-radius for confirmBtn) | `ResponseModal:45`, `RenewalNoticeModal:35` | 🟡 대체 | `$radius-lg` |
| `10px 0` (modal btn padding) | `ResponseModal:44`, `RenewalNoticeModal:34` | 🟡 대체 | `$space-3 0` (12px) — 가까운 8pt 매핑 또는 `$space-2 0`(8px) |
| `0.5px` (border-width) | `LabelBadge:32 X — PinnedBadge:30`, `CommunityBadge:11`, `StageCard:98` | 🟡 retina 시 1px 보다 얇음 — 유지 OK | 유지 |
| `8px` (font-size — detailTag, playerTargetTag) | `HistoryModeScreen:411,511` | ❌ 매직 — `$font-size-9` (9px) 매핑 | 매핑 |
| `20px` (summaryName font-size) | `HistoryModeScreen:280` | 🟡 매직 — `$font-size-22` (22px) 또는 신설 `$font-size-20` | 매핑 (22 로 좁힘) |
| `0.4` opacity (quizCard emptyIcon) | `QuizSection:26` | 🟡 매직 — `$opacity-muted: 0.4` 신설 권장 | 신설 검토 |
| `0.55` (modal overlay bg alpha) | `ResponseModal:6`, `RenewalNoticeModal:6` | 🟡 대체 — `rgba(0,0,0,0.5)` 또는 `--color-overlay` CSS 변수 신설 | 신설 검토 |

### 3.2 신설 권장 토큰 요약

| 파일 | 토큰 | 값 | 사유 |
|---|---|---|---|
| `_radius.scss` | `$radius-xs` | `2px` | history chip / day chip 다수 사용 |
| `_spacing.scss` | `$control-height-xs` | `32px` | small chip |
| `_spacing.scss` | `$control-height-sm` | `36px` | 검색 input / chip row trigger 표준 |
| `_spacing.scss` | `$control-height-md` | `40px` | secondary button |
| `_spacing.scss` | `$control-height-tap` | `44px` | tap-target 표준 (mobile-frame § 5) |
| `_spacing.scss` | `$control-height-lg` | `48px` | primary button |
| `_spacing.scss` | `$control-height-xl` | `52px` | drawer menu item / quickIcon (TopBar 와 동일) |
| `semantic/_color.scss` | `--color-bg-modal` | `var(--color-bg-elevated)` 재사용 권장 (사용자 결정) | modal 2종 |
| `semantic/_color.scss` | `--color-overlay` | `rgba(0,0,0,0.55)` | modal backdrop 다수 |

### 3.3 갱신 권장 토큰 (Track 0 — 480 정합)

| 파일 | 토큰 | 현재 | 변경 | 사유 |
|---|---|---|---|---|
| `_spacing.scss:21` | `$layout-screen-width` | `375px` | `480px` | mobile-frame.md § 1 단일 기준 = 480 |
| `_spacing.scss:23` | `$layout-card-width` | `343px` (375-16×2) | `448px` (480-16×2) | wrapper 480 기반 카드 폭 |

⚠️ 호출처 grep 후 변경. 현재 grep 결과 호출처 0건 — destructive 위험 낮음.

### 3.4 rem 강제 — SCSS function / mixin 신설 (Track 0)

mobile-frame.md § 6.4 룰. 도메인이 부득이 토큰 외 사이즈 필요 시 사용.

```scss
// mixins/_typography.scss (Track 0 신설)
//
// px → rem 변환 (16px html base)
// 사용: .foo { padding: rem(14); }  → 0.875rem
@function rem($px) {
  @if $px == 0 { @return 0; }
  @return calc($px / 16) * 1rem;
}

// font-size 만 강제 rem (mixin)
@mixin font-size-rem($px) {
  font-size: rem($px);
}
```

⭐ frontend-developer 가 Track 1~4 에서 매직 px 매핑 시 우선순위:
1. 가까운 `$space-*` / `$font-size-*` 토큰 매핑 (1순위 — 디자인 시스템 정합)
2. 토큰 외 사이즈 필요 시 `rem($px)` (2순위 — rem 단위 강제)
3. 직접 px (3순위 — 1px border, 0.5px hairline, 100% 외 금지)

### 3.5 신설 변수가 필요하지 않은 케이스 (유지)

- `200px` (TopBar.pageTitle max-width) — 단일 사용, 컨텐츠 의도. 단 `rem(200) = 12.5rem` 로 변환 권장
- `8px` (font-size, detailTag) — `$font-size-9` (9px) 로 매핑하면 충분, 별도 토큰 X
- `3px` border strip — 1회용 액센트, 별도 토큰 X
- `0.5px` border — retina hairline, 유지
- `1px` border — hairline 유지 OK

---

## § 4. Badge 활용 가이드 + 가짜 badge 치환표

### 4.1 발견된 도메인 자체 badge / chip / tag 목록 (8건)

| # | 위치 | 시각 사양 | 가장 가까운 표준 | 치환 권고 |
|---|---|---|---|---|
| B1 | `domains/home/.../HeroSection.module.scss:31-43` `.heroBadge` | bg-brand-violet + #fff + radius-sm + h:20 + 0 $space-2 + text-badge | **StatusBadge.active** (`bg: brand-violet`, 동일 사양) | ✅ 즉시 치환 — `<StatusBadge variant="active" label="이벤트 진행중" />` (or `label` prop 으로 임의 텍스트) |
| B2 | `domains/events/.../EventCard.module.scss:50-63` `.badge / .badgeActive / .badgeExpired` | bg-brand-violet 또는 bg-deep + #fff/text-primary + radius-sm + h:20 + text-badge | **StatusBadge.active** + **StatusBadge.ended** | ✅ 즉시 치환 — active = `StatusBadge.active`, expired = `StatusBadge.ended` (단, EventCard 의 position:absolute top/left 는 wrapper `<span>` 처리 필요) |
| B3 | `domains/coupons/.../CouponCard.module.scss:33-45` `.couponGoBtn` | bg-brand-dark + #fff + radius-sm + h:24 + text-badge + 0 $space-2 | **StatusBadge.active 변형** (다만 클릭 가능한 button) | 🟡 button 으로 유지 권장 (badge 컴포넌트는 `<span>` 시맨틱). 단 base 는 `text-badge` mixin 으로 정합됨 → 코드 그대로 OK |
| B4 | `domains/community/.../communityBadge/CommunityBadge.module.scss` `.newBadge` | text-badge + 3px $space-2 + radius-sm + border 0.5px + alpha bg + community text | **PinnedBadge.mustread** (red) | 🟡 prop 추가/확장 후 치환 — "NEW" 의미가 강한데 PinnedBadge variant 에 `new` 없음. 옵션: (a) `PinnedBadge.mustread` 재사용 (mustread label=NEW), (b) PinnedBadge 에 `new` variant 신설 제안 |
| B5 | `domains/community/.../boardTagBadge/BoardTagBadge.module.scss` `.badge` | text-badge + 2px 6px + radius 4px + border 0.5px + bg-card + text-secondary | **LabelBadge.cafe** (gray) 와 유사 | 🟡 prop 추가/확장 후 치환 — neutral gray + bordered. LabelBadge 는 border 없음, PinnedBadge 는 border 있으나 색이 너무 진함. 옵션: (a) PinnedBadge 에 `neutral` variant 신설, (b) 도메인 유지 + base 는 `text-badge` mixin 으로 정합 (현재 정합됨 OK) |
| B6 | `domains/community/.../categoryChip/CategoryChip.module.scss` `.chip` | flex-center + 6px $space-3 + radius-sm + bg-card + border + text-caption | (chip — badge 아님) | ❌ badge 아님 — `chip-base` mixin (§ 2.2) 사용 권장 |
| B7 | `domains/historyMode/.../chip/Chip.module.scss` `.chip` | flex-center + 6px $space-2 + radius-sm + bg-history-chip + border + text-caption | (chip — badge 아님) | ❌ badge 아님 — `chip-base` mixin 사용 권장 |
| B8 | `domains/historyMode/.../HistoryModeScreen.module.scss:406-421` `.detailTag` | bg-brand-alpha-15 + brand text + radius-sm + 4px 6px + h:18 + 8px font + uppercase | **LabelBadge.update** (purple alpha) 와 거의 동일 | 🟡 즉시 치환 — `LabelBadge.update` (label 임의) 또는 padding/height 미세 차이만 검토. 8px font-size → `$font-size-9` 매핑 |
| B9 | `domains/historyMode/.../stageCard/StageCard.module.scss:26-49` `.dayChip / .sessionChip` | bg-chip + radius 2px + 4px 6px + font-size-10 + h:20 | (chip — 작은 라벨) | ❌ badge 아님 — `chip-base($size: sm)` mixin 사용 권장 |
| B10 | `domains/historyMode/.../stageCard/StageCard.module.scss:83-101` `.playerChip / .playerHighlight` | bg-chip + radius 2px + 4px 6px + font-size-9 + h:20 + (highlight: brand-alpha + brand border) | (작은 라벨 chip) | ❌ badge 아님 — `chip-base($size: sm)` 사용 권장 |
| B11 | `app/wrapper/mobile/parts/Drawer.module.scss:174-184` `.badge` | flex-center + text-badge + min-w:20 + aspect 1/1 + radius-full + bg-brand-violet | (count badge — 원형) | 🟡 도메인 의미 (메뉴 알림 카운트) — 유지 권장. 단 base 는 `text-badge` mixin 정합 OK |

### 4.2 Badge variant 추가 (사용자 확정 — 2026-05-31)

| 컴포넌트 | 추가 variant | 색 제안 | 사유 | 확정 |
|---|---|---|---|---|
| `PinnedBadge` | `new` | red (`#f87171`) alpha + border (`$pinned-red-*` 재사용) | CommunityBadge 흡수 | ✅ D1=a |
| `PinnedBadge` | `neutral` | gray (`#9ca3af`) alpha + border (`$pinned-gray-*` 재사용) | BoardTagBadge 흡수 | ✅ D1=a |
| `StatusBadge` | `expired` | bg-deep / text-primary | EventCard.badgeExpired 와 정합 | ✅ D2=a |

⭐ Track 0 가 PinnedBadge.jsx / .module.scss 와 StatusBadge.jsx / .module.scss 의 시그니처 변경 (variant 추가) 을 수행. Track 1 (StatusBadge.expired 사용) / Track 4 (PinnedBadge.new, neutral 사용) 가 이를 호출.

### 4.3 유지하는 도메인 badge / chip 의 base 룰

- `font` → 반드시 `@include text-badge` (현재 모두 정합)
- `padding` → spacing 토큰 (`$space-1 $space-2` 등) — magic px 금지
- `border-radius` → `$radius-sm` 또는 `$radius-xs` (신설)
- `white-space:nowrap + flex-shrink:0` 필수
- 색은 도메인 로컬 토큰 (`--color-community-new-*` 등) 유지 OK

---

## § 5. 320 ~ 480 보호 패턴 적용 위치

### 5.1 적용 필요 영역 식별

| # | 파일:line | 위험 | 권장 패치 |
|---|---|---|---|
| P1 | `TopBar.module.scss:120` `.pageTitle max-width:200px` | 320 폭에서 `max-width:200px` 가 화면 폭의 62% — long title 잘림 OK (`text-ellipsis` 적용됨) | 유지 OK |
| P2 | `MobileLayout.module.scss:1-5` `.appWrapper { overflow:hidden }` | hidden 으로 가로 보호 OK | 유지 |
| P3 | `domains/notices/NoticeDetailScreen.module.scss:51-57` `.title font-size:$font-size-22` | 320 미만 잘림 위험 | `@include small-mobile { font-size: $font-size-17; }` 또는 `text-fluid` |
| P4 | `domains/historyMode/HistoryModeScreen.module.scss:280` `.summaryName font-size:20px` | 320 미만 잘림 위험 | `@include small-mobile { font-size: $font-size-17; }` |
| P5 | `domains/home/.../HeroSection.module.scss:45-50` `.heroTitle @include text-hero` (28px) | 320 미만 잘림 위험 | `@include small-mobile { font-size: $font-size-22; }` 또는 `text-fluid(22px, calc(...), 28px)` |
| P6 | `domains/historyMode/.../HistoryModeScreen.module.scss` 곳곳 `.chipRow flex-wrap:wrap` | wrap 적용됨 OK | 유지 |
| P7 | `domains/community/.../postRow/PostRow.module.scss:21-26` `.titleRow gap:$space-2; min-width:0 (없음)` | flex 자식 `.title` `min-width:0` 있음 OK | 부모도 `min-width:0` 확인 (`titleRow`) — **추가 권장** |
| P8 | `domains/community/.../hotPostCard/HotPostCard.module.scss:1-11` `.card width:160px` | 320 폭에서 hot scroll 정상. width:160px 고정 OK | 유지 |
| P9 | `domains/events/.../EventList.module.scss:6 width:160px` | 동일 — scroll-row 내 카드 | 유지 |
| P10 | `domains/coupons/.../CouponList.module.scss:6 width:200px` | 320 폭 일부 가림. scroll-row 라 OK | 유지 |
| P11 | `global/ui/responseModal/ResponseModal.module.scss:14 .modal width:320px` | **320 폭 정확히 차지 — gutter 0** | `width: 320px; max-width: calc(100% - 32px);` 로 변경 (RenewalNoticeModal 처럼) — **권장 패치** |
| P12 | `domains/home/.../section/notice/NoticeSection.module.scss:9-20` `.item` `min-width:0` 누락 | `.content flex:1; overflow:hidden` 있음 OK | 부모 `.item` 에 `min-width:0` 추가 권장 |
| P13 | `domains/notices/.../NoticeDetailScreen.module.scss:51-57` `.title word-break:keep-all` ✅ | 적용됨 | 모범. 다른 긴 한글 제목 (couponCard.title, eventCard.title, postRow.title) 에도 `hangul-safe` mixin 적용 권장 |
| P14 | `domains/coupons/.../CouponCard.module.scss:24-31` `.couponCode letter-spacing + ellipsis` | code 길면 잘림 — `text-ellipsis` 있음 | OK |
| P15 | `domains/notices/.../NoticeCard.module.scss:46-51` `.featuredMeta + .chevron` | `gap:$space-2` flex-row OK | OK |
| P16 | `img / svg` 글로벌 base 에 `max-width:100%` 적용됨 (`base/_base.scss:73`) | OK | 유지 |
| P17 | `domains/historyMode/.../HistoryModeScreen.module.scss:23-37` `.searchInputBox padding:0 9px` | 9px 매직 + 작은 폭 OK | 토큰 매핑만 |
| P18 | tap target — `domains/community/.../categoryChip/CategoryChip:1-18 padding:6px $space-3 + text-caption` | height ≈ 26px < 44px | `tap-target` mixin 적용 권장 (visual 변경 없이 padding 확장) |
| P19 | tap target — `domains/historyMode/.../chip/Chip:1-19 padding:6px $space-2 + text-caption` | 동일 | 동일 |

### 5.2 보호 패턴 적용 체크리스트 (트랙별 적용)

- [ ] hangul-safe (긴 한글 제목 카드 7개)
- [ ] line-clamp 일관 적용 (raw 3건 → mixin)
- [ ] tap-target ≥ 44px (chip / button 2건 확장)
- [ ] small-mobile 큰 title fallback (P3, P4, P5 — 3건)
- [ ] modal width gutter 확보 (P11)
- [ ] flex 자식 `min-width:0` (P7, P12 — 2건)

---

## § 6. 작업 분배표 (Track 구조)

### 6.1 트랙 개요

| Track | 담당 | 작업량 (예상 line) | 의존 |
|---|---|---|---|
| **Track 0** | 글로벌 mixin/토큰 신설 + `bg-image` 수정 | +180 line, 신규 파일 1개 (`_surface.scss` 선택), `_radius`/`_spacing`/`_typography` 추가 | 없음 (선행) |
| **Track 1** | app wrapper + home + global ui section + 모달 2종 토큰화 | ~150 line 변경 | Track 0 |
| **Track 2** | coupons + events + notices (mobile) | ~200 line 변경 | Track 0 |
| **Track 3** | historyMode (가장 큰 단일 파일) | ~250 line 변경 (HistoryModeScreen ≈ 520 line) | Track 0 |
| **Track 4** | community (mobile, 6 components + 2 screens) | ~200 line 변경 | Track 0 |

**총 5 트랙** (Track 0 + 4 병렬). Track 1~4 는 disjoint 파일 풀.

### 6.2 트랙별 상세

#### Track 0 — 글로벌 mixin/토큰 선행

**수정 파일**:
- `web/src/global/styles/mixins/_layout.scss` (+ `card-base`, `chip-base`, `reset-button`, `pressable`, `tap-target`, `thumb-box`, `modal-backdrop`, `safe-area-bottom`)
- `web/src/global/styles/mixins/_typography.scss` (+ `hangul-safe`, `line-clamp`, `text-fluid`, **`rem()` function**, **`font-size-rem($px)` mixin**)
- `web/src/global/styles/mixins/_background.scss` (수정 — `bg-image` `$url` 파라미터화 🔴)
- `web/src/global/styles/variables/_radius.scss` (+ `$radius-xs:2px`)
- `web/src/global/styles/variables/_spacing.scss` (+ `$control-height-xs/sm/md/tap/lg/xl`, **`$layout-screen-width: 480px` 갱신**, **`$layout-card-width: 448px` 갱신**)
- `web/src/global/styles/semantic/color.scss` (+ `--color-bg-modal: var(--color-bg-elevated)` 매핑, `--color-overlay: rgba(0,0,0,0.55)`)
- `web/src/global/styles/index.scss` (forward 추가 없음 — 기존 forward 가 모든 mixin/function 커버)

**브리프 핵심 룰**: 기존 토큰/mixin 시그니처 변경 X. 신설 + 2건 수정 (`bg-image`, layout const 480 정합).

#### Track 1 — app wrapper + home + global ui + 모달

**파일 풀**:
- `web/src/app/wrapper/mobile/MobileLayout.module.scss`
- `web/src/app/wrapper/mobile/parts/TopBar.module.scss`
- `web/src/app/wrapper/mobile/parts/Drawer.module.scss`
- `web/src/domains/home/components/HomeScreen.module.scss`
- `web/src/domains/home/components/section/hero/HeroSection.module.scss`
- `web/src/domains/home/components/section/quick/QuickSection.module.scss`
- `web/src/domains/home/components/section/quiz/QuizSection.module.scss`
- `web/src/domains/home/components/section/notice/NoticeSection.module.scss`
- `web/src/global/ui/mobile/section/Section.module.scss`
- `web/src/global/ui/responseModal/ResponseModal.module.scss`
- `web/src/global/ui/renewalNoticeModal/RenewalNoticeModal.module.scss`

**적용 mixin**: `flex-*`, `card-base`, `pressable`, `modal-backdrop`, `hangul-safe`, `line-clamp`, `text-fluid`(P5), `section-sep`
**적용 토큰**: `--color-bg-modal`, `--color-overlay`, `--color-brand-violet`, `--color-text-primary`, `$z-modal-bg`, `$radius-lg/xl`, `$space-*`
**Badge 치환**: B1 (HeroSection.heroBadge → `StatusBadge.active`)
**320 보호**: P3 (skip, NoticeDetail 은 Track 2), P5 (HeroSection.heroTitle), P11 (ResponseModal width), P12 (NoticeSection.item min-width)
**예상 변경 라인**: ~150

⚠️ `VisibleToggle.module.scss` 는 전체 주석 (dead) — touch X 권고

#### Track 2 — coupons + events + notices

**파일 풀**:
- `web/src/domains/coupons/mobile/containers/public/CouponList.module.scss`
- `web/src/domains/coupons/mobile/components/couponCard/CouponCard.module.scss`
- `web/src/domains/events/mobile/containers/public/EventList.module.scss`
- `web/src/domains/events/mobile/components/eventCard/EventCard.module.scss`
- `web/src/domains/notices/mobile/NoticeScreen.module.scss`
- `web/src/domains/notices/mobile/NoticeDetailScreen.module.scss`
- `web/src/domains/notices/mobile/containers/public/NoticeList.module.scss`
- `web/src/domains/notices/mobile/components/noticeCard/NoticeCard.module.scss`
- `web/src/domains/notices/mobile/components/officialNoticeCard/OfficialNoticeCard.module.scss`

**적용 mixin**: `card-base`, `pressable`, `flex-*`, `thumb-box`, `line-clamp`, `hangul-safe`, `h-pad`
**적용 토큰**: `$radius-xl/lg/sm`, `$space-*`, `var(--color-bg-card/overlay/deepest)`
**Badge 치환**: B2 (EventCard.badge/badgeActive/badgeExpired → `StatusBadge`)
**320 보호**: P3 (NoticeDetail.title small-mobile fallback), P13 (couponCard.title / eventCard.title hangul-safe)
**예상 변경 라인**: ~200

#### Track 3 — historyMode (단일 큰 도메인)

**파일 풀**:
- `web/src/domains/historyMode/mobile/HistoryModeScreen.module.scss` (≈ 520 line)
- `web/src/domains/historyMode/mobile/components/chip/Chip.module.scss`
- `web/src/domains/historyMode/mobile/components/stageCard/StageCard.module.scss`

**적용 mixin**: `chip-base`, `card-base`, `reset-button`, `flex-*`, `pressable`, `hangul-safe`
**적용 토큰**: `$radius-xs:2px` (신설), `$space-1/2/3/4`, `$control-height-sm:36px` (신설), `$font-size-9/10/11` (8px / 20px 매직 매핑)
**Badge 치환**: B8 (detailTag → `LabelBadge.update`) — 또는 도메인 유지 + base 정합
**320 보호**: P4 (summaryName small-mobile fallback), P19 (Chip tap-target)
**매직값 매핑** (가장 무거움): 6px/9px/11px/15px → 8pt 정합 매핑 (트랙 내에서 결정 + decisions log)
**예상 변경 라인**: ~250

#### Track 4 — community (mobile)

**파일 풀**:
- `web/src/domains/community/mobile/CategoryScreen.module.scss`
- `web/src/domains/community/mobile/CommunityScreen.module.scss`
- `web/src/domains/community/mobile/components/categoryChip/CategoryChip.module.scss`
- `web/src/domains/community/mobile/components/hotPostCard/HotPostCard.module.scss`
- `web/src/domains/community/mobile/components/communityBadge/CommunityBadge.module.scss`
- `web/src/domains/community/mobile/components/boardTagBadge/BoardTagBadge.module.scss`
- `web/src/domains/community/mobile/components/postRow/PostRow.module.scss`
- `web/src/domains/community/mobile/components/section/Section.module.scss`

**적용 mixin**: `chip-base`, `card-base`, `pressable`, `flex-*`, `thumb-box`, `line-clamp`, `hangul-safe`, `reset-button`
**적용 토큰**: `$radius-sm`, `$space-1/2/3/4`, `$z-dropdown` (fab z-index 50 매핑)
**Badge 치환**: B4 (CommunityBadge.newBadge — 🟡 `PinnedBadge.mustread` 재사용 옵션 또는 유지), B5 (BoardTagBadge — 🟡 유지 + base 정합), B6/B7 (categoryChip / chip — chip-base mixin)
**320 보호**: P7 (PostRow.titleRow min-width:0), P18 (CategoryChip tap-target)
**예상 변경 라인**: ~200

### 6.3 트랙간 disjoint 검증

| 파일 | Track |
|---|---|
| `app/wrapper/mobile/**/*.scss` | Track 1 |
| `domains/home/**/*.scss` | Track 1 |
| `global/ui/**/*.scss` (mobile section, response/renewal modal) | Track 1 |
| `domains/coupons/**/*.scss` | Track 2 |
| `domains/events/**/*.scss` | Track 2 |
| `domains/notices/**/*.scss` | Track 2 |
| `domains/historyMode/**/*.scss` | Track 3 |
| `domains/community/mobile/**/*.scss` | Track 4 |
| `global/styles/**/*.scss` | Track 0 only |

⭐ disjoint OK. 동일 파일을 두 트랙이 만지지 않음. 단 글로벌 mixin 파일은 Track 0 만 Edit. 1~4 는 Read only.

---

## § 7. frontend-developer 디스패치 brief 템플릿

> 메인 어시스턴트가 그대로 `Agent(subagent_type: "frontend-developer", prompt: ...)` 에 복붙.

### 7.1 Track 0 brief

```
[Track 0 — 글로벌 SCSS mixin/토큰 선행 작업]

목적: 도메인 SCSS 리팩토링 전 글로벌 mixin/토큰 신설. 후속 Track 1~4 가 즉시 사용 가능하게 한다.

입력:
- 헌법: docs/global-guide/design/mobile-frame.md
- 분석문서: docs/global-guide/develop/specs/fe/scss-mixin-refactor-analysis.md (§ 2, § 3 참조)
- 현 mixin: web/src/global/styles/mixins/{_layout,_typography,_flex,_media,_table,_background}.scss
- 현 토큰: web/src/global/styles/variables/{_spacing,_radius,_font,_colors,_breakpoints,_zindex}.scss
- 글로벌 forward: web/src/global/styles/index.scss
- semantic: web/src/global/styles/semantic/color.scss

작업 범위 (수정 가능 파일):
- web/src/global/styles/mixins/_layout.scss        (+ card-base, chip-base, reset-button, pressable, tap-target, thumb-box, modal-backdrop, safe-area-bottom)
- web/src/global/styles/mixins/_typography.scss    (+ hangul-safe, line-clamp, text-fluid, rem() function, font-size-rem($px) mixin)
- web/src/global/styles/mixins/_background.scss    (수정 — bg-image $url 파라미터화. 🔴 현재 깨짐)
- web/src/global/styles/variables/_radius.scss     (+ $radius-xs: 2px)
- web/src/global/styles/variables/_spacing.scss    (+ $control-height-xs:32px, $control-height-sm:36px, $control-height-md:40px, $control-height-tap:44px, $control-height-lg:48px, $control-height-xl:52px / 수정: $layout-screen-width 375→480, $layout-card-width 343→448)
- web/src/global/styles/variables/_colors.scss     (+ $color-bg-modal: #1e1e1e — D3 확정 신규 raw 토큰)
- web/src/global/styles/semantic/color.scss        (+ --color-bg-modal: #1e1e1e — D3 확정 신규 색, --color-overlay: rgba(0,0,0,0.55))
- ⭐ web/src/global/ui/badge/PinnedBadge.jsx        (+ DEFAULT_LABELS 에 new:"NEW", neutral:"" 추가 — D1 확정)
- ⭐ web/src/global/ui/badge/PinnedBadge.module.scss (+ .new / .neutral variant — D1 확정. $pinned-red-*, $pinned-gray-* 재사용)
- ⭐ web/src/global/ui/badge/StatusBadge.jsx        (+ DEFAULT_LABELS 에 expired:"종료" 추가 — D2 확정)
- ⭐ web/src/global/ui/badge/StatusBadge.module.scss (+ .expired variant: bg-deep + text-primary — D2 확정)

회피 영역:
- 기존 토큰 rename / 삭제 절대 금지 (단 $layout-screen-width, $layout-card-width 두 개만 값 갱신 — 호출처 0건 확인 후)
- 기존 mixin 시그니처 변경 금지 (단 bg-image 만 예외 — $url 추가)
- 기존 Badge variant 의 색 / 사이즈 변경 X (추가만)
- 도메인 SCSS (web/src/domains/**) touch X — Track 1~4 담당
- html font-size: 16px (base/_base.scss:20) 변경 X — rem base

적용 룰:
- 분석문서 § 2 mixin 시안을 SCSS 로 구현 (시안은 예시 — 더 깔끔하게 다듬어도 OK)
- 신규 mixin 도 기존 patterns 의 @use 룰을 따름 (`@use '../variables/...' as *`)
- mixin 파라미터 default 명시 (대부분 호출이 무인자로 가능하게)
- rem() function 은 SCSS @function 으로 작성 — calc 시 / 연산 대신 math.div 사용 권장 (Dart Sass 호환)
- index.scss 추가 forward 불필요 (기존 forward 가 _layout/_typography/_background 커버)
- mobile-frame.md § 4.3 px 룰 — 글로벌 토큰 파일 내부는 px 사용 허용 (raw 정의)

검증:
- npm --prefix web run build (또는 dev) 컴파일 에러 없음
- 신규 mixin 호출이 가능한지 작은 .module.scss 테스트는 불필요 (Track 1~4 가 실 호출)
- 시각 회귀: 본 트랙은 mixin/토큰 추가만 — CSS 출력 영향 없음 (단 bg-image 수정은 호출처가 0건이라 무영향, layout const 480 변경도 호출처 0건 확인 시 무영향)
- $layout-screen-width / $layout-card-width 호출처 grep: `grep -rn "layout-screen-width\|layout-card-width" web/src/` — 0건이면 무리 없이 갱신

진행 보고:
- .claude/.progress/fe-scss-track-0-{timestamp}.log 에 단계별 1줄 append
- 포맷: .claude/conventions/agent-progress.md 따름
- 3회 실패 시 [미해결] 마커 후 다음 단계

산출 후 메인에 보고:
- 추가된 mixin 개수, 토큰 개수
- bg-image 수정 결과
- 다음 Track 1~4 가 사용할 mixin 시그니처 요약
```

### 7.2 Track 1 brief

```
[Track 1 — app wrapper + home + global ui + 모달 SCSS 리팩토링]

목적: app wrapper, home 도메인, global ui (section/modal) 의 SCSS 를 mixin-first 로 정리. 매직 컬러를 토큰으로 치환하고, HeroSection 의 자체 badge 를 표준 StatusBadge 로 치환한다.

입력:
- 헌법: docs/global-guide/design/mobile-frame.md
- 분석문서: docs/global-guide/develop/specs/fe/scss-mixin-refactor-analysis.md (§ 6.2 Track 1 참조)
- Track 0 산출물 (글로벌 신규 mixin/토큰) — 이미 완료된 상태 가정
- 표준 Badge: web/src/global/ui/badge/{StatusBadge,LabelBadge,PinnedBadge}.{jsx,module.scss}

작업 범위 (수정 가능 파일):
- web/src/app/wrapper/mobile/MobileLayout.module.scss
- web/src/app/wrapper/mobile/parts/TopBar.module.scss
- web/src/app/wrapper/mobile/parts/Drawer.module.scss
- web/src/domains/home/components/HomeScreen.module.scss
- web/src/domains/home/components/section/{hero,quick,quiz,notice}/*.module.scss (4개)
- web/src/global/ui/mobile/section/Section.module.scss
- web/src/global/ui/responseModal/ResponseModal.module.scss
- web/src/global/ui/renewalNoticeModal/RenewalNoticeModal.module.scss
- web/src/domains/home/components/section/hero/HeroSection.jsx  ⭐ (B1 badge 치환 — JSX 1줄 변경)

회피 영역:
- web/src/global/styles/** (Track 0 만)
- web/src/global/ui/badge/** (시그니처 변경 X)
- web/src/global/ui/visibleToggle/** (dead file — touch X)
- 다른 트랙 파일 (coupons/events/notices/historyMode/community)

적용 룰:
- mixin 우선: card-base, pressable, flex-*, modal-backdrop, hangul-safe, line-clamp, section-sep, h-pad 등 적극 사용
- 매직 값 금지: 모든 px → $space-* / $radius-* / $font-size-* 토큰 매핑
- ⭐ **도메인 px 금지** (mobile-frame § 4.3): font-size 직접 px X → $font-size-* 또는 rem(). padding/margin/gap/radius 모두 토큰. 부득이 토큰 외 사이즈는 rem($px) function 호출. 예외: 1px border, 0.5px hairline, 100%
- 매직 컬러 금지 (특히 모달): #1e1e1e → var(--color-bg-modal), #e5e7eb → var(--color-text-primary), #6366f1 → var(--color-brand-violet), 0.55 overlay → var(--color-overlay)
- badge 컴포넌트 활용: HeroSection.heroBadge → <StatusBadge variant="active" label="..." /> 로 치환 (JSX + SCSS 양쪽)
- z-index 9999 → $z-modal-bg
- 320 보호: HeroSection.heroTitle small-mobile fallback (font-size $font-size-22), ResponseModal width:320px → max-width:calc(100% - 2rem) 또는 width:min(20rem, calc(100% - 2rem)), NoticeSection.item 부모 min-width:0 추가
- 모달 width 320px → max-width:calc(100% - 2rem) (rem 표기)

검증:
- npm --prefix web run build 컴파일 에러 없음
- vite dev 로 home / drawer / modal 시각 회귀는 사용자 확인 단계 (본 트랙은 보고서에 시각 변경 항목 명시)
- 도메인 px 직사용 검출 grep: `grep -nE ':\s*[0-9]+px' web/src/domains/home/ web/src/global/ui/{responseModal,renewalNoticeModal,mobile}/ web/src/app/wrapper/` — 위반 0건 (1px border, 0.5px hairline 제외) 확인

진행 보고:
- .claude/.progress/fe-scss-track-1-{timestamp}.log
- 3회 실패 시 [미해결] 마커

산출 후 메인 보고:
- 변경 파일 수, badge 치환 여부, 매직값 토큰 매핑 개수, 시각 영향 가능 항목
```

### 7.3 Track 2 brief

```
[Track 2 — coupons + events + notices SCSS 리팩토링]

목적: 3개 도메인 (coupons / events / notices) 의 카드 / 리스트 / 상세 SCSS 를 mixin-first 로 정리. EventCard 의 자체 badge 3종을 표준 StatusBadge 로 치환.

입력:
- 헌법: docs/global-guide/design/mobile-frame.md
- 분석문서: docs/global-guide/develop/specs/fe/scss-mixin-refactor-analysis.md (§ 6.2 Track 2)
- Track 0 산출물 (mixin/토큰 신설 완료 가정)
- 표준 Badge: web/src/global/ui/badge/StatusBadge.{jsx,module.scss}

작업 범위 (수정 가능 파일):
- web/src/domains/coupons/mobile/containers/public/CouponList.module.scss
- web/src/domains/coupons/mobile/components/couponCard/CouponCard.module.scss
- web/src/domains/events/mobile/containers/public/EventList.module.scss
- web/src/domains/events/mobile/components/eventCard/EventCard.module.scss
- web/src/domains/events/mobile/components/eventCard/EventCard.jsx ⭐ (B2 badge 치환)
- web/src/domains/notices/mobile/NoticeScreen.module.scss
- web/src/domains/notices/mobile/NoticeDetailScreen.module.scss
- web/src/domains/notices/mobile/containers/public/NoticeList.module.scss
- web/src/domains/notices/mobile/components/noticeCard/NoticeCard.module.scss
- web/src/domains/notices/mobile/components/officialNoticeCard/OfficialNoticeCard.module.scss

회피 영역:
- web/src/global/styles/**
- web/src/global/ui/badge/** (시그니처 변경 X)
- 다른 트랙 파일

적용 룰:
- mixin 우선: card-base, pressable, flex-*, thumb-box, line-clamp, hangul-safe, h-pad
- 매직 값 → 토큰
- ⭐ **도메인 px 금지** (mobile-frame § 4.3): font-size 직접 px X → $font-size-* 또는 rem(). padding/margin/gap/radius 토큰. 부득이 시 rem(). 예외: 1px border, 0.5px hairline, 100%
- badge 치환: EventCard.badgeActive → StatusBadge.active, EventCard.badgeExpired → StatusBadge.expired (사용자 결정 D2 = a, alias 추가)
  - 단 EventCard 의 position:absolute top/left 는 wrapper <span className={styles.badgeSlot}> 로 감싸기 (또는 StatusBadge 외곽 div)
- 320 보호: NoticeDetailScreen.title small-mobile fallback ($font-size-17), hangul-safe 적용 — CouponCard.couponTitle, EventCard.title, NoticeCard.title 다수
- line-clamp 적용: NoticeCard.featuredTitle (2줄)

검증:
- npm --prefix web run build
- 시각 회귀는 사용자 확인 단계
- 도메인 px 직사용 검출 grep: `grep -nE ':\s*[0-9]+px' web/src/domains/{coupons,events,notices}/` — 위반 0건 (1px border, 0.5px hairline 제외) 확인

진행 보고:
- .claude/.progress/fe-scss-track-2-{timestamp}.log
- 3회 실패 시 [미해결]

산출 후 보고: 변경 파일 수, badge 치환 결과, 시각 영향 가능 항목
```

### 7.4 Track 3 brief

```
[Track 3 — historyMode SCSS 리팩토링 (가장 큰 단일 도메인)]

목적: HistoryModeScreen.module.scss (≈520 line, 단일 화면 다종 컴포넌트 인라인) + chip + stageCard 를 mixin-first 로 정리. 매직 값 (6/9/11/15/20 px) 을 8pt 토큰으로 매핑. detailTag 를 LabelBadge.update 로 치환 검토.

입력:
- 헌법: docs/global-guide/design/mobile-frame.md
- 분석문서: docs/global-guide/develop/specs/fe/scss-mixin-refactor-analysis.md (§ 6.2 Track 3, § 3.1 매직값 매핑표)
- Track 0 산출물 (특히 신규 $radius-xs, $control-height-sm 사용)
- 표준 Badge: web/src/global/ui/badge/LabelBadge.{jsx,module.scss}

작업 범위 (수정 가능 파일):
- web/src/domains/historyMode/mobile/HistoryModeScreen.module.scss
- web/src/domains/historyMode/mobile/components/chip/Chip.module.scss
- web/src/domains/historyMode/mobile/components/stageCard/StageCard.module.scss
- web/src/domains/historyMode/mobile/HistoryModeScreen.jsx (선택 — detailTag → LabelBadge 치환 시. 미치환 시 SCSS 만)

회피 영역:
- web/src/global/styles/**
- web/src/global/ui/badge/** (시그니처 변경 X)
- 다른 트랙

적용 룰:
- mixin 우선: chip-base($size: sm) 대량 적용 (dayChip/sessionChip/playerChip/summaryTag 5+), card-base, reset-button (clearButton 류 3건), flex-*, pressable, hangul-safe
- ⭐ **도메인 px 금지** (mobile-frame § 4.3): font-size 직접 px X → $font-size-* 또는 rem(). padding/margin/gap/radius 토큰. 부득이 시 rem(). 예외: 1px border, 0.5px hairline, 100%
- 매직값 매핑 (분석문서 § 3.1 참조 — 토큰 1순위, rem() 2순위):
  - 2px → $radius-xs (신설)
  - 6px → $space-2 (8) 또는 $space-1 (4) — 표 일관 (gap → $space-2, padding → $space-1 권장)
  - 9px → $space-3 (12)
  - 11px → $space-3 (12)
  - 15px → $space-4 (16)
  - 5px (radius) → $radius-sm (4)
  - 8px font → $font-size-9 (9px, rem 정합)
  - 20px font (summaryName) → $font-size-22 (22px, rem 정합)
  - 36px height → $control-height-sm (신설)
- badge 치환: detailTag → LabelBadge.update (label="LEGENDARY" 등) — 사용자 결정 D1 = a (variant 확정 — 단 LabelBadge 의 update 사용)
- 320 보호: summaryName small-mobile fallback, Chip tap-target 적용 (padding 확장으로 height 44 확보)

⚠️ 결정 로그:
- 매직값 매핑 결과를 .claude/.progress/fe-scss-track-3-{timestamp}.log 에 표로 기록 (어떤 px → 어떤 토큰)
- 사용자가 후에 재조정 가능

검증:
- npm --prefix web run build
- 단일 화면이라 시각 회귀 영향 큼 — 보고서에 변경 항목 명시 + 사용자 확인 권고
- 도메인 px 직사용 검출 grep: `grep -nE ':\s*[0-9]+px' web/src/domains/historyMode/` — 위반 0건 (1px border, 0.5px hairline 제외) 확인

진행 보고:
- .claude/.progress/fe-scss-track-3-{timestamp}.log
- 3회 실패 시 [미해결]

산출 후 보고: 매직값 매핑 결과 (px → 토큰), chip-base 적용 개수, 시각 영향 큰 항목 강조
```

### 7.5 Track 4 brief

```
[Track 4 — community (mobile) SCSS 리팩토링]

목적: community 모바일 도메인 (2 screens + 6 components) 의 SCSS 를 mixin-first 로 정리. categoryChip / Chip 류는 chip-base mixin, CommunityBadge / BoardTagBadge 는 base 정합 (시각 유지) 또는 PinnedBadge 옵션.

입력:
- 헌법: docs/global-guide/design/mobile-frame.md
- 분석문서: docs/global-guide/develop/specs/fe/scss-mixin-refactor-analysis.md (§ 6.2 Track 4)
- Track 0 산출물
- 표준 Badge: web/src/global/ui/badge/{PinnedBadge,LabelBadge}.{jsx,module.scss}

작업 범위 (수정 가능 파일):
- web/src/domains/community/mobile/CategoryScreen.module.scss
- web/src/domains/community/mobile/CommunityScreen.module.scss
- web/src/domains/community/mobile/components/categoryChip/CategoryChip.module.scss
- web/src/domains/community/mobile/components/hotPostCard/HotPostCard.module.scss
- web/src/domains/community/mobile/components/communityBadge/CommunityBadge.module.scss
- web/src/domains/community/mobile/components/boardTagBadge/BoardTagBadge.module.scss
- web/src/domains/community/mobile/components/postRow/PostRow.module.scss
- web/src/domains/community/mobile/components/section/Section.module.scss

회피 영역:
- web/src/global/styles/**
- web/src/global/ui/badge/** (시그니처 변경 X — PinnedBadge.new variant 추가는 사용자 결정 사안)
- web/src/domains/community/feature/components/admin/** (PC/admin 영역 — 본 라운드 제외)
- web/src/domains/community/feature/components/user/post/pc/** (PC — 제외)
- 다른 트랙

적용 룰:
- mixin 우선: chip-base (CategoryChip 1건), card-base, pressable, flex-*, thumb-box, line-clamp (PostRow.title, HotPostCard.title 2건), hangul-safe, reset-button (Section.action 1건)
- ⭐ **도메인 px 금지** (mobile-frame § 4.3): font-size 직접 px X → $font-size-* 또는 rem(). padding/margin/gap/radius 토큰. 부득이 시 rem(). 예외: 1px border, 0.5px hairline, 100%
- 매직값 → 토큰: 6px gap → $space-1/2, 20px bottom → $space-5, z-index 50 → $z-dropdown
- badge 치환 (사용자 결정 D1 = a 반영 — PinnedBadge.new / PinnedBadge.neutral variant 신설):
  - CommunityBadge.newBadge → **PinnedBadge.new 로 치환** (Track 0 가 PinnedBadge 에 new variant 추가했다는 전제)
    - 단 PinnedBadge JSX 시그니처 변경은 Track 0 가 아닌 별도 단계로 분리 — Track 4 진행 시 PinnedBadge.new 미존재 시 보고 후 일시 보류 (mustread 임시 사용)
  - BoardTagBadge → **PinnedBadge.neutral 로 치환** (동일 — variant 미존재 시 보고)
  - 미존재 시 fallback: CommunityBadge / BoardTagBadge SCSS 유지 + base text-badge mixin + spacing 토큰 정합만
- 320 보호: PostRow.titleRow min-width:0 추가, CategoryChip tap-target (padding 확장)

⚠️ Badge variant 추가 (D1) 는 Track 0 또는 별도 mini-track 에서 처리해야 함 (PinnedBadge.jsx / module.scss 변경). 본 분석문서 § 8.4 갱신 참조

검증:
- npm --prefix web run build
- 시각 회귀는 사용자 확인 단계
- 도메인 px 직사용 검출 grep: `grep -nE ':\s*[0-9]+px' web/src/domains/community/mobile/` — 위반 0건 (1px border, 0.5px hairline 제외) 확인

진행 보고:
- .claude/.progress/fe-scss-track-4-{timestamp}.log
- 3회 실패 시 [미해결]

산출 후 보고: 변경 파일 수, badge 치환 보류 항목, 시각 영향 가능 항목
```

---

## § 8. 리스크 / 미해결 / 가정 정리

### 8.1 HITL 위험 4분야

해당 없음. 본 작업은 순수 SCSS 리팩토링 + JSX 의 badge 치환 (1~3건) 뿐. 법무/결제/권한/db 변경 0.

### 8.2 누락 / 깨진 부분 (마커)

| 마커 | 항목 | 위치 | 처리 |
|---|---|---|---|
| 🔴 | `bg-image` mixin `$url` 미정의 — 직접 호출 시 컴파일 에러 | `mixins/_background.scss:7` | Track 0 에서 시그니처 변경 (`@mixin bg-image($url, ...)`) |
| 🟨 | `VisibleToggle.module.scss` 전체 주석 — dead file | `global/ui/visibleToggle/` | 본 라운드 touch X. 향후 cleanup 라운드 |
| 🟨 | `HistoryModeScreen` 매직값 6/9/11/15px 다수 — 8pt 위반 | Track 3 자체 매핑 + 로그 |
| 🟨 | `ResponseModal` / `RenewalNoticeModal` 매직 컬러 + width:320px gutter 없음 | Track 1 에서 처리 |
| ❓ | `Drawer.badge` (메뉴 카운트, 원형) — 표준 badge 와 형태 다름 (1/1 aspect) | 유지 권장. 별도 `CountBadge` 신설 검토는 향후 라운드 |

### 8.3 가정값 (자동 적용)

- PC/admin 영역 (`domains/community/feature/components/{admin,user/post/pc}/**`) 본 라운드 **제외**
- 기준 frame width **480** (mobile-frame.md § 1, § 2 갱신 완료)
- 도메인 SCSS **px 직사용 금지** (mobile-frame.md § 4.3) — 토큰 또는 rem/em
- 도메인 **font-size 는 rem 또는 토큰만** (rem() function Track 0 신설)
- `$layout-screen-width` 375 → 480 갱신, `$layout-card-width` 343 → 448 갱신 (Track 0)
- Track 3 매직값 매핑 결정은 frontend-developer 가 자체 판단 + 로그 기록 (사용자 후 재조정 가능)

### 8.4 사용자 확인이 필요한 결정 사안 — 본 라운드 확정 (2026-05-31)

| # | 항목 | 결정 | 처리 |
|---|---|---|---|
| **D1** | PinnedBadge 에 `new` / `neutral` variant 추가? | **(a) 추가** ✅ | Track 0 또는 별도 mini-track 에서 `PinnedBadge.jsx` / `PinnedBadge.module.scss` 에 `.new` (red), `.neutral` (gray) variant 신설. Track 4 가 사용 |
| **D2** | StatusBadge `ended` 를 `expired` 로도 alias? | **(a) alias 추가** ✅ | Track 0 에서 `StatusBadge.jsx` 의 `DEFAULT_LABELS` 에 `expired:"종료"` 추가 + `.module.scss` 에 `.expired { background-color: var(--color-bg-deep); color: var(--color-text-primary); }` 신설 |
| **D3** | `--color-bg-modal` 신규 색 정의 vs `var(--color-bg-elevated)` 재사용? | **(a) 신규** ✅ | Track 0 에서 `semantic/color.scss` 에 신규 `--color-bg-modal: #1e1e1e` 정의 (modal 전용 색). raw token 도 `_colors.scss` 에 `$color-bg-modal: #1e1e1e` 추가 권장 |
| D4 | Track 3 매직값 (6/9/11/15px) 매핑 검수 | **별도 라운드** ⏸️ | 본 라운드는 frontend-developer 자체 매핑 + 로그. 사용자가 다음 라운드에서 시각 검토 후 재조정 |
| D5 | `bg-image` mixin 시그니처 변경 영향 0건 확인 | **별도 라운드** ⏸️ | grep 결과 호출처 0건 가정 — Track 0 가 grep 직접 수행 후 0건 시 자동 수정 / 1건+ 시 별도 보고 |
| D6 | `VisibleToggle.module.scss` dead file 삭제 여부 | **별도 라운드** ⏸️ | 본 라운드 touch X. cleanup 라운드 |

⭐ D1~D3 확정 → Track 0 / Track 1 / Track 4 brief 에 반영 완료. D4~D6 는 본 라운드 진행에 영향 없음 (자동 가정값 또는 별도).

### 8.5 D1~D3 확정에 따른 추가 작업 (Track 0 brief 보강)

- D1: `PinnedBadge` 에 variant 2종 신설 (`new`, `neutral`) — Track 0 작업 범위에 추가
  - 색 제안: `new` = red (`$pinned-red-bg/border` 재사용 OK), `neutral` = gray (`$pinned-gray-bg/border` 재사용 OK)
- D2: `StatusBadge` 에 `expired` variant 신설 — Track 0 작업 범위에 추가
  - 색: `bg-deep` + `text-primary` (EventCard.badgeExpired 정합)
- D3: `--color-bg-modal: #1e1e1e` 신규 + `$color-bg-modal: #1e1e1e` raw 토큰 — Track 0 작업 범위 갱신

---

## § 9. 자체 평가

| 평가 항목 | 점수/상태 | 비고 |
|---|---|---|
| 기획(헌법) 부합도 | ✓ | mobile-frame.md § 1~9 모두 매핑 (480 wrapper, 320 보호, 8pt grid, rem 강제, fluid type, tap target, badge 정합) |
| 표준 컴포넌트 활용도 | ✓ | 도메인 badge/chip 11건 식별 → 치환 권고 표. D1/D2 확정 후 치환 적극 가능 |
| 누락 항목 | 0 | 입력 풀 리스트 전수 grep |
| 위험·가정값 | D1~D3 확정 + D4~D6 별도 라운드 + 🔴 bg-image 1건 | 모두 § 8 기록 |
| Track disjoint | ✓ | 파일 풀 겹침 0. 단 Track 0 가 badge JSX 도 추가 변경 (D1/D2) |
| rem/px 정책 정합 | ✓ | mobile-frame.md § 4.3 / § 6.2 신설 룰과 분석문서 § 1.2 / § 3.4 / § 7 brief 모두 일관 |
| 200줄 한도 | ⚠️ 초과 (~700줄) — 분석문서 특성상 허용 | file-split.md 룰: 분석문서는 단일 파일 유지 권장 |

---

## § 10. 메인 어시스턴트 디스패치 순서 (권장)

```
1. Track 0 디스패치 (단일) — 글로벌 mixin/토큰 신설 + Badge variant 신설 (D1/D2/D3)
   → 완료 확인 후
2. Track 1~4 동시 디스패치 (4 병렬, run_in_background: true) — 도메인 SCSS 리팩토링
   → 모두 완료 후
3. 메인이 build 확인 + 사용자에 시각 회귀 검토 요청
4. 별도 라운드 (시각 검토 후): D4 (Track 3 매직값 재조정), D6 (VisibleToggle dead file 삭제)
```

⭐ Track 0 가 선행되어야 신규 mixin/토큰/Badge variant 를 도메인이 사용 가능. Track 1~4 는 disjoint 라 충돌 없음.
⭐ Track 0 작업량 증가 — Badge JSX 2종 (PinnedBadge, StatusBadge) 변경 추가됨.

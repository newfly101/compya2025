// ============================================================
// figma-plugin/shared/tokens.ts
// 디자인 토큰 — raw 값 + 토큰명 주석 (Option A namespace 패턴)
// 출처: web/src/global/styles/variables/{_colors,_spacing,_radius,_font,_breakpoints}.scss
// ============================================================

namespace Tokens {
  // _colors.scss + semantic/_color.scss
  export const COLOR = {
    bgDeepest:     '#0f0a14',  // $color-bg-900  → --color-bg-deepest  (TopBar bg, page bg)
    bgDeep:        '#140f1f',  // $color-bg-800  → --color-bg-deep     (Drawer bg)
    bgOverlay:     '#18141f',  // $color-bg-700  → --color-bg-overlay  (active menu bg)
    bgCard:        '#1f1a29',  // $color-bg-600  → --color-bg-card     (profile card, logoutBtn)
    bgElevated:    '#332947',  // $color-bg-500  → --color-bg-elevated
    brand:         '#a86af0',  // $color-brand-400 → --color-brand
    brandDark:     '#6d4ad3',  // $color-brand-500 → --color-brand-dark   (avatar bg)
    brandViolet:   '#6c5ce7',  // $color-brand-600 → --color-brand-violet (badge / active bar)
    naverGreen:    '#03c75a',  // $color-success-400 (login button bg)
    white:         '#ffffff',  // $color-white-100
    modalBg:       '#1e1e1e',  // raw — RenewalNoticeModal / ResponseModal
    modalText:     '#e5e7eb',  // raw — modal message text
    modalBtn:      '#6366f1',  // raw indigo — confirm button
    iconSuccess:   '#4ade80',  // raw green
    iconFail:      '#f87171',  // raw red
  } as const;

  // alpha 토큰 (rgba) — Figma SolidPaint opacity 분리 적용
  export const ALPHA = {
    textPrimary:    { r: 1, g: 1, b: 1, a: 0.92 },     // $color-white-92
    textSecondary:  { r: 1, g: 1, b: 1, a: 0.60 },     // $color-white-60
    textMuted:      { r: 1, g: 1, b: 1, a: 0.38 },     // $color-white-38
    border:         { r: 1, g: 1, b: 1, a: 0.06 },     // $color-white-06
    overlayBlack60: { r: 0, g: 0, b: 0, a: 0.60 },     // Drawer overlay
    overlayBlack55: { r: 0, g: 0, b: 0, a: 0.55 },     // Modal overlay
  } as const;

  // _spacing.scss
  export const SPACE = {
    s1:  4,    // $space-1
    s2:  8,    // $space-2
    s3:  12,   // $space-3
    s4:  16,   // $space-4 = $layout-h-pad
    s5:  20,   // $space-5
    s6:  24,   // $space-6
    s8:  32,   // $space-8
    s10: 40,   // $space-10
    s12: 48,   // $space-12
  } as const;

  // _radius.scss
  export const RADIUS = {
    none: 0,
    sm:   4,    // $radius-sm
    md:   6,    // $radius-md  (4 배수 X — 토큰 그대로)
    lg:   8,    // $radius-lg
    xl:   10,   // $radius-xl  (4 배수 X — 토큰 그대로)
    xxl:  12,   // $radius-2xl
    full: 9999, // $radius-full
  } as const;

  // _breakpoints.scss + _spacing.scss layout constants
  export const LAYOUT = {
    mobileLg:        428,   // $bp-mobile-lg (frame width — 4×107 OK)
    mobileH:         932,   // iPhone 14 Pro Max — 4×233 OK
    topbarHeight:    52,    // $layout-topbar-height — 4×13 OK
    bottombarHeight: 56,    // $layout-bottombar-height — 4×14 OK
    hPad:            16,    // $layout-h-pad — 4×4 OK
    drawerMaxWidth:  250,   // Drawer.module.scss L39 — 사용자 pin (4 배수 X)
  } as const;

  // _font.scss — Inter scale
  export const FONT_FAMILY = 'Inter';
  export type Weight = 'Regular' | 'Medium' | 'Semi Bold' | 'Bold';
  export const FW_REGULAR:  Weight = 'Regular';
  export const FW_SEMIBOLD: Weight = 'Semi Bold';
  export const FW_BOLD:     Weight = 'Bold';

  export const FS = {
    fs9:  9,    // $font-size-9   — badge
    fs10: 10,   // $font-size-10  — micro
    fs11: 11,   // $font-size-11  — caption / date
    fs12: 12,   // $font-size-12  — body
    fs13: 13,   // $font-size-13  — body-bold
    fs15: 15,   // $font-size-15  — section-title / modal message
    fs17: 17,   // $font-size-17  — topbar logo
    fs22: 22,   // $font-size-22  — page-title (back icon)
    fs28: 28,   // $font-size-28  — hero
  } as const;
}

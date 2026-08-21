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
    brand:         '#a86af0',  // $color-brand-400 → --color-brand (터미널 바이올렛)
    brandDark:     '#6d4ad3',  // $color-brand-500 → --color-brand-dark   (avatar bg / DESIGN.md 시그널 딥)
    brandViolet:   '#6c5ce7',  // $color-brand-600 → --color-brand-violet (badge / active bar / DESIGN.md 액션 인디고)
    naverGreen:    '#03c75a',  // $color-success-400 (login button bg / DESIGN.md 네이버 그린 — 성공·네이버 전용)
    white:         '#ffffff',  // $color-white-100
    modalBg:       '#1e1e1e',  // raw — RenewalNoticeModal / ResponseModal (DESIGN.md 모달 차콜과 동일 계열, 유지)

    // ── DESIGN.md 팔레트 정합 (2026-08-20 admin-components 감사 반영, plugin-token-audit.md 기준) ──
    alertRed:         '#e84141',  // DESIGN.md alert-red — 삭제/오류/마감임박
    cautionAmber:     '#e8d541',  // DESIGN.md caution-amber — 주의/확인필요
    actionIndigo:     '#6c5ce7',  // DESIGN.md action-indigo — brandViolet 과 값 동일(의미 이름으로도 참조 가능)
    textCode:         '#d9d3e0',  // DESIGN.md text-code — 코드/강조 텍스트
    textPlaceholder:  '#7c6f8f',  // DESIGN.md text-placeholder — 입력창 안내문구
    violetPale:       '#ede0ff',  // DESIGN.md violet-pale
    violetLight:      '#c9a5f8',  // DESIGN.md violet-light
    dugoutPlum:       '#3c1e50',  // DESIGN.md dugout-plum — 이벤트 영역 자리 표시
    surfaceCommunity: '#19284b',  // DESIGN.md surface-community

    // ── 레거시 별칭 — admin-*.ts 4개 · applayout.ts 가 이미 참조 중이라 이름은 유지, 값만 DESIGN.md 로 흡수 ──
    modalText:     '#d9d3e0',  // = textCode   (기존 raw #e5e7eb 흡수)
    modalBtn:      '#6c5ce7',  // = actionIndigo (기존 raw indigo #6366f1 → action-indigo #6c5ce7 로 통합)
    iconSuccess:   '#03c75a',  // = naverGreen (기존 raw green #4ade80 흡수)
    iconFail:      '#e84141',  // = alertRed   (기존 raw red #f87171 흡수)
  } as const;

  // 배지 전용 상태색 7종 — DESIGN.md "Badges" 절: 주 팔레트 밖의 예외 값, 배지 안에서만 쓴다
  export const BADGE_STATUS = {
    new:         '#16a34a',  // 신규
    popular:     '#ff3b3b',  // 인기
    ended:       '#2a2e3a',  // 종료
    recommended: '#2563eb',  // 추천
    limited:     '#f59e0b',  // 한정
    event:       '#ec4899',  // 이벤트
    reward:      '#14b8a6',  // 보상
  } as const;

  // alpha 토큰 (rgba) — Figma SolidPaint opacity 분리 적용
  export const ALPHA = {
    textPrimary:    { r: 1, g: 1, b: 1, a: 0.92 },     // $color-white-92
    textSecondary:  { r: 1, g: 1, b: 1, a: 0.60 },     // $color-white-60
    textMuted:      { r: 1, g: 1, b: 1, a: 0.38 },     // $color-white-38
    border:         { r: 1, g: 1, b: 1, a: 0.06 },     // $color-white-06
    borderStrong:   { r: 1, g: 1, b: 1, a: 0.12 },     // DESIGN.md border-strong — 포커스 등 강조 테두리
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
    xs:   2,    // DESIGN.md rounded.xs — 아주 작은 표시(작은 칩, 강조 띠). 감사에서 누락 확인돼 추가
    sm:   4,    // $radius-sm
    md:   6,    // $radius-md  (4 배수 X — 토큰 그대로)
    lg:   8,    // $radius-lg
    xl:   10,   // $radius-xl  (4 배수 X — 토큰 그대로)
    xxl:  12,   // $radius-2xl
    full: 9999, // $radius-full
  } as const;

  // _breakpoints.scss + _spacing.scss layout constants
  export const LAYOUT = {
    mobileLg:        428,   // $bp-mobile-lg (frame width — 4×107 OK) — applayout 전용, admin/home 과 별개 유지
    mobileH:         932,   // iPhone 14 Pro Max — 4×233 OK
    topbarHeight:    52,    // $layout-topbar-height — 4×13 OK
    bottombarHeight: 56,    // $layout-bottombar-height — 4×14 OK
    hPad:            16,    // $layout-h-pad — 4×4 OK
    drawerMaxWidth:  250,   // Drawer.module.scss L39 — 사용자 pin (4 배수 X)
    screenW:         375,   // admin/home 도메인 대표 렌더 폭(iPhone 표준) — 이전엔 파일마다 `const W = 375` 로 직접 선언되던 값
    screenMax:       480,   // DESIGN.md 콘텐츠 폭 상한(단일 폭 규칙) — 지금은 렌더에 안 쓰지만 자리 보존
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

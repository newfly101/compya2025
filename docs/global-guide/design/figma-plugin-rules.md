# Figma Plugin Code 작성 룰

> designer agent 가 `figma-plugin/code.ts` 작성 시 반드시 따라야 하는 글로벌 룰.
> 사용자 명시 정책 + 본 프로젝트 디자인 시스템 정합.
> 작성일: 2026-05-11

---

## 1. 4px Grid 강제

모든 단위 (`width` / `height` / `padding` / `margin` / `gap` / `cornerRadius` / `itemSpacing` / `paddingLeft` / `paddingRight` / `paddingTop` / `paddingBottom` / `strokeWeight` 등) 는 **4 의 배수** 만 허용.

### 허용 값 (4 배수)
```
0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 192, 256, 320, 384, 416, 480, 512, 768, 932, 1024, ...
```

### 금지 값 (4 배수 아님)
```
2, 6, 10, 14, 18, 22, 26, 30, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 250, 343, 375, 428 ...
```

### 위반 시 처리
- 코드 작성 시 가장 가까운 4 배수로 반올림
- 반올림 결과를 `// → rounded from N` 주석으로 명시
- 사용자가 명시적으로 4 배수 외 값 요청 시 (예외) 주석에 `// user-pinned: not 4-multiple` 명시

### 예외 허용 (사용자 명시 시만)
| 값 | 사유 |
|---|---|
| 1, 2, 3 | 1px 보더 / 2px stroke / divider 1px |
| 9999 | full pill radius |
| 375 / 428 | iPhone 표준 (사용자가 명시한 경우만) |
| 6, 10 | `$radius-md` / `$radius-xl` (현재 디자인 토큰 — 추후 4 배수로 마이그레이션 권고) |

---

## 2. 실제 구현 사이즈 우선 (코드 ↔ Figma 정합)

글로벌 컴포넌트의 실제 구현 사이즈는 다음 위치에서 추출:
- `web/src/global/styles/variables/` (토큰 정의)
- `web/src/app/wrapper/mobile/` (MobileLayout / TopBar / Drawer 구현)
- `web/src/global/ui/` (글로벌 UI 컴포넌트)

Figma 에서 임의 늘어나거나 줄어든 경우 — **코드 사이즈가 ground truth**.

### 핵심 컴포넌트 사이즈 (코드 baseline, 2026-05-11 기준)

| 컴포넌트 | 위치 | 사이즈 | 4 배수? | 비고 |
|---|---|---|---|---|
| Drawer max-width | `web/src/app/wrapper/mobile/parts/Drawer.module.scss` L39 | **250px** | NO (4×62.5) | 사용자 명시 — 250 유지. 4 배수 마이그레이션 시 248 또는 252 권고 |
| Drawer width % | `Drawer.module.scss` L38 | 75% | — | viewport 비율 (4px 그리드 무관) |
| MobileLayout max-width | `_breakpoints.scss` `$bp-mobile-lg` | 428px | **NO** (4×107) | iPhone Pro Max 표준 — 사용자 명시 시만 사용 |
| TopBar height | `_spacing.scss` `$layout-topbar-height` | 52px | YES (4×13) | OK |
| BottomBar height | `_spacing.scss` `$layout-bottombar-height` | 56px | YES (4×14) | OK |
| Layout H padding | `_spacing.scss` `$layout-h-pad` | 16px | YES (4×4) | OK |
| Card width | `_spacing.scss` `$layout-card-width` | 343px | NO (375 - 16×2) | 375 표준 viewport 종속. 4 배수 미정합 |
| 모바일 height (frame) | design-report (F1~F10) | 932px | YES (4×233) | iPhone 14 Pro Max — OK |

### Spacing 토큰 (`_spacing.scss`)
| 토큰 | 값 | 4 배수? |
|---|---|---|
| `$space-1` | 4px | YES |
| `$space-2` | 8px | YES |
| `$space-3` | 12px | YES |
| `$space-4` | 16px | YES |
| `$space-5` | 20px | YES |
| `$space-6` | 24px | YES |
| `$space-8` | 32px | YES |
| `$space-10` | 40px | YES |
| `$space-12` | 48px | YES |

→ Spacing 토큰 전부 4 배수 정합. **plugin 코드에서 spacing 사용 시 항상 위 값만**.

### Radius 토큰 (`_radius.scss`)
| 토큰 | 값 | 4 배수? | 권고 |
|---|---|---|---|
| `$radius-none` | 0 | YES | OK |
| `$radius-sm` | 4px | YES | OK |
| `$radius-md` | 6px | NO | 8 마이그레이션 검토 |
| `$radius-lg` | 8px | YES | OK |
| `$radius-xl` | 10px | NO | 12 마이그레이션 검토 |
| `$radius-2xl` | 12px | YES | OK |
| `$radius-full` | 9999px | (예외) | OK (pill) |

→ `$radius-md` (6) / `$radius-xl` (10) 은 현재 디자인 토큰 그대로 사용 OK. 추후 마이그레이션 라운드에서 처리.

---

## 3. 토큰 우선

raw hex / px 직접 사용 X — `web/src/global/styles/variables/` 의 SCSS 변수에서 추출.

Figma plugin API 는 raw 값만 받으므로, 코드 작성 시 **토큰명 주석 + raw 값 둘 다** 명시:

```typescript
// $color-accent (#a78bfa) — brand
fills = [{ type: 'SOLID', color: hexToRgb('#a78bfa') }];

// $space-4 (16px) — H_PAD, 4 배수 OK
itemSpacing = 16;

// $layout-topbar-height (52px) — 4 배수 OK
height = 52;
```

### Color baseline (`_colors.scss`)
설계 보고서 (`docs/domain/applayout/design/design-report.md` § 2) 의 14 색 그대로 사용:
- `bg-deepest #0f0a14`
- `bg-deep #140f1f`
- `bg-card #1f1a29`
- `bg-elevated #332947`
- `brand #a86af0`
- `brand-violet #6c5ce7` (+ alpha 12%)
- `success #03c75a`
- `danger #e84141`
- `text-primary white-92%`
- `text-secondary white-60%`
- `text-muted white-38%`
- `border white-06%`
- `overlay-50% black`
- `white`

---

## 4. 모바일 우선

### Frame 기본 사이즈
| 사이즈 | 4 배수? | 사용처 |
|---|---|---|
| 384 (=4×96) | YES | 권고 default (Figma frame) |
| 416 (=4×104) | YES | 권고 mid |
| 480 (=4×120) | YES | 권고 max |
| 375 | NO | iPhone 표준 — 사용자 명시 시만 |
| 390 | NO | iPhone 14/15 — 사용자 명시 시만 |
| 414 | NO | iPhone Plus — 사용자 명시 시만 |
| 428 | NO | iPhone Pro Max — 사용자 명시 시만 (현재 F1~F10 기본) |

### Wrapper
- max-width: 480px (4 배수 OK) — 데스크탑 환경에서 모바일 viewport 시뮬레이션 시
- 실제 코드: `$bp-mobile-lg` = 428px (사용자 명시 — 유지)

---

## 5. 검증 절차 (코드 작성 후)

1. **grep magic numbers** — plugin code 의 모든 숫자 리터럴 추출 후 4 배수 검증
   ```bash
   grep -nE '\b(width|height|padding|margin|gap|cornerRadius|itemSpacing|paddingLeft|paddingRight|paddingTop|paddingBottom|strokeWeight)\s*[:=]\s*[0-9]+' figma-plugin/code.ts
   ```
2. **글로벌 컴포넌트 사이즈 정합 확인**:
   - Drawer max-width = 250 (코드 baseline) — Figma 늘어났으면 250 으로 복귀
   - TopBar height = 52
   - $bp-mobile-lg = 428
3. **위반 시**:
   - 가장 가까운 4 배수로 반올림 (사용자 예외 명시 없을 때)
   - 메인 어시스턴트에 위반 항목 표 형식으로 보고

---

## 6. 위반 시 표시 형식

| 항목 | 현재 값 | 4 배수? | 권고 |
|---|---|---|---|
| F4 Drawer width | 6 | NO | 8 (반올림) |
| F1 frame width | 428 | NO | 사용자 pin — 그대로 유지 |
| F4 Drawer max-width | 250 | NO | 사용자 pin — 그대로 유지 (코드 baseline) |

---

## 7. 본 룰의 적용 범위

### 적용
- 신규 `figma-plugin/code.ts` 작성 시 (designer-plugin-code skill / agent)
- 기존 frame 수정 시 (designer-analyze 의 검증 단계)
- 4 배수 검증 결과를 `docs/domain/{domain}/design/design-report.md` 끝부분에 기록

### 적용 안 됨 (예외)
- 사용자가 명시적으로 4 배수 외 값 요청 (예: iPhone width 428px)
- raw 1px / 2px stroke (border / divider)
- pill radius 9999
- 현재 디자인 토큰 `$radius-md` (6) / `$radius-xl` (10) — 마이그레이션 전까지 유지

---

## 8. 빠른 참조 — 4 배수 카운트다운 표

| n×4 | 값 |
|---|---|
| 1 | 4 |
| 2 | 8 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 7 | 28 |
| 8 | 32 |
| 9 | 36 |
| 10 | 40 |
| 11 | 44 |
| 12 | 48 |
| 13 | 52 |
| 14 | 56 |
| 16 | 64 |
| 18 | 72 |
| 20 | 80 |
| 24 | 96 |
| 30 | 120 |
| 40 | 160 |
| 60 | 240 |
| 62 | 248 |
| 63 | 252 |
| 96 | 384 |
| 104 | 416 |
| 107 | 428 (NO — 4×107=428 OK 사실 4 배수) |
| 120 | 480 |
| 233 | 932 |

> 정정: 428 = 4×107 — 4 배수 **OK**. 본 문서 § 2 / § 4 의 "428 4 배수 NO" 표기는 잘못. 428 사용 가능.
> 정정: 250 = 4×62.5 — 4 배수 **NO**. 사용자 명시 시 250 그대로 유지하되, 마이그레이션 시 248 (4×62) 또는 252 (4×63) 권고.
> 정정: 343 = 4×85.75 — 4 배수 **NO**. 375 표준 viewport (375 - 16×2) 종속이므로 viewport 변경 시 자동 정합.
> 정정: 375 = 4×93.75 — 4 배수 **NO**. 사용자 명시 시만.

---

## 9. 코드 1:1 충실 재현 룰 (2026-05-11 추가)

### 9.1 원칙

frame / 컴포넌트의 모든 값은 **실제 SCSS module + JSX DOM 1:1 정확 read 후 작성**. 추정 / 어림짐작 절대 금지.

### 9.2 read 대상

| 항목 | 위치 |
|---|---|
| 외곽 wrapper / page-content | `web/src/app/wrapper/mobile/MobileLayout.module.scss` + `.jsx` |
| TopBar (home / page variant) | `web/src/app/wrapper/mobile/parts/TopBar.module.scss` + `.jsx` |
| Drawer (panel / overlay / profile / nav / menu / badge) | `web/src/app/wrapper/mobile/parts/Drawer.module.scss` + `.jsx` |
| Drawer 메뉴 데이터 | `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` |
| 글로벌 모달 | `web/src/global/ui/{renewalNoticeModal,responseModal}/*` |
| 디자인 토큰 raw | `web/src/global/styles/variables/{_colors,_spacing,_radius,_font,_breakpoints,_zindex}.scss` |
| 토큰 → CSS var 매핑 | `web/src/global/styles/semantic/_color.scss` |
| 타이포 mixin | `web/src/global/styles/mixins/_typography.scss` |
| 레이아웃 mixin | `web/src/global/styles/mixins/_layout.scss` |
| flex mixin | `web/src/global/styles/mixins/_flex.scss` |

### 9.3 추출 항목 (frame 별 필수)

- 외곽 width / height / max-width / min-width
- padding (top/right/bottom/left) — 각 방향
- margin — autolayout 의 paddingTop/Bottom 으로 변환 (negative margin 은 absolute 위치로 근사)
- border (width / color) — strokes + strokeAlign 'INSIDE'
- border-radius — cornerRadius (방향별 다르면 topLeftRadius 등 분리)
- box-shadow — effects DROP_SHADOW
- background-color — fills
- gap / itemSpacing
- flex-direction → layoutMode (HORIZONTAL/VERTICAL)
- align-items / justify-content → primaryAxisAlignItems / counterAxisAlignItems
- font-size / font-weight / line-height / letter-spacing
- color (token → raw rgba/hex)

### 9.4 작성 시 주석 룰

각 frame 의 첫 줄 주석에 **코드 출처 파일 경로 + 핵심 spec 1줄 요약**:

```typescript
// .drawer — Drawer.module.scss L33-67
//   width 75% / max-width 250 / bg-deep / top 52 / flex column
panel.resize(LAYOUT.drawerMaxWidth, LAYOUT.mobileH - LAYOUT.topbarHeight);
panel.fills = [solid(COLOR.bgDeep)];
```

### 9.5 모르는 값 처리

- 코드에 없으면 **사용자 명시 baseline** 우선 (예: Drawer max-width 250 사용자 pin)
- 그래도 불명이면 `❓ 미정` 텍스트 frame + `design-report.md` § 미정 list 추가
- 절대 임의 추정 금지

### 9.6 코드 ↔ 4 배수 룰 충돌 시

코드 baseline 우선. 4 배수 위반은 `design-report.md` § 4px Grid 검증 표에 기록 후 마이그레이션 라운드로 분리.

| 충돌 케이스 | 처리 |
|---|---|
| `$radius-md = 6`, `$radius-xl = 10` | 토큰 그대로 — 마이그레이션 미루기 |
| Drawer max-width 250 | 사용자 명시 — 그대로 |
| RenewalNoticeModal radius 14 | 코드 baseline — 그대로 (raw 값) |
| RenewalNoticeModal padding-top 28 | 코드 baseline — 그대로 |
| confirmBtn padding 10 0 | 코드 baseline — 그대로 (raw 값) |
| modal width 320 | 코드 baseline — 그대로 (4배수 OK) |

### 9.7 anti-pattern

- 글로벌 컴포넌트 read 없이 frame 사이즈 / padding 추정 → 시각 mismatch (직전 라운드 사용자 불만 사례)
- "대략 padding 16 일 거야" → SCSS 에서 `$space-3 = 12` 일 수도 → 정확히 read 필요
- `flex-row(12px)` mixin → gap 12px 추출 누락 → itemSpacing 누락 시 children 붙음

---

## 10. Sizing Mode (Hug / Fixed / Fill) 강제 (2026-05-11 추가)

### 10.0 사고 사례 (재발 방지)

직전 작업에서 frame 생성 직후 `primaryAxisSizingMode = 'AUTO'` (Hug) 만 지정 → **children 추가 전이라 height = 0** → Figma 에서 frame 이 시각적으로 0px, 드래그로 컨텐츠 못 봄. 사용자가 frame 삭제. **재발 절대 금지**.

### 10.1 frame 생성 표준 순서

다음 순서를 **반드시** 지킬 것:

```typescript
// 1. frame 생성 + 즉시 명시 size (placeholder — Hug 시에도 minimum 보장)
const frame = figma.createFrame();
frame.resize(WIDTH, HEIGHT);  // ⭐ height 0 방지 — 최소 1 보장

// 2. layoutMode 설정
frame.layoutMode = 'VERTICAL';
frame.itemSpacing = ...;
frame.paddingTop = frame.paddingBottom = ...;
frame.paddingLeft = frame.paddingRight = ...;

// 3. children 추가 (await 폰트 로딩 우선)
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const text = figma.createText();
text.fontName = ...;
text.characters = ...;
frame.appendChild(text);
// ... 다른 children

// 4. ⭐ children 추가 완료 **후** sizing mode 적용
frame.primaryAxisSizingMode = 'AUTO';   // Hug — children 합으로 height
frame.counterAxisSizingMode = 'AUTO';   // 또는 'FIXED' if width 고정
```

❌ **금지 패턴**:
```typescript
const frame = figma.createFrame();
frame.primaryAxisSizingMode = 'AUTO';  // ⚠️ children 없으니 height 0
frame.appendChild(...);                 // 너무 늦음
```

### 10.2 컴포넌트별 sizing 패턴

| 컴포넌트 | width | height | API 호출 |
|---|---|---|---|
| Mobile wrapper (F1) | FIXED | AUTO | `counterAxisSizingMode='FIXED'` + `primaryAxisSizingMode='AUTO'` |
| TopBar | FILL (부모) | FIXED | child: `layoutAlign='STRETCH'`. self: `primaryAxisSizingMode='FIXED'` |
| Drawer | FIXED 250 | FILL | `counterAxisSizingMode='FIXED'` + `layoutAlign='STRETCH'` (cross) |
| Modal (Renewal/Response) | AUTO (Hug) | AUTO (Hug) | 둘 다 AUTO. children 추가 후 적용 |
| List item / row | FILL (cross) | FIXED 또는 AUTO | `layoutAlign='STRETCH'` + height 정책 따라 |
| Button | Hug (text + padding) | FIXED | `primaryAxisSizingMode='AUTO'` + height 명시 |
| Text node | — | — | `textAutoResize = 'WIDTH_AND_HEIGHT'` 명시 (default 가 깨질 위험) |

### 10.3 children sizing 룰

부모 axis 에서 늘리고 싶을 때:
```typescript
child.layoutGrow = 1;           // 부모 main axis 에서 fill
child.layoutAlign = 'STRETCH';  // 부모 cross axis 에서 fill
```

그 외 → 기본값 (Hug). text 의 줄바꿈 위해 `textAutoResize = 'HEIGHT'` + `layoutAlign='STRETCH'` 조합 자주 사용.

### 10.4 반응형 (모바일 우선)

- 외곽 max-width 480 wrapper
- 내부 컴포넌트: width FILL (`layoutAlign='STRETCH'`)
- media query 분기 X (단일 모바일)

### 10.5 작성 후 self-review 체크리스트

frame 작성 후 빌드 전 반드시 확인:

- [ ] 모든 frame 에 `resize(W, H)` 가 children 추가 **전에** 있는가? (height 0 방지)
- [ ] sizing mode (`primaryAxisSizingMode` / `counterAxisSizingMode`) 가 children 추가 **후에** 명시됐는가?
- [ ] Modal 류 외곽 wrapper 가 Hug (`AUTO`/`AUTO`) 인가?
- [ ] 모든 row / item 의 `layoutAlign='STRETCH'` 명시 (부모 cross axis fill)
- [ ] Text node 의 `textAutoResize` 명시 (default 회피)
- [ ] 모든 frame 에 `itemSpacing` 명시 (default 0 으로 두지 말 것)
- [ ] padding 4 방향 다 명시 (`paddingTop/Bottom/Left/Right`)
- [ ] 폰트 `loadFontAsync` 가 텍스트 노드 생성 **전에** await 됐는가?
- [ ] 4 배수 위반 없는가? (§ 1 grep)

→ 한 항목이라도 NG 면 빌드 전 정정.

---

## 11. Figma Plugin Runtime Stability Rules (2026-05-11 추가)

§10 의 표준 순서를 더 엄격하게 강제. **Figma runtime 에서 frame 박살 방지** 의 절대 룰. 위반 시 plugin 실행 직후 frame 깨짐 / 보이지 않음 / 사용자 드래그 불가.

### 11.1 8 절대 룰

| # | 룰 | 위반 시 증상 |
|---|---|---|
| 1 | **Empty frame 상태에서 HUG sizing 금지** — children 0 일 때 `primaryAxisSizingMode='AUTO'` 호출 X | height 0 → frame 안 보임 |
| 2 | **child append 완료 후 AUTO/HUG 적용** — 모든 children 추가 끝난 다음 sizing mode | 동 |
| 3 | **createFrame 직후 최소 height 지정** — `frame.resize(W, max(1, H))` 즉시 호출 | 0 사이즈 frame 시각적 부재 |
| 4 | **TEXT 생성 전 반드시 `loadFontAsync`** — `await` 후 fontName 설정 | 폰트 로드 실패 → 텍스트 fallback |
| 5 | **부모 AUTO + 자식 FILL 조합 시 기준 width 확보** — 자식이 `layoutGrow=1` / `layoutAlign='STRETCH'` 면 부모는 FIXED width 또는 max-width 명시 | width 0 → fill 대상 없음 → 무한 0 |
| 6 | **append 전에 child sizing 완료** — child 의 size / textAutoResize 가 append 전 결정. append 후 변경 시 reflow 깨짐 | child 사이즈 mismatch |
| 7 | **nested auto-layout depth 최소화** — 3 단계 이상 중첩 시 reflow race. 가능하면 2 단계 + 명시적 size | layout 위치 어긋남 |
| 8 | **생성 직후 즉시 relayout 하지 말 것** — `appendChild` 직후 `resize` / sizing 수정 X. 변경은 한 번만 | reflow 누락 → 잘못된 사이즈 |

### 11.2 표준 시퀀스 (룰 1~8 반영)

```typescript
// ─── PHASE 0: 폰트 모두 로드 (모든 텍스트 생성 전 await) ───
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
// ... 사용 폰트 모두

// ─── PHASE 1: createFrame + 즉시 최소 size (룰 3) ───
const f = figma.createFrame();
f.resize(WIDTH, Math.max(1, HEIGHT));   // 룰 3: height 0 방지

// ─── PHASE 2: layoutMode + spacing + padding (룰 7: depth 최소) ───
f.layoutMode = 'VERTICAL';               // 또는 'HORIZONTAL'
f.itemSpacing = SPACING;
f.paddingTop = f.paddingBottom = PAD;
f.paddingLeft = f.paddingRight = PAD;
f.fills = [{ type: 'SOLID', color: hexToRgb(BG) }];

// ─── PHASE 3: children 사전 준비 (sizing 완료 후 append — 룰 6) ───
const child1 = figma.createText();
child1.fontName = { family: 'Inter', style: 'Regular' };
child1.characters = '...';
child1.textAutoResize = 'WIDTH_AND_HEIGHT';   // ⭐ 명시 (룰 6)
child1.layoutAlign = 'STRETCH';                // 부모 cross axis fill (룰 5)

// child sizing 끝난 후 append
f.appendChild(child1);

// 추가 children — 동일 패턴 (sizing → append)
// ...

// ─── PHASE 4: ⭐ children 모두 추가 ‘후’ sizing mode (룰 1, 2) ───
f.primaryAxisSizingMode = 'AUTO';        // Hug — children 합 (단 children >0)
f.counterAxisSizingMode = 'FIXED';       // 또는 'AUTO'

// ─── PHASE 5: 종료 (룰 8 — 다시 resize/relayout 하지 말 것) ───
// f.resize(...) X
// f.itemSpacing = ... X
// 더 이상 변경 금지
```

### 11.3 부모 AUTO + 자식 FILL 패턴 (룰 5)

```typescript
// ❌ 금지: 부모 width 0 + 자식 STRETCH → 자식 width 0
parent.resize(0, 200);
parent.counterAxisSizingMode = 'AUTO';   // → AUTO 인데 children width 정해진 게 없음 → 0
child.layoutAlign = 'STRETCH';

// ✅ 권장: 부모 width FIXED + 자식 STRETCH
parent.resize(412, 200);                 // 명시 width
parent.counterAxisSizingMode = 'FIXED';  // FIXED 412 유지
child.layoutAlign = 'STRETCH';            // → 412 width 따라감
```

### 11.4 nested auto-layout 룰 (룰 7)

- 권장 depth: **2 단계 이하** (root frame → row/column children → leaf)
- 3 단계 이상 시 모든 단계에서 sizing mode 명시 (`AUTO` / `FIXED` 둘 중 하나, 모호 X)
- 가능하면 flat 화 — 한 단계 안에 horizontal+vertical 분리하지 말고 한 layout 으로

### 11.5 검증 (빌드 전 grep)

- `Grep "createFrame\(\)"` 직후 라인이 `\.resize\(` 인지 (룰 3)
- `Grep "primaryAxisSizingMode = 'AUTO'"` 가 `appendChild` 보다 **뒤** 라인인지 (룰 1, 2)
- `Grep "createText\(\)"` 직전 라인에 `loadFontAsync` await 있는지 (룰 4)
- `Grep "layoutAlign = 'STRETCH'"` 부모 frame 의 cross axis 가 FIXED 인지 확인 (룰 5)
- `Grep "\.resize\("` 호출이 frame 별 1번뿐인지 (룰 8)

한 항목 NG → 빌드 전 정정.

---

## 12. 변경 이력

| 일자 | 변경 |
|---|---|
| 2026-05-11 | 초안 — 사용자 명시 4px grid 룰 + 코드 baseline 추출 |
| 2026-05-11 | § 9 추가 — 코드 1:1 충실 재현 룰 (직전 frame mismatch 재발 방지) |
| 2026-05-11 | § 10 추가 — Sizing Mode (Hug/Fixed/Fill) + height 0 방지 표준 순서 + self-review 체크리스트 |
| 2026-05-11 | § 11 추가 — Figma Runtime Stability 8 절대 룰 + 표준 시퀀스 5 PHASE + nested depth |

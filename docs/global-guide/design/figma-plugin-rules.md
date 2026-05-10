# Figma Plugin Code 작성 룰

> designer agent 가 `figma-plugin/code.ts` 작성 시 반드시 따라야 하는 글로벌 룰.
> 사용자 명시 정책 + 본 프로젝트 디자인 시스템 정합.
> 작성일: 2026-05-11
> 최종 갱신: 2026-05-11 — figma 진리 모드 sync 후 룰 정합 (사용자 figma 페이지 `컴프야펀 디자인 작업 완료` 기준)

---

## 0.0 ⛔ 절대 룰 — .ts 는 한 번만 작성, 수정 금지 (2026-05-11 사용자 명시)

`figma-plugin/**/*.ts` 파일 (code.ts / domains/*.ts / shared/*.ts) 은 **딱 한 번 작성**. 한 번 figma 에 frame 을 그리고 나면 그 도메인의 .ts 는 **다시 수정하지 않는다**.

### 이유
- 사용자가 figma 에서 정리/수정한 결과가 진리 (§ 0 figma 진리 우선)
- 같은 .ts 를 미세 보정하려고 다시 작성 = 시간 낭비 + 토큰 낭비 + 사용자 짜증
- 한 번 figma 에 그린 결과는 figma 에서 사용자가 마무리하는 게 정상 흐름

### 금지 시나리오
- ❌ "figma 진리와 height/padding 차이가 있어서 .ts 보정" — 절대 금지
- ❌ "더 정확한 진리 수치로 .ts 재작성" — 절대 금지
- ❌ "사용자가 figma 에서 수정한 내용을 .ts 에 반영" — 절대 금지 (figma 가 진리, .ts 는 history)
- ❌ figma sync 라운드 시 차이 발견하고 .ts 미세 보정 시도 — 절대 금지

### 허용 시나리오 (예외 — 3종만)
- ✅ 최초 1회 — 신규 도메인 .ts 작성 (해당 도메인 첫 figma frame 생성)
- ✅ 빌드 에러 / 런타임 에러 수정 — `npm run build` 가 PASS 안 될 때만 (디자인 변경 X)
- ✅ 사용자가 명시적으로 "재작성" / "다시 그려" / "그려줘" 지시 시

### figma sync 라운드 시 처리
사용자가 "figma 진리 sync" / "내가 그린거랑 다르다" 등으로 요청해도:
1. figma read → 차이 분석
2. **문서에만 기록** (`design-report.md` / `sync-analysis.md`)
3. .ts 는 절대 손대지 X
4. 사용자가 명시적으로 "재작성" 지시 시만 .ts Write 1회

### 위반 시
즉시 중단. 사용자 메시지에 "수정 금지" / ".ts 손대지마" / "쳐 만들지말라" 류 표현 발견 시 무조건 중단 + 사과 + 룰 재확인.

### 룰 출처
사용자 (2026-05-11): "시발 이딴거 쳐 만들지말라고, 열받게 하네; 그리고 .ts 는 수정하지마, 딱 한번 만드는 용도니까"

---

## 0. 절대 원칙 — figma 진리 우선 (2026-05-11 갱신)

사용자가 figma 에서 정리한 디자인이 **유일한 진리 (ground truth)**. SCSS/JSX baseline 은 figma 진리에 맞춰 마이그레이션 대상이지 figma 를 거꾸로 강제하는 기준 아님.

| 우선순위 | 항목 |
|---|---|
| ⭐ 1순위 | **사용자 figma 페이지** (`컴프야펀 디자인 작업 완료`, file `VCVQzOpSIpwpZw11gxG7N1`) — agent 가 figma MCP read 로 추출 |
| 2순위 | `web/src/global/styles/variables/` 의 SCSS 토큰 (figma 진리와 일치하는 raw 값) |
| 3순위 | 기존 JSX 컴포넌트 / module.scss (단, figma 진리와 충돌 시 마이그레이션 대상) |

⚠️ **충돌 시 처리**: figma 진리에 맞춰 **문서에 기록만**. .ts 코드는 손대지 X (§ 0.0). 토큰 값 자체 변경도 HITL 보고 (`Tokens` namespace 정의 변경 금지 — 강제 HITL § 6).

---

## 1. 4px Grid — figma 진리 우선 (룰 완화)

기본 권고는 4 배수이나, **사용자 figma 진리가 4 배수 아닌 값을 사용하면 진리 우선**.

### 권고 값 (4 배수 — figma 진리에 맞으면 사용)
```
0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 88, 96, 104, 112, 120, 128, 144, 160, 192, 256, 320, 384, 416, 480, 512, 768, 932, 1024, ...
```

### figma 진리에서 사용 중인 4 배수 외 값 (모두 허용)
| 값 | 사용처 (figma 진리 기준) |
|---|---|
| 1 | divider / border weight |
| 2 | accent bar radius |
| 3 | NoticeDot/NEWBadge radius |
| 5 | CommItem gap |
| 6 | QN cell gap, NoticeDot/HOT badge size, divider gap, Quiz/Coupon micro padding |
| 7 | Tip card gap |
| 9 | TitleWrap padTop, CouponCode left, badge text padLeft |
| 10 | radius-xl, F4/F5/F7 section gap, Tips itemGap |
| 11 | section title margin-left, ExpiryWrap padRight |
| 13 | accentBar height, fs13 section title |
| 14 | chevron font-size |
| 19 | HOT/NEW badge height |
| 22 | Coupon TopRow height, hero title font-size, emoji 22pt |
| 34 | Coupon BtnGo width |
| 41 | Event StatusBadge width |
| 52 | TopBar height, BottomBar+4, IconBg size, CommItem height |
| 79.75 | QN cell width (375 - 32 - 24) / 4 = 79.75 |
| 82 | CouponCode width |
| 100 | Hero badge width (109 / 100) |
| 109 | Hero badge width |
| 167.5 | Event card width (343 - 8) / 2 |
| 170 | QuizCard height |
| 200 | CouponCard width |
| 250 | Drawer max-width (사용자 pin) |
| 343 | section inner width (375 - 16×2) |
| 375 | **home 도메인 wrapper 폭** (사용자 진리) |
| 428 | applayout 글로벌 wrapper 폭 (사용자 진리, iPhone Pro Max) |
| 9999 | pill radius |

→ **figma 진리에서 사용한 값이라면 4 배수 위반이어도 그대로 사용**. agent 가 임의로 반올림 X.

### 4px Grid 룰 적용 범위 (재정의)
- ✅ **신규 디자인 작성 시** (figma 진리에 없는 새 영역) — 4 배수 권고
- ❌ **figma 진리 sync 시** — figma 진리 값 우선, 4 배수 강제 X
- 보고: design-report.md 에 4 배수 위반 표는 **사용자 정보용** (강제 마이그레이션 X)

---

## 2. 컴포넌트 사이즈 baseline (figma 진리 우선)

### 2.0 진리 추출 위치

| 우선순위 | 위치 |
|---|---|
| ⭐ 1순위 | **사용자 figma 페이지** `컴프야펀 디자인 작업 완료` (file `VCVQzOpSIpwpZw11gxG7N1`) |
| 2순위 | `web/src/global/styles/variables/` (SCSS 토큰) |
| 3순위 | `web/src/app/wrapper/mobile/` / `web/src/global/ui/` (JSX/module.scss) |

코드와 figma 가 다르면 — **figma 가 ground truth**. SCSS/JSX 를 figma 진리에 맞춰 마이그레이션.

### 2.1 글로벌 컴포넌트 (applayout 영역, 428 폭 wrapper)

| 컴포넌트 | figma 진리 사이즈 | 코드 일치 여부 | 비고 |
|---|---|---|---|
| F1 Mobile wrapper | 428×N | 일치 (`$bp-mobile-lg`) | iPhone Pro Max — applayout 도메인 표준 |
| TopBar height | 52 | 일치 (`$layout-topbar-height`) | 4×13 OK |
| BottomBar height | 56 | 일치 (`$layout-bottombar-height`) | 4×14 OK |
| Layout H padding | 16 | 일치 (`$layout-h-pad`) | 4×4 OK |
| Drawer max-width | 250 | 일치 (`Drawer.module.scss` L39) | 사용자 pin — 유지 |
| Drawer width % | 75% | 일치 | viewport 비율 |
| 모바일 frame height | 932 | iPhone 14 Pro Max | 4×233 OK |

### 2.2 home 도메인 컴포넌트 (375 폭 wrapper, figma 진리 17:2360)

| frame | figma 진리 사이즈 | 4 배수 | 비고 |
|---|---|---|---|
| F1 Mobile Home wrapper | 375×1646 | — / 4×411.5 NO | 사용자 진리 — 375 폭 그대로 |
| F2 Hero Banner | 375×100 | — / 4×25 OK | padding 16 전체, gap 4 |
| F3 QuickNav Section | 375×120 | — / OK | 4-cell 79.75 width, gap 8, padding 16 |
| F4 Quiz Section | 375×250 | — / OK | padding 16 전체, gap 10, QuizCard 343×170 |
| F5 Coupon Section | 375×170 | — / OK | padding 16 전체, gap 10, CouponCard 200×104 |
| F6 Notice Section | 375×242 | — / NO (4×60.5) | padding 16 전체, gap 4, item 343×64 padding 12 |
| F7 Event Section | 375×166 | — / NO (4×41.5) | padTop 16 only (padBot 0), gap 10, EvtCard 167.5×124 |
| F8 Community Section | 375×208 | — / OK | padTop 16, gap 4, item 343×52 padding 12 gap 5 |
| F9 Tips Section | 375×338 | — / OK | padding 16 전체, gap 4, TipCard 343×72 padding 12 gap 7 |

### 2.3 home 도메인 내부 토큰 / 패턴 (figma 진리)

| 요소 | 값 | 사용처 |
|---|---|---|
| SectionHeader accentBar | 3×13, radius 2, fill brand | 모든 F4~F9 헤더 좌측 |
| Section title text | 13 / 600 / white-92 | F4~F9 헤더 텍스트 |
| Section "전체 보기 →" | 11 / 400 / #7c6f8f | F5~F9 헤더 우측 |
| 카드 radius (Quiz/Coupon/Event) | 10 | $radius-xl |
| 카드 radius (Notice/Comm/Tip) | 8 | $radius-lg |
| 카드 border | 1 white-06 또는 1 white-12 | Quiz/Coupon = 12, 나머지 = 6 |
| QuickNav IconBg | 52×52 rgba(168,106,240,0.15) radius 8 | F3 cell 내부 |
| QuickNav cell | bg/border **없음** (transparent) | F3 cell 자체 |
| HOT badge | 20×19 bg rgba(232,65,65,0.18) radius 3, text 9/600/#e84141 | F8 |
| NEW badge | 22×19 bg rgba(232,213,65,0.33) radius 3, text 9/600/#ffd9d9 | F8 |
| 진행중 badge | 41×20 bg #6c5ce7 radius 4, text 9/600/white | F7 |
| Event Thumb 색 (purple) | #3c1e50 | F7 EvtCard_0 |
| Event Thumb 색 (navy) | #19284b | F7 EvtCard_1 |
| Coupon code chip | 82×22 bg #332947 radius 4 (전체 동일), text 9/600/#d9d3e0 | F5 |
| Coupon BtnGo (active) | 34×22 bg #6d4ad3 radius 4, text 9/400/white | F5 active |
| Coupon BtnGo (inactive) | 34×22 bg #332947 border rgba(168,106,240,0.3) radius 4, text 9/400/white-50 | F5 inactive |
| Tip card left border | (figma 측정상 일반 border 1 rgba(168,106,240,0.5) 4면 동일) | F9 |

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

### Color baseline (`_colors.scss` + figma 진리 추출)

**1차 토큰 (`Tokens.COLOR` namespace)** — applayout 도메인 baseline:
- `bg-deepest #0f0a14`
- `bg-deep #140f1f`
- `bg-overlay #18141f`
- `bg-card #1f1a29`
- `bg-elevated #332947`
- `brand #a86af0`
- `brand-dark #6d4ad3`
- `brand-violet #6c5ce7`
- `naver-green #03c75a`
- `white #ffffff`
- `text-primary white-92%`
- `text-secondary white-60%`
- `text-muted white-38%`
- `border white-06%`

**figma 진리 inline raw (home 도메인 추가, 2026-05-11 sync)** — Tokens namespace 미정의, inline 사용 OK:

| 색 | 사용처 |
|---|---|
| `#d9d3e0` | Hero badge text, Coupon code text |
| `#7c6f8f` | "전체 보기 →" 텍스트 |
| `#3c1e50` | Event thumb (purple — 리그 버닝) |
| `#19284b` | Event thumb (navy — 가위바위보) |
| `#e84141` | HOT badge text |
| `#ffd9d9` | NEW badge text |
| `rgba(124,111,143,0.12)` | Hero badge bg |
| `rgba(168,106,240,0.15)` | QN IconBg |
| `rgba(168,106,240,0.3)` | Coupon BtnGo inactive border |
| `rgba(168,106,240,0.5)` | Tip card border |
| `rgba(232,65,65,0.18)` | HOT badge bg |
| `rgba(232,213,65,0.33)` | NEW badge bg |
| `rgba(230,230,230,0.5)` | Hero badge border |
| `rgba(223,223,223,0.82)` | Hero sub text |
| `rgba(255,255,255,0.12)` | Quiz/Coupon card border (진한 버전) |
| `rgba(255,255,255,0.04)` | Notice divider |

→ 위 inline raw 는 home 도메인 sync 시 그대로 사용 OK. **Tokens namespace 추가 금지** — 다음 라운드 토큰화 마이그레이션 시 일괄 검토.

---

## 4. 모바일 우선 (도메인별 wrapper 폭)

### Frame wrapper 폭 — figma 진리 (2026-05-11 sync 후)

| wrapper | 폭 | 사용처 (사용자 진리) |
|---|---|---|
| **applayout** | **428** | F1~F10 (`Mobile wrapper`, `TopBar home/page`, `Drawer guest/user`, `RenewalNoticeModal`, `ResponseModal success/error`, `Suspense loading`, `AuthProvider blank`) |
| **home** | **375** | F1~F9 (`Mobile Home — 컴프야펀`, F2 Hero ~ F9 Tips) |

⚠️ **두 도메인 폭이 다른 이유** — 사용자가 figma 에서 그렇게 정리. agent 가 통일 시도 X.
- applayout: iPhone 14 Pro Max (428) — 글로벌 wrapper / modal / drawer 등 풀-스펙
- home: iPhone 표준 (375) — 도메인 페이지 컨텐츠 영역

코드 wrapper (`MobileLayout`) 는 글로벌 480 max-width 로 모든 도메인을 감싸므로, **375 home 컨텐츠 + 글로벌 좌우 여백** 으로 PC/tablet 에서 렌더.

### 도메인별 wrapper 폭 추출 룰

1. agent 가 figma 페이지 메타데이터 read 시 **F1 wrapper 의 width 확인**
2. wrapper 폭이 428 / 375 / 그 외인지 확인 후 `HOME_W` 등 상수에 반영
3. `web/src/global/styles/variables/_breakpoints.scss` 의 `$bp-mobile-lg` = 428 은 applayout 기준 — home 도메인은 별도 const

### Wrapper 전역 스택
- 글로벌 wrapper: `MobileLayout` max-width 480 (PC/tablet 좌우 여백)
- applayout 영역 (TopBar / Drawer / Modal): 428 폭
- home 영역 (도메인 컨텐츠): 375 폭 — 글로벌 wrapper 안에 중앙 정렬

### 반응형
- tablet / PC: 모바일 형태 유지 (좌우 여백)
- media query 분기 X (단일 모바일 레이아웃)

---

## 5. 검증 절차 (코드 작성 후)

### 5.1 figma 진리 정합 (1순위)

1. 작성한 `figma-plugin/code.ts` 의 frame width / height / padding / gap 이 **figma 진리 페이지의 동일 frame 값과 일치** 하는지 verify
2. 차이 발견 시 → figma 진리 우선 → 코드 수정 (반대 방향 X)
3. 사용자 figma 페이지 read: `mcp__figma-dev-mode__get_design_context` 로 frame 별 spec 추출

### 5.2 글로벌 컴포넌트 사이즈 정합 (2순위)

코드 baseline 도 figma 진리와 일치하는지 추가 확인:
- Drawer max-width = 250
- TopBar height = 52
- applayout wrapper = 428 / home wrapper = 375

### 5.3 4px Grid (정보 기록만, 강제 X)

```bash
grep -nE '\b(width|height|padding|margin|gap|cornerRadius|itemSpacing|paddingLeft|paddingRight|paddingTop|paddingBottom|strokeWeight)\s*[:=]\s*[0-9]+' figma-plugin/domains/*.ts
```

4 배수 위반은 `design-report.md` § 4px Grid 표에 정보 기록. **figma 진리 값이면 그대로 유지** (반올림 X).

### 5.4 위반 시 보고 (figma 진리와 불일치)

- 메인 어시스턴트에 위반 항목 표 형식으로 보고
- 강제 HITL 4 분야 (Tokens 값 변경 / 컴포넌트 라이브러리 구조 / 레이아웃 컨벤션 / 외부 자산) 해당 시 사용자 답변 대기

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

frame / 컴포넌트의 모든 값은 **figma 진리 1:1 정확 read 후 작성** (1순위). 추정 / 어림짐작 절대 금지.

- **figma 진리 우선** (§ 0): 사용자 figma 페이지의 frame metadata + design context 가 ground truth
- SCSS/JSX 는 코드 출처 reference (2~3순위)
- figma 진리 ↔ SCSS/JSX 충돌 시 figma 우선, 코드는 마이그레이션 대상으로 design-report 에 표시

### 9.2 read 대상

**1순위 — figma 진리 (figma MCP)**

| 도구 | 용도 |
|---|---|
| `mcp__figma-dev-mode__get_design_context` | 노드 별 자식 트리 + 스타일 + 토큰 변수 |
| `mcp__figma-dev-mode__get_metadata` | 페이지/노드 전체 트리 + 좌표 + 사이즈 (XML) |
| `mcp__figma-dev-mode__get_screenshot` | 시각 검증 |

진리 페이지 (2026-05-11 기준): `컴프야펀 디자인 작업 완료` (file `VCVQzOpSIpwpZw11gxG7N1`, page 212:2)

**2~3순위 — 코드 reference (figma 진리와 동일한지 검증용)**

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

### 9.6 figma 진리 ↔ 4 배수 룰 충돌 시

**figma 진리 우선 (§ 0)**. 4 배수 위반은 `design-report.md` § 4px Grid 검증 표에 **정보 기록**만 하고 강제 마이그레이션 X.

| 충돌 케이스 | 처리 |
|---|---|
| `$radius-md = 6`, `$radius-xl = 10` | 토큰 그대로 — 마이그레이션 미루기 |
| Drawer max-width 250 | 사용자 명시 — 그대로 |
| home wrapper 375 폭 | figma 진리 — 그대로 |
| applayout wrapper 428 폭 | figma 진리 — 그대로 |
| QN cell 79.75 | figma 진리 (375-32-24)/4 — 그대로 |
| Event card 167.5 | figma 진리 (343-8)/2 — 그대로 |
| CouponCode 82, BtnGo 34, spacer 28 | figma 진리 — 그대로 |
| Hero badge 109×20 | figma 진리 — 그대로 |
| HOT 20, NEW 22, IconBg 52, accentBar 13 | figma 진리 — 그대로 |
| RenewalNoticeModal radius 14 | 코드 baseline — 그대로 (raw 값) |
| RenewalNoticeModal padding-top 28 | 코드 baseline — 그대로 |
| confirmBtn padding 10 0 | 코드 baseline — 그대로 (raw 값) |
| modal width 320 | 코드 baseline — 그대로 (4배수 OK) |

### 9.7 anti-pattern

- ❌ figma MCP read 없이 frame 사이즈 / padding 추정 → 시각 mismatch (직전 라운드 사용자 불만 사례)
- ❌ "대략 padding 16 일 거야" → figma 진리는 padTop 12 일 수도 → 정확히 read 필요
- ❌ figma 진리값이 4 배수 아니라고 임의 반올림 → figma 와 시각 mismatch
- ❌ SCSS 토큰 값을 figma 진리에 맞춰 변경 → 강제 HITL 위반 (Tokens namespace 정의 변경 금지)
- ❌ home / applayout wrapper 폭을 한쪽으로 통일 시도 → 사용자 figma 진리 무시
- ❌ figma 진리 페이지 (212:2) read 안 하고 추측으로 작업 → 직전 라운드의 다양한 측정 미스 사례

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
| 2026-05-11 | **글로벌 룰 figma 진리 sync** — § 0 진리 우선 원칙 신규 / § 1 4px Grid 룰 완화 (figma 진리값 그대로 허용) / § 2 home 도메인 baseline (375 wrapper, F1~F9, IconBg 52, HOT 20 / NEW 22, CouponCode 82, BtnGo 34, …) 추가 / § 3 home 도메인 inline raw 색 16종 추가 / § 4 도메인별 wrapper 폭 (applayout 428 / home 375 병존) 명시. 사용자 figma 페이지 `컴프야펀 디자인 작업 완료` (file `VCVQzOpSIpwpZw11gxG7N1`, page 212:2) 가 진리 출처. |
| 2026-05-11 | **⛔ § 0.0 절대 룰 추가** — `.ts 는 한 번만 작성, 수정 금지`. figma sync 라운드 시에도 .ts 수정 X (문서 기록만). 사용자 명시 재작성 지시만 예외. 룰 출처: 사용자 메시지 "시발 이딴거 쳐 만들지말라고, 열받게 하네; 그리고 .ts 는 수정하지마, 딱 한번 만드는 용도니까". `.claude/agents/designer.md` 에도 동일 룰 미러링. |

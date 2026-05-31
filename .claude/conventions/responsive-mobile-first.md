# 반응형 — Mobile First 모드

> 본 프로젝트 고정 모드. 모드 결정 절차 없음 (mobile-first 단일).

---

## 1. 핵심 원칙

**모바일 우선. tablet / PC 도 모바일 형태 + 좌우 여백.** 데스크탑 전용 레이아웃 X, multi-column X, PC 전용 인터랙션 X.

---

## 2. 환경별 동작

| 환경 | 폭 | 동작 |
|---|---|---|
| smallest mobile | ~320px | 기본 모바일 레이아웃 |
| medium mobile | 375~414px | 기본 모바일 레이아웃 (주 사이즈) |
| large mobile | ~480px | 모바일 레이아웃 유지 |
| tablet / PC | 768px+ | **모바일 형태 유지** + 좌우 여백 / 중앙 정렬 |

---

## 3. Figma frame

권장 사이즈: **375 기준 단일** (차선 390, 414 미채택). 더 큰 화면은 auto-layout + constraints 로 표현.

⭐ Frame width 통일 / 320 보호 / 8pt grid / tap target 상세: [`docs/global-guide/design/mobile-frame.md`](../../docs/global-guide/design/mobile-frame.md)

---

## 4. CSS 변환 규칙

```css
.page-wrapper { max-width: 480px; margin: 0 auto; width: 100%; }
.component    { width: 100%; }  /* media query 분기 X */

/* 예외: 320px 미만 폴드폰 보호용만 허용 */
@media (max-width: 320px) { .component { font-size: 12px; } }
```

---

## 5. 글로벌 레이아웃 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `<MobileLayout>` | `web/src/app/wrapper/mobile/MobileLayout.jsx` | wrapper + 글로벌 TopBar + Drawer |
| TopBar | `useSetTopBar({ variant: "page", title, ... })` 도메인에서 설정 | 도메인 자체 헤더 금지 |

---

## 6. 인터랙션 패턴

- **터치 우선** — 버튼 최소 44×44px tap target
- **스와이프 / pull-to-refresh / Long-press 권장**
- **hover 의존 X** — 모든 정보는 tap 으로 접근
- **modal / drawer / sheet** 위주

---

## 7. 금지 사항

- ❌ media query 로 데스크탑 전용 분기 (320px 미만 보호 외)
- ❌ multi-column 레이아웃
- ❌ hover 의존 UX
- ❌ 도메인별 자체 헤더 (글로벌 TopBar 사용)
- ❌ data table — 모바일은 card list
- ❌ sidebar navigation — Drawer 사용

---

## 8. screen-spec.md 기재 패턴

```markdown
**레이아웃** (mobile-first)
- wrapper: <MobileLayout> (글로벌 TopBar 포함, useSetTopBar 로 설정)
- 외곽 padding: $spacing-md (16px)
- auto-layout: column, gap $spacing-sm (8px)

**구조 (트리)**
<{Domain}Screen>
├── (TopBar 는 글로벌 — useSetTopBar 로 page variant 설정)
├── <SectionBlock />
└── <CardList />
    └── <Card /> × N
```

---

## 9. figma-plugin (분리 구조)

⭐ 코드 위치 = `figma-plugin/domains/{domain}.ts`. code.ts 는 호출만 (누적 보존). 상세: [figma-plugin.md](./figma-plugin.md)

```typescript
// figma-plugin/domains/{domain}.ts
import { createFrame, applyMobileLayout } from "../shared/helpers";
import { spacing } from "../shared/tokens";
export async function draw{Domain}() {
  const frame = createFrame("{Domain} Screen", 375, 812);
  applyMobileLayout(frame, { padding: spacing.md, gap: spacing.sm });
}
```

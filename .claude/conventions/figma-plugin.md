# Figma Plugin code.ts 작성 컨벤션

> ⛔ **폐기 — 2026-08-20.** Figma 작업은 MCP 직접 조작으로 전환됐다.
> 현행 룰: [docs/global-guide/design/figma-mcp-rules.md](../../docs/global-guide/design/figma-mcp-rules.md)
> 본 문서는 과거 방식 기록으로만 보존한다. **여기 적힌 절차를 실행하지 말 것.**

> designer-render / code-to-design skill 참조. (과거 기록)

---

## 1. 프로젝트 구조 (분리)

```
figma-plugin/
├── manifest.json
├── code.ts                # ⭐ 진입점. 매 작업 append (이전 코드 주석 보존)
├── domains/{feature}.ts   # 도메인 1개 = 파일 1개
└── shared/
    ├── helpers.ts         # createFrame, applyAutoLayout 등
    └── tokens.ts          # color/typography/spacing/radius
```

---

## 2. 워크플로우

| 단계 | 자동 | 비고 |
|---|---|---|
| `domains/{feature}.ts` 작성 | ✅ | designer-render |
| `code.ts` 호출 append | ✅ | 이전 실행은 주석 처리 |
| tsc 빌드 | ✅ | `npm run watch` |
| Figma 실행 | ❌ | 사용자 `Ctrl+Alt+P` |
| 결과 검증 | ✅ | `mcp__figma-dev-mode__get_screenshot` |

---

## 3. 누적 보존 패턴 (⭐ 핵심)

이전 실행 코드 **삭제 X, 주석 처리 후 새 작업 append**.

```typescript
import { drawHome } from "./domains/home";
import { drawCoupons } from "./domains/coupons";
import { drawCommunity } from "./domains/community";

(async () => {
  // === [실행됨 2026-05-28] home 화면 v1 ===
  // await drawHome();

  // === [실행됨 2026-05-30] coupons 화면 v1 ===
  // await drawCoupons();

  // === [실행 중 2026-05-31] community 신규 ===
  await drawCommunity();
  figma.notify("✅ community 완료");
})();
```

| 헤더 | `// === [실행됨 YYYY-MM-DD] {작업명} ===` (완료) / `// === [실행 중 YYYY-MM-DD] {작업명} ===` (진행) |
|---|---|
| 본문 | 완료 후 `// await drawXxx();` 한 줄 주석화. 다음 작업 시 같은 방식 |

⭐ **매번 처음부터 작성 X**. 이전 실행 코드는 주석으로 살아있어야 함.

---

## 4. `domains/{feature}.ts` 패턴

```typescript
import { createFrame, applyMobileLayout, addText } from "../shared/helpers";
import { color, spacing, typography } from "../shared/tokens";

export async function drawCommunity() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const frame = createFrame("Community Screen", 375, 812);
  applyMobileLayout(frame, { padding: spacing.md, gap: spacing.sm });
  addText(frame, "커뮤니티", typography.h1, color.text.primary);
  figma.viewport.scrollAndZoomIntoView([frame]);
}
```

---

## 5. shared 시그니처 요약

| 헬퍼 (`shared/helpers.ts`) | 시그니처 |
|---|---|
| `createFrame` | `(name, w, h) => FrameNode` |
| `applyMobileLayout` | `(node, { padding, gap }) => void` |
| `addText` | `(parent, text, style, fill) => TextNode` |

토큰 (`shared/tokens.ts`): `color.{background,text,brand}`, `spacing.{xs,sm,md,lg,xl}`, `typography.{h1,body,...}`.
⭐ FE SCSS 토큰과 1:1 동기화.

---

## 6. 작성 원칙

1. **재사용 우선** — `findOne` 으로 기존 frame 찾고 `remove()` 후 재생성, 또는 `clone()`
2. **auto-layout 우선** — `layoutMode = 'VERTICAL'|'HORIZONTAL'`. 절대 좌표 X
3. **토큰 사용** — `shared/tokens.ts` 경유. 매직 넘버 X
4. **frame width = 375 통일** — 상세 [`docs/global-guide/design/mobile-frame.md`](../../docs/global-guide/design/mobile-frame.md)
5. **에러 처리** — try/catch
6. **notify 필수**

---

## 7. 안티패턴

- ❌ code.ts 에 그리기 로직 직접 (반드시 `domains/` 분리)
- ❌ 이전 실행 코드 삭제 (주석 처리 필수)
- ❌ 절대 좌표 배치
- ❌ 색상/간격 하드코딩
- ❌ 한 domain 파일에 여러 도메인

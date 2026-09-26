# 반응형 — Mobile First 모드

> 본 프로젝트 고정 모드. 모드 결정 절차 없음 (mobile-first 단일).

---

## 1. 핵심 원칙

**모바일 우선. tablet / PC 도 모바일 형태 + 좌우 여백.** 데스크탑 전용 레이아웃 X, multi-column X, PC 전용 인터랙션 X.

- **단일 코드베이스 / 단일 컴포넌트** — SSR/CSR 분기 X, 컴포넌트 분기 X
- **디자인 토큰 일원화** — color / typography / spacing / radius 는 항상 같은 토큰 사용

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

권장 사이즈: **480 단일** — 코드 wrapper (`$layout-screen-width` / `$layout-wrapper-max`) 와 1:1.
375 / 390 / 414 / 428 은 별도 frame 을 만들지 않고, 하나의 480 frame 안에서 auto layout + clamp / % 로 자연 축소한다.

⭐ Frame width 통일 / 320 보호 / 8pt grid / tap target 상세: [`docs/global-guide/design/mobile-frame.md`](../../docs/global-guide/design/mobile-frame.md)

---

## 4. CSS 변환 규칙

⭐ `clamp() / min() / max()` 로 부드러운 스케일링 권장. media query 는 아래 320px 예외 외에는 쓰지 않는다.

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

## 9. Figma 작업 방식

⭐ Figma 작업은 **MCP 직접 조작** (Claude 가 `use_figma` 로 직접 씀, 사용자 수작업 없음). 상세: [figma-mcp-rules.md](../../docs/global-guide/design/figma-mcp-rules.md)

`figma-plugin/domains/{domain}.ts` + `code.ts` 누적 append 방식은 ⛔ 폐기 (2026-08-20). 과거 기록은 git 이력 참조, 재실행 금지.

---

## 10. 자가 점검 (모든 agent 공통)

- [ ] 본 문서를 1회 Read 했는가?
- [ ] 산출물에 mobile-first 원칙 반영했는가? (도메인 헤더 X / multi-column X / hover 의존 X)
- [ ] `<MobileLayout>` 사용했는가? (도메인 자체 wrapper X)

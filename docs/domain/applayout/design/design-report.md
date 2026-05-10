# AppLayout — Design Report

> 작성일: 2026-05-11
> 모드: create (신규 frame 생성)
> 산출 경로: `figma-plugin/code.ts` (771줄), `figma-plugin/code.js` (688줄, 자동 빌드)

---

## 0. 실행 요약

planner reverse 산출물 (`docs/domain/applayout/prd/`) 토대로 AppLayout 글로벌 layer 의 **F1~F10 frame 10개** 를 Figma plugin code 로 정의. TypeScript strict 모드 빌드 PASS.

| 항목 | 결과 |
|---|---|
| code.ts 라인 수 | 771 |
| code.js 라인 수 | 688 |
| TypeScript strict | PASS |
| 빌드 | PASS (`npm run build`) |
| frame 수 | 10 (F1~F10) |
| 사용 토큰 | 14 색 + 4 typography + 4 layout |
| async 정합 | dynamic-page (`loadAllPagesAsync` + `loadFontAsync`) |

---

## 1. F1~F10 frame 정의

| Frame | 크기 | code 라인 (대략) | 핵심 구성 |
|---|---|---|---|
| F1 Mobile wrapper | 428×932 | L116~L156 | TopBar (home, guest) + 빈 pageContent |
| F2 TopBar home | 428×120 | L160~L213 | 2 states (logged-out / logged-in) 세로 배치 |
| F3 TopBar page ❓ | 428×84 | L217~L249 | back / title / rightAction (placeholder) |
| F4 Drawer guest | 428×932 | L253~L353 | TopBar + overlay + 좌측 패널 (guest profile + 메뉴) |
| F5 Drawer user | 428×932 | L357~L488 | TopBar + overlay + 좌측 패널 (avatar + 이벤트 active + logout) |
| F6 RenewalNoticeModal | 428×932 | L492~L536 | overlay + 카드 (🚧 + 메시지 + 확인) |
| F7 ResponseModal success | 428×932 | L540~L592 | overlay + 카드 (✓ green + 메시지 + 확인) |
| F8 ResponseModal error | 428×932 | L596~L648 | overlay + 카드 (! red + 메시지 + 확인) |
| F9 Suspense loading | 428×932 | L652~L697 | TopBar + "로딩중..." + 카드 skeleton 3개 |
| F10 AuthProvider blank ❓ | 428×932 | L701~L731 | placeholder + 주석 (스플래시 vs blank 미정) |

frame 배치: 4행 × 3열 격자 (480 간격 + 1000 행간). 사용자가 Figma 에서 자유 재배치 가능.

---

## 2. 사용 토큰 (raw 값으로 inline)

| 토큰 그룹 | 정의 |
|---|---|
| Color (14) | bg-deepest #0f0a14 / bg-deep #140f1f / bg-card #1f1a29 / bg-elevated #332947 / brand #a86af0 / brand-violet #6c5ce7 (+ alpha 12%) / success #03c75a / danger #e84141 / text-primary white-92% / text-secondary white-60% / text-muted white-38% / border white-06% / overlay-50% black / white |
| Typography (4 weights) | Inter Regular / Medium / Semi Bold / Bold |
| Spacing | 8 / 12 / 16 / 24 / 28 |
| Layout | 428 (모바일 폭) / 52 (TopBar) / 932 (모바일 height) |
| Radius | 6 / 8 / 10 / 9999 (full) |

🟨 **가정**: Figma variables (token binding) 미생성. raw 값으로 inline. 사용자가 Figma 에서 variables 매핑 별도 진행 가능.

---

## 3. 빌드 결과

```
$ npm run build
> compyafun-designer-bridge@0.1.0 build
> tsc -p tsconfig.json
(stdout 없음 — strict PASS)
```

- TypeScript strict 모드 통과
- dynamic-page documentAccess 정합 (`figma.loadAllPagesAsync` + `figma.loadFontAsync` async 처리)
- 모든 figma.\* 호출이 await 또는 sync (createFrame / createText / createRectangle 는 sync OK)

---

## 4. 사용자 액션 안내

```
✅ figma-plugin/code.ts 작성 + 빌드 완료
   - 771 lines TS / 688 lines JS

👉 Figma desktop app 액션:
   1. com2usbaseball Figma 파일 열기 (file-key: VCVQzOpSIpwpZw11gxG7N1)
   2. Ctrl+Alt+P (Run Last Plugin)
      └─ 미등록 시: Plugins → Development → Import plugin from manifest
                   → figma-plugin/manifest.json 선택
   3. plugin 실행 → 현재 page 에 F1~F10 frame 자동 생성
   4. viewport 자동 줌 → "AppLayout 10 frame 생성 완료" 토스트 확인
```

---

## 5. 미정 / 가정 list

### ❓ 미정 (별도 라운드)

| 항목 | frame | 근거 |
|---|---|---|
| TopBar page variant 사용 매핑 | F3 | feature-spec § 7-1 (사용처 0) |
| AuthProvider blank UX | F10 | feature-spec § 7-2 (스플래시 vs blank 미정) |
| 404 페이지 디자인 | (미생성) | edge-cases EC-2.1 P0 |
| ErrorBoundary 디자인 | (미생성) | edge-cases EC-2.2 P0 |
| Drawer badge 5/3 동기화 | F4, F5 | edge-cases EC-5.1 (하드코딩) |

### 🟨 가정

| 항목 | 사유 |
|---|---|
| 모바일 height 932 | iPhone 14 Pro Max 기준 (428×932) — 사용자 변경 가능 |
| frame 배치 4×3 격자 | 사용자가 Figma 에서 자유 재배치 |
| Figma variables 미사용 | raw 색상 inline (사용자가 Figma 에서 token binding 별도 진행 가능) |
| Figma component variants 미생성 | frame 수준만 — 검토 후 컴포넌트화 결정 |
| Inter 폰트 사용 | 시스템 / Figma 기본 — 미설치 시 fallback |
| 이모지 아이콘 | code baseline 의 MENU_GROUPS 그대로 — Figma icon 라이브러리 교체 가능 |

---

## 6. 다음 단계 권고

1. **사용자 검증 (Ctrl+Alt+P)** — F1~F10 frame 시각 확인
2. **검증 후 분기**:
   - (a) ✅ OK → BE/FE 도메인 작업 트랙 진입 (home / coupons / events / notices / historyMode 도메인별 PRD)
   - (b) 🟨 수정 필요 → designer 라운드 추가 (예: F10 AuthProvider 디자인 결정 / 404 frame 추가)
3. **Figma 측 후속**:
   - frame → component 변환 (variants 정의)
   - raw 색상 → variables binding
   - icon 이모지 → vector icon 교체
4. **ops 분야 후속** — `figma-plugin/code.ts` git commit 결정 (사용자 승인 후)

---

## 7. 파일 변경 list

| 파일 | 변경 |
|---|---|
| `figma-plugin/code.ts` | 덮어쓰기 (이전 frame 212:3 task → AppLayout F1~F10 task) |
| `figma-plugin/code.js` | 자동 빌드 (771→688 lines) |
| `docs/domain/applayout/design/design-analysis.md` | 신규 |
| `docs/domain/applayout/design/design-report.md` | 신규 (본 문서) |
| `docs/domain/applayout/design/implementation-handoff.md` | 신규 |

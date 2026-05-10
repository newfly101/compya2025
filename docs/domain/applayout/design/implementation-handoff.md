# AppLayout — Implementation Handoff

> 작성일: 2026-05-11
> 대상: BE/FE 개발자 (designer → develop 트랙 인계)
> 사전조건: Figma 에서 F1~F10 frame 사용자 검증 완료

---

## 0. designer → develop 인계 요약

본 라운드는 **글로벌 layer 의 Figma frame 정의** 만. 코드 수정 X.
F1~F10 frame 은 현재 코드 (`web/src/app/wrapper/mobile/*`) 와 **시각 baseline 일치** — 신규 구현 X. 단, 본 frame 이 후속 도메인 PRD / 디자인 라운드의 **시각 reference** 로 사용됨.

---

## 1. frame ↔ 코드 매핑 (1:1)

| Frame | code 파일 | 검증 포인트 |
|---|---|---|
| F1 Mobile wrapper | `web/src/app/wrapper/mobile/MobileLayout.jsx` + `*.module.scss` | TopBar 52px / pageContent flex:1 |
| F2 TopBar home | `web/src/app/wrapper/mobile/parts/TopBar.jsx` (variant=home) | 햄버거 + 로고 + 로그인/로그아웃 |
| F3 TopBar page ❓ | `web/src/app/wrapper/mobile/parts/TopBar.jsx` (variant=page) | back + title + rightAction (사용처 0) |
| F4 Drawer guest | `web/src/app/wrapper/mobile/parts/Drawer.jsx` (user=null) | 로그인 안내 + 메뉴 |
| F5 Drawer user | `web/src/app/wrapper/mobile/parts/Drawer.jsx` (user!=null) | profile + 메뉴 + active 액센트 + logout |
| F6 RenewalNoticeModal | `web/src/global/ui/renewalNoticeModal/RenewalNoticeModal.jsx` | comingSoon 클릭 시 |
| F7 ResponseModal success | `web/src/global/ui/responseModal/ResponseModal.jsx` (success=true) | thunk fulfilled |
| F8 ResponseModal error | `web/src/global/ui/responseModal/ResponseModal.jsx` (success=false) | thunk rejected |
| F9 Suspense loading | `web/src/app/wrapper/mobile/MobileLayout.jsx` L72 (Suspense fallback) | "로딩중..." 텍스트 |
| F10 AuthProvider blank ❓ | `web/src/app/provider/AuthProvider.jsx` L22 (initialized=false null) | 디자인 미정 (placeholder) |

---

## 2. 후속 작업 권고 (우선순위)

### P0 (사용자 의사결정 필수)

| 작업 | 트랙 | 비고 |
|---|---|---|
| F10 AuthProvider blank 디자인 결정 | designer | 스플래시 vs blank — 다음 designer 라운드 |
| 404 페이지 frame 정의 + 코드 구현 | designer + develop | edge-cases EC-2.1 P0. router errorElement 미정의 |
| 글로벌 ErrorBoundary 도입 | develop | edge-cases EC-2.2 P0. lazy chunk 실패 처리 |
| EC-1.3 AuthCallback null guard | develop | `data.userRole` null 시 가드 |

### P1 (다음 라운드)

| 작업 | 트랙 | 비고 |
|---|---|---|
| TopBar page variant 사용처 결정 | planner + designer | NoticeDetail 등 detail 페이지에 적용 여부 |
| Drawer badge 5/3 동적 카운트 | develop | activeEvents / activeCoupons 연동 |
| `useSetTopBar` deps `[]` 제약 해소 | develop | deep compare or `[config]` |
| Drawer keyboard escape (a11y) | develop | NFR-2.5 |
| ResponseModal queue (중첩 메시지) | develop | edge-cases EC-3.6 |

### P2 (관찰)

| 작업 | 트랙 |
|---|---|
| BottomNav 도입 여부 (`$layout-bottombar-height: 56px` 토큰만 존재) | planner |
| 다중 탭 cross-tab sync | develop |
| iOS Safari `100dvh` fallback | develop |

---

## 3. develop 트랙 진입 시 가이드

> 본 designer 라운드 결과로 **현재 코드 변경 요구 사항 0건**. F1~F10 frame 은 현 코드와 일치 (reverse 검증 완료).
> 단, 후속 도메인 작업 (home, coupons, events, notices, historyMode) 진입 시:

1. 각 도메인 PRD (`docs/domain/{name}/prd/feature-spec.md`) 의 designer hook 절 참조
2. 본 frame (F1~F10) 을 **글로벌 baseline 시각 reference** 로 활용
3. 도메인별 frame 작성은 별도 designer 라운드 — 본 라운드 scope out
4. P0 항목 (F10 / 404 / ErrorBoundary / AuthCallback null) 은 **도메인 작업 전 별도 처리**

---

## 4. ops 분야 후속

| 항목 | 처리 |
|---|---|
| `figma-plugin/code.ts` 변경 commit | 사용자 승인 후 (현재 미커밋) |
| Figma plugin 등록 | 사용자가 Figma desktop 에서 1회 import |
| Figma file 권한 | 사용자 책임 (designer agent 직접 접근 X) |

---

## 5. 디자인 토큰 → 코드 토큰 매핑 표 (검증용)

| Figma frame inline | 코드 토큰 | SCSS 변수 |
|---|---|---|
| `#0f0a14` | `--color-bg-deepest` | `$color-bg-900` |
| `#140f1f` | `--color-bg-deep` | `$color-bg-800` |
| `#1f1a29` | `--color-bg-card` | `$color-bg-600` |
| `#332947` | `--color-bg-elevated` | `$color-bg-500` |
| `#a86af0` | `--color-brand` | `$color-brand-400` |
| `#6c5ce7` | `--color-brand-violet` | `$color-brand-600` |
| `#03c75a` | `--color-success` | (네이버 그린) |
| `#e84141` | `--color-danger` | |
| white α 92/60/38/06 | `--color-text-{primary,secondary,muted}` / `--color-border` | |
| black α 50 | (Drawer overlay rgba(0,0,0,0.5)) | |
| Inter font | `'Inter', -apple-system, ...` | font-family |
| 52 / 16 / 428 | `$layout-topbar-height` / `$layout-h-pad` / `$bp-mobile-lg` | layout |
| 6 / 8 / 10 | `$radius-md` / `$radius-lg` / `$radius-xl` | radius |

frame 검토 시 토큰 mismatch 발견하면 design-analysis.md 갱신 → 별도 designer 라운드.

---

## 6. 종료 체크리스트

- [x] design-analysis.md 작성
- [x] figma-plugin/code.ts 작성 (771 lines)
- [x] npm run build PASS (TypeScript strict)
- [x] design-report.md 작성
- [x] implementation-handoff.md 작성 (본 문서)
- [ ] 사용자: Figma desktop Ctrl+Alt+P 실행
- [ ] 사용자: F1~F10 시각 검증
- [ ] 사용자: P0 미정 항목 (F10 / 404 / ErrorBoundary) 결정
- [ ] (승인 시) ops 트랙: code.ts 변경 commit

# AppLayout — Design Analysis

> 작성일: 2026-05-11
> 모드: create (신규 frame 생성, 기존 수정 X)
> 입력: planner (`feature-spec.md`, `ia.md`, `requirements.md`, `edge-cases.md`) + code baseline (`structure.md`)
> 산출 목적: Figma plugin code 작성 입력 (F1~F10 frame 자동 생성)
> Figma 대상: file `VCVQzOpSIpwpZw11gxG7N1`, root node `212:2` (기존 frame 수정 X — sibling 으로 신규 추가)

---

## 0. 분석 결과 요약

| 항목 | 수 |
|---|---|
| 신규 frame 정의 | 10 (F1~F10) |
| 사용 토큰 (color) | 11 |
| 사용 토큰 (typography) | 5 |
| 사용 토큰 (spacing/layout) | 4 |
| 신규 컴포넌트 정의 | 0 (Figma component variants 미생성 — frame 수준만) |
| 재사용 자산 | 0 (현재 Figma 산출물 미확인 — MCP 미연결, code baseline 만 사용) |

🟨 **가정**: Figma MCP 도구 미가용 환경. Figma 의 기존 컴포넌트 라이브러리 / variables 는 검사 X. plugin 은 raw 색상/폰트로 frame 생성 (variables binding X). 사용자가 Figma 진입 후 토큰 매핑 / 컴포넌트화 별도 진행 가능.

---

## 1. 토큰 추출 (code baseline 기준)

### 1-1. Color (사용처 매핑)

| 토큰 | hex | 사용처 (frame) |
|---|---|---|
| `--color-bg-deepest` | `#0f0a14` | F1 wrapper 배경 / F2~F3 TopBar 배경 / F4~F10 wrapper 배경 |
| `--color-bg-deep` | `#140f1f` | F4~F5 Drawer 패널 배경 |
| `--color-bg-overlay` | `#18141f` | F4~F5 Drawer overlay 기준 (실제는 rgba(0,0,0,0.5) 사용) |
| `--color-bg-card` | `#1f1a29` | F6~F8 modal 카드 배경 / F9 skeleton 카드 |
| `--color-brand` | `#a86af0` | F2~F3 로고 색상 / F6 modal 액센트 |
| `--color-brand-violet` | `#6c5ce7` | F4~F5 active 액센트 바 / F7 success 아이콘 강조 |
| `--color-success` | `#03c75a` | F2 home 우측 "N 네이버 로그인" 버튼 / F4 guest 안내 로그인 버튼 / F7 success 아이콘 |
| `--color-danger` | `#e84141` | F8 error 아이콘 |
| `--color-text-primary` | rgba(255,255,255,0.92) | TopBar 타이틀 / 메뉴 라벨 |
| `--color-text-secondary` | rgba(255,255,255,0.60) | 그룹 라벨 |
| `--color-text-muted` | rgba(255,255,255,0.38) | email / 보조 텍스트 |
| `--color-border` | rgba(255,255,255,0.06) | 구분선 (drawer 내부) |

### 1-2. Typography

| 클래스 | 사용처 | size | weight |
|---|---|---|---|
| `.text-topbar` | F2~F3 TopBar 타이틀 / 로고 | 17px | 700 (bold) |
| `.text-body-bold` | F4~F5 메뉴 라벨 / nickname | 15px | 700 |
| `.text-body` | F6~F8 modal 메시지 / F4~F5 일반 텍스트 | 15px | 400 |
| `.text-caption` | F4~F5 그룹 라벨 / email | 12px | 400 |
| `.text-badge` | F4~F5 메뉴 badge (5/3) | 11px | 700 |

폰트 family: `Inter` (fallback: -apple-system / BlinkMacSystemFont / sans-serif)
plugin 에서는 `Inter` 만 loadFontAsync — fallback 은 Figma 가 처리

### 1-3. Spacing / Layout

| 토큰 | 값 | 사용처 |
|---|---|---|
| `$layout-topbar-height` | 52 | F2~F3 height |
| `$layout-h-pad` | 16 | TopBar / Drawer 좌우 padding |
| `$bp-mobile-lg` | 428 | 모든 frame width |
| `100dvh (모바일)` | 932 | F1, F4~F10 height (iPhone 14 Pro Max 기준 모바일 표준) |

### 1-4. Radius

| 토큰 | 값 | 사용처 |
|---|---|---|
| `$radius-md` | 6 | TopBar 우측 버튼 |
| `$radius-lg` | 8 | Drawer 메뉴 아이템 |
| `$radius-xl` | 10 | F6~F8 modal 카드 |
| `$radius-full` | 9999 | 아바타 |

---

## 2. 글로벌 컴포넌트 인스턴스 (frame 수준 정의)

> Figma component variants 는 본 라운드에서 생성 X (사용자가 frame 검토 후 컴포넌트화 결정). 본 라운드는 frame 만 그림.

| Frame | code 매핑 | states |
|---|---|---|
| F1 Mobile wrapper | MobileLayout (TopBar+pageContent 빈 상태) | default |
| F2 TopBar home | TopBar.jsx variant=home | logged-in / logged-out (2 states 좌우 배치) |
| F3 TopBar page | TopBar.jsx variant=page | default (사용처 0 — placeholder) |
| F4 Drawer guest | Drawer.jsx + 비로그인 profile | default |
| F5 Drawer user | Drawer.jsx + 로그인 profile (badge 5/3) | default |
| F6 RenewalNoticeModal | global/ui/renewalNoticeModal | comingSoon (스킬/백과사전 안내) |
| F7 ResponseModal success | global/ui/responseModal | success state |
| F8 ResponseModal error | global/ui/responseModal | error state |
| F9 Suspense loading | MobileLayout Suspense fallback "로딩중..." | default |
| F10 AuthProvider blank | AuthProvider 의 `initialized === false` blank 화면 | placeholder ❓ (디자인 미정) |

---

## 3. 재사용 가능 자산

> 현재 Figma 산출물 미확인 (MCP 미가용). code baseline 의 `web/src/global/ui/*` 를 reverse 한 frame 만 생성.

| 자산 | code 위치 | frame |
|---|---|---|
| Badge 3종 (LabelBadge, PinnedBadge, StatusBadge) | `global/ui/badge/*` | F4~F5 의 badge 표현 (단순 number badge — 본 PRD 는 LabelBadge/StatusBadge 미포함) |
| SectionBlock / SectionHeader | `global/ui/mobile/section/*` | 본 PRD scope out (글로벌 layer 만) |
| RenewalNoticeModal | `global/ui/renewalNoticeModal/*` | F6 |
| ResponseModal | `global/ui/responseModal/*` | F7, F8 |
| VisibleToggle | `global/ui/visibleToggle/*` | scope out (admin UI 잔재) |

---

## 4. 신규 정의 필요

| 항목 | 사유 | 본 라운드 처리 |
|---|---|---|
| F10 AuthProvider blank | 디자인 미정 (스플래시 vs blank — feature-spec § 7-2 ❓) | 빈 frame + 주석 only (placeholder) |
| F3 TopBar page variant | 사용처 0 (feature-spec § 7-1 ❓) | back/title/rightAction 그대로 reverse, 사용 매핑은 별도 라운드 |
| 404 페이지 | edge-cases EC-2.1 P0 | 본 라운드 scope out (별도 frame 라운드) |
| ErrorBoundary 화면 | edge-cases EC-2.2 P0 | 본 라운드 scope out |

---

## 5. HITL 4분야 사전 검증 (designer 영역)

| 분야 | 변경 여부 |
|---|---|
| 디자인 토큰 파괴적 변경 | ❌ 없음 (기존 토큰만 사용) |
| 컴포넌트 라이브러리 구조 변경 | ❌ 없음 (신규 frame 만) |
| 레이아웃 컨벤션 변경 | ❌ 없음 (모바일 우선 428, 유지) |
| 외부 자산 도입 | ❌ 없음 (Inter 폰트 — 시스템 또는 Figma 기본) |

→ 🔴 HITL 트리거 없음. 🟨 / ❓ 마커는 frame 안에 텍스트로 표시.

---

## 6. plugin code 생성 입력 정리

### 6-1. frame 좌표 / 배치

10 frame 을 가로로 배치 (offset X = idx × 480, gap 52):
- F1~F2~F3 첫 행 (Y = 0)
- F4~F5 두번째 행 (Y = 1000)
- F6~F8 세번째 행 (Y = 2000)
- F9~F10 네번째 행 (Y = 3000)

🟨 사용자가 Figma 에서 자유롭게 재배치 가능.

### 6-2. async pattern

```typescript
(async () => {
  await figma.loadAllPagesAsync();
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  // ... frame 생성
  figma.viewport.scrollAndZoomIntoView(frames);
  figma.notify('AppLayout 10 frame 생성 완료');
})();
```

### 6-3. dynamic-page 정합

- `manifest.json` `documentAccess: "dynamic-page"` — 모든 figma.* async 사용 강제
- `figma.getNodeByIdAsync('212:2')` 로 root frame 위치 (옵션 — 신규 frame 은 currentPage 에 append)
- `figma.setCurrentPageAsync(page)` — 미사용 (현재 page 에 추가)

---

## 7. 미정 / 가정 list (frame 안에 텍스트로 표시)

- ❓ F3 TopBar page variant — 사용처 0 (사용 매핑 별도 라운드)
- ❓ F10 AuthProvider blank — 스플래시 vs blank UX 미정 (placeholder)
- ❓ F4~F5 Drawer badge 5/3 — 하드코딩 (실제 활성 카운트 무관)
- 🟨 frame 배치 — 가로 격자 / 사용자 자유 재배치

---

## 8. 다음 단계

1. designer-plugin-code skill 호출 → `figma-plugin/code.ts` 작성
2. `npm run build` (TypeScript strict 통과 확인)
3. 사용자: Figma desktop → Ctrl+Alt+P → 10 frame 생성 확인
4. 사용자 검증 → BE/FE 도메인 작업 트랙 진입

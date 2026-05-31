# 반응형 — PC First 모드

> PC 기준 설계 → 모바일 폭 축소 시 breakpoint 로 안전 fallback.
> 모드 결정 절차 / 한계 HITL: [responsive.md](./responsive.md) 참조.

---

## 1. 핵심 원칙

**PC 기준 설계. 모바일 폭 축소 시 UI 깨지지 않도록 breakpoint 로 안전하게 fallback.**

기본 설계는 PC. 작은 폭으로 줄어들 때 점진적으로 단순화 (multi-column → single column, sidebar → drawer, table → card).

---

## 2. Breakpoint 표준 (모드 무관 단일 기준)

| Breakpoint | 폭 | 환경 | 동작 |
|-----------|-----|------|------|
| `xs` | ~480px 이하 | 모바일 | 단일 컬럼 / 메뉴 hamburger / table → card |
| `sm` | 481~767px | 큰 모바일 / 작은 tablet | 단일 컬럼 유지 / 일부 인터랙션 활성 |
| `md` | 768~1023px | tablet | 2컬럼 가능 / sidebar collapse |
| `lg` | 1024~1279px | 작은 PC | 기본 PC 레이아웃 / sidebar 노출 |
| `xl` | 1280px+ | PC | 풀 레이아웃 / multi-pane |

⭐ SCSS 변수로 일원화 (예시):

```scss
$bp-xs: 480px;
$bp-sm: 768px;
$bp-md: 1024px;
$bp-lg: 1280px;
$bp-xl: 1440px;
```

---

## 3. Figma 기본 frame

- 권장 frame 사이즈: **1280 / 1440** (디자인 기준)
- 모바일 fallback frame 도 같이 제공 (375 / 768 / 1024)
- 한 frame 에 modify 적용 X — 각 환경별 frame 분리

---

## 4. CSS 변환 규칙 — 깨짐 방지 핵심 패턴

### 4.1 fluid layout (clamp / min / max)

```css
.container {
  width: 100%;
  max-width: 1280px;                       /* PC 최대 */
  margin: 0 auto;
  padding-inline: clamp(16px, 4vw, 32px);  /* 폭에 따라 부드럽게 */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* ⭐ 폭 줄어들면 자동으로 컬럼 수 감소 — media query 불필요 */
  gap: clamp(12px, 2vw, 24px);
}
```

### 4.2 multi-column → single column 전환

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;  /* PC: sidebar + main */
  gap: 24px;
}

@media (max-width: $bp-md) {
  .layout {
    grid-template-columns: 1fr;       /* tablet 이하: 단일 컬럼 */
  }
  .layout__sidebar {
    display: none;                    /* sidebar 숨김 → drawer 로 대체 */
  }
}
```

### 4.3 sidebar → drawer 전환

```html
<aside class="sidebar">...</aside>
<button class="menu-trigger" aria-label="메뉴 열기">☰</button>
```

```css
.sidebar { display: block; }
.menu-trigger { display: none; }

@media (max-width: $bp-md) {
  .sidebar { display: none; }                /* PC 사이드바 숨김 */
  .menu-trigger { display: inline-flex; }    /* 햄버거 노출 */
  .sidebar.is-open {                         /* JS 로 토글 */
    display: block;
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    z-index: 100;
  }
}
```

### 4.4 data table → card list 전환

```css
.data-table { display: table; width: 100%; }

@media (max-width: $bp-xs) {
  .data-table,
  .data-table thead,
  .data-table tbody,
  .data-table tr,
  .data-table td { display: block; }
  .data-table thead { display: none; }
  .data-table tr {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
  }
  .data-table td::before {
    content: attr(data-label);                /* 모바일 모드 라벨 */
    display: block;
    font-size: 12px;
    color: var(--text-muted);
  }
}
```

### 4.5 폼 2열 → 1열 전환

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;   /* PC: 2열 */
  gap: 24px;
}

@media (max-width: $bp-sm) {
  .form-grid {
    grid-template-columns: 1fr;     /* 모바일: 1열 */
    gap: 16px;
  }
}
```

---

## 5. 깨짐 방지 체크리스트 (모든 컴포넌트)

다음 항목을 모든 화면에 적용. 미적용 시 모바일 폭에서 깨짐:

- [ ] **min-width: 0** — flex/grid 자식에 명시 (overflow 방지)
- [ ] **overflow-wrap: anywhere** — 긴 단어/URL 줄바꿈
- [ ] **word-break: keep-all** (한글) / **break-word** (영문)
- [ ] **max-width: 100%** — 이미지 / 미디어
- [ ] **fluid 단위** — `clamp() / min() / max() / vw / %` 활용
- [ ] **고정폭 X** — 320px 같은 절대값 대신 max-width / min(100%, 320px)
- [ ] **horizontal scroll 차단** — `overflow-x: hidden` body 또는 `min-width: 0` 자식
- [ ] **터치 타겟 44×44px** 이상 (모바일 폭에서도 작아지지 않음)
- [ ] **font-size clamp()** — `font-size: clamp(14px, 1.2vw, 16px)`

---

## 6. 글로벌 레이아웃 컴포넌트

| 컴포넌트 | 역할 |
|---------|------|
| `<PCLayout>` | wrapper + Header + Sidebar + Main |
| `<PCLayout.Header>` | 상단 고정 / 모바일에서 hamburger 토글 노출 |
| `<PCLayout.Sidebar>` | 좌측 고정 / md 이하에서 drawer 로 변환 |
| `<PCLayout.Main>` | 컨텐츠 영역 / max-width 1280px |

⭐ `<PCLayout>` 컴포넌트 자체가 모바일 fallback 까지 책임 (각 도메인이 처리 X).

---

## 7. 인터랙션 패턴

- **마우스 + 키보드 우선** — hover / right-click / shortcut 활용 OK
- **터치 호환 필수** — hover-only 정보 X. tap 으로도 동일 정보 접근 가능
- **모바일 환경 대체 인터랙션 명시** — 예: hover tooltip → tap toggle

---

## 8. 금지 사항

- ❌ 고정폭 (예: `width: 1024px`) — 항상 max-width + 100%
- ❌ media query 없이 multi-column 강제 (모바일 깨짐)
- ❌ hover-only 정보 (모바일 사용자 차단)
- ❌ horizontal scroll body
- ❌ breakpoint 일회성 정의 (위 § 2 표준 사용)
- ❌ 각 도메인이 자체 breakpoint 정의

---

## 9. screen-spec.md 기재 패턴

```markdown
**레이아웃** (pc-first 모드)
- wrapper: max-width 1280px, margin 0 auto
- 외곽 padding: clamp(16px, 4vw, 32px)
- PC: grid 240px(sidebar) + 1fr(main) / md 이하: 단일 컬럼 + drawer

**Breakpoint 동작**
| BP | 변경 사항 |
|----|---------|
| xl/lg | 기본 PC 레이아웃 |
| md | sidebar collapse / 컬럼 폭 축소 |
| sm | sidebar drawer 화 / 폼 2열 → 1열 |
| xs | data table → card list / 햄버거만 노출 |

**구조 (트리)**
<PCLayout>
├── <PCLayout.Header />
├── <PCLayout.Sidebar /> (xs/sm 에서 drawer)
└── <PCLayout.Main>
    └── <DataTable /> (xs 에서 card list)
```

---

## 10. code.ts (Figma Plugin) 기재 패턴

```typescript
// PC 기본 frame
const pcFrame = figma.createFrame();
pcFrame.name = '{화면명}_pc';
pcFrame.resize(1280, 800);
pcFrame.layoutMode = 'HORIZONTAL';
pcFrame.paddingLeft = 32;
pcFrame.paddingRight = 32;

// 모바일 fallback frame (분리)
const mobileFrame = figma.createFrame();
mobileFrame.name = '{화면명}_mobile';
mobileFrame.resize(375, 812);
mobileFrame.layoutMode = 'VERTICAL';
mobileFrame.paddingLeft = 16;
mobileFrame.paddingRight = 16;

// ⭐ 두 frame 모두 생성 — 디자이너가 모드별 검증 가능
```

---

## 11. 한계 — HITL 트리거

다음 케이스 발견 시 [responsive.md § 6](./responsive.md#6-모드별-한계--hitl-트리거-구조-자체가-다른-ui) HITL 요청:

- 모바일 환경에 BottomNav 가 강하게 필요한 소비자 앱 (PC 사이드바와 충돌)
- 모바일 swipe / pull-to-refresh 가 핵심 인터랙션인 화면 (PC 마우스로 대체 어려움)
- 데이터 밀도가 PC 와 모바일 4배 이상 격차 (단순 column 축소로 부족)
- multi-pane 동시 표시가 핵심 UX 인 화면 (모바일에서 분리 시 워크플로 깨짐)

# events Design Sync (Figma ↔ 실제 구현 비교)

> 입력:
> - 사용자 제공 figma node-id: `3-18` (HomeScreen 미니 이벤트 섹션), `16-775` (EventScreen 풀화면)
> - `docs/prd/domains/events.md` Part A.1~A.2 (실제 구현 컴포넌트 위치)
> - Figma MCP (node 조회 완료)
> - wireframe: `docs/prd/wireframes/events.md` 미존재 — 사용자 직접 figma node 제공으로 대체
> 생성: prd-design-sync
> 갱신: 2026-05-09
>
> scope: **public 모바일 한정** — admin 화면 (AdminEventListPage) 은 컴포넌트 부재 + figma 미진행 → n/a (admin figma 도착 후 별도 라운드)

---

## 1. 비교 대상 매핑

| 화면 | 라우트 | figma node | 실제 구현 컴포넌트 |
|---|---|---|---|
| EventScreen (풀화면 — 진행중 + 종료 세션) | `/events` | `16-775` | `web/src/domains/events/mobile/EventScreen.jsx` |
| HomeScreen 미니 이벤트 섹션 (가로 스크롤) | `/` 일부 | `3-18` | `web/src/domains/events/mobile/containers/public/EventListHorizontal.jsx` |
| AdminEventListPage | `/admin/content/event` | 미진행 | 컴포넌트 파일 부재 (T1 신규 작성 대상) |

---

## 2. 컴포넌트 단위 비교

### 2.1 EventScreen (풀화면) ↔ figma node `16-775`

#### figma 측 (node `16-775` — "User — 이벤트 페이지 (Component-Based)")

- 전체 배경: `#0f0a14` (`--color-bg-deepest` 일치)
- 레이아웃 구조 (top → bottom):
  - `C / PageHeader` (node `16:776`) — 52px 높이, 배경 `#18141f`, 하단 border `rgba(255,255,255,0.06)`, 좌: "←" 텍스트, 중앙: "이벤트" 제목 (`font-semibold`, 16px, `rgba(255,255,255,0.92)`)
  - `C / SectionHeader` (node `16:779`) — 44px, 보라 accent bar (`#a86af0`, 3×13px), 타이틀 "진행중 이벤트" (`font-semibold`, 13px)
  - `C / EventCard / default` × 3 (node `16:782`, `16:794`, `16:806`) — 진행중 카드
    - 카드 크기: 343×228px, 배경 `#1f1a29`, border `rgba(255,255,255,0.12)`, radius 10px
    - `C / Thumbnail`: 343×120px, 이미지 full-width
    - `C / StatusBadge / active` (node `16:964`): 좌상단 10px 오프셋, `#6c5ce7`, 41×20px, "진행중" 9px semibold
    - 제목: 15px semibold, `rgba(255,255,255,0.92)`, top=135px, 최대 311px, ellipsis
    - 날짜: "📅" 아이콘 + 날짜 텍스트 별도 `<p>`, 11px regular, `rgba(255,255,255,0.38)`, top=163px
    - 구분선: `rgba(255,255,255,0.06)` 1px horizontal, top=187px
    - `C / ExternalIndicator` (node `16:791`): "상세 보기 →", 10px, `#7c6f8f`, top=195px
    - 일부 카드에 우측 "›" 문자 추가 (node `16:805`, `16:817`, `16:1028`)
  - 섹션 구분 rect: `#0a080d` 8px 높이 (node `16:842`)
  - `C / SectionHeader` (node `16:843`) — "종료된 이벤트"
  - `C / EventCard / expired` (node `16:846`) — 종료 카드
    - 카드 크기: 343×228px, 배경 `#18141f` (활성 카드 `#1f1a29` 와 다름), border `rgba(255,255,255,0.06)` (활성 카드 0.12 와 다름)
    - `C / StatusBadge / expired` (node `16:974`): `#2a2e3a` 배경, "종료" 9px
    - 제목: 15px semibold, `rgba(255,255,255,0.6)` (활성의 0.92 와 다름)
    - 하단: "종료된 이벤트입니다" 텍스트 (ExternalIndicator 없음)
  - figma 에는 "종료된 이벤트" 섹션에 카드 1건만 expired variant (node `16:846`) — 나머지 2건 (node `16:995`, `16:1017`)은 `C / EventCard / default` 로 표시됨 (figma 내부 inconsistency — 아래 §3 참조)
- style tokens (추출):
  - 카드 배경(active): `#1f1a29` = `--color-bg-card` 일치
  - 카드 배경(expired): `#18141f` = `--color-bg-overlay` (`$color-bg-700`) — 코드와 다름 (§갭 분석 참조)
  - border(active): `rgba(255,255,255,0.12)` = `--color-border-strong`
  - border(expired): `rgba(255,255,255,0.06)` = `--color-border`
  - badge(active): `#6c5ce7` = `--color-brand-violet`
  - badge(expired): `#2a2e3a` — 코드의 `--color-bg-deep` (`#140f1f`) 과 다름 (§갭 분석 참조)
  - ExternalIndicator 색상: `#7c6f8f` = `$color-gray-500` (placeholder)
  - SectionHeader accent: `#a86af0` = `--color-brand`

#### 실제 구현 측 (`16-775` 대응)

- 컴포넌트 트리:
  - `EventScreen.jsx` (`web/src/domains/events/mobile/EventScreen.jsx:6`)
    - `SectionBlock` — title="진행중 이벤트" (`global/ui/mobile/section/SectionBlock.jsx`)
      - `EventListVertical` (`mobile/containers/public/EventListVertical.jsx:5`)
        - `EventCard` × N — `showDetail={true}`, `isExpired={false}` (`mobile/components/eventCard/EventCard.jsx`)
    - `SectionBlock` — title="종료된 이벤트"
      - `EventListVertical` (`isExpired={true}`)
        - `EventCard` × N — `showDetail={true}`, `isExpired={true}`
- import 출처:
  - `SectionBlock` — global/ui (표준 컴포넌트 재사용)
  - `EventListVertical`, `EventCard` — 도메인 자체
- 레이아웃 토큰 (코드 기준):
  - 카드 배경: `var(--color-bg-card)` → `#1f1a29` (active, expired 모두 동일)
  - 카드 border: `1px solid var(--color-border)` → `rgba(255,255,255,0.06)` (active, expired 구분 없음)
  - 썸네일 높이: `--thumb-height: 120px` (EventList.module.scss:15)
  - info 패딩: `var(--event-card-info-padding, #{$space-2})` → 기본 8px
  - 카드 간격: `$space-3` = 12px (flex-col gap)
  - title 폰트: `--title-font-size: #{$font-size-15}` = 15px (EventListVertical)
  - date row: `@include text-caption` = 11px, `--color-text-primary` (코드), border-bottom 포함
  - more ("상세 보기 →"): `@include text-micro` = 10px, `--color-brand-violet`
  - expiredText ("종료된 이벤트입니다"): `@include text-micro` = 10px, `--color-text-muted`
  - expired grayscale: `filter: grayscale(100%)` on `.expired .thumb img`
- 페이지 헤더: **없음** — 글로벌 MobileLayout TopBar 사용 (feedback_no_domain_header 정책)
- SectionHeader "전체 보기 →" 링크: `SectionBlock` 의 `to` prop 미전달 → 링크 미노출 (`EventScreen.jsx` 참조)

#### 갭 분석 (16-775 ↔ 코드)

| # | 항목 | figma (16-775) | 실제 구현 | 갭 종류 | 권장 액션 |
|---|---|---|---|---|---|
| G1 | **PageHeader (도메인 헤더)** | node `16:776` — "이벤트" 제목 + "←" 뒤로 가기, 52px, 별도 헤더 frame | **없음** — 글로벌 MobileLayout TopBar 사용 (feedback_no_domain_header 정책) | ★ 통일성 위반 | figma 에서 `C / PageHeader` frame 제거, 글로벌 TopBar 기준으로 수정 요청 (P0) |
| G2 | **섹션 타이틀 폰트 크기** | node `16:781`, `16:845` — 13px semibold | `@include text-section-title` = 15px semibold (SectionBlock → SectionHeader) | 디자인 토큰 차이 | figma 를 15px 로 수정 (코드 = source of truth) |
| G3 | **섹션 구분 rect (8px 배경)** | node `16:842` — `#0a080d`, 8px 높이 구분선 | 코드에 없음 (섹션 간 `$space-3` gap 만) | 레이아웃 차이 | figma 에 8px rect 구분 방식 → 코드의 gap 방식으로 수정 요청, 또는 코드에 구분선 추가 결정 필요 (Owner spot-check) |
| G4 | **카드 border (active)** | `rgba(255,255,255,0.12)` (`--color-border-strong`) | `1px solid var(--color-border)` = `rgba(255,255,255,0.06)` | 디자인 토큰 차이 | figma 를 `--color-border` (`rgba(255,255,255,0.06)`) 로 수정 요청 (코드 = source of truth) |
| G5 | **카드 배경 (expired)** | node `16:846` — `#18141f` (`--color-bg-overlay`) | `var(--color-bg-card)` = `#1f1a29` (active 와 동일) | 디자인 토큰 차이 | 코드는 expired 카드를 active 와 같은 배경 사용. figma 가 어두운 배경 의도 시 → 코드에 `.expired` 배경 추가 결정 필요 (Owner 결정 — spot-check) |
| G6 | **카드 border (expired)** | `rgba(255,255,255,0.06)` (`--color-border`) | `1px solid var(--color-border)` = `rgba(255,255,255,0.06)` | 일치 | OK |
| G7 | **expired 제목 색상** | `rgba(255,255,255,0.6)` (`--color-text-secondary`) | `.expired .title` → `var(--color-text-muted)` = `rgba(255,255,255,0.38)` | 디자인 토큰 차이 | figma 0.6 vs 코드 0.38 — 코드 `--color-text-muted` 가 표준. figma 를 `rgba(255,255,255,0.38)` 로 수정 요청 |
| G8 | **expired badge 배경** | `#2a2e3a` (figma 전용 색상, 정의 없음) | `.badgeExpired` → `var(--color-bg-deep)` = `#140f1f` | 디자인 토큰 차이 | figma 사용 `#2a2e3a` 는 글로벌 토큰 미정의. 코드 `--color-bg-deep` 기준으로 figma 수정 요청 |
| G9 | **info 영역 padding** | top=135px (thumb 120px + 15px gap), left=15px | `var(--event-card-info-padding, #{$space-2})` = 8px | 디자인 토큰 차이 | figma 의 15px left padding (카드 내부) vs 코드 8px — figma 수정 요청 (코드 기준 8px 또는 `$space-2`) |
| G10 | **날짜 텍스트 구조** | 📅 아이콘 별도 `<p>` + 날짜 `<p>` (두 개 노드 분리) | `EventCard.jsx:36` — `📅 {event.startAt} ~ {event.expireAt}` 단일 `<p>` | 구현 방식 차이 | figma 2-노드 분리 구조 → 코드 단일 텍스트 유지 (기능 동일). figma 수정 권장 불필요 (구현 방식 차이) — 코드 = source of truth |
| G11 | **날짜 색상** | `rgba(255,255,255,0.38)` (`--color-text-muted`) | `.date` → `var(--color-text-primary)` = `rgba(255,255,255,0.92)` | 디자인 토큰 차이 | figma 0.38 vs 코드 0.92 — figma 가 더 정확 (날짜는 부가정보이므로 muted 적절). **코드 수정 권장**: `.date` 색상을 `var(--color-text-muted)` 로 변경 |
| G12 | **ExternalIndicator 색상** | `#7c6f8f` = `$color-gray-500` (placeholder 토큰) | `.more` → `var(--color-brand-violet)` = `#6c5ce7` | 디자인 토큰 차이 | figma `#7c6f8f` vs 코드 `--color-brand-violet` — 코드 기준 유지. figma 를 `var(--color-brand-violet)` 으로 수정 요청. 단 "상세 보기 →" 가 deeplink CTA 이므로 brand violet 강조가 의미상 더 정확 |
| G13 | **"전체 보기 →" 링크** | node `3:21` (HomeScreen 미니에 있음) — figma 풀화면 16-775 에는 없음 | `SectionBlock` 의 `to` prop 미전달 → 링크 미노출 | 일치 | OK (풀화면에서 링크 불필요) |
| G14 | **우측 "›" 문자 (chevron)** | node `16:805`, `16:817`, `16:1028` — 일부 카드에 존재 | 없음 (코드에 chevron 없음) | 레이아웃 차이 | figma 의 chevron 은 불일치한 표현. 코드 = source of truth. figma 에서 chevron 제거 요청 |
| G15 | **empty state** | 없음 (모든 카드에 실제 이미지 표시) | `EventCard.jsx:24~26` — `thumbEmpty` div (이미지 없을 때 "이미지 준비 중") | state 미반영 | figma 에 empty/no-image 상태 frame 추가 요청 |
| G16 | **loading / error 상태** | 없음 | `useEventList.js` 가 loading/error 처리 (추정 — hook 확인 필요) | state 미반영 | figma 에 loading skeleton + error state frame 추가 요청 |
| G17 | **expired 섹션 카드 variant inconsistency** | "종료된 이벤트" 섹션 카드 3건 중 1건만 expired variant (node `16:846`) — 나머지 2건 (node `16:995`, `16:1017`) 은 default variant | 코드는 `isExpired={true}` 전달 → 모두 expired 처리 | figma 내부 inconsistency | figma 에서 종료 섹션 나머지 2 카드를 expired variant 로 수정 요청 |
| G18 | **grayscale 처리 (expired 이미지)** | figma 에서 expired 썸네일이 grayscale 처리됨 (시각적으로 확인) | `EventCard.module.scss:44` — `.expired .thumb img { filter: grayscale(100%) }` | 일치 | OK |

---

### 2.2 HomeScreen 미니 이벤트 섹션 ↔ figma node `3-18`

#### figma 측 (node `3-18` — "Event Section")

- 레이아웃 구조:
  - 보라 accent bar: `#a86af0`, 3×13px, top=18px, left=16px
  - 섹션 타이틀 "진행 중인 이벤트": 13px semibold, `rgba(255,255,255,0.92)`, top=16px
  - "전체 보기 →" 텍스트: 11px, `#7c6f8f`, top=16px, left=301px (우측 정렬)
  - 미니 카드 × 2 (node `3:22` EvtCard_0, `3:29` EvtCard_1):
    - 카드 크기: 167.5×124px
    - 썸네일: 167.5×72px
    - `C / StatusBadge / active` (node `17:1322`): `#6c5ce7`, 41×20px, left=6px, top=6px, "진행중" 9px semibold
    - 제목: 12px medium, `rgba(255,255,255,0.92)`, top=77px, left=7px
    - 날짜 (단축): "~04.05 23:59" 10px regular, `rgba(255,255,255,0.38)`, top=95px
    - 카드 배경: `#1f1a29`, border `rgba(255,255,255,0.06)`, radius 10px

#### 실제 구현 측 (`3-18` 대응)

- `EventListHorizontal.jsx:5` — `div.eventListScroll` (가로 스크롤)
  - `EventCard` × N (`showDetail` prop 없음 → 기본 `false`)
  - CSS: `EventList.module.scss:1` — `@include scroll-row($space-3, $layout-h-pad)`, 각 카드 width=160px, `--thumb-height: 72px`
- `EventCard` 가 `showDetail={false}` 일 때: 날짜 행 미노출 (`EventCard.jsx:34` — `showDetail &&` 조건)
- 실제 미니 카드 width: 160px (css) vs figma 167.5px

#### 갭 분석 (3-18 ↔ 코드)

| # | 항목 | figma (3-18) | 실제 구현 | 갭 종류 | 권장 액션 |
|---|---|---|---|---|---|
| H1 | **섹션 타이틀 폰트 크기** | 13px semibold | `@include text-section-title` = 15px semibold (SectionBlock → SectionHeader) | 디자인 토큰 차이 | figma 를 15px 로 수정 (G2 와 동일) |
| H2 | **미니 카드 너비** | 167.5px | 160px (EventList.module.scss:6) | 레이아웃 차이 | 코드 기준 160px. figma 를 160px 로 수정 요청 |
| H3 | **미니 카드 제목 폰트 크기** | 12px medium | `EventCard.module.scss:.title` — `var(--title-font-size, #{$font-size-13})` = 기본 13px (미니 리스트는 CSS override 없음) | 디자인 토큰 차이 | 미니 카드에 `--title-font-size: 12px` CSS override 고려. 또는 figma 를 13px 로 수정 (코드 기준). spot-check 필요 |
| H4 | **날짜 미노출 (미니 카드)** | figma 에 "~04.05 23:59" 날짜 표시 | `showDetail={false}` → 날짜 미노출 | 레이아웃 차이 | figma 에 날짜 표시 vs 코드에 미노출 — 코드 의도(`showDetail` prop) 가 정확. figma 에서 날짜 row 제거 요청 |
| H5 | **"전체 보기 →" 링크** | node `3:21` — figma 에 존재, 색상 `#7c6f8f` | `SectionBlock` 의 `to` prop 을 HomeScreen 에서 어떻게 전달하는지 확인 필요 | spot-check 필요 | HomeScreen 에서 `to="/events"` 전달 여부 확인. 전달 시 색상은 코드 `.more` → `--color-text-muted` 와 일치. 전달 안 하면 링크 미노출 — 구현 의도 재확인 |
| H6 | **badge offset** | left=6px, top=6px | `.badge` → `top: $space-2` (8px), `left: $space-2` (8px) | 디자인 토큰 차이 | figma 6px vs 코드 8px — 코드 기준 `$space-2` 유지. figma 를 8px 로 수정 요청 |
| H7 | **카드 border (미니)** | `rgba(255,255,255,0.06)` | `var(--color-border)` = `rgba(255,255,255,0.06)` | 일치 | OK |

---

## 3. 재사용 / 통일성 위반 발견

### ★ V1: 도메인 PageHeader (G1) — P0

figma node `16-775` 상단에 `C / PageHeader` (node `16:776`) 가 존재하여 "이벤트" 제목 + "←" 뒤로 가기를 도메인 자체 헤더로 구현.

- **본 프로젝트 정책** (`feedback_no_domain_header`): 도메인 Screen 에 별도 헤더 안 만들고 글로벌 MobileLayout TopBar 로 통일.
- **실제 구현**: `EventScreen.jsx` 에 PageHeader 없음. TopBar 가 처리.
- **권장 액션**: figma 에서 `C / PageHeader` frame (node `16:776`) 제거, 글로벌 TopBar 표현으로 대체 — **P0 figma 갱신 요청**

### ★ V2: 섹션 타이틀 크기 불일치 (G2, H1) — P1

figma 두 frame 모두 섹션 타이틀 13px 사용. 코드의 `text-section-title` mixin 은 15px.

- **권장 액션**: figma 를 15px 로 일괄 수정 (코드 표준 mixin 기준) — **P1 figma 갱신 요청**

### 통일성 OK 항목

- badge 색상 (`--color-brand-violet` = `#6c5ce7`) — figma / 코드 일치
- SectionHeader accent bar (`--color-brand` = `#a86af0`) — 일치
- 썸네일 높이 (풀화면 120px, 미니 72px) — 일치
- grayscale expired 처리 — 일치
- `EventCard` 재사용 (Horizontal + Vertical 모두 동일 컴포넌트) — 표준 재사용 패턴 OK

---

## 4. figma 갱신 요청 항목 (Owner 검토 필요)

| # | 우선순위 | 대상 node | 갱신 내용 | 표준 컴포넌트 reference |
|---|---|---|---|---|
| F1 | **P0** | `16:776` (`C / PageHeader`) | 도메인 PageHeader frame 전체 제거 — 글로벌 TopBar 로 대체 | `MobileLayout TopBar` (feedback_no_domain_header 정책) |
| F2 | **P0** | `16:846` (`C / EventCard / expired`) 외 2건 (`16:995`, `16:1017`) | 종료 섹션 나머지 2 카드를 expired variant 로 수정 | `EventCard.jsx` — `isExpired={true}` variant |
| F3 | **P1** | `16:781`, `16:845` (SectionHeader 타이틀), `3:20` | 섹션 타이틀 13px → 15px (`text-section-title`) | `global/ui/mobile/section/SectionHeader.jsx` |
| F4 | **P1** | `16:782`~`16:806` (active 카드 border) | border `rgba(255,255,255,0.12)` → `rgba(255,255,255,0.06)` (`--color-border`) | `EventCard.module.scss:8` |
| F5 | **P1** | `16:852` (expired 제목) | expired 제목 색상 `rgba(255,255,255,0.6)` → `rgba(255,255,255,0.38)` (`--color-text-muted`) | `EventCard.module.scss:79` |
| F6 | **P1** | `16:974` (expired badge) | badge 배경 `#2a2e3a` → `#140f1f` (`--color-bg-deep`) | `EventCard.module.scss:63` — `.badgeExpired` |
| F7 | **P1** | `16:791`, `16:803`, `16:815` (ExternalIndicator) | 색상 `#7c6f8f` → `#6c5ce7` (`--color-brand-violet`) | `EventCard.module.scss:92` — `.more` |
| F8 | **P1** | `3:22`, `3:29` (미니 카드) | 카드 너비 167.5px → 160px | `EventList.module.scss:6` |
| F9 | **P1** | `3:22`, `3:29` (미니 카드 날짜 row) | 날짜 row 제거 (`showDetail=false` 시 미노출) | `EventCard.jsx:34` |
| F10 | **P1** | `17:1322`, `17:1325` 외 (badge offset) | badge left/top 6px → 8px (`$space-2`) | `EventCard.module.scss:53` |
| F11 | **P2** | `16:805`, `16:817`, `16:1028` (chevron "›") | 우측 chevron "›" 문자 제거 (코드에 없음) | `EventCard.jsx` — chevron 없음 |
| F12 | **P2** | 전체 frame | empty state (이미지 없는 상태) frame 추가 | `EventCard.jsx:24~26` — `.thumbEmpty` |
| F13 | **P2** | 전체 frame | loading skeleton + error state frame 추가 | `useEventList.js` |

---

## 5. 코드 수정 제안

본 프로젝트 원칙상 코드 수정 제안은 figma 가 명백히 더 정확한 경우만.

| # | 파일:line | 변경 내용 | 사유 | figma node |
|---|---|---|---|---|
| C1 | `EventCard.module.scss:83~86` (`.date`) | `.date` 색상을 `var(--color-text-primary)` → `var(--color-text-muted)` 로 변경 | 날짜는 부가정보이므로 muted 색상이 의미상 적절 (figma node `16:788`~`16:789` = `rgba(255,255,255,0.38)` 가 더 정확) | `16:788`, `16:789` |

> 참고: G5 (expired 카드 배경) — figma 가 `#18141f` 로 어둡게 처리. 코드는 active 와 동일 배경 사용. 의도가 다를 수 있으므로 Owner spot-check 후 결정 권장 (즉시 코드 수정 제안 보류).

---

## 6. spot-check / 미해결

| # | 항목 | 사유 | 확인 필요 |
|---|---|---|---|
| S1 | **dead navigate fallback (T5)** | `EventCard.jsx:13` — `event.externalLink` 없으면 `navigate('/events/${event.id}')` 호출. 내부 라우트 `/events/:id` 미존재 (Owner 결정: T5 dead navigate 제거) | B.2 T5 수행 전까지 잔존. figma 와 무관하지만 "상세 보기 →" CTA 클릭 시 dead navigate 발생 가능 — T5 우선 진행 요청 |
| S2 | **HomeScreen `to` prop 전달 여부** | H5 — `EventListHorizontal` 이 속한 HomeScreen 에서 `SectionBlock` 의 `to` prop 전달 여부 미확인 | HomeScreen.jsx 확인 필요 (본 에이전트 도메인 외) |
| S3 | **섹션 구분 8px rect (G3)** | figma 에 `#0a080d` 8px 구분 rect 존재 vs 코드에 없음 — 코드의 gap 방식이 표준인지, 구분선 추가 의도인지 | Owner 확인 후 결정 |
| S4 | **expired 카드 배경 차이 (G5)** | figma `#18141f` vs 코드 `#1f1a29` — expired 카드에 다른 배경 의도 여부 | Owner 확인 후 결정 |
| S5 | **미니 카드 제목 크기 (H3)** | figma 12px vs 코드 13px (CSS override 없음) — 미니 카드에 별도 title 크기 override 필요 여부 | EventListHorizontal 에 `--title-font-size: 12px` 추가 여부 Owner 결정 |
| S6 | **useEventList loading/error 상태** | hook 내부 미확인 (FE ↔ figma 비교 범위) — loading skeleton / error 컴포넌트 존재 여부 | `mobile/hooks/useEventList.js` 확인 후 figma 갱신 요청 F13 반영 |

---

## 7. admin 화면

- **n/a** — AdminEventListPage 컴포넌트 파일 부재 + figma 미진행
- admin figma 도착 후 별도 design-sync 라운드 진행
- 관련 PRD 항목: `docs/prd/domains/events.md` B.2 T1, B.6

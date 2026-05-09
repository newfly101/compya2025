# coupons Design Sync (Figma vs 실제 구현 비교)

> 입력:
> - `docs/prd/domains/coupons.md` Part A.1 분류: **live** (public), **partial-mock** (admin)
> - Part A.2 진입 컴포넌트: `web/src/domains/coupons/mobile/CouponScreen.jsx`, `CouponListHorizontal.jsx`
> - Figma MCP: node `16:624` (쿠폰 전체 페이지), node `10:2` (HomeScreen Coupon Section)
> - wireframe: 부재 (본 라운드에서 figma node 매핑 직접 제공으로 대체)
> 생성: prd-design-sync
> 갱신: 2026-05-09
> 범위: public 모바일 한정 — admin n/a (컴포넌트 부재 + figma 미정, 별도 라운드)

---

## 1. 비교 대상 매핑

| 화면 | 라우트 | figma node | 실제 구현 컴포넌트 |
|---|---|---|---|
| CouponScreen (쿠폰 전체 페이지) | `/coupons` | `16:624` "User — 쿠폰 페이지 (Component-Based)" | `web/src/domains/coupons/mobile/CouponScreen.jsx:1` |
| HomeScreen Coupon Section (미니 가로 스크롤) | `/` 내 섹션 | `10:2` "Coupon Section" | `web/src/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx:1` |
| AdminCouponListPage | `/admin/content/coupon` | 미정 | 컴포넌트 파일 부재 — n/a (별도 라운드) |

---

## 2. 컴포넌트 단위 비교

### 2.1 CouponScreen (/coupons) vs figma node 16:624

#### figma 측 (node 16:624 MCP 결과)

- 최상단 레이어명: "User — 쿠폰 페이지 (Component-Based)"
- 전체 배경: `#0f0a14` (= `$color-bg-900` = `--color-bg-deepest`)
- 레이아웃 구조 (top → bottom):
  1. **C / PageHeader** (node 16:625, h=52px) — 뒤로가기 `←` + 타이틀 "쿠폰" (중앙)
     - 배경: `#18141f` (`$color-bg-700`)
     - 하단 border: `rgba(255,255,255,0.06)` (`--color-border`)
     - 타이틀 font: 16px semi-bold `rgba(255,255,255,0.92)`, 좌측 `←` = 10px muted
  2. **C / SectionHeader** (node 16:628, top=60px, h=44px) — "최신 쿠폰"
     - 악센트 bar: `#a86af0` 3×13px rounded (= `--color-brand`)
     - 텍스트: 13px semi-bold `rgba(255,255,255,0.92)`
  3. **CouponCard (active) x3** — top=104px, 338px, 590px
     - variant: "action-focused" (첫 번째), "default" (나머지 2개)
     - 카드 배경: `#1f1a29` (`--color-bg-card`)
     - 카드 border: `rgba(255,255,255,0.12)` (`--color-border-strong`)
     - 카드 크기: w=343px, h=226~262px (아이템 수 따라 가변)
     - 카드 padding: 좌우 `left=11px`, 내부 구조는 절대 좌표
     - 카드 radius: `10px` (`$radius-xl`)
     - **TopRow** (h=22px, left=11px):
       - Badge (coupon code): `#332947` bg, 9px semi-bold `#d9d3e0`, radius=4px, h=22px, 너비 가변
       - **BtnGo "바로가기"**: `#6d4ad3` bg, 9px medium white, w=60px, h=24px, radius=5px, left=259px (우측 고정)
     - 구분선: `rgba(255,255,255,0.06)` 1px, top=43px
     - title: 16px bold `rgba(255,255,255,0.92)`, top=51px
     - detail (아이템 목록): 12px regular `rgba(255,255,255,0.38)`, 줄당 top 간격 18px
     - 구분선 2: detail 하단
     - 만료일: ⏱ 10px muted + "유효기간 YYYY-MM-DD HH:mm" 10px `rgba(255,255,255,0.6)`
     - 안내 문구: "바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다." 10px muted
     - **C / PrimaryActionButton "쿠폰 적용하기"**: `#6d4ad3` bg, h=40px, w=319px, radius=8px (`$radius-lg`), 13px semi-bold white
  4. **구분 영역** (node 16:681, `#0f0a14` 배경, h=4px)
  5. **C / SectionHeader** (node 16:682, top=876px) — "종료된 쿠폰"
  6. **CouponCard (expired) x2** — top=920px, 1226px
     - variant: "default--expired"
     - 카드 배경: `#18141f` (`--color-bg-overlay`, 더 어둠)
     - 카드 border: `rgba(255,255,255,0.06)` (= `--color-border`, active보다 연함)
     - title 색상: `rgba(255,255,255,0.6)` (= `--color-text-secondary`, active는 0.92)
     - **BtnGo (expired)**: `#272033` bg + `rgba(255,255,255,0.06)` border, 텍스트 `rgba(255,255,255,0.38)` — 비활성
     - 만료일 색상: `rgba(255,255,255,0.38)` (active는 0.6)
     - **C / PrimaryActionButton / disabled "종료된 쿠폰"**: `#272033` bg + `rgba(255,255,255,0.06)` border, 텍스트 `rgba(255,255,255,0.38)` 13px

#### 실제 구현 측

- 컴포넌트 트리:
  - `CouponScreen.jsx:1` (라우트 진입)
    - `SectionBlock` (global: `web/src/global/ui/mobile/section/SectionBlock.jsx:1`) — "최신 쿠폰"
      - `CouponListVertical` (`containers/public/CouponListVertical.jsx:1`) — `isExpired=false`
        - `CouponCard` (`components/couponCard/CouponCard.jsx:1`) x N
    - `SectionBlock` (global) — "종료된 쿠폰"
      - `CouponListVertical` — `isExpired=true`
        - `CouponCard` x N
- `useCouponList` hook (`mobile/hooks/useCouponList.js:1`): `activeCoupon` / `expiredCoupon` 분리
- import 출처:
  - `SectionBlock`: 글로벌 컴포넌트 (`@/global/ui/mobile/section/`) — 재사용
  - `CouponListVertical`, `CouponCard`: 도메인 자체
  - `useCouponList`: 도메인 자체 hook
- `CouponCard` 구조 (file: `CouponCard.jsx`):
  - TopRow: `.couponCode` (badge) + `.couponGoBtn` (바로가기 버튼)
  - `.couponTitle` (title)
  - `.couponBody` (showDetail=true 시 detail 아이템 목록, border-top/bottom)
  - `.couponExpire` (⏱ + 유효기간)
  - `.couponExplain` (showDetail=true 시 안내 문구)
  - isExpired=true 시: `.expired` 클래스 (배경 `--color-bg-deep`, border transparent, opacity 0.55) + `.expiredBtn` (바로가기 버튼 비활성)
- **액션 버튼**: "바로가기" 버튼 (`couponGoBtn`) — figma의 "쿠폰 적용하기" `PrimaryActionButton`에 해당하는 버튼이 **구현에 없음**

#### 갭 분석 (2.1)

| # | 항목 | figma (16:624) | 실제 구현 | 갭 종류 | source of truth | 권장 액션 |
|---|---|---|---|---|---|---|
| G1 | 도메인 전용 PageHeader | "C / PageHeader" (node 16:625) — 뒤로가기 + "쿠폰" 타이틀, 자체 구현 | MobileLayout TopBar 글로벌 사용 (도메인 자체 헤더 없음) | 통일성 위반 (★) | 코드 | figma 에서 PageHeader frame 제거 — 글로벌 TopBar 렌더링으로 표현할 것 |
| G2 | CouponCard 하단 "쿠폰 적용하기" PrimaryActionButton | `#6d4ad3` bg h=40px 버튼, 텍스트 "쿠폰 적용하기" (node 16:646, 16:662, 16:679) | 없음 — "바로가기" 버튼(couponGoBtn)만 상단 TopRow에 존재 | 레이아웃 / 기능 차이 | 코드 | figma 에서 "쿠폰 적용하기" PrimaryActionButton 제거 — 상단 TopRow "바로가기" 버튼이 코드 동작 기준. 또는 Owner 확인 후 별도 CTA 추가 결정 |
| G3 | "바로가기" 버튼 크기 (active) | w=60px, h=24px, radius=5px, `#6d4ad3` bg (node 16:637, 16:652, 16:668) | h=24px, radius=`$radius-sm`(4px), `var(--color-brand-dark)`(=#6d4ad3) bg — 색상 일치, radius 1px 차이 | 디자인 토큰 차이 (미세) | 코드 | figma 에서 radius를 4px(`$radius-sm`)로 수정 |
| G4 | "바로가기" 버튼 (expired) 배경 | `#272033` bg + `rgba(255,255,255,0.06)` border (node 16:689, 16:708) | `var(--color-coupon-expired-bg)` — 토큰 정의 없음 (semantic/_color.scss 미정의) | 디자인 토큰 미정의 | 코드 (토큰 추가 필요) | `--color-coupon-expired-bg: #272033` 을 semantic/_color.scss 에 추가하고 figma 확인 (현재 figma `#272033` = `$color-bg-800` 근방이나 팔레트 외 값) |
| G5 | expired 카드 배경 | `#18141f` (`--color-bg-overlay`) (node 16:685, 16:704) | `var(--color-bg-deep)` = `#140f1f` | 디자인 토큰 차이 | 코드 토큰 기준 확인 필요 | `--color-bg-deep`(`#140f1f`) vs figma `#18141f`(`--color-bg-overlay`) — 1단계 차이. spot-check 필요 (§6 S1) |
| G6 | expired 카드 border | `rgba(255,255,255,0.06)` 1px solid (node 16:685) | `border-color: transparent` (`.expired` 클래스) | 디자인 토큰 차이 | figma (border 표시가 맞음) | 코드 `.expired` border-color를 `var(--color-border)` 로 변경 (figma 기준이 더 정확) |
| G7 | expired 카드 opacity | 없음 (figma는 투명도 미사용 — 색상으로 구분) | `.expired { opacity: 0.55 }` — 전체 카드 dim | 구현 차이 | figma | 코드의 opacity 0.55 제거 검토 — figma처럼 색상 토큰으로 구분. 단 opacity 접근이 단순하므로 Owner 확인 권장 (§6 S2) |
| G8 | expired 카드 title 색상 | `rgba(255,255,255,0.6)` (`--color-text-secondary`) (node 16:692, 16:711) | opacity 0.55 전체 적용으로 간접 dim — 별도 색상 지정 없음 | 구현 방식 차이 | figma | G7 해소 시 동시 해소. expired title에 `color: var(--color-text-secondary)` 명시 권장 |
| G9 | expired PrimaryActionButton "종료된 쿠폰" | `#272033` bg + border + "종료된 쿠폰" 텍스트 (node 16:702, 16:717) | 없음 — "바로가기" 버튼에 `expiredBtn` 스타일 + `cursor: not-allowed` 적용 | 레이아웃 / UX 차이 | 코드 | G2와 동일 — PrimaryActionButton variant 제거 권장. figma 에서 disabled 버튼 frame 제거하고 TopRow expiredBtn으로 통일 |
| G10 | expired 만료일 색상 | `rgba(255,255,255,0.38)` (muted, node 16:715) | opacity 0.55 전체 적용 간접 dim | G7 연동 | 코드 | G7 해소 시 동시 해소 |
| G11 | SectionHeader 사이 구분 영역 | `#0f0a14` bg h=4px separator (node 16:681) | `SectionBlock` 컴포넌트 gap 으로 자연 분리 — 명시적 separator 없음 | 레이아웃 차이 | 코드 | figma 에서 별도 separator div 제거 — SectionBlock gap 처리가 코드 기준 |
| G12 | SectionHeader accent bar | `#a86af0` 3×13px rounded-2px (node 16:629, 16:683) | SectionHeader `.accent { color: var(--color-brand) }` — `|` 문자 텍스트 사용 | 구현 방식 차이 | 코드 | figma의 rectangle bar vs 코드의 `|` 문자 — 시각적 결과 유사. 통일성 OK (코드 표준). figma 추가 설명 불필요 |
| G13 | SectionHeader 텍스트 크기 | 13px (node 16:630, 16:684) | `@include text-section-title` = 15px (`$font-size-15`) | 디자인 토큰 차이 | 코드 | figma 에서 섹션 제목 13px → 15px 로 수정 |
| G14 | 카드 inner padding (좌우) | left=11px 기준 (절대 좌표, card width 343px 기준 내부 11px 여백) | `padding: $space-3 $space-4` = 12px 16px | 디자인 토큰 차이 | 코드 | figma 내부 left 값 11px → 12px (=$space-3)로 수정. right도 동일 |
| G15 | 빈 상태 (empty state) | 없음 — figma frame 에 빈 상태 없음 | `CouponListVertical` 가 empty array 받으면 빈 div 렌더 (빈 상태 UI 컴포넌트 없음) | state 미반영 (양쪽 모두) | 미정 | figma 에 empty state frame 추가 요청 + 코드에 `EmptyView` 또는 인라인 빈 상태 메시지 추가 (T4 fix 후 visible=0 케이스 발생 가능) |
| G16 | 로딩 / 에러 상태 | 없음 | `useCouponList` 에서 loading/error 상태 관리 미확인 (store slice 확인 필요) | state 미반영 | 미정 | figma 에 skeleton / error 상태 frame 추가 요청. spot-check (§6 S3) |

---

### 2.2 HomeScreen Coupon Section vs figma node 10:2

#### figma 측 (node 10:2 MCP 결과)

- 레이어명: "Coupon Section"
- 레이아웃 구조:
  1. **SectionHeader 영역**: 악센트 bar + "최신 쿠폰" (13px semi-bold) + "전체 보기 →" (11px `#7c6f8f` 우측)
  2. **CouponScrollGrid** (node 9:9, h=112px, top=42px): 가로 스크롤 영역
     - `CouponScrollRow` 내 `CouponCard_0`, `CouponCard_1`, `CouponCard_2` (각 w=200px, h=104px)
     - 카드 간격: left 기준 224-200=24px gap
     - 카드 배경: `#1f1a29`, border: `rgba(255,255,255,0.12)`, radius=10px
     - 내부 구조:
       - CouponCode badge: `#332947` bg, w=100px h=22px, 9px semi-bold `#d9d3e0`
       - BtnGo: w=52px h=22px (active: `#6d4ad3`, radius=4px; expired/dim: `#332947` + `rgba(168,106,240,0.3)` border, 텍스트 muted)
       - 구분선: `rgba(255,255,255,0.06)` h=1px top=39px
       - title: 12px medium `rgba(255,255,255,0.92)` (w=180px 말줄임)
       - ExpiryRow: ⏱ + "유효기간" 10px muted (w=180px 말줄임)
     - CouponCard_1, _2: BtnGo가 dim 스타일 (expired 표현 — 실제로는 active 쿠폰인데 figma에서 expired 스타일 혼용)
- 섹션 전체 높이: 약 154px (42px header + 112px scroll)

#### 실제 구현 측

- 컴포넌트 트리:
  - HomeScreen 내 (위치 미조회, cross-domain — home 도메인)
    - `SectionBlock` (global) — "최신 쿠폰" + `to="/coupons"` → "전체 보기 →" 링크
      - `CouponListHorizontal` (`containers/public/CouponListHorizontal.jsx:1`) — `showDetail=false`, `isExpired=false`
        - `CouponCard` x N — `showDetail=false` (detail, explain 미렌더)
- `CouponListHorizontal` SCSS: `.couponListScroll { @include scroll-row($space-3, $layout-h-pad) }` + 자식 `width: 200px`
- 카드 width=200px — figma 일치
- `showDetail=false` 이므로 `.couponBody`, `.couponExplain` 미렌더 — 단축 카드
- `isExpired=false` 고정 — 홈 섹션은 항상 active 쿠폰만 표시 (expired 카드 없음)

#### 갭 분석 (2.2)

| # | 항목 | figma (10:2) | 실제 구현 | 갭 종류 | source of truth | 권장 액션 |
|---|---|---|---|---|---|---|
| H1 | 섹션 제목 "최신 쿠폰" | node 10:4, 13px semi-bold | SectionHeader 글로벌 15px (`text-section-title`) | 디자인 토큰 차이 | 코드 | figma 13px → 15px 수정 (G13과 동일) |
| H2 | "전체 보기 →" 링크 색상 | `#7c6f8f` (= `$color-gray-500` = `--color-text-placeholder`) | SectionHeader `.more { color: var(--color-text-muted) }` = `rgba(255,255,255,0.38)` | 디자인 토큰 차이 | 코드 | figma 에서 "전체 보기 →" 색상 → `rgba(255,255,255,0.38)` (= `--color-text-muted`) 로 수정 |
| H3 | 카드 높이 | h=104px (node 10:7, 10:17, 10:27) | 고정 height 없음 — CSS flex column, 내용에 따라 auto | 디자인 토큰 차이 | 코드 | figma 에서 fixed height 104px 제거 — auto height 로 표시 또는 min-height 로 수정 |
| H4 | BtnGo 크기 (홈 카드) | w=52px, h=22px (node 10:10) | `.couponGoBtn { height: 24px }` — h 2px 차이, 너비는 padding 기반 | 디자인 토큰 차이 (미세) | 코드 | figma에서 h=22px → 24px로 수정 |
| H5 | BtnGo radius (홈 카드) | radius=4px (node 10:10) | `border-radius: $radius-sm` = 4px | 통일성 OK | — | 일치 |
| H6 | 카드 내부 padding (홈 카드) | left=9px 기준 (내부 절대 좌표) | `padding: $space-3 $space-4` = 12px 16px | 디자인 토큰 차이 | 코드 | figma 내부 여백 9px → 12px로 수정 |
| H7 | CouponCard_1, _2 BtnGo dim 처리 | `#332947` bg + `rgba(168,106,240,0.3)` border (node 10:20, 10:30) — expired 느낌이지만 실제 active 쿠폰 | active 쿠폰은 `couponGoBtn` 스타일 (purple bg) | figma 내부 inconsistency | 코드 | figma 내 CouponCard_1, _2 BtnGo 를 active 스타일(`#6d4ad3`)로 수정 — 실제 active 쿠폰이면 active 버튼 표시 |
| H8 | 빈 상태 | 없음 | `CouponListHorizontal` 가 empty array 시 빈 div | state 미반영 | 미정 | figma 에 홈 섹션 empty state frame 추가 요청 (G15와 연동) |

---

## 3. 재사용 / 통일성 위반 발견 (★ 본 프로젝트 핵심)

| # | 위반 항목 | figma 내용 | 표준 코드 기준 | 판정 | 권장 액션 |
|---|---|---|---|---|---|
| V1 | **도메인 전용 PageHeader** (★ 최우선) | node 16:625 "C / PageHeader" — 52px 헤더, "쿠폰" 타이틀 자체 구현 | 글로벌 `MobileLayout TopBar` 로 통일 (사용자 정책 `feedback_no_domain_header`) | **통일성 위반** | figma 에서 PageHeader frame 제거. `/coupons` 페이지는 TopBar 에 "쿠폰" 타이틀 표시 — figma frame 을 TopBar + 콘텐츠 영역만으로 재구성 |
| V2 | **PrimaryActionButton "쿠폰 적용하기"** | 각 CouponCard 하단에 별도 full-width 버튼 (node 16:646 등) | 코드에 없음 — TopRow "바로가기" 버튼 하나로 동작 | **통일성 위반** (figma 과잉 컴포넌트) | figma 에서 PrimaryActionButton frame 제거. 단 UX 관점에서 탭 영역 확대가 필요하다면 Owner 결정 요청 |
| V3 | **SectionHeader accent bar 방식** | Rectangle 3×13px (node 16:629) | `|` 문자 텍스트 (SectionHeader.jsx:9 `<span className={styles.accent}>|</span>`) | 통일성 OK (시각 동일) | figma 변경 불필요 — 구현 기준으로 OK |
| V4 | **expired 카드 dim 방법** | 색상 토큰으로 구분 (배경 `#18141f`, title opacity 0.6, border dim) | `opacity: 0.55` 전체 적용 (CouponCard.module.scss:12~15) | 구현 차이 — 양쪽 모두 valid | Owner 결정 권장. opacity 방식이 단순하고 일관적 → 코드 유지 + figma를 opacity 표현으로 수정 |

---

## 4. figma 갱신 요청 항목 (Owner 검토 필요)

| # | 대상 | figma node | 변경 내용 | 사유 | 우선순위 |
|---|---|---|---|---|---|
| F1 | PageHeader frame 제거 | 16:625 | "C / PageHeader" 전체 frame 제거. `/coupons` figma frame을 글로벌 TopBar + 콘텐츠 시작점(top=0)으로 재구성 | 도메인 자체 헤더 금지 정책 (V1) | P0 |
| F2 | PrimaryActionButton "쿠폰 적용하기" 제거 | 16:646, 16:662, 16:679, 16:702, 16:717 | 각 CouponCard 하단 PrimaryActionButton frame 전부 제거 | 코드에 없는 요소. "바로가기" 버튼 TopRow가 source of truth (V2) | P0 |
| F3 | SectionHeader 텍스트 크기 수정 | 16:630, 16:684, 10:4 | 13px → 15px (`text-section-title` 기준) | 글로벌 SectionHeader 코드 기준 15px (G13, H1) | P0 |
| F4 | BtnGo radius 수정 | 16:637, 16:652, 16:668 (active), 10:10 | radius=5px → 4px (`$radius-sm`) | 코드 `$radius-sm`=4px 기준 (G3, H5) | P1 |
| F5 | "전체 보기 →" 색상 수정 | 10:5 | `#7c6f8f` → `rgba(255,255,255,0.38)` (`--color-text-muted`) | 글로벌 SectionHeader `.more` 토큰 기준 (H2) | P1 |
| F6 | 카드 내부 padding 수정 | 16:631~모든 CouponCard, 10:7 | left=11px(9px) → 12px (`$space-3`) | 코드 `padding: $space-3 $space-4` 기준 (G14, H6) | P1 |
| F7 | 섹션 간 separator div 제거 | 16:681 | `#0f0a14` 4px separator div 제거 — SectionBlock gap 처리로 대체 | 코드 SectionBlock 컴포넌트가 gap 처리 (G11) | P1 |
| F8 | CouponCard_1, _2 BtnGo active 스타일 수정 | 10:20, 10:30 | dim 스타일(`#332947`) → active 스타일(`#6d4ad3`) 로 변경 | 홈 섹션은 active 쿠폰만 표시 — figma 내부 inconsistency (H7) | P1 |
| F9 | empty state frame 추가 | 16:624 (전체 페이지), 10:2 (홈 섹션) | visible=true 쿠폰 0건일 때 표시할 empty state frame 신규 추가 | 코드에도 empty state 없음 — 양쪽 모두 미정의. figma 신규 정의 후 코드 반영 | P2 |
| F10 | skeleton / error state frame 추가 | 16:624 | loading skeleton + error fallback frame 신규 추가 | useCouponList 로딩/에러 상태 대응 (G16, S3) | P2 |

---

## 5. 코드 수정 제안 (figma가 더 정확한 경우)

| # | 항목 | 파일:line | 변경 내용 | 사유 | figma node |
|---|---|---|---|---|---|
| C1 | expired 카드 border | `CouponCard.module.scss:13` `.expired { border-color: transparent }` | `border-color: transparent` → `border-color: var(--color-border)` | figma expired 카드에 `rgba(255,255,255,0.06)` border 표시 — 코드는 transparent (G6). figma 가 UX상 더 정확 | 16:685, 16:704 |
| C2 | `--color-coupon-expired-bg` 토큰 미정의 | `web/src/global/styles/semantic/_color.scss` | `--color-coupon-expired-bg: #272033;` 추가 | `CouponCard.module.scss:48` 에서 참조하지만 semantic/_color.scss 에 정의 없음 (G4). `#272033`은 figma expired BtnGo bg 값과 일치 | 16:689, 16:708, 16:702 |

> ★ 코드 수정 제안은 2건으로 최소화 (본 프로젝트 원칙 — 코드 = source of truth).

---

## 6. 미해결 / spot-check 필요

| # | 항목 | 사유 | 권장 조치 |
|---|---|---|---|
| S1 | expired 카드 배경 색상 불일치 | figma `#18141f` (`--color-bg-overlay`) vs 코드 `var(--color-bg-deep)`=`#140f1f` (G5) — 미세 차이이나 토큰 명 불일치 | Owner 확인: `--color-bg-deep`(=`$color-bg-800`=`#140f1f`)이 맞는지 `--color-bg-overlay`(=`#18141f`)가 맞는지 확정 후 figma 또는 코드 수정 |
| S2 | expired 카드 전체 opacity vs 색상 구분 방식 | 코드 `opacity: 0.55` vs figma 색상 토큰 개별 지정 (G7). 두 방법 모두 valid — opacity 방식이 단순하지만 하위 요소(링크 등) 에도 영향 | Owner 결정 후 figma와 코드 방향 통일. opacity 유지 시 figma도 opacity 방식으로 수정 요청 |
| S3 | 로딩 / 에러 상태 코드 처리 | `useCouponList.js` 에서 store slice loading/error selector 사용 여부 미확인 — CouponScreen 에 loading spinner / error message 없음 | `store/slices.js` 및 `store/public/thunks.js` 확인 필요. 미처리 시 코드 추가 + figma frame 추가 요청 |
| S4 | T4 위험 — `formatNow` 시그니처 불일치 | `useCouponList.js:14`: `formatNow(new Date())` 호출 — 그러나 `dateUtils.js:12`의 `formatNow` 시그니처는 인자 없음 (`export const formatNow = () => { ... }`) — `new Date()` 인수가 무시됨. 문자열 포맷은 브라우저 local time 기준 → expireAt이 KST 문자열이면 timezone 차이로 활성/종료 분기 오작동 가능 | T4 (P0) 우선 fix 대상 — (a) `formatNow` 인수 제거 또는 시그니처 정합, (b) KST 기준 시간 포맷 보장. `community/store/thunks/tagThunks.js:25`도 동일 패턴 사용 중 |
| S5 | T5 위험 — 외부 URL http 평문 하드코딩 | `CouponCard.jsx:11`: `window.open("http://withhive.me/399/${coupon.couponCode}", "_blank")` — http 평문 + 하드코딩 | T5 (P0) fix 대상 — HTTPS 전환 + 환경변수화. 현재 figma와 무관한 코드 risk (B.6 T5 cite) |

---

## 7. admin 화면 design-sync 상태

- **n/a** — admin 화면 (`/admin/content/coupon`) 은 컴포넌트 파일 부재 (`AdminCouponListPage.jsx` 미존재) + figma 미정으로 본 라운드 design-sync 대상 외.
- T2 (admin 라우트 활성화 + AdminCouponListPage 신규 작성) 완료 + figma admin frame 신규 작성 후 별도 라운드 진행 필요.

---

## 갭 요약

| 갭 종류 | 건수 | 항목 번호 |
|---|---|---|
| 통일성 위반 (★) | 2건 | V1 (도메인 헤더), V2 (PrimaryActionButton) |
| 디자인 토큰 차이 | 6건 | G3, G4, G5, G13, G14, H2 |
| 레이아웃 / 구조 차이 | 4건 | G2, G9, G11, H3 |
| 구현 방식 차이 | 3건 | G6, G7, G8 / G10 (G7 연동) |
| figma 내부 inconsistency | 1건 | H7 |
| state 미반영 | 2건 | G15, G16 |
| 코드 risk (T4/T5) | 2건 | S4, S5 (spot-check) |
| **figma 갱신 요청 합계** | **10건** | F1~F10 |
| **코드 수정 제안 합계** | **2건** | C1, C2 |

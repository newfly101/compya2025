# home 도메인 개발자 핸드오프

> 디자이너 → 주니어 개발자. 이 문서만 보고 home 화면 구현/유지보수 가능하도록.
> 본 home 화면은 **이미 코드가 존재** — 본 핸드오프는 figma frame ↔ 기존 코드 매핑 가이드.

---

## 1. 화면 목록 / 진입 경로

| 화면 | URL | 진입 경로 | Figma frame (코드.js 기준) |
|---|---|---|---|
| 홈 메인 | `/` | 앱 진입 (로그인 X 도 접근 가능 — P-01 default) | F1 Home mobile wrapper |

코드 진입점: `web/src/domains/home/components/HomeScreen.jsx` (L36~129).

---

## 2. 재사용 컴포넌트 (기존 — 변경 X)

| 컴포넌트 | 위치 | 사용처 | props |
|---|---|---|---|
| `<MobileLayout>` | `web/src/app/wrapper/mobile/MobileLayout.jsx` | home 진입 시 wrapper | 글로벌 TopBar 포함 (도메인 자체 헤더 X — 사용자 메모 `feedback_no_domain_header`) |
| `<TopBar variant="home">` | `web/src/app/wrapper/mobile/parts/TopBar.jsx` | home 의 useSetTopBar({ variant: 'home' }) | 햄버거 + 로고 + 로그인 버튼 (guest) / 로그아웃 (user) |
| `<SectionBlock>` | `web/src/global/ui/mobile/section/SectionBlock.jsx` | 모든 home section 의 wrapper | `{ title, to, linkText, children }` |
| `<SectionHeader>` | `web/src/global/ui/mobile/section/SectionHeader.jsx` | SectionBlock 내부 자동 | `{ title, to, linkText }` |
| `<CouponListHorizontal>` | `web/src/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx` | F5 자리 — coupons 도메인 책임 | `{ coupons }` |
| `<EventListHorizontal>` | `web/src/domains/events/mobile/containers/public/EventListHorizontal.jsx` | F7 자리 — events 도메인 책임 | `{ events }` |
| `<RenewalNoticeModal>` | `web/src/global/ui/renewalNoticeModal/RenewalNoticeModal.jsx` | F3 Quick comingSoon 클릭 시 | `{ isOpen, onClose }` |

---

## 3. 신규 컴포넌트 (작성 필요)

없음. home 도메인은 이미 4 section (Hero / Quick / Quiz / Notice) 모두 구현됨. F5 / F7 은 외부 도메인 책임.

---

## 4. 디자인 토큰 매핑

home 코드에서 사용하는 SCSS 변수 ↔ figma plugin Tokens namespace ↔ raw 값.

### 4.1 color

| Figma 토큰 | SCSS 변수 | CSS var | raw | 사용처 |
|---|---|---|---|---|
| `COLOR.bgDeepest` | `$color-bg-900` | `--color-bg-deepest` | `#0f0a14` | F1 wrapper bg / Hero gradient end |
| `COLOR.bgDeep` | `$color-bg-800` | `--color-bg-deep` | `#140f1f` | F3 quickMenu bg |
| `COLOR.bgCard` | `$color-bg-600` | `--color-bg-card` | `#1f1a29` | F2 hero placeholder bg / F4 quizCard / F5~F7 placeholder / F6 item bg |
| `COLOR.bgElevated` | `$color-bg-500` | `--color-bg-elevated` | `#332947` | F3 quickIcon bg |
| `COLOR.brand` | `$color-brand-400` | `--color-brand` | `#a86af0` | SectionHeader `.accent` |
| `COLOR.brandViolet` | `$color-brand-600` | `--color-brand-violet` | `#6c5ce7` | F2 heroBadge bg / F6 notice .dot |
| `COLOR.white` | `$color-white-100` | (raw) | `#ffffff` | F2 heroBadge color (P-03) |
| `ALPHA.textPrimary` | `$color-white-92` | `--color-text-primary` | `rgba(1,1,1,0.92)` | F2 heroTitle / F3 quickIcon emoji / F6 notice title |
| `ALPHA.textSecondary` | `$color-white-60` | `--color-text-secondary` | `rgba(1,1,1,0.60)` | F2 heroSub / F3 quickLabel |
| `ALPHA.textMuted` | `$color-white-38` | `--color-text-muted` | `rgba(1,1,1,0.38)` | F2 placeholderHint / F4 quizNotice / F4 emptyText / F6 notice sub/date / F5~F7 placeholder / SectionHeader .more |
| `ALPHA.border` | `$color-white-06` | `--color-border` | `rgba(1,1,1,0.06)` | F4 quizCard border / F5~F7 placeholder dashed border / F6 item border |

### 4.2 spacing

| Figma 토큰 | SCSS | raw | 사용처 |
|---|---|---|---|
| `SPACE.s1` | `$space-1` | 4 | F2 itemSpacing (badge↔title↔sub) / F6 noticeList gap |
| `SPACE.s2` | `$space-2` | 8 | F2 heroBadge pad / F3 quickMenu gap (item + counterAxis 행간) / F3 quickItem gap |
| `SPACE.s3` | `$space-3` | 12 | SectionBlock gap (head↔children) / F6 item gap |
| `SPACE.s4` | `$space-4` (=`$layout-h-pad`) | 16 | SectionBlock padding / F3 quickMenu padding / F2 hero padding-horizontal |
| `SPACE.s5` | `$space-5` | 20 | F2 hero padding-vertical |

### 4.3 radius

| Figma 토큰 | SCSS | raw | 4 배수? | 사용처 |
|---|---|---|---|---|
| `RADIUS.sm` | `$radius-sm` | 4 | ✅ | F2 heroBadge |
| `RADIUS.xl` | `$radius-xl` | 10 | ❌ (토큰 예외) | F3 quickIcon / F4 quizCard / F5~F7 placeholder / F6 item |
| `RADIUS.full` | `$radius-full` | 9999 | (pill 예외) | F6 .dot |

### 4.4 typography (mixin → figma matching)

| Figma | SCSS mixin | size / weight / lh | 사용처 |
|---|---|---|---|
| `FS.fs9 + FW_SEMIBOLD + lh 100` | `@include text-badge` | 9 / 600 / 1 | F2 heroBadge |
| `FS.fs28 + FW_BOLD + lh 120` | `@include text-hero` | 28 / 700 / 1.2 | F2 heroTitle |
| `FS.fs22 + FW_REGULAR + lh 100` | `@include text-page-title` (D-10) | 22 / (emoji raw) / 1 | F3 quickIcon emoji |
| `FS.fs15 + FW_SEMIBOLD + lh 150` | `@include text-section-title` | 15 / 600 / 1.5 | SectionHeader .sectionTitle + .accent |
| `FS.fs12 + FW_REGULAR + lh 150` | `@include text-body` | 12 / 400 / 1.5 | F6 notice .title |
| `FS.fs11 + FW_REGULAR + lh 150` | `@include text-caption` | 11 / 400 / 1.5 | F2 heroSub / F4 emptyText / F5~F7 placeholder label / SectionHeader .more |
| `FS.fs10 + FW_REGULAR + lh 150` | `@include text-micro` | 10 / 400 / 1.5 | F3 quickLabel / F4 quizNotice / F6 notice .sub + .date / F2 placeholderHint |

---

## 5. 화면별 구현 가이드 (frame별)

### 5.1 F1 Home mobile wrapper

**코드 매핑**: `HomeScreen.jsx` L53-86 / `HomeScreen.module.scss .homeWrapper` (L6-11)

**레이아웃**
- `display: flex; flex-direction: column;`
- `min-height: 100%;`
- `background-color: var(--color-bg-deepest);`

**구조 (트리)**
```
<MobileLayout>  (글로벌 wrapper)
└── <HomeScreen .homeWrapper>
    ├── <HeroSection />      ← F2
    ├── <QuickSection />     ← F3
    ├── <SectionBlock title={quizSectionTitle}>  ← F4
    │   └── <QuizSection quiz={latestQuiz} />
    ├── <SectionBlock title="최신 쿠폰" to={ROUTE_META.COUPONS.path}>  ← F5
    │   └── <CouponListHorizontal coupons={activeCoupon} />
    ├── <SectionBlock title="공지사항" to="/notices">  ← F6
    │   └── <NoticeSection />
    └── <SectionBlock title="진행 중인 이벤트" to={ROUTE_META.EVENTS.path}>  ← F7
        └── <EventListHorizontal events={activeEvents} />
```

⚠️ home 자체 헤더 X (사용자 메모 `feedback_no_domain_header`). TopBar 는 `useSetTopBar({ variant: 'home' })` 로 글로벌 위임.

### 5.2 F2 Hero section

**코드 매핑**: `HeroSection.jsx` + `HeroSection.module.scss`

**figma → CSS 변환**
- W 428 / H 160 fixed
- `background-image: url("@/assets/new/compyafun2026.jpg")` + `background-size: cover; background-position: center;`
- `::before` overlay: `linear-gradient(rgba(0,0,0,0.06), var(--color-bg-deepest))` — figma 에서는 fills 다중 paint 로 표현
- `display: flex; flex-direction: column; justify-content: flex-end; padding: 20px 16px;`
- 자식 z-index — `position: relative; z-index: 1` (overlay 위)

**구조**
```
.hero (160 / image bg + overlay)
├── .heroBadge  (H 20 / pad 0 8 / radius 4 / bg brand-violet / color #fff / text-badge)
│    └── "컴투스프로야구 2026"
├── .heroTitle (text-hero / text-primary)
│    └── "컴프야펀"
└── .heroSub   (text-caption / text-secondary / margin-top 4)
     └── "야구 게임 종합 정보 사이트"
```

**상태 분기**: 없음 (static).

### 5.3 F3 Quick section

**코드 매핑**: `QuickSection.jsx` + `QuickSection.module.scss`

**figma → CSS 변환**
- W 428 / H Hug
- `display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 16px;`
- `background-color: var(--color-bg-deep);`
- 각 item: `.quickItem` `display: flex; flex-direction: column; align-items: center; gap: 8px;`
- `.quickIcon` 52×52 radius 10 bg `bg-elevated` + emoji `text-page-title` (22pt)
- `.quickLabel` text-micro / text-secondary / center / `white-space: pre-line` (`\n` → 줄바꿈)

**데이터**: `QUICK_MENUS.js` (3건 — comingSoon 2 + 정상 1, 4번째 cell 공백 D-03)

**상태 분기**:
- `comingSoon: true` → 클릭 시 `e.preventDefault()` + `RenewalNoticeModal` 열기
- 그 외 → `<Link to={menu.to}>` 정상 navigate

### 5.4 F4 Quiz section block

**코드 매핑**: `QuizSection.jsx` + `QuizSection.module.scss`

**figma → CSS 변환**
- SectionBlock wrapper — `padding: 16px; gap: 12px;`
- SectionHeader title 동적: `quizSectionTitle = latestQuiz?.title ?? (round 있으면 'X회 정답' / 없으면 '컴프야 퀴즈 정답')`
- `.quizCard` — `aspect-ratio: 16/9; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-card);` → figma 에서 H 224 (4 배수 보정 D-04)
- 자식 `.empty` — `position: absolute; inset: 0; flex-col-center; gap: 8px;`
- `.emptyIcon` 28pt opacity 0.4 / `.emptyText` text-caption text-muted
- `.quizNotice` text-micro text-muted

**상태 분기 (FS-HOME-QUIZ)**
- `quiz?.imageUrl` 있음 → `<img>` 표시
- `quiz?.imageUrl` 없음 → `.empty` (figma F4 default)
- broken image / thunk 실패 → (P-04 default: empty 그대로)

### 5.5 F5 Coupon section block / F7 Event section block

**figma 책임 X** — placeholder 만. 실제 구현:
- F5 → `<CouponListHorizontal coupons={activeCoupon} />` (coupons 도메인)
- F7 → `<EventListHorizontal events={activeEvents} />` (events 도메인)

home 코드는 단순히 `<SectionBlock title to>` 안에 외부 컴포넌트 넣을 뿐.

### 5.6 F6 Notice section block

**코드 매핑**: `NoticeSection.jsx` + `NoticeSection.module.scss`

**figma → CSS 변환**
- `.noticeList` — `display: flex; flex-direction: column; gap: 4px;`
- `.item` — `display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-card);`
- `.dot` — 6×6 raw / `border-radius: 9999px;` / `background: var(--color-brand-violet);`
- `.content` — `flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden;`
- `.title` — text-body / text-primary / `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`
- `.sub` — text-micro / text-muted / ellipsis
- `.date` — text-micro / text-muted / `flex-shrink: 0;`

**데이터**: `useNoticeList().siteNotices.slice(0, 3)` — 3건 cap.

**상태 분기 (EC-HOME-NOTICE-01)**
- 빈 배열 → 현재 코드는 빈 `<ul>` (figma 측 default — P-02: empty frame 없이 mock 3건만 그림)

---

## 6. 반응형 / CSS 가이드

- home wrapper 자체 max-width 적용 X — 글로벌 `MobileLayout` 의 wrapper 가 `max-width: 480px; margin: 0 auto;` 담당.
- 모든 section 폭 = 부모 width 100% (figma 기준 396 = 428 - 16×2).
- media query 분기 0건 (단일 모바일 레이아웃 — 사용자 메모 준수).

---

## 7. 접근성 / 인터랙션 디테일

- Quick item `<Link to>` — keyboard navigable. comingSoon 항목은 `e.preventDefault()` 후 modal open.
- SectionHeader `.more` `<Link>` — keyboard navigable.
- Notice `<li onClick>` — 키보드 접근성 약함. 향후 `<button>` 또는 `<Link>` 마이그 권고 (현재 baseline 유지).
- focus ring 등 추가 스타일 미구현 — 추후 a11y 패스.

---

## 8. 미정 / 추가 결정 필요

| ID | 항목 | 마커 | 대기 |
|---|---|---|---|
| P-01 | 비로그인 접근 정책 (auth guard) | 🟨 default | planner 정책 확정 시 reverse 적용 |
| P-02 | Notice 빈 배열 empty state UX | 🟨 default | planner / 디자인 확정 시 추가 |
| P-03 | heroBadge `#fff` 토큰화 (변수화) | 🟨 default | 전역 token 정리 시 처리 |
| P-04 | Quiz broken image fallback | 🟨 default | planner 정책 확정 시 추가 |

---

## 9. 검증 체크리스트 (PR 시)

- [ ] `npm run dev` 후 `/` 진입 → F1~F7 모두 렌더링
- [ ] Quick comingSoon (스킬/백과사전) 클릭 → RenewalNoticeModal 표시
- [ ] Quick `히스토리 모드` 클릭 → `/mode/history` navigate
- [ ] Quiz `latestQuiz === null` 상태 → empty placeholder 표시
- [ ] Notice empty 상태 → 빈 `<ul>` 표시 (현재 baseline)
- [ ] SectionHeader `전체 보기 →` 클릭 → 각 도메인 목록 페이지 navigate
- [ ] TopBar guest / user 양쪽 모두 home 화면 정상 표시
- [ ] tablet / PC 환경 — 모바일 폭 480 max + 좌우 여백 (글로벌 MobileLayout 책임)

---

## 10. 사용자 figma 진리 모드 sync 라운드 (2026-05-11)

> figma 진리 (node 2:2) 기준 home.ts 재작성. 차이 상세: `sync-analysis.md`.

### frame ↔ 코드 컴포넌트 매핑 갱신

| figma frame | 코드 컴포넌트 (FE 기존/신규) | 비고 |
|---|---|---|
| `Mobile Home — 컴프야펀 (375×1639)` | `HomeScreen.jsx` | wrapper 폭은 글로벌 `MobileLayout` 가 480 max 책임 |
| `Topbar (375×52)` | `MobileLayout/parts/TopBar.jsx` (variant=home) | 도메인 자체 헤더 만들지 않음 — 글로벌 그대로 |
| `Hero Banner (375×104)` | `home/components/section/hero/HeroSection.jsx` | 104h compact, badge top-left, heroTitle 22/700 |
| `QuickNav Section (375×120, 4-cell)` | `home/components/section/quick/QuickSection.jsx` | 4-cell 카드형, 각 셀 bgCard+border+radius 10 |
| `Quiz Section (375×251)` | `home/components/section/quiz/QuizSection.jsx` | 343×186 image card |
| `Coupon Section (375×170)` | `coupons` 도메인 `CouponListHorizontal` | 가로 스크롤 row, 200×104 card |
| `Notice Section (375×256)` | `home/components/section/notice/NoticeSection.jsx` | 343×64, title top + date right + dot+sub bottom |
| `Event Section (375×182)` | `events` 도메인 `EventListHorizontal` | 2-col 167.5×124, thumb 72h + 진행중 badge |
| `Community Section (375×222)` ⭐ 신규 | `community` 도메인 list (신규 작성 필요) | HOT/NEW badge + chevron, 343×52 |
| `Tips Section (375×282)` ⭐ 신규 | `tips` 도메인 list (신규 작성 필요) | left 3px brand border + 카테고리 라벨, 343×72 |

### 신규 raw 색 (inline 사용, 토큰화 보류 — 🟨)

| 위치 | hex / rgba | 권고 토큰명 |
|---|---|---|
| HOT badge bg / text | `rgba(232,65,65,0.18)` / `#e84141` | `$color-danger-bg-18` / `$color-danger-400` |
| NEW badge bg / text | `rgba(232,213,65,0.33)` / `#ffd9d9` | `$color-warning-bg-33` / `$color-warning-100` |
| Event thumb (purple) | `#3c1e50` | `$color-thumb-purple` |
| Event thumb (navy) | `#19284b` | `$color-thumb-navy` |
| Section "전체 보기 →" | `#7c6f8f` | `$color-text-muted-purple` |
| Coupon code text | `#d9d3e0` | `$color-text-secondary-light` |

### code.ts 변경

`ApplayoutDomain.run()` 호출 일시 비활성 — home 단독 sync. plugin 재실행 시 applayout 10 frame 같이 안 만들어짐 (사용자 요청). 재활성화 시 `figma-plugin/code.ts` 19행 주석 해제.

### 검증 체크리스트 추가

- [ ] Hero 배경 이미지 (`compyafun2026.jpg`) figma 진리에는 placeholder rect — 실 이미지 적용 시 별도 라운드
- [ ] Quiz 이미지 placeholder → 실 이미지 (S3 / public) 연결
- [ ] Community / Tips 도메인 신규 작성 (현재 BE/FE 없음)


# home 도메인 IA (정보 구조)

> **모드**: reverse engineering — 기존 코드에서 역추출
> **소스**: `web/src/domains/home/` (HomeScreen.jsx + 4 sub-section)
> **작성일**: 2026-05-11

---

## 1. 도메인 정체성

- **역할**: 모바일 첫 진입 페이지 (landing). 사이트 전체 기능을 1 페이지에 요약 노출
- **구조 유형**: **얇은 합성형 (thin composer)** — 자체 store / API hook 없음. 외부 도메인 (coupons / events / notices / quiz) hook 만 조합
- **데이터 소유권**: 없음. 모든 데이터는 외부 도메인 소유
- **사이트 정체성**: 야구 게임 종합 정보 사이트 ("컴프야펀")

## 2. 진입점

| 항목 | 값 | 소스 |
|---|---|---|
| route path | `/` | `ROUTE_META.HOME.path` |
| route 등록 위치 | `web/src/app/router/routes/PublicRoutes.jsx` (index route) | — |
| 페이지 title | `컴프야펀 | 홈` | `ROUTE_META.HOME.title` |
| TopBar variant | `home` | `useSetTopBar({ variant: "home" })` |
| 접근 권한 | public (비로그인 OK) 🟨 **가정** — 실제 코드에 auth guard 없음 | — |

## 3. 페이지 구조 (위→아래 순서)

```
HomeScreen
├── [1] HeroSection            (정적 배너)
├── [2] QuickSection           (퀵메뉴 4-col 그리드)
├── [3] SectionBlock: 퀴즈      → QuizSection (state.quiz.latest)
├── [4] SectionBlock: 최신 쿠폰  → CouponListHorizontal (외부)
├── [5] SectionBlock: 공지사항   → NoticeSection (siteNotices.slice(0,3))
├── [6] SectionBlock: 진행 중인 이벤트 → EventListHorizontal (외부)
└── [주석] 커뮤니티 인기글 / 자유게시판 — community 도메인 보류 (2026-05-09)
```

## 4. 섹션별 데이터 출처 / 의존성

| # | 섹션 | 데이터 출처 | 외부 의존 | 분기 |
|---|---|---|---|---|
| 1 | Hero | 정적 (코드 내 텍스트) | — | 없음 |
| 2 | Quick | `QUICK_MENUS` (정적 config) | `RenewalNoticeModal` | `comingSoon: true` → 모달 |
| 3 | Quiz | `state.quiz.latest` (redux) | `requestLatestQuizAnswer` thunk | `imageUrl` 유무 |
| 4 | 최신 쿠폰 | `useCouponList().activeCoupon` | `CouponListHorizontal` (events 도메인 X — **coupons** 도메인) | 빈 배열 처리 위임 (외부) |
| 5 | 공지사항 | `useNoticeList().siteNotices` | — | `slice(0,3)` 빈 배열 처리 ❓ **미정** |
| 6 | 진행 중인 이벤트 | `useEventList().activeEvents` | `EventListHorizontal` | 빈 배열 처리 위임 (외부) |

## 5. 글로벌 의존 매트릭스

| 의존 | 종류 | 사용처 |
|---|---|---|
| `MobileLayout` | layout wrapper | 라우터 wrapper (자동) |
| `useSetTopBar` | hook | HomeScreen (variant=home) |
| `SectionBlock` | UI | 4 섹션 (title + to + children) |
| `RenewalNoticeModal` | UI | QuickSection (comingSoon 클릭) |
| `CouponListHorizontal` | 외부 container | 최신 쿠폰 섹션 |
| `EventListHorizontal` | 외부 container | 진행 중 이벤트 섹션 |
| `useCouponList` / `useEventList` / `useNoticeList` | 외부 hook | 데이터 fetch |
| `requestLatestQuizAnswer` | redux thunk | Quiz 1회 fetch |
| `ROUTE_META.HOME/COUPONS/EVENTS` | route 상수 | path 참조 |

## 6. 퀵메뉴 구성 (현재 코드)

| id | label | to | 상태 |
|---|---|---|---|
| 1 | 스킬\n시뮬레이터 | `/skill` | `comingSoon: true` (폐기 도메인) |
| 2 | 추천\n백과사전 | `/encyclopedia` | `comingSoon: true` (폐기 도메인) |
| 3 | 히스토리\n모드 | `/mode/history` | 정상 navigate |
| 4 | (주석) KBO\n승부예측 | `/kbo` | LEGACY 보류 (2026-05-09) |

🟨 **가정**: 현재 노출 메뉴 3건 (id 1,2,3). 2건은 comingSoon → 실제 navigate 가능한 메뉴는 **1건만** (히스토리 모드).

## 7. dead code / 보류 영역

| 항목 | 상태 | 비고 |
|---|---|---|
| `MOCK_QUIZ.js` import | dead | QuizSection 은 redux state 사용 |
| `MOCK_POSTS.js` / `MOCK_TEAM_POSTS.js` import | dead | community 섹션 주석 처리 중 |
| `HomeScreen.module.scss .sep` / `.postRowList` | dead style | community 섹션 주석화 후 미사용 |
| 커뮤니티 인기글 / 자유게시판 섹션 | 주석 처리 | community 도메인 IA 재개 보류 (2026-05-09) |
| KBO 승부예측 퀵메뉴 | 주석 처리 | BE API 미구현 / kbocrol 운영 중 |

## 8. 사용자 확인 필요 항목

- ❓ **미정** §3 비로그인 접근 정책 — 코드상 guard 없음. 의도된 public 인지 확인
- ❓ **미정** §4 NoticeSection 빈 배열 시 UX — 현재 빈 `<ul>` 만 렌더 (시각적 잔여 없음)
- ❓ **미정** §6 퀵메뉴 향후 노출 정책 — comingSoon 2건 / 보류 1건 처리 시점
- 🟨 **가정** §7 community 섹션 재개 시점 — community 도메인 IA 작업 후

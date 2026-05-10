# home 도메인 요구사항 정의서

> **모드**: reverse engineering
> **선행 산출물**: `docs/domain/home/prd/ia.md`
> **작성일**: 2026-05-11

---

## 1. 요구사항 ID 체계

`HOME-{영역}-{번호}` — 영역: HERO / QUICK / QUIZ / COUPON / NOTICE / EVENT / GLOBAL

## 2. 기능 요구사항 (FR)

| ID | 요구사항 | 우선순위 | 출처 | 마커 |
|---|---|---|---|---|
| HOME-GLOBAL-01 | 모바일 진입 시 home 페이지 `/` 가 첫 화면이어야 한다 | P0 | route index | — |
| HOME-GLOBAL-02 | 글로벌 TopBar 가 `home` variant 로 표시되어야 한다 | P0 | `useSetTopBar` | — |
| HOME-GLOBAL-03 | 페이지는 6개 섹션을 순서대로 표시한다 (Hero / Quick / Quiz / 최신 쿠폰 / 공지사항 / 진행 중 이벤트) | P0 | HomeScreen.jsx | — |
| HOME-HERO-01 | Hero 섹션은 사이트 브랜드 (컴프야펀 / 컴투스프로야구 2026) 와 정체성 (야구 게임 종합 정보) 을 정적으로 표시한다 | P0 | HeroSection.jsx | — |
| HOME-QUICK-01 | 퀵메뉴는 4-col 그리드로 표시되며 아이콘 + 라벨 (multi-line) 구성이다 | P0 | QuickSection.jsx | — |
| HOME-QUICK-02 | 메뉴 항목은 `QUICK_MENUS` config 로 정의된다 | P0 | QUICK_MENUS.js | — |
| HOME-QUICK-03 | `comingSoon: true` 메뉴 클릭 시 navigate 차단 + `RenewalNoticeModal` 표시 | P0 | QuickSection.jsx | — |
| HOME-QUICK-04 | `comingSoon` 이 아닌 메뉴 클릭 시 `to` 경로로 정상 navigate | P0 | `<Link to>` | — |
| HOME-QUIZ-01 | 페이지 진입 시 `requestLatestQuizAnswer` 1회 dispatch — 최신 정답 조회 | P0 | useEffect | — |
| HOME-QUIZ-02 | Quiz 섹션 title 은 `latestQuiz.title` 우선, 없으면 `회차 {round} 정답`, 둘 다 없으면 기본 문구 | P0 | quizSectionTitle 분기 | — |
| HOME-QUIZ-03 | `imageUrl` 있으면 이미지 표시, 없으면 empty placeholder (`🖼️ 이미지가 없습니다`) | P0 | QuizSection.jsx | — |
| HOME-QUIZ-04 | "매주 금요일 12:00 신규 퀴즈 / 정답 100스타(★)" 안내 문구 표시 | P0 | quizNotice | — |
| HOME-COUPON-01 | `useCouponList().activeCoupon` 을 `CouponListHorizontal` 로 표시 | P0 | HomeScreen.jsx | — |
| HOME-COUPON-02 | "최신 쿠폰" 섹션 title + 전체보기 (`ROUTE_META.COUPONS.path`) | P0 | SectionBlock | — |
| HOME-NOTICE-01 | `useNoticeList().siteNotices` 의 상위 3건 (`slice(0,3)`) 표시 | P0 | NoticeSection.jsx | — |
| HOME-NOTICE-02 | 공지 항목 클릭 시 `ROUTE_PATHS.notice_details(id)` 로 이동 | P0 | navigate | — |
| HOME-NOTICE-03 | 각 공지는 title / summary / publishedAt (앞 10자) 표시 | P0 | NoticeSection.jsx | — |
| HOME-NOTICE-04 | "공지사항" 섹션 title + 전체보기 (`/notices`) | P0 | SectionBlock | — |
| HOME-EVENT-01 | `useEventList().activeEvents` 를 `EventListHorizontal` 로 표시 | P0 | HomeScreen.jsx | — |
| HOME-EVENT-02 | "진행 중인 이벤트" 섹션 title + 전체보기 (`ROUTE_META.EVENTS.path`) | P0 | SectionBlock | — |

## 3. 비기능 요구사항 (NFR)

| ID | 요구사항 | 출처 | 마커 |
|---|---|---|---|
| HOME-NFR-01 | 페이지 렌더는 외부 도메인 hook 의 로딩 상태와 무관하게 진행 (페이지 레벨 통합 게이트 없음) | HomeScreen.jsx | 🟨 **가정** — 의도된 설계인지 확인 |
| HOME-NFR-02 | 디자인 토큰만 사용 (색상 / spacing / radius). hardcoded 색상 금지 | 글로벌 컨벤션 | ❓ **미정** — Hero.heroBadge `#fff` 1건 위반 확인 |
| HOME-NFR-03 | 자체 헤더 생성 금지 — 글로벌 MobileLayout TopBar 사용 | 사용자 메모 (`feedback_no_domain_header`) | — |
| HOME-NFR-04 | 단일 페이지 상태분기형 화면은 sub-컴포넌트 분리 최소화 | 사용자 메모 (`feedback_component_decomposition`) | 🟨 **가정** — 현재 4 sub-section 은 반복/변형 충족 OK |

## 4. 데이터 요구사항

home 도메인은 자체 데이터 모델 X. 외부 도메인 hook contract 만 의존.

| 의존 hook | 반환 필드 사용 | 호출 위치 |
|---|---|---|
| `useCouponList()` | `activeCoupon` | HomeScreen |
| `useEventList()` | `activeEvents` | HomeScreen |
| `useNoticeList()` | `siteNotices: Array<{id, title, summary, publishedAt}>` | NoticeSection |
| `state.quiz.latest` | `{title?, round?, imageUrl?}` | HomeScreen / QuizSection |

🟨 **가정**: 위 hook contract 는 각 도메인 책임. home 은 read-only 소비자.

## 5. 사용자 시나리오 (high-level)

| ID | 시나리오 | 우선순위 |
|---|---|---|
| HOME-UC-01 | 사용자가 사이트 첫 진입 → home 페이지 6 섹션 본다 | P0 |
| HOME-UC-02 | 사용자가 퀵메뉴 (히스토리 모드) 클릭 → 해당 페이지 이동 | P0 |
| HOME-UC-03 | 사용자가 comingSoon 메뉴 클릭 → 모달 안내 본다 | P0 |
| HOME-UC-04 | 사용자가 공지 항목 클릭 → 공지 상세 페이지 이동 | P0 |
| HOME-UC-05 | 사용자가 "최신 쿠폰" 섹션 전체보기 → 쿠폰 목록 페이지 이동 | P0 |
| HOME-UC-06 | 사용자가 "진행 중 이벤트" 섹션 전체보기 → 이벤트 목록 페이지 이동 | P0 |
| HOME-UC-07 | 사용자가 "공지사항" 섹션 전체보기 → 공지 목록 페이지 이동 | P0 |

## 6. 범위 외 (Out of Scope)

- 커뮤니티 인기글 / 자유게시판 섹션 — 주석 처리 중 (community 도메인 IA 후 재개)
- KBO 승부예측 퀵메뉴 — BE API 미구현 (LEGACY 보류)
- 스킬 시뮬레이터 / 추천 백과사전 — 폐기 도메인 (comingSoon)
- 페이지 레벨 글로벌 loading / error 게이트
- 개인화 (로그인 사용자별 추천 / 맞춤 섹션)

## 7. 사용자 확인 필요 항목

- 🟨 **가정** HOME-GLOBAL-01: home 이 모바일 진입 첫 화면 — 의도된 정책 맞음
- ❓ **미정** HOME-NFR-01: 페이지 통합 loading/error 게이트 부재 — 의도된 설계 vs 결함
- ❓ **미정** HOME-NFR-02: heroBadge `#fff` 1건 위반 — 토큰화 필요 여부
- ❓ **미정** §6 community / KBO 재개 시점

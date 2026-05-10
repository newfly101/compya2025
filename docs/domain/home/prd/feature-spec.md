# home 도메인 기능 명세 (Feature Spec)

> **모드**: reverse engineering
> **선행 산출물**: `ia.md` + `requirements.md` + `policy-draft.md`
> **포맷**: Given / When / Then (주어진 상황 / 행동 / 결과)
> **작성일**: 2026-05-11

---

## 1. 명세 ID 체계

`FS-HOME-{영역}-{번호}`

## 2. 페이지 진입 / TopBar (GLOBAL)

### FS-HOME-GLOBAL-01 — 모바일 첫 진입

- **Given** 사용자가 모바일에서 `/` 경로로 진입
- **When** 라우터가 index route 매칭
- **Then**
  - HomeScreen 이 렌더된다
  - TopBar 가 `variant=home` 으로 표시된다
  - 6 섹션이 순서대로 렌더된다 (Hero / Quick / Quiz / Coupon / Notice / Event)
  - 페이지 title = `컴프야펀 | 홈`

### FS-HOME-GLOBAL-02 — 비로그인 접근

- **Given** 인증 토큰 없는 사용자
- **When** `/` 진입
- **Then** 정상 렌더 (auth guard 없음) 🟨 **가정**

## 3. Hero 섹션

### FS-HOME-HERO-01 — 정적 표시

- **Given** 페이지 렌더
- **When** Hero 섹션 마운트
- **Then**
  - badge: `컴투스프로야구 2026`
  - title: `컴프야펀`
  - sub: `야구 게임 종합 정보 사이트`
  - 분기 / 데이터 의존 없음

## 4. Quick 섹션 (퀵메뉴)

### FS-HOME-QUICK-01 — 메뉴 그리드 표시

- **Given** `QUICK_MENUS` config 정의된 메뉴 목록
- **When** QuickSection 렌더
- **Then**
  - 4-col 그리드로 메뉴 표시
  - 각 항목: 아이콘 (`icon`) + 라벨 (`label`, multi-line `\n` 지원)
  - 현재 코드 baseline: 3건 노출 (스킬 시뮬레이터 / 추천 백과사전 / 히스토리 모드)

### FS-HOME-QUICK-02 — 일반 메뉴 클릭 (comingSoon: false)

- **Given** `comingSoon` 이 falsy 인 메뉴 (예: 히스토리 모드)
- **When** 사용자가 메뉴 클릭
- **Then** `to` 경로로 navigate (`<Link to={menu.to}>`)

### FS-HOME-QUICK-03 — comingSoon 메뉴 클릭

- **Given** `comingSoon: true` 메뉴 (스킬 시뮬레이터 / 추천 백과사전)
- **When** 사용자 클릭
- **Then**
  - `e.preventDefault()` — navigate 차단
  - `RenewalNoticeModal` 이 열린다 (`renewalOpen=true`)

### FS-HOME-QUICK-04 — RenewalNoticeModal 닫기

- **Given** 모달 open 상태
- **When** 사용자가 모달 닫기 (onClose)
- **Then** `renewalOpen=false` → 모달 닫힘. 페이지 상태 유지

## 5. Quiz 섹션

### FS-HOME-QUIZ-01 — 페이지 진입 시 정답 fetch

- **Given** HomeScreen 첫 마운트
- **When** `useEffect` 1회 실행
- **Then** `dispatch(requestLatestQuizAnswer())` 호출 — redux store 에 최신 정답 적재

### FS-HOME-QUIZ-02 — Quiz title 분기

- **Given** redux state `quiz.latest` 값
- **When** quizSectionTitle 계산
- **Then**
  - `latestQuiz.title` 있으면 → 그 값 사용
  - 없고 `round` 있으면 → `🎉컴프야 퀴즈 이벤트 {round}회 정답`
  - 둘 다 없으면 → `컴프야 퀴즈 정답`

### FS-HOME-QUIZ-03 — Quiz 이미지 렌더

- **Given** `latestQuiz.imageUrl` 값
- **When** QuizSection 렌더
- **Then**
  - `imageUrl` truthy → `<img src={imageUrl} alt="퀴즈 이미지" />`
  - `imageUrl` falsy 또는 latestQuiz null → empty placeholder (`🖼️` + `이미지가 없습니다`)

### FS-HOME-QUIZ-04 — 안내 문구

- **Given** Quiz 섹션 렌더
- **Then** 안내 문구 표시: `※ 매주 금요일 12:00에 신규 퀴즈가 등장합니다. 정답 : 100스타(★)`

## 6. 최신 쿠폰 섹션 (외부 위임)

### FS-HOME-COUPON-01 — 쿠폰 목록 표시

- **Given** `useCouponList().activeCoupon` 데이터
- **When** SectionBlock 렌더
- **Then**
  - 섹션 title: `최신 쿠폰`
  - 전체보기 link: `ROUTE_META.COUPONS.path`
  - children: `<CouponListHorizontal coupons={activeCoupon} />`
  - empty / loading / error UX 는 `CouponListHorizontal` 책임 (외부 도메인)

## 7. 공지사항 섹션

### FS-HOME-NOTICE-01 — 공지 상위 3건 표시

- **Given** `useNoticeList().siteNotices` 데이터
- **When** NoticeSection 렌더
- **Then**
  - `notices = siteNotices.slice(0, 3)` 추출
  - `<ul>` 안에 각 항목: `dot` + `title` + `summary` + `publishedAt.slice(0,10)`
  - 빈 배열 시 빈 `<ul>` 만 렌더 ❓ **미정** — placeholder 추가 여부

### FS-HOME-NOTICE-02 — 공지 클릭 → 상세 이동

- **Given** 공지 항목 노출
- **When** 사용자가 `<li>` 클릭
- **Then** `navigate(ROUTE_PATHS.notice_details(notice.id))` 실행

### FS-HOME-NOTICE-03 — 섹션 전체보기

- **Given** SectionBlock title=`공지사항` to=`/notices`
- **When** 사용자가 전체보기 클릭
- **Then** `/notices` 경로로 이동

## 8. 진행 중인 이벤트 섹션 (외부 위임)

### FS-HOME-EVENT-01 — 이벤트 목록 표시

- **Given** `useEventList().activeEvents` 데이터
- **When** SectionBlock 렌더
- **Then**
  - 섹션 title: `진행 중인 이벤트`
  - 전체보기 link: `ROUTE_META.EVENTS.path`
  - children: `<EventListHorizontal events={activeEvents} />`
  - empty / loading / error UX 는 `EventListHorizontal` 책임 (외부)

## 9. 보류 / 주석 처리 섹션 (범위 외)

| ID | 섹션 | 상태 |
|---|---|---|
| (보류) | 커뮤니티 인기글 | 주석 처리 — community IA 재개 후 |
| (보류) | 자유게시판 | 주석 처리 — community IA 재개 후 |

## 10. 사용자 확인 필요 항목

- 🟨 **가정** FS-HOME-GLOBAL-02 비로그인 접근 정책
- ❓ **미정** FS-HOME-NOTICE-01 빈 배열 시 placeholder 추가 여부
- 🟨 **가정** FS-HOME-QUIZ-03 `latestQuiz` 자체 null 시 동일 empty placeholder — 의도된 동작

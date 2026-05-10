# 도메인: home

## A.1 현재 상태

- **분류**: **partial-mock** (BE 일부 연결 + 일부 mock)
- **모바일 전환 진척도**: **변종** (coupons/events 표준 패턴과 거리 있음 — `mobile/` 없이 `components/` 에 직접 Screen 위치)
  - 진입점: `web/src/domains/home/components/HomeScreen.jsx` (라우트 `/`)
  - PC/모바일 분기 없음. `MobileLayout` 단일 레이아웃
- ~~**중복 의심**: `web/src/domains/mobile/home/pages/MobileHomePage.jsx`~~ — Owner 결정 #3 ✅ 2026-05-09 (A) 즉시 폐기 채택. `domains/mobile/` 통째 제거 완료. 활성 진입은 HomeScreen 단일 (`_history.md` DEPRECATE row 참조)

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| HomePage → HomeScreen | `/` | `HomeScreen` (`web/src/domains/home/components/HomeScreen.jsx`) | 모바일 단일 | wrapper: `web/src/app/page/HomePage.jsx` |

### 섹션 (HomeScreen 내부)

- HeroSection — `domains/home/components/section/hero/`
- QuickSection — `domains/home/components/section/quick/QuickSection.jsx` (QUICK_MENUS config)
- QuizSection — `domains/home/components/section/quiz/` (★ prop `quiz=null` 만 받음 — dispatch 누락)
- CouponListHorizontal (live) — `domains/coupons/mobile/containers/public/CouponListHorizontal.jsx` 차용
- NoticeSection (live) — `domains/home/components/section/notice/`
- EventListHorizontal (live) — `domains/events/mobile/containers/public/EventListHorizontal.jsx` 차용
- PostRow×N (mock 인기글) — `MOCK_POSTS`
- PostRow×N (mock 자유게시판) — `MOCK_TEAM_POSTS`

## A.3 API 엔드포인트

### BE 노출 (홈 자체 컨트롤러는 없음 — 다른 도메인 호출)

해당 도메인 자체 BE 없음. 의존 도메인의 endpoint 호출 (notices, coupons, events, quiz).

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook/service | 트리거 |
|---|---|---|---|---|
| `domains/notices/mobile/hooks/useNoticeList.js:11` | GET | `/notices` | `useNoticeList` | NoticeSection 마운트 |
| `domains/coupons/mobile/hooks/useCouponList.js:11` | GET | `/coupons` | `useCouponList` | CouponListHorizontal 마운트 |
| `domains/events/mobile/hooks/useEventList.js:12` | GET | `/events/external` | `useEventList` | EventListHorizontal 마운트 |
| (호출 없음 — dispatch 누락) | GET | `/quiz-answers/latest` ★ FE path 오타 | `requestLatestQuizAnswer` (정의만, dispatch 0건) | QuizSection 은 prop `quiz=null` 만 받음 |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` 기반)

- 매칭됨: 3건 (notices/coupons/events)
- FE 만 호출 (BE 부재): 0건 (현재 dispatch 안 되므로)
- BE 만 노출 (호출 없음): `GET /api/quiz/latest` (BE wired but FE dispatch 누락 + path 오타) — `fe-be-mismatch.md #8`

## A.4 DB 테이블 + Mapper

홈 자체 DB 없음. 의존 도메인 (notices, coupons, events, quiz) 의 테이블 사용.

## A.5 권한 / 가드

- guest 진입 가능 (`/` 라우트)
- 모든 호출 endpoint 가 `permitAll`

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

- ★ **HomeScreen quiz dispatch 누락** (`risk-and-priority.md #9`, `fe-be-mismatch.md #8`):
  - FE thunk `requestLatestQuizAnswer` 정의만, dispatch 0건
  - FE endpoint path `/quiz-answers/latest` ↔ BE `/api/quiz/latest` 미스매치
  - QuizSection 항상 빈 카드 렌더 (`MOCK_QUIZ` 회차/제목만 보여주고 imageUrl 은 prop=null)
  - **권장 액션**: ① endpoints.js path `/quiz/latest` 로 수정 ② HomeScreen 마운트 시 dispatch 추가 ③ QuizSection props 로 응답 imageUrl/round 전달
- **변종 패턴** (`fe-map.md ★ Owner 확정 #5`):
  - 진입점이라 일찍 만들어졌고, 다른 도메인이 `mobile/` 패턴으로 정착하는 동안 정리 안 됨
  - 표준 패턴(coupons/events)으로 맞춰갈 후보. 단 진입점이라 이동 시 영향 큼
- **부분 mock** (`fe/state-and-data.md:106`):
  - live: NoticeSection, CouponListHorizontal, EventListHorizontal
  - mock: QuizSection (MOCK_QUIZ), 인기글 (MOCK_POSTS), 자유게시판 (MOCK_TEAM_POSTS)

## A.7 dead 항목 (이 도메인 안)

- ~~**MobileHomePage**~~ — Owner 결정 #3 ✅ 2026-05-09 폐기 완료 (`_history.md` DEPRECATE row 참조)

## A.8 ★ Owner 결정 필요 (도메인 한정)

- ~~**결정 #3** (도메인 한정): MobileHomePage / `domains/mobile/` 처리~~ ✅ 2026-05-09 (A) 즉시 폐기 채택. 본 도메인 한정 영향 0
- **추가 모호**:
  - HomeScreen 을 `domains/home/mobile/HomeScreen.jsx` 위치로 이동해 표준 패턴 정렬할지 — Owner 결정 보류 (이동 시 진입점 영향)
  - 인기글/자유게시판 mock 영역의 BE 연결 시점 (community 도메인 BE 연결 마일스톤과 연동)

---

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역

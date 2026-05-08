# FE → BE API 호출 표

> 분석 시점: v2.0.0-refactor-mobile 브랜치
> baseURL: `http://localhost:8080/api` (`web/src/app/store/APIConfig.js:3`) — 프로덕션 url 미적용 (주석 처리)
> 인증: `withCredentials: true` (쿠키 기반), 401 응답은 `{ data: null }` 으로 swallow (`APIConfig.js:30`)
> 호출 패턴: 거의 모든 API 가 `endpoints.js` (path 상수) → `api.js` (axios fetcher) → `thunks.js` (redux thunk) → 도메인 hook (dispatch) → Screen 의 4단계

## 표기 규칙
- **METHOD / PATH** 는 `endpoints.js` 의 상수 그대로 (BE 측 실제 매핑은 미검증)
- **호출 hook·service** = `dispatch(thunk)` 가 일어나는 위치
- **트리거 화면** = 라우트 또는 부모 컴포넌트
- **Live?** = 현재 운영 라우트로 진입 가능한지 (라우트 주석 처리 = ★주석)
- 요청/응답 shape 는 코드에서 추출 가능한 범위만 (BE 와의 정합성 미검증)

## Public (인증 무관 + USER 일반)

| METHOD | PATH | 호출 fetcher | thunk | hook | 트리거 화면 (라우트) | Live? | 요청 shape | 응답 기대 shape |
|---|---|---|---|---|---|---|---|---|
| GET | `/users/me` | `fetchHealthCheck` (`web/src/domains/authentication/store/api.js:8`) | `requestUserHealthCheck` (`web/src/domains/authentication/store/thunks.js:6`) | `AuthProvider` 직접 dispatch (`web/src/app/provider/AuthProvider.jsx:11`), `AuthCallback` (`web/src/domains/authentication/callback/AuthCallBack.jsx:11`) | 모든 라우트 (앱 부팅 시), `/auth/callback` | ✅ | (none) | `{ data: { userRole, ...userDetail } }` |
| POST | `/auth/logout` | `fetchLogout` (`api.js:13`) | `requestUserLogout` (`thunks.js:21`) | `useAuthentication.logout` (`web/src/domains/authentication/hooks/useAuthentication.js:30`), `useHeaderAuth.logout` (`web/src/app/wrapper/parts/hooks/useHeaderAuth.js:27`) | TopBar 로그아웃 버튼 (`web/src/app/wrapper/mobile/parts/TopBar.jsx`) | ✅ (TopBar 만), parts/Header 는 dead | (none) | (none) |
| GET | `/notices` | `fetchGetNotices` (`web/src/domains/notices/store/public/api.js:4`) | `requestGetNoticeList` (`web/src/domains/notices/store/public/thunks.js:5`) | `useNoticeList` (`web/src/domains/notices/mobile/hooks/useNoticeList.js:11`), `useNoticeDetail` (`useNoticeDetail.js:10`) | `/notices`, `/notice/:id`, `/` (HomeScreen NoticeSection) | ✅ | (none) | `{ data: [{ id, title, summary, source: "INTERNAL"|"OFFICIAL", isVisible, isPinned, publishedAt, ... }] }` |
| GET | `/coupons` | `fetchGetUserCoupon` (`web/src/domains/coupons/store/public/api.js:4`) | `requestGetUserCouponList` (`web/src/domains/coupons/store/public/thunks.js:5`) | `useCouponList` (`web/src/domains/coupons/mobile/hooks/useCouponList.js:11`) | `/coupons`, `/` (HomeScreen 최신쿠폰) | ✅ | (none) | `{ data: [{ id, visible, expireAt, ... }] }` |
| GET | `/events/external` | `fetchGetUserExternalEvent` (`web/src/domains/events/store/public/api.js:4`) | `requestGetExternalEventList` (`web/src/domains/events/store/public/thunks.js:5`) | `useEventList` (`web/src/domains/events/mobile/hooks/useEventList.js:12`) | `/events`, `/` (HomeScreen 진행 중 이벤트) | ✅ | (none) | `{ data: [{ id, visible, expireAt, ... }] }` |
| GET | `/community/boards` | `fetchGetUserBoardLists` (`web/src/domains/community/store/api.js:59`) | `requestGetUserBoardLists` (`web/src/domains/community/store/thunks/userThunks.js:5`) | `useUserBoards` (`web/src/domains/community/feature/hooks/user/board/useUserBoards.js:10`) | (구 PC) `UserCommunityPage` — 라우트 미등록, 트래픽 0 | ⚠️ feature 레거시, 라우트 비등록 | (none) | `{ items: [...] }` |
| GET | `/community/board/{boardId}/posts` | `fetchGetUserPostListsByBoardId` (`api.js:64`) | `requestGetUserPostListsByBoardId` (`userThunks.js:17`) | `useUserPost` (`web/src/domains/community/feature/hooks/user/post/useUserPost.js:13`) | (구 PC) `UserCommunityPage` | ⚠️ feature 레거시 | `boardId: number` (path) | `{ items: [...] }` |
| GET | `/quiz-answers/latest` | `fetchLatestQuizAnswer` (`web/src/domains/quiz/store/public/api.js:4`) | `requestLatestQuizAnswer` (`web/src/domains/quiz/store/public/thunks.js:4`) | (없음 — dispatch 호출처 0건) | (없음) | ❌ 정의만 — 미사용 | (none) | (확정 안됨) |
| GET | `/skills/{playerType}` | `fetchPlayerSkillSet` (`web/src/domains/dictionary/store/api.js:8`) | `requestPlayerSkillSet` (`web/src/domains/dictionary/store/thunks.js:7`) | `usePitcherSkillChange`, `useHitterSkillChange`, `PlayerDictionaryView` 직접 dispatch | (구 PC) `/dictionary/{pitcher,hitter}`, `/simulate/{pitcher,hitter}` — 모두 라우트 주석 | ⚠️ legacy PC 만, 운영 미사용 | `playerType: "HITTER"|"PITCHER"` | (확정 안됨, sessionStorage 캐싱) |
| GET | `/player/{playerType}` | `fetchPlayerCardInfo` (`web/src/domains/simulate/store/api.js:8`) | `requestPlayerCardInfo` (`web/src/domains/simulate/store/thunks.js:28`) | `usePlayerCardData` (`web/src/domains/simulate/feature/hooks/usePlayerCardData.js:14`) | (구 PC) `/simulate/{pitcher,hitter}` | ⚠️ legacy PC 만 | `playerType` | (확정 안됨) |
| GET | `/skills/score-config` | `fetchSkillScoreConfig` (`api.js:18`) | `requestSkillScoreConfig` (`thunks.js:7`) | `useSkillScoreConfig` (`useSkillScoreConfig.js:15`) | (구 PC) `/simulate/{pitcher,hitter}` | ⚠️ legacy PC 만 | (none) | (확정 안됨) |
| GET | `/kbo/matches/today` | `fetchTodayMatches` (`web/src/domains/kbo/store/public/api.js:5`) | `requestGetTodayMatches` (`web/src/domains/kbo/store/public/thunks.js:5`) | `useTodayMatches` (`web/src/domains/kbo/feature/public/hooks/useTodayMatches.js:13`) | (구 PC) `/kbo` — 라우트 주석 | ⚠️ legacy PC 만 | (none) | (확정 안됨) |
| GET | `/kbo/matches/{matchId}` | `fetchMatchDetail` (`api.js:10`) | `requestGetMatchDetail` (`thunks.js:16`) | (없음 — dispatch 호출처 0건) | (없음) | ❌ 정의만 — 미사용 | `matchId: number` | (확정 안됨) |

## Admin

| METHOD | PATH | 호출 fetcher | thunk | hook / 호출처 | 트리거 화면 | Live? | 요청 shape | 응답 기대 shape |
|---|---|---|---|---|---|---|---|---|
| GET | `/admin/notices` | `fetchAdminGetNoticeList` (`web/src/domains/notices/store/admin/api.js:4`) | `requestAdminGetNoticeList` (`web/src/domains/notices/store/admin/thunks.js:10`) | (어드민 hook 추정 — 본 분석에서 직접 dispatch 위치 미식별) | `/admin/content/notice` | ✅ | (none) | `{ data: [...] }` |
| POST | `/admin/notices` | `fetchAdminInsertNotice` (`api.js:5`) | `requestAdminInsertNotice` (`thunks.js:22`) | (어드민 hook) | `/admin/content/notice` | ✅ | notice object | `{ data: { id, ... } }` |
| PATCH | `/admin/notices` | `fetchAdminUpdateNotice` (`api.js:6`) | `requestAdminUpdateNotice` (`thunks.js:34`) | (어드민 hook) | `/admin/content/notice` | ✅ | notice object | `{ data: { id, ... } }` |
| PATCH | `/admin/notices/visible` | `fetchAdminUpdateVisible` (`api.js:7`) | `requestAdminUpdateNoticeVisible` (`thunks.js:46`) | (어드민 hook) | `/admin/content/notice` | ✅ | `{ id, visible }` | `{ data: { id, isVisible } }` |
| GET | `/admin/coupons` | `fetchAdminCouponList` (`web/src/domains/coupons/store/admin/api.js:9`) | `requestGetAdminCouponList` (`web/src/domains/coupons/store/admin/thunks.js:9`) | (어드민 hook) | `/admin/content/coupon` ★주석 (라우트 미등록) | ⚠️ admin 라우트 주석, 코드는 살아있음 | (none) | `{ items: [...] }` |
| POST | `/admin/coupons` | `fetchAdminInsertCoupon` (`api.js:13`) | `requestAdminInsertNewCoupon` (`thunks.js:21`) | (어드민 hook) | (admin coupon, 라우트 미등록) | ⚠️ | coupon | `{ id, ...options }` |
| PATCH | `/admin/coupons/{id}` | `fetchAdminUpdateCoupon` (`api.js:17`) | `requestAdminUpdateCoupon` (`thunks.js:37`) | (어드민 hook) | (admin coupon) | ⚠️ | `{ id, ...coupon }` | `{ id, ...options }` |
| PATCH | `/admin/coupons/{id}/visible` | `fetchAdminUpdateVisible` (`api.js:21`) | `requestAdminUpdateCouponVisible` (`thunks.js:53`) | (어드민 hook) | (admin coupon) | ⚠️ | `{ id, visible }` | `{ id, ...options }` |
| GET | `/admin/events/external` | `fetchAdminExEventList` (`web/src/domains/events/store/admin/api.js:9`) | `requestAdminGetExEventList` (`web/src/domains/events/store/admin/thunks.js:11`) | (어드민 hook) | `/admin/content/event` ★주석 | ⚠️ admin 라우트 주석 | (none) | `{ items: [...] }` |
| POST | `/admin/events` | `fetchAdminInsertExEvent` (`api.js:14`) | `requestAdminInsertNewExEvent` (`thunks.js:23`) | (어드민 hook) | (admin event) | ⚠️ | event (after `baseEventDTO`) | `{ id, ...options }` |
| PATCH | `/admin/events/{id}` | `fetchAdminUpdateExEvent` (`api.js:18`) | `requestAdminUpdateExEvent` (`thunks.js:38`) | (어드민 hook) | (admin event) | ⚠️ | `{ id, ...event }` | `{ id, ...options }` |
| PATCH | `/admin/events/{id}/visible` | `fetchAdminUpdateExVisible` (`api.js:22`) | `requestAdminUpdateExEventVisible` (`thunks.js:53`) | (어드민 hook) | (admin event) | ⚠️ | `{ id, visible }` | `{ id, ...options }` |
| POST | `/upload/events` | `fetchUploadEventImageFile` (`api.js:26`) | (`requestAdminUploadEventImage` wraps `requestUploadImage`) (`thunks.js:67`) | (어드민 form hook) | (admin event/quiz) | ⚠️ | FormData (`file`) | (확정 안됨) |
| POST | `/upload/{directory}` (generic) | `fetchAdminUploadImageFile` (`web/src/infra/uploads/store/api.js:3`) | `requestUploadImage` (`web/src/infra/uploads/store/thunks.js:5`) | `useQuizForm` (`web/src/domains/quiz/feature/admin/hooks/useQuizForm.js:31`), event admin thunk wrapper | admin quiz/event 폼 | ✅ (admin 진입 시) | FormData + path | `{ url, ... }` (추정) |
| GET | `/admin/quiz-answers` | `fetchAdminQuizAll` (`web/src/domains/quiz/store/admin/api.js:5`) | `requestAdminQuizAll` (`web/src/domains/quiz/store/admin/thunks.js:12`) | `useAdminQuizTable` (`web/src/domains/quiz/feature/admin/hooks/useAdminQuizTable.js:11`) | `/admin/content/quiz` | ✅ | (none) | `{ items: [...] }` |
| POST | `/admin/quiz-answers` | `fetchAdminQuizCreate` (`api.js:10`) | `requestAdminQuizCreate` (`thunks.js:24`) | (admin quiz form hook) | `/admin/content/quiz` | ✅ | `baseQuizAnswerDTO(quiz)` | `{ id, ...options }` |
| PATCH | `/admin/quiz-answers/{id}` | `fetchAdminQuizUpdate` (`api.js:14`) | `requestAdminQuizUpdate` (`thunks.js:36`) | (admin quiz) | `/admin/content/quiz` | ✅ | `{ id, ...quiz }` | `{ id, ...options }` |
| PATCH | `/admin/quiz-answers/{id}/visible` | `fetchAdminQuizUpdateVisible` (`api.js:19`) | `requestAdminQuizUpdateVisible` (`thunks.js:48`) | `useAdminQuizTable` via `VisibleToggleHandler` | `/admin/content/quiz` | ✅ | `{ id, visible }` | `{ id, ...options }` |
| GET | `/admin/player/teams` | `fetchAdminTeamList` (`web/src/domains/playerCard/store/admin/api.js:9`) | `requestAdminPlayerCardTeamLists` (`web/src/domains/playerCard/store/admin/thunks.js:5`) | `useAdminPlayerMeta` (`useAdminPlayerMeta.js:17`), `useAdminPlayerForm` (`useAdminPlayerForm.js:52`) | `/admin/content/player` | ✅ | (none) | `{ items: [...] }` |
| GET | `/community/admin/boards` | `fetchGetAllBoardLists` (`web/src/domains/community/store/api.js:9`) | `requestGetAllBoardLists` (`web/src/domains/community/store/thunks/boardThunks.js:8`) | `useBoards` (`web/src/domains/community/feature/hooks/admin/board/useBoards.js:11`) | `/admin/community` | ✅ | (none) | `{ items: [...] }` |
| POST | `/community/admin/boards` | `fetchInsertNewBoard` (`api.js:14`) | `requestInsertNewBoard` (`boardThunks.js:20`) | `useBoardCreate` (`useBoardCreate.js:22`) | `/admin/community` | ✅ | `createBoardDTO(form)` | `{ id, ...options }` |
| PATCH | `/community/admin/boards/{id}` | `fetchUpdateBoard` (`api.js:19`) | `requestUpdateNewBoard` (`boardThunks.js:35`) | `useBoardEdit` (`useBoardEdit.js:22`) | `/admin/community` | ✅ | board | `{ id, ...options }` |
| GET | `/community/admin/posts` | `fetchGetAllPostLists` (`api.js:25`) | `requestGetAllPostLists` (`postThunks.js:5`) | `usePosts` (`usePosts.js:10`) | `/admin/community` | ✅ | (none) | `{ items: [...] }` |
| POST | `/community/admin/posts` | `fetchInsertNewPost` (`api.js:30`) | `requestInsertNewPost` (`postThunks.js:16`) | `usePostCreate` (`usePostCreate.js:24`) | `/admin/community` | ✅ | `{ ...form, authorId, authorType, authorName }` | `{ id, ...options }` |
| PATCH | `/community/admin/posts/{id}` | `fetchUpdatePost` (`api.js:35`) | `requestUpdateNewPost` (`postThunks.js:42`) | `usePostEdit` (`usePostEdit.js:27`) | `/admin/community` | ✅ | post | `{ id, ...options }` |
| GET | `/community/admin/tags` | `fetchGetAllTags` (`api.js:40`) | `requestGetAllTagLists` (`tagThunks.js:8`) | `useTag` (`useTag.js:11`) | `/admin/community` | ✅ | (none) | `{ items: [...] }` |
| POST | `/community/admin/tags` | `fetchInsertNewTag` (`api.js:45`) | `requestInsertNewTag` (`tagThunks.js:19`) | `useTagCreate` (`useTagCreate.js:19`) | `/admin/community` | ✅ | tag form | `{ id, ...options }` |
| PATCH | `/community/admin/tags/{id}` | `fetchUpdateTag` (`api.js:50`) | `requestUpdateNewTag` (`tagThunks.js:42`) | `useTagEdit` (`useTagEdit.js:19`) | `/admin/community` | ✅ | tag | `{ id, ...options }` |

## 호출 미연결 endpoint (정의만 존재)

| METHOD | PATH | 정의 위치 | 비고 |
|---|---|---|---|
| GET | `/quiz-answers/latest` | `web/src/domains/quiz/store/public/endpoints.js:2` | thunk `requestLatestQuizAnswer` 는 정의돼 있으나 dispatch 호출처 0건. HomeScreen QuizSection 은 prop `quiz=null` 만 받고 fetch 안 함 |
| GET | `/kbo/matches/{matchId}` | `web/src/domains/kbo/store/public/endpoints.js:3` | thunk 정의만, dispatch 호출처 0건. KBO 라우트 자체가 주석 처리 |

## 코멘트 처리 (전부 dead) — 운영 호출 없음

- `web/src/domains/admin/store/api.js` 전체 (events 관련 fetch, 모두 주석)
- `web/src/domains/admin/store/endpoints.js` 전체 (구 events endpoint, 모두 주석)
- `web/src/domains/admin/store/thunks.js` 전체 (구 events thunk, 모두 주석)
- `endpoints.js` 의 `*_ACTIONS` 상수 일부 (예: `USER_COMMUNITY_ACTIONS.UPDATE_BOARD: "/community/boards/${id}"` — `${id}` 가 literal 문자로 박혀있음, 사용처 없음 — community/store/endpoints.js:19,23,49 등)

## 핵심 관찰

1. **HomeScreen 은 부분 BE 연결 + 부분 mock**:
   - 연결됨: notices (`useNoticeList`), coupons (`useCouponList`), events (`useEventList`)
   - mock-only: quiz (`MOCK_QUIZ`), 커뮤니티 인기글 (`MOCK_POSTS`), 자유게시판 (`MOCK_TEAM_POSTS`)
   - QuizSection 은 props `quiz=null` 받으나 호출처에서 안 넘겨줌 → 항상 빈 카드. `requestLatestQuizAnswer` thunk 가 있는데도 미연결 = **연결 누락 버그 의심** (reconciler 확인 요)
2. **community 모바일 화면은 100% mock**: `useCommunity` / `useCategoryFeed` 둘 다 `@/data/community/*` 만 import, redux store/thunks 와 분리됨. community store 의 user thunks (`requestGetUserBoardLists`, `requestGetUserPostListsByBoardId`) 는 PC 레거시 (`UserCommunityPage`) 에서만 호출
3. **historyMode 화면은 100% mock**: `@/data/historyMode/{LegendMeta,LegendStuff}.js` 정적 import. BE 연동 thunk 없음
4. **admin 영역 thunk 대부분 살아있음**: notice/community/quiz/playerCard/upload 는 라우트 등록 + 코드 살아있음. coupon/event admin thunk/api 는 코드는 살아있고 라우트만 주석 처리 (Owner 확정: 디자인 미진행 상태)
5. **legacy PC thunk 살아있음**: dictionary/simulate/kbo 는 라우트 주석이지만 thunk 가 store 에 등록돼 있음 → 번들에 포함됨
6. **community endpoint 구조 혼란**: 같은 path 가 `ADMIN_COMMUNITY` (라우팅 형식) vs `ADMIN_COMMUNITY_ACTIONS` (thunk type 식별자) 두 개로 분기. action 식별자가 path 와 똑같이 생겨서 헷갈림 (`endpoints.js` 전체)

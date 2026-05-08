# 상태관리 + 데이터 (mock 포함)

## 상태관리 entry

- 라이브러리: `@reduxjs/toolkit ^2.11.0` + `react-redux ^9.2.0` + `redux-thunk ^3.1.0` (createAsyncThunk 기반)
- 단일 store: `web/src/app/store/store.js` — `configureStore({ reducer })`
- 통합 미들웨어: `operationListener` (`web/src/app/store/operation/operationListener.js`) — thunk `payload.options` 가 있는 fulfilled/rejected 액션을 **공통 모달 신호**로 전환 → `operation.lastOperation` 슬라이스에 저장 (`web/src/app/store/operation/slices.jsx`). `ResponseListener` (`web/src/app/page/commonModal/ResponseListener.jsx`) 가 이를 읽어 토스트/모달 출력 (어드민용)
- API client: `axios` instance @ `web/src/app/store/APIConfig.js` — baseURL `http://localhost:8080/api` (하드코딩, 주석된 `window.__CONFIG__.API_BASE_URL` 미적용)
- 추가 캐싱 레이어:
  - `sessionStorage` + AES (`web/src/global/utils/crypto/storageCrypto.js`) — dictionary/simulate thunks 가 응답 캐싱 (`skill-v2-{type}`, `skill-score-config`, `info-{type}`)

## 등록된 reducer (`web/src/app/store/store.js:16`)

| key | slice 파일 | 비고 |
|---|---|---|
| `operation` | `web/src/app/store/operation/slices.jsx` | 공통 모달 신호 |
| `dictionary` | `web/src/domains/dictionary/store/slices.js` | legacy PC, 라우트 주석 |
| `simulate` | `web/src/domains/simulate/store/slices.js` | legacy PC, 라우트 주석 |
| `auth` | `web/src/domains/authentication/store/slices.js` | 인프라 |
| `events` | `web/src/domains/events/store/slices.js` | live |
| `coupon` | `web/src/domains/coupons/store/slices.js` | live |
| `community` | `web/src/domains/community/store/slices.js` | admin live, user mobile 은 Redux 미사용 (mock-only) |
| `playerCard` | `web/src/domains/playerCard/store/slices.js` | admin live |
| `quiz` | `web/src/domains/quiz/store/slices.js` | admin live, public thunk 미연결 |
| `kbo` | `web/src/domains/kbo/store/slices.js` | legacy PC, 라우트 주석 |
| `notices` | `web/src/domains/notices/store/slices.js` | live |
| `upload` | `web/src/infra/uploads/store/slices.js` | image upload (event/quiz admin 사용) |

> **profile / authority** 슬라이스 별도 없음. `state.auth` 를 통해 user + authority 사용.
> `UserProfile.jsx` 가 `state.auth.authority` 참조하는데 (`web/src/domains/profile/page/UserProfile.jsx:7`) **slices 의 `setUser` 는 `userDetail`, `userRole` 만 채움** (`web/src/domains/authentication/store/slices.js:14-19`) — `authority` 누락. **state shape 불일치 의심** (reconciler 확인 요)

## React Provider 트리 (`web/src/app/provider/AppProvider.jsx`)

```
<Provider store={store}>
  <ResponseListener />          # 공통 모달
  <AuthProvider>                # 부팅 시 healthCheck → state.auth.initialized
    {children = RouterProvider}
  </AuthProvider>
</Provider>
```

추가:
- `<TopBarProvider>` — `MobileLayout` 내부 (`web/src/app/wrapper/mobile/MobileLayout.jsx:63`) — page-level TopBar variant 제어 (`useSetTopBar`, `useTopBar`)

## thunk → slice 매핑 (요약)

| 도메인 | thunk 정의 위치 | 호출 hook (트리거) |
|---|---|---|
| auth | `domains/authentication/store/thunks.js` | `AuthProvider`, `AuthCallback`, `useAuthentication` |
| events.public | `domains/events/store/public/thunks.js` | `useEventList` (`/events`, `/`) |
| events.admin | `domains/events/store/admin/thunks.js` | (admin event hook — admin 라우트 주석으로 미진입) |
| coupons.public | `domains/coupons/store/public/thunks.js` | `useCouponList` (`/coupons`, `/`) |
| coupons.admin | `domains/coupons/store/admin/thunks.js` | (admin coupon hook — admin 라우트 주석) |
| notices.public | `domains/notices/store/public/thunks.js` | `useNoticeList`, `useNoticeDetail` |
| notices.admin | `domains/notices/store/admin/thunks.js` | (admin notice hook — `/admin/content/notice`) |
| community.admin (board/post/tag) | `domains/community/store/thunks/{board,post,tag}Thunks.js` | `useBoards/useBoardCreate/useBoardEdit`, `usePosts/usePostCreate/usePostEdit`, `useTag/useTagCreate/useTagEdit` (`/admin/community`) |
| community.user | `domains/community/store/thunks/userThunks.js` | `useUserBoards`, `useUserPost` (PC `UserCommunityPage` — 라우트 미등록) |
| quiz.public | `domains/quiz/store/public/thunks.js` | **dispatch 호출처 없음 — 미사용** |
| quiz.admin | `domains/quiz/store/admin/thunks.js` | `useAdminQuizTable`, `useQuizForm` (`/admin/content/quiz`) |
| playerCard.admin | `domains/playerCard/store/admin/thunks.js` | `useAdminPlayerMeta`, `useAdminPlayerForm` (`/admin/content/player`) |
| dictionary | `domains/dictionary/store/thunks.js` | legacy PC simulate hook 들 |
| simulate | `domains/simulate/store/thunks.js` | legacy PC simulate hook 들 |
| kbo.public | `domains/kbo/store/public/thunks.js` | `useTodayMatches` (legacy `/kbo`, 주석) — `requestGetMatchDetail` 은 dispatch 0건 |
| upload | `infra/uploads/store/thunks.js` | `useQuizForm`, `requestAdminUploadEventImage` (admin) |

## mock 데이터 위치 (전수)

| 파일 | 사용처 | 비고 |
|---|---|---|
| `web/src/data/community/categories.js` | `web/src/domains/community/mobile/hooks/useCommunity.js:3` | community 모바일 — categories chip |
| `web/src/data/community/notices.js` | `useCommunity.js:4`, `useCategoryFeed.js:3` | community 모바일 — 공지 |
| `web/src/data/community/hotPosts.js` | `useCommunity.js:5`, `useCategoryFeed.js:2` | community 모바일 — 인기 급상승 |
| `web/src/data/community/posts.js` | `useCommunity.js:6`, `useCategoryFeed.js:4` | community 모바일 — 게시글 |
| `web/src/data/historyMode/LegendMeta.js` | `web/src/domains/historyMode/mobile/hooks/useHistoryMode.js:4` | historyMode — 레전드 메타 |
| `web/src/data/historyMode/LegendStuff.js` | `useHistoryMode.js:3` | historyMode — 재료 |
| `web/src/data/skill/HITTER_POINTS.js` | (legacy simulate/dictionary 의 score 계산용 추정) | C — 라우트 주석 도메인이 사용 |
| `web/src/data/skill/HITTER_RECOMMEND.js` | (legacy) | C |
| `web/src/data/skill/HITTER_SKILLS.js` | (legacy) | C |
| `web/src/data/skill/PITCHER_RECOMMEND.js` | (legacy) | C |
| `web/src/data/skill/pitcherComboPresets.js` | (legacy) | C |
| `web/src/data/skill/pitcherPositionScore.js` | (legacy) | C |
| `web/src/data/skill/pitcherSkillMeta.js` | (legacy) | C |
| `web/src/data/CafeNotice.js` | **import 0건 (dead)** | dead-suspects A |
| `web/src/data/FunNotice.js` | **import 0건 (dead)** | dead-suspects A |
| `web/src/data/HistoryMode.js` | **import 0건 (dead)** | dead-suspects A — 같은 이름 폴더와 무관 |
| `web/src/domains/home/config/MOCK_POSTS.js` | `web/src/domains/home/components/HomeScreen.jsx:12` | home — 커뮤니티 인기글 미리보기 |
| `web/src/domains/home/config/MOCK_TEAM_POSTS.js` | `HomeScreen.jsx:9` | home — 자유게시판 미리보기 |
| `web/src/domains/home/config/MOCK_QUIZ.js` | `HomeScreen.jsx:8` | home — 퀴즈 회차/제목 (image 는 prop=null 로 빈카드만) |
| `web/src/domains/home/config/QUICK_MENUS.js` | `web/src/domains/home/components/section/quick/QuickSection.jsx:4` | home — 빠른 메뉴 (config성, mock 아님) |

## ★ mock-only 화면 (BE 미연동 — 핵심 신호)

> 정의: 화면이 표시하는 **데이터 전체** 가 정적 import (또는 prop 미공급) 인 경우. (HomeScreen 같이 일부만 mock 인 경우는 별도 표시)

| 화면 | 라우트 | 사용 mock | redux thunk 사용 여부 |
|---|---|---|---|
| `CommunityScreen` (`web/src/domains/community/mobile/CommunityScreen.jsx`) | `/community` (전체 탭) | `data/community/{categories, notices, hotPosts, posts}.js` | ❌ — community store 와 완전히 분리 (admin 만 store 사용) |
| `CategoryScreen` (`web/src/domains/community/mobile/CategoryScreen.jsx`) | `/community?category=...` | 위와 동일 (`useCategoryFeed`) | ❌ |
| `HistoryModeScreen` (`web/src/domains/historyMode/mobile/HistoryModeScreen.jsx`) | `/mode/history` | `data/historyMode/{LegendMeta,LegendStuff}.js` | ❌ — historyMode 슬라이스 자체가 store 에 없음 |

## ★ 부분 mock 화면 (BE 일부 연결)

| 화면 | 연결됨 (live) | 연결 안 됨 (mock) | 비고 |
|---|---|---|---|
| `HomeScreen` (`web/src/domains/home/components/HomeScreen.jsx`) | NoticeSection (notices), CouponListHorizontal (coupons), EventListHorizontal (events) | QuizSection (`MOCK_QUIZ` 회차만, 이미지 없음), 커뮤니티 인기글 (`MOCK_POSTS`), 자유게시판 (`MOCK_TEAM_POSTS`) | `requestLatestQuizAnswer` thunk 가 정의돼 있는데 dispatch 누락 — reconciler 확인 |

## ★ 100% live (BE 연결, mock 없음)

- `/coupons` (`CouponScreen`)
- `/events` (`EventScreen`)
- `/notices` (`NoticeScreen`)
- `/notice/:id` (`NoticeDetailScreen`)
- `/auth/callback` (`AuthCallback` — 인프라)
- `/mypage` (`UserProfile` — auth state 만 사용)
- `/admin/**` (모든 어드민 페이지)

## 정적 이미지 / asset

`web/src/assets/{dictionary, legend, new, quiz}/` — 정적 이미지 모음. `MOCK_*` 데이터에서 imageUrl 로 참조 추정. (이번 분석에서 사용처 일일이 매핑하지 않음)

## 핵심 위험 신호

1. **community 모바일 화면이 redux 와 완전 분리됨** — `domains/community/store/thunks/userThunks.js` 의 `requestGetUserBoardLists`, `requestGetUserPostListsByBoardId` 는 PC 레거시 `UserCommunityPage` 만 호출. 모바일 `CommunityScreen` 은 `data/community/*.js` 정적 mock 만 사용. **BE 연결 작업이 다음 마일스톤** (CommunityScreen.jsx:111 의 TODO 와 useCategoryFeed.js:8 의 TODO 가 자기-신고)
2. **HomeScreen 의 quiz 연결 누락** — `requestLatestQuizAnswer` thunk 정의 + slice 핸들러 까지 다 있는데 dispatch 가 없음. QuizSection 은 prop `quiz=null` 받고 빈 카드 렌더 → 의도된 건지 누락인지 reconciler 확인 필요
3. **`state.auth` shape 불일치 의심** — slice 는 `{ user, userRole, initialized }` 만 정의 (`authentication/store/slices.js:4-8`), 하지만 `UserProfile.jsx:7`, `useAuthentication.js:14`, `useHeaderAuth.js:7` 가 `state.auth.authority` 참조. setter (`setUser`) 에 들어오는 payload key 가 `useRole` (오타?) 인 점도 수상 (`slices.js:15-17`)
4. **APIConfig baseURL 하드코딩** — 프로덕션 url 분기 주석 처리 (`web/src/app/store/APIConfig.js:3-4`). 빌드 시 동적 변경 안 됨. 정작 `web/public/runtime-config.js` 라는 파일이 public 에 존재 → window.__CONFIG__ 패턴 의도가 있었던 것으로 보임
5. **mock-only 화면 3개** (CommunityScreen, CategoryScreen, HistoryModeScreen) — figma-spec-validator / reconciler 가 BE schema 와 정합성을 **현재로서는 검증할 base 가 없음** (FE 가 mock 만 보는 중)

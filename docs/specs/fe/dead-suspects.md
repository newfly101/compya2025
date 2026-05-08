# 미사용 의심 (Dead 후보)

> 근거 분류:
> - **A** = grep 결과 import 0건 (확정 dead)
> - **B** = 라우트 미등록 + 호출 hook 도 0건 (운영 미사용)
> - **C** = 라우트 주석 처리 (Owner 확정: legacy PC, 운영 미사용. **삭제 금지**, 기능 참고용 잔존)
> - **D** = 정의만 있고 dispatch 호출처 0건 (thunk leak)
> - **E** = 코드는 살아있으나 명확히 중복/대체된 구버전

## A. import 0건 (확정 dead)

| 파일/폴더 | 비고 |
|---|---|
| `web/src/domains/mobile/` (전체 폴더) | `MobileHomePage.jsx` 는 placeholder ("어????????????" 만 출력). `domains/mobile/components/*` 는 import 0건. **Owner 확정: 폐기 또는 흡수 결정 필요**. 후보 components: tipCard, sectionHeader, quickNav, eventCard, pageLayout, communityItem, noticeItem, fulleventcard |
| `web/src/app/wrapper/parts/Header.jsx`, `Footer.jsx` | 어디서도 import 안 함 (현재 layout 은 `wrapper/mobile/parts/{TopBar,Drawer}.jsx` 사용) |
| `web/src/app/wrapper/parts/Header.module.scss`, `Footer.module.scss` | 위 jsx 와 같이 dead |
| `web/src/app/wrapper/parts/hooks/useHeaderAuth.js` | `Header.jsx` 만 사용 → dead 체인 |
| `web/src/app/wrapper/parts/hooks/useHeaderNav.js` | `Header.jsx` 만 사용 → dead 체인 |
| `web/src/app/wrapper/parts/hooks/useHeaderUI.js` | `Header.jsx` 만 사용 → dead 체인 |
| `web/src/shared/hooks/useScrollLock.js` | export 만 있고 import 0건. `web/src/shared/` 폴더 자체가 거의 빈 폴더 |
| `web/src/global/layout/callBack/AuthCallBack.jsx` | 라우트 주석 처리된 lazy import 에서만 참조됨 (`PublicRoutes.jsx:20` 의 `AuthCallBack` lazy import 자체가 활성 라우트 외 미사용). 활성 라우트는 `domains/authentication/callback/AuthCallBack.jsx` 사용 → 중복 |
| `web/src/data/CafeNotice.js` | import 0건 |
| `web/src/data/FunNotice.js` | import 0건 |
| `web/src/data/HistoryMode.js` | import 0건 (실제 사용 데이터는 `data/historyMode/{LegendMeta,LegendStuff}.js`) |
| `web/src/core/filters/CoreVisibleFilter.jsx` (`createVisibleFilterUnit`) | `core/filters/index.js` 의 re-export 만, 외부 import 0건 |
| `web/src/core/filters/CoreStatusFilter.jsx` (`createStatusFilterUnit`) | 외부 import 0건 |

## B. 라우트 미등록 + dispatch 0건 (운영 미사용)

| 컴포넌트/모듈 | 위치 | 상태 |
|---|---|---|
| `UserCommunityPage` 진입의 `feature/components/user/CommunityPage.jsx` 트리 전체 | `web/src/domains/community/feature/components/user/{CommunityPage.jsx, BoardTabs.jsx, board/CommunityUserBoardTabs.jsx, post/{pc,mobile}/PostUserTable*.jsx}` | 라우트 주석. user thunks (`requestGetUserBoardLists`, `requestGetUserPostListsByBoardId`) 도 이쪽에서만 사용 → 라우트 등록되면 다시 살릴 수 있는 코드 (Owner 확정: PC 기능 참고용 잔존) |
| `useUserBoards`, `useUserPost`, `usePostUserFilter` | `web/src/domains/community/feature/hooks/user/**` | 위 PC `CommunityPage` 만 사용 → 라우트 미등록 시 dead chain |

## C. 라우트 주석 처리 (Owner 확정: 코드 잔존, 운영 미사용 — 삭제 금지)

| 도메인 / 컴포넌트 | 위치 | 비고 |
|---|---|---|
| **simulate 전체** | `web/src/domains/simulate/{page/SkillSimulator.jsx, page/skillChange/{Pitcher,Hitter}SkillChange.jsx, feature/components/**, feature/hooks/{usePlayerCardData,useSkillScoreConfig,usePitcherSkillChange,useHitterSkillChange,useSkillScoreResult}.js, store/**}` | thunk 가 store 에 등록돼 번들 포함됨 |
| **dictionary 전체** | `web/src/domains/dictionary/{page/{DictionaryHomePage,DictionaryPage}.jsx, feature/components/**, feature/hooks/**, feature/config/**, store/**}` | 동일 |
| **kbo 전체** | `web/src/domains/kbo/{feature/public/pages/KBOLeaguePage.jsx, feature/public/components/**, feature/public/hooks/useTodayMatches.js, store/**, config/**}` | 동일 |
| `web/src/app/page/notice/NoticeLayout.jsx` | 구 `notice` 중첩 라우트의 layout. 라우트 주석 처리 후 잔존 (MetaHeader 사용) |
| `web/src/app/page/legal/PrivacyPolicy.jsx` | `/privacy` 라우트 주석. 잔존 |
| `web/src/meta/{index.js, hooks/usePageMeta.js, pages/dictionary.meta.js, types.js}` 일부 | `usePageMeta` 는 `MetaHeader` 만 사용, `MetaHeader` 는 dictionary/notice/legacy PC 페이지에서만 사용 → 라우트 주석화 이후 dead 체인 의심 (단 dictionary 파일에서 import 살아있으므로 C 분류 유지) |
| `web/src/global/ui/cafeLinkCard/`, `cardSwiper/`, `navigation/tabNav/`, `navigationCard/` | 모두 simulate/dictionary legacy PC 페이지에서만 사용. 라우트 주석화 이후 dead 체인. **단 코드 참고용 보존 정책 대상**. |

## D. thunk 정의만, dispatch 0건 (thunk leak)

| thunk | 위치 | 의미 |
|---|---|---|
| `requestLatestQuizAnswer` | `web/src/domains/quiz/store/public/thunks.js:4` | HomeScreen 의 `QuizSection` 이 prop `quiz=null` 로만 사용. **호출하는 곳 없음** — 연결 누락 또는 의도된 미연결 (reconciler 확인 필요) |
| `requestGetMatchDetail` | `web/src/domains/kbo/store/public/thunks.js:16` | KBO 라우트 자체가 주석. dispatch 호출처 0건 (분류 C 와 중복) |
| (참고) `requestUploadImage` 자체는 `useQuizForm` 등에서 사용 → live |

## E. 명확한 중복 / 구버전

| 항목 | 상태 |
|---|---|
| `web/src/domains/mobile/home/pages/MobileHomePage.jsx` | placeholder ("어????????????"). 어디에서도 import 안 함. `domains/home/components/HomeScreen.jsx` 가 실제 사용. **삭제 권고** (Owner 확정: 사용처 확인 후 폐기 결정) |
| `web/src/global/layout/callBack/AuthCallBack.jsx` | 활성 path 는 `domains/authentication/callback/AuthCallBack.jsx`. global 쪽은 라우트 주석 처리된 자리에서만 import. 중복 |
| `web/src/domains/admin/store/{api.js, endpoints.js, thunks.js}` | 파일 내용 전체가 주석. events admin 의 구버전. 현재 운영은 `events/store/admin/*` 사용. 파일 자체 dead |
| `web/src/domains/community/store/endpoints.js` 의 `*_ACTIONS` 상수의 일부 (`UPDATE_BOARD: "/community/admin/boards/${id}"`) | `${id}` literal 박힌 path. 사용처 없음 (실제 thunk type identifier 로만 쓰임 — 운영 path 는 함수형 endpoint 사용). 혼란 유발 |
| `web/src/global/handler/applyAsyncHandlers.js` | live (모든 slices 가 사용). 참고: alive |
| `web/src/global/utils/DateFormatt.js`, `parseDate.js` | grep 결과 import 0건 — dead 후보. (확실한 검증은 별도 라운드) |
| `web/src/global/utils/sortCoupons.js` | grep 결과 import 0건 — dead 후보 |

## TODO 주석 (코드 내 자기-신고)

| 위치 | 내용 |
|---|---|
| `web/src/domains/community/mobile/CommunityScreen.jsx:111` | "TODO: 글쓰기 action 연결 필요 (라우트 이동 또는 모달 — 로그인 분기 포함)" |
| `web/src/domains/community/mobile/hooks/useCategoryFeed.js:8` | "TODO: BE 연동 시 카테고리별 API endpoint(또는 fetcher)로 분기. 현재는 정적 mock import." |
| `web/src/domains/community/feature/hooks/user/post/useUserPost.js:18` | "// dispatch(requestInsertNewPost());" (주석 처리된 호출) |

## 우선 정리 권고 (analyzer 의견 — 결정은 reconciler/오너)

1. **A 항목 (import 0건)** 은 즉시 정리 가능 후보. 단 `domains/mobile/` 은 Owner 확정 사항대로 (a) 공용 승격 / (b) 흡수 / (c) 폐기 결정 후 처리
2. **C 항목 (legacy PC)** 은 Owner 정책상 보존. **단 store 등록 (`web/src/app/store/store.js`)** 에서 `dictionaryReducer / simulateReducer / kboReducer` 가 상시 로딩되는 것은 **번들 사이즈 영향**. 별도 라운드에서 동적 import 검토 가치
3. **D 의 `requestLatestQuizAnswer`** 는 **연결 누락 의심**. HomeScreen 의 QuizSection 이 prop 만 받는 구조라 dispatch 누락 — reconciler 가 BE `/quiz-answers/latest` 살아있는지 cite 후 결정
4. **E 의 `domains/admin/store/*`** 는 전체 주석 — 즉시 삭제 가능 후보 (이미 `events/store/admin/*` 으로 대체됨)

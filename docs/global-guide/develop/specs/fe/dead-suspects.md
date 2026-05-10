# Dead 후보 (미사용 의심)

> baseline: `web/src/**` (현 코드, v2.0.0-refactor-mobile)
> 분석 방법: Grep import / dispatch / route 등록 cross-check
> 목적: 코드 정리 시 안전하게 제거 가능한 후보를 사실 baseline 으로 단일 시각화. **즉시 삭제 의무 아님** — 도메인 정리 / 기획 결정 후 정리

---

## 분류

| 등급 | 정의 |
|---|---|
| **A** | import 0건 — 확정 dead. 즉시 삭제 후보 |
| **B** | 라우트 미등록 + dispatch / hook 호출 0건 — 운영 미사용 |
| **C** | 명확히 중복 / 구버전 — 동작은 살아있으나 동일 기능 다른 경로 존재 |
| **D** | thunk 정의만 있고 dispatch 호출 0건 (thunk leak) |
| **E** | legacy PC 트리 잔존 — 폐기 의도 명시. 추후 제거 |
| **F** | 코드 버그성 / 항상 undefined 인 dead 필드 |

---

## A. import 0건 (확정 dead)

| 파일 / 폴더 | 등급 | 비고 |
|---|---|---|
| `web/src/data/skill/HITTER_POINTS.js` | A | dictionary/simulate 폐기 도메인 mock |
| `web/src/data/skill/HITTER_RECOMMEND.js` | A | 동상 |
| `web/src/data/skill/HITTER_SKILLS.js` | A | 동상 |
| `web/src/data/skill/PITCHER_RECOMMEND.js` | A | 동상 |
| `web/src/data/skill/pitcherComboPresets.js` | A | grep 0건 |
| `web/src/data/skill/pitcherPositionScore.js` | A | 동상 |
| `web/src/data/skill/pitcherSkillMeta.js` | A | 동상 |
| `web/src/data/skill/` (폴더 전체) | A | 위 7개 모두 dead → 폴더 자체 제거 후보 |
| `web/src/assets/NAVER_login_btn.png` | A | grep 0건 — 네이버 로그인 버튼은 텍스트 ("N 네이버 로그인") 로 대체. 이미지 파일 미사용 |
| `web/src/assets/new/compyafun2026.jpg` | A | grep 0건 (HeroSection.module.scss 에 url 참조 가능 — ❓ scss 파일 grep 후 추가 확인 권고) |
| `web/src/global/styles/components/composite/` (폴더) | A | 폴더 비어있음 |

> ⚠ `assets/new/compyafun2026.jpg` 는 `HeroSection.module.scss` 에서 background-image 로 참조 가능. SCSS 파일 grep 으로 확인 필요 (현 grep 은 .jsx 만 매칭). 즉시 삭제 전 검증

---

## B. 라우트 미등록 + dispatch / hook 호출 0건

### B-1. community 트리 (IA 보류)

| 항목 | 위치 | 상태 |
|---|---|---|
| `CommunityScreen` / `CategoryScreen` 트리 | `web/src/domains/community/mobile/**` | mobile mock-only 화면. `routePath.js` 에 `community: "/community"` 키만 존재. PublicRoutes 진입 정의는 주석 (`PublicRoutes.jsx:21-22`) |
| community mobile components 6종 (PostRow, HotPostCard, CategoryChip, CommunityBadge, BoardTagBadge, Section) | `web/src/domains/community/mobile/components/**` | CommunityScreen / CategoryScreen 의 sub. 라우트 비활성으로 진입 없음 |
| community mobile hooks 2종 (useCommunity, useCategoryFeed) | `web/src/domains/community/mobile/hooks/**` | 동상 |
| `community.tokens.scss`, `utils.js` (formatCount, getEffectiveBadge) | `web/src/domains/community/mobile/**` | 동상 |
| community mock data (categories, notices, hotPosts, posts) | `web/src/data/community/**.js` | useCommunity / useCategoryFeed 만 import. 라우트 비활성 — chain dead |
| community feature/admin 트리 (CommunityManagePage, BoardAdminTable, PostAdminTable, TagAdminTable, CommentAdminTable, modal/) | `web/src/domains/community/feature/components/admin/**` | admin UI legacy (2026-05-09 폐기). AdminRoutes lazy import 모두 주석 |
| community feature/user 트리 (BoardTabs, board/, post/{pc,mobile}/) | `web/src/domains/community/feature/components/user/**` | legacy PC UserCommunityPage 의 sub. 라우트 비활성 |
| community feature hooks (admin: board/post/tag, user: board/post, internal: useForm) | `web/src/domains/community/feature/hooks/**` | 위 두 트리만 호출. dead chain |
| community page wrapper | `web/src/domains/community/page/{admin,user}/` | `AdminCommunityPage.jsx` 만 잔존 (라우트 미등록). user/ 비어있음 |
| community config | `web/src/domains/community/config/POST_TABLE.js` | feature 트리만 사용 → dead chain |

### B-2. authentication 도메인

| 항목 | 위치 | 상태 |
|---|---|---|
| `web/src/domains/authentication/README.md` | 도메인 README | dead 코드 아님 — 문서. 단 `setUserProperties` 의 GUEST 분기 / useGA4PageView ADMIN 제외 등 README 와 코드 사이 mismatch (`module-conventions.md` §9 참조) |

### B-3. global ui

| 항목 | 위치 | 상태 |
|---|---|---|
| `VisibleToggle` | `web/src/global/ui/visibleToggle/{VisibleToggle.jsx, index.js}` | grep 결과 호출처 0 (자기 파일만). admin UI legacy 폐기로 dead chain. admin 재구현 시 활용 가능 |

---

## C. 명확한 중복 / 구버전

| 항목 | 위치 | 상태 |
|---|---|---|
| community endpoints `*_ACTIONS` 의 `${id}` literal | `web/src/domains/community/store/endpoints.js:18-28, 50-58` | thunk type identifier 로만 쓰임 (`UPDATE_BOARD: "/community/admin/boards/${id}"` 형태). 실 path 는 함수형 endpoint 사용. 혼란 유발 — IA 재개 시 정리 |
| community mock notice ↔ BE notices | `web/src/data/community/notices.js` ↔ `web/src/domains/notices/store/public/*` | community CategoryScreen 의 notice 카테고리는 mock 사용. BE notices 는 별도 도메인. IA 재개 시 통합 결정 |
| `MOCK_POSTS`, `MOCK_TEAM_POSTS` (HomeScreen import) | `web/src/domains/home/config/**` | HomeScreen 의 community 인기글 / 자유게시판 섹션 주석 처리 후 import 라인 (`HomeScreen.jsx:9, 13`) 만 잔존, 실 사용 0. community IA 재개 시 결정 |
| `MOCK_QUIZ` | `web/src/domains/home/config/MOCK_QUIZ.js` | HomeScreen 이 `state.quiz.latest` BE 로 전환 후 import 미연결. fallback 으로 살려둘 가치 ❓ 미정 |
| `toPostRowItem(post)` | `web/src/domains/home/components/HomeScreen.jsx:25-34` | community 인기글/자유게시판 섹션 주석 안에서만 호출 → 함수 자체 dead. community 재개 시 재사용 |
| `HOME_PREVIEW_LIMIT` | `web/src/domains/home/components/HomeScreen.jsx:22` | 동상 (주석 안 사용처만) |

---

## D. thunk 정의만, dispatch 호출 0건 (thunk leak)

| thunk | 위치 | 의미 |
|---|---|---|
| `requestGetAdminCouponList` | `web/src/domains/coupons/store/admin/thunks.js:9` | admin UI 폐기로 호출처 0. store 코드 보존 정책 |
| `requestAdminInsertNewCoupon` | 동 파일:21 | 동상 |
| `requestAdminUpdateCoupon` | 동 파일:37 | 동상 |
| `requestAdminUpdateCouponVisible` | 동 파일:53 | 동상 |
| `requestAdminGetExEventList` | `web/src/domains/events/store/admin/thunks.js:11` | 동상 |
| `requestAdminInsertNewExEvent` | 동 파일:23 | 동상 |
| `requestAdminUpdateExEvent` | 동 파일:38 | 동상 |
| `requestAdminUpdateExEventVisible` | 동 파일:53 | 동상 |
| `requestAdminUploadEventImage` | 동 파일:67 | 동상 |
| `requestAdminGetNoticeList` | `web/src/domains/notices/store/admin/thunks.js:10` | 동상 |
| `requestAdminInsertNotice` | 동 파일:22 | 동상 |
| `requestAdminUpdateNotice` | 동 파일:34 | 동상 |
| `requestAdminUpdateNoticeVisible` | 동 파일:46 | 동상 |
| `requestAdminQuizAll` | `web/src/domains/quiz/store/admin/thunks.js:11` | 동상 |
| `requestAdminQuizCreate` | 동 파일:23 | 동상 |
| `requestAdminQuizUpdate` | 동 파일:35 | 동상 |
| `requestAdminUploadQuizImage` | 동 파일:47 | 동상 |
| `requestUploadImage` | `web/src/infra/api/uploads/thunks.js:5` | 위 events/quiz wrap 만 호출 → 모두 dead chain. infra 코드 보존 |
| community admin/user thunks 11종 (board/post/tag/user) | `web/src/domains/community/store/thunks/**` | community store 가 store.js 미등록 → reducer 0. dispatch 해도 state 변화 없음. 사실상 dead |

> 정책: store 코드는 보존 (admin UI 신규 기획 후 재연결 예정). 다만 store.js 미등록 community 는 등록 누락 — store.js 에 추가하거나 코드 제거 결정 필요

---

## E. legacy PC 잔존

| 항목 | 위치 | 상태 |
|---|---|---|
| community feature 트리 전체 | `web/src/domains/community/feature/**` | PC + admin 양쪽 잔존. mobile 트리(`community/mobile/`) 와 별개. IA 재개 시 모바일 흡수 또는 삭제 |
| community page 트리 | `web/src/domains/community/page/{admin,user}/` | page wrapper. IA 재개 시 결정 |
| `domains/community/config/POST_TABLE.js` | community/config | feature 트리 종속 |

> profile / playerCard / dictionary / simulate / kbo / admin (top-level) — 도메인 폴더 자체가 이미 제거됨 (이전 정리 단계 완료). 라우터에는 lazy import 만 주석으로 잔존

---

## F. 코드 버그 / dead 필드

| 항목 | 위치 | 상태 |
|---|---|---|
| `setUser` reducer 의 `payload.useRole` typo | `web/src/domains/authentication/store/slices.js:15` | thunks 에서 `dispatch(setUser({ userDetail, userRole }))` 호출하나 reducer 가 `useRole` (오타) 로 destructure → `state.userRole` 항상 undefined. AuthGuard 의 ADMIN 라우트 체크가 영구 차단 — admin UI 폐기 상태라 운영 영향 없음 |
| `useAuthentication` 의 `authority` destructure | `web/src/domains/authentication/hooks/useAuthentication.js:14` | slice 에 `authority` 필드 없음 (`userRole` 만) → 항상 undefined. return value `authority` 사용처 0 |
| `PublicRoutes.jsx:19` `handle: ROUTE_META.NOTICE_DETAILS` | `web/src/app/router/routes/PublicRoutes.jsx:19` | 다른 라우트는 `handle: ROUTE_META.X.title` 로 title 만 전달. NOTICE_DETAILS 는 객체 통째로 전달 → `useGA4PageView` 의 `current.handle.title` 가 함수 (`title: noticeTitle => ...`) 로 잡힘. 다행히 함수 분기에서 early return 처리 (NoticeDetailScreen 이 직접 document.title + page_view 발행) — 동작은 정상이나 다른 라우트와 패턴 일관성 깨짐 |
| `requestUploadImage` 의 `console.log` 남김 | `web/src/infra/api/uploads/thunks.js:13` | 운영 console pollution |
| `useUserBoards.js` 의 `console.log` | `web/src/domains/community/feature/hooks/user/board/useUserBoards.js` (dead chain) | 동상 |
| `requestAdminQuizUploadImage` directory `"events"` | `web/src/domains/quiz/store/admin/thunks.js:48` | quiz 이미지를 events 디렉토리로 업로드 — copy-paste 버그. dispatch 0건이라 운영 영향 없으나 admin 재연결 전 수정 필요 |
| `community.utils.js` (`getEffectiveBadge` 등) | `web/src/domains/community/mobile/utils.js` | community mobile chain dead 로 자동 dead |

---

## 정리 권고 우선순위

| 우선순위 | 액션 |
|---|---|
| 1 | **A 등급 즉시 삭제**: `data/skill/` 폴더 7개 파일, `assets/NAVER_login_btn.png`. `assets/new/compyafun2026.jpg` 는 SCSS grep 추가 후 결정 |
| 2 | **F 등급 버그 수정**: `setUser` reducer typo (`useRole` → `userRole`), `useAuthentication` 의 `authority` destructure 제거, `PublicRoutes.jsx:19` handle 일관성 (`.title` 추가), uploads thunk console.log 제거, quiz upload directory `"events"` → `"quiz"` |
| 3 | **D 등급 의사결정**: admin UI 재구현 일정 결정. 보존 vs 제거 정책 명문화 |
| 4 | **B/C/E 등급 (community)**: IA 재개 시점에 일괄 정리. community store 를 `store.js` reducer 에 등록할지 / community 트리 전체 제거할지 결정 |

---

## 외부 영향 표

| 정리 단위 | 외부 영향 |
|---|---|
| `data/skill/` 삭제 | 없음 (확정 dead) |
| `setUser` typo 수정 | AuthGuard 의 ADMIN 라우트 동작 복원 — admin UI 가 다시 라우트 등록되면 즉시 영향. 현재는 영향 0 |
| community 트리 정리 | `routePath.js:community` 키, `MENU_GROUPS.js` 주석, `HomeScreen.jsx` 주석, `data/community/` 폴더 모두 일괄 정리 필요 |
| admin store 코드 정리 | thunk type identifier 가 redux devtools 에서 사라짐. 재구현 시 재작성 부담 — 보존 권고 |

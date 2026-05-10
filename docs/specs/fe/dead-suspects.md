# 미사용 의심 (Dead 후보)

> 분석 시점: v2.0.0-refactor-mobile (2026-05-09 이후 정리 상태)
> 본 문서는 **현재 web/src 코드 기준**. 이전 버전에서 감지된 dead 후보 다수는 이미 정리 완료 (router 단 lazy 정리 + legacy 도메인 폴더 제거).

> 근거 분류:
> - **A** = grep 결과 import 0건 (확정 dead)
> - **B** = 라우트 미등록 + 호출 hook 도 0건 (운영 미사용)
> - **C** = 코드는 살아있으나 명확히 중복/대체된 구버전
> - **D** = 정의만 있고 dispatch 호출처 0건 (thunk leak)
> - **E** = legacy PC 잔존 — 폐기 의도, 추후 제거 대상

---

## A. import 0건 (확정 dead)

| 파일/폴더 | 비고 |
|---|---|
| `web/src/data/skill/HITTER_POINTS.js` | dictionary/simulate 폐기 도메인 mock — 도메인 폐기 후 import 0건 |
| `web/src/data/skill/HITTER_RECOMMEND.js` | 동상 |
| `web/src/data/skill/HITTER_SKILLS.js` | 동상 |
| `web/src/data/skill/PITCHER_RECOMMEND.js` | 동상 |
| `web/src/data/skill/pitcherComboPresets.js` | 동상 |
| `web/src/data/skill/pitcherPositionScore.js` | 동상 |
| `web/src/data/skill/pitcherSkillMeta.js` | 동상 |
| `web/src/domains/home/config/MOCK_POSTS.js` | HomeScreen 의 community 인기글 섹션 주석 처리 후 import 미연결 (community 정리 보류) |
| `web/src/domains/home/config/MOCK_TEAM_POSTS.js` | HomeScreen 의 자유게시판 섹션 주석 처리 후 import 미연결 |
| `web/src/domains/home/config/MOCK_QUIZ.js` | HomeScreen 이 BE 의 `state.quiz.latest` 사용으로 전환된 후 import 미연결 |

> ⚠ home `MOCK_*` 3개는 HomeScreen.jsx:9, 13 에 import 자체는 남아있지만 실제 JSX 사용처가 모두 주석. community 재개/quiz 미연결 fallback 으로 재사용 가능성 존재 — 즉시 삭제보다는 community IA 재개 시점에 함께 결정 권고.

---

## B. 라우트 미등록 + dispatch 0건 (운영 미사용)

| 컴포넌트/모듈 | 위치 | 상태 |
|---|---|---|
| `CommunityScreen` / `CategoryScreen` 트리 전체 | `web/src/domains/community/mobile/**` | 모바일 mock-only 화면. `routePath.js` 에 `community: "/community"` 키만 남고 PublicRoutes 진입 정의 주석. 정리 보류 (IA 재개 후 BE 연결) |
| community feature/user 트리 | `web/src/domains/community/feature/components/user/**` (BoardTabs, board/, post/{pc,mobile}/) | legacy PC `UserCommunityPage` 의 sub component. 라우트 비활성 — IA 재개 후 폐기 또는 모바일 흡수 결정 |
| `useUserBoards`, `useUserPost` | `web/src/domains/community/feature/hooks/user/**` | 위 PC 트리 만 사용 → dead chain |
| `requestGetUserBoardLists`, `requestGetUserPostListsByBoardId` thunks | `web/src/domains/community/store/thunks/userThunks.js` | community reducer 가 store 미등록이므로 dispatch 호출돼도 state 갱신 없음 — 사실상 dead |
| `web/src/domains/community/page/{admin,user}/` | `AdminCommunityPage.jsx` 등 page wrapper | 라우트 미등록. IA 재개 후 도메인 mobile/feature 흡수 |
| `web/src/domains/community/feature/components/admin/**` | community admin 화면 트리 (CommunityManagePage, BoardAdminTable, PostAdminTable, TagAdminTable, modal 등) | admin UI legacy 폐기 (2026-05-09) — UI 신규 기획 후 재구현 |

---

## C. 명확한 중복 / 구버전

| 항목 | 상태 |
|---|---|
| `web/src/domains/community/store/endpoints.js` 의 `*_ACTIONS` 상수 일부 (`UPDATE_BOARD: "/community/admin/boards/${id}"` 처럼 `${id}` literal 박힘) | thunk type identifier 로만 쓰임 — 운영 path 는 함수형 endpoint (`ADMIN_COMMUNITY.UPDATE_BOARD(id)`) 사용. 혼란 유발 — IA 재개 시 정리 권고 |
| `web/src/data/community/notices.js` ↔ `web/src/domains/notices/store/public/*` | community mock notice (정적) ↔ BE notices (live) 충돌 가능성. CommunityScreen 의 공지 섹션은 mock notice 사용 — IA 재개 시 BE 통합 결정 필요 |

---

## D. thunk 정의만, dispatch 0건 (thunk leak)

| thunk | 위치 | 의미 |
|---|---|---|
| (해결됨) `requestLatestQuizAnswer` | `web/src/domains/quiz/store/public/thunks.js:4` | HomeScreen 에서 dispatch 추가됨 (`HomeScreen.jsx:44`) — 이전 leak 해결 |
| `requestUploadImage` | `web/src/infra/api/uploads/thunks.js:5` | events/quiz admin wrapper 함수 (`requestAdminUploadEventImage`, `requestAdminUploadQuizImage`) 에서 호출되지만, 이 wrapper 들이 호출되는 admin form UI 자체가 비활성 → 실효 dead chain (재기획 후 활성화 예정) |

---

## E. legacy PC 잔존 (폐기 의도, 추후 제거)

> Owner 정책: 즉시 삭제보다는 IA 재개 시점에 정리. 코드 참고용 보존.

| 위치 | 사유 |
|---|---|
| `web/src/domains/community/feature/components/user/post/pc/PostUserTable*.jsx` | PC 전용 community user 테이블. 라우트 비활성 |
| `web/src/domains/community/feature/components/user/post/mobile/PostUserMobileTable*.jsx` | (mobile 폴더 명칭이지만) feature/ 영역 전체가 IA 재개 대기 — 모바일 mock 화면(`mobile/CommunityScreen.jsx`)과 무관 |
| `web/src/data/community/*.js` | community 모바일 mock 데이터 — IA 재개 시 BE fetcher 로 교체 예정 (Owner 확정: 정리보류 동안 보존) |
| `web/src/domains/home/config/MOCK_*.js` | A 분류 참고 — HomeScreen 의 community/quiz 섹션 변환 동안 잔존 |

---

## 폐기 완료 (이전 dead-suspects 목록에서 제거됨)

이전 분석에서 dead 로 식별됐던 다음 항목들은 **현재 web/src 에 더 이상 존재하지 않음** (정리 완료):

- `web/src/domains/mobile/` 폴더 전체 (placeholder MobileHomePage, components/* 등)
- `web/src/app/wrapper/parts/{Header,Footer}.jsx` + 동반 SCSS / hooks (`useHeaderAuth/Nav/UI`)
- `web/src/shared/` 폴더 전체 (`useScrollLock` 등)
- `web/src/global/layout/{adminPageLayout, contentPageLayout, userLayout, callBack}/` 4개 폴더 (commit 2026-05-09)
- `web/src/data/{CafeNotice, FunNotice, HistoryMode}.js`
- `web/src/core/filters/CoreVisibleFilter.jsx`, `CoreStatusFilter.jsx` (core/ 폴더 전체)
- `web/src/app/page/` 폴더 전체 (lazy entry 6개) — PublicRoutes 가 도메인 Screen 직접 lazy 로 흡수 (commit 716e3ad)
- `web/src/global/handler/{applyAsyncHandlers, VisibleToggleHandler}.js` — `applyAsyncHandlers` 는 `web/src/app/store/utils/applyAsyncHandlers.js` 로 이전, `VisibleToggleHandler` 는 admin UI 폐기와 함께 제거
- `web/src/global/hooks/useTableModal.js` — admin UI legacy 폐기와 함께 제거
- `web/src/app/analytics/` → `web/src/infra/analytics/` 이전 완료
- `web/src/app/store/APIConfig.js` → `web/src/infra/http/client.js` 이전 완료
- `web/src/infra/uploads/` → `web/src/infra/api/uploads/` 이전 완료
- `web/src/global/utils/{DateFormatt, parseDate, sortCoupons}.js` 등 legacy util 정리
- `web/src/global/utils/crypto/storageCrypto.js` (dictionary/simulate 폐기와 함께 제거)
- `web/src/global/utils/skill/` (legacy skill util)
- `web/src/meta/` 폴더 (MetaHeader, usePageMeta) — 라우트 단 `handle.title` 로 통합
- legacy 도메인 폴더 전체: `domains/{dictionary, simulate, kbo, playerCard, profile, admin}/`

---

## TODO 주석 (코드 내 자기-신고)

| 위치 | 내용 |
|---|---|
| `web/src/domains/community/mobile/CommunityScreen.jsx:111` | "TODO: 글쓰기 action 연결 필요 (라우트 이동 또는 모달 — 로그인 분기 포함)" |
| `web/src/domains/community/mobile/hooks/useCategoryFeed.js:8` | "TODO: BE 연동 시 카테고리별 API endpoint(또는 fetcher)로 분기. 현재는 정적 mock import." |

---

## 우선 정리 권고

1. **A 항목 (data/skill/*)** — dictionary/simulate 도메인 폐기 완료 후 사용처 확실히 0건. 즉시 정리 가능. (Owner 정책 확인 후)
2. **B 항목 (community)** — IA 재개 시점에 결정. mobile/ (mock) 살릴지, feature/ (legacy) 폐기할지 한 번에 정리.
3. **D 항목 (`requestUploadImage` chain)** — admin form UI 재기획 시 활성화 예정. 잔존.
4. **C 의 `*_ACTIONS` 상수** — community endpoint 정리 시 type identifier 명확화 (literal `${id}` 제거 또는 thunk type prefix 정책 통일).

---

## Admin 영역 마커

> **Admin: TBD (기획 대기)** — 본 문서의 admin 관련 dead 후보(community admin feature/, page/admin/) 는 즉시 삭제하지 말고 신규 기획 후 `domains/{domain}/feature/admin/` 패턴 재구현 시 정리.

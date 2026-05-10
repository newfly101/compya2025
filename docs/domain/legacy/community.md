# 도메인: community

> ★ 가장 큰 도메인. PC + 모바일 + admin 모두 살아있음. reconciler 가 정리 보류 권고함 (`fe-map.md ★ Owner 확정 #3` — 분석 후 별도 계획 라운드).

## A.1 현재 상태

- **분류**: **partial-mock** (모바일 mock-only + admin live + PC 레거시 잔존)
- **모바일 전환 진척도**: **부분 일치** — mobile Screen 은 만들어져 있으나 100% mock (BE 미연결). admin 은 live, PC 레거시는 운영 미사용
  - 모바일 (mock-only): `web/src/domains/community/mobile/{CommunityScreen,CategoryScreen}.jsx`
  - PC 어드민 (live): `web/src/domains/community/page/admin/AdminCommunityPage.jsx` + `feature/components/admin/CommunityManagePage.jsx`
  - PC 사용자 (legacy, 라우트 미등록): `web/src/domains/community/feature/components/user/**` (Owner 정책: 보존)

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| CommunityScreen (전체 탭) | `/community` | `web/src/domains/community/mobile/CommunityScreen.jsx` | 모바일 | `selectedCategory==="all"` 분기 |
| CategoryScreen | `/community?category=...` | `web/src/domains/community/mobile/CategoryScreen.jsx` | 모바일 | 100% mock (`useCategoryFeed`) |
| AdminCommunityPage | `/admin/community` | `web/src/domains/community/page/admin/AdminCommunityPage.jsx` → `CommunityManagePage` (BoardAdminTable, PostAdminTable, TagAdminTable + tabs) | PC 어드민 | live |
| UserCommunityPage (PC legacy) | (라우트 미등록) | `web/src/domains/community/page/user/UserCommunityPage.jsx` → `CommunityPage` (`feature/components/user/CommunityPage.jsx`) | PC 레거시 | 라우트 주석. Owner 보존 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/community/*`, 11개 컨트롤러)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/boards` | BoardController#getVisibleBoardList (`BoardController.java:19`) | permitAll | visible 만 |
| GET | `/api/boards/{id}` | BoardController#getBoardDetail (line 28) | permitAll | |
| GET | `/api/boards/code/{code}` | BoardController#getBoardDetailByCode (line 33) | permitAll | |
| GET | `/api/admin/boards` | AdminBoardController#getBoardList (`AdminBoardController.java:21`) | ADMIN | all (visible+hidden) |
| GET | `/api/admin/boards/{id}` | AdminBoardController#getBoardDetail (line 29) | ADMIN | |
| POST | `/api/admin/boards` | AdminBoardController#createBoard (line 34) | ADMIN | body: BoardRequest |
| PUT | `/api/admin/boards/{id}` | AdminBoardController#updateBoard (line 40) | ADMIN | |
| PATCH | `/api/admin/boards/{id}/visible` | AdminBoardController#updateBoardVisible (line 47) | ADMIN | |
| DELETE | `/api/admin/boards/{id}` | AdminBoardController#deleteBoard (line 53) | ADMIN | |
| GET | `/api/posts/boards/{boardId}` | PostController#getPostListByBoardId (`PostController.java:20`) | permitAll | |
| GET | `/api/posts/boards/{boardId}/pinned` | PostController#getPinnedPostListByBoardId (line 28) | permitAll | |
| GET | `/api/posts/boards/{boardId}/popular` | PostController#getPopularPostListByBoardId (line 36) | permitAll | |
| GET | `/api/posts/{id}` | PostController#getPostDetail (line 44) | permitAll | view count 증가 side-effect |
| GET | `/api/posts/authors` | PostController#getPostListByAuthor (line 49) | permitAll | |
| GET | `/api/admin/posts/{id}` | AdminPostController#getPostDetail (line 19) | ADMIN | view count 미증가 |
| POST | `/api/admin/posts` | AdminPostController#createPost (line 24) | ADMIN | |
| PUT | `/api/admin/posts/{id}` | AdminPostController#updatePost (line 30) | ADMIN | |
| PATCH | `/api/admin/posts/{id}/visible|pinned` | line 37, 43 | ADMIN | |
| DELETE | `/api/admin/posts/{id}` | line 49 | ADMIN | |
| GET | `/api/comments/posts/{postId}` 등 11개 | CommentController + AdminCommentController | permitAll/ADMIN | reactions/replies 포함 |
| GET | `/api/post-reactions/*` 5개 | PostReactionController | permitAll (★ userId body/query 위변조 가능) | |
| GET | `/api/comment-reactions/*` 5개 | CommentReactionController | permitAll (★ 동) | |
| GET | `/api/tags`, `/api/tags/code/{code}` | TagController | permitAll | |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/tags*` 6개 | AdminTagController | ADMIN | |
| GET/POST/DELETE/PUT | `/api/post-tags*` 5개 | PostTagController | permitAll (★) | |
| GET/POST | `/api/reports*` 2개 | ReportController | permitAll (★ reporterId 위변조) | |
| GET/PATCH/DELETE | `/api/admin/reports*` 6개 | AdminReportController | ADMIN | |

> 출처: `docs/specs/be/endpoints.md` line 23-156. 총 endpoint 다수 (community 묶음).

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/community/store/api.js:9` | GET | `/community/admin/boards` ⚠ | `useBoards` | `/admin/community` |
| `domains/community/store/api.js:14` | POST | `/community/admin/boards` ⚠ | `useBoardCreate` | `/admin/community` |
| `domains/community/store/api.js:19` | PATCH | `/community/admin/boards/{id}` ⚠ | `useBoardEdit` | `/admin/community` |
| `domains/community/store/api.js:25` | GET | `/community/admin/posts` ⚠ | `usePosts` | `/admin/community` |
| `domains/community/store/api.js:30` | POST | `/community/admin/posts` ⚠ | `usePostCreate` | `/admin/community` |
| `domains/community/store/api.js:35` | PATCH | `/community/admin/posts/{id}` ⚠ | `usePostEdit` | `/admin/community` |
| `domains/community/store/api.js:40` | GET | `/community/admin/tags` ⚠ | `useTag` | `/admin/community` |
| `domains/community/store/api.js:45` | POST | `/community/admin/tags` ⚠ | `useTagCreate` | `/admin/community` |
| `domains/community/store/api.js:50` | PATCH | `/community/admin/tags/{id}` ⚠ | `useTagEdit` | `/admin/community` |
| `domains/community/store/api.js:59` | GET | `/community/boards` ⚠ | `useUserBoards` | (PC `UserCommunityPage` — 라우트 미등록) |
| `domains/community/store/api.js:64` | GET | `/community/board/{boardId}/posts` ⚠ | `useUserPost` | (PC `UserCommunityPage`) |
| `domains/community/mobile/hooks/useCommunity.js:3-6`, `useCategoryFeed.js:2-4` | (호출 없음) | (mock import) | mock | 모바일 화면 — `data/community/{categories,notices,hotPosts,posts}.js` |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #35-50)

- **매칭됨**: 0건 (FE 모바일 측은 호출 없음, FE admin 측은 path 미스매치 의심)
- **FE 만 호출 (path 미스매치 의심)** — `fe-be-mismatch.md #35-43`:
  - FE `/community/admin/boards*` ↔ BE `/api/admin/boards*` (community prefix 추가 차이)
  - FE `/community/admin/posts*` ↔ BE `/api/admin/posts*`
  - FE `/community/admin/tags*` ↔ BE `/api/admin/tags*`
  - FE 의 admin board/post/tag 가 PATCH 사용 ↔ BE 는 PUT (method 미스매치 의심)
  - **spot-check 권장**: admin community 화면이 정상 운영 중인지 dev 환경 검증 필요. spec 그대로면 100% 깨진 상태
- **FE 만 호출 (PC legacy, 운영 미사용)** — `fe-be-mismatch.md #44-45`:
  - FE `/community/boards`, `/community/board/{id}/posts` ↔ BE `/api/boards`, `/api/posts/boards/{boardId}` (path 자체 다름)
- **BE 만 노출 (FE 미연결, BE_ONLY)** — 35+건:
  - `/api/posts/boards/{boardId}` 등 5개 PostController public
  - `/api/comments/*` 11개
  - `/api/post-reactions/*` 5개
  - `/api/comment-reactions/*` 5개
  - `/api/tags*` 2개 public
  - `/api/post-tags/*` 5개
  - `/api/reports/*` 2개 + `/api/admin/reports/*` 6개
  - `/api/admin/comments/*` 5개

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `boards` | V1 | ⚪ legacy(이전완료) | — (mapper 0건) | site_board 로 이전 |
| `posts` | V1 | ⚪ legacy(이전완료) | — | site_post 로 이전 |
| `tags` | V1 | ⚪ legacy(이전완료) | — | site_tag 로 이전 |
| `posts_tags` | V1 | ⚪ legacy(이전완료) | — | site_post_tag 로 이전 |
| `site_board` | V2 | 🔵 active | `mapper/site/community/BoardMapper.xml` (8 stmt) | |
| `site_post` | V2 | 🔵 active | `mapper/site/community/PostMapper.xml` (18 stmt) | counter 컬럼 추가 |
| `site_comment` | V2 | 🔵 active | `mapper/site/community/CommentMapper.xml` (13 stmt) | V1 미존재 — 신규 |
| `site_tag` | V2 | 🔵 active | `mapper/site/community/TagMapper.xml` (8 stmt) | |
| `site_post_tag` | V2 | 🔵 active | `mapper/site/community/PostTagMapper.xml` (5 stmt) | |
| `site_post_reaction` | V2 | 🔵 active | `mapper/site/community/PostReactionMapper.xml` (6 stmt) | V1 미존재 |
| `site_comment_reaction` | V2 | 🔵 active | `mapper/site/community/CommentReactionMapper.xml` (6 stmt) | V1 미존재 |
| `site_report` | V2 | 🔵 active | `mapper/site/community/ReportMapper.xml` (8 stmt) | V1 미존재 |

> 출처: `docs/specs/db/tables.md` 행 12-15, 42-49. dual pair: `boards↔site_board`, `posts↔site_post`, `tags↔site_tag`, `posts_tags↔site_post_tag` — 모두 V2 단방향(이전완료). V1 mapper 0건.

## A.5 권한 / 가드

- 모바일 사용자 화면: 현재 mock 만, BE 미연결
- admin: `/api/admin/community/**` (사실은 `/api/admin/boards`, `/api/admin/posts` 등) → SecurityConfig URL 가드 `/api/admin/**` hasRole(ADMIN)
- 사용자 reaction/report/comment: ★ **본인 검증 부재 위험** (R7) — userId/authorId/reporterId body/query 만 받음

### 알려진 누락

- 위 R7 (`auth-and-flags.md:65`): `POST /api/post-reactions`, `POST /api/comments`, `POST /api/reports`, `POST /api/post-tags` 등에 SecurityContext userId 매칭 검증 부재 → 다른 사용자로 위장 가능

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 모바일 화면 100% mock (CommunityScreen, CategoryScreen 둘 다 Redux 미사용) | `fe/state-and-data.md:97-100, 124` | ⚠ figma-spec-validator 진입 전 mock shape vs BE shape 정합성 검증 필수 |
| FE↔BE admin path 미스매치 (community prefix 차이 + PATCH↔PUT method) | `fe-be-mismatch.md #35-43` | ⚠ admin community 화면 동작 검증 필요 |
| BE_ONLY 35+건 (community 도메인 BE 풀세트, FE 미연결) | `fe-be-mismatch.md #46-58` | ⚠ 모바일 community BE 연결 시 일괄 fix |
| ★ R7: community 위장 가능 endpoint (userId body/query) | `auth-and-flags.md:65`, `risk-and-priority.md #7` | ⚠ community BE 연결 시 fix 필수 |
| TODO 자기-신고 — `CommunityScreen.jsx:111` "TODO: 글쓰기 action 연결 필요", `useCategoryFeed.js:8` "TODO: BE 연동 시 카테고리별 API endpoint" | `fe/dead-suspects.md` TODO 표 | — |
| Owner 정책: community 거대화 — 분석 후 별도 계획 라운드 (`fe-map.md ★ Owner 확정 #3`) | — | community 결론은 매핑까지만, 정리 액션은 별도 라운드 |

## A.7 dead 항목 (이 도메인 안)

- **PC 레거시 (Owner 보존)**: `web/src/domains/community/feature/components/user/**` (CommunityPage.jsx, BoardTabs.jsx, board/CommunityUserBoardTabs.jsx, post/{pc,mobile}/PostUserTable*.jsx) — 라우트 미등록. user thunks (`requestGetUserBoardLists`, `requestGetUserPostListsByBoardId`) 도 이쪽에서만 사용. **Owner 정책: 삭제 금지** (`fe-map.md ★ Owner 확정 #2`)
- **PC 레거시 hook**: `useUserBoards`, `useUserPost`, `usePostUserFilter` (`feature/hooks/user/**`) — 위 PC `CommunityPage` 만 사용 → 라우트 미등록 시 dead chain
- 살릴 시 path 동기화 필수 (현재 path 자체가 BE 와 다름 — `fe-be-mismatch.md #44-45`)
- `endpoints.js` 의 `*_ACTIONS` 상수 일부 (`UPDATE_BOARD: "/community/admin/boards/${id}"` 같은 literal `${id}`) — `fe/dead-suspects.md E`

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **R7 위장 가능 endpoint fix 시점**: 모바일 community BE 연결 라운드와 동시 처리
- **community admin path 미스매치 spot-check**: FE 측 `community` prefix 가 의도된 건지 vs BE 측 정렬할지 (Owner 확정 후 일괄 수정)
- **모바일 community BE 연결 마일스톤**: `fe-map.md ★ Owner 확정 #3` 기준 — 별도 계획 라운드. 본 PRD 는 매핑 baseline 만 제공
- **mock data shape (`data/community/*`) ↔ BE response shape 정합성 검증** (R10): figma-spec-validator 진입 전 결론 필요

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

---

## TODO (2026-05-09 — 기획 IA 작업 우선)

> 사용자 정책 (2026-05-09): "메인화면 작업 중 community 도메인 정리 시작 시점. 폴더 자체는 건드리지 않고, 외부 호출만 주석 처리. 기획 IA 작업 진행 후 다시 코드 개발 진행"

### 즉시 (P0)

- [ ] **기획 IA 작업 재개** — `prd-ia-interactive` sub-agent 호출 (`/prd-pipeline community`)
  - 모바일 community scope 재정의 (보드 / 게시글 / 댓글 / 반응 / 신고 / 태그 / 익명 등 V2 site_* 테이블 정합 검증)
  - admin community scope 분리 결정
  - 글로벌 ★ Owner 결정 추적 (있으면 cite)

### IA 완료 후 코드 개발 (P1)

- [ ] community.md Part B v1 확정사항 코드 반영 (BE / FE / mapper / SQL)
- [ ] `src/domains/community/**` 정리 — 본 라운드 보류된 폴더 작업
- [ ] 외부 호출 (HomeScreen / GNB / Footer / 라우트 등) 주석 해제 + 동작 확인
- [ ] AdminRoutes.jsx 의 community admin 주석 해제 (본 라운드 race 로 인해 다른 background agent commit 에 흡수됨)

### 본 라운드 (2026-05-09) 처리 결과

- 외부 호출 주석 처리 완료 (cite — 실제 주석 처리한 파일):
  - `web/src/app/store/store.js` (communityReducer import + reducer 등록) — 동시 진행 중인 dictionary cleanup background agent commit `823c6ac` 에 흡수됨
  - `web/src/app/router/routes/PublicRoutes.jsx` (CommunityPage lazy import + `/community` 라우트 등록) — 동시 진행 중인 dictionary cleanup background agent commit `823c6ac` 에 흡수됨
  - `web/src/app/router/routes/AdminRoutes.jsx` (AdminCommunityPage lazy import + `/admin/community` 어드민 라우트) — 본 라운드 작업 했으나 동시 진행 중인 playerCard background agent commit 에 흡수 예정 (race 회피)
  - `web/src/app/wrapper/mobile/config/MENU_GROUPS.js` (커뮤니티 메뉴 그룹 — 인기글 / 팀 게시판) — 본 commit 포함
  - `web/src/domains/home/components/HomeScreen.jsx` (PostRow / BoardTagBadge import + 커뮤니티 인기글 / 자유게시판 SectionBlock 2개) — 본 commit 포함
  - `web/src/domains/notices/mobile/NoticeScreen.jsx` ("사이트 공지" 섹션의 `/community/notices` link target 임시 제거) — 본 commit 포함
  - `web/src/global/layout/adminPageLayout/AdminPageLayout.jsx` (admin nav `/admin/community` 항목) — 본 commit 포함
- `src/domains/community/**` 미터치 (사용자 명시: 폴더 자체 건드리지 않음)
- 기획 IA 미진행 (P0 후속)
- 미터치 (touched-elsewhere / dead chain):
  - `web/src/app/page/CommunityPage.jsx` (`PublicRoutes.jsx` 만 사용 → lazy import 주석 후 unreferenced. 폴더 정리 라운드에서 처리)
  - `web/src/app/router/config/{routePath,routeMeta}.js` (constant 정의만, 호출 아님 — `PublicRoutes.jsx` 주석 후 미사용)
  - `web/src/app/wrapper/parts/hooks/useHeaderNav.js` (PC dead chain — `Header.jsx` 만 사용. `_overview.md § 6.1` 별도 dead 정리 라운드)
  - `web/src/data/community/**` (community 폴더 내부에서만 사용 — 외부 호출 아님)

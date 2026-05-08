# fe-be-mismatch.md — FE 호출 ↔ BE endpoint 대조

> 입력: `docs/specs/be/endpoints.md`, `docs/specs/fe/api-calls.md`
> baseURL: FE `http://localhost:8080/api` (`web/src/app/store/APIConfig.js:3`)
> FE path 는 `/api` prefix 없이 `/users/me` 등으로 등록됨 — 본 표는 BE 기준 full path 로 정규화해서 비교한다.

---

## 표기 규칙

- **상태**:
  - 🟢 **MATCH** — FE 호출 ↔ BE endpoint path/method 둘 다 일치
  - 🟡 **MATCH(legacy)** — 매칭되나 라우트 주석(legacy PC) 또는 admin 주석 화면에서만 호출
  - 🔴 **FE_ONLY** — FE 가 호출하는데 BE 매핑 없음 (오타 / v1↔v2 / 미구현)
  - 🔴 **BE_ONLY** — BE 매핑 있는데 FE 호출 0건 (dead 또는 미연결)
  - ⚫ **DEAD_BOTH** — 양쪽 다 흔적은 있지만 운영 미사용 (라우트+컨트롤러 모두 깨짐)

| # | METHOD | BE path | FE path (정규화 후) | 상태 | FE 트리거 화면 / 호출 hook | BE 컨트롤러 | 추정 원인 + 권장 액션 |
|---:|---|---|---|---|---|---|---|
| 1 | GET | `/api/users/me` | `/users/me` | 🟢 MATCH | `AuthProvider`, `AuthCallback` | `UserController#getMe` | 정상. 모든 라우트 부팅 시 호출 |
| 2 | POST | `/api/auth/logout` | `/auth/logout` | 🟢 MATCH | TopBar 로그아웃 (`useHeaderAuth.logout` 일부 dead) | `AuthController#logout` | 정상 |
| 3 | GET | `/api/auth/naver/callback` | (브라우저 redirect) | 🟢 MATCH | Naver 로그인 후 BE 가 직접 콜백 → JWT 쿠키 set 후 `/auth/callback` redirect | `AuthController#naverCallback` | 정상. FE axios 미경유 |
| 4 | GET | `/api/notices` | `/notices` | 🟢 MATCH | `useNoticeList`, `useNoticeDetail`, HomeScreen NoticeSection | `NoticeController#getNoticeList` | 정상 |
| 5 | GET | `/api/notices/{id}` | (FE 는 list 만 fetch, detail 은 list 캐시 재활용) | 🔴 BE_ONLY | — | `NoticeController#getNoticeDetail` | 미연결. FE 는 단건 조회 thunk 가 없고 `useNoticeDetail` 이 list 응답에서 lookup. 의도된 미연결 가능성 — 액션 보류 |
| 6 | GET | `/api/coupons` | `/coupons` | 🟢 MATCH | `useCouponList`, HomeScreen CouponListHorizontal | `CouponController#getCouponLists` | 정상 |
| 7 | GET | `/api/events/external` | `/events/external` | 🟢 MATCH | `useEventList`, HomeScreen EventListHorizontal | `EventController#getExternalEventList` | 정상 |
| 8 | GET | `/api/quiz/latest` | `/quiz-answers/latest` | 🔴 FE_ONLY | (dispatch 호출처 0건 — thunk 정의만) | `QuizController#getLatest` (BE 는 `/api/quiz/latest`) | ★ **path 미스매치**. FE endpoint `/quiz-answers/latest` ↔ BE `/api/quiz/latest` (`endpoints.md:212` ↔ `fe/api-calls.md:26`). FE thunk 자체가 dispatch 안 되므로 현재 운영 영향 0. **권장 액션**: ① path 를 `/quiz/latest` 로 수정 + ② `HomeScreen.QuizSection` 에서 dispatch 추가 (현재 `MOCK_QUIZ` 만 보여줌) |
| 9 | GET | `/api/skills/{target}` | `/skills/{playerType}` | 🟡 MATCH(legacy) | `usePitcherSkillChange`, `useHitterSkillChange` (legacy `/simulate` 주석) | `SkillController#playerTypeSkills` | 매칭. legacy PC 만 사용. 살릴지 폐기인지 별도 결정 |
| 10 | GET | `/api/skills/coach` | (호출 0건) | 🔴 BE_ONLY | — | `SkillController#coachSkills` | ★ Owner 기억 정정 확정 — BE wired (services.md:94). FE 미연결. 권장 액션: 향후 coach 화면 작업 시 thunk 신설 |
| 11 | GET | `/api/skills/score-config` | `/skills/score-config` | 🟡 MATCH(legacy) | `useSkillScoreConfig` (legacy simulate) | `SkillController#skillScoreConfig` | legacy 만 사용 |
| 12 | GET | `/api/kbo/matches/today` | `/kbo/matches/today` | 🟡 MATCH(legacy) | `useTodayMatches` (legacy `/kbo` 주석) | `KboGameController#getTodayMatches` | legacy. Owner 진술상 kbo 도메인 자체 보류 |
| 13 | GET | `/api/kbo/matches/{matchId}` | `/kbo/matches/{matchId}` | ⚫ DEAD_BOTH | thunk 정의만, dispatch 0건 | `KboGameController#getMatchDetail` | FE 미사용 + 라우트 주석. 살리려면 KBO 도메인 재진입 필요 |
| 14 | GET | `/api/player/{position}` | `/player/{playerType}` | 🟡 MATCH(legacy) | `usePlayerCardData` (legacy `/simulate`) | `PlayerCardController#getLegendPlayerByPosition` | legacy. V2 통폐합 시 폐기 예정 |
| 15 | GET | `/api/admin/player/teams` | `/admin/player/teams` | 🟢 MATCH | `useAdminPlayerMeta`, `useAdminPlayerForm` (`/admin/content/player`) | `AdminPlayerCardController#getPlayerTeams` | 정상 (admin) |
| 16 | POST | `/api/admin/player` | (FE 측 endpoint 미식별 — playerCard admin form 내부) | 🟢 MATCH (추정) | admin 폼 dispatch | `AdminPlayerCardController#createPlayerCard` | 운영 추정 일치 |
| 17 | (none) | `/api/player-cards` (V2 빈 컨트롤러) | (호출 0건) | ⚫ DEAD_BOTH | — | `FunPlayerCardController` (빈 클래스) | 매핑 0개. FE 호출 0건 (`grep -r "/player-cards"` 결과 0건 spot-check 확인). 권장 액션: V2 도메인 작업 재개 시 함께 진행 |
| 18 | POST | `/api/admin/player-cards` (V2) | (호출 0건) | 🔴 BE_ONLY | — | `FunAdminPlayerCardController#create` | ★ **빈 DTO** + namespace mismatch 위험. FE 호출 0건이라 운영 영향 없음. 모바일 player_card 화면 **현재 없음**. 권장 액션: V2 작업 보류 동안 그대로 (위험 경고만 유지) |
| 19 | PUT | `/api/admin/player-cards/{id}` (V2) | — | 🔴 BE_ONLY | — | 동상 | 동상 |
| 20 | GET | `/api/admin/player-cards/{id}` (V2) | — | 🔴 BE_ONLY | — | 동상 (응답 항상 `{}`) | 동상 |
| 21 | GET | `/api/admin/notices` | `/admin/notices` | 🟢 MATCH | admin notice hook | `AdminNoticeController#getAdminNoticeList` | 정상 |
| 22 | POST | `/api/admin/notices` | `/admin/notices` | 🟢 MATCH | admin notice form | `AdminNoticeController#createNotice` | 정상 |
| 23 | PATCH | `/api/admin/notices/{noticeId}` | `/admin/notices` (id query?) | 🟡 MATCH (path 형식 차이 추정) | admin notice form | `AdminNoticeController#updateNotice` (PUT) ⚠ | ★ **method 미스매치 의심**: BE 는 PUT (`endpoints.md:203`), FE 는 PATCH (`fe/api-calls.md:39`). spec 만으로 단정 불가. **spot-check 권장**: `web/src/domains/notices/store/admin/api.js:6` 의 axios method 와 `domain/notice/controller/AdminNoticeController.java:48` `@PutMapping` 비교 — 둘 중 하나 수정 필요 |
| 24 | PATCH | `/api/admin/notices/{noticeId}/visible` | `/admin/notices/visible` | 🟡 MATCH (path 형식 차이) | admin notice toggle | `AdminNoticeController#updateNoticeVisible` | BE path 는 `{id}/visible`, FE 는 query/body 로 id 전달 가능성. **spot-check 권장** |
| 25 | GET | `/api/admin/coupons` | `/admin/coupons` | 🟡 MATCH(admin 주석) | (라우트 주석 — 미진입) | `AdminCouponController#getCouponLists` | 매칭. admin 라우트 주석 처리 (디자인 미진행). 코드 살아있음 |
| 26 | POST/PATCH | `/api/admin/coupons*` | `/admin/coupons*` | 🟡 MATCH(admin 주석) | — | `AdminCouponController#*` | 동상 |
| 27 | GET | `/api/admin/events/external` | `/admin/events/external` | 🟡 MATCH(admin 주석) | — | `AdminEventController#getExternalEventList` | 동상 |
| 28 | POST/PATCH | `/api/admin/events*` | `/admin/events*` | 🟡 MATCH(admin 주석) | — | `AdminEventController#*` | 동상 |
| 29 | POST | `/api/upload/events` | `/upload/events` | 🟢 MATCH | `useQuizForm`, event admin upload | `UploadController#uploadImage` | 정상. ★ **권한 가드 부재** 별도 위험 (auth-and-flags.md) |
| 30 | POST | `/api/upload/{directory}` (generic) | `/upload/{directory}` | 🟡 MATCH | `useQuizForm` 등 | `UploadController#uploadImage` | BE 는 `/upload/events` 단일 경로만 매핑. FE 의 generic 호출 (`requestUploadImage` w/ path param) 이 다른 directory 를 보내면 404. spot-check 필요 |
| 31 | GET | `/api/admin/quiz` | `/admin/quiz-answers` | 🔴 FE_ONLY | `useAdminQuizTable` | `AdminQuizController#getAll` (`/api/admin/quiz`) | ★ **path 미스매치**: FE `/admin/quiz-answers` ↔ BE `/api/admin/quiz` (`endpoints.md:218` ↔ `fe/api-calls.md:51`). 어드민 quiz 화면 진입 시 404 의심. **spot-check 권장** (admin/quiz/store/admin/endpoints.js 와 BE 쪽 mapping 비교) |
| 32 | POST | `/api/admin/quiz` | `/admin/quiz-answers` | 🔴 FE_ONLY | admin quiz form | `AdminQuizController#create` | 동상 |
| 33 | PATCH | `/api/admin/quiz/{id}` | `/admin/quiz-answers/{id}` | 🔴 FE_ONLY | admin quiz update | `AdminQuizController#update` | 동상 |
| 34 | PATCH | `/api/admin/quiz/{id}/visible` | `/admin/quiz-answers/{id}/visible` | 🔴 FE_ONLY | admin quiz visible toggle | (BE 미존재 — `AdminQuizController` 에는 visible 토글 핸들러 없음, `endpoints.md:215-221`) | ★ **BE 미구현 + path 둘 다 어긋남**. quiz visible toggle 은 admin 화면 핵심 액션인데 BE 가 없음 |
| 35 | GET | `/api/community/admin/boards` ↔ `/api/admin/boards` | `/community/admin/boards` | 🔴 FE_ONLY | `useBoards` (`/admin/community`) | `AdminBoardController` (`/api/admin/boards`) | ★ **path 미스매치**: FE 는 `/community/admin/boards` (community 도메인 prefix 추가), BE 는 `/api/admin/boards` (community prefix 없음). FE 가 BE 호출 시 404 의심. **spot-check 권장** (community/store/api.js:9 ↔ AdminBoardController.java:21) |
| 36 | POST | `/api/community/admin/boards` | `/community/admin/boards` | 🔴 FE_ONLY | `useBoardCreate` | `AdminBoardController#createBoard` | 동상 |
| 37 | PATCH | `/api/community/admin/boards/{id}` | `/community/admin/boards/{id}` | 🔴 FE_ONLY | `useBoardEdit` | `AdminBoardController#updateBoard` (BE 는 PUT) | path + method 둘 다 미스매치 가능성 |
| 38 | GET | `/api/community/admin/posts` | `/community/admin/posts` | 🔴 FE_ONLY | `usePosts` | `AdminPostController` (`/api/admin/posts`) | path 미스매치 (community prefix 추가) |
| 39 | POST | `/api/community/admin/posts` | 동상 | 🔴 FE_ONLY | `usePostCreate` | `AdminPostController#createPost` | 동상 |
| 40 | PATCH | `/api/community/admin/posts/{id}` | 동상 | 🔴 FE_ONLY | `usePostEdit` | `AdminPostController#updatePost` (BE 는 PUT) | 동상 |
| 41 | GET | `/api/community/admin/tags` | `/community/admin/tags` | 🔴 FE_ONLY | `useTag` | `AdminTagController` (`/api/admin/tags`) | path 미스매치 |
| 42 | POST | `/api/community/admin/tags` | 동상 | 🔴 FE_ONLY | `useTagCreate` | `AdminTagController#createTag` | 동상 |
| 43 | PATCH | `/api/community/admin/tags/{id}` | 동상 | 🔴 FE_ONLY | `useTagEdit` | `AdminTagController#updateTag` (BE 는 PUT) | 동상 |
| 44 | GET | `/api/community/boards` (PC 레거시) | `/community/boards` | 🔴 FE_ONLY | `useUserBoards` (legacy PC `UserCommunityPage` — 라우트 미등록) | `BoardController` (`/api/boards`) | path 미스매치 (community prefix). 라우트 미등록이라 운영 영향 0 |
| 45 | GET | `/api/community/board/{boardId}/posts` | 동상 | 🔴 FE_ONLY | `useUserPost` (PC 레거시) | `PostController#getPostListByBoardId` (`/api/posts/boards/{boardId}`) | path 구조 자체가 다름 (FE: `/community/board/{id}/posts`, BE: `/posts/boards/{id}`). 라우트 미등록 |
| 46 | GET | `/api/posts/boards/{boardId}` | (호출 0건) | 🔴 BE_ONLY | — | `PostController#getPostListByBoardId` | community 모바일이 mock 만 사용 — BE 미연결 |
| 47 | GET | `/api/posts/boards/{boardId}/pinned` | (호출 0건) | 🔴 BE_ONLY | — | `PostController#getPinnedPostListByBoardId` | 동상 |
| 48 | GET | `/api/posts/boards/{boardId}/popular` | (호출 0건) | 🔴 BE_ONLY | — | `PostController#getPopularPostListByBoardId` | 동상. HomeScreen 인기글 mock 부분 — 향후 연결 필요 |
| 49 | GET | `/api/posts/{id}` | (호출 0건) | 🔴 BE_ONLY | — | `PostController#getPostDetail` (view 카운트 증가) | community 모바일 BE 연결 시 필요 |
| 50 | GET | `/api/posts/authors` | (호출 0건) | 🔴 BE_ONLY | — | `PostController#getPostListByAuthor` | 동상 |
| 51 | GET | `/api/comments/posts/{postId}` 등 13개 comment | (호출 0건) | 🔴 BE_ONLY | — | `CommentController#*` (11 endpoints) | community 모바일 mock — 댓글 화면 자체 없음. BE 만 풀세트 구현 |
| 52 | GET | `/api/post-reactions/*` 5개 | (호출 0건) | 🔴 BE_ONLY | — | `PostReactionController#*` | 동상 |
| 53 | GET | `/api/comment-reactions/*` 5개 | (호출 0건) | 🔴 BE_ONLY | — | `CommentReactionController#*` | 동상 |
| 54 | GET | `/api/tags` 등 2개 | (호출 0건) | 🔴 BE_ONLY | — | `TagController#*` | 동상 (admin tag 만 FE 사용) |
| 55 | GET | `/api/post-tags/*` 5개 | (호출 0건) | 🔴 BE_ONLY | — | `PostTagController#*` | 동상 |
| 56 | GET | `/api/reports/me` 등 2개 | (호출 0건) | 🔴 BE_ONLY | — | `ReportController#*` | community 신고 미구현 |
| 57 | GET | `/api/admin/comments/*` 5개 | (호출 0건) | 🔴 BE_ONLY | — | `AdminCommentController#*` | admin community 화면에 댓글 관리 미구현 |
| 58 | GET | `/api/admin/reports/*` 6개 | (호출 0건) | 🔴 BE_ONLY | — | `AdminReportController#*` | admin 신고 관리 미구현 |
| 59 | GET | `/api/dev/test-token` | (호출 0건) | 🔴 BE_ONLY ⚠ | — | `SwaggerController#getTestToken` | ★ **운영 노출 위험**: 누구나 ADMIN JWT 발급 가능 (auth-and-flags.md:62). FE 호출 0건이지만 BE 노출 자체가 위험. **권장 액션**: SecurityConfig 에 `permitAll` 제외 또는 컨트롤러 prod profile guard |

---

## 검증 포인트별 결론

### 1. `requestLatestQuizAnswer` thunk

- **결론: BE endpoint 살아있음, FE path 가 다름 + dispatch 누락 (이중 버그)**
- BE: `GET /api/quiz/latest` (`endpoints.md:212`, `QuizController#getLatest`)
- FE: thunk 정의만 있고 path 가 `/quiz-answers/latest` (`fe/api-calls.md:26,70`) — admin 쪽 path 와 헷갈렸을 가능성. dispatch 호출처도 0건
- **연결 누락 + path 오류**. HomeScreen QuizSection 빈카드 원인. 모바일 home 리뉴얼에 필수 fix
- 권장 액션:
  1. `web/src/domains/quiz/store/public/endpoints.js:2` path 를 `/quiz/latest` 로 변경
  2. `HomeScreen.jsx` 에서 `useDispatch(requestLatestQuizAnswer())` 추가 (마운트 시)
  3. `QuizSection` props 로 응답 imageUrl/round 전달

### 2. V2 `fun_player_card` 컨트롤러

- **결론: FE 가 호출 안 함 → 운영 영향 0**
- FE 측 spot-check (`grep "/player-cards|FunPlayerCard"` in `web/src`): **0건**
- BE 빈 DTO + namespace mismatch 는 호출되면 즉시 깨지지만, 현재 호출 경로 없음
- 권장 액션: V2 player_card 작업 재개 전까지는 그대로 둠. **단 모바일 player_card 화면 신규 생성 시 즉시 깨짐 — figma-spec-validator 가 player_card 화면 발견하면 차단**

### 3. community admin path 미스매치 (#35–43)

- **결론: spec 단에서는 분명한 불일치. 하지만 admin community 화면이 운영 중이라는 표기 (`fe/api-calls.md:56`) 가 있음 → 실제로는 작동 중일 가능성**
- FE 가 보내는 path `/community/admin/boards` 등은 BE 컨트롤러 매핑과 다름. 둘 중 하나가 spec 분석 단의 정규화 오류일 가능성
- **spot-check 권장**:
  - `web/src/domains/community/store/api.js:9` 의 `fetchGetAllBoardLists` 의 axios path 직접 확인
  - `src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminBoardController.java:11` 의 `@RequestMapping` 직접 확인
- 둘 다 spec 그대로면 admin community 가 100% 깨진 상태이므로 **즉시 수정 필요** (admin community 가 정상 운영 중인지 dev 환경 검증 우선)

### 4. quiz admin path 미스매치 (#31–34)

- **결론: spec 상 불일치. admin quiz 가 정상 운영 표기와 충돌**
- spot-check 권장: `web/src/domains/quiz/store/admin/endpoints.js` 직접 확인 + `AdminQuizController.java:11` 매핑 확인
- visible toggle (#34) 은 BE 미구현 — admin quiz 화면 토글 누르면 무조건 404

### 5. notices admin method 미스매치 (#23, #24)

- BE 는 PUT (file:48), FE 는 PATCH (api.js:6) — spec 그대로면 admin notice update 도 깨짐
- spot-check 권장

---

## 요약

- **MATCH (정상)**: 16건 (public 화면 + admin notice/quiz/playerCard meta 일부)
- **MATCH(legacy)**: 6건 (라우트 주석 화면들)
- **FE_ONLY (미스매치 의심)**: 14건 — 대부분 admin community / admin quiz / quiz public path 차이. 운영 가능성 검증 필요
- **BE_ONLY**: 35+건 — community 도메인 (post/comment/reaction/tag/report) BE 풀세트 vs FE mock-only. 가장 큰 갭
- **DEAD_BOTH**: 2건 (V2 fun_player_card 빈 컨트롤러, kbo matches detail)

**가장 큰 차단성 미스매치 (모바일 리뉴얼 영향)**:
1. `quiz-answers/latest` path 오타 + dispatch 누락 (HomeScreen 빈 퀴즈 카드)
2. community admin path 의 prefix 불일치 (admin 화면 동작 검증 필요)
3. community 모바일 BE 미연결 (35+ BE_ONLY) — 모바일 community 화면이 mock 인 동안 정상이지만, 다음 마일스톤에 즉시 차단성

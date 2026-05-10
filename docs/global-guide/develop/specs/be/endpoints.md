# BE endpoints

> 코드 baseline (`src/main/java/com/dawne/com2usbaseball/domain/**/controller/`).
> 인증 표기:
> - `permitAll` — `SecurityConfig` 의 `/api/**` permitAll. JwtAuthFilter 가 토큰 시 SecurityContext 만 세팅
> - `ADMIN` — `/api/admin/**` 자동 가드 (`hasRole("ADMIN")`) + 컨트롤러 `@PreAuthorize("hasRole('ADMIN')")` 이중
> - `JWT` — 컨트롤러가 `request.getAttribute("userId")` 로 직접 토큰 사용
> - **`@EnableMethodSecurity` 활성** → `@PreAuthorize` 실제 동작
> 모든 응답은 GlobalResponseAdvice 가 `GlobalResponse<T>` 로 자동 wrap (Void / GlobalResponse / byte[] / String 제외).

---

## /api/auth (oauth/AuthController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/auth/naver/callback` | naverCallback | query: `code, state` | 302 Redirect + Set-Cookie ACCESS_TOKEN + REFRESH_TOKEN | permitAll (filter `shouldNotFilter`) | NaverOAuth → JWT 발급. redirect URL 은 host 따라 `localhost:3000` / `compyafun.com` |
| POST | `/api/auth/refresh` | refresh | (REFRESH_TOKEN cookie) | `GlobalResponse<Void>` + Set-Cookie 양쪽 재발급 | permitAll (filter skip) | rotation: 기존 refresh DELETE 후 신규 발급 |
| POST | `/api/auth/logout` | logout | (REFRESH_TOKEN cookie) | `GlobalResponse<Void>` + 양쪽 cookie 만료 | permitAll (filter skip) | refresh DB row DELETE |

## /api/users (oauth/UserController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/users/me` | getMe | (ACCESS_TOKEN cookie) | `GlobalResponse<UserMeResponse>` | JWT 필요 (없으면 컨트롤러가 `BaseException(AUTH_UNAUTHORIZED, 401)` throw) | userStatus BLOCKED/SUSPENDED/WITHDRAWN → 403 |

## /api/dev (admin/SwaggerController) — `@Profile("local")`

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/dev/test-token` | getTestToken | — | ResponseEntity + Set-Cookie ACCESS_TOKEN (ADMIN 1L) | permitAll | local 프로파일 한정. swagger 테스트 |
| GET | `/api/dev/logout` | logout | — | ResponseEntity + Set-Cookie 만료 | permitAll | |

## /api/upload (admin/UploadController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| POST | `/api/upload/events` | uploadImage | `MultipartFile file` | `String` (S3 URL) | permitAll ⚠ 실제로 admin 용인데 `/api/admin/**` 가 아니어서 가드 없음 | S3 `uploads/images/{uuid}.{ext}` |

## /api/coupons (coupon/CouponController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/coupons` | getCouponLists | — | `GlobalResponse<List<CouponResponse>>` | permitAll | `coupons::public` |

## /api/admin/coupons (coupon/CouponAdminController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/coupons` | getCouponLists | — | `GlobalResponse<List<CouponResponse>>` | ADMIN | `coupons::admin` |
| POST | `/api/admin/coupons` | insertNewCoupons | body: `CouponRequest` | `GlobalResponse<CouponResponse>` | ADMIN | evict `coupons::admin/public` (after-commit) |
| PATCH | `/api/admin/coupons/{id}` | updateCoupon | body: `CouponRequest` | `GlobalResponse<CouponResponse>` | ADMIN | evict 동일 |
| PATCH | `/api/admin/coupons/{id}/visible` | updateCouponVisible | body: `CouponVisibleRequest{visible}` | `GlobalResponse<Void>` | ADMIN | evict 동일 |

> conflict: `coupon_code` UNIQUE 위반 시 `BaseException(COUPON_CODE_DUPLICATED, 409)` (DataIntegrityViolation 캐치).

## /api/events (event/EventController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/events/external` | getExternalEventList | — | `GlobalResponse<List<EventResponse>>` | permitAll | `events::external::public` |

## /api/admin/events (event/AdminEventController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/events/external` | getExternalEventList | — | `GlobalResponse<List<EventResponse>>` | ADMIN | `events::external::admin` |
| POST | `/api/admin/events` | insertNewEvent | body: `EventRequest` | `GlobalResponse<EventResponse>` | ADMIN | evict admin+public |
| PATCH | `/api/admin/events/{id}` | updateExternalEvent | body: `EventRequest` | `GlobalResponse<EventResponse>` | ADMIN | evict |
| PATCH | `/api/admin/events/{id}/visible` | updateExternalEventVisible | body: `EventVisibleRequest{visible}` | `GlobalResponse<Void>` | ADMIN | evict |

## /api/notices (notice/NoticeController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/notices` | getNoticeList | — | `GlobalResponse<List<NoticeResponse>>` | permitAll | `notice::public` |
| GET | `/api/notices/{noticeId}` | getNoticeDetail | path: `noticeId:Long` | `GlobalResponse<NoticeResponse>` | permitAll | `noticeDetail::{noticeId}_public` |

## /api/admin/notices (notice/AdminNoticeController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/notices` | getAdminNoticeList | — | `GlobalResponse<List<NoticeResponse>>` | ADMIN ⚠ `@PreAuthorize` 없음. URL 가드만 (1 단계) | `notice::admin` |
| GET | `/api/admin/notices/{noticeId}` | getAdminNoticeDetail | path | `GlobalResponse<NoticeResponse>` | ADMIN | `noticeDetail::{id}_admin` |
| POST | `/api/admin/notices` | createNotice | body: `NoticeRequest` | `GlobalResponse<NoticeResponse>` | ADMIN | evict notice public+admin |
| PUT | `/api/admin/notices/{noticeId}` | updateNotice | body: `NoticeRequest` | `GlobalResponse<NoticeResponse>` | ADMIN | evict + noticeDetail 4 키 |
| PATCH | `/api/admin/notices/{noticeId}/visible` | updateNoticeVisible | body: `NoticeVisibleRequest{isVisible}` | `GlobalResponse<Void>` | ADMIN | evict |
| PATCH | `/api/admin/notices/{noticeId}/pinned` | updateNoticePinned | body: `NoticePinnedRequest{isPinned}` | `GlobalResponse<Void>` | ADMIN | evict |
| DELETE | `/api/admin/notices/{noticeId}` | deleteNotice | path | `GlobalResponse<Void>` | ADMIN | evict |

> Notice content 는 service 단에서 `Jsoup.clean(html, Safelist.relaxed())` sanitize. INTERNAL → content 필수+externalUrl null / EXTERNAL → externalUrl 필수+content null (`validateSourcePayload`).

## /api/quiz (quiz/QuizController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/quiz/latest` | getLatest | — | `GlobalResponse<QuizResponse>` | permitAll | `quiz::latest` |

## /api/admin/quiz (quiz/AdminQuizController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/quiz` | getAll | — | `GlobalResponse<List<QuizResponse>>` | ADMIN ⚠ `@PreAuthorize` 없음 | `quiz::admin` |
| POST | `/api/admin/quiz` | create | body: `QuizRequest` | `GlobalResponse<QuizResponse>` | ADMIN | evict `quiz::admin+latest` |
| PATCH | `/api/admin/quiz/{id}` | update | body: `QuizRequest` | `GlobalResponse<QuizResponse>` | ADMIN | evict |
| DELETE | `/api/admin/quiz/{id}` | delete | path | `GlobalResponse<Void>` | ADMIN | evict |

> conflict: `round` UNIQUE → `BaseException(QUIZ_ROUND_DUPLICATED, 409)` (DuplicateKeyException 캐치).

## /api/boards (community/BoardController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/boards` | getVisibleBoardList | — | `List<BoardResponse>` | permitAll | visible 만 |
| GET | `/api/boards/{id}` | getBoardDetail | path: `id` | `BoardResponse` | permitAll | |
| GET | `/api/boards/code/{code}` | getBoardDetailByCode | path: `code:String` | `BoardResponse` | permitAll | |

## /api/admin/boards (community/AdminBoardController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/admin/boards` | getBoardList | — | `List<BoardResponse>` | ADMIN ⚠ `@PreAuthorize` 없음 |
| GET | `/api/admin/boards/{id}` | getBoardDetail | path | `BoardResponse` | ADMIN |
| POST | `/api/admin/boards` | createBoard | body: `BoardRequest` | `Long` | ADMIN |
| PUT | `/api/admin/boards/{id}` | updateBoard | body: `BoardRequest` | 200 void | ADMIN |
| PATCH | `/api/admin/boards/{id}/visible` | updateBoardVisible | query: `isVisible:Boolean` | 200 void | ADMIN |
| DELETE | `/api/admin/boards/{id}` | deleteBoard | path | 200 void | ADMIN |

## /api/posts (community/PostController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/posts/boards/{boardId}` | getPostListByBoardId | path | `List<PostResponse>` | permitAll |
| GET | `/api/posts/boards/{boardId}/pinned` | getPinnedPostListByBoardId | path | `List<PostResponse>` | permitAll |
| GET | `/api/posts/boards/{boardId}/popular` | getPopularPostListByBoardId | path | `List<PostResponse>` | permitAll |
| GET | `/api/posts/{id}` | getPostDetail | path | `PostResponse` | permitAll (view count side-effect) |
| GET | `/api/posts/authors` | getPostListByAuthor | query: `userRoleType:UserRoleType, authorId:Long` | `List<PostResponse>` | permitAll |

## /api/admin/posts (community/AdminPostController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/admin/posts/{id}` | getPostDetail | path | `PostResponse` | ADMIN ⚠ `@PreAuthorize` 없음 |
| POST | `/api/admin/posts` | createPost | body: `PostRequest` | `Long` | ADMIN |
| PUT | `/api/admin/posts/{id}` | updatePost | body: `PostRequest` | 200 void | ADMIN |
| PATCH | `/api/admin/posts/{id}/visible` | updatePostVisible | query: `isVisible:Boolean` | 200 void | ADMIN |
| PATCH | `/api/admin/posts/{id}/pinned` | updatePostPinned | query: `isPinned:Boolean` | 200 void | ADMIN |
| DELETE | `/api/admin/posts/{id}` | deletePost | path | 200 void | ADMIN |

## /api/comments (community/CommentController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/comments/posts/{postId}` | getCommentListByPostId | path | `ListResponse<CommentResponse>` | permitAll | |
| GET | `/api/comments/{id}` | getCommentDetail | path | `CommentResponse` | permitAll | |
| GET | `/api/comments/{parentCommentId}/replies` | getReplyListByParentCommentId | path | `ListResponse<CommentResponse>` | permitAll | |
| POST | `/api/comments` | createComment | body: `CommentRequest` | `CommentResponse` | permitAll ⚠ 작성자 검증 없음 |
| PUT | `/api/comments/{id}` | updateComment | body | `CommentResponse` | permitAll ⚠ |
| POST | `/api/comments/{id}/like` | increaseCommentLikeCount | path | 200 void | permitAll ⚠ |
| DELETE | `/api/comments/{id}/like` | decreaseCommentLikeCount | path | 200 void | permitAll ⚠ |
| POST | `/api/comments/{id}/dislike` | increaseCommentDislikeCount | path | 200 void | permitAll ⚠ |
| DELETE | `/api/comments/{id}/dislike` | decreaseCommentDislikeCount | path | 200 void | permitAll ⚠ |
| POST | `/api/comments/{id}/report` | increaseCommentReportCount | path | 200 void | permitAll ⚠ |
| DELETE | `/api/comments/{id}` | deleteComment | path | 200 void | permitAll ⚠ |

## /api/admin/comments (community/AdminCommentController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/admin/comments/posts/{postId}` | getCommentListByPostId | path | `ListResponse<CommentResponse>` | ADMIN ⚠ `@PreAuthorize` 없음 |
| GET | `/api/admin/comments/{id}` | getCommentDetail | path | `CommentResponse` | ADMIN |
| GET | `/api/admin/comments/{parentCommentId}/replies` | getReplyListByParentCommentId | path | `ListResponse<CommentResponse>` | ADMIN |
| PATCH | `/api/admin/comments/{id}/visible` | updateCommentVisible | body: `ChangeCommentVisibleRequest` | 200 void | ADMIN |
| DELETE | `/api/admin/comments/{id}` | deleteComment | path | 200 void | ADMIN |

## /api/post-reactions (community/PostReactionController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/post-reactions/posts/{postId}` | getPostReactionListByPostId | path | `ListResponse<PostReactionResponse>` | permitAll |
| GET | `/api/post-reactions/users/{userId}` | getPostReactionListByUserId | path | `ListResponse<PostReactionResponse>` | permitAll ⚠ 본인검증 없음 |
| GET | `/api/post-reactions` | getPostReaction | query: `postId, userId` | `PostReactionResponse` | permitAll |
| POST | `/api/post-reactions` | savePostReaction | body: `PostReactionRequest{postId,userId,reaction:LIKE|DISLIKE}` | `PostReactionResponse` | permitAll ⚠ userId 위변조 가능 |
| DELETE | `/api/post-reactions` | deletePostReaction | query: `postId, userId` | 200 void | permitAll ⚠ |

## /api/comment-reactions (community/CommentReactionController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/comment-reactions/comments/{commentId}` | getCommentReactionListByCommentId | path | `ListResponse<CommentReactionResponse>` | permitAll |
| GET | `/api/comment-reactions/users/{userId}` | getCommentReactionListByUserId | path | `ListResponse<CommentReactionResponse>` | permitAll ⚠ |
| GET | `/api/comment-reactions` | getCommentReaction | query: `commentId, userId` | `CommentReactionResponse` | permitAll |
| POST | `/api/comment-reactions` | saveCommentReaction | body: `CommentReactionRequest` | `CommentReactionResponse` | permitAll ⚠ |
| DELETE | `/api/comment-reactions` | deleteCommentReaction | query: `commentId, userId` | 200 void | permitAll ⚠ |

## /api/post-tags (community/PostTagController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/post-tags/posts/{postId}` | getPostTagListByPostId | path | `ListResponse<PostTagResponse>` | permitAll |
| GET | `/api/post-tags/tags/{tagId}` | getPostTagListByTagId | path | `ListResponse<PostTagResponse>` | permitAll |
| POST | `/api/post-tags` | createPostTag | body: `PostTagRequest` | `PostTagResponse` | permitAll ⚠ 작성자 검증 없음 |
| DELETE | `/api/post-tags` | deletePostTag | query: `postId, tagId` | 200 void | permitAll ⚠ |
| PUT | `/api/post-tags/replace` | replacePostTags | body: `ReplacePostTagRequest` | 200 void | permitAll ⚠ |

## /api/tags (community/TagController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/tags` | getVisibleTagList | — | `ListResponse<TagResponse>` | permitAll |
| GET | `/api/tags/code/{code}` | getTagDetailByCode | path | `TagResponse` | permitAll |

## /api/admin/tags (community/AdminTagController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/admin/tags` | getTagList | — | `ListResponse<TagResponse>` | ADMIN ⚠ `@PreAuthorize` 없음 |
| GET | `/api/admin/tags/{id}` | getTagDetail | path | `TagResponse` | ADMIN |
| POST | `/api/admin/tags` | createTag | body: `TagRequest` | `TagResponse` | ADMIN |
| PUT | `/api/admin/tags/{id}` | updateTag | body | `TagResponse` | ADMIN |
| PATCH | `/api/admin/tags/{id}/visible` | updateTagVisible | body: `ChangeTagVisibleRequest` | 200 void | ADMIN |
| DELETE | `/api/admin/tags/{id}` | deleteTag | path | 200 void | ADMIN |

## /api/reports (community/ReportController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/reports/me` | getReportByReporter | query: `targetType:ReportTargetType, targetId:Long, reporterId:Long` | `ReportResponse` | permitAll ⚠ reporterId 위변조 |
| POST | `/api/reports` | createReport | body: `ReportRequest` | `ReportResponse` | permitAll ⚠ |

## /api/admin/reports (community/AdminReportController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| GET | `/api/admin/reports` | getReportList | — | `ListResponse<ReportResponse>` | ADMIN ⚠ `@PreAuthorize` 없음 |
| GET | `/api/admin/reports/pending` | getPendingReportList | — | `ListResponse<ReportResponse>` | ADMIN |
| GET | `/api/admin/reports/target` | getReportListByTarget | query: `targetType, targetId` | `ListResponse<ReportResponse>` | ADMIN |
| GET | `/api/admin/reports/{id}` | getReportDetail | path | `ReportResponse` | ADMIN |
| PATCH | `/api/admin/reports/{id}/status` | updateReportStatus | body: `ChangeReportStatusRequest` | 200 void | ADMIN |
| DELETE | `/api/admin/reports/{id}` | deleteReport | path | 200 void | ADMIN |

## /api/player-cards (fun/playerCard/FunPlayerCardController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| (없음) | — | — | — | — | — | controller body 비어 있음. user endpoint 미구현 |

## /api/admin/player-cards (fun/playerCard/FunAdminPlayerCardController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth |
|---|---|---|---|---|---|
| POST | `/api/admin/player-cards` | create | body: `FunPlayerCardCreateRequest` | `Long` | ADMIN ⚠ `@PreAuthorize` 없음 |
| PUT | `/api/admin/player-cards/{id}` | update | body: `FunPlayerCardUpdateRequest` | 200 void | ADMIN |
| GET | `/api/admin/player-cards/{id}` | get | path | `FunPlayerCardResponse` | ADMIN |

> ⚠ Bean 이름 충돌 방지로 `@RestController("PlayerCardControllerV2")` / `("AdminPlayerCardControllerV2")` 별칭 사용. 같은 path prefix `/api/player-cards` (User 비어 있음) + `/api/admin/player-cards` (Admin 부분 구현).

## /api/player (player/PlayerCardController) — legacy

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/player/{position}` | getLegendPlayerByPosition | path: `position:Target` (HITTER/PITCHER) | `List<LegendPlayerCardResponse>` | permitAll | `playerInfoByTarget::#target` |

## /api/admin/player (player/AdminPlayerCardController) — legacy

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/player/teams` | getPlayerTeams | — | `ListResponse<TeamResponse>` | ADMIN | |
| POST | `/api/admin/player` | createPlayerCard | body: `AdminPlayerCardCreateRequest` | `OperationResponse<PlayerMessages>` | ADMIN | |
| (주석) | `/api/admin/player`, `/api/admin/player/grade/{grade}`, `/api/admin/player/{id}`, `/api/admin/player/{id}/attribute`, `/api/admin/player/list`, `/api/admin/player/list/attribute` | — | — | — | — | 6 개 메서드 코드 주석 처리 (미구현) |

## /api/skills (skill/SkillController)

| METHOD | PATH | 메서드 | 요청 | 응답 | auth | 캐시 |
|---|---|---|---|---|---|---|
| GET | `/api/skills/{target}` | playerTypeSkills | path: `target:Target` (HITTER/PITCHER) | `SkillSetResponse` | permitAll | `playerSkillSetByTarget::#target` |
| GET | `/api/skills/coach` | coachSkills | — | `CoachSkillSetResponse` | permitAll | `coachSkills` |
| GET | `/api/skills/score-config` | skillScoreConfig | — | `SkillScoreConfigResponse` | permitAll | `skillScoreConfig` |

> ⚠ 라우트 충돌 위험: `GET /api/skills/coach` 가 `/api/skills/{target}` 와 매칭될 수 있음. Spring 의 specific match 우선 규칙으로 동작 중이지만, target enum 에 `COACH` 가 추가되면 충돌. 신규 추가 시 prefix `/players/{target}` 식 분리 권장 ❓.

---

## 핵심 보안 갭 (auth-and-flags.md 참조)

1. ⚠ **community / fun/playerCard / 일부 admin 컨트롤러에 `@PreAuthorize` 없음** — `/api/admin/**` URL 가드만으로 차단됨. 다중 가드 표준 위반.
2. ⚠ **userId/reporterId 가 request body/query 로 전달** — JWT subject 와 비교 검증 없음. `getMe` 외에는 `request.getAttribute("userId")` 무사용.
3. ⚠ **community user endpoint 작성자 검증 부재** — 누구나 다른 사람 댓글/태그 수정·삭제 가능.
4. ⚠ **`/api/upload/events`** — admin 기능이지만 `/api/admin/**` 외부에 위치. 모든 사용자 업로드 가능.

# BE Endpoints

> 전체 REST 엔드포인트. 프로젝트 1회 분석. 도메인 namespace 없이 flat.
> 인증 표기: `permitAll` = SecurityConfig `/api/**` permitAll, `ADMIN` = SecurityConfig `/api/admin/**` hasRole("ADMIN"), `JWT` = JwtAuthFilter 가 토큰 시 SecurityContext 설정 (단 컨트롤러가 userId 필요 시 명시)
> ★ `@PreAuthorize` 는 코드에 3 개 존재하지만 `@EnableMethodSecurity` 미선언 → **무효**. 실제 가드는 SecurityConfig URL 매칭만.
> 모든 엔드포인트는 컨트롤러 단위 prefix + 메서드 path (전역 prefix 없음).

---

## /api/auth (oauth/AuthController)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/auth/naver/callback` | AuthController#naverCallback (src/main/java/com/dawne/com2usbaseball/domain/oauth/controller/AuthController.java:28) | query: `code:String, state:String` | 302 Redirect (Set-Cookie: ACCESS_TOKEN) | permitAll (JwtAuthFilter `shouldNotFilter` 로 필터 우회) | NaverOAuth → JWT 발급 |
| POST | `/api/auth/logout` | AuthController#logout (.../AuthController.java:48) | (none) | 200 (Set-Cookie 만료) | permitAll | stateless 쿠키 만료 |

## /api/users (oauth/UserController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/users/me` | UserController#getMe (src/main/java/com/dawne/com2usbaseball/domain/oauth/controller/UserController.java:23) | (헤더 `Authorization: Bearer` 또는 ACCESS_TOKEN 쿠키) | `GlobalResponse<UserMeResponse{id,nickname,email,profileImage,userRole,lastLoginAt}>` | JWT 필요 (없으면 컨트롤러 401 throw) | userStatus BLOCKED/SUSPENDED/WITHDRAWN 시 403 |

## /api/boards (community/BoardController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/boards` | BoardController#getVisibleBoardList (src/main/java/com/dawne/com2usbaseball/domain/community/controller/BoardController.java:19) | (none) | `List<BoardResponse>` | permitAll | visible 만 |
| GET | `/api/boards/{id}` | BoardController#getBoardDetail (.../BoardController.java:28) | path: `id:Long` | `BoardResponse` | permitAll | |
| GET | `/api/boards/code/{code}` | BoardController#getBoardDetailByCode (.../BoardController.java:33) | path: `code:String` | `BoardResponse` | permitAll | |

## /api/admin/boards (community/AdminBoardController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/boards` | AdminBoardController#getBoardList (src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminBoardController.java:21) | (none) | `List<BoardResponse>` | ADMIN | all (visible + hidden) |
| GET | `/api/admin/boards/{id}` | AdminBoardController#getBoardDetail (.../AdminBoardController.java:29) | path: `id:Long` | `BoardResponse` | ADMIN | |
| POST | `/api/admin/boards` | AdminBoardController#createBoard (.../AdminBoardController.java:34) | body: `BoardRequest{code,name,description,userRoleType,readRoleType,useComment,useLike,useTag,isVisible,sortOrder}` | `Long` (id) | ADMIN | |
| PUT | `/api/admin/boards/{id}` | AdminBoardController#updateBoard (.../AdminBoardController.java:40) | path: `id:Long`; body: `BoardRequest` | 200 void | ADMIN | |
| PATCH | `/api/admin/boards/{id}/visible` | AdminBoardController#updateBoardVisible (.../AdminBoardController.java:47) | path: `id`; query: `isVisible:Boolean` | 200 void | ADMIN | |
| DELETE | `/api/admin/boards/{id}` | AdminBoardController#deleteBoard (.../AdminBoardController.java:53) | path: `id:Long` | 200 void | ADMIN | |

## /api/posts (community/PostController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/posts/boards/{boardId}` | PostController#getPostListByBoardId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/PostController.java:20) | path: `boardId:Long` | `List<PostResponse>` | permitAll | |
| GET | `/api/posts/boards/{boardId}/pinned` | PostController#getPinnedPostListByBoardId (.../PostController.java:28) | path: `boardId:Long` | `List<PostResponse>` | permitAll | |
| GET | `/api/posts/boards/{boardId}/popular` | PostController#getPopularPostListByBoardId (.../PostController.java:36) | path: `boardId:Long` | `List<PostResponse>` | permitAll | |
| GET | `/api/posts/{id}` | PostController#getPostDetail (.../PostController.java:44) | path: `id:Long` | `PostResponse` | permitAll | view count 증가 side-effect |
| GET | `/api/posts/authors` | PostController#getPostListByAuthor (.../PostController.java:49) | query: `userRoleType:UserRoleType, authorId:Long` | `List<PostResponse>` | permitAll | |

> **노트**: `PostServiceImpl` 에는 `increasePostLikeCount/Dislike/CommentCount/ReportCount` 메서드가 존재하지만 컨트롤러 노출 없음 (PostReactionService 가 카운터 갱신 주도하는 것으로 추정). Comment 와 비대칭. 호출 흔적은 dead-suspects.md 참조.

## /api/admin/posts (community/AdminPostController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/posts/{id}` | AdminPostController#getPostDetail (src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminPostController.java:19) | path: `id:Long` | `PostResponse` | ADMIN | view count 증가 없음 |
| POST | `/api/admin/posts` | AdminPostController#createPost (.../AdminPostController.java:24) | body: `PostRequest{boardId,userRoleType,authorId,authorName,title,content,linkType,externalUrl,isPinned,isVisible}` | `Long` | ADMIN | |
| PUT | `/api/admin/posts/{id}` | AdminPostController#updatePost (.../AdminPostController.java:30) | path: `id`; body: `PostRequest` | 200 void | ADMIN | |
| PATCH | `/api/admin/posts/{id}/visible` | AdminPostController#updatePostVisible (.../AdminPostController.java:37) | path: `id`; query: `isVisible:Boolean` | 200 void | ADMIN | |
| PATCH | `/api/admin/posts/{id}/pinned` | AdminPostController#updatePostPinned (.../AdminPostController.java:43) | path: `id`; query: `isPinned:Boolean` | 200 void | ADMIN | |
| DELETE | `/api/admin/posts/{id}` | AdminPostController#deletePost (.../AdminPostController.java:49) | path: `id:Long` | 200 void | ADMIN | |

## /api/comments (community/CommentController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/comments/posts/{postId}` | CommentController#getCommentListByPostId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/CommentController.java:17) | path: `postId:Long` | `ListResponse<CommentResponse>` | permitAll | |
| GET | `/api/comments/{id}` | CommentController#getCommentDetail (.../CommentController.java:22) | path: `id:Long` | `CommentResponse` | permitAll | |
| GET | `/api/comments/{parentCommentId}/replies` | CommentController#getReplyListByParentCommentId (.../CommentController.java:27) | path: `parentCommentId:Long` | `ListResponse<CommentResponse>` | permitAll | path 이름이 `{id}` 와 충돌 가능 (Spring 매칭 우선순위로 specific 먼저) |
| POST | `/api/comments` | CommentController#createComment (.../CommentController.java:32) | body: `CommentRequest{postId,parentCommentId,userRoleType,authorId,authorName,content,isVisible}` | `CommentResponse` | permitAll (★ 작성자 검증 없음) | |
| PUT | `/api/comments/{id}` | CommentController#updateComment (.../CommentController.java:37) | path: `id`; body: `CommentRequest` | `CommentResponse` | permitAll (★ 작성자 검증 없음) | |
| POST | `/api/comments/{id}/like` | CommentController#increaseCommentLikeCount (.../CommentController.java:43) | path: `id:Long` | 200 void | permitAll | |
| DELETE | `/api/comments/{id}/like` | CommentController#decreaseCommentLikeCount (.../CommentController.java:48) | path: `id:Long` | 200 void | permitAll | |
| POST | `/api/comments/{id}/dislike` | CommentController#increaseCommentDislikeCount (.../CommentController.java:53) | path: `id:Long` | 200 void | permitAll | |
| DELETE | `/api/comments/{id}/dislike` | CommentController#decreaseCommentDislikeCount (.../CommentController.java:58) | path: `id:Long` | 200 void | permitAll | |
| POST | `/api/comments/{id}/report` | CommentController#increaseCommentReportCount (.../CommentController.java:63) | path: `id:Long` | 200 void | permitAll | report 카운터만 증가 (별도 ReportController 와 중복 가능) |
| DELETE | `/api/comments/{id}` | CommentController#deleteComment (.../CommentController.java:68) | path: `id:Long` | 200 void | permitAll (★ 작성자 검증 없음) | |

## /api/admin/comments (community/AdminCommentController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/comments/posts/{postId}` | AdminCommentController#getCommentListByPostId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminCommentController.java:17) | path: `postId:Long` | `ListResponse<CommentResponse>` | ADMIN | |
| GET | `/api/admin/comments/{id}` | AdminCommentController#getCommentDetail (.../AdminCommentController.java:22) | path: `id:Long` | `CommentResponse` | ADMIN | |
| GET | `/api/admin/comments/{parentCommentId}/replies` | AdminCommentController#getReplyListByParentCommentId (.../AdminCommentController.java:27) | path: `parentCommentId:Long` | `ListResponse<CommentResponse>` | ADMIN | |
| PATCH | `/api/admin/comments/{id}/visible` | AdminCommentController#updateCommentVisible (.../AdminCommentController.java:32) | path: `id`; body: `ChangeCommentVisibleRequest{isVisible}` | 200 void | ADMIN | |
| DELETE | `/api/admin/comments/{id}` | AdminCommentController#deleteComment (.../AdminCommentController.java:38) | path: `id:Long` | 200 void | ADMIN | |

## /api/post-reactions (community/PostReactionController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/post-reactions/posts/{postId}` | PostReactionController#getPostReactionListByPostId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/PostReactionController.java:17) | path: `postId:Long` | `ListResponse<PostReactionResponse>` | permitAll | |
| GET | `/api/post-reactions/users/{userId}` | PostReactionController#getPostReactionListByUserId (.../PostReactionController.java:22) | path: `userId:Long` | `ListResponse<PostReactionResponse>` | permitAll (★ 본인검증 없음) | |
| GET | `/api/post-reactions` | PostReactionController#getPostReaction (.../PostReactionController.java:27) | query: `postId:Long, userId:Long` | `PostReactionResponse` | permitAll | |
| POST | `/api/post-reactions` | PostReactionController#savePostReaction (.../PostReactionController.java:33) | body: `PostReactionRequest{postId,userId,reaction:LIKE|DISLIKE}` | `PostReactionResponse` | permitAll (★ userId 위변조 가능) | |
| DELETE | `/api/post-reactions` | PostReactionController#deletePostReaction (.../PostReactionController.java:38) | query: `postId:Long, userId:Long` | 200 void | permitAll (★ 동일) | |

## /api/comment-reactions (community/CommentReactionController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/comment-reactions/comments/{commentId}` | CommentReactionController#getCommentReactionListByCommentId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/CommentReactionController.java:17) | path: `commentId:Long` | `ListResponse<CommentReactionResponse>` | permitAll | |
| GET | `/api/comment-reactions/users/{userId}` | CommentReactionController#getCommentReactionListByUserId (.../CommentReactionController.java:22) | path: `userId:Long` | `ListResponse<CommentReactionResponse>` | permitAll (★ 본인검증 없음) | |
| GET | `/api/comment-reactions` | CommentReactionController#getCommentReaction (.../CommentReactionController.java:27) | query: `commentId:Long, userId:Long` | `CommentReactionResponse` | permitAll | |
| POST | `/api/comment-reactions` | CommentReactionController#saveCommentReaction (.../CommentReactionController.java:33) | body: `CommentReactionRequest{commentId,userId,reaction}` | `CommentReactionResponse` | permitAll (★ userId 위변조 가능) | |
| DELETE | `/api/comment-reactions` | CommentReactionController#deleteCommentReaction (.../CommentReactionController.java:38) | query: `commentId:Long, userId:Long` | 200 void | permitAll | |

## /api/tags (community/TagController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/tags` | TagController#getVisibleTagList (src/main/java/com/dawne/com2usbaseball/domain/community/controller/TagController.java:16) | (none) | `ListResponse<TagResponse>` | permitAll | |
| GET | `/api/tags/code/{code}` | TagController#getTagDetailByCode (.../TagController.java:21) | path: `code:String` | `TagResponse` | permitAll | |

## /api/admin/tags (community/AdminTagController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/tags` | AdminTagController#getTagList (src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminTagController.java:18) | (none) | `ListResponse<TagResponse>` | ADMIN | |
| GET | `/api/admin/tags/{id}` | AdminTagController#getTagDetail (.../AdminTagController.java:23) | path: `id:Long` | `TagResponse` | ADMIN | |
| POST | `/api/admin/tags` | AdminTagController#createTag (.../AdminTagController.java:28) | body: `TagRequest{code,name,description,isVisible}` | `TagResponse` | ADMIN | |
| PUT | `/api/admin/tags/{id}` | AdminTagController#updateTag (.../AdminTagController.java:33) | path: `id`; body: `TagRequest` | `TagResponse` | ADMIN | |
| PATCH | `/api/admin/tags/{id}/visible` | AdminTagController#updateTagVisible (.../AdminTagController.java:39) | path: `id`; body: `ChangeTagVisibleRequest{isVisible}` | 200 void | ADMIN | |
| DELETE | `/api/admin/tags/{id}` | AdminTagController#deleteTag (.../AdminTagController.java:45) | path: `id:Long` | 200 void | ADMIN | |

## /api/post-tags (community/PostTagController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/post-tags/posts/{postId}` | PostTagController#getPostTagListByPostId (src/main/java/com/dawne/com2usbaseball/domain/community/controller/PostTagController.java:18) | path: `postId:Long` | `ListResponse<PostTagResponse>` | permitAll | |
| GET | `/api/post-tags/tags/{tagId}` | PostTagController#getPostTagListByTagId (.../PostTagController.java:23) | path: `tagId:Long` | `ListResponse<PostTagResponse>` | permitAll | |
| POST | `/api/post-tags` | PostTagController#createPostTag (.../PostTagController.java:28) | body: `PostTagRequest{postId,tagId}` | `PostTagResponse` | permitAll (★ admin/작성자 검증 없음) | |
| DELETE | `/api/post-tags` | PostTagController#deletePostTag (.../PostTagController.java:33) | query: `postId:Long, tagId:Long` | 200 void | permitAll (★ 동일) | |
| PUT | `/api/post-tags/replace` | PostTagController#replacePostTags (.../PostTagController.java:39) | body: `ReplacePostTagRequest{postId, tagIds:List<Long>}` | 200 void | permitAll (★ 동일) | |

## /api/reports (community/ReportController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/reports/me` | ReportController#getReportByReporter (src/main/java/com/dawne/com2usbaseball/domain/community/controller/ReportController.java:17) | query: `targetType:ReportTargetType, targetId:Long, reporterId:Long` | `ReportResponse` | permitAll (★ reporterId 위변조 가능) | |
| POST | `/api/reports` | ReportController#createReport (.../ReportController.java:24) | body: `ReportRequest{targetType,targetId,reporterId,reason,detail}` | `ReportResponse` | permitAll (★ 동일) | |

## /api/admin/reports (community/AdminReportController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/reports` | AdminReportController#getReportList (src/main/java/com/dawne/com2usbaseball/domain/community/controller/AdminReportController.java:18) | (none) | `ListResponse<ReportResponse>` | ADMIN | |
| GET | `/api/admin/reports/pending` | AdminReportController#getPendingReportList (.../AdminReportController.java:23) | (none) | `ListResponse<ReportResponse>` | ADMIN | |
| GET | `/api/admin/reports/target` | AdminReportController#getReportListByTarget (.../AdminReportController.java:28) | query: `targetType:ReportTargetType, targetId:Long` | `ListResponse<ReportResponse>` | ADMIN | |
| GET | `/api/admin/reports/{id}` | AdminReportController#getReportDetail (.../AdminReportController.java:34) | path: `id:Long` | `ReportResponse` | ADMIN | |
| PATCH | `/api/admin/reports/{id}/status` | AdminReportController#updateReportStatus (.../AdminReportController.java:39) | path: `id`; body: `ChangeReportStatusRequest{status,reviewedBy}` | 200 void | ADMIN | |
| DELETE | `/api/admin/reports/{id}` | AdminReportController#deleteReport (.../AdminReportController.java:45) | path: `id:Long` | 200 void | ADMIN | |

## /api/coupons (coupon/CouponController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/coupons` | CouponController#getCouponLists (src/main/java/com/dawne/com2usbaseball/domain/coupon/controller/CouponController.java:21) | (none) | `GlobalResponse<List<CouponResponse{id,couponCode,title,detail,expireAt,visible}>>` | permitAll | site_coupons 만 SELECT. visible=true 필터 |

## /api/admin/coupons (coupon/AdminCouponController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/coupons` | AdminCouponController#getCouponLists (src/main/java/com/dawne/com2usbaseball/domain/coupon/controller/AdminCouponController.java:25) | (none) | `GlobalResponse<List<CouponResponse>>` | ADMIN | site_coupons 만 |
| POST | `/api/admin/coupons` | AdminCouponController#insertNewCoupons (.../AdminCouponController.java:33) | body: `CouponRequest{couponCode,title,detail,expireAt,visible}` | `GlobalResponse<CouponResponse>` | ADMIN | ★ INSERT 는 site_coupons, 생성 후 findById 는 coupons (legacy) — auth-and-flags.md 위험 항목 |
| PATCH | `/api/admin/coupons/{id}` | AdminCouponController#updateCoupon (.../AdminCouponController.java:40) | path: `id`; body: `CouponRequest` | `GlobalResponse<CouponResponse>` | ADMIN | UPDATE 는 site_coupons. findById 는 coupons → ID 매칭 깨질 위험 |
| PATCH | `/api/admin/coupons/{id}/visible` | AdminCouponController#updateCouponVisible (.../AdminCouponController.java:49) | path: `id`; body: `CouponVisibleRequest{visible}` | `GlobalResponse<Void>` | ADMIN | site_coupons UPDATE |

## /api/events (event/EventController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/events/external` | EventController#getExternalEventList (src/main/java/com/dawne/com2usbaseball/domain/event/controller/EventController.java:21) | (none) | `GlobalResponse<List<EventResponse{id,eventType,title,startAt,expireAt,imageUrl,externalLink,visible}>>` | permitAll | "external" 만 노출 |

> ★ 옛 .http 파일(`src/main/resources/test/event/getEventList.http`)은 `/api/events/list/external` 호출 — 현재 라우트와 일치하지 않음 (구식 stale 파일).

## /api/admin/events (event/AdminEventController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/events/external` | AdminEventController#getExternalEventList (src/main/java/com/dawne/com2usbaseball/domain/event/controller/AdminEventController.java:26) | (none) | `GlobalResponse<List<EventResponse>>` | ADMIN | |
| POST | `/api/admin/events` | AdminEventController#insertNewEvent (.../AdminEventController.java:32) | body: `EventRequest{eventType,title,startAt,expireAt,imageUrl,externalLink,visible}` | `GlobalResponse<EventResponse>` | ADMIN | |
| PATCH | `/api/admin/events/{id}` | AdminEventController#updateExternalEvent (.../AdminEventController.java:40) | path: `id`; body: `EventRequest` | `GlobalResponse<EventResponse>` | ADMIN | |
| PATCH | `/api/admin/events/{id}/visible` | AdminEventController#updateExternalEventVisible (.../AdminEventController.java:48) | path: `id`; body: `EventVisibleRequest{visible}` | `GlobalResponse<Void>` | ADMIN | |

## /api/notices (notice/NoticeController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/notices` | NoticeController#getNoticeList (src/main/java/com/dawne/com2usbaseball/domain/notice/controller/NoticeController.java:21) | (none) | `GlobalResponse<List<NoticeResponse{id,source,title,summary,content,externalUrl,imageUrl,isVisible,isPinned,publishedAt,createdAt,updatedAt}>>` | permitAll | |
| GET | `/api/notices/{noticeId}` | NoticeController#getNoticeDetail (.../NoticeController.java:29) | path: `noticeId:Long` | `GlobalResponse<NoticeResponse>` | permitAll | |

## /api/admin/notices (notice/AdminNoticeController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/notices` | AdminNoticeController#getAdminNoticeList (src/main/java/com/dawne/com2usbaseball/domain/notice/controller/AdminNoticeController.java:24) | (none) | `GlobalResponse<List<NoticeResponse>>` | ADMIN | |
| GET | `/api/admin/notices/{noticeId}` | AdminNoticeController#getAdminNoticeDetail (.../AdminNoticeController.java:32) | path: `noticeId:Long` | `GlobalResponse<NoticeResponse>` | ADMIN | |
| POST | `/api/admin/notices` | AdminNoticeController#createNotice (.../AdminNoticeController.java:40) | body: `NoticeRequest{source:INTERNAL\|EXTERNAL,title,summary,content,externalUrl,imageUrl,isVisible,isPinned,publishedAt}` | `GlobalResponse<NoticeResponse>` | ADMIN | INTERNAL ↔ content 필수, EXTERNAL ↔ externalUrl 필수 (DB CHECK 미러) |
| PUT | `/api/admin/notices/{noticeId}` | AdminNoticeController#updateNotice (.../AdminNoticeController.java:48) | path: `noticeId`; body: `NoticeRequest` | `GlobalResponse<NoticeResponse>` | ADMIN | jsoup sanitize |
| PATCH | `/api/admin/notices/{noticeId}/visible` | AdminNoticeController#updateNoticeVisible (.../AdminNoticeController.java:58) | path; body: `NoticeVisibleRequest{isVisible}` | `GlobalResponse<Void>` | ADMIN | |
| PATCH | `/api/admin/notices/{noticeId}/pinned` | AdminNoticeController#updateNoticePinned (.../AdminNoticeController.java:68) | path; body: `NoticePinnedRequest{isPinned}` | `GlobalResponse<Void>` | ADMIN | |
| DELETE | `/api/admin/notices/{noticeId}` | AdminNoticeController#deleteNotice (.../AdminNoticeController.java:78) | path: `noticeId:Long` | `GlobalResponse<Void>` | ADMIN | |

## /api/quiz (quiz/QuizController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/quiz/latest` | QuizController#getLatest (src/main/java/com/dawne/com2usbaseball/domain/quiz/controller/QuizController.java:20) | (none) | `GlobalResponse<QuizResponse{id,round,imageUrl,isVisible,createdAt,updatedAt}>` | permitAll | fun_quiz visible=true 의 최신 |

## /api/admin/quiz (quiz/AdminQuizController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/quiz` | AdminQuizController#getAll (src/main/java/com/dawne/com2usbaseball/domain/quiz/controller/AdminQuizController.java:21) | (none) | `GlobalResponse<List<QuizResponse>>` | ADMIN | |
| POST | `/api/admin/quiz` | AdminQuizController#create (.../AdminQuizController.java:28) | body: `QuizRequest{round,imageUrl,isVisible}` | `GlobalResponse<QuizResponse>` | ADMIN | |
| PATCH | `/api/admin/quiz/{id}` | AdminQuizController#update (.../AdminQuizController.java:35) | path: `id`; body: `QuizRequest` | `GlobalResponse<QuizResponse>` | ADMIN | |
| DELETE | `/api/admin/quiz/{id}` | AdminQuizController#delete (.../AdminQuizController.java:43) | path: `id:Long` | `GlobalResponse<Void>` | ADMIN | |

## /api/skills (skill/SkillController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/skills/{target}` | SkillController#playerTypeSkills (src/main/java/com/dawne/com2usbaseball/domain/skill/controller/SkillController.java:21) | path: `target:Target=PITCHER\|HITTER` | `SkillSetResponse{legend,platinum,hero,normal:List<SkillItemResponse>}` | permitAll | player_skills 테이블 |
| GET | `/api/skills/coach` | SkillController#coachSkills (.../SkillController.java:26) | (none) | `CoachSkillSetResponse` | permitAll | ★ owner 추정과 다르게 BE 코드 작성·연결 완료 — coach + coach_skill_buff + coach_skill_condition 조회 |
| GET | `/api/skills/score-config` | SkillController#skillScoreConfig (.../SkillController.java:31) | (none) | `SkillScoreConfigResponse{pitcher,hitter:List<SkillScoreConfigEntry>}` | permitAll | skill_score_config 테이블 |

> ★ Spring 매핑 충돌 의심: `/api/skills/{target}` 가 enum binding 으로 `coach`, `score-config` 를 잡으려 시도. Target enum 에 해당 값이 없으면 400 변환 실패 → static path 가 실제 우선 매칭되는지 검증 필요. (URL 매핑은 보통 path variable 보다 더 specific 한 static segment 가 우선.)

## /api/kbo (kbo/KboGameController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/kbo/matches/today` | KboGameController#getTodayMatches (src/main/java/com/dawne/com2usbaseball/domain/kbo/controller/KboGameController.java:20) | (none) | `TodayMatchesResponse{matches:List<KboMatchResponse>}` | permitAll | kbo_games + 최근 5경기 W/L/D 결합. db-map 기준 보류 도메인 |
| GET | `/api/kbo/matches/{matchId}` | KboGameController#getMatchDetail (.../KboGameController.java:29) | path: `matchId:String` | `KboMatchResponse` | permitAll | null 반환 가능 |

## /api/player (player/PlayerCardController) — LEGACY

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/player/{position}` | PlayerCardController#getLegendPlayerByPosition (src/main/java/com/dawne/com2usbaseball/domain/player/controller/PlayerCardController.java:20) | path: `position:Target=PITCHER\|HITTER` | `List<LegendPlayerCardResponse{identity,card,career}>` | permitAll | player_legend* + teams. db-map: 폐기 예정 |

## /api/admin/player (player/AdminPlayerCardController) — LEGACY

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/admin/player/teams` | AdminPlayerCardController#getPlayerTeams (src/main/java/com/dawne/com2usbaseball/domain/player/controller/AdminPlayerCardController.java:31) | (none) | `ListResponse<TeamResponse{id,teamCode,teamName}>` | ADMIN | teams (V1) 만 |
| POST | `/api/admin/player` | AdminPlayerCardController#createPlayerCard (.../AdminPlayerCardController.java:36) | body: `AdminPlayerCardCreateRequest{meta,attributes}` | `OperationResponse<PlayerMessages>` | ADMIN | player_card + hitter/pitcher attribute 복합 INSERT |

> 같은 컨트롤러에 `getAllPlayerCardList`, `getPlayerCardListByGrade`, `updatePlayerCard`, `updatePlayerCardAttribute`, `createPlayerCardList`, `createPlayerCardAttributeList` 가 **주석으로만 존재** (file:21-58). 미구현. dead-suspects.md 참조.

## /api/player-cards (fun/playerCard/FunPlayerCardController) — V2 신규

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| (none) | — | FunPlayerCardController (src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/controller/FunPlayerCardController.java:9) | — | — | — | ★ **빈 컨트롤러**. `@RestController("PlayerCardControllerV2")` Bean 만 등록. 엔드포인트 0 개 |

## /api/admin/player-cards (fun/playerCard/FunAdminPlayerCardController) — V2 신규

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| POST | `/api/admin/player-cards` | FunAdminPlayerCardController#create (src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/controller/FunAdminPlayerCardController.java:16) | body: `FunPlayerCardCreateRequest` (★ 빈 record — 필드 0 개) | `Long` | ADMIN | ★ DTO 비어있음. 실호출 시 null INSERT |
| PUT | `/api/admin/player-cards/{id}` | FunAdminPlayerCardController#update (.../FunAdminPlayerCardController.java:21) | path: `id`; body: `FunPlayerCardUpdateRequest` (★ 빈 record) | 200 void | ADMIN | 동일 |
| GET | `/api/admin/player-cards/{id}` | FunAdminPlayerCardController#get (.../FunAdminPlayerCardController.java:27) | path: `id:Long` | `FunPlayerCardResponse` (★ 빈 record) | ADMIN | 응답 본문 항상 `{}` |

## /api/upload (admin/UploadController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| POST | `/api/upload/events` | UploadController#uploadImage (src/main/java/com/dawne/com2usbaseball/domain/admin/controller/UploadController.java:18) | multipart: `file:MultipartFile` | `String` (S3 URL) | permitAll (★ admin 가드 없음 — auth-and-flags.md 위험) | S3 PUT, key=uploads/images/{uuid}.{ext} |

## /api/dev (admin/SwaggerController)

| METHOD | PATH | 컨트롤러:메서드 | 요청 shape | 응답 shape | auth | 비고 |
|---|---|---|---|---|---|---|
| GET | `/api/dev/test-token` | SwaggerController#getTestToken (src/main/java/com/dawne/com2usbaseball/domain/admin/controller/SwaggerController.java:18) | (none) | `GlobalResponse<String>` (JWT) | permitAll (★ 누구나 ADMIN 토큰 발급 가능) | userId=1, role=ADMIN 하드코딩. 운영은 swagger-ui.enabled=false 지만 본 엔드포인트는 별개로 살아있음 |

---

## 합계

- 컨트롤러: **30 개**
- 엔드포인트 (mapping 어노테이션): **86 개** (FunPlayerCardController 0개 + 주석 처리된 AdminPlayerCardController 6개 제외)
- ADMIN 가드 대상 (`/api/admin/**`): **42 개**
- permitAll: **44 개**
- JWT 필요 (컨트롤러 본문에서 userId 검증): **1 개** (`/api/users/me`)

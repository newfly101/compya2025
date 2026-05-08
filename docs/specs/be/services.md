# BE Services (Domain Service Entry Points)

> 도메인 서비스/비즈로직 entry point 한 줄 요약 + 외부 의존.
> Spring `@Service` 단위. 인터페이스가 있는 경우 Impl 기준 정리.

---

## auth / oauth / user

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `AuthServiceImpl#loginWithNaver` | src/main/java/com/dawne/com2usbaseball/domain/oauth/service/AuthServiceImpl.java:22 | NaverOAuth 코드→유저 검색·생성→상태검증→JWT 발급 | NaverOAuthService (외부 HTTP), JwtProvider |
| `NaverOAuthService` | src/main/java/com/dawne/com2usbaseball/domain/oauth/service/support/NaverOAuthService.java | code/state→토큰 교환→profile 조회→`UserService#findOrCreateNaverUser` | Naver Open API (HTTPS), naver.client-id/secret/redirect-uri properties |
| `UserServiceImpl#findOrCreateNaverUser` | src/main/java/com/dawne/com2usbaseball/domain/oauth/service/UserServiceImpl.java:27 | provider/providerId 로 유저 upsert + last login 갱신 | UserRepository (site_users) |
| `UserServiceImpl#findActiveUserById` | .../UserServiceImpl.java:42 | id→유저, BLOCKED/SUSPENDED/WITHDRAWN 시 403 | UserRepository |

## community/board

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `BoardServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/board/BoardServiceImpl.java | board CRUD + visible 필터 | BoardRepository (site_board) |

## community/posts

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `PostServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/posts/PostServiceImpl.java:18 | post list/detail (board, pinned, popular, author 별) + view/like/dislike/comment/report 카운터 증감 + visible/pinned 토글 + soft delete | PostRepository (site_post) |
| `PostTagServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/posts/PostTagServiceImpl.java | post-tag 매핑 CRUD + replace (트랜잭션) | PostTagRepository (site_post_tag) |

## community/comment

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `CommentServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/comment/CommentServiceImpl.java | comment CRUD + replies + like/dislike/report 카운터 | CommentRepository (site_comment) |
| `AdminCommentServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/comment/AdminCommentServiceImpl.java | admin 모드 comment 조회·visible 토글·삭제 | CommentRepository |

## community/reaction

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `PostReactionServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/reaction/PostReactionServiceImpl.java | post 좋아요/싫어요 upsert·삭제 + post counter 동기화 추정 | PostReactionRepository (site_post_reaction), PostRepository |
| `CommentReactionServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/reaction/CommentReactionServiceImpl.java | comment 좋아요/싫어요 동일 패턴 | CommentReactionRepository (site_comment_reaction), CommentRepository |

## community/tag

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `TagServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/tag/TagServiceImpl.java | visible tag list / by code | TagRepository (site_tag) |
| `AdminTagServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/tag/AdminTagServiceImpl.java | admin tag CRUD + visible 토글 | TagRepository |

## community/report

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `ReportServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/report/ReportServiceImpl.java | 내 신고 조회 / 신고 생성 (target=POST/COMMENT 등) | ReportRepository (site_report) |
| `AdminReportServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/community/service/report/AdminReportServiceImpl.java | 신고 list / pending / by target / detail / status 변경 / 삭제 | ReportRepository |

## coupon

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `CouponUserServiceImpl#getCouponLists` | src/main/java/com/dawne/com2usbaseball/domain/coupon/service/CouponUserServiceImpl.java:23 | site_coupons visible=true 목록 + Caffeine cache(`coupons::public`) | CouponRepository |
| `CouponAdminServiceImpl#getCouponLists` | src/main/java/com/dawne/com2usbaseball/domain/coupon/service/CouponAdminServiceImpl.java:30 | site_coupons 전체 list + cache(`coupons::admin`) | CouponRepository |
| `CouponAdminServiceImpl#createCoupon` | .../CouponAdminServiceImpl.java:42 | site_coupons INSERT 후 `findById(coupons)` 조회 → ★ **table 불일치 위험** | CouponRepository |
| `CouponAdminServiceImpl#updateCoupon` | .../CouponAdminServiceImpl.java:58 | findById(coupons) → site_coupons UPDATE → ★ 동일 불일치 | CouponRepository |
| `CouponAdminServiceImpl#updateCouponVisible` | .../CouponAdminServiceImpl.java:75 | site_coupons UPDATE | CouponRepository |

## event

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `EventUserServiceImpl#getExternalEventList` | src/main/java/com/dawne/com2usbaseball/domain/event/service/EventUserServiceImpl.java:22 | site_events 외부 노출 visible 만 + cache(`events::external::public`) | EventRepository |
| `EventAdminServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/event/service/EventAdminServiceImpl.java | event CRUD + visible 토글 (cache evict) | EventRepository |

## notice

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `NoticeServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/notice/service/NoticeServiceImpl.java | 공지 list / detail (캐시 `notice::public`, `noticeDetail::{id}_public`) | NoticeRepository (site_notices) |
| `AdminNoticeServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/notice/service/AdminNoticeServiceImpl.java:26 | 공지 admin list / CRUD + visible/pinned 토글 + jsoup XSS sanitize + INTERNAL/EXTERNAL CHECK 제약 검증 | AdminNoticeRepository, jsoup |

## quiz

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `QuizUserServiceImpl#getLatest` | src/main/java/com/dawne/com2usbaseball/domain/quiz/service/QuizUserServiceImpl.java:23 | fun_quiz visible=true 최신 + cache(`quiz::latest`) | QuizRepository |
| `QuizAdminServiceImpl` | src/main/java/com/dawne/com2usbaseball/domain/quiz/service/QuizAdminServiceImpl.java | quiz CRUD | QuizRepository |

## skill

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `PlayerSkillsServiceImpl#getPlayerSkillSet` | src/main/java/com/dawne/com2usbaseball/domain/skill/service/PlayerSkillsServiceImpl.java:27 | target=PITCHER/HITTER 별 skill 목록 → grade 그룹핑 + cache(`playerSkillSetByTarget::{target}`) | PlayerSkillsRepository (player_skills) |
| `CoachSkillServiceImpl#getCoachSkillSet` | src/main/java/com/dawne/com2usbaseball/domain/skill/service/coach/CoachSkillServiceImpl.java:23 | coach + coach_skill_buff + coach_skill_condition 결합 + cache(`coachSkills`) — ★ owner 가 "BE 미작성" 추정했지만 실제 wired & 캐시까지 적용됨 | CoachRepository (coach, coach_skill_*) |
| `SkillScoreConfigServiceImpl#getSkillScoreConfig` | src/main/java/com/dawne/com2usbaseball/domain/skill/service/SkillScoreConfigServiceImpl.java:21 | active skill_score_config 를 pitcher/hitter 별 entry 로 + cache(`skillScoreConfig`) | SkillScoreConfigRepository |

## kbo

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `KboGameServiceImpl#getTodayMatches` | src/main/java/com/dawne/com2usbaseball/domain/kbo/service/KboGameServiceImpl.java:22 | 오늘 경기 + 양팀 최근 5경기 W/L/D + cache(`kboMatches::today`) | KboGameRepository (kbo_games) |
| `KboGameServiceImpl#getMatchDetail` | .../KboGameServiceImpl.java:42 | matchId 단건 + 동일 최근 결과 결합 + cache(`kboMatches::{matchId}`) — null 반환 가능 | KboGameRepository |

## player (LEGACY)

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `PlayerCardServiceImpl#getPlayerInfo` | src/main/java/com/dawne/com2usbaseball/domain/player/service/PlayerCardServiceImpl.java:39 | target 별 legend 카드 + 같은 이름 그룹핑 + 커리어 + 팀맵 결합 + cache(`playerInfoByTarget::{target}`) | PlayerCardInfoRepository, LegendPlayerCareerRepository, TeamRepository (player_legend*, teams) |
| `AdminPlayerCardServiceImpl#getAllPlayerTeamInfo` | src/main/java/com/dawne/com2usbaseball/domain/player/service/AdminPlayerCardServiceImpl.java:35 | teams 전체 list | TeamRepository |
| `AdminPlayerCardServiceImpl#createPlayerCardInfo` | .../AdminPlayerCardServiceImpl.java:42 | player_card INSERT + role 따라 hitter/pitcher attribute INSERT | PlayerCardRepository |
| `AdminPlayerCardServiceImpl#getPlayerInfo`, `#updatePlayerCard` | .../AdminPlayerCardServiceImpl.java:30,79 | ★ **return null 스텁** — 미구현 | — |

## fun/playerCard (V2 신규)

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `FunPlayerCardServiceImpl#create/update/getById` | src/main/java/com/dawne/com2usbaseball/domain/fun/playerCard/service/FunPlayerCardServiceImpl.java:24 | fun_player_card CRUD — ★ Request/Response 가 모두 빈 record 라 실효 동작 X | FunPlayerCardRepository (fun_player_card) |
| `FunPlayerCardServiceImpl#getByCardCode/getAll/delete` | .../FunPlayerCardServiceImpl.java:43 | 미노출 (컨트롤러에서 호출 없음) | FunPlayerCardRepository |

## admin (인프라성)

| Service | 파일:라인 | 한 줄 요약 | 외부 의존 |
|---|---|---|---|
| `UploadServiceImpl#uploadImage` | src/main/java/com/dawne/com2usbaseball/domain/admin/service/UploadServiceImpl.java:22 | MultipartFile → S3 PUT (uploads/images/{uuid}.{ext}) → public URL 반환 | AWS S3 (`software.amazon.awssdk.services.s3.S3Client`), S3Properties |
| `JwtProvider#createAccessToken` | src/main/java/com/dawne/com2usbaseball/security/provider/JwtProvider.java | userId+role JWT 발급 (60min). `/api/dev/test-token` 에서 호출 | jjwt, jwt.secret/access-token-expire-minutes |

---

## 외부 시스템 의존 (정리)

- **MariaDB** (HikariCP, MyBatis): 모든 도메인 (`spring.datasource.*`)
- **AWS S3**: UploadService — bucket=`compya-images` (운영)
- **Naver OAuth API**: AuthService → NaverOAuthService
- **JWT (jjwt)**: AuthService, JwtAuthFilter, SwaggerController
- **Caffeine in-memory cache**: 거의 모든 read 서비스에 `@Cacheable` 부착. cache name 규칙: `{도메인}{Sub}::{key}`
- **외부 시스템 outbound HTTP** (자체 호출): NaverOAuthService 만. (kbocrol Python 크롤러는 본 BE 와 직접 통신 없음 — DB 공유만)

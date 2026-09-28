# DB 코드 테이블 인벤토리

> ⚠️ 2026-08-20: coach/skill(코치) 도메인 서버·DB·시드 완전 삭제됨. 아래 coach 관련 서술은 삭제 이전 기록.

> 목적: 코드(mapper XML + Java)가 실제로 참조하는 DB 테이블을 전수 조사해 운영 DB 대조용 baseline을 만든다.
> 범위: `src/main/resources/mapper/**/*.xml` 26개, `src/main/java/**` 전체, `sql/**/*.sql` 스키마.
> **결정 (2026-08-20)**: kbo 6종 / wiki 3종 완전 삭제 확정. 아래 표는 삭제 이전 실측 기록.
> `build/` 디렉터리는 읽지 않음. DB 접속 없음 — 코드에서 확정 가능한 사실만 기록.

---

## §1 요약

| 항목 | 수 |
|---|---|
| 스키마에 정의된 테이블 (전체 sql/*.sql 합산, 중복 제외) | 53 |
| mapper XML이 참조하는 테이블 | 34 |
| 스키마에만 존재 (mapper 참조 0건) — 미참조 | 19 |
| mapper 참조는 있으나 Java 계층에서 끊김 — 코드 데드 의심 | 4 (fun_player_card_hitter_stats / pitcher_stats / pitcher_pitch_grades / positions) |
| mapper+Repository+Service+Controller 모두 연결되었으나 XML 네임스페이스 불일치로 런타임 위험 | 1 (fun_player_card) |
| Java 하드코딩 SQL (@Select 등 annotation, JdbcTemplate) | 없음 — 전량 XML mapper |

---

## §2 테이블별 참조 맵

> Java interface 메서드는 XML statement id와 전부 1:1 동일 (메서드명 = XML id). Controller 도달 열은 Controller → Service → Repository → Mapper 전 구간 연결 여부.

| 테이블 | 참조 XML (파일:statement id) | Java interface | Controller 도달 | 분류 |
|---|---|---|---|---|
| `wiki_pitch` | `wiki/WikiGameInfoMapper.xml:selectActivePitches,selectAllPitches,selectPitchById,insertPitch,updatePitch,softDeletePitch` (+ join in `selectActivePitchGrades`) | `WikiGameInfoMapper` | `WikiGameInfoController`, `AdminWikiController` | 사용중 |
| `wiki_pitch_grade` | `wiki/WikiGameInfoMapper.xml:selectActivePitchGrades,selectAllPitchGrades,selectPitchGradeById,insertPitchGrade,updatePitchGrade,deletePitchGrade,softDeletePitchGradeByCode` | `WikiGameInfoMapper` | 동일 | 사용중 |
| `wiki_stat_influence` | `wiki/WikiGameInfoMapper.xml:selectActiveStatInfluences,selectAllStatInfluences,selectStatInfluenceById,insertStatInfluence,updateStatInfluence,softDeleteStatInfluence` | `WikiGameInfoMapper` | 동일 | 사용중 |
| `skill_score_config` | `skill/SkillScoreConfigMapper.xml:selectActiveConfigsByTarget` | `SkillScoreConfigMapper` | `SkillController` | 사용중 |
| `player_legend` | `player/PlayerCardMapper.xml:selectPlayersByPosition` | `PlayerCardMapper`(player) | `PlayerCardController` | 사용중 (legacy 폐기예정 라인) |
| `player_card` | `player/PlayerCardMapper.xml:insertPlayerCard` | `PlayerCardMapper`(player) | `AdminPlayerCardController` | 사용중 (insert만, select 0건) |
| `player_card_hitter_attributes` | `player/PlayerCardMapper.xml:insertHitterAttribute` | `PlayerCardMapper`(player) | `AdminPlayerCardController` | 사용중 (insert만) |
| `player_card_pitcher_attributes` | `player/PlayerCardMapper.xml:insertPitcherAttribute` | `PlayerCardMapper`(player) | `AdminPlayerCardController` | 사용중 (insert만) |
| `teams` | `player/TeamMapper.xml:selectTeamById,selectTeamAll` | `TeamMapper` | `PlayerCardController`, `AdminPlayerCardController` | 사용중 |
| `player_skills` | `skill/PlayerSkills.xml:selectSkillsByTarget` | `PlayerSkillsMapper` | `SkillController` | 사용중 |
| `player_legend_hitter_career` | `player/PlayerCareer.xml:selectCareerByHitter` | `LegendPlayerCareerMapper` | `PlayerCardController` | 사용중 |
| `player_legend_pitcher_career` | `player/PlayerCareer.xml:selectCareerByPitcher` | `LegendPlayerCareerMapper` | `PlayerCardController` | 사용중 |
| `fun_quiz` | `fun/quiz/QuizMapper.xml:selectLatestVisible,selectAll,selectById,insertQuiz,updateQuiz,deleteQuiz` | `QuizMapper` | `QuizController`, `AdminQuizController` | 사용중 |
| `coach` | `skill/CoachMapper.xml:selectAllCoaches` | `CoachMapper` | `SkillController` (`GET /api/skills/coach`) | 사용중 |
| `coach_skill_buff` | `skill/CoachMapper.xml:selectAllCoachSkillBuff` | `CoachMapper` | 동일 | 사용중 |
| `coach_skill_condition` | `skill/CoachMapper.xml:selectAllCoachSkillCondition` | `CoachMapper` | 동일 | 사용중 |
| `site_board` | `site/community/BoardMapper.xml:getBoardList,getVisibleBoardList,getBoardDetail,getBoardDetailByCode,insertBoard,updateBoard,updateBoardVisible,deleteBoard` | `BoardMapper` | `BoardController`, `AdminBoardController` | 사용중 |
| `site_refresh_tokens` | `site/oauth/RefreshTokenMapper.xml:insertRefreshToken,selectActiveByHash,deleteByHash,deleteByUserId,deleteExpired` | `RefreshTokenMapper` | `AuthController` | 사용중 |
| `site_users` | `site/oauth/UserMapper.xml:selectUserByProvider,insertUser,updateUserLogin,selectUserById,selectAdminUserList,updateUserRole,updateUserStatus` | `UserMapper` | `AuthController`, `UserController`, `AdminUserController` | 사용중 |
| `site_comment` | `site/community/CommentMapper.xml:getCommentListByPostId,getReplyListByParentCommentId,getCommentDetail,countCommentByPostId,insertComment,updateComment,updateCommentVisible,increaseCommentLikeCount,decreaseCommentLikeCount,increaseCommentDislikeCount,decreaseCommentDislikeCount,increaseCommentReportCount,deleteComment` | `CommentMapper` | `CommentController`, `AdminCommentController` | 사용중 |
| `site_comment_reaction` | `site/community/CommentReactionMapper.xml:getCommentReactionListByCommentId,getCommentReactionListByUserId,getCommentReaction,insertCommentReaction,updateCommentReaction,deleteCommentReaction` | `CommentReactionMapper` | `CommentReactionController` | 사용중 |
| `site_notices` | `site/notice/NoticeMapper.xml:getNoticeList,getNoticeDetail,getAdminNoticeList,getAdminNoticeListFiltered,getAdminNoticeDetail,selectNoticeById,insertNotice,updateNotice,updateNoticeVisible,updateNoticePinned,deleteNotice` | `NoticeMapper` | `NoticeController`, `AdminNoticeController` | 사용중 |
| `fun_player_card_hitter_stats` | `fun/playerCard/PlayerCardHitterStatsMapper.xml:insert,update,deleteByCardId,findByCardId` | `PlayerCardHitterStatsMapper` | 없음 | 의심(코드 데드) — §4 |
| `site_coupons` | `site/coupon/CouponMapper.xml:selectCouponListForUser,selectCouponList,selectCouponById,insertCoupon,updateCouponById,updateCouponVisible,deleteCouponById` | `CouponMapper` | `CouponController`, `AdminCouponController` | 사용중 |
| `site_events` | `site/event/EventMapper.xml:selectEventByExternalForUser,selectEventByExternal,selectEventById,insertEvent,updateEventByExternal,updateEventVisible,selectAdminEventList,deleteEventById` | `EventMapper` | `EventController`, `AdminEventController` | 사용중 (`evemtType` alias 오타로 admin 응답 eventType 항상 null — 기존 문서 기재대로 확인) |
| `site_post` | `site/community/PostMapper.xml:getPostListByBoardId,getPinnedPostListByBoardId,getPopularPostListByBoardId,getPostListByAuthor,getPostDetail,insertPost,updatePost,updatePostVisible,updatePostPinned,increasePostViewCount,increasePostCommentCount,decreasePostCommentCount,increasePostLikeCount,decreasePostLikeCount,increasePostDislikeCount,decreasePostDislikeCount,increasePostReportCount,deletePost` | `PostMapper` | `PostController`, `AdminPostController` | 사용중 |
| `fun_player_card` | `fun/playerCard/PlayerCardMapper.xml:insert,update,deleteById,findById,findByCardCode,findAll` | `FunPlayerCardMapper` | `FunPlayerCardController`, `FunAdminPlayerCardController` | 사용중이나 위험 — §4 (XML 네임스페이스 불일치) |
| `site_post_reaction` | `site/community/PostReactionMapper.xml:getPostReactionListByPostId,getPostReactionListByUserId,getPostReaction,insertPostReaction,updatePostReaction,deletePostReaction` | `PostReactionMapper` | `PostReactionController` | 사용중 |
| `fun_player_card_pitcher_pitch_grades` | `fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml:insert,update,deleteByCardId,findByCardId` | `PlayerCardPitcherPitchGradesMapper` | 없음 | 의심(코드 데드) — §4 |
| `site_post_tag` | `site/community/PostTagMapper.xml:getPostTagListByPostId,getPostTagListByTagId,insertPostTag,deletePostTag,deleteAllPostTagByPostId` | `PostTagMapper` | `PostTagController` | 사용중 |
| `fun_player_card_pitcher_stats` | `fun/playerCard/PlayerCardPitcherStatsMapper.xml:insert,update,deleteByCardId,findByCardId` | `PlayerCardPitcherStatsMapper` | 없음 | 의심(코드 데드) — §4 |
| `site_report` | `site/community/ReportMapper.xml:getReportList,getPendingReportList,getReportListByTarget,getReportDetail,getReportByReporter,insertReport,updateReportStatus,deleteReport` | `ReportMapper` | `ReportController`, `AdminReportController` | 사용중 |
| `fun_player_card_positions` | `fun/playerCard/PlayerCardPositionsMapper.xml:insert,update,deleteById,deleteByCardId,findById,findByCardId,findAll` | `PlayerCardPositionsMapper` | 없음 | 의심(코드 데드) — §4 |
| `site_tag` | `site/community/TagMapper.xml:getTagList,getVisibleTagList,getTagDetail,getTagDetailByCode,insertTag,updateTag,updateTagVisible,deleteTag` | `TagMapper` | `TagController`, `AdminTagController` | 사용중 |

Java 하드코딩 SQL(`@Select`/`@Insert`/`@Update`/`@Delete` 어노테이션, `JdbcTemplate`, `EntityManager`): 코드 전체 grep 결과 **없음**. 전 mapper가 XML 기반.

---

## §3 미참조 테이블 (스키마 정의, mapper 참조 0건)

| 테이블 | 스키마 정의 위치 | 계열 | 비고 |
|---|---|---|---|
| `users` | `sql/CREATE_TABLE.sql:205` | legacy V1 | `site_users`로 대체 |
| `user_roles` | `sql/CREATE_TABLE.sql:222` | legacy V1 | role/status가 `site_users` enum 컬럼으로 흡수 |
| `events` | `sql/CREATE_TABLE.sql:237` | legacy V1 | `site_events`로 대체 |
| `coupons` | `sql/CREATE_TABLE.sql:255` | legacy V1 | `site_coupons`로 대체. `CouponMapper.xml`은 `site_coupons`만 사용 (dual-write 없음 확인) |
| `boards` | `sql/CREATE_TABLE.sql:275` | legacy V1 | `site_board`로 대체 |
| `posts` | `sql/CREATE_TABLE.sql:298` | legacy V1 | `site_post`로 대체 |
| `tags` | `sql/CREATE_TABLE.sql:331` | legacy V1 | `site_tag`로 대체 |
| `posts_tags` | `sql/CREATE_TABLE.sql:348` | legacy V1 | `site_post_tag`로 대체 |
| `notices` | `sql/CREATE_TABLE.sql:398` | legacy V1 | `site_notices`로 대체 |
| `skill_pitcher_grade_stat` | `sql/CREATE_TABLE.sql:179` | legacy V1 | mapper 전무. `skill_score_config`가 점수 계산 대체 추정 |
| `legend_pitcher_pitch_slot` | `sql/CREATE_TABLE.sql:141` | legacy V1 | mapper 전무. `fun_player_card_pitcher_pitch_grades`로 대체 의도 추정 |
| `quiz_answers` | `sql/CREATE_TABLE.sql:530` | legacy V1 | mapper 전무. `fun_quiz`가 단순화된 형태로 대체 |
| `kbo_team_code_mappings` | `sql/CREATE_TABLE.sql:542` | KBO | 시드만 존재, BE mapper 없음 |
| `kbo_seasons` | `sql/CREATE_TABLE_KBO.sql:10` | KBO | BE mapper 없음 |
| `kbo_teams` | `sql/CREATE_TABLE_KBO.sql:31` | KBO | BE mapper 없음 |
| `kbo_games` | `sql/CREATE_TABLE_KBO.sql:62` | KBO | BE mapper 없음 |
| `kbo_players` | `sql/CREATE_TABLE_KBO.sql:201` | KBO | BE mapper 없음 |
| `kbo_batter_logs` | `sql/CREATE_TABLE_KBO.sql:225` | KBO | BE mapper 없음 |
| `fun_teams` | `sql/V2/fun/CREATE_TABLE_FUN.sql:1` | V2 fun | `TeamMapper.xml`은 legacy `teams`만 참조, `fun_teams`는 0건 |

---

## §4 코드 데드 의심

XML statement id와 Java interface 메서드명은 26개 mapper 전체에서 1:1로 일치 — **orphan-statement(XML에는 있으나 Java 메서드 없음)는 0건**. 문제는 다른 층위에서 발생:

| XML:statement id | 대상 테이블 | 끊긴 지점 | 근거 |
|---|---|---|---|
| `fun/playerCard/PlayerCardHitterStatsMapper.xml:insert,update,deleteByCardId,findByCardId` | `fun_player_card_hitter_stats` | (1) Repository/Service 어디서도 `PlayerCardHitterStatsMapper` 미주입 (2) XML 네임스페이스(`...mapper.PlayerCardHitterStatsMapper`) ≠ Java 인터페이스 FQCN(`...repository.mapper.PlayerCardHitterStatsMapper`) | 코드 전체 grep 결과 이 인터페이스명은 자기 정의 파일에서만 등장. `FunPlayerCardServiceImpl`은 `FunPlayerCardRepository`만 사용 |
| `fun/playerCard/PlayerCardPitcherStatsMapper.xml:insert,update,deleteByCardId,findByCardId` | `fun_player_card_pitcher_stats` | 동일 (미주입 + 네임스페이스 불일치) | 동일 grep 근거 |
| `fun/playerCard/PlayerCardPitcherPitchGradesMapper.xml:insert,update,deleteByCardId,findByCardId` | `fun_player_card_pitcher_pitch_grades` | 동일 | 동일 |
| `fun/playerCard/PlayerCardPositionsMapper.xml:insert,update,deleteById,deleteByCardId,findById,findByCardId,findAll` | `fun_player_card_positions` | 동일 | 동일 |
| `fun/playerCard/PlayerCardMapper.xml:insert,update,deleteById,findById,findByCardCode,findAll` | `fun_player_card` | Repository(`FunPlayerCardRepository`)→Service→Controller까지는 연결되어 있으나, XML 네임스페이스가 `com.dawne.com2usbaseball.domain.fun.playerCard.mapper.PlayerCardMapper`이고 Java 인터페이스 FQCN은 `com.dawne.com2usbaseball.domain.fun.playerCard.repository.mapper.FunPlayerCardMapper` — 패키지 경로와 클래스 simple name이 모두 다름 | XML 6행 namespace 직접 대조로 확인. MyBatis는 namespace = interface FQCN 매칭이 원칙 — 불일치 시 `BindingException` 위험 (런타임 미검증, §6) |

기타: `AdminPlayerCardServiceImpl.getPlayerInfo()` / `updatePlayerCard()`는 `UnsupportedOperationException`을 던지는 미구현 스텁 — 테이블 참조와 무관하게 서비스 계층에서부터 의도적으로 막혀 있음 (컨트롤러 `AdminPlayerCardController`엔 해당 엔드포인트 자체가 없음 — teams 조회 / card 생성 2개만 노출).

---

## §5 기존 문서와의 불일치

| 문서 | 기재 내용 | 실제 코드 | 어느 쪽이 맞나 |
|---|---|---|---|
| `tables.md` §2 | `fun_player_card_hitter_stats` / `pitcher_stats` / `pitcher_pitch_grades`를 "🔵 active ⚠ namespace mismatch"로 표기 (namespace 문제는 있지만 "active"라 표현) | Repository/Service 어디에도 세 매퍼가 주입되지 않음 — 네임스페이스 문제 이전에 아예 호출되는 코드가 없음 | 실제 코드가 맞음. "active"는 과장 — `fun_player_card_positions`와 동일하게 미사용으로 분류해야 함 |
| `dead-suspects.md` §1 | orphan(고아) 테이블 목록에 `fun_player_card_positions`만 포함, `hitter_stats`/`pitcher_stats`/`pitcher_pitch_grades`는 제외 | 4개 테이블 모두 동일하게 Repository 미주입 — 차별 대우할 근거 없음 | 실제 코드가 맞음. 4개 다 §1 목록에 들어가야 함 |
| `tables.md` §3, `dead-suspects.md` §3/§8 | `coach`/`coach_skill_condition`/`coach_skill_buff`를 "🟣⏸ shared(BE 미연결로 분류했으나 mapper 존재 — 사용 검증 필요)"로 표기, §8에서도 "검증 필요 ❓"로 남김 | `CoachRepository` → `CoachSkillServiceImpl` → `SkillController`(`GET /api/skills/coach`)까지 완전히 연결 확인 | 실제 코드가 맞음. "검증 필요" 아니라 **사용중으로 확정** 가능 |
| `dead-suspects.md` §4.3, `mapper-mapping.md` §2.4/§6-5 | `fun_quiz.is_visible` 컬럼을 QuizMapper가 필터링하지 않는 것을 "노출 제어 무력화" 버그로 지적 | `sql/compyafun-v3_fun.sql` (V3 통합 SQL, PRD `docs/prd/domains/quiz.md` Part B 확정 근거 명시)이 `is_visible` 컬럼을 **의도적으로 DROP**하기로 결정한 마이그레이션 스크립트로 존재 | 확정 불가 — 코드만으론 버그인지 의도된 스키마 변경인지 판단 불가. 운영 DB에 V3 마이그레이션이 적용됐는지 확인 필요 (§6) |
| `dead-suspects.md` §6 | `sql/compyafun-v3_fun.sql`을 "V3 dump 파일. 정합성 검증 후 정리"로만 기재 | 실제로는 `fun_quiz`의 PRD 확정 변경사항(is_visible 컬럼 제거, title 컬럼 미추가, admin 회차 자동 +1 정책)을 담은 살아있는 마이그레이션 스크립트 — 단순 dump가 아님 | 실제 코드/문서 내용이 맞음. 성격 재기술 필요 |

`EventMapper.xml`의 `evemtType` alias 오타(`dead-suspects.md`/`mapper-mapping.md` 기재)와 `fun/playerCard` 5개 mapper 네임스페이스 불일치는 이번 재검증에서도 **동일하게 확인됨** (일치).

---

## §6 DB 실물 대조가 필요한 항목

- `fun/playerCard` 5개 mapper 네임스페이스 불일치 — 정적 분석상 `BindingException` 위험은 확정이나, 실제 운영에서 `fun_player_card` 생성/수정 API 호출 시 오류가 나는지는 런타임 로그/운영 확인 필요 (이번 라운드는 코드 정적 분석만 수행)
- `fun_quiz.is_visible` 컬럼 — `compyafun-v3_fun.sql`의 DROP & CREATE가 실제 운영 DB에 적용됐는지. 미적용이면 운영 DB엔 컬럼과 값이 남아있는 상태
- `sql/DROP_TABLE.sql` — `player_skills`/`teams`/`coach`/`coach_skill_condition`/`coach_skill_buff` 등 **현재 코드상 사용중인 테이블까지 DROP 대상에 포함**되어 있음. 이 스크립트를 그대로 실행하면 라이브 기능이 깨짐 — 과거 실행 이력 및 향후 오용 방지 확인 필요
- §3 미참조 19개 테이블의 실제 운영 DB row 수 — 데이터가 남아있으면 즉시 DROP 대신 백업 우선
- `player_card` / `player_card_hitter_attributes` / `player_card_pitcher_attributes` (V1) — mapper에 INSERT만 존재, SELECT 자체가 없음. `AdminPlayerCardController`도 생성 API만 제공하고 조회 API가 없음 — 운영에서 이 데이터를 읽는 별도 경로(직접 DB 조회, 배치 등)가 있는지 확인 필요
- `kbo_*` 5개 테이블 — Spring Boot 코드에 mapper 전무. `kbocrol`(Python) 등 별도 서비스가 동일 DB에 적재/조회하는지, 이번 "모바일 v2 미사용 테이블" 판정 범위에 포함되는지 확인 필요

# API 명세 통합 허브

이 문서는 컴프야펀 전체 API 엔드포인트를 한 장에서 훑어보는 색인이다. 각 엔드포인트의 상세 내용(요청/응답 필드, 에러 케이스, 검증 여부)은 복사해 오지 않고 **링크로만** 연결한다 — 실제 사양은 `docs/code-review-v2/prd/{도메인}/{도메인}-definition-api.md`를 열어서 본다.

기준: `docs/code-review-v2/prd/` 17개 도메인 문서 (2026-09-27 실측, 코드 기준 as-built) + `docs/consistency-audit/be-exception.md`(2026-09-28 실측).

---

## 1. 공통 규약

| 항목 | 내용 | 근거 |
|---|---|---|
| base 경로 | 일반 `/api/{도메인명(복수형)}`, 관리자 `/api/admin/{도메인명(복수형)}`. 소문자 kebab-case | `convention/backend.md` §5 |
| 응답 봉투 (성공) | `{ "success": true, "code": "{도메인}_SUCCESS", "data": {...} }` | `convention/backend.md` §8 |
| 응답 봉투 (실패) | `{ "success": false, "code": "{도메인}_XXX", "data": null }` — 모양은 항상 이 한 가지 | `be-exception.md` §4 |
| 인증 전달 방식 | `Authorization` 헤더 방식 **미사용**. `ACCESS_TOKEN`/`REFRESH_TOKEN` HttpOnly 쿠키만으로 인증 | `convention/backend.md` §1, §9 |
| 인증 판단 지점 | `/api/admin/**`만 시큐리티 설정이 자동 차단(`hasRole('ADMIN')`). 그 외 로그인 필요 경로는 컨트롤러가 직접 `userId == null` 체크 | `convention/backend.md` §9 |
| 페이징 규약 | 통일된 전역 규약 없음. 지원하는 곳만 쿼리 `page`(기본 0)/`size`(기본 20) — 예: `GET /api/admin/users`, `GET /api/admin/events`. 나머지 목록 엔드포인트는 페이징 없이 전량 반환 | 각 도메인 definition-api.md 실측 |
| 예외 클래스 | 도메인마다 별도 예외 클래스 없음. `BaseException` 단일 타입 + 도메인별 `{도메인}Messages` enum(18개)에서 code 채번 | `be-exception.md` §2 |
| ⚠️ 알려진 우회 | 없는 `/api/**` 경로, 깨진 JSON, 타입 불일치, 필수 파라미터 누락, 허용 안 된 메서드 — 이 5종은 400/404/405가 아니라 **500**으로 응답됨(catch-all이 MVC 표준 예외를 삼킴). 수정 전이므로 클라이언트 개발 시 참고 | `be-exception.md` §3 ①-A |

---

## 2. 엔드포인트 전체 목록

이 프로젝트는 v2 리뷰 대상 **17개 도메인** 기준이다(admin/authentication/coupons/error/events/guides/historyLegend/home/legendStats/mileage/notices/odds/playerSkills/players/policy/quiz/users). guides·odds·policy·error 4개는 서버 API가 없다(FE 정적 데이터).

### admin

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/admin/cache-sync/targets` | 캐시 동기화 대상 목록 조회 | 관리자 | ↓ |
| POST | `/api/admin/cache-sync/{targetId}/sync` | 대상 1건 캐시 재적용 | 관리자 | ↓ |
| POST | `/api/admin/cache-sync/sync-all` | 전체 캐시 재적용(부분 실패 개별 반환) | 관리자 | ↓ |
| * | `/api/upload/**` (`/profile` 제외) | 파일 업로드 | 관리자 | ↓ |
| * | `/api/upload/profile` | 프로필 이미지 업로드 | 로그인 필요(관리자 아님, 예외 규칙) | ↓ |
| * | `/api/admin/{boards,comments,posts,post-tags,reports,tags}/**` | 커뮤니티 모더레이션 — `@PreAuthorize` 없음, FE 진입점 없음(동결 방치) | 시큐리티 설정상 관리자, 컨트롤러 레벨 미방어 | ↓ |

coupons/events/notices/users/quiz 각 도메인의 관리자 엔드포인트는 각 도메인 표(아래)에 있다 — 여기서 중복 나열하지 않는다.
상세: [admin-definition-api.md](../code-review-v2/prd/admin/admin-definition-api.md)

### authentication

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/auth/naver/callback` | 네이버 로그인 콜백 처리, 쿠키 발급 후 redirect | 없음(네이버 서버가 호출) | ↓ |
| POST | `/api/auth/refresh` | refresh 검증 후 access/refresh 재발급(rotation) | REFRESH_TOKEN 쿠키 | ↓ |
| POST | `/api/auth/logout` | refresh 무효화 + 쿠키 만료 | REFRESH_TOKEN 쿠키(없어도 통과) | ↓ |

`GET /api/users/me`(로그인 여부 확인 겸용)는 users 도메인 소유.
상세: [authentication-definition-api.md](../code-review-v2/prd/authentication/authentication-definition-api.md)

### coupons

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/coupons` | 노출 중인 쿠폰 목록 조회 | 없음 | ↓ |
| GET | `/api/admin/coupons` | 전체 쿠폰 목록(노출 무관) | 관리자 | ↓ |
| POST | `/api/admin/coupons` | 쿠폰 등록 | 관리자 | ↓ |
| POST | `/api/admin/coupons/refresh` | 캐시 비우고 DB 재조회 | 관리자 | ↓ |
| PATCH | `/api/admin/coupons/{id}` | 쿠폰 수정 | 관리자 | ↓ |
| PATCH | `/api/admin/coupons/{id}/visible` | 노출 여부 토글 | 관리자 | ↓ |
| DELETE | `/api/admin/coupons/{id}` | 쿠폰 삭제 | 관리자 | ↓ |
| DELETE | `/api/admin/coupons/bulk` | 다건 삭제(부분 실패 허용) | 관리자 | ↓ |
| PATCH | `/api/admin/coupons/bulk/visible` | 다건 노출 여부 변경 | 관리자 | ↓ |

상세: [coupons-definition-api.md](../code-review-v2/prd/coupons/coupons-definition-api.md)

### error

서버 API 없음. FE 전용(라우트 매칭 실패 404 화면, 렌더 예외 ErrorBoundary) — API 에러 응답 처리와는 별개 관심사.
상세: [error-definition-api.md](../code-review-v2/prd/error/error-definition-api.md)

### events

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/events/external` | 노출 중인 이벤트 전체 목록 | 없음 | ↓ |
| GET | `/api/admin/events/external` | 관리자용 노출 이벤트 목록(⚠️ FE 미사용, 정리 대상) | 관리자 | ↓ |
| GET | `/api/admin/events` | 관리자용 전체 목록(필터·페이지네이션) | 관리자 | ↓ |
| POST | `/api/admin/events` | 이벤트 등록 | 관리자 | ↓ |
| PATCH | `/api/admin/events/{id}` | 이벤트 수정(전체 덮어쓰기) | 관리자 | ↓ |
| PATCH | `/api/admin/events/{id}/visible` | 노출 여부 토글 | 관리자 | ↓ |
| DELETE | `/api/admin/events/{id}` | 이벤트 삭제 | 관리자 | ↓ |
| DELETE | `/api/admin/events/bulk` | 다건 삭제 | 관리자 | ↓ |
| PATCH | `/api/admin/events/bulk/visible` | 다건 노출 여부 변경 | 관리자 | ↓ |

상세: [events-definition-api.md](../code-review-v2/prd/events/events-definition-api.md)

### guides

서버 API 없음. FE 전용 — 콘텐츠 12편이 빌드 산출물(JS 번들)에 포함돼 배포됨.
상세: [guides-definition-api.md](../code-review-v2/prd/guides/guides-definition-api.md)

### historyLegend

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/history-rounds` | 히스토리 모드 70라운드×25인 로스터 전량(재료 조인 포함) | 없음 | ↓ |

정식 명칭은 historyLegend, 코드상 라우트·식별자는 historyMode. 캐시 갱신은 `POST /api/admin/cache-sync/historyRound/sync`(관리자) 이용.
상세: [historyLegend-definition-api.md](../code-review-v2/prd/historyLegend/historyLegend-definition-api.md)

### home

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| POST | `/api/statistics/support-click` | 후원 버튼 클릭 기록(항상 204, 로그인 시만 실제 저장) | 없음(permitAll, 로그인 시만 저장) | ↓ |

홈 화면은 이 외에 `GET /api/quiz/latest`(quiz), `GET /api/coupons`(coupons), `GET /api/events/external`(events), `GET /api/notices`(notices) 4개를 구독만 한다 — 해당 행은 각 소유 도메인 표에 있다(중복 나열 안 함).
상세: [home-definition-api.md](../code-review-v2/prd/home/home-definition-api.md)

### legendStats

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/legend-stats` | 레전드 74명 태생 스탯 전량 | 없음 | ↓ |
| GET | `/api/legend-stats/pitch-types` | 구종 마스터 10종(표시명·정렬순서) | 없음 | ↓ |
| GET | `/api/legends` | 레전드 목록(+옵션 재료) — ⚠️ FE 호출 없음, 삭제 확정 | 없음 | ↓ |
| GET | `/api/legends/{id}` | 레전드 단건 + 재료 8행 — 실사용 | 없음 | ↓ |
| GET | `/api/legends/{id}/materials` | 재료만 단독 — ⚠️ FE 호출 없음, 삭제 여부 미정 | 없음 | ↓ |

상세: [legendStats-definition-api.md](../code-review-v2/prd/legendStats/legendStats-definition-api.md)

### mileage

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/mileage/sniper-targets` | 구단×연도×포지션 유일 카드(저격 가능 재료) 목록 | 없음 | ↓ |

경로 추천 계산(DP)은 서버 호출 없이 FE에서 직접 실행.
상세: [mileage-definition-api.md](../code-review-v2/prd/mileage/mileage-definition-api.md)

### notices

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/notices` | 노출 중인 공지 전체 목록(INTERNAL+EXTERNAL) | 없음 | ↓ |
| GET | `/api/notices/{noticeId}` | 공지 상세(⚠️ FE 미호출, 외부 클라이언트용) | 없음 | ↓ |
| GET | `/api/admin/notices` | 관리자용 전체 목록(노출 무관) | 관리자 | ↓ |
| GET | `/api/admin/notices/{noticeId}` | 관리자용 단건 조회 | 관리자 | ↓ |
| POST | `/api/admin/notices` | 공지 등록(본문 살균) | 관리자 | ↓ |
| PUT | `/api/admin/notices/{noticeId}` | 공지 수정(본문 재살균) | 관리자 | ↓ |
| PATCH | `/api/admin/notices/{noticeId}/visible` | 노출 여부 토글 | 관리자 | ↓ |
| PATCH | `/api/admin/notices/{noticeId}/pinned` | 고정 여부 토글(⚠️ FE 어떤 화면도 미호출) | 관리자 | ↓ |
| DELETE | `/api/admin/notices/{noticeId}` | 공지 삭제 | 관리자 | ↓ |
| DELETE | `/api/admin/notices/bulk` | 다건 삭제 | 관리자 | ↓ |
| PATCH | `/api/admin/notices/bulk/visible` | 다건 노출 여부 변경 | 관리자 | ↓ |
| POST | `/api/admin/notices/refresh` | 캐시 비우고 DB 재조회 | 관리자 | ↓ |

상세: [notices-definition-api.md](../code-review-v2/prd/notices/notices-definition-api.md)

### odds

서버 API 없음. FE 전용 — 확률 데이터는 정적 JSON(`@/data/odds`)에서 읽음.
상세: [odds-definition-api.md](../code-review-v2/prd/odds/odds-definition-api.md)

### players

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/player-cards` | 선수 카드 원형 11,668건 전량 | 없음 | ↓ |
| GET | `/api/player-cards/{teamCode}/stats` | 구단 하나(전 연도)의 카드별 태생 스탯 + 투수 구종 | 없음 | ↓ |

조회 전용, 등록/수정/삭제 API 없음.
상세: [players-definition-api.md](../code-review-v2/prd/players/players-definition-api.md)

### playerSkills

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/player-skills/hitters` | 타자 스킬 46건 전량(티어별 수치 포함) | 없음 | ↓ |
| GET | `/api/player-skills/pitchers` | 투수 스킬 46건 전량 | 없음 | ↓ |

조회 전용, 등록/수정/삭제 API 없음.
상세: [playerSkills-definition-api.md](../code-review-v2/prd/playerSkills/playerSkills-definition-api.md)

### policy

서버 API 없음. FE 전용 — 개인정보처리방침·이용약관·소개·문의 4화면 모두 파일 상단 상수를 그대로 렌더.
상세: [policy-definition-api.md](../code-review-v2/prd/policy/policy-definition-api.md)

### quiz

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/quiz/latest` | 최신 회차 퀴즈 1건(title 서버 합성) | 없음 | ↓ |
| GET | `/api/admin/quiz` | 전체 목록 | 관리자 | ↓ |
| POST | `/api/admin/quiz` | 등록 | 관리자 | ↓ |
| PATCH | `/api/admin/quiz/{id}` | 수정(부분) | 관리자 | ↓ |
| DELETE | `/api/admin/quiz/{id}` | 단건 삭제 | 관리자 | ↓ |
| DELETE | `/api/admin/quiz/bulk` | 일괄 삭제(부분 실패 허용) | 관리자 | ↓ |

이미지 업로드는 이 도메인이 아니라 공용 `/api/upload/events`(admin 도메인)를 씀. 응시·채점 API는 없음(확정 사양).
상세: [quiz-definition-api.md](../code-review-v2/prd/quiz/quiz-definition-api.md)

### users

| 메서드 | 경로 | 하는 일 | 인증 필요 | 상세 문서 |
|---|---|---|---|---|
| GET | `/api/users/me` | 본인 정보 조회 | 로그인 | ↓ |
| PATCH | `/api/users/me` | 닉네임/프로필 이미지 수정(보낸 필드만) | 로그인 | ↓ |
| DELETE | `/api/users/me` | 탈퇴 처리 + 쿠키 만료 | 로그인 | ↓ |
| GET | `/api/admin/users` | 회원 목록(기본 20건, 검색·필터) | 관리자 | ↓ |
| GET | `/api/admin/users/{publicId}` | 회원 상세 | 관리자 | ↓ |
| PATCH | `/api/admin/users/{publicId}/role` | 권한 변경(자기 자신 제외) | 관리자 | ↓ |
| PATCH | `/api/admin/users/{publicId}/status` | 상태 변경(자기 자신 제외) | 관리자 | ↓ |

users 도메인 3개 요청 DTO만 Bean Validation 애노테이션이 붙어 있다(프로젝트 전체에서 검증을 갖춘 거의 유일한 도메인).
상세: [users-definition-api.md](../code-review-v2/prd/users/users-definition-api.md)

---

## 3. 인증이 필요한 엔드포인트 요약

| 분류 | 기준 | 도메인(대표 경로) |
|---|---|---|
| 공개(인증 불필요) | 쿠키 없이 호출 가능 | coupons(`GET /api/coupons`), events(`GET /api/events/external`), notices(`GET /api/notices`, `/{id}`), players, playerSkills, legendStats, historyLegend, mileage, quiz(`GET /api/quiz/latest`), home(`POST /api/statistics/support-click`), authentication(`GET /api/auth/naver/callback`) |
| 로그인 필요(일반 회원) | 로그인 상태만 요구, 등급 무관 | users(`/api/users/me` 3종), authentication(`/api/auth/refresh`, `/api/auth/logout` — 쿠키 존재로만 판단), `/api/upload/profile` |
| 관리자 전용(ADMIN) | `/api/admin/**` 시큐리티 강제 차단 + (일부) 컨트롤러 이중 방어 | admin(cache-sync, upload), coupons·events·notices·users·quiz 각 `/api/admin/**` 전체 |
| 관리자 전용이나 방어 미흡 | 시큐리티 설정만 적용, 컨트롤러 `@PreAuthorize` 없음 | admin 문서의 community 모더레이션 6개 컨트롤러(`Admin{Board,Comment,Post,PostTag,Report,Tag}Controller`) — 동결 방치로 확정, FE 진입점 없음 |

---

## 4. 에러 코드 표

전역 처리 구조는 `@ControllerAdvice` 2개(예외 변환 1 + 응답 봉투 자동 포장 1)로 모인다. 도메인 예외는 전부 `BaseException` 단일 타입 + 도메인별 `{도메인}Messages` enum(18개 존재)에서 code를 가져온다. 아래는 이번에 읽은 도메인 문서·실측 문서에서 **직접 확인된** 코드만 정리한 것이고, 18개 enum의 전체 값 전수 목록은 아니다.

| 코드 | 상태 | 의미 / 발생 상황 | 출처 |
|---|---|---|---|
| `INVALID_REQUEST` | 400 | `@Valid` 검증 실패(`BindException`) — 전역 공통 | be-exception.md §2 |
| `INTERNAL_SERVER_ERROR` | 500 | catch-all — 미처리 예외 전체(⚠️ 위 §1 우회 5종 포함, 과도하게 발생) | be-exception.md §2 |
| `AUTH_UNAUTHORIZED` | 401 | 로그인 안 됨(쿠키 없음/서명 무효) | authentication, users |
| `AUTH_USER_BLOCKED` | 403 | 계정 차단/탈퇴/정지 상태 — ⚠️ `/api/admin/**`에 일반 사용자가 접근했을 때도 같은 코드가 나감(의미상 부정확) | authentication, users, be-exception.md §2 |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | refresh 쿠키 없음/빈 값 | authentication |
| `AUTH_REFRESH_TOKEN_EXPIRED` | 401 | refresh 해시 불일치(만료·재사용·탈취 후 rotation) | authentication |
| `AUTH_NAVER_TOKEN_FAILED` | 502 | 네이버 토큰 교환 실패 | authentication |
| `AUTH_INVALID_NICKNAME` | 400 | 닉네임 빈 값/20자 초과 | users |
| `AUTH_INVALID_PROFILE_IMAGE` | 400 | 프로필 이미지 URL이 업로드 경로가 아님 | users |
| `ADMIN_USER_NOT_FOUND` | 404 | `publicId` 형식 오류 또는 대상 없음 | users |
| `ADMIN_USER_SELF_ROLE_CHANGE_FORBIDDEN` | 403 | 본인 권한 변경 시도 | users |
| `ADMIN_USER_SELF_STATUS_CHANGE_FORBIDDEN` | 403 | 본인 상태 변경 시도 | users |
| `COUPON_CODE_DUPLICATED` | 409 | 쿠폰 코드 UNIQUE 위반(등록 시에만 잡힘, 수정 시엔 미포착 → 500 가능) | coupons |
| `QUIZ_ROUND_DUPLICATED` | 409 | 회차 중복(`uq_round`) | quiz |
| `QUIZ_NOT_FOUND` | 404 | id 없음 | quiz |
| `FUN_PLAYER_LEGEND_NOT_FOUND` | 404 | 레전드 id 없음 | legendStats |
| `CACHE_SYNC_TARGET_NOT_FOUND`(가칭) | 400(⚠️ `*_NOT_FOUND` 명명인데 404 아님, 확인 필요) | 존재하지 않는 캐시 동기화 대상 | be-exception.md §3 ②-5 |

상태코드 전체 분포(99개 도메인 예외 기준): 404×39 / 500×19 / 400×19 / 401×9 / 409×6 / 403×5 / 502×2. 나머지 코드 값은 각 도메인 `{도메인}Messages` 소스 또는 `-definition-api.md`를 직접 확인.

---

## 5. 문서가 없는 API

`docs/code-review-v2/prd/` 17개 도메인 밖에서 실제 코드에 존재하는 컨트롤러.

| 도메인 | 컨트롤러 | 엔드포인트 규모 | 상태 |
|---|---|---|---|
| community | `BoardController`, `PostController`, `CommentController`, `PostReactionController`, `CommentReactionController`, `TagController`, `PostTagController`, `ReportController` (공개) + `Admin{Board,Comment,Post,PostTag,Report,Tag}Controller` (관리자) | 컨트롤러 15개, 매핑 60개 이상(직접 셈) | 동결 — 읽기 전용 재오픈만, 글쓰기·댓글·좋아요 보류. 기획 문서는 `docs/domain/community/prd/community-status.md`(code-review-v2 대상 아님) |
| analytics | `AnalyticsController` (`POST /api/analytics/events`) | 1 | 기획은 있음(`docs/domain/analytics/prd/user-event-tracking.md`), API 명세서(v2 `-definition-api.md`)는 없음. 사용자 노출 화면 없는 이벤트 수집 인프라 |
| statistics | `StatisticsController` (`POST /api/statistics/support-click`) | 1 | 홈 후원 클릭 집계 — home-definition-api.md §3에 "home 직접 소유"로 문서화돼 있으나 statistics 자체 도메인 문서(README/table)는 없음 |
| gamification | 없음(코드 미구현) | 0 | 기획만 있음(`docs/domain/gamification/prd/`, 4건), FE/BE 코드 없음 — 목록에서 제외 |

---

## 6. 관련 문서

- [setup.md](./setup.md)
- [database.md](./database.md)
- [deploy.md](./deploy.md)
- [../convention/backend.md](../convention/backend.md)
- [../_roadmap/feature-definition.md](../_roadmap/feature-definition.md)
- [../code-review-v2/architecture-system-total.md](../code-review-v2/architecture-system-total.md)

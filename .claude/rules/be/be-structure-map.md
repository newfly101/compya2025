---
paths:
  - "src/main/java/**"
  - "src/main/resources/mapper/**"
---
# BE 구조 지도 (현황)

> 실측 2026-09-28 (원본은 git 태그 `docs-archive-2026-09`). **규칙은 `be-convention.md`**, 여기는 실제로 무엇이 어디 있는지만. 코드가 바뀌면 이 표부터 고친다 — 지도와 코드가 어긋나면 지도가 거짓말이 된다.

## 1. 최상위 4구역과 `common` 재고

| 구역 | 담는 것 | 도메인 의존 |
|---|---|---|
| `common/` | 응답·예외·유틸·공용 enum | 없음 |
| `config/` | 보안·CORS·S3·Swagger·로깅 빈 | 없음 |
| `security/` | 쿠키·JWT·인증 필터 | 없음 |
| `domain/` | 업무 코드 | — |

새로 만들기 전에 `common` 에 있는지 본다.

| 파일 | 쓰임 |
|---|---|
| `support/dto/GlobalResponse` · `ListResponse` · `OperationResponse` | 응답 껍데기 `success(메시지enum, data)` / `fail(메시지enum)` |
| `support/exception/BaseException` · `advice/GlobalExceptionHandler` · `GlobalResponseAdvice` | 예외 → 응답 |
| `support/cache/CacheEvictAfterCommit` · `support/ListAssembler` | 커밋 후 캐시 비우기 · 목록 조립 |
| `util/ClientInfoExtractor` · `util/JsonUtils` | IP·UA · JSON |
| `enums/CommonMessages` · `enums/fun/CardGrade` · `PlayerRole` · `enums/site/Grade` · `Target` | 공용 enum — **도메인마다 다시 만들지 않는다** |

## 2. 도메인 11개 + `fun/` 7개

| 도메인 | 성격 | 비고 |
|---|---|---|
| `admin` | 업로드 · CacheSync · Swagger 토큰 | 저장소·엔티티 없음. 타 도메인 Service 오케스트레이션 |
| `analytics` · `statistics` | 이벤트 수집 · 클릭 통계 | fire-and-forget, `@Transactional` 없음(의도) |
| `community` | 게시판 | 컨트롤러 14개, 동결 |
| `coupon` | 쿠폰 | **가장 표준** — 새 도메인은 이 형태 |
| `event` · `notice` · `quiz` | 콘텐츠 | docs 인터페이스 있음 |
| `home` | 홈 집계 `/api/home` | Service 단일 클래스(메서드 1개), 타 도메인 Service 호출 |
| `oauth` | 인증·회원 | `service/support/` 사용 |
| `fun/{historyLegend, legendCard, legendStat, mileage, playerCard, playerSkill, team}` | 게임 원본 데이터 (`fun_`·`data_` 테이블) | **전부 GET 전용** → `dto/request` 없음(의도). MapStruct 는 legendCard·team 만 — 나머지는 파생 필드라 서비스 변환 |

`fun/` 이 한 겹 더 들어간 이유는 코드 어디에도 없었다 — 여기가 유일한 기록: **DB 접두 `fun_`/`data_` 인 게임 원본 데이터를 묶는 계층**이다. 구버전 `domain/player` 는 2026-09-28 실측에 없다(정리됨).

## 3. 주소 지도

| 주소 | 컨트롤러 |
|---|---|
| `/api/auth` · `/api/users` | AuthController · UserController |
| `/api/boards` `posts` `comments` `tags` `post-tags` `reports` `post-reactions` `comment-reactions` | community 군 |
| `/api/coupons` `events` `notices` `quiz` | 각 도메인 |
| `/api/home` · `/api/legend-stats` · `/api/history-rounds` · `/api/legends` · `/api/player-cards` | home · fun 계열 (❓ 나머지 fun 주소는 실측 필요) |
| `/api/statistics/support-click` · `/api/analytics/**` | statistics(204) · analytics(202) — 봉투 없음/부분 |
| `/api/admin/{boards,posts,comments,tags,post-tags,reports}` | community 관리자 군 |
| `/api/admin/{coupons,events,notices,quiz,users}` | 각 도메인 관리자 |
| `/api/admin/dev` · `/api/upload` | SwaggerController(로컬) · UploadController(ADMIN) |

## 4. 규칙에서 벗어난 자리 (따라가지 말 것)

| 자리 | 현 상태 | 표준 |
|---|---|---|
| `fun/playerCard/dto/FunPlayerCardDtoMapper` | 변환기가 `dto/` 바로 아래 | `dto/mapstruct/{이름}MapStruct` (13개 도메인) |
| 목록 변환 | `toResponseList` / stream 혼용 | 도메인 안에서 하나로 |
| `FunPlayerCardController` | `@RestController("…V2")` 로 구버전과 이름 충돌 회피 | 정상 패턴, 이름 겹칠 때만 |
| docs 인터페이스 | `coupon` `event` `notice` `oauth` `quiz` 5개만 `controller/docs/` | 나머지는 컨트롤러에 직접. 둘 다 허용 |

테이블 접두 불일치 3건 — `fun_quiz`(사이트 콘텐츠인데 `fun_`), `fun_teams`(`data_` 가 맞음), `statistic_support_click`(접두 없음). 이름 변경은 ❓ D7, 바꾸면 실측 2026-09-28 목록(원본은 git 태그 `docs-archive-2026-09`) 전부 동시 수정.

사고 1줄: `fun/team` 에 `TeamMapper` 를 만들었다가 `domain/player.TeamMapper` 와 빈 이름 충돌로 기동 실패 → `FunTeamMapper` (경위 `docs/features/players/history.md`). `quiz` 매퍼 XML 이 `mapper/fun/` 에 있던 것을 2026-09-28 `mapper/site/` 로 이동.

## 5. 매퍼 XML 자리

| 구분 | 담는 것 | 예 | 테이블 접두 |
|---|---|---|---|
| `site/` | 서비스 운영 데이터 | `site/coupon/CouponMapper.xml` `site/quiz/…` | `site_` |
| `fun/` | 게임 데이터 | `fun/legendCard/PlayerLegendMapper.xml` | `fun_` · `data_` |
| (V1 잔재) | `posts` 242행·`boards`·`tags` 가 운영 DB 에 살아있음, 매퍼 참조 0 | — | ❓ D9 삭제/보존 |

`sql/V2/{site,fun}` 폴더와 짝. 현행 스키마 세대는 `sql/V3`, `V2` 는 이력 보존.

## 6. 함께 볼 것

- `be-convention.md` — 규칙
- `fe-store.md` — 화면 쪽 API 호출 규칙 (응답 봉투 벗기기)
- `sql/V2/{site,fun}` · `sql/V3/data` — 테이블 정의·초기 데이터

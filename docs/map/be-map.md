# BE 지도

> 넓고 얕은 정찰 결과. 사람 검토용 입력. 깊은 분석은 be-analyzer 영역.
> 스캔 범위: `src/main/java/com/dawne/com2usbaseball/**` (Java/Spring Boot, MyBatis)
> kbocrol/ (Python 크롤러) — 무시
> src/test/** — 무시

---

## 전역 prefix / 활성 profile

- **server.servlet.context-path**: 미설정 (= `/`)
- **API 공통 prefix**: 컨트롤러 단위로 `/api/...` 직접 명시 (전역 prefix 아님, 컨벤션)
- **활성 profile**: `application.properties` (default) + `application-prod.properties`. spring.profiles.active 값은 두 파일 모두 미설정 → 외부 환경변수 / 실행 옵션으로 주입 추정
- **DB**: MariaDB + MyBatis (`mybatis.mapper-locations=classpath:mapper/**/*.xml`)
- **앱 이름**: `compyafun` (서비스명)
- **인증**: JWT + Naver OAuth, Swagger 활성 (운영은 disabled)

---

## 도메인 추정

| 도메인 후보 | 폴더 경로 | API path prefix | PC/모바일/공용 | 엔드포인트 수 (bucket) |
|---|---|---|---|---|
| auth (OAuth/Naver) | `domain/oauth/controller/AuthController` | `/api/auth` | 공용 (추정) | ~10 |
| user | `domain/oauth/controller/UserController` | `/api/users` | 공용 (추정) | ~10 |
| board (게시판) | `domain/community/controller/BoardController` | `/api/boards` | 공용 (추정) | ~10 |
| post (게시글) | `domain/community/controller/PostController` | `/api/posts` | 공용 (추정) | ~10 |
| comment | `domain/community/controller/CommentController` | `/api/comments` | 공용 (추정) | 10~50 |
| post-reaction | `domain/community/controller/PostReactionController` | `/api/post-reactions` | 공용 (추정) | ~10 |
| comment-reaction | `domain/community/controller/CommentReactionController` | `/api/comment-reactions` | 공용 (추정) | ~10 |
| tag | `domain/community/controller/TagController` | `/api/tags` | 공용 (추정) | ~10 |
| post-tag | `domain/community/controller/PostTagController` | `/api/post-tags` | 공용 (추정) | ~10 |
| report (신고) | `domain/community/controller/ReportController` | `/api/reports` | 공용 (추정) | ~10 |
| coupon | `domain/coupon/controller/CouponController` | `/api/coupons` | 공용 (추정) | ~10 |
| event | `domain/event/controller/EventController` | `/api/events` | 공용 (추정) | ~10 |
| notice (공지) | `domain/notice/controller/NoticeController` | `/api/notices` | 공용 (추정) | ~10 |
| quiz | `domain/quiz/controller/QuizController` | `/api/quiz` | 공용 (추정) | ~10 |
| skill | `domain/skill/controller/SkillController` | `/api/skills` | 공용 (추정) | ~10 |
| kbo (게임/일정) | `domain/kbo/controller/KboGameController` | `/api/kbo` | 공용 (추정) | ~10 |
| ★ player-card (LEGACY) | `domain/player/controller/PlayerCardController` | `/api/player` | PC 레거시 (추정) | ~10 |
| ★ player-card (V2 신규) | `domain/fun/playerCard/controller/FunPlayerCardController` | `/api/player-cards` | 모바일/신규 (추정) | ~10 (현재 비어있음) |
| upload (S3) | `domain/admin/controller/UploadController` | `/api/upload` | 공용 (관리자) | ~10 |
| swagger/dev | `domain/admin/controller/SwaggerController` | `/api/dev` | 개발 (추정) | ~10 |
| **[admin]** board | `domain/community/controller/AdminBoardController` | `/api/admin/boards` | 공용 (관리자) | ~10 |
| **[admin]** post | `domain/community/controller/AdminPostController` | `/api/admin/posts` | 공용 (관리자) | ~10 |
| **[admin]** comment | `domain/community/controller/AdminCommentController` | `/api/admin/comments` | 공용 (관리자) | ~10 |
| **[admin]** tag | `domain/community/controller/AdminTagController` | `/api/admin/tags` | 공용 (관리자) | ~10 |
| **[admin]** report | `domain/community/controller/AdminReportController` | `/api/admin/reports` | 공용 (관리자) | ~10 |
| **[admin]** coupon | `domain/coupon/controller/AdminCouponController` | `/api/admin/coupons` | 공용 (관리자) | ~10 |
| **[admin]** event | `domain/event/controller/AdminEventController` | `/api/admin/events` | 공용 (관리자) | ~10 |
| **[admin]** notice | `domain/notice/controller/AdminNoticeController` | `/api/admin/notices` | 공용 (관리자) | ~10 |
| **[admin]** quiz | `domain/quiz/controller/AdminQuizController` | `/api/admin/quiz` | 공용 (관리자) | ~10 |
| ★ **[admin]** player-card (LEGACY) | `domain/player/controller/AdminPlayerCardController` | `/api/admin/player` | PC 레거시 (추정) | ~10 |
| ★ **[admin]** player-card (V2 신규) | `domain/fun/playerCard/controller/FunAdminPlayerCardController` | `/api/admin/player-cards` | 모바일/신규 (추정) | ~10 |

> 총 컨트롤러 30개, 도메인 후보 약 19개 (admin/일반 짝까지 합치면 30 prefix). 엔드포인트 mapping 어노테이션 합계 113개. bucket 은 컨트롤러 단위로 매긴 추정치.
> PC/모바일/공용 분류는 폴더 컨벤션상 명시적 표지가 거의 없어 대부분 "공용 (추정)" 처리. 확정은 web 측 호출처 매핑 후 가능.

---

## ★ 모호한 영역 / 이중관리 후보

### 1. ★ player-card 도메인 — V1 vs V2 동시 존재 (1순위 dual-management)

| 구분 | 폴더 | path | 시그널 |
|---|---|---|---|
| LEGACY | `domain/player/` | `/api/player`, `/api/admin/player` | `LegendPlayerCardResponse`, `AdminPlayerCardController` 등 풍부한 entity/dto/service |
| V2 신규 | `domain/fun/playerCard/` | `/api/player-cards`, `/api/admin/player-cards` | `@RestController("PlayerCardControllerV2")` 명시, controller 본문은 거의 비어있음 (스켈레톤) |

- **신호**: V2 컨트롤러 빈 클래스 = 마이그레이션 진행 중. `fun/playerCard/` 가 mobile/신규 라인 추정 (kbo 데이터 + skills 와 함께 ‘fun’ 묶음으로 재구성 중인 듯)
- **DB 측면**: sql/V1 vs sql/V2 의 컨테이너 분리와 정확히 매칭될 가능성 ★

### 2. ⚠️ `domain/skill` ↔ `domain/player` 결합 모호

- `domain/skill/` 안에 `CoachEntity`, `CoachSkillService` 등 코치 도메인이 섞여 있음
- `domain/player/` 안에 `PlayerSkillsEntity`, `PlayerSkillsRepository`, `TeamsEntity`, `TeamRepository` 등 skill·team 관련 엔티티가 섞여 있음
- 도메인 경계가 player vs skill 사이에 흐리다 — 재정렬 필요 가능

### 3. ⚠️ `domain/community` 거대화 (controller 11개)

- board / post / comment / tag / post-tag / post-reaction / comment-reaction / report + admin 짝
- 모바일 리뉴얼 진행 중 도메인 (web/src/domains/community/mobile/* 와 매핑 필요). PC/모바일 양쪽에서 동일 엔드포인트를 쓰는지, 모바일 전용 신규 path 가 추가될지 확인 필요

### 4. ⚠️ `domain/admin` 의 정체성

- `UploadController(/api/upload)`, `SwaggerController(/api/dev)` 만 들어 있음
- admin prefix 의 다른 컨트롤러들은 각 도메인 폴더 안에 `Admin*Controller` 형태로 흩어져 있음 → admin 폴더는 사실상 인프라성 / 공용 도구 모음. 도메인 아님

### 5. ⚠️ admin 짝의 일관성 결손

- 대부분 도메인이 `XxxController` + `AdminXxxController` 짝을 갖지만 다음은 admin 짝 부재 (단방향) — 정상인지 누락인지 확인 필요:
  - `kbo` (admin 없음)
  - `oauth/auth`, `oauth/user` (admin 없음 — 정상 추정)
  - `skill` (admin 없음)
  - `community/post-reaction`, `community/comment-reaction`, `community/post-tag` (admin 없음 — 정상일 수 있음)

---

## 분석 우선순위 제안

1. **★ player-card V1↔V2 마이그레이션 라인** — 가장 명백한 dual-management. sql/V1·V2, web/PC·mobile 과 3축 정합성 같이 봐야 함. 실행 중인 운영(LEGACY) 영향 큼.
2. **community 도메인 (controller 11개, mapping 다수)** — 모바일 리뉴얼 진행 중인 핵심 도메인. PC/모바일 호출처 매핑 후 dual 여부 판정 필요.
3. **player ↔ skill 도메인 경계** — coach·team·player-skill 의 소속 모호. 리팩토링 전 경계 합의 필요.
4. **kbo** — 컨트롤러 단일 (KboGameController), kbocrol(Python 크롤러)로부터 데이터 수신하는 진입점일 가능성 — 외부 인프라와의 계약 확인.
5. admin 짝 결손 도메인 (kbo, skill) — 운영 도구 누락 여부 확인.

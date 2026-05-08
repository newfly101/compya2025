# PRD Overview — 시스템 횡단

> 입력: `docs/map/{fe,be,db}-map.md` ★ Owner 확정 + `docs/specs/**` + `docs/reconciliation/**`.
> 본 문서는 **사실 baseline + Owner 확정 + 결정 필요 항목** 을 시스템 횡단 관점에서 정리. 도메인별 상세는 `docs/prd/domains/{domain}.md` 참조.

---

## 1. 개요

### 1.1 시스템 구성

| 구분 | 위치 | 비고 |
|---|---|---|
| **BE** (Java/Spring Boot) | `src/main/java/com/dawne/com2usbaseball/**` | 컨트롤러 30개, endpoint 86개 (`docs/specs/be/endpoints.md` line 285-289) |
| **FE** (React/Vite) | `web/src/` | 활성 라우트 9개, 모바일 단일 레이아웃 (`docs/map/fe-map.md` line 6-33) |
| **DB** (MariaDB + MyBatis) | `sql/`, `src/main/resources/mapper/**` | 테이블 49개, mapper xml 25개, statement 145개 (`docs/specs/db/{tables,mapper-mapping}.md`) |
| **인프라** | AWS S3 (`compya-images`), Naver OAuth, JWT (jjwt) | `docs/specs/be/services.md` line 129-137 |
| **kbocrol (Python 크롤러)** | `kbocrol/` | **별도 시스템**. BE 와 직접 통신 없음 — DB 공유만. 운영 보류 (Owner 진술: kbocrol 미가동, db-map.md ★ Owner 확정 #1) |

### 1.2 기술 스택

- **BE**: Spring Boot + MyBatis (JPA `@Entity` 0건 — `docs/map/db-map.md` line 30) + MariaDB
  - 캐시: Caffeine in-memory `@Cacheable` (대부분 read 서비스)
  - 인증: JWT + Naver OAuth + `@SpringBootApplication` 단일 (`Com2usbaseballApplication.java`)
- **FE**: React + Vite + Redux Toolkit (`@reduxjs/toolkit ^2.11.0`) + react-redux + redux-thunk
  - HTTP: axios 인스턴스 @ `web/src/app/store/APIConfig.js` (`baseURL: http://localhost:8080/api` 하드코딩)
  - 캐시: sessionStorage + AES (legacy PC dictionary/simulate 용)
- **운영**: SSH 터널 (`naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*` 모두 `application-prod.properties` 평문 노출 — auth-and-flags.md line 107)

### 1.3 도메인 마스터 (FE 도메인 ↔ BE 패키지 ↔ DB 테이블 그룹)

| FE 도메인 (사용자 노출 단위) | 분류 | BE 패키지 | DB 테이블 그룹 | PRD 파일 |
|---|---|---|---|---|
| **home** | 모바일 활성 (부분 mock) | (자체 컨트롤러 없음 — notices/coupons/events/quiz 호출) | (해당 도메인 표 참조) | `domains/home.md` |
| **community** | 모바일 활성 (모바일 mock-only, admin live) | `domain/community/*` (11 컨트롤러) | site_board, site_post, site_comment, site_tag, site_post_tag, site_post_reaction, site_comment_reaction, site_report (V2) + boards/posts/tags/posts_tags (V1, 이전완료) | `domains/community.md` |
| **coupons** ★ 표준 | 모바일 활성 (live) | `domain/coupon/*` (CouponController, AdminCouponController) | site_coupons (V2) + coupons (V1, dual 정책) | `domains/coupons.md` |
| **events** ★ 표준 | 모바일 활성 (live) | `domain/event/*` (EventController, AdminEventController) | site_events (V2) + events (V1, 이전완료) | `domains/events.md` |
| **notices** | 모바일 활성 (live) | `domain/notice/*` (NoticeController, AdminNoticeController) | site_notices (V2) + notices (V1, 이전완료) | `domains/notices.md` |
| **historyMode** | 모바일 활성 (mock-only) | (BE 없음) | (BE 없음) | `domains/historyMode.md` |
| **profile** | 모바일 활성 (auth state 만 사용) | `domain/oauth/UserController` (`/api/users/me`) | site_users (V2) | `domains/profile.md` |
| **authentication** | 횡단 (인프라성) | `domain/oauth/AuthController, UserController` | site_users (V2) | `domains/authentication.md` |
| **quiz** | 모바일 활성 (HomeScreen QuizSection) + admin live | `domain/quiz/*` (QuizController, AdminQuizController) | fun_quiz (V2) + quiz_answers (V1, 이전완료) | `domains/quiz.md` |
| **playerCard** | 횡단 (PC admin 운영 + V2 모바일 미진행) | `domain/player/*` (LEGACY) + `domain/fun/playerCard/*` (V2 빈 컨트롤러) | player_card / player_legend* / teams (V1) + fun_player_card / fun_player_card_* / fun_teams (V2) | `domains/playerCard.md` |
| **admin** | 횡단 (PC 어드민) | `domain/admin/*` (UploadController, SwaggerController) + 도메인별 `Admin*Controller` 흩어짐 | (해당 도메인 표 참조) | `domains/admin.md` |
| **dictionary** | Legacy PC 보류 | `domain/skill/SkillController` (`/api/skills/{target}`) | player_skills, skill_score_config, skill_pitcher_grade_stat (V1, V2 보류) | `domains/dictionary.md` |
| **simulate** | Legacy PC 보류 | (skill + player 호출 — 자체 BE 없음) | player_skills, player_card*, player_legend* | `domains/simulate.md` |
| **kbo** | Legacy PC 보류 (보류 도메인) | `domain/kbo/KboGameController` | kbo_seasons/teams/games/players/batter_logs (V2 보류) + kbo_team_code_mappings | `domains/kbo.md` |
| **mobile** | 폐기 권고 (공용 더미) | (n/a) | (n/a) | `domains/mobile.md` |

> **BE 단독 도메인 (FE 미흡수)**:
> - `domain/skill/coach/*` — `GET /api/skills/coach` wired (BE+DB 모두 살아있음, FE 호출 0건). `coach`, `coach_skill_buff`, `coach_skill_condition` 운영 중. `domains/dictionary.md` Part A 에 흡수 명시.

---

## 2. 권한 모델 + 인증 흐름

### 2.1 권한 등급

- **guest** — 토큰 없음. SecurityConfig `/api/**` permitAll
- **user** — JWT 보유 (`Authorization: Bearer` 헤더 또는 `ACCESS_TOKEN` 쿠키)
- **admin** — JWT 의 `role=ADMIN`. SecurityConfig `/api/admin/**` `hasRole("ADMIN")` 매칭

### 2.2 인증 진입

- **Naver OAuth**: `https://api.compyafun.com/api/auth/naver/callback` → `JwtProvider#createAccessToken(userId, role)` (60min) → `Set-Cookie: ACCESS_TOKEN` → FE `/auth/callback` redirect (`AuthCallback` 컴포넌트가 `requestUserHealthCheck` dispatch 후 `replace` redirect)
- **Health check**: 모든 라우트 부팅 시 `AuthProvider` 가 `GET /api/users/me` 호출 (`web/src/domains/authentication/store/thunks.js:6`, `AuthProvider.jsx:11`)
- **로그아웃**: `POST /api/auth/logout` → `Set-Cookie` 만료 (stateless 쿠키)

### 2.3 가드 위치

| 분기 | 위치 | 비고 |
|---|---|---|
| **FE 라우터** | `web/src/app/router/routes/{UserRoutes,AdminRoutes}.jsx` 의 `AuthGuard` | `/mypage` (USER+), `/admin/**` (ADMIN) |
| **BE URL 가드** | `SecurityConfig.java:43-54` | `/api/admin/**` hasRole("ADMIN"), `/api/**` permitAll, anyRequest denyAll |
| **JwtAuthFilter 우회** | `shouldNotFilter` | `/swagger-ui/**`, `/v3/api-docs/**`, `/api/auth/naver/**` |

### 2.4 알려진 위험 (Owner 확정 사실 — risk-and-priority.md TOP10 발췌)

| # | 위험 | 출처 | 차단성 |
|---|---|---|---|
| R3 | `state.auth.authority` shape 불일치 + setter `useRole` 오타 | `fe/state-and-data.md:30,126`, `slices.js:14-17` | ★ 모든 인증 분기 차단 |
| R4 | `POST /api/upload/events` permitAll (admin 가드 밖) | `auth-and-flags.md:64` | ◐ 별개 보안 fix |
| R5 | `GET /api/dev/test-token` permitAll → 누구나 ADMIN JWT 발급 | `auth-and-flags.md:62`, `be/dead-suspects.md:55` | ◐ 별개 보안 fix |
| R6 | `@PreAuthorize` 3개 컨트롤러 부착, `@EnableMethodSecurity` 미선언 → decorative | `auth-and-flags.md:43` | ◐ 정리 라운드 |
| R7 | community 위장 가능 endpoint (`POST /api/post-reactions` 등 userId body/query — SecurityContext 매칭 X) | `auth-and-flags.md:65` | ⚠ community BE 연결 시 fix 필수 |

---

## 3. 시스템 외부 의존

(생략 — `docs/specs/be/services.md` line 129-137 참조)

---

## 4. 데이터 정합성 정책 (도메인 횡단)

### 4.1 dual-write 정책 ↔ 코드 갭 (coupon)

- Owner 진술 (`db-map.md ★ Owner 확정 #2`): "**의도된 dual-write 운영**" — `coupons` ↔ `site_coupons` 양쪽
- 실제 코드 (`auth-and-flags.md:79-93`, `dual-management.md §1`):
  - INSERT/UPDATE: **site_coupons 단독** (CouponMapper.xml line 49-97)
  - SELECT(목록): site_coupons (line 17, 32)
  - SELECT(단건 `selectCouponById`): **coupons 만** (line 45)
  - `CouponAdminServiceImpl#createCoupon` (services.md:64): site_coupons INSERT → coupons 에서 readback → coupons 에 시드 row 없으면 즉시 NPE/IllegalState
- **결정 필요**: dual-write 굳히기 vs 단방향 정리 (★ Owner 결정 #1)

### 4.2 V2 통폐합 계획

- **player_legend\* → fun_player_card** (LEGEND ENUM 흡수, `db-map.md ★ Owner 확정 #5`)
  - V1 4 테이블: `player_legend`, `player_legend_hitter_career`, `player_legend_pitcher_career`, `legend_pitcher_pitch_slot`
  - V2 1+N 테이블: `fun_player_card`, `fun_player_card_hitter_stats`, `fun_player_card_pitcher_stats`, `fun_player_card_pitcher_pitch_grades`
  - 현재 상태: 배포가 legacy 기반 → player_legend\* 운영 중. fun_player_card 모듈은 작동 불능 (R2)
- **fun_player_card_positions 1:N 정규화** (`db-map.md ★ Owner 확정 #3`)
  - V1 `player_card.positions` JSON 컬럼 → V2 정규화 행. **방치 중** (Owner 인정)
  - mapper 풀세트 작성됨 but namespace mismatch + service 호출 0건

### 4.3 컬럼 의미 변경 의심 (★ Owner 결정 #2)

- `player_card_hitter_attributes.contact` (V1) ↔ `fun_player_card_hitter_stats.discipline` (V2)
- 양쪽 코멘트 "선구" 동일하지만 영문 의미 다름:
  - `contact` = 콘택트 (방망이 맞추기)
  - `discipline` = 선구안 (볼 골라내기)
- **결정 필요**: 단순 영문 표기 정정 vs 능력치 재정의 (`dual-management.md §6`, `risk-and-priority.md #8`)

### 4.4 폐기 예정 / 유보 (Owner 정책)

- **legacy PC 도메인** (`dictionary`, `simulate`, `kbo`): 라우트 주석 처리. 코드 보존 (기능 참고용 — `fe-map.md ★ Owner 확정 #1`). **삭제 금지**
- **MobileHomePage / domains/mobile/**: import 0건 + placeholder. (★ Owner 결정 #3 — 즉시 폐기 권고)
- **legacy V1 운영 데이터** (users, events, boards, posts, tags, posts_tags, notices, quiz_answers — 8개): mapper 0건, V2 이전 완료. 운영 row 보존 정책 결정 후 DROP 가능

---

## 5. 보안

### 5.1 가드 누락 endpoint

| endpoint | 위치 | 위험 |
|---|---|---|
| `POST /api/upload/events` | `UploadController.java:18` | path 가 `/api/upload/...` 라 `/api/admin/**` 매칭 밖 → permitAll. 누구나 S3 PUT 가능 |
| `GET /api/dev/test-token` | `SwaggerController.java:18` | `permitAll` + `userId=1, role=ADMIN` 하드코딩 → 누구나 ADMIN JWT 발급 |

### 5.2 @PreAuthorize decorative + @EnableMethodSecurity 미활성화

- `@PreAuthorize("hasRole('ADMIN')")` 3개 컨트롤러:
  - `AdminCouponController` (`coupon/AdminCouponController.java:18`)
  - `AdminEventController` (`event/AdminEventController.java:19`)
  - `AdminPlayerCardController` (`player/AdminPlayerCardController.java:15`)
- `@EnableMethodSecurity` 선언 0건 (전체 grep) → 어노테이션 무시
- **다행히** 모두 `/api/admin/**` prefix → URL 가드로 자연 보호. 단 `/api/admin/**` 외 경로에 사용 시 가드 부재

### 5.3 community 위장 가능 endpoint (userId SecurityContext 매칭 X)

| endpoint | 본인 검증 부재 위치 |
|---|---|
| `POST /api/post-reactions` (body.userId) | PostReactionController.java:33 |
| `DELETE /api/post-reactions` (query.userId) | PostReactionController.java:38 |
| `POST /api/comment-reactions`, `DELETE /api/comment-reactions` | CommentReactionController.java |
| `POST /api/comments`, `PUT /api/comments/{id}`, `DELETE /api/comments/{id}` (body.authorId) | CommentController.java:32, 37, 68 |
| `POST /api/comments/{id}/like|dislike|report` | CommentController.java:43-63 (호출자 식별 X) |
| `GET /api/reports/me`, `POST /api/reports` (reporterId body/query) | ReportController.java:17, 24 |
| `POST /api/post-tags`, `DELETE /api/post-tags`, `PUT /api/post-tags/replace` | PostTagController.java:28-39 |
| `GET /api/post-reactions/users/{userId}`, `GET /api/comment-reactions/users/{userId}` | 본인 외 다른 사용자 조회 가능 |

> 출처: `auth-and-flags.md:65`. JwtAuthFilter 가 `request.getAttribute("userId")` 로 세팅하므로 컨트롤러가 이를 읽어 비교만 하면 fix 가능.

---

## 6. 폐기 예정 항목 (high-confidence dead — `dead-confirmed.md` 기반)

### 6.1 FE 단독 dead — 즉시 정리 가능

| 항목 | 위치 | 영향 |
|---|---|---|
| `domains/mobile/` 전체 (MobileHomePage 포함) | `web/src/domains/mobile/**` | 폴더 통째 삭제 가능. import 0건 (`fe/dead-suspects.md:14`) |
| `app/wrapper/parts/{Header,Footer}.jsx` + `.module.scss` + `useHeader{Auth,Nav,UI}.js` | `web/src/app/wrapper/parts/**` | 6 파일 삭제. 현재 layout 은 `wrapper/mobile/parts/{TopBar,Drawer}.jsx` 사용 |
| `domains/admin/store/{api,endpoints,thunks}.js` | `web/src/domains/admin/store/**` | 파일 전체 주석 — 즉시 삭제 |
| `data/{CafeNotice,FunNotice,HistoryMode}.js` | `web/src/data/**` | import 0건 |
| `core/filters/CoreVisibleFilter.jsx`, `CoreStatusFilter.jsx` | `web/src/core/filters/**` | 외부 import 0건 |

### 6.2 BE/DB cross-check 결과 추가된 항목

| 항목 | 위치 | 신호 |
|---|---|---|
| `AdminPlayerCardController` 주석 핸들러 6개 | `domain/player/controller/AdminPlayerCardController.java:21-58` | 주석 정리 가능 (`be/dead-suspects.md C`) |
| BE V2 `fun_player_card` 모듈 (빈 컨트롤러 + 빈 DTO 3개 + 5개 mapper namespace mismatch) | `domain/fun/playerCard/**` | dead 가 아니라 **미완 스켈레톤**. V2 작업 자리. 보존 권고 |
| `.http` stale 파일 (`getEventList.http` 등) | `src/main/resources/test/event/*.http` | path 불일치 — 갱신 또는 삭제 |
| `global/utils/{DateFormatt,parseDate,sortCoupons}.js` | `web/src/global/utils/**` | grep 0 (`fe/dead-suspects.md E`) — 추가 검증 후 삭제 |
| `global/layout/callBack/AuthCallBack.jsx` | `web/src/global/layout/callBack/**` | 활성 path 는 `domains/authentication/callback/AuthCallBack.jsx` — 중복 |

### 6.3 보존 정책 (Owner 확정)

| 항목 | 정책 |
|---|---|
| `domains/{dictionary,simulate,kbo}/**` | Owner 정책: 보존 (기능 참고용). 삭제 금지 |
| `domains/community/feature/components/user/**` (PC `UserCommunityPage` 트리) | Owner 정책: PC 코드 참고 보존. 단 살릴 시 path 동기화 필수 (`fe-be-mismatch.md #44-45`) |
| V2 `fun_player_card` 모듈 | 작업 재개 자리. 보류 동안 동결 |
| `coupons` 테이블 | dual-write 정책 결정 전 폐기 금지 |

---

## 7. 모바일 리뉴얼 진행 순서 (Phase 0~4)

> reconciler 산출 (`_overview.md §3` ) 그대로 + 각 phase 의 도메인 의존도

### Phase 0 — 즉시 차단 fix (figma-spec-validator 진입 전 필수)

- **R3** `state.auth` shape 정리 (★ 모든 인증 분기) — 도메인: **authentication**
- **R9 부분** quiz public path 수정 (`/quiz-answers/latest` → `/quiz/latest`) + HomeScreen quiz dispatch 추가 — 도메인: **quiz**, **home**
- **Dead 코드 즉시 정리 (영향 0)** — 도메인: **mobile**(폐기), 횡단

### Phase 1 — 보안 별개 fix (모바일 차단 무관, 우선순위 별개)

- **R4** `/api/upload/events` 가드 추가 — 도메인: **admin**
- **R5** `/api/dev/test-token` 가드/비활성화 — 도메인: **admin**
- **R6** `@PreAuthorize` 정리 — 도메인: 횡단 (admin 컨트롤러)

### Phase 2 — figma-spec-validator 진입 (화면 단위 정합성 검증)

- **HomeScreen** — Phase 0 후 즉시 가능 — 도메인: **home**
- **CommunityScreen / CategoryScreen** — mock shape ↔ BE shape 검증 (R10) — 도메인: **community**
- **HistoryModeScreen** — 안정 (mock 운영 OK) — 도메인: **historyMode**
- **모바일 player_card 화면** (figma 도착 시) — ★ Phase 3 차단 — 도메인: **playerCard**

### Phase 3 — 차단 해소 후 진입 가능한 작업

- **모바일 community BE 연결** (R7 본인 검증 + 35+ BE_ONLY 연결) — 도메인: **community**
- **모바일 player_card 화면** (R2 V2 모듈 fix 4건 + R8 contact/discipline 결정 후) — 도메인: **playerCard**
- **admin community / admin quiz path 정렬** (R9 나머지) — 도메인: **community**, **quiz**, **admin**
- **V2 통폐합 라운드** (LEGEND ↔ fun_player_card + coupon dual-write 결정) — 도메인: **playerCard**, **coupons**

### Phase 4 — 정리 라운드 (모바일 리뉴얼 후)

- legacy PC 도메인 (dictionary, simulate, kbo) 운명 결정
- V1 legacy 운영 데이터 (users, events 등 8개) 처리
- store 동적 import 최적화

---

## 8. ★ Owner 결정 필요 의사결정 (5건)

> reconciler `_overview.md §2` 발췌. 각 결정의 도메인 분산 명시.

### 결정 1 (🔥): coupon dual-write 정책

- **현황**: Owner 진술 ("의도된 dual-write") ↔ 실 코드 (V2-only write + V1 단건 read fallback) 불일치
- **옵션**: (A) dual-write 굳히기 / (B) 단방향 정리 (selectCouponById 도 site_coupons 로)
- **차단성**: ★ admin coupon 화면 신규 작업 차단. public coupons 화면은 영향 없음
- **선결**: runtime-analyzer 가 `coupons` vs `site_coupons` row 수 비교
- **분산 도메인**: **coupons**

### 결정 2 (🔥): contact ↔ discipline 컬럼 의미

- **현황**: V1 `player_card_hitter_attributes.contact` ↔ V2 `fun_player_card_hitter_stats.discipline`. 영문 의미 다름
- **옵션**: (A) 단순 표기 정정 / (B) 능력치 재정의
- **차단성**: ★ 모바일 player_card 화면 신규 작업 시 차단
- **분산 도메인**: **playerCard**

### 결정 3 (◐): MobileHomePage / domains/mobile/ 폐기

- **현황**: `domains/mobile/` 전체 import 0건. `MobileHomePage.jsx` 는 placeholder ("어????????????")
- **옵션**: (A) 즉시 폐기 (권장) / (B) 공용 승격 / (C) `domains/home/` 흡수
- **차단성**: ◐ 모바일 리뉴얼 직접 차단 아님
- **분산 도메인**: **mobile** (폐기 권고), **home** (흡수 후보 검토)

### 결정 4 (◐): legacy PC 도메인 (dictionary / simulate / kbo) 운명

- **현황**: 라우트 주석 처리. Owner 정책상 코드 보존. 단 store 등록 (`store.js`) 에 reducer 상시 로딩 → 번들 사이즈 영향
- **옵션**: (A) 유지 / (B) 동적 import (lazy) / (C) 폐기
- **차단성**: ◐ 정리 라운드에서 결정
- **분산 도메인**: **dictionary**, **simulate**, **kbo**

### 결정 5 (⚠): V2 통폐합 진입 시점 (LEGEND 흡수 + fun_player_card 활성화)

- **현황**: V2 fun_player_card 모듈 작동 불능 (DTO + namespace + fun_teams 시드 + service 통합 4건 미완)
- **옵션**: (A) 모바일 리뉴얼 마무리 후 / (B) figma 에 player_card 화면 등장 시 즉시 V2 fix
- **차단성**: figma 결과에 따라 결정. 도착 시 즉시 결정 필요
- **분산 도메인**: **playerCard** (주), **coupons** (V2 통폐합 라운드 같이 가는 항목)

---

## 9. cross-reference

| 파일 | 핵심 내용 |
|---|---|
| `docs/prd/_overview.md` | 본 문서. 시스템 횡단 + product 결정 + 진행 순서 |
| `docs/prd/domains/{domain}.md` × N | 도메인별 Part A (사실 baseline) + Part B (상세 기획 placeholder) |
| `docs/reconciliation/_overview.md` | 분석 종합. 매핑 정합성 + dual table 분포 + dead 분류 |
| `docs/reconciliation/risk-and-priority.md` | TOP 10 위험 + 차단성 + figma-spec-validator 화면 단위 신호 |
| `docs/specs/**` | spec 베이스라인 (BE/FE/DB) |
| `docs/map/**` | scout 결과 + ★ Owner 확정 섹션 |

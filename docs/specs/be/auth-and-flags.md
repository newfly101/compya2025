# Auth & Flags

> 권한 분기 (guest/user/admin) + feature flag + profile 별 활성/비활성. **표 우선, 위험 항목 강조.**

---

## 인증 메커니즘

- **JWT** (jjwt 0.11.5)
  - 토큰 위치: `Authorization: Bearer ...` 헤더 우선, 없으면 `ACCESS_TOKEN` 쿠키 fallback
  - 발급: `JwtProvider#createAccessToken(userId, role)` — manifest property `jwt.access-token-expire-minutes=60`
  - 검증/주입: `JwtAuthFilter` (src/main/java/com/dawne/com2usbaseball/security/filter/JwtAuthFilter.java)
    - 토큰 파싱 → `request.setAttribute("userId", userId)` + `SecurityContextHolder` 에 `ROLE_{role}` 권한 설정
    - 토큰 있는데 invalid 면 즉시 401 + `AUTH_UNAUTHORIZED` body
- **Naver OAuth**
  - Redirect URI (운영): `https://api.compyafun.com/api/auth/naver/callback`
  - 콜백 후 JWT 발급 → `Set-Cookie: ACCESS_TOKEN`
  - 운영 시 `naver.client-id/secret` 은 `application-prod.properties` 에 평문 노출 (★ 위험 — 별도 항목)

---

## URL 가드 (SecurityConfig.java:43-54)

| 패턴 | 정책 | 비고 |
|---|---|---|
| `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`, `/docs/**`, `/swagger-custom.css` | permitAll | Swagger 정적 리소스 |
| `/api/admin/**` | `hasRole("ADMIN")` | URL 매칭 단일 가드 |
| `/api/**` | permitAll | guest/user 구분 없음 — 컨트롤러가 필요시 직접 검증 |
| 그 외 (anyRequest) | denyAll | API 외 경로 차단 |

JwtAuthFilter `shouldNotFilter`: `/swagger-ui/**`, `/v3/api-docs/**`, `/api/auth/naver/**` (콜백 우회)

## 권한 분기 — 엔드포인트별 실제 가드

| 분기 | 가드 위치 | 엔드포인트 수 | 비고 |
|---|---|---|---|
| **ADMIN** | SecurityConfig URL 매칭 (`/api/admin/**`) | 42 | 모든 admin 컨트롤러 자동 적용 |
| **JWT 필요 (USER 이상)** | 컨트롤러 본문에서 `request.getAttribute("userId")` 체크 | 1 (`GET /api/users/me`) | 없으면 `AuthException(AUTH_UNAUTHORIZED, 401)` |
| **permitAll (guest 포함)** | 가드 없음 | 약 43 | 아래 위험 항목 참조 |

---

## ★ @PreAuthorize 사실상 무효 (decorative)

`@PreAuthorize("hasRole('ADMIN')")` 가 **3 개** 컨트롤러에 부착됨:

- `AdminCouponController` (src/main/java/com/dawne/com2usbaseball/domain/coupon/controller/AdminCouponController.java:18)
- `AdminEventController` (src/main/java/com/dawne/com2usbaseball/domain/event/controller/AdminEventController.java:19)
- `AdminPlayerCardController` (src/main/java/com/dawne/com2usbaseball/domain/player/controller/AdminPlayerCardController.java:15)

**그러나** 어디에도 `@EnableMethodSecurity` / `@EnableGlobalMethodSecurity` 가 선언되지 않음 (전체 grep 0 건).
→ Method-level security 가 **활성화되지 않음** → `@PreAuthorize` 는 무시됨.
→ 실제 ADMIN 가드는 SecurityConfig URL 매칭 (`/api/admin/**`) 으로만 작동.

**결과**: 다행히 위 세 컨트롤러 모두 `/api/admin/**` prefix 라 URL 가드로 자연 보호됨. 그러나 `@PreAuthorize` 가 실제 동작한다고 오해해서 향후 `/api/admin/**` 외 경로에 사용하면 가드 부재가 발생함.

---

## ★ 권한 가드 누락/위험 항목

| 위험 항목 | 엔드포인트 | 위치 | 위험 |
|---|---|---|---|
| ADMIN JWT 발급 누구나 가능 | `GET /api/dev/test-token` | src/main/java/com/dawne/com2usbaseball/domain/admin/controller/SwaggerController.java:18 | `permitAll` 매칭 + `userId=1, role=ADMIN` 하드코딩 토큰 즉시 발급. 운영도 라우트는 살아있음 (`springdoc.swagger-ui.enabled=false` 는 swagger UI 만 끔) |
| Upload 엔드포인트가 admin 가드 밖 | `POST /api/upload/events` | src/main/java/com/dawne/com2usbaseball/domain/admin/controller/UploadController.java:18 | path 가 `/api/upload/...` 이라 `/api/admin/**` 매칭에 안 잡힘 → permitAll. 누구나 S3 PUT 가능 |
| reaction/report/post-tag 등 user 식별이 body/query | `POST /api/post-reactions` (body.userId), `DELETE /api/post-reactions` (query.userId), `POST /api/comment-reactions`, `DELETE /api/comment-reactions`, `GET /api/reports/me` (query.reporterId), `POST /api/reports` (body.reporterId), `POST /api/comments` (body.authorId), `PUT /api/comments/{id}`, `DELETE /api/comments/{id}`, `POST /api/post-tags`, `DELETE /api/post-tags`, `PUT /api/post-tags/replace`, `GET /api/post-reactions/users/{userId}`, `GET /api/comment-reactions/users/{userId}` | community/coupon 컨트롤러 다수 | 본인 검증 (`SecurityContextHolder` 의 userId vs 입력 userId) 없음 — 다른 사용자로 위장한 좋아요/신고/댓글 작성/삭제 가능 |

---

## ★ V1 / V2 공존 — 별도 row

| 도메인 | V1 (LEGACY) | V2 (신규) | 위험 |
|---|---|---|---|
| player-card | `/api/player`, `/api/admin/player` (PlayerCardController, AdminPlayerCardController). 현 배포 운영 중 | `/api/player-cards`, `/api/admin/player-cards` (FunPlayerCardController 빈 클래스, FunAdminPlayerCardController 스켈레톤+빈 DTO) | 전환 시점에 양쪽 호출 혼재 가능. dead-suspects.md 참조 |
| coupon | `coupons` table — `selectCouponById` 만 SELECT (CouponMapper.xml:35) | `site_coupons` — INSERT/UPDATE/SELECT (목록) | ★ **insert 후 readback 불일치 위험** (아래 별도 항목) |
| 기타 (notice/event/user/board/post/tag/comment/quiz) | V1 table (`notices`, `events`, `users`, `boards` 등) — mapper 미참조 | V2 table (`site_*`, `fun_*`) — 모든 mapper 가 V2 만 사용 | 전환 완료. V1 데이터는 mapper 0 건이지만 DB 잔존 가능 |

---

## ★★ 핵심 위험: coupon dual-write 정책 vs 실제 코드 불일치

db-map Owner 확정 #2: "**coupons ↔ site_coupons 는 의도된 dual-write 운영**".
**그러나 실제 BE 코드는 dual-write 가 아님:**

- `CouponMapper.xml` 의 INSERT/UPDATE 모두 **`site_coupons` 만 대상** (file:49-97)
- `coupons` 테이블 SQL 은 `selectCouponById` 1 건만 — **read 전용** (file:35-47)
- `CouponAdminServiceImpl#createCoupon` (file:42) 흐름:
  1. `repository.insertCoupon(coupon)` → site_coupons INSERT (auto increment id 받아옴)
  2. `repository.findById(coupon.getId())` → ★ **`coupons` 테이블에서 동일 id 로 SELECT** → 존재 여부 보장 안 됨
- `CouponAdminServiceImpl#updateCoupon` (file:58):
  1. `repository.findById(id)` → coupons 에서 SELECT
  2. site_coupons 만 UPDATE → coupons 는 갱신 안 됨

**결과**: dual-write 정책이라면 INSERT/UPDATE 가 양쪽 모두에 가야 하지만 실제로는 site_coupons 단일 write + coupons 단일 read 의 hybrid. 현재 `coupons` 데이터가 site_coupons 와 동일 id 로 시드되어 있지 않으면 createCoupon 이 즉시 NPE/예외. **owner 의도 vs 코드 mismatch — reconciler 우선 확인 항목**.

---

## Feature Flag / Profile

본 프로젝트에 일반적 의미의 feature flag (LaunchDarkly 등) 없음. 다음 properties 만으로 환경 분기:

| flag/property | application.properties (default) | application-prod.properties | 효과 |
|---|---|---|---|
| `springdoc.swagger-ui.enabled` | (미설정 = true) | `false` | 운영은 Swagger UI 비활성. 단 `/api/dev/test-token` 컨트롤러 자체는 살아있음 (★ 위험) |
| `spring.cache.type` | `simple` | `simple` | 동일. Caffeine 의존 추가됐지만 실제 cache type 은 simple (단순 Map 기반) |
| `mybatis.configuration.default-enum-type-handler` | (미설정) | `EnumTypeHandler` | 운영만 enum 핸들러 명시. dev 와 enum 직렬화 동작 다를 수 있음 |
| `spring.datasource.url` | `${DB_HOST}:${DB_PORT}/${DB_NAME}` (env) | 하드코딩 `127.0.0.1:3306/compyafun`, user `newfly101`, pwd 평문 | ★ 운영 설정에 평문 자격증명 — 위험 |
| `naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*` | env 변수 참조 | **하드코딩 평문** | ★ 운영 설정에 OAuth/JWT/AWS 시크릿 모두 평문 — 위험 |
| `spring.profiles.active` | 미설정 | 미설정 | 외부 환경변수/실행 옵션 주입 의존 |

---

## 정리 — reconciler 우선 확인

1. **coupon dual-write 정책 확정** — owner 의도(dual-write 운영) vs 실제 코드(site_coupons 단일 write + coupons 단일 read) 불일치. createCoupon 의 readback 시점에 IllegalState 발생 가능
2. **`/api/dev/test-token` 운영 노출 차단** — 누구나 ADMIN 토큰 발급 가능
3. **`/api/upload/events` admin 가드** — 현재 permitAll, S3 무차별 PUT 노출
4. **Reaction/Report/Comment 의 본인 검증** — body/query 의 userId/authorId/reporterId 가 SecurityContext 와 매칭되는지 컨트롤러 단 검증 부재
5. **`@PreAuthorize` decorative 문제** — `@EnableMethodSecurity` 추가하든지 어노테이션 제거하든지 정리 필요
6. **prod properties 평문 시크릿** — 별도 보안 작업 필요

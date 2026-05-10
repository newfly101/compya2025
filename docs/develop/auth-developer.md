# Auth Developer Guide (single entry)

> Claude / 신규 작업자가 인증·인가 분기 작업 시 1차 참조하는 단일 가이드. 깊이 들어가야 할 때만 `docs/specs/be/auth-and-flags.md` cite.
> 관련: 백엔드 = Spring Boot + MyBatis. 사용자 = `site_users`. 외부 OAuth = **Naver 단일** (추가 예정 없음). 토큰 = JWT, **HttpOnly 쿠키 전달 (Authorization 헤더 불사용)**.

---

## 1. 로그인 흐름 (Naver 1개)

```text
1. FE        → Naver authorize URL 로 이동 (state 발급은 FE 책임)
2. Naver     → user 인증
3. Naver     → GET /api/auth/naver/callback?code=...&state=...      (BE 콜백)
4. BE        → AuthController.naverCallback() 진입
5. NaverOAuthService.getAccessToken(code, state)                    (네이버 token endpoint)
6. NaverOAuthService.requestUserInfo(accessToken)                   (https://openapi.naver.com/v1/nid/me)
7. UserService.findOrCreateNaverUser(info)                          (provider="NAVER" + providerId 로 upsert)
8. AuthServiceImpl.validateUserStatus(user)                         (BLOCKED/SUSPENDED/WITHDRAWN → 403)
9. JwtProvider.createAccessToken(userId, role.name())               (HS256, sub/role/iat/exp)
10. AuthCookieFactory.createAccessToken(jwt, request)               (Set-Cookie ACCESS_TOKEN)
11. response.sendRedirect( AuthRedirectProvider.setRedirectUrl() )  (FE /auth/callback 으로 302)
```

신규 사용자는 `UserRole.USER` + `UserStatus.ACTIVE` 로 자동 생성. 기존 사용자는 `last_login_at` 만 갱신. ADMIN 승격은 **DB 직접 변경**만 (코드 경로 없음).

---

## 2. 요청 인가 흐름

```text
1. Browser → Cookie: ACCESS_TOKEN=...           (withCredentials 쿠키)
2. AccessLogFilter (request 로깅)
3. JwtAuthFilter
   ├─ resolveToken(): Authorization "Bearer" → 없으면 cookie ACCESS_TOKEN
   ├─ JwtProvider.getUserId / getUserRole       (parseClaimsJws 검증)
   ├─ request.setAttribute("userId", userId)
   └─ SecurityContext = UsernamePasswordAuthenticationToken(
        principal=userId, authorities=[ROLE_<role>] )
4. SecurityConfig.authorizeHttpRequests          (URL 패턴 매칭)
   ├─ /swagger-* /v3/api-docs /docs/** → permitAll
   ├─ /api/admin/**                    → hasRole("ADMIN")  ← 실가드
   ├─ /api/**                          → permitAll          ← 그 외 인증 강제 안 함
   └─ anyRequest                        → denyAll
5. Controller 진입
   ├─ public:    Long userId = (Long) request.getAttribute("userId")  → null 가능
   └─ /me:       userId == null 이면 AuthException(AUTH_UNAUTHORIZED, 401)
```

`JwtAuthFilter.shouldNotFilter` 가 `/swagger-ui`, `/v3/api-docs`, `/api/auth/naver` 는 필터 자체를 건너뜀. 토큰이 있는데 만료/위조면 필터에서 즉시 401 응답하고 chain 중단.

---

## 3. JWT claim 명세

| claim | 의미 | 값 / 타입 | 출처 |
|---|---|---|---|
| `sub` | userId (`site_users.id`) | `String.valueOf(Long)` | `JwtProvider.createAccessToken` L32 |
| `role` | 권한. SecurityContext authority 는 `ROLE_<role>` 로 prefix 됨 | `"ADMIN"` / `"USER"` (UserRole.name()) | L33 |
| `iat` | 발급 시각 | `new Date()` | L34 |
| `exp` | 만료 시각 | `iat + jwt.access-token-expire-minutes * 60_000` (현재 60분) | L35 |
| signature | HS256 + `jwt.secret` UTF-8 bytes | `Keys.hmacShaKeyFor(...)` | L22 |

refresh token / iss / aud / jti 같은 claim 은 **없다**. 만료되면 재로그인.

---

## 4. 쿠키 옵션 (환경별)

`AuthCookieFactory` 가 `request.getServerName()` 로 분기.

| 옵션 | 로컬 (`localhost` / `127.0.0.1`) | 배포 (그 외) |
|---|---|---|
| name | `ACCESS_TOKEN` | `ACCESS_TOKEN` |
| value | JWT | JWT |
| HttpOnly | `true` | `true` |
| Path | `/` | `/` |
| Secure | `false` | `true` |
| SameSite | `Lax` | `None` |
| Domain | (미설정) | `.compyafun.com` |
| Max-Age | (브라우저 세션) | (브라우저 세션) |

로그아웃 시는 동일 옵션 + `Max-Age=0` (`expireAccessToken`). FE 는 다른 도메인 (`compyafun.com` ↔ `api.compyafun.com`) 으로 cross-site 요청이라 `SameSite=None; Secure` 가 필수.

---

## 5. userRole 종류 + 분기 위치

enum: `UserRole { ADMIN, USER }` (`domain/oauth/enums/UserRole.java`).

| 위치 | 분기 방식 | 비고 |
|---|---|---|
| `SecurityConfig` URL 매칭 | `.requestMatchers("/api/admin/**").hasRole("ADMIN")` | **현재 유효한 1차 가드**. 모든 admin endpoint 는 `/api/admin/**` 로 강제 |
| `@PreAuthorize("hasRole('ADMIN')")` | `AdminCouponController` / `AdminEventController` / `AdminPlayerCardController` | ⚠ **decorative — `@EnableMethodSecurity` 미선언** (R6, [§ 11](#11-안티패턴--흔한-실수) 참조) |
| FE 분기 | `/users/me` 응답의 `userRole` 로 페이지/메뉴 분기 | BE 는 응답에 노출만, 라우팅 가드는 FE 책임 |
| `/api/**` (admin 외) | URL 패턴은 `permitAll` | 컨트롤러에서 `userId == null` 직접 체크 (현재 `/users/me` 만) |

`hasRole("ADMIN")` 은 Spring Security 가 내부적으로 `ROLE_ADMIN` authority 를 찾는다. `JwtAuthFilter` 가 `"ROLE_" + role` 로 prefix 해서 넣음 (L45) → 매칭 성립.

---

## 6. 신규 endpoint 추가 권한 설정 5단계

1. **분류**: public(비로그인 OK) / protected(로그인 필요) / admin 중 결정
2. **URL 패턴 결정**:
   - public · protected → `/api/{domain}/...`
   - admin              → `/api/admin/{domain}/...`  ← prefix 강제 (URL 가드 단일 신뢰)
3. **SecurityConfig 등록 여부**: `/api/admin/**` 는 자동 가드. public / protected 는 별도 등록 불필요 (`/api/**` permitAll 이 받아냄). 단 protected 는 controller 에서 `userId == null` 체크 필수
4. **Controller 작성**:
   - public:     `Long userId = (Long) request.getAttribute("userId");` (null 허용)
   - protected:  위 + `if (userId == null) throw new AuthException(AUTH_UNAUTHORIZED, UNAUTHORIZED);`
   - admin:      `@RequestMapping("/api/admin/...")` 로 충분. `@PreAuthorize` 추가는 **현재 무효** (R6) → 의존하지 말 것
5. **테스트**:
   - 쿠키 없이 호출 → public 200 / protected 401 / admin 401
   - USER 쿠키로 admin 호출 → 403 (`AUTH_USER_BLOCKED` body)
   - 만료 쿠키로 호출 → 401 (filter 단 차단)

---

## 7. 환경별 분리 표

`spring.config.import=optional:file:.env` 로 `.env` 흡수. **로컬용 `application.properties` 는 `${PLACEHOLDER}` 형태** (env 주입), `application-prod.properties` 는 현재 plaintext 가 들어가 있어 운영 의도와 충돌 (§ 11 안티패턴 참조).

| 키 | 로컬 (`application.properties`) | 배포 (`application-prod.properties`) | 분기 지점 |
|---|---|---|---|
| `jwt.secret` | `${JWT_SECRET}` (.env) | plaintext (★ 리포지터리 노출) | `JwtProperties.secret` |
| `jwt.access-token-expire-minutes` | `60` | `60` | `JwtProperties` |
| `naver.client-id` | `${NAVER_CLIENT_ID}` | plaintext (★) | `NaverOauthProperties.clientId` |
| `naver.client-secret` | `${NAVER_CLIENT_SECRET}` | plaintext (★) | `NaverOauthProperties.clientSecret` |
| `naver.redirect-uri` | `${NAVER_REDIRECT_URI}` | `https://api.compyafun.com/api/auth/naver/callback` | `NaverOauthProperties.redirectUri` |
| FE redirect URL | `http://localhost:3000/auth/callback` | `https://compyafun.com/auth/callback` | `AuthRedirectProvider` (코드 hardcode) |
| Cookie `Secure` | `false` | `true` | `AuthCookieFactory.applyEnvOptions` (host 분기) |
| Cookie `SameSite` | `Lax` | `None` | 동상 |
| Cookie `Domain` | (없음) | `.compyafun.com` | 동상 |
| CORS `AllowedOrigins` | 둘 다 등록 | 둘 다 등록 | `CorsConfig` (분기 없음, 두 origin 전부 허용) |

쿠키와 redirect 의 환경 분기는 `application*.properties` 가 아니라 **request host 기반 코드 분기**라는 점에 주의.

---

## 8. 로그아웃 흐름

```text
FE  → POST /api/auth/logout       (쿠키 자동 동봉, body 없음)
BE  → AuthCookieFactory.expireAccessToken(request)
       └─ 동일 옵션 + Max-Age=0 (HttpOnly, Path=/, env 옵션 동일)
BE  → response.addHeader("Set-Cookie", ...)
FE  → 브라우저가 쿠키 즉시 만료 처리
```

서버는 토큰 블랙리스트를 두지 않는다 (stateless). 로그아웃 후에도 클라이언트가 쿠키를 어떻게든 보존하면 만료시각까지는 유효 — 60분 만료 정책으로 흡수.

---

## 9. `/users/me` 응답 형태

FE healthcheck 가 부팅 시 1회 호출. 인증 안 됐으면 401 (filter 통과 못 함, 또는 `userId == null` 분기). `GlobalResponse<UserMeResponse>` 래퍼.

```json
{
  "success": true,
  "code": "AUTH_SUCCESS",
  "data": {
    "id": 1,
    "nickname": "dawne",
    "email": "dawne@naver.com",
    "profileImage": "https://...",
    "userRole": "USER",
    "lastLoginAt": "2026-04-04 13:00"
  }
}
```

`userRole` 은 enum 직렬화 (`"USER"` / `"ADMIN"`). FE 가 `state.auth.userRole === 'ADMIN'` 으로 admin UI / operationListener / 메뉴 분기. **이 필드가 FE admin 분기의 단일 진실원**.

401 응답 body (filter 든 EntryPoint 든 동일):
```json
{ "success": false, "code": "AUTH_UNAUTHORIZED", "data": null }
```

403 (BLOCKED/SUSPENDED/WITHDRAWN 또는 admin URL 권한 부족):
```json
{ "success": false, "code": "AUTH_USER_BLOCKED", "data": null }
```

---

## 10. OAuth provider 추가는 의도 없음

현재 `OAuthProvider { NAVER }` enum 단일. `UserEntity.provider` 컬럼은 보존되어 있지만 새 provider 추가는 **로드맵에 없다**. provider 분기 로직 (`findByProviderAndProviderId("NAVER", ...)`) 은 하드코딩 문자열 그대로 유지. 추가가 필요해지는 순간 enum 확장 + `UserService.findOrCreateNaverUser` 일반화 + 새 callback endpoint 작업이 동반된다.

---

## 11. 안티패턴 / 흔한 실수

1. **Authorization 헤더로 토큰 보내기** — FE 는 무조건 `withCredentials: true` 쿠키. `JwtAuthFilter` 가 헤더도 받긴 하지만 (`Bearer` parse) FE 표준 통로 아님 → admin Swagger 디버그 외 사용 금지
2. **`@PreAuthorize` 만 믿기 (R6)** — 현재 `@EnableMethodSecurity` 미선언 → `@PreAuthorize("hasRole('ADMIN')")` **무시됨** (3개 컨트롤러). admin URL 가드 (`/api/admin/**`) 만 실가드. 신규 admin endpoint 는 `/api/admin/...` prefix 필수
3. **`/api/dev/test-token` 노출 (R5)** — `SwaggerController.getTestToken()` 이 누구든 ADMIN JWT 발급. `@Profile`/가드 없음 → prod 배포 시 즉시 ADMIN 탈취. authentication PRD T2 에서 `@Profile("!prod")` 로 잠그는 작업 진행 중
4. **`application-prod.properties` 에 secret hardcode** — `jwt.secret`, naver client secret, AWS access key 가 plaintext. 이 파일은 `${PLACEHOLDER}` 로 변환 + 시크릿 매니저로 외부화 필요
5. **state param 검증 부재** — `NaverOAuthService.getAccessToken` 이 state 를 그대로 네이버 token endpoint 로 전달만 하고 BE 측에서 발급/검증하지 않음. CSRF 방어는 네이버 SDK 의 state 매칭에 의존. BE 자체 nonce 저장소 없음
6. **`request.getAttribute("userId")` 로 인증 강제** — `/users/me` 처럼 controller 에서 직접 null 체크하는 패턴은 **protected endpoint 마다 잊기 쉽다**. 차라리 `/api/protected/**` 같은 새 prefix 를 만들고 `SecurityConfig` 에 `.authenticated()` 추가하는 쪽이 안전
7. **Cookie `Secure=false` + `SameSite=Lax` 를 staging 에 잘못 적용** — `AuthCookieFactory.isLocalhost` 는 `localhost`/`127.0.0.1` 만 로컬 취급. staging host 는 자동으로 prod 옵션 (`Secure=true; SameSite=None; Domain=.compyafun.com`) 받음 → staging 도 HTTPS + compyafun 서브도메인이어야 쿠키 박힘
8. **`UserRole` 을 `int`/`String` 으로 비교** — controller / service 에서 enum 으로만 비교 (`user.getUserRole() == UserRole.ADMIN`). JWT 에는 `name()` 으로만 직렬화

---

## 12. cite

### 코드 (실 구현, 본 문서 사실 기준)

- `src/main/java/com/dawne/com2usbaseball/domain/oauth/controller/AuthController.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/controller/UserController.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/service/AuthServiceImpl.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/service/UserServiceImpl.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/service/support/NaverOAuthService.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/entity/UserEntity.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/enums/{UserRole,UserStatus,OAuthProvider,AuthMessages}.java`
- `src/main/java/com/dawne/com2usbaseball/domain/oauth/dto/response/UserMeResponse.java`
- `src/main/java/com/dawne/com2usbaseball/security/filter/JwtAuthFilter.java`
- `src/main/java/com/dawne/com2usbaseball/security/provider/JwtProvider.java`
- `src/main/java/com/dawne/com2usbaseball/security/provider/AuthRedirectProvider.java`
- `src/main/java/com/dawne/com2usbaseball/security/cookie/AuthCookieFactory.java`
- `src/main/java/com/dawne/com2usbaseball/config/SecurityConfig.java`
- `src/main/java/com/dawne/com2usbaseball/config/CorsConfig.java`
- `src/main/java/com/dawne/com2usbaseball/config/properties/{JwtProperties,NaverOauthProperties}.java`
- `src/main/java/com/dawne/com2usbaseball/domain/admin/controller/SwaggerController.java` (★ 안티패턴 #3)
- `src/main/resources/application{,-prod}.properties`

### 보강 문서

- 흐름·플래그 디테일: `docs/specs/be/auth-and-flags.md`
- 활성 endpoint 카탈로그: `docs/specs/be/endpoints.md`
- 보안 결함 (R3/R5/R6) 추적: `docs/prd/domains/authentication.md`
- FE 측 인증 사용법: `docs/develop/frontend-developer.md` § 9

# BE auth-and-flags

> 인증/인가/세션 정책. baseline = `config/SecurityConfig.java`, `security/`, `domain/oauth/`.

---

## 1. SecurityFilterChain (`config/SecurityConfig`)

```
csrf disable
cors  ← CorsConfig.corsConfigurationSource() (CredentialsTrue, Set-Cookie 노출)
session STATELESS

exceptionHandling
  authenticationEntryPoint → CustomAuthenticationEntryPoint   (401, code=AUTH_UNAUTHORIZED)
  accessDeniedHandler      → CustomAccessDeniedHandler         (403, code=AUTH_USER_BLOCKED)

authorizeHttpRequests
  /v3/api-docs/**, /swagger-ui/**, /swagger-ui.html, /docs/**, /swagger-custom.css → permitAll
  /api/admin/**                                                                     → hasRole("ADMIN")
  /api/**                                                                           → permitAll
  anyRequest                                                                        → denyAll

filter chain
  AccessLogFilter  (Order 1, addFilterBefore UsernamePasswordAuthenticationFilter)
  JwtAuthFilter    (addFilterAfter AccessLogFilter)

httpBasic / formLogin → disable
```

`@EnableWebSecurity @EnableMethodSecurity` 활성. `@PreAuthorize("hasRole('ADMIN')")` 메서드/클래스 가드 동작.

> denyAll fallback 으로 permitAll 매칭에서 빠진 경로는 무조건 403.

---

## 2. JwtAuthFilter (`security/filter/JwtAuthFilter`)

```
shouldNotFilter:
  /swagger-ui*, /v3/api-docs*, /api/auth/naver*, /api/auth/refresh, /api/auth/logout

resolveToken:
  ACCESS_TOKEN cookie 만 검사. (Authorization 헤더 차단 — 단일 채널 정책)

token 있을 때:
  jwtProvider.getUserId(token)        // sub claim → Long
  jwtProvider.getUserRole(token)      // role claim → String
  request.setAttribute("userId", userId)
  SecurityContext = UsernamePasswordAuthenticationToken(userId, null, ROLE_<role>)

토큰 invalid (expired / forged / parse 실패):
  SecurityContext clear
  HTTP 401 + {"success":false,"code":"AUTH_UNAUTHORIZED","data":null}
  filter chain 중단
```

핵심:
- 인증 채널 = HttpOnly cookie 단일. 헤더 fallback 없음.
- userId 는 `request.getAttribute("userId")` 로 컨트롤러에서 직접 꺼낸다 (`UserController.getMe` 참조).
- 토큰 검증 실패 응답 모양은 `GlobalExceptionHandler` 결과와 동일 (`success/code/data` 3 필드).

---

## 3. JwtProvider (`security/provider/JwtProvider`)

| 책임 | 메서드 | 비고 |
|---|---|---|
| Access JWT 생성 | `createAccessToken(userId, role)` | HS256, sub=userId, role claim, expire = now + `jwt.access-token-expire-minutes` |
| Access JWT 파싱 | `getUserId(token)`, `getUserRole(token)` | invalid 시 JwtException |
| Refresh token 생성 | `createRefreshToken()` | 48 byte SecureRandom → Base64URL no-pad (64 chars). **JWT 아님** |
| Refresh hash | `hashRefreshToken(raw)` | SHA-256 hex 64 자. DB 저장은 hash 만 |
| Refresh TTL | `getRefreshTokenTtl()` | `Duration.ofDays(jwt.refresh-token-expire-days)` |

`JwtProperties` 가 `@PostConstruct` 에서 보안 검증:
- `jwt.secret` 은 UTF-8 32 bytes 이상 (HS256 최소)
- access TTL > 0
- refresh TTL > 0

---

## 4. AuthCookieFactory (`security/cookie/AuthCookieFactory`)

| 쿠키 | path | maxAge | 비고 |
|---|---|---|---|
| `ACCESS_TOKEN` | `/` | TTL 미지정 (session 유지) | JWT |
| `REFRESH_TOKEN` | `/api/auth` | `JwtProvider.getRefreshTokenTtl()` (30 일 기본) | refresh / logout 만 노출 |

환경별 옵션 (`applyEnvOptions`):

```
host == localhost / 127.0.0.1
  → secure=false, sameSite=Lax, domain 미지정

else
  → secure=true, sameSite=None, domain=.compyafun.com
```

만료(`expireXxx`)는 maxAge=0 동일 옵션 + 동일 path 로 발급.

`AuthRedirectProvider` 도 동일 host 분기:
- localhost → `http://localhost:3000/auth/callback`
- else → `https://compyafun.com/auth/callback`

---

## 5. Refresh token DB rotation

`site_refresh_tokens` (sql/V3/site/CREATE_TABLE_REFRESH_TOKENS.sql):

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK → site_users.id | ON DELETE CASCADE |
| token_hash | CHAR(64) UNIQUE | SHA-256 hex of refresh token |
| expires_at | DATETIME | now + 30 일 |
| created_at | DATETIME DEFAULT NOW | |
| revoked_at | DATETIME NULL | NULL = 활성 |

흐름:

```
login (issueTokens):
  raw = JwtProvider.createRefreshToken()
  hash = JwtProvider.hashRefreshToken(raw)
  refreshTokenRepository.save({userId, hash, expiresAt})
  Set-Cookie REFRESH_TOKEN=raw

refresh:
  raw = readCookie REFRESH_TOKEN
  hash = jwtProvider.hashRefreshToken(raw)
  row = findActiveByHash(hash)        // 없으면 AUTH_REFRESH_TOKEN_EXPIRED 401
  deleteByHash(hash)                  // rotation: 즉시 무효
  user = userService.findActiveUserById(row.userId)
  validateUserStatus(user)
  issueTokens(user)                   // 새 raw + 새 row insert

logout:
  raw blank → no-op
  hash 계산 → deleteByHash(hash)
```

평문 토큰은 DB 에 저장하지 않음. 클라이언트의 cookie 평문을 hash 해서 DB 와 비교.

---

## 6. 권한 / 역할

`UserRole = { ADMIN, USER }` (DB enum 동기). JWT claim `role` 에 그대로 문자열.

`JwtAuthFilter` 가 `ROLE_ADMIN` / `ROLE_USER` 권한 부여 (`SimpleGrantedAuthority("ROLE_" + role)`).

가드 이중 구조:
1. **URL** — `SecurityConfig` `/api/admin/**` → `hasRole("ADMIN")`
2. **Method** — admin 컨트롤러 클래스 `@PreAuthorize("hasRole('ADMIN')")`

> 일부 admin 컨트롤러에 `@PreAuthorize` 누락 (community admin 다수, fun/playerCard, quiz, notice). URL 가드만 존재. **표준 위반** — 신규는 클래스 단위 명시 필수.

`UserStatus = { ACTIVE, BLOCKED, SUSPENDED, WITHDRAWN }` 검증은 service 단:
- `AuthServiceImpl.validateUserStatus`
- `UserServiceImpl.findActiveUserById`
- BLOCKED/SUSPENDED/WITHDRAWN → `AUTH_USER_BLOCKED` 403

---

## 7. CORS (`config/CorsConfig`)

```
allowedOrigins  = [http://localhost:3000, https://compyafun.com]
allowCredentials = true
allowedMethods  = [GET, POST, PUT, PATCH, DELETE, OPTIONS]
allowedHeaders  = ["*"]
exposedHeaders  = [Set-Cookie]
register        = "/**"
```

`SecurityConfig.cors(c -> c.configurationSource(corsConfigurationSource))` 가 이 Bean 사용.

---

## 8. 401 / 403 응답 표준 모양

| 케이스 | trigger | status | code |
|---|---|---|---|
| ACCESS_TOKEN 없음 + 인증 필요 endpoint | SecurityConfig denyAll | 403 | (Spring 기본) |
| ACCESS_TOKEN invalid | JwtAuthFilter 캐치 | 401 | `AUTH_UNAUTHORIZED` |
| 인증 필요한데 SecurityContext 비어 있고 컨트롤러가 직접 throw | `UserController.getMe` `BaseException` | 401 | `AUTH_UNAUTHORIZED` |
| EntryPoint (Spring Security 401) | `CustomAuthenticationEntryPoint` | 401 | `AUTH_UNAUTHORIZED` |
| AccessDenied (Spring Security 403) | `CustomAccessDeniedHandler` | 403 | `AUTH_USER_BLOCKED` |
| user 차단 status (service 검증) | `AuthServiceImpl` / `UserServiceImpl` | 403 | `AUTH_USER_BLOCKED` |
| refresh 누락 / hash mismatch | `AuthServiceImpl.refresh` | 401 | `AUTH_REFRESH_TOKEN_INVALID`, `AUTH_REFRESH_TOKEN_EXPIRED` |
| Naver OAuth 토큰 실패 | `NaverOAuthService.getAccessToken` | 502 | `AUTH_NAVER_TOKEN_FAILED` |

응답 모양은 모두 `{"success":false,"code":"...","data":null}` (Spring Security 핸들러도 동일).

---

## 9. Properties / 환경값

`application.properties` (placeholders, env 또는 `.env` 파일에서 주입):

```
jwt.secret=${JWT_SECRET}
jwt.access-token-expire-minutes=30
jwt.refresh-token-expire-days=30

naver.client-id=${NAVER_CLIENT_ID}
naver.client-secret=${NAVER_CLIENT_SECRET}
naver.redirect-uri=${NAVER_REDIRECT_URI}
```

⚠ `application-prod.properties` 는 현재 평문 secret 다수 (`jwt.secret=JHKIM...`, naver client-secret, AWS keys, DB pwd). ops 트랙에서 환경변수 또는 secret manager 로 분리 필요.

`@ConfigurationPropertiesScan` 또는 `@EnableConfigurationProperties` 로 properties bean 활성화 (각 properties 클래스가 `@ConfigurationProperties` 만 가지므로).

---

## 10. 신규 인증 endpoint 추가 체크리스트

- [ ] **shouldNotFilter** — JwtAuthFilter 우회 필요한 경로면 `JwtAuthFilter.shouldNotFilter` 에 추가
- [ ] **응답 모양** — Spring Security 핸들러 / 컨트롤러 throw 모두 `{success, code, data}` 동일
- [ ] **cookie 옵션** — `AuthCookieFactory.applyEnvOptions` 분기 따라가기 (host == localhost 여부)
- [ ] **path 분리** — refresh/logout 처럼 path 한정 cookie 가 필요하면 path 명시 (예: `/api/auth`)
- [ ] **rotation** — refresh 발급 시 기존 hash row DELETE 필수
- [ ] **status 검증** — login / refresh 양쪽에 `validateUserStatus` 호출
- [ ] **응답 code 추가** — `AuthMessages` 에 enum 추가 (도메인당 단일 enum)

---

## 11. 보안 갭 / 개선 권고 (현 baseline 기준)

| # | 갭 | 영향 | 권고 |
|---|---|---|---|
| 1 | `community` user controller 다수가 `userId` 를 body/query 로 받음 | 위변조 가능 (남의 좋아요/태그/댓글 조작) | `request.getAttribute("userId")` 또는 `Authentication` 주입 |
| 2 | `community` user controller — 작성자 검증 부재 (`updateComment`, `deleteComment`, `updatePost`) | 누구나 타인 글/댓글 수정·삭제 | service 단에 `authorId == authUserId` 또는 `role == ADMIN` 검증 추가 |
| 3 | `/api/upload/events` — 가드 없음 | 비인증 사용자 S3 업로드 가능 | `/api/admin/upload/...` 으로 이동 + ADMIN 가드 |
| 4 | community admin 컨트롤러 — `@PreAuthorize` 누락 | URL 가드만 (1 단계) | 모든 admin 컨트롤러 클래스에 `@PreAuthorize("hasRole('ADMIN')")` 통일 |
| 5 | `application-prod.properties` 평문 secret | secret leak 위험 | env / secret manager 로 분리 (ops 트랙) |
| 6 | `revoked_at` 컬럼 미사용 | 명시적 revocation 추적 불가 | 토큰 탈취 의심 시 row UPDATE revoked_at 패턴 도입 ❓ |
| 7 | RefreshToken `expires_at` 만료 row cleanup batch 없음 | 테이블 비대 | `RefreshTokenMapper.deleteExpired()` 정의됨 — 스케줄러 없음. 추가 필요 |
| 8 | `AccessLogFilter` 가 referer / page-url 등 다수 필드 추출 후 INFO 1줄 로그 | PII / 페이지 이동 추적 (개인정보) | 운영 PII 정책 확정 후 log redaction 정책 적용 ❓ |
| 9 | `AuthCookieFactory.ACCESS_TOKEN` 의 `maxAge` 미지정 (session cookie) | 브라우저 세션 종료 시 access 만료. refresh 가 항상 보완 | 의도된 정책으로 보임 — 명시 문서화 권장 |
| 10 | CORS `allowedOrigins` 에 `compyafun.com` 만, www 누락 | www subdomain 접근 불가 | 필요 시 추가 |

---

## 12. 흐름 다이어그램 (텍스트)

### 12.1 Naver login

```
FE
  │ /auth/naver/login → 네이버 동의 화면 → callback URL
  ▼
GET /api/auth/naver/callback?code=...&state=...
  │
  ▼
AuthController.naverCallback
  │ AuthService.loginWithNaver(code, state)
  │   └─ NaverOAuthService.findOrCreateUser(code, state)
  │       └─ getAccessToken (POST nid.naver.com/oauth2.0/token)
  │       └─ requestUserInfo (GET openapi.naver.com/v1/nid/me)
  │       └─ UserService.findOrCreateNaverUser(userInfo)
  │           └─ Optional.orElseGet → save
  │           └─ updateUserLastLogin(id)
  │   └─ validateUserStatus(user)
  │   └─ issueTokens(user)
  │       └─ JwtProvider.createAccessToken(id, role)
  │       └─ JwtProvider.createRefreshToken()
  │       └─ refreshTokenRepository.save(hash, expiresAt)
  │
  ▼
ResponseHeaders Set-Cookie ACCESS_TOKEN, REFRESH_TOKEN
  │
  ▼
302 Redirect → AuthRedirectProvider.setRedirectUrl(request)
              (= localhost:3000/auth/callback or compyafun.com/auth/callback)
```

### 12.2 Refresh

```
POST /api/auth/refresh   (REFRESH_TOKEN cookie)
  │ JwtAuthFilter.shouldNotFilter → skip
  ▼
AuthController.refresh
  │ AuthService.refresh(rawRefreshToken)
  │   raw blank → AUTH_REFRESH_TOKEN_INVALID 401
  │   hash → findActiveByHash → 없으면 AUTH_REFRESH_TOKEN_EXPIRED 401
  │   deleteByHash(hash)                       // rotation
  │   user = userService.findActiveUserById   // 차단 체크
  │   issueTokens(user)
  │
  ▼
Set-Cookie ACCESS_TOKEN, REFRESH_TOKEN (양쪽 갱신)
GlobalResponse.success(AUTH_SUCCESS, null)
```

### 12.3 Logout

```
POST /api/auth/logout    (REFRESH_TOKEN cookie)
  │ JwtAuthFilter.shouldNotFilter → skip
  ▼
AuthController.logout
  │ AuthService.logout(rawRefreshToken)
  │   raw blank → no-op
  │   hash → deleteByHash(hash)
  │
  ▼
Set-Cookie ACCESS_TOKEN (maxAge=0), REFRESH_TOKEN (maxAge=0)
GlobalResponse.success(AUTH_LOGOUT_SUCCESS, null)
```

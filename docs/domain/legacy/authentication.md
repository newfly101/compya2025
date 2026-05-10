# 도메인: authentication

> ★ **차단 위험 도메인** — shape 불일치 + useRole 오타 = Phase 0 차단 fix 대상.

## A.1 현재 상태

- **분류**: **live** (인프라성 도메인)
- **모바일 전환 진척도**: n/a (인프라성 — `callback/`, `hooks/`, `store/` 만 존재)
- 폴더 구조 (변종 — 표준과 다름):
  ```
  domains/authentication/
  ├── callback/AuthCallBack.jsx
  ├── hooks/useAuthentication.js
  └── store/    { api.js, endpoints.js, thunks.js, slices.js }
                   └── (admin/public 분리 없음 — flat)
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| AuthCallback | `/auth/callback` | `web/src/domains/authentication/callback/AuthCallBack.jsx` | UI 없음 | healthCheck dispatch 후 `redirectPath` 로 replace. `return null` |

> 참고: `web/src/global/layout/callBack/AuthCallBack.jsx` 는 라우트 주석 자리에서만 import — **dead 중복** (`fe/dead-suspects.md A`)

## A.3 API 엔드포인트

### BE 노출

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/auth/naver/callback` | `AuthController#naverCallback` (`oauth/controller/AuthController.java:28`) | permitAll (JwtAuthFilter `shouldNotFilter` 로 우회) | NaverOAuth → JWT 발급 → 302 Redirect (Set-Cookie ACCESS_TOKEN) |
| POST | `/api/auth/logout` | `AuthController#logout` (line 48) | permitAll | stateless 쿠키 만료 |
| GET | `/api/users/me` | `UserController#getMe` (`oauth/controller/UserController.java:23`) | JWT 필요 | userStatus BLOCKED/SUSPENDED/WITHDRAWN 시 403 |

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 |
|---|---|---|---|---|
| `domains/authentication/store/api.js:8` | GET | `/users/me` | `requestUserHealthCheck` | `AuthProvider` 직접 dispatch (모든 라우트 부팅), `AuthCallback` |
| `domains/authentication/store/api.js:13` | POST | `/auth/logout` | `requestUserLogout` | TopBar 로그아웃 (`useHeaderAuth.logout`, `useAuthentication.logout`) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #1-3)

- **매칭됨**: 3건 (정상)
- 1건은 브라우저 redirect 경로 (`/api/auth/naver/callback`) — FE axios 미경유

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `users` | V1 | ⚪ legacy(이전완료) | — | site_users 로 이전 |
| `user_roles` | V1 | ⚪ legacy(이전완료) | — | site_users 흡수 (`user_role`, `user_status` 컬럼) |
| `site_users` | V2 | 🔵 active | `mapper/UserMapper.xml:25,33,62,85` | 4 stmt |

⚠ V2 가 V1 의 `ban_reason` 컬럼을 흡수 안 함 → 마이그 시 데이터 손실 가능 (`dual-management.md §15`).

**dual pair**: `users (+ user_roles) ↔ site_users` — V2 단방향 (이전 완료, V1 mapper 0건).

## A.5 권한 / 가드

- 인증 진입 (Naver OAuth) → `JwtProvider#createAccessToken(userId, role)` → `Set-Cookie ACCESS_TOKEN` (60min)
- JwtAuthFilter 가 토큰 파싱 후 `request.setAttribute("userId", userId)` + `SecurityContextHolder` 에 `ROLE_{role}` 설정
- `UserController#getMe` 만 JWT 강제 (없으면 401 throw)
- 다른 endpoint 는 SecurityConfig URL 매칭 (`/api/admin/**` ADMIN, 그 외 permitAll) 만

### 알려진 누락 / 위험

- ★ R3: `state.auth.authority` shape 불일치 + setter `useRole` 오타

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🔥 **R3 (Phase 0 차단)**: `state.auth` shape 불일치 | `fe/state-and-data.md:30,126`, `slices.js:14-17`, `risk-and-priority.md #3` | ★ 모든 인증 분기 (UserProfile, TopBar, AuthGuard, admin 라우트) 영향 |
| - slice initialState: `{ user, userRole, initialized }` | `web/src/domains/authentication/store/slices.js:4-8` | |
| - slice setter `setUser` 의 payload 키가 `useRole` (오타) | `slices.js:15-17` | |
| - 소비처 (`UserProfile.jsx:7`, `useAuthentication.js:14`, `useHeaderAuth.js:7`) 가 `state.auth.authority` 참조 — slice 에 정의 안 됨 | — | |
| 🚨 R5: `GET /api/dev/test-token` 누구나 ADMIN JWT 발급 가능 | `auth-and-flags.md:62` | ◐ 보안 별개 fix |
| ⚠ 운영 시크릿 평문 노출 (`naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*`) | `auth-and-flags.md:107` | ⚠ 보안 별도 작업 |
| ⚠ V2 site_users 가 V1 `ban_reason` 컬럼 손실 | `dual-management.md §15` | 마이그 운영 데이터 보존 시 별도 검증 필요 |

### R3 권장 fix

1. spot-check 추가: 실제 setter payload 가 어디서 dispatch 되는지 (`requestUserHealthCheck` thunk 응답 → setUser 액션 호출 경로)
2. slice setter 수정: `useRole` → `userRole`, `userDetail` → `user` 매핑 명확화
3. 소비처 `state.auth.authority` 참조를 `state.auth.userRole` 로 일괄 교체 (또는 slice 에 `authority` 별칭 추가 backwards-compat)
4. AuthGuard / 어드민 라우트 진입 동작 회귀 테스트

## A.7 dead 항목 (이 도메인 안)

- `web/src/global/layout/callBack/AuthCallBack.jsx` — 라우트 주석 자리 import 만 (활성 path 는 `domains/authentication/callback/AuthCallBack.jsx`). 중복 — `dead-confirmed.md` 즉시 정리 가능

## A.8 ★ Owner 결정 필요 (도메인 한정)

- R3 fix 방향 결정: (a) 소비처 일괄 `state.auth.userRole` 로 변경 / (b) slice 에 `authority` 별칭 추가 backwards-compat
- 운영 시크릿 평문 노출 → 별도 보안 작업 라운드 일정

---

## B.1 도메인 정의

- **분류**: 횡단 인프라성 도메인. 사용자 노출 화면 0건 (`AuthCallback` 만 존재 — UI 없는 redirect 처리)
- **구성요소**:
  - **FE**: `domains/authentication/{callback, hooks, store}/**` + 라우터 가드 `app/router/guards/AuthGuard.jsx` + 부팅 health check `app/provider/AuthProvider.jsx`
  - **BE**: `domain/oauth/{AuthController, UserController}` (Naver OAuth callback / logout / `/users/me`) + `config/SecurityConfig.java` (URL 가드) + `security/{filter/JwtAuthFilter, provider/JwtProvider}`
  - **DB**: `site_users` (V2 active, 4 stmt — `mapper/UserMapper.xml`)
- **권한 등급** (`_overview.md § 2.1`): guest / user / admin (`role=ADMIN` JWT)
- **본 라운드 scope**: `_overview.md § 7 Phase 0` 차단 fix 1건 (R3) + `Phase 1` 보안 별개 fix 2건 (R5, R6). R4 는 events 도메인 흡수 (events Part B v1 T3) — 본 도메인 제외

## B.2 기능 / 작업 항목

> Part A.6 위험 R3/R5/R6 기반 task. R4 (POST /api/upload/events permitAll) 는 events 도메인 흡수로 본 도메인 제외.

- [ ] **T1**: R3 — FE `state.auth` shape 정합 fix (Phase 0 차단 해소)
  - 사용자 시나리오: 모든 라우트 부팅 시 `AuthProvider` 가 `requestUserHealthCheck` dispatch → BE `GET /api/users/me` 응답 → slice 의 `userRole` 정상 세팅 → `AuthGuard` 가 `userRole` 기반으로 admin/user 분기 정상 동작
  - acceptance criteria:
    - **bug 1 (slice setter 오타)**: `web/src/domains/authentication/store/slices.js:15` 의 destructure `const { userDetail, useRole } = action.payload` 를 `const { userDetail, userRole } = action.payload` 로 정정 (`useRole` → `userRole`). thunks.js:13 은 이미 `userRole` 키로 dispatch 하므로 destructure 만 정정하면 정합
    - **bug 2 (소비처 `authority` 참조)**: slice 에 `authority` 필드 없음. 소비처 3곳 (`UserProfile.jsx:7,24-65` / `useAuthentication.js:14,35` / `useHeaderAuth.js:7,34`) 가 참조 중. fix 방향:
      - live 소비처 (`UserProfile.jsx`): `state.auth.user` (BE `/users/me` 응답 그대로 — `userStatus`, `banReason` 등 포함) 로 교체 + `state.auth.userRole` 직접 참조
      - dead 소비처 (`useHeaderAuth.js` + `app/wrapper/parts/Header.jsx`): `_overview.md § 6.1` dead 정리 대상 — 본 task 와 별도. 본 task 는 손대지 않음 (touch 시 dead 코드 살리는 부작용)
      - `useAuthentication.js`: `authority` 반환을 제거 또는 `userRole` 로 교체. 현재 라이브 소비처 (`TopBar.jsx`, `Drawer.jsx`) 는 `authority` destructure 안 함 → 영향 없음
    - 회귀 테스트: 모든 라우트 부팅 → `userRole` 정상 세팅 / `/admin` 라우트 진입 시 ADMIN JWT 보유자만 통과 / `/mypage` 진입 시 USER+ 통과 / guest 는 `/` 로 redirect
  - 의존 API/테이블: `GET /api/users/me` (`A.3`) — 응답 shape 변경 없음
  - 우선순위: **P0 (Phase 0 차단 해소 — `_overview.md § 7 Phase 0`)**
  - figma node: n/a (UI 없음)

- [ ] **T2**: R5 — `GET /api/dev/test-token` 보안 가드 (Phase 1 별개 보안 fix)
  - 사용자 시나리오: 누구나 `GET /api/dev/test-token` 호출 시 `userId=1, role=ADMIN` 하드코딩 JWT 발급 → 임의 사용자가 ADMIN 권한 탈취 가능 (`SwaggerController.java:18-22`). 이 endpoint 는 Swagger 인증 fixture 용도지만 운영 환경에 노출 중
  - acceptance criteria:
    - 옵션 (a): endpoint 경로를 `/api/admin/dev/test-token` 로 이동 → SecurityConfig URL 가드 (`hasRole("ADMIN")`) 자연 적용 → 단 ADMIN 토큰 없으면 발급 자체 불가능 (chicken-and-egg). dev fixture 로는 부적합
    - 옵션 (b): `application-prod.properties` 의 profile 분기로 prod 빌드에서 컨트롤러 자체 비활성화 (`@Profile("!prod")`) — dev 환경에서만 발급
    - 옵션 (c): endpoint 자체 제거 → Swagger 운영 토큰은 다른 경로 (실제 OAuth) 로 획득
    - **default 채택**: **(b) profile 분기** — dev/staging 편의 유지 + prod 노출 차단 (가장 risk 낮음)
    - 회귀 테스트: dev profile 빌드에서 토큰 발급 정상 / prod profile 빌드에서 404 또는 컴포넌트 미로드
  - 의존 API/테이블: `GET /api/dev/test-token` (`SwaggerController.java:14-23`)
  - 우선순위: **P0 (보안 차단성 — 누구나 ADMIN JWT 발급 가능)**
  - figma node: n/a

- [ ] **T3**: R6 — `@PreAuthorize` 활성화 (Phase 1 정리 라운드)
  - 사용자 시나리오: 3개 컨트롤러 (`AdminCouponController:18`, `AdminEventController:19`, `AdminPlayerCardController:15`) 가 `@PreAuthorize("hasRole('ADMIN')")` 부착했지만 `@EnableMethodSecurity` 미선언 → 어노테이션 무시 (decorative). 현재는 `/api/admin/**` URL 가드로 자연 보호되지만 향후 `/api/admin/**` 외 경로에 `@PreAuthorize` 사용 시 가드 부재
  - acceptance criteria:
    - `SecurityConfig.java` 에 `@EnableMethodSecurity` 어노테이션 추가 → 3개 컨트롤러의 `@PreAuthorize` 활성화
    - URL 가드 (`/api/admin/**` hasRole("ADMIN")) + method 가드 이중 방어. 정책 명확화 — 신규 admin 컨트롤러도 prefix 와 무관하게 `@PreAuthorize` 부착하면 자연 보호
    - 회귀 테스트: 3개 admin 컨트롤러 (`coupons`, `events`, `playerCard`) ADMIN 토큰 보유자 통과 / USER 토큰 403 / guest 401
  - 의존 API/테이블: `SecurityConfig.java`, 3개 admin 컨트롤러 endpoint (변경 없음 — 어노테이션 활성화만)
  - 우선순위: **P1 (정리 라운드 — 차단성 X. URL 가드로 자연 보호 중)**
  - figma node: n/a

## B.3 데이터 모델 (변경 없음)

- **active**: `site_users` (V2, 4 stmt — `mapper/UserMapper.xml:25,33,62,85`)
- **legacy (이전완료)**: `users`, `user_roles` (V1, mapper 0건)
- 본 라운드 schema 변경 없음. T1/T2/T3 은 코드 fix 만

## B.4 KPI / 성공지표

- 측정 안 함 (인프라성 — 가드 통과율 / 토큰 발급률 등은 별도 보안 모니터링 이슈)

## B.5 디자인 / Figma 참조

- **n/a (인프라성)**. 사용자 노출 화면 0건. wireframe-generator / design-sync 모두 호출 안 함

## B.6 Cross-domain 영향

- **T1 (R3 fix)**:
  - `AuthGuard` 의존 라우트 전체 영향: `/admin/**` (admin 도메인) + `/mypage` (profile 도메인) — fix 후 정상 동작 회귀 검증 필요
  - `AuthProvider` 부팅 health check → 모든 라우트가 영향. 현재도 `requestUserHealthCheck` 자체는 동작 (slice setter 만 break) — fix 후 `userRole` 정상 세팅
  - `UserProfile.jsx` (profile 도메인) 의 `authority.*` 참조 일괄 교체 필요 — profile 도메인 IA 단계에서 흡수 또는 본 task 에서 동시 수정
- **T2 (R5 fix)**: 영향 없음 (dev fixture endpoint 한정)
- **T3 (R6 fix)**: admin 도메인 (coupons / events / playerCard) endpoint 가드 강화 — 현재 동작 유지

## B.7 후속 작업

- T1 fix 후 회귀 테스트: 모든 도메인 라우트 부팅 → AuthGuard 통과 시나리오 검증 (guest / user / admin 3 케이스)
- T2 fix 시 `application-prod.properties` 평문 노출 시크릿 (Part A.6 별도 위험 — `naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*`) 정리도 같이 검토 권장
- T3 fix 후 신규 admin 컨트롤러 추가 시 `@PreAuthorize` 부착 정책 README 명문화 (도메인 README 또는 BE 코드 컨벤션)

## B.8 Owner 결정 해소 기록

- **도메인 한정 결정** (Part A.8):
  - R3 fix 방향 — ✅ T1 acceptance 에서 결정: live 소비처는 `state.auth.user` + `state.auth.userRole` 직접 참조로 일괄 교체 (slice 에 `authority` 별칭 추가하지 않음 — slice 가 SoT, 소비처가 적응)
  - R6 옵션 — ✅ T3 acceptance 에서 결정: `@EnableMethodSecurity` 활성화 채택 (URL 가드 + method 가드 이중 방어)
- **글로벌 ★ Owner 결정 5건** (`_overview.md § 8`): authentication 도메인 무관 (#1 coupon / #2 contact / #3 mobile DEPRECATE / #4 legacy PC / #5 V2 통폐합) — 갱신 X
- **events 도메인 흡수**: R4 (`POST /api/upload/events` permitAll) 는 events Part B v1 T3 으로 흡수됨 — 본 도메인 task 에서 제외

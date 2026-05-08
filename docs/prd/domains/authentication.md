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

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역

# 도메인: admin

> 횡단 도메인 (PC 어드민). BE 측 `domain/admin/*` 는 사실상 인프라성/공용 도구 모음 (UploadController, SwaggerController). 도메인별 admin endpoint 는 각 도메인 폴더 내 `Admin*Controller` 형태로 흩어짐.

## A.1 현재 상태

- **분류**: **PC 어드민 (모바일 전환 대상 아님)**. Owner 정책 (`fe-map.md` 행 51, `routes-and-screens.md:44`)
- **모바일 전환 진척도**: 모바일 미진행 (PC 전용)

## A.2 화면 목록

```
/admin (AdminPageLayout)                                          # web/src/global/layout/adminPageLayout/AdminPageLayout.jsx
├─ index             AdminDashBoardPage                           # web/src/domains/admin/pages/dashboard/AdminDashBoardPage.jsx
├─ users             AdminUserManagePage                          # web/src/domains/admin/pages/user/AdminUserManagePage.jsx
├─ users/:userId     AdminUserDetailPage                          # web/src/domains/admin/pages/user/AdminUserDetailPage.jsx
├─ content           AdminContentPage (Outlet)                    # web/src/global/layout/adminPageLayout/content/AdminContentPage.jsx
│   ├─ notice        AdminNoticeManagePage                        # → notices 도메인
│   ├─ player        AdminPlayerPage                              # → playerCard 도메인
│   └─ quiz          AdminQuizPage                                # → quiz 도메인
└─ community         AdminCommunityPage                           # → community 도메인
                       └── CommunityManagePage
```

| 화면명 | 라우트 | 진입 컴포넌트 | 비고 |
|---|---|---|---|
| AdminDashBoardPage | `/admin` | `web/src/domains/admin/pages/dashboard/AdminDashBoardPage.jsx` | live |
| AdminUserManagePage | `/admin/users` | `web/src/domains/admin/pages/user/AdminUserManagePage.jsx` | live |
| AdminUserDetailPage | `/admin/users/:userId` | `web/src/domains/admin/pages/user/AdminUserDetailPage.jsx` | live |
| (참고) admin/content/event | (라우트 주석) | (lazy import 자체가 주석, 파일 미존재) | Owner 확정: 디자인 미진행, 일부 페이지 삭제 |
| (참고) admin/content/coupon | (라우트 주석) | (lazy import 자체가 주석, 파일 미존재) | 동상 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/admin/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| POST | `/api/upload/events` | `UploadController#uploadImage` (`admin/controller/UploadController.java:18`) | ★ permitAll (admin 가드 부재) | S3 PUT, key=uploads/images/{uuid}.{ext} |
| GET | `/api/dev/test-token` | `SwaggerController#getTestToken` (`admin/controller/SwaggerController.java:18`) | ★ permitAll (누구나 ADMIN JWT 발급) | userId=1, role=ADMIN 하드코딩 |

### 도메인별 Admin endpoint (다른 도메인 PRD 참조)

- `/api/admin/boards`, `/api/admin/posts`, `/api/admin/comments`, `/api/admin/tags`, `/api/admin/reports` → **community.md**
- `/api/admin/coupons*` → **coupons.md**
- `/api/admin/events*` → **events.md**
- `/api/admin/notices*` → **notices.md**
- `/api/admin/quiz*` → **quiz.md**
- `/api/admin/player*`, `/api/admin/player-cards*` → **playerCard.md**

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `infra/uploads/store/api.js:3` | POST | `/upload/{directory}` | `requestUploadImage` | admin quiz/event form 이미지 업로드 |
| `domains/events/store/admin/api.js:26` | POST | `/upload/events` | `fetchUploadEventImageFile` | admin event |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #29-30, #59)

- **매칭됨**: `POST /api/upload/events` ★ admin 가드 부재 (R4)
- **🟡 MATCH (admin 라우트 주석)**: 도메인별 admin endpoint (coupons/events) — 코드 살아있고 라우트만 주석
- **🔴 BE_ONLY (위험)**: `GET /api/dev/test-token` (R5) — FE 호출 0건, 운영 노출 위험

## A.4 DB 테이블 + Mapper

도메인 자체 테이블 없음 (인프라성). UploadController 는 S3 사용, SwaggerController 는 DB 미사용.

도메인별 admin endpoint 는 각 도메인의 V2 site_*/fun_* 테이블 사용.

## A.5 권한 / 가드

- 라우트: AuthGuard ADMIN (`AdminRoutes.jsx`)
- BE: SecurityConfig `/api/admin/**` hasRole(ADMIN)
- ★ 가드 부재 — `POST /api/upload/events` (path 가 `/api/upload/...` 라 매칭 밖), `GET /api/dev/test-token` (permitAll)
- ★ `@PreAuthorize` decorative (R6) — AdminCoupon, AdminEvent, AdminPlayerCard 컨트롤러

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🚨 **R4**: `POST /api/upload/events` permitAll → S3 무차별 PUT | `auth-and-flags.md:64`, `risk-and-priority.md #4` | ◐ 보안 별개 fix |
| 🚨 **R5**: `GET /api/dev/test-token` permitAll → 누구나 ADMIN JWT 발급 | `auth-and-flags.md:62`, `be/dead-suspects.md:55`, `risk-and-priority.md #5` | ◐ 보안 별개 fix |
| ⚠ **R6**: `@PreAuthorize` 3개 컨트롤러 부착, `@EnableMethodSecurity` 미선언 → decorative | `auth-and-flags.md:43`, `risk-and-priority.md #6` | ◐ 정리 라운드 |
| Owner 확정: admin 라우트 (event, coupon) 주석 처리 = 디자인 미진행 + 일부 페이지 삭제 | `fe-map.md ★ Owner 확정 #1` | admin 영역 추가 필요 |

### R4 권장 fix

- SecurityConfig 에 `/api/upload/**` `hasRole("ADMIN")` 추가, 또는
- 컨트롤러 path 를 `/api/admin/upload/...` 로 이동

### R5 권장 fix

- SecurityConfig 에 `/api/dev/**` denyAll 추가, 또는
- prod profile 에서 컨트롤러 비활성화 (`@Profile("!prod")`)

### R6 권장 fix

- `@EnableMethodSecurity` 추가하여 `@PreAuthorize` 활성화, 또는
- 어노테이션 제거 (URL 가드만으로 통일)

## A.7 dead 항목 (이 도메인 안)

- 옛 `.http` 파일 stale path (`getEventList.http`) — `be/dead-suspects.md F`
- `web/src/domains/admin/store/{api,endpoints,thunks}.js` 전체 주석 — events admin 의 구버전, 즉시 삭제 가능 (`dead-confirmed.md 1-C`)
- AdminPlayerCardController 주석 핸들러 6개 — playerCard 도메인 PRD 참조

## A.8 ★ Owner 결정 필요 (도메인 한정)

- R4, R5, R6 fix 시점 (보안 라운드)
- admin event/coupon 라우트 디자인 도착 시 활성화 — 별도 admin 라운드

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

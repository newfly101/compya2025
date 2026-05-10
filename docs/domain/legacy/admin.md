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

## B.1 도메인 정의 + 라운드 scope

- **도메인 본질**: **횡단 PC 어드민**. 도메인별 admin 화면 / 4-capability QA / 보안 fix 는 각 도메인 PRD 가 각자 흡수. 본 도메인은 **횡단 인프라 task 만** 담당
- **도메인별 admin 흡수 매핑** (중복 task 화 금지):
  - **coupons**: admin 라우트 활성화 + `AdminCouponListPage` 신규 + 4-capability QA → coupons.md Part B T2 (커밋 05723ae)
  - **events**: admin 라우트 활성화 + `AdminEventListPage` 신규 + 4-capability QA + **R4** (`POST /api/upload/events` 가드) → events.md Part B T1/T2/T3
  - **notices**: admin 폴더 표준화 + admin update method/path fix (PUT `{id}`) + visible path fix (`{id}/visible`) + 4-capability QA → notices.md Part B T1/T2/T3/T6
  - **quiz**: admin path 정렬 + visible 컬럼/UI 제거 + admin form title input 제거 → quiz.md Part B T2 (커밋 6519288)
  - **authentication**: **R5** (`GET /api/dev/test-token` `@Profile("!prod")` 채택) → authentication.md Part B T2 / **R6** (`@EnableMethodSecurity` 활성화 채택) → authentication.md Part B T3
  - **playerCard**: 모바일 figma 도착 후 별도 라운드 — admin 화면 자체는 PC 운영 중
  - **community**: 별도 라운드 — admin live (`AdminCommunityPage`) 정상 동작 중
- **이번 라운드 scope**: 본 도메인 직접 소유 BE 인프라 중 **다른 도메인이 흡수하지 못한 잔여 횡단** (AdminRoutes.jsx 통합 검증 / Swagger UI 운영 노출 정책) 와 **A.7 dead 정리 + 폴더 폐기 계획**
- **가드레일**:
  - **R4** (`/api/upload/events` 가드) 는 events.md T3 가 흡수 — 본 라운드 중복 task 화 금지
  - **R5** (`/api/dev/test-token` 가드) 는 authentication.md T2 가 흡수 — 본 라운드 중복 task 화 금지
  - **R6** (`@PreAuthorize` 정리) 는 authentication.md T3 가 흡수 — 본 라운드 중복 task 화 금지
  - admin 도메인 자체에 화면이 없으므로 wireframe / design-sync 모두 **n/a (PC 어드민)**
  - `AdminPageLayout` 글로벌 레이아웃은 본 라운드 변경 없음

## B.2 기능 요구사항 (task 단위)

- [ ] **T1: AdminRoutes.jsx 통합 가드 검증** — P0
  - 사용자 시나리오: admin 이 `/admin/**` 진입 시 5 활성 라우트 (notice / coupon / player / quiz / community) 모두 AuthGuard ADMIN 통과 + 비-ADMIN 진입 시 401/403 반환. event 라우트는 events.md T1 활성화 후 본 통합 검증에 합류
  - acceptance criteria:
    - `web/src/app/router/routes/AdminRoutes.jsx` 5 활성 라우트 lazy import 정상 (현재 `event` 만 주석 — events T1 의존)
    - 비-ADMIN 토큰 / 무토큰 진입 시 `AuthGuard allow="ADMIN"` 동작 (BE 응답 401/403 + FE redirect)
    - BE 측 `SecurityConfig` `/api/admin/**` `hasRole("ADMIN")` 매칭 정상 (`SecurityConfig.java:52`)
  - 의존: AdminRoutes.jsx (5 활성 + 1 주석=event), SecurityConfig.java:52, A.5 가드 표
  - figma node: n/a (PC 어드민)

- [ ] **T2: Swagger UI / `/v3/api-docs/**` 운영 노출 정책** — P1
  - 사용자 시나리오: 현 SecurityConfig (line 45-51) 가 `/swagger-ui/**`, `/v3/api-docs/**`, `/swagger-ui.html`, `/docs/**`, `/swagger-custom.css` 를 permitAll. prod 운영 시 노출 정책 결정 필요. authentication.md T2 의 `@Profile("!prod")` 패턴 (`SwaggerController` 비활성화) 과 정합성 있는 결정 필요
  - acceptance criteria:
    - **옵션 (a)** prod profile 에서 swagger 경로 차단 (`@Profile("!prod")` SpringDoc bean 또는 SecurityConfig 분기), **또는**
    - **옵션 (b)** 현재 정책 유지 (운영 진단용 의도적 노출) → 본 task close
    - 결정 완료 시 본 task close. **본 라운드 fix 는 옵션 결정 후 후속 라운드** (BE 환경 분기 작업 별건)
  - 의존: SecurityConfig.java:45-51
  - figma node: n/a

- [ ] **T3: `web/src/domains/admin/` 폴더 통째 폐기 (단계 분리)** — P0 (Step 3a) / P1 (Step 3b)
  - **Owner 진술 (2026-05-09)**: "해당 부분은 현재 삭제하고 만들게 된다면 각 도메인에서 새로 만들어야 하는 영역. 거의 layout 에 가깝거나 sample 로 만들어둔 페이지에 가까움. 그래서 해당 폴더 삭제 후 추후에 각 domain 에서 admin page 를 만드는 것으로 대체"
  - 사용자 시나리오: 현 `domains/admin/` 은 도메인이 아닌 "layout-like / sample" 자투리. 각 도메인이 자기 admin 화면을 자체 흡수하면 본 폴더는 deprecate 가능
  - **현재 활성 consumer 식별** (deprecate 전 흡수 대상):
    | 파일 | consumer | 흡수 방향 |
    |---|---|---|
    | `pages/dashboard/AdminDashBoardPage.jsx` + `.module.scss` | `AdminRoutes.jsx:5` (`/admin` index) | 신규 admin home 화면 — 별도 라운드에 신규 정의 (sample 폐기) |
    | `pages/user/AdminUserManagePage.jsx` + hooks/scss 5 파일 | `AdminRoutes.jsx:6` (`/admin/users`) | 신규 `domains/profile/admin/**` 또는 `domains/user/admin/**` 로 이동 — 별도 라운드 |
    | `pages/user/AdminUserDetailPage.jsx` + scss | `AdminRoutes.jsx:7` (`/admin/users/:userId`) | 동상 — profile/user 도메인 admin 흡수 |
    | `config/AdminNavigation.js` | `AdminPageLayout.jsx:4` | 글로벌 layout config 로 이동 (`global/layout/adminPageLayout/config/AdminNavigation.js`) |
    | `feature/components/toggle/VisibleToggle.jsx` + scss | `coupons/feature/admin/components/table/CouponTableBody.jsx:3` | 글로벌 공용 컴포넌트 (`global/components/toggle/VisibleToggle.jsx`) 또는 각 도메인 admin 자체 흡수 |
    | `store/{api,endpoints,thunks,index,slices,dto}.js` 6 파일 | grep 0 (전체 주석, events 구버전) | **즉시 삭제 가능** — interim cleanup |
  - acceptance criteria (단계 분리):
    - **Step 3a (P0, 즉시 가능)**: `store/**` 6 파일 즉시 삭제 — import 0건 (commented out only). interim cleanup
    - **Step 3b (P1, 후속 라운드)**: `pages/` + `config/` + `feature/` 흡수 라운드. 각 도메인 / 글로벌 config 로 이동 후 폴더 통째 제거. 본 라운드 task 화 안 함 (cross-domain commit 필요)
  - 의존:
    - Step 3a: `web/src/domains/admin/store/**` 6 파일 (`A.7` cite, `dead-confirmed.md 1-C`)
    - Step 3b: `pages/dashboard/**` (1+1), `pages/user/**` (5), `config/AdminNavigation.js`, `feature/components/toggle/VisibleToggle.jsx` (+scss), 그리고 4 consumer 파일 (AdminRoutes / AdminPageLayout / CouponTableBody)
  - figma node: n/a
  - cite: A.7, `dead-confirmed.md 1-C`, Owner 진술 (2026-05-09)

## B.3 신규 기능

- 신규 화면: 0건 (admin 도메인 자체 화면 없음 — 도메인별 admin 화면은 각자 PRD)
- 신규 API: 0건 (T2 는 정책 결정만)
- 신규 테이블: 0건 (도메인 자체 schema 없음)
- **결론**: 횡단 인프라 task 2건 (T1 통합 검증 / T2 Swagger 정책) + 폴더 폐기 단계 분리 (T3 Step 3a/3b). schema / 컴포넌트 추가 없음

## B.4 우선순위

| Task | 우선순위 | Phase | 비고 |
|---|---|---|---|
| T1 AdminRoutes 통합 가드 검증 | **P0** | 모바일 리뉴얼 admin | 각 도메인 admin 흡수 후 통합 검증 필수. event 라우트 활성화는 events.md T1 의존 |
| T2 Swagger 운영 노출 정책 | **P1** | 정리 라운드 | 결정 후 후속 라운드. authentication.md T2 의 `@Profile("!prod")` 패턴과 정합 |
| T3 Step 3a `store/` 6 파일 삭제 | **P0** | ✅ 완료 (2026-05-09 commit 79c8127) | A.7, dead-confirmed 1-C — interim cleanup |
| T3 Step 3b `domains/admin/` 통째 폐기 | **P0** | ✅ 완료 (2026-05-09) | 사용자 정책 즉시 처리. 4 consumer 흡수 (AdminRoutes 주석 / AdminNavigation inline / VisibleToggle 글로벌 / coupons import 갱신) |

## B.5 KPI / 성공지표

- 미정 (admin 도메인 KPI 측정 안 함 — 횡단 인프라 성격)

## B.6 디자인 / Figma 참조

- **n/a (PC 어드민)** — 도메인 자체 모바일 화면 없음. wireframe-generator / design-sync 단계 모두 진행 안 함
- 도메인별 admin 화면 figma 는 각 도메인 PRD 참조 (현재 모든 admin 화면 figma 미진행 = 텍스트 wireframe 수준)

## B.7 Cross-domain 영향

| 영향 도메인 | 본 라운드 task 와의 관계 |
|---|---|
| **events** | events.md T1 (admin 라우트 활성화) 완료 시 본 도메인 T1 통합 검증 범위에 합류 (event 6번째 활성 라우트). R4 / R6 영향은 events / authentication 직접 흡수 |
| **coupons** | coupons.md T2 (admin 활성화) 가 T1 검증 대상에 포함. R6 `@PreAuthorize` 활성화는 `AdminCouponController` 영향 (authentication.md T3 흡수) |
| **playerCard** | R6 `@PreAuthorize` 활성화는 `AdminPlayerCardController` 영향 (authentication.md T3 흡수). 화면 자체는 별도 라운드 |
| **notices, quiz, community** | T1 통합 검증 범위 |
| **authentication** | R3 (state.auth shape) / R5 (test-token 가드) / R6 (`@EnableMethodSecurity` 활성화) 모두 authentication.md T1/T2/T3 흡수 — 본 라운드 무관 |
| **profile (또는 신규 user 도메인)** | T3 Step 3b 흡수 대상 — `AdminUserManagePage` / `AdminUserDetailPage` + hooks 가 profile/user 도메인 admin 으로 이동 |

### legacy `web/src/admin/` 폐기 (2026-05-09)

- 과거 legacy PC 버전 admin 도메인 샘플 폴더 (`web/src/admin/**`) 통째 폐기 완료
- 본 폴더는 `web/src/domains/admin/` (별도 폴더, T3 Step 3a/3b 대상) 와 혼동 금지 — 본 항목은 `web/src/` 직접 하위의 legacy 샘플 영역
- 사전 검증 (2026-05-09): 작업 시작 시점에 폴더 자체가 부재 + 외부 import 0건 (`@/admin`, `src/admin`, `../admin`, `../../admin` 모두 grep 매치 0). 따라서 추가 삭제 / 주석 처리 대상 없음 (이미 부재 상태)
- 추후 복원 가능성 보존 차원에서 PRD 문서로만 기록 (코드 변경 0건)

### Frontend admin 구현 정책 (2026-05-09 사용자 정책)

- 각 도메인 하위에서 구현: `src/domains/{domain}/feature/admin/...`
- 이미 적용 도메인: **coupons** (`web/src/domains/coupons/feature/admin/`)
- 별도 admin 폴더 (`web/src/admin/` 또는 `web/src/domains/admin/`) 존재하지 않음 — 2026-05-09 폐기 완료
- `web/src/domains/admin/` 통째 폐기 결과 (T3 Step 3a + 3b 모두 완료, 2026-05-09):
  - Step 3a: `store/**` 6 파일 (commit 79c8127)
  - Step 3b: `pages/**` (8) + `config/**` (1) + `feature/**` (2) = 11 파일 + 4 consumer 흡수 (본 라운드 commit)
  - 글로벌 공용 신규: `web/src/global/ui/visibleToggle/**` (VisibleToggle 이전)

## B.8 후속 작업 (본 라운드 외)

- ~~**T3 Step 3b — `domains/admin/` 통째 폐기 라운드**~~ → ✅ 완료 (2026-05-09, commit 본 라운드). 4 consumer 흡수 결과:
  - `AdminDashBoardPage` → AdminRoutes index 라우트 주석 + 페이지 파일 삭제. 신규 admin home 은 별도 기획 라운드
  - `AdminUserManagePage` / `AdminUserDetailPage` + hooks → 라우트 주석 + 파일 삭제. 신규 user 관리는 추후 `profile` 또는 `user` 도메인 admin 흡수
  - `AdminNavigation.js` → `AdminPageLayout.jsx` 내부 inline const 로 흡수 (외부 사용처 1건만)
  - `VisibleToggle.jsx` → `web/src/global/ui/visibleToggle/` 글로벌 공용 컴포넌트 이전 (events/notices/quiz admin 도 사용 예정)
- **BE 패키지 재배치**: 도메인별 흩어진 `Admin*Controller` 7개 (coupon/event/notice/quiz/community 4개 + player 1개 + UploadController/SwaggerController) 위치 표준화 — 별도 라운드. 본 도메인 task 화 안 함 (각 도메인 PRD 가 자기 admin 부분 흡수했으므로 이동 시 cross-domain commit 필요)
- **운영 시크릿 평문 노출** (`naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*`): authentication.md A.6 cite — 별도 보안 라운드
- **AdminPlayerCardController 주석 핸들러 6개**: playerCard.md A.7 흡수 — 본 라운드 무관

## B.9 ★ Owner 결정 (이번 라운드)

| 항목 | 결정 | 사유 |
|---|---|---|
| 도메인별 admin 흡수 매핑 | coupons T2 / events T1·T2·T3 / notices T1·T2·T3·T6 / quiz T2 / authentication T2·T3 / playerCard 별도 라운드 / community 별도 라운드 | 각 도메인 PRD 가 자기 admin 부분 흡수 — 본 도메인 중복 금지 |
| R4 (`/api/upload/events` 가드) 흡수 | **events.md T3** | events 도메인 controller 의 직접 영향 — 도메인 PRD 가 owner |
| R5 (`/api/dev/test-token` 가드) 흡수 | **authentication.md T2** | `@Profile("!prod")` 채택 — 인증 토큰 발급 보안 task |
| R6 (`@PreAuthorize` decorative 정리) 흡수 | **authentication.md T3** | `@EnableMethodSecurity` 활성화 채택 — 인증/인가 인프라 정책 |
| Swagger 운영 노출 정책 (T2) | 결정 보류 (옵션 결정 → 후속 라운드) | 본 라운드 task close 기준은 옵션 결정만. authentication.md T2 의 `@Profile("!prod")` 패턴과 정합 |
| `domains/admin/` 폴더 운명 (T3) | ✅ **(B) 통째 폐기 — 단계 분리** (Step 3a 즉시 / Step 3b 후속 라운드) | Owner 진술 (2026-05-09): "도메인이 아닌 layout-like / sample 자투리. 각 도메인이 admin page 자체 흡수 후 폴더 제거" |
| BE 패키지 재배치 | 별도 라운드 | 각 도메인 admin 작업 흡수 완료 후 cross-domain 정리 |
| ★ Owner 결정 5건 (글로벌) | 영향 없음 | 본 라운드는 글로벌 5건과 무관 — 추적 표 갱신 X |

## B.10 cite

- Part A.3 (BE 노출 — UploadController / SwaggerController), Part A.5 (가드), Part A.6 (R4/R5/R6), Part A.7 (dead `domains/admin/store/**`)
- `docs/reconciliation/risk-and-priority.md #4 #5 #6` (R4/R5/R6 차단성 — R5/R6 은 authentication.md 흡수, R4 는 events.md 흡수)
- `docs/reconciliation/auth-and-flags.md:43,62,64` (R6/R5/R4 출처)
- `docs/reconciliation/dead-confirmed.md 1-C` (`domains/admin/store/**` dead)
- `docs/prd/_overview.md § 1.3` (admin 횡단 분류), `§ 2.4` (R4/R5/R6 위험), `§ 7 Phase 1` (보안 별개 fix — authentication 흡수)
- `web/src/app/router/routes/AdminRoutes.jsx` (T1 통합 검증 대상)
- `src/main/java/com/dawne/com2usbaseball/config/SecurityConfig.java:52` (admin URL 가드)

---

## TODO (다음 작업 우선순위)

> 사용자 진술 (2026-05-09): "코드가 너무 꼬인 상태로 방대하게 커진 상황. 이번 배포 시점은 기존 legacy 삭제 + 신규 모바일화 된 것 기준으로 진행"
> 본 섹션은 admin 도메인 + cross-domain 우선순위 정리. 작업 시 본 표 참조.

### 본 라운드 즉시 (P0) — 진행 중 / 완료

- [x] **legacy `web/src/admin/` 폐기** (2026-05-09) — 과거 legacy PC 버전 admin 도메인 샘플 폴더 통째 폐기. 작업 시점 폴더 부재 + 외부 import 0건 검증 (`@/admin`, `src/admin`, `../admin`, `../../admin` 모두 grep 매치 0). PRD 문서 기록 (B.7 § legacy `web/src/admin/` 폐기) + frontend admin 정책 명시 (B.7 § Frontend admin 구현 정책 — `src/domains/{domain}/feature/admin/` 패턴, coupons 적용 사례). 코드 변경 0건 ✅
- [x] **T3 Step 3a** — `web/src/domains/admin/store/**` 6 파일 통째 삭제 (api/endpoints/thunks/dto/slices/index — `dead-confirmed.md 1-C` cite). 본 라운드 commit 으로 처리 ✅
- [x] **T3 Step 3b 완료** (2026-05-09) — `web/src/domains/admin/` 잔여 폴더 (pages/config/feature) 통째 폐기 + 4 consumer 흡수 완료 ✅
- [x] **도메인 admin UI legacy 통째 폐기** (2026-05-09) — 사용자 정책: "src/domains/{domain}/ 내 admin 관련 page UI 전부 삭제. UI 는 신규 기획을 통해 디자인. API 는 보존". 폐기 (UI 레이어): coupons feature/admin/** + config/couponTable.config.js (12 파일), quiz feature/admin/** + config/quizTable.config.js (12 파일), notices feature/components/admin/** (2 파일 — AdminNoticeManagePage.jsx + scss), events 부재 (skip). 보존 (데이터 레이어): 각 도메인 store/admin/{api, endpoints, thunks, dto, slices} 절대 미터치. AdminRoutes.jsx: `/admin/content/{notice, coupon, quiz}` 활성 라우트 lazy import + Route element 모두 주석 (3건). 결과: AdminRoutes 활성 라우트 0건 (community 는 이전 라운드부터 주석 dead). community 미터치 (사용자 명시). 신규 admin UI 기획 후 `src/domains/{domain}/feature/admin/` 패턴 재구현 ✅
  - 삭제: `pages/dashboard/**` (jsx + scss 2 파일), `pages/user/**` (jsx 2 + hooks 2 + scss 2 = 6 파일), `config/AdminNavigation.js`, `feature/components/toggle/**` (jsx + scss 2 파일) — 합 11 파일
  - 4 consumer 흡수 결과:
    - **AdminRoutes.jsx**: `AdminDashBoardPage` / `AdminUserManagePage` / `AdminUserDetailPage` 3 lazy import + 3 active route 주석 처리 (사용자 정책 — 신규 admin home / user 페이지는 별도 기획 후 `src/domains/{domain}/feature/admin/` 패턴 재구현)
    - **AdminPageLayout.jsx**: `AdminNavigation` const 를 layout 파일 내부 inline 으로 흡수 (외부 사용처 1건만 — 별도 config 파일 분리 불요)
    - **coupons CouponTableBody.jsx**: `VisibleToggle` import path 만 갱신 (`@/domains/admin/feature/components/toggle/VisibleToggle.jsx` → `@/global/ui/visibleToggle/VisibleToggle.jsx`)
    - **VisibleToggle 글로벌 공용**: `web/src/global/ui/visibleToggle/{VisibleToggle.jsx, VisibleToggle.module.scss, index.js}` 신규 생성 (events/notices/quiz admin 등 다른 도메인 admin 도 visible 토글 사용 가능성 있음 — global ui 패턴 정합)
  - 검증: `@/domains/admin` import grep 0건 (코드 활성 사용 0건, 주석 잔존만)
- [ ] **T1** — AdminRoutes.jsx 통합 가드 검증 (5 활성 라우트 AuthGuard ADMIN 통과 + 비-ADMIN 401/403). event 라우트는 events.md T1 활성화 후 합류
  - 의존: `AdminRoutes.jsx`, `SecurityConfig.java:52`
  - 본 라운드는 검증만 가능 (코드 변경 0건 — 통과 시 close)

### 다음 라운드 (P1) — Step 3b cross-domain commit (위험)

- [x] **T3 Step 3b 완료 (2026-05-09)** — `web/src/domains/admin/` 잔여 폴더 통째 폐기 (4 consumer 흡수 완료) ✅
  - **흡수 결과** (admin.md B.7 cite):
    - `pages/dashboard/AdminDashBoardPage.jsx` (+ scss) → AdminRoutes index 라우트 주석 + 페이지 파일 삭제 (legacy sample 폐기). 신규 admin home 은 별도 기획 라운드. 소비처 `AdminRoutes.jsx:5`
    - `pages/user/AdminUserManagePage.jsx` + `useAdminUserForm.js` + `useUserFilter.js` + scss → 라우트 주석 + 파일 삭제 (legacy sample 폐기). 신규 user 관리는 추후 `profile` 또는 `user` 도메인 admin 흡수. 소비처 `AdminRoutes.jsx:6`
    - `pages/user/AdminUserDetailPage.jsx` (+ scss) → 위와 동일 처리. 소비처 `AdminRoutes.jsx:7`
    - `config/AdminNavigation.js` → `web/src/global/layout/adminPageLayout/AdminPageLayout.jsx` 내부 inline const 로 흡수 (외부 import 1건만 — 별도 config 파일 분리 불요). 소비처 `AdminPageLayout.jsx:4`
    - `feature/components/toggle/VisibleToggle.jsx` (+ scss) → **글로벌 공용** `web/src/global/ui/visibleToggle/` 로 이전 (events/notices/quiz admin 도 사용 예정 — global ui 패턴 정합). 소비처 `coupons/feature/admin/components/table/CouponTableBody.jsx:3` import 갱신
  - 처리 결과: `web/src/domains/admin/**` 11 파일 통째 삭제 + 4 consumer 흡수 완료 + import 0건 검증 (`@/domains/admin` grep 0건, comment 잔존만)
  - cross-domain commit 영향: AdminRoutes / coupons admin (CouponTableBody) / global layout (AdminPageLayout) / global ui (visibleToggle 신규)

- [ ] **T2** — Swagger UI / `/v3/api-docs/**` 운영 노출 정책 결정
  - **옵션 (a)** prod profile 에서 swagger 경로 차단 (`@Profile("!prod")` SpringDoc bean 또는 SecurityConfig 분기)
  - **옵션 (b)** 현재 정책 유지 (운영 진단용 의도적 노출) → task close
  - 의존: `SecurityConfig.java:45-51`. authentication.md T2 의 `@Profile("!prod")` 패턴 (SwaggerController) 과 정합 결정

### 후속 라운드 (P2) — 별도 정리 라운드

- [ ] **BE 패키지 재배치** — 도메인별 흩어진 `Admin*Controller` 7개 (coupon/event/notice/quiz/community 4개 + player 1개 + UploadController/SwaggerController) 위치 표준화. 각 도메인 admin 작업 흡수 완료 후 cross-domain commit (admin.md B.8 cite)
- [ ] **운영 시크릿 평문 노출 정리** — `naver.client-id/secret`, `jwt.secret`, `cloud.aws.credentials.*` (authentication.md A.6 cite). 별도 보안 라운드
- [ ] **AdminPlayerCardController 주석 핸들러 6개 정리** — playerCard.md A.7 흡수 (admin 도메인 무관, 본 표는 cross-ref 만)

### 잠재 위험 / 결정 보류 (★ Owner 결정 필요)

- [ ] **R4** (`POST /api/upload/events` permitAll 가드) — events.md T3 흡수 (admin 도메인 본 라운드 중복 task 화 X)
- [ ] **R5** (`GET /api/dev/test-token` permitAll 가드) — authentication.md T2 흡수 (`@Profile("!prod")` 채택 합의됨)
- [ ] **R6** (`@PreAuthorize` decorative + `@EnableMethodSecurity` 미선언) — authentication.md T3 흡수 (활성화 채택 합의됨)
- [ ] **신규 admin home 기획** — 현 `AdminDashBoardPage` 가 sample 자투리. T3 Step 3b 진행 전 Owner 가 admin home 정의 필요 (대시보드 / index 리다이렉트 / etc.)
- [ ] **profile vs 신규 user 도메인** — `AdminUserManagePage` / `AdminUserDetailPage` 흡수처 결정. profile 도메인은 이미 BE `domain/oauth/UserController` (`/api/users/me`) 호출 중. 동일 도메인 합치기 vs 분리
- [ ] **신규 admin UI 기획 우선순위** (2026-05-09) — 도메인 admin UI legacy 통째 폐기 후 신규 기획 라운드 진행 시 어느 도메인 우선 진행할지 사용자 결정 필요. 후보: coupons (직전 라운드 신규 작성된 컴포넌트 패턴 reference 보유) / events (admin 라우트 활성화 미진행 — events.md T1) / notices (notices.md T1~T6 admin 영역) / quiz (quiz.md admin 영역). 4 도메인 모두 `store/admin/{api, endpoints, thunks, dto, slices}` 데이터 레이어 보존 상태이므로 신규 UI 만 작성 가능. VisibleToggle 글로벌 컴포넌트 (`web/src/global/ui/visibleToggle/`) 보존 — 신규 기획 시 사용 예정

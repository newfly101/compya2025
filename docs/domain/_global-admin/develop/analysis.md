# admin 4종 풀스택 분석문서 (analysis.md)

> developer-analyze 산출 (2026-05-31).
> 관련 결정 누적: `decisions.log`

## § 1. 현황 요약 + 가정값

| 항목 | 현황 |
|------|------|
| BE `/api/admin/**` 보안 | SecurityConfig: `hasRole('ADMIN')` 전체 적용 완료 |
| BE admin 쿠폰 | `AdminCouponController` — GET list / POST / PATCH /{id} / PATCH /{id}/visible. **DELETE 없음. @PreAuthorize 없음** |
| BE admin 이벤트 | `AdminEventController` — GET external only / POST / PATCH /{id} / PATCH visible. **GET list(전체) 없음. DELETE 없음** |
| BE admin 공지 | `AdminNoticeController` — GET list / GET /{id} / POST / PUT / PATCH visible / PATCH pinned / DELETE 완비. **@PreAuthorize 없음** |
| BE admin 유저 | **전무** — UserController는 `/api/users/me` 전용 |
| FE AdminRoutes | 전체 주석 처리 (2026-05-09 legacy 폐기). 골격만 잔존 |
| FE AuthGuard | `allow="ADMIN"` + `userRole` 기반 정상 구현 |
| FE useAuthentication | **버그**: `state.auth.authority` 참조 — 해당 키 없음. 정확한 키는 `state.auth.userRole` |
| FE Drawer | admin 진입점 코드 전혀 없음 |
| FE notices admin endpoint | **버그**: UPDATE/UPDATE_VISIBLE 경로에 `/{id}` 누락 |

### 작업 가정값

| 마커 | 항목 | 적용값 |
|------|------|--------|
| 🟨 | admin 라우트 경로 | `/admin/coupon`, `/admin/event`, `/admin/notice`, `/admin/user` flat 구조 |
| 🟨 | 유저 관리 표시 필드 | id / nickname / email / userRole / userStatus / lastLoginAt |
| 🟨 | 유저 WITHDRAWN 포함 | 포함 (필터로 제외 가능) |
| 🟨 | 검색·필터 UI 위치 | 리스트 상단 고정 bar |
| 🟨 | 페이지네이션 | page 방식 20건/page (admin 정밀 조작 — 무한스크롤 X) |
| 🟨 | 이벤트 GET list | `/api/admin/events` 신규 (기존 `/external`은 type 필터 전용) |
| ❓ | 유저 상세 페이지 사양 | TBD — 별도 사이클 |
| 🔴 | admin user API 개인정보 노출 범위 | email 포함 / oauthEmail·providerId 제외 가정 — **사용자 확인 필요** |
| 🔴 | AdminCouponController @PreAuthorize | SecurityConfig 보호 존재하나 메서드 레벨 누락 — cleanup 권고 |

---

## § 2. 발견 사항 (gap analysis)

| 발견 위치 | 유형 | 내용 |
|-----------|------|------|
| `useAuthentication.js:13` | 버그 | `state.auth.authority` 참조 — 키 없음. `state.auth.userRole` 이 정확 |
| `notices/store/admin/endpoints.js:10-13` | 버그 | UPDATE/UPDATE_VISIBLE 경로에 `/{id}` 누락. BE는 `/{noticeId}` 필수 |
| `AdminCouponController.java:18` | 🟧 보안 | `@PreAuthorize` 클래스 레벨 누락 — SecurityConfig는 있으나 메서드 레벨 방어 부재 |
| `AdminNoticeController.java:18` | 🟨 cleanup | `@PreAuthorize` 누락 (EventController와 일관성 불일치) |
| `AdminEventController.java` | gap | `GET /api/admin/events` 전체 목록 없음. `GET /{id}` detail 없음. `DELETE` 없음 |
| `AdminCouponController.java` | gap | `DELETE /api/admin/coupons/{id}` 없음 |
| `UserController.java` | gap | admin용 user 조회/상태변경 endpoint 전무 |
| `AdminRoutes.jsx:20-51` | gap | 모든 admin 라우트 주석. 도메인 admin 화면 파일 전무 |
| `Drawer.jsx` | gap | admin 진입점 없음 |
| `store.js` | gap | admin user slice 없음 |

---

## § 3. BE 작업 명세 (backend-developer 전용)

### FN-A1: 쿠폰 admin — DELETE 신규 + @PreAuthorize 추가

| 항목 | 내용 |
|------|------|
| 신규 Endpoint | `DELETE /api/admin/coupons/{id}` |
| Response | `GlobalResponse<Void>` + `CouponMessages.COUPON_DELETED` (신규 enum 추가) |
| Service 신규 | `AdminCouponService.deleteCoupon(id)` |
| Mapper 신규 | `CouponMapper.deleteById(id)` — soft delete 권고 |
| 기존 수정 | `AdminCouponController` 클래스 레벨 `@PreAuthorize("hasRole('ADMIN')")` 추가 |
| 예외 | id 없으면 404 |

### FN-A2: 이벤트 admin — GET list(전체) + DELETE 신규

| 항목 | 내용 |
|------|------|
| 신규 Endpoint 1 | `GET /api/admin/events` — 전체 목록, query: `page`, `size`, `eventType`, `visible` |
| 신규 Endpoint 2 | `DELETE /api/admin/events/{id}` |
| Response (GET) | `List<EventResponse>` (기존 record 재사용) |
| Service 신규 | `EventAdminService.getEventList(params)`, `deleteEvent(id)` |
| Mapper 신규 | `EventMapper.selectAdminList(params)` |
| 기존 @PreAuthorize | 이미 클래스 레벨 존재 — 변경 불필요 |
| 예외 | id 없으면 404 |

### FN-A3: 공지 admin — @PreAuthorize 추가 + 필터 파라미터

| 항목 | 내용 |
|------|------|
| 기존 CRUD | 완비 — 수정 최소 |
| 수정 1 | `AdminNoticeController` 클래스 레벨 `@PreAuthorize("hasRole('ADMIN')")` 추가 |
| 수정 2 | `GET /api/admin/notices` — query param 추가: `source`, `isVisible`, `isPinned` |
| Mapper 수정 | `NoticeMapper.selectAdminList(params)` 동적 필터 추가 |

### FN-A4: 유저 admin — 신규 전체

| 항목 | 내용 |
|------|------|
| 신규 Controller | `AdminUserController` — `@RequestMapping("/api/admin/users")` + `@PreAuthorize("hasRole('ADMIN')")` |
| Endpoint 1 | `GET /api/admin/users` — query: `nickname`, `userRole`, `userStatus`, `page`, `size` |
| Endpoint 2 | `GET /api/admin/users/{userId}` — 상세 (TBD 포함) |
| Endpoint 3 | `PATCH /api/admin/users/{userId}/role` |
| Endpoint 4 | `PATCH /api/admin/users/{userId}/status` |
| Response DTO 신규 | `AdminUserResponse` — `id, nickname, email, userRole, userStatus, lastLoginAt, createdAt` (oauthEmail·providerId 제외 🔴) |
| Mapper 신규 | `UserMapper.selectAdminUserList(params)`, `selectById(id)`, `updateRole(id, role)`, `updateStatus(id, status)` |
| 비즈니스 규칙 | 본인 role 변경 방지 (`userId == 요청자 ID`면 403) |
| DB 권고 | `user_role`, `user_status` 컬럼 인덱스 검토 (`ALTER TABLE user ADD INDEX idx_role_status (user_role, user_status)`) |

---

## § 4. FE 작업 명세 (frontend-developer 전용)

### FN-F0: 인프라 (P0 — 선행 필수)

| 항목 | 파일 | 수정 내용 |
|------|------|---------|
| useAuthentication 버그 | `web/src/domains/authentication/hooks/useAuthentication.js` | `authority` → `userRole`. `isAdmin: userRole === 'ADMIN'` 파생 추가 |
| notices endpoint 버그 | `web/src/domains/notices/store/admin/endpoints.js` | `UPDATE: (id) => /admin/notices/${id}`, `UPDATE_VISIBLE: (id) => /admin/notices/${id}/visible` |
| routePath | `web/src/app/router/config/routePath.js` | admin 4종 path 추가 |
| routeMeta | `web/src/app/router/config/routeMeta.js` | ADMIN_COUPON/ADMIN_EVENT/ADMIN_NOTICE/ADMIN_USER meta 추가 |
| Drawer | `web/src/app/wrapper/mobile/parts/Drawer.jsx` | `isAdmin` 조건 기반 "어드민 페이지 가기" Link 추가 (유저 프로필 블록 하단, `user &&` 블록 안) |

### FN-F5: AdminRoutes 복원

| 항목 | 내용 |
|------|------|
| 파일 | `web/src/app/router/routes/AdminRoutes.jsx` |
| 수정 | 주석 정리. lazy import 4종 + route 등록. path: `admin/coupon`, `admin/event`, `admin/notice`, `admin/user` (flat — `content/` 중간 계층 제거) |

### FN-F1: 쿠폰 admin 화면

| 항목 | 내용 |
|------|------|
| Screen | `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx` |
| Route | `/admin/coupon` (AdminRoutes — AuthGuard allow="ADMIN") |
| TopBar | `useSetTopBar({ variant: "page", title: "쿠폰 관리" })` |
| Store | 기존 `coupons/store/admin/` 재활용 + `requestAdminDeleteCoupon` 신규 |
| 상태 분기 | loading / error / empty / normal |
| UI | 상단 검색bar(제목/코드) + visible 필터 (클라이언트 필터링). 카드: title / couponCode / expireAt / visible chip / 수정·삭제 버튼. Bottom Sheet 등록/수정 공용 폼 |

### FN-F2: 이벤트 admin 화면

| 항목 | 내용 |
|------|------|
| Screen | `web/src/domains/events/mobile/admin/AdminEventScreen.jsx` |
| Route | `/admin/event` |
| TopBar | `useSetTopBar({ variant: "page", title: "이벤트 관리" })` |
| Store | `events/store/admin/` endpoint 추가 (`/admin/events` 전체 목록) |
| 상태 분기 | loading / error / empty / normal |
| UI | 검색bar(제목) + 필터(eventType, visible). 카드: title / eventType chip / 날짜 / imageUrl thumbnail / visible chip / 수정·삭제 |

### FN-F3: 공지 admin 화면

| 항목 | 내용 |
|------|------|
| Screen | `web/src/domains/notices/mobile/admin/AdminNoticeScreen.jsx` |
| Route | `/admin/notice` |
| TopBar | `useSetTopBar({ variant: "page", title: "공지 관리" })` |
| Store | `notices/store/admin/` 기존 재활용 (FN-F0 버그 수정 선행) |
| 상태 분기 | loading / error / empty / normal |
| UI | 검색bar(제목) + 필터(source, isVisible, isPinned). 카드: title / source chip / isPinned badge / isVisible chip / publishedAt / 수정·삭제 |

### FN-F4: 유저 관리 화면

| 항목 | 내용 |
|------|------|
| Screen | `web/src/domains/users/mobile/admin/AdminUserScreen.jsx` |
| Route | `/admin/user` |
| TopBar | `useSetTopBar({ variant: "page", title: "유저 관리" })` |
| Store 신규 | `web/src/domains/users/store/admin/{endpoints,api,thunks,slices}.js` |
| store.js | reducer key 추가: `adminUsers` |
| 상태 분기 | loading / error / empty / normal |
| 리스트 행 | nickname / userRole chip / userStatus chip / lastLoginAt — flex 배치, 가로 스크롤 X, text overflow ellipsis |
| 행 클릭 | Bottom Sheet TBD (이번 사이클은 마커만) |
| 검색·필터 | nickname 검색 + userRole/userStatus 드롭다운 |
| 컴포넌트 | `UserRow` 반복 요소 별도 컴포넌트 분리 가능 |

---

## § 5. cross-domain 정합

| 항목 | BE | FE | 정합 |
|------|----|----|------|
| 쿠폰 list | `GET /api/admin/coupons` | `"/admin/coupons"` | 일치 |
| 쿠폰 DELETE | 신규 필요 | 없음 | 동시 추가 |
| 이벤트 list(전체) | 신규 `GET /api/admin/events` | 기존 `/admin/events/external` | 불일치 — 동시 수정 |
| 공지 UPDATE path | `PUT /api/admin/notices/{noticeId}` | `"/admin/notices"` (id 누락) | **버그 — FE 수정** |
| 공지 UPDATE_VISIBLE path | `PATCH /api/admin/notices/{noticeId}/visible` | `"/admin/notices/visible"` (id 누락) | **버그 — FE 수정** |
| 유저 admin | 전무 | 전무 | 동시 신규 |
| AuthGuard | `SecurityConfig hasRole('ADMIN')` | `AuthGuard allow="ADMIN" userRole 기반` | 일치 |
| isAdmin FE | JWT claim `role=ADMIN` → `state.auth.userRole` | `authority` 참조 버그 | **버그 — FE 수정** |

---

## § 6. 자체 평가

| 평가 항목 | 상태 | 비고 |
|----------|------|------|
| 기획 부합도 | ✓ | 사용자 요구 4종 + Drawer 진입점 + CRUD/검색/필터 전부 매핑 |
| UI 일관성 | ⚠️ | screen-spec 없음 + Figma MCP 미접근 — UI 상세는 가정값 적용. Figma node-id 참조 명시 |
| 누락 항목 | 1 | 유저 상세 페이지 (TBD — 별도 사이클) |
| 위험·가정값 | 9건 | decisions.log 참조 |

---

## § 7. 가정값 / 위험 항목 요약

| 마커 | FN | 항목 | 적용값 |
|------|-----|------|--------|
| 🔴 | FN-A4 | admin user API 개인정보 노출 범위 | email 포함, oauthEmail/providerId 제외 — **사용자 확인 필요** |
| 🔴 | FN-A1 | AdminCouponController @PreAuthorize 누락 | SecurityConfig 보호 존재 — 메서드 레벨 추가 권고 |
| 🟨 | FN-F0 | admin 라우트 경로 | `/admin/coupon` flat 구조 |
| 🟨 | FN-A4 | 유저 목록 표시 필드 | id/nickname/email/userRole/userStatus/lastLoginAt |
| 🟨 | FN-A4 | WITHDRAWN 유저 포함 | 포함 (필터 가능) |
| 🟨 | ALL | 페이지네이션 | 20건/page |
| 🟨 | ALL | 검색·필터 UI | 상단 고정 bar |
| 🟨 | FN-A2 | 이벤트 GET list | `/api/admin/events` 신규 |
| ❓ | FN-F4 | 유저 상세 사양 | TBD |

---

## § 8. follow-up 우선순위

| 우선순위 | 항목 | 담당 |
|---------|------|------|
| P0 | useAuthentication `authority` 버그 수정 | FE |
| P0 | AdminRoutes 복원 + Drawer admin 진입점 | FE |
| P0 | notices admin endpoint id 누락 버그 수정 | FE |
| P0 | 🔴 admin user API 개인정보 노출 범위 결정 | HITL |
| P1 | BE: 쿠폰 DELETE + @PreAuthorize | BE |
| P1 | BE: 이벤트 GET list(전체) + DELETE | BE |
| P1 | BE: 공지 @PreAuthorize + 필터 파라미터 | BE |
| P1 | BE: 유저 admin 컨트롤러/서비스/매퍼 신규 | BE |
| P1 | FE: admin 화면 4종 (병렬 가능) | FE |
| P2 | 빈/로딩/에러 상태 UX 정교화 | FE |
| P2 | AdminCouponController @PreAuthorize | BE |
| P3 | 유저 상세 페이지 (TBD) | 별도 사이클 |

---

## § 9. dispatch brief (5개)

### Brief-1: backend-developer
```
목적: admin 4종 BE endpoint 신규·보완
input: analysis.md § 3 (FN-A1~A4)

1. AdminUserController 신규 (GET list/detail, PATCH role/status) + AdminUserResponse DTO + UserMapper 쿼리
2. AdminCouponController — DELETE 신규 + @PreAuthorize 클래스 레벨 추가
3. AdminEventController — GET /api/admin/events 전체 목록 + DELETE 신규
4. AdminNoticeController — @PreAuthorize 추가 + GET list 필터 파라미터(source/isVisible/isPinned)

패턴: GlobalResponse<> + @PreAuthorize("hasRole('ADMIN')") 기존 컨트롤러 준수.
제약: DB 마이그레이션 SQL 권고만 (실행 X). 코드 Edit 가능.
보고: 산출물 경로 + 핵심 결과 표 (300줄 이하).
```

### Brief-2: frontend-developer (인프라 P0)
```
목적: FE admin 인프라 P0 수정
input: analysis.md § 4 FN-F0 + FN-F5

1. useAuthentication.js — authority → userRole 수정, isAdmin 파생 추가
2. notices/store/admin/endpoints.js — UPDATE/UPDATE_VISIBLE에 id 파라미터 추가
3. AdminRoutes.jsx — 주석 정리, lazy import 4종 + route 등록 (admin/coupon, admin/event, admin/notice, admin/user flat)
4. routePath.js + routeMeta.js — admin 4종 추가
5. Drawer.jsx — isAdmin 조건 "어드민 페이지 가기" Link 추가 (유저 프로필 블록 하단)

제약: MobileLayout/AuthGuard 구조 변경 X. 보고: 300줄 이하.
```

### Brief-3: frontend-developer (쿠폰 + 이벤트 admin)
```
목적: AdminCouponScreen + AdminEventScreen 신규 (Brief-2 완료 후)
input: analysis.md § 4 FN-F1 + FN-F2

1. web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx
   - useSetTopBar({ variant:"page", title:"쿠폰 관리" })
   - 기존 coupons/store/admin/ 재활용 + requestAdminDeleteCoupon 추가
   - 검색(제목/코드) + visible 필터 + 카드리스트 + Bottom Sheet 폼

2. web/src/domains/events/mobile/admin/AdminEventScreen.jsx
   - useSetTopBar({ variant:"page", title:"이벤트 관리" })
   - events/store/admin/ endpoint 추가(/admin/events 전체목록)
   - 검색 + eventType/visible 필터 + 카드리스트

mobile-first. applyAsyncHandlers. 상태분기 4종 필수. 보고: 300줄 이하.
```

### Brief-4: frontend-developer (공지 + 유저 admin)
```
목적: AdminNoticeScreen + AdminUserScreen 신규 (Brief-2 완료 후)
input: analysis.md § 4 FN-F3 + FN-F4

1. web/src/domains/notices/mobile/admin/AdminNoticeScreen.jsx
   - useSetTopBar({ variant:"page", title:"공지 관리" })
   - notices/store/admin/ 기존 재활용(FN-F0 수정 선행)

2. web/src/domains/users/mobile/admin/AdminUserScreen.jsx
   - web/src/domains/users/store/admin/{endpoints,api,thunks,slices}.js 신규
   - store.js에 adminUsers reducer 추가
   - UserRow: nickname/userRole chip/userStatus chip/lastLoginAt — flex, 가로 스크롤 X
   - 행 클릭 Bottom Sheet TBD 마커만(내용 미구현)

mobile-first. applyAsyncHandlers. 상태분기 4종 필수. 보고: 300줄 이하.
```

### Brief-5: designer-render (admin 화면 Figma)
```
목적: admin 4종 화면 figma-plugin 작성
Figma 참조: node-id 16-103/16-168/16-324(공지), 16-364/16-509/16-568(쿠폰), 16-264(유저)
input: analysis.md § 4

figma-plugin/domains/admin-coupon.ts, admin-event.ts, admin-notice.ts, admin-user.ts 4개 신규
code.ts에 각 draw 함수 호출 추가. 375px mobile-first. TopBar 글로벌.
보고: 파일 경로 목록. 300줄 이하.
```

---
feature: users
version: 1.0.1
status: active
created: 2026-05-31
updated: 2026-09-28
---

# users

## 1. 무엇을 하는 기능인가

로그인한 이용자가 마이페이지에서 닉네임·프로필 이미지를 바꾸고 탈퇴할 수 있게 하고, 운영자가 관리자 화면에서 전체 회원의 권한·상태를 관리하게 하는 기능이다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 마이페이지 (SC-09-01) | `/mypage` | 로그인 필요(`AuthGuard`). 전역 상단바 메뉴에서 진입 |
| 회원 관리 (SC-01-01 내부 탭) | `/admin` → 유저 탭 | 어드민 셸(SC-01-01) 안의 탭 전환. 로그인+`ADMIN` 권한 필요 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-USR-01 | 프로필 수정 | 로그인 사용자는 마이페이지에서 닉네임·프로필 이미지를 바꿀 수 있다 | `PATCH /api/users/me`, `MyPageScreen.jsx` |
| REQ-USR-02 | 3중 검증 | 닉네임은 FE(trim+빈값 거부+`maxLength=20`)·서버(길이 재검사)·DDL(`VARCHAR(20)`) 3중으로 막고, 프로필 이미지는 자체 업로드 URL만 허용한다 | `MyPageScreen.jsx:62-63,206`, `UserServiceImpl.java`, `sql/V2/CREATE_04_TABLE_SITE.sql:78` |
| REQ-USR-03 | 닉네임 중복 허용 | 닉네임 중복 검사를 하지 않는다(의도된 설계) | `UserSwaggerDocs.java:54`, `site_users.service_nickname`(UNIQUE 없음) |
| REQ-USR-04 | 탈퇴 | 로그인 사용자는 탈퇴할 수 있으며, 탈퇴는 계정 상태를 `WITHDRAWN`으로 바꾸는 것뿐이다(행 삭제 아님). 1개월 내 재로그인 시 상태가 `ACTIVE`로 자동 복구된다 | `DELETE /api/users/me`, `UserServiceImpl.java` `withdraw()` |
| REQ-USR-05 | 관리자 조회 | 관리자는 전체 회원을 검색·필터하고 권한(`USER`/`ADMIN`)·상태(정상/차단/정지/탈퇴)를 변경할 수 있다 | `AdminUserController.java`(`GET /api/admin/users`, `GET /{publicId}`, `PATCH /{publicId}/role`, `PATCH /{publicId}/status`) |
| REQ-USR-06 | 전량 조회 | 회원 목록 조회는 검색·정렬·페이지 이동을 화면(클라이언트) 쪽에서 처리하는 구조라, 요청 시점에 전량(최대 1000명)을 받아온다 | `users/store/admin/thunks.js`(`LIST_ALL_PARAMS = { page: 0, size: 1000 }`) |
| REQ-USR-07 | 자기 자신 보호 | 관리자는 자기 자신의 권한·상태를 스스로 변경할 수 없다 | `AdminUserServiceImpl.java:90-92` |
| REQ-USR-08 | 페이지네이션 UI | 회원 수가 7페이지를 넘으면 번호 버튼을 현재±1·처음·끝만 남기고 "…"로 축약한다 | `AdminPagination.jsx:5-12`(`buildPageWindow`) |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 내 정보 조회/수정/탈퇴 | `GET`·`PATCH`·`DELETE /api/users/me` | `UserController.java`(`domain/oauth/controller`) |
| 관리자 회원 목록/상세 | `GET /api/admin/users`, `GET /api/admin/users/{publicId}` | `AdminUserController.java` |
| 관리자 권한/상태 변경 | `PATCH /api/admin/users/{publicId}/role`, `.../status` | 자기 자신 제외 |
| 회원 본체 | `site_users` | `service_nickname`·`profile_image`·`user_role`·`user_status`·`withdrawn_at` |
| OAuth 연동 원본 | `site_user_oauth_accounts` | 탈퇴해도 이 테이블 값은 지워지지 않는다 |

⚠️ BE 코드 위치는 `domain/oauth/**`다 — 이름 계약상 `domain/users`여야 하나 authentication과 같은 패키지를 공유한다. 이름을 바꾸는 결정은 하지 않는다(§ 6).

## 5. 하지 않는 것

- 개인정보 파기(행 삭제 또는 칸 비우기) — 탈퇴 후에도 닉네임·이메일·프로필 이미지·OAuth 연동 정보가 전부 남는다. 파기 방식 자체가 계정 기획에서 "보류(사용자 결정)"로 명시돼 있다
- 탈퇴 회원을 목록에서 걸러내는 것 — 관리자 회원 목록에 탈퇴 회원도 계속 보인다
- WITHDRAWN → ACTIVE 전이를 별도 확인 절차로 제한하는 것 — 지금은 관리자가 상태만 바꾸면 즉시 복구된다(오인 정지 해제 같은 정상 업무를 막지 않기 위해 그대로 둠)
- 보관기간(1개월)이 지난 탈퇴 계정을 정리하는 배치 — authentication의 refresh 토큰 정리와 통합 예정이나 미구현
- 즉시 파기 요청을 처리하는 관리자 기능(삭제 엔드포인트) — 지금은 운영자가 DB를 직접 만져야 한다
- 회원 총건수 API — 없다. 회원이 1000명을 넘으면 REQ-USR-06의 전량 조회 방식이 한계에 닿는다(코드에 `ponytail:` 주석으로 표시됨)

## 6. 확인 필요

🔴 탈퇴 회원의 개인정보 파기 방식(행 삭제 vs 칸 비우기) — 법무·기획 결정 사안. 이 문서는 가정값을 적지 않는다. `policy` 도메인의 개인정보처리방침 문구와 직결된다(§ 5).

🔴 즉시 파기 요청 처리 수단 부재 — 법무 사안. 관리자 기능에 삭제 엔드포인트 자체가 없다.

❓ WITHDRAWN → ACTIVE 전이에 별도 확인 절차를 요구할지 — 위 파기 결정과 같은 묶음에서 정할 사안.

❓ BE 패키지명(`domain/oauth`)이 FE 도메인명(`users`)과 다른 이름 계약 불일치 — `domain-naming.md` 규칙상 짝이 어긋나 있음. 정정은 리팩터 사안이라 이 라운드에서 하지 않았다.

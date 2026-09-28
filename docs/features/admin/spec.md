---
feature: admin
version: 1.0.5
status: active
created: 2026-01-29
updated: 2026-09-28
---

# admin

## 1. 무엇을 하는 기능인가

운영자(관리자 권한 1명) 전용 셸이다. 콘텐츠 도메인(퀴즈·이벤트·쿠폰·공지·유저) 관리 화면과 캐시 재적용 운영 기능을 탭 하나로 오가며 쓴다. `admin` 자체는 전용 데이터를 갖지 않고, 각 콘텐츠 도메인의 관리 화면을 셸 안에 배치하는 역할만 한다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 어드민 셸(홈·퀴즈·이벤트·쿠폰·공지·유저·동기화 7탭) | `/admin`, `/admin/:tab` | 로그인 후(ADMIN 권한) 서랍 메뉴 "Admin" 1항목 클릭, 또는 주소 직접 접근/북마크 |
| 공지 글쓰기(셸을 벗어나는 유일한 예외) | `/admin/notice/write`, `/admin/notice/write/:id` | 공지 탭 "글쓰기" 클릭. 화면 자체 규칙은 공지 기능 문서 소관 |

근거: `web/src/app/router/routes/AdminRoutes.jsx:14-31`, `web/src/domains/admin/mobile/ADMIN_TABS.js:6-13`, `web/src/app/wrapper/mobile/config/MENU_GROUPS.js:37-41`.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ADM-01 | 셸 접근 | 로그인 + ADMIN 권한이 있어야 어드민 셸(7탭)에 접근할 수 있다 | `AdminRoutes.jsx:14-31` |
| REQ-ADM-02 | 이중 방어 | `/api/admin/**` 요청은 `SecurityConfig`(URL 레벨) + 각 컨트롤러 클래스 `@PreAuthorize`(메서드 레벨) 양쪽에서 ADMIN 권한을 검증한다 | `SecurityConfig.java:62`, `AdminUserController.java:20` |
| REQ-ADM-03 | 캐시 동기화 | 동기화 탭에서 대상 1건 또는 전체를 재시작 없이 다시 읽어올 수 있다. 대상 목록은 서버가 내려주는 순서 그대로 쓴다(FE 하드코딩 없음) | `CacheSyncController.java`, `useAdminCounts.js:18` |
| REQ-ADM-04 | 자기 보호 | 관리자는 자기 자신의 권한(role)·상태(status)를 스스로 바꿀 수 없다 | `AdminUserServiceImpl.java:74-92` |
| REQ-ADM-05 | 목록 전량 탐색 | 회원·이벤트처럼 서버가 페이지로 자르는 목록은 배지·집계를 위해 상한(1000건)까지 전량을 받는다. 상한에 닿으면 숫자 대신 배지를 숨긴다 | `useAdminCounts.js:24-34` |
| REQ-ADM-06 | 업로드 예외 순서 | `/api/upload/profile`은 로그인만 요구하는 규칙을 먼저 매칭시키고, 그 뒤에 `/api/upload/**` → ADMIN 규칙을 건다. `SecurityConfig` 안 규칙 순서가 실제 적용 여부를 바꾼다 | `SecurityConfig.java:63-66` |
| REQ-ADM-07 | 커뮤니티 모더레이션 동결 | 커뮤니티 모더레이션 6개 컨트롤러(게시판·게시글·댓글·태그연결·신고·태그)는 리디자인 전까지 클래스 레벨 `@PreAuthorize` 없이 URL 규칙 하나에만 걸린 채 진입 경로 없는 동결 상태를 유지한다 | `AdminBoardController.java` 등 6개, `SecurityConfig.java:53-68` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 전용 테이블 | 없음 | 각 콘텐츠 도메인(쿠폰·이벤트·공지·퀴즈·유저) 테이블을 그대로 관리. 권한 구분 컬럼은 `site_users.user_role`(users 도메인 소유)뿐 |
| 캐시 동기화 | `GET /api/admin/cache-sync/targets`, `POST /api/admin/cache-sync/{id}/sync`, `POST /api/admin/cache-sync/sync-all` | admin 도메인이 직접 소유하는 유일한 API. `CacheSyncServiceImpl.definitions()`가 대상을 테이블 기반으로 관리 |
| 업로드 | `/api/upload/**`(`/profile` 제외 ADMIN) | admin 패키지 소유(`UploadController`), 콘텐츠 도메인 이미지 등록에 쓰임 |
| 6개 콘텐츠 목록 조회 | 퀴즈·이벤트·쿠폰·공지·유저·캐시대상 각 1회 | 셸 마운트 시 `useAdminCounts`가 한 번만 불러와 탭 배지·홈 카드에 공급. 각 도메인 CRUD 상세는 해당 기능 문서 소관 |

## 5. 하지 않는 것

- 개별 콘텐츠 도메인(쿠폰·이벤트·공지·퀴즈·유저)의 관리 화면 규칙(입력 항목·검증·삭제 방식 등) — 각 기능 문서가 다룬다. 이 문서는 "탭이 무엇을 여는지" 수준만 적는다
- 커뮤니티 모더레이션 화면 — `community` 동결에 따른 방치, 진입 경로 없음(§3 REQ-ADM-07)
- 관리자 권한을 부여·회수하는 절차 자체 — 코드에 없음(DB 직접 변경), 기획 공백
- 캐시 TTL·만료 정책 변경 — 운영 설정 승인 사안, 코드 범위 밖

## 6. 확인 필요

- ❓ `spring.cache.type=simple`이라 캐시 만료 정책이 없다(TTL 0건). 운영 설정 변경은 승인권자 결정 사안
- ❓ 로컬 개발 실행 환경 설정(`application-local.properties`) 공급 방식 미정 — 코드 문제가 아니라 운영 방식 결정
- 🟨 회원·이벤트 전량 조회 상한을 1000건으로 잡았다(REQ-ADM-05). 회원 545명 기준으로는 충분하나, 그 이상으로 늘면 총건수를 알려주는 별도 API가 필요하다(코드에 `ponytail:` 주석으로 남김, `useAdminCounts.js:28`)

---
created: 2026-10-03
updated: 2026-10-03
---

<!-- 생성 파일: python .claude/scripts/build-traceability.py — 손으로 고치지 말 것 -->

# 요구사항 추적표 — 계정·인증

> [overview/traceability.md](./traceability.md) 에서 분리(150줄 상한). § 1 읽는 법·§ 2 약어표·§ 4 집계·§ 5 빈 자리는 그 문서에 있다.

| REQ | 기능 | 규칙 요지 | 화면(SC) | API | 테이블 | 근거·이력 |
|---|---|---|---|---|---|---|
| REQ-AUTH-01 | authentication | 로그인 수단 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-02 | authentication | 토큰 발급 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-03 | authentication | 자동 재발급 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-04 | authentication | 상태별 거부 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-05 | authentication | CSRF 방어 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-06 | authentication | 로그아웃 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-07 | authentication | 콜백 실패 처리 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-08 | authentication | 사유 구분 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-09 | authentication | 실패 안내 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-10 | authentication | 동시 가입 경합 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-11 | authentication | 네이버 오류 흡수 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-12 | authentication | 라우트 보호 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-AUTH-13 | authentication | 로그인 안내 모달 | SC-08-01 | GET /api/auth/naver/login; GET /api/auth/naver/callback; POST /api/auth/refresh; POST /api/auth/logout | site_refresh_tokens, site_user_oauth_accounts | [spec §3](../features/authentication/spec.md) · 2026-10-02 |
| REQ-USR-01 | users | 프로필 수정 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-02 | users | 3중 검증 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-03 | users | 닉네임 중복 허용 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-04 | users | 탈퇴 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-05 | users | 관리자 조회 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-06 | users | 전량 조회 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-07 | users | 자기 자신 보호 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-08 | users | 페이지네이션 UI | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-USR-09 | users | 내 선호 레전드 링크 | SC-01-01, SC-09-01 | DELETE /api/users/me; GET /api/admin/users; GET /api/admin/users/{publicId}; PATCH /api/admin/users/{publicId}/role | site_users, site_user_oauth_accounts | [spec §3](../features/users/spec.md) · 2026-10-02 |
| REQ-CMT-01 | community | 읽기 전용 재오픈 | SC-05-01 | GET /api/boards; GET /api/boards/{id}; GET /api/boards/code/{code}; GET /api/posts/boards/{boardId}; GET /api/posts/{id} | - | [spec §3](../features/community/spec.md) · 2026-09-28 |
| REQ-CMT-02 | community | 외부 링크 이동 | SC-05-01 | GET /api/boards; GET /api/boards/{id}; GET /api/boards/code/{code}; GET /api/posts/boards/{boardId}; GET /api/posts/{id} | - | [spec §3](../features/community/spec.md) · 2026-09-28 |
| REQ-CMT-03 | community | 카운트 조작 방지 | SC-05-01 | GET /api/boards; GET /api/boards/{id}; GET /api/boards/code/{code}; GET /api/posts/boards/{boardId}; GET /api/posts/{id} | - | [spec §3](../features/community/spec.md) · 2026-09-28 |
| REQ-CMT-04 | community | 관리자 화면 이중 방어 | SC-05-01 | GET /api/boards; GET /api/boards/{id}; GET /api/boards/code/{code}; GET /api/posts/boards/{boardId}; GET /api/posts/{id} | - | [spec §3](../features/community/spec.md) · 2026-09-28 |

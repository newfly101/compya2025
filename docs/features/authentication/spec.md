---
feature: authentication
version: 1.1.0
status: active
created: 2026-04-17
updated: 2026-10-03
---

# authentication

## 1. 무엇을 하는 기능인가

네이버 계정 하나로 로그인하고, 로그인 상태를 access(30분)/refresh(30일) 토큰으로 유지하는 기능이다. 이용자는 직접 회원가입하지 않는다 — 네이버 인증을 마치면 계정이 자동으로 만들어지거나 이어진다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 로그인 콜백 처리 (SC-08-01) | `/auth/callback` | 전역 상단바(`TopBar`)의 로그인 버튼 → `GET /api/auth/naver/login`(BE가 인가 URL 생성) → 네이버 인증 → 네이버가 이 주소로 리다이렉트 |

로그인 버튼 자체는 도메인 화면이 아니라 전역 상단바 소유다(`fe-convention.md` § 5). 이 도메인이 가진 유일한 화면은 콜백 처리 화면뿐이다.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-AUTH-01 | 로그인 수단 | 네이버 계정 1종만 지원한다 | `useAuthentication.js:6-19`, `NaverOAuthService.java` |
| REQ-AUTH-02 | 토큰 발급 | 로그인 성공 시 access(30분)·refresh(30일) 토큰을 각각 `ACCESS_TOKEN`·`REFRESH_TOKEN` HttpOnly 쿠키로 발급한다 | `application.properties:39-41`, `AuthCookieFactory.java:12-13` |
| REQ-AUTH-03 | 자동 재발급 | access 토큰이 만료되면 재로그인 없이 refresh 토큰으로 재발급(rotation)된다 | `client.js`, `AuthServiceImpl.java` `refresh()` |
| REQ-AUTH-04 | 상태별 거부 | 정지·차단 계정은 로그인·재발급이 거부된다(탈퇴는 보관기간 내 예외) | `AuthServiceImpl.java:51,54`(상태 검사 → rotation 삭제 순서) |
| REQ-AUTH-05 | CSRF 방어 | 로그인 시작 시 서버가 `state` 값을 생성해 5분 TTL 쿠키(`OAUTH_STATE`)에 담고, 콜백에서 쿼리 값과 대조한 뒤 대조 직전 쿠키를 만료시켜 1회용을 보장한다 | `AuthCookieFactory.java:20,60-77` |
| REQ-AUTH-06 | 로그아웃 | 로그아웃 시 refresh 토큰 DB 행을 삭제하고 양쪽 쿠키를 만료시킨다 | `AuthController.java` `logout()`(`/api/auth/logout`) |
| REQ-AUTH-07 | 콜백 실패 처리 | 동의 거부·정지·권한부족 등 콜백이 실패해도 성공 때와 같은 방식으로 앱 화면에 리다이렉트하고, 사유는 `?error=코드`로만 전달한다(응답 원문 노출 금지) | `AuthController.java:59-80`(`naverCallback()` catch 문 78행) |
| REQ-AUTH-08 | 사유 구분 | 계정 정지(`AUTH_USER_BLOCKED`)·권한 부족(`AUTH_FORBIDDEN`)·인증 만료(`AUTH_UNAUTHORIZED`)는 서버가 내려주는 사유 코드만으로 구분한다(주소 패턴 추측 금지) | `client.js:49-55` `classifyForbidden` |
| REQ-AUTH-09 | 실패 안내 | 콜백이 실패하면 화면에 실패 사유를 안내하고, 안내 없이 조용히 비로그인 상태로 넘어가지 않는다 | `AuthCallBack.jsx:12-15,40-41`(`FAILURE_MESSAGE` 매핑·`.catch()` 실패 처리) |
| REQ-AUTH-10 | 동시 가입 경합 | 같은 네이버 계정으로 동시에 처음 로그인하는 경합이 나면, 진 쪽은 409로 안내하고 다시 로그인하면 정상 처리된다(고아 회원 없음) | `UserServiceImpl.java:56,66-75`(`createUserWithOAuthAccount` `DuplicateKeyException` 처리) |
| REQ-AUTH-11 | 네이버 오류 흡수 | 네이버 사용자정보 조회가 실패(HTTP 200 + 빈 값 포함)하면 502로 통일해 안내한다 | `NaverOAuthService.java:89,93-95` `parseUserInfo()` |
| REQ-AUTH-12 | 라우트 보호 | `AuthGuard`가 라우트 단위로 막는다. 비로그인 접근은 현재 경로를 `sessionStorage.redirectPath`에 저장하고 `/`로 리다이렉트(로그인 후 콜백에서 이 경로로 복귀). 로그인했지만 역할이 `allow` 목록에 없으면(예: USER가 `/admin` 진입) 동일하게 `/`로 리다이렉트한다 | `AuthGuard.jsx:11-20` |
| REQ-AUTH-13 | 로그인 안내 모달 | 로그인이 필요한 기능을 비로그인이 눌렀을 때(서랍 메뉴·홈 바로가기·화면 안 `선호`·`관리` 버튼·안내 화면의 시작 버튼) 띄우는 안내 모달은 **공용 부품 하나**(`global/ui/loginRequiredModal`, 훅 `useLoginRequiredModal`)다. 문구: 제목 "로그인이 필요해요" · 보조 "로그인하면 지금 보던 화면으로 돌아와요." · 버튼 "닫기" / "로그인". 본문은 진입 지점의 사유 키(`holdings` · `skills` · `edit`)마다 다르다 — 내 재료 보유 현황: "내 재료 보유 현황은 로그인하면 쓸 수 있어요. 보유·액자·획득일이 내 계정에 저장돼요." / 내 레전드 스킬 기록: "내 레전드 스킬 기록은 로그인하면 쓸 수 있어요. 등록한 스킬과 강화 기록이 내 계정에 저장돼요." / 편집: "로그인하면 편집할 수 있어요. 보유·삽입 기록은 로그인한 계정에 저장돼요." / 사유 없음: "로그인한 회원만 쓸 수 있는 메뉴예요. 로그인하고 이용해 보세요." 처리 방식 구분: 메뉴·버튼에서 누름 = 이 모달 / 주소로 직접 들어온 비로그인 화면(`/legend-collection-skills`·`…/:id/edit`·`/legend-collections/manage`) = 화면 안 안내 + 시작 버튼(누르면 이 모달) / 라우트 가드(REQ-AUTH-12) = 역할 제한 화면(관리자·`/home/shortcuts`·`/mypage`)에만. 로그인 버튼을 누르면 **로그인 뒤 원래 보던 화면으로 돌아온다** — 로그인 시작 때 `pathname + search + hash` 를 `sessionStorage.redirectPath` 에 저장하고 콜백이 읽어 이동한다(`/` 로 시작하지 않거나 `//` 로 시작하면 `/`) | `loginReasons.js`, `useAuthentication.js:18-19`, `AuthCallBack.jsx:35-38`, `0010` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 로그인 시작 | `GET /api/auth/naver/login` | BE가 인가 URL·`state` 생성 |
| 로그인 콜백 | `GET /api/auth/naver/callback` | `code`·`state` 선택 파라미터(실패도 리다이렉트) |
| 토큰 재발급 | `POST /api/auth/refresh` | |
| 로그아웃 | `POST /api/auth/logout` | refresh 토큰 DB 행 삭제 |
| 로그인 쿠키 | `ACCESS_TOKEN` · `REFRESH_TOKEN` · `OAUTH_STATE`(HttpOnly) | `AuthCookieFactory.java` |
| refresh 토큰 저장 | `site_refresh_tokens` | `sql/V3/CREATE_06_site_refresh_tokens.sql` |
| OAuth 계정 원본 | `site_user_oauth_accounts` | `sql/V2/CREATE_04_TABLE_SITE.sql:96-118` |
| 로그인/로그아웃 GA4 이벤트 | `pushEvent`(GA4) | `user_login`/`admin_login`/`dev_login`, `user_logout`/`admin_logout`/`dev_logout` — 환경(localhost)·권한(ADMIN/USER)별로 이벤트명이 갈린다. 전송 메커니즘은 `.claude/rules/fe/fe-analytics.md` |

⚠️ BE 코드 위치는 `domain/oauth/**`다 — 이름 계약(`domain-naming.md`)상 FE 도메인명(`authentication`)의 단수형인 `domain/authentication`이어야 하나 실제로는 `oauth`로 되어 있다. 이 문서는 실제 경로를 그대로 적었을 뿐 이름을 바꾸는 결정은 하지 않는다.

## 5. 하지 않는 것

- 만료된 refresh 토큰을 정리하는 배치 — 보존 기간·정리 주체가 안 정해져 죽은 메서드만 제거했다(`features/authentication/history.md` 2026-09-28 항목)
- `revoked_at` 컬럼 제거 — test DB = 운영 DB 동일 인스턴스라 DB 작업 승인 없이는 하지 않는다
- 관리자의 권한·상태 변경을 5분 이내로 반영하는 것(access 토큰 수명 단축안) — 절충안 권고 단계일 뿐 미확정
- 로그인 상태의 주기적 재확인 — 앱 진입 시 1회만 확인한다. 새로고침 없는 탭은 정지·만료 상태 정리가 안 돈다. 도메인 여럿에 걸친 미결 항목이라 FE 다음 라운드 과제로 이월됐다
- 주소 직접 입력을 통한 라우트 접근 차단 — 메뉴 클릭 경로만 막고 직접 입력 경로는 막지 않는다. 위와 같은 이유로 다음 라운드 과제로 이월됐다
- OAuth `state` 저장에 Redis 등 새 저장소 도입 — 로드맵상 확정 일정이 아니라 기존 쿠키 방식을 그대로 쓴다

## 6. 확인 필요

확정(2026-09-30) — refresh 토큰 하드 삭제 방식을 유지한다. `revoked_at` 컬럼 제거는 나중 성능 튜닝 때 재검토한다(급하지 않음).

❓ 관리자 권한·상태 변경 반영 지연(최대 access 토큰 수명 30분) — 절충안 B(수명 단축)가 권고로만 남아 있고 채택 여부 미정.

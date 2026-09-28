---
feature: error
version: 1.0.1
status: active
created: 2026-08-31
updated: 2026-09-28
---

# error

## 1. 무엇을 하는 기능인가

없는 주소로 들어갔을 때 보여줄 404 안내 화면과, 화면을 그리다가 예외가 나면 잡아서 "문제가 생겼습니다"로 바꿔치는 안전망(ErrorBoundary)을 담당한다. 서버 쪽 코드는 없다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 404 / 공용 에러 화면 (SC-12-01) | `*`(catch-all) + 라우터 `errorElement` | 등록되지 않은 주소로 직접 진입, 또는 라우터 자체가 실패했을 때 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ERR-01 | 404 안내 | 존재하지 않는 경로로 접근하면 404 안내 화면(홈/공지/이벤트 이동 링크 포함)이 뜬다 | `app/router/index.jsx:15,23`, `NotFoundScreen.jsx` |
| REQ-ERR-02 | 렌더 예외 격리 | 화면 렌더 중 예외가 나도 본문만 오류 처리되고 상단바·서랍·새로고침 버튼은 남는다 | `MobileLayout.jsx`, `ErrorBoundary.jsx` |
| REQ-ERR-03 | 경로별 리셋 | `ErrorBoundary`는 라우트가 바뀔 때마다(`key={pathname}`) 다시 마운트되어 에러 상태가 리셋된다 | `ErrorBoundary.jsx` 사용부(`MobileLayout.jsx`) |
| REQ-ERR-04 | 원문 비노출 | 오류 화면에 스택트레이스·원인 문구를 노출하지 않는다. 상세는 `console.error`로만 남긴다 | `NotFoundScreen.jsx`, `ErrorBoundary.jsx` |
| REQ-ERR-05 | 전체 새로고침 이동 | 404 화면의 이동 링크는 SPA 이동(`<Link>`)이 아니라 `<a href>`다 — 라우터 자체가 깨진 상황을 가정한 방어 | `NotFoundScreen.jsx` |
| REQ-ERR-06 | 서버 404 | 존재하지 않는 API 주소를 호출하면 500이 아니라 404로 응답한다 | `GlobalExceptionHandler.java`(`NoResourceFoundException` 핸들러), `docs/decisions/0008-exception-status-mapping.md` |

## 4. 데이터

이 도메인은 서버 API가 없다. REQ-ERR-06의 404 분리는 전역 공통 코드(`common/support/advice/GlobalExceptionHandler.java`)에 있으며, 그 밖의 400/405/415/업로드 오류 분리는 이 기능 범위가 아니다 — `docs/decisions/0008-exception-status-mapping.md` 참고.

## 5. 하지 않는 것

- `ErrorBoundary`가 상단바·서랍·Footer까지 감싸는 것 — 감싸면 예외가 나도 새로고침 버튼까지 함께 사라질 수 있어 의도적으로 본문(`Outlet`)만 감싼다
- 404·오류 화면에 광고를 배치하는 것 — "로그인·콜백·오류 화면에 광고 금지" 규칙과 일치(`fe-ads.md` § 2)
- 404 화면 이동 링크를 SPA 네비게이션(`<Link>`)으로 바꾸는 것 — 라우터가 깨진 상황을 가정한 의도된 방어라 바꾸면 회귀가 생긴다

## 6. 확인 필요

없음.

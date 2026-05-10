# AppLayout — Endpoint Spec (Draft)

> 작성일: 2026-05-11
> 모드: reverse
> ⚠️ **본 문서는 Draft** — 확정 X. AppLayout 글로벌 layer 는 직접 endpoint 호출 X. FE 글로벌 layer 가 의존하는 BE endpoint 매핑만 짧게 정리.
> BE 합의 후 promote 시 `endpoint-spec.md` 로 rename.

---

## 0. 본 문서의 의미

AppLayout 글로벌 layer 자체는 endpoint 호출이 **거의 없음**. 단:
- `AuthProvider` mount 시 1회 health-check (`requestUserHealthCheck` thunk)
- `useAuthentication.logout()` → 로그아웃 API
- 401 응답 시 자동 refresh interceptor

본 문서는 위 3개 endpoint 와 글로벌 layer 의 hookup 만 명세.

도메인별 endpoint (coupons / events / notices / historyMode) 는 각 도메인 PRD 참조.

---

## 1. 글로벌 layer 가 트리거하는 endpoint

| API | Method | Path | 트리거 | 응답 처리 |
|---|---|---|---|---|
| Health Check | GET | `/api/auth/me` (🟨 추정) | App mount 시 `AuthProvider` useEffect | success → `state.auth.setUser({userDetail, useRole})` / 실패 → catch → `setUserProperties('GUEST')` |
| Token Refresh | POST | `/api/auth/refresh` (🟨 추정) | axios interceptor 가 401 응답 시 1회 자동 호출 | success → 원 요청 retry / 실패 → `data: null` 반환 (guest fallback) |
| Logout | POST | `/api/auth/logout` (🟨 추정) | `useAuthentication.logout()` 호출 (TopBar 로그아웃 / 임의 위치) | success → `clearUser()` reducer + `window.location.replace("/")` |

🟨 **가정**: 위 path 는 코드 cross-check 필요 — `infra/http/` 와 `domains/authentication/store/thunks.js` 의 실제 URL 확인 후 확정.

🔴 **권한 / auth 분야** — BE Spring Security / SessionFilter 와 정합 필요. 본 PRD 결정 사안 X. 기존 운영 cite 만.

---

## 2. 외부 시스템 통합 endpoint (cite)

| 통합 | Method | Path | 트리거 |
|---|---|---|---|
| 네이버 OAuth Authorize | GET | `https://nid.naver.com/oauth2.0/authorize?...` | `useAuthentication.login()` → `window.location.href` |
| 네이버 OAuth Callback | (redirect) | `/auth/callback?code=...&state=...` | 네이버 → FE 콜백 |
| GA4 page view | (gtag) | `gtag('event', 'page_view', {...})` | `useGA4PageView` (라우트 변경마다) |

🔴 **외부 통합** — 본 PRD 결정 사안 X. 기존 운영 cite 만.

---

## 3. HTTP client 정책 (글로벌 — `infra/http/client.js` cite)

| 항목 | 정책 | 비고 |
|---|---|---|
| `withCredentials` | `true` (모든 요청) | cookie 자동 전송 |
| 401 interceptor | `/api/auth/refresh` 1회 시도 → 성공 retry / 실패 `data: null` | guest fallback |
| 응답 envelope | 🟨 추정: `{success, data, message}` 추정 — BE 확인 필요 | thunk 가 `lastOperation` 설정 시 사용 |
| 에러 envelope | 🟨 추정: `{success: false, message, code?}` | 글로벌 ResponseModal 메시지 |

---

## 4. AppLayout 이 호출하지 않는 endpoint (책임 분리)

> 도메인 페이지가 호출. AppLayout 글로벌 layer 는 무관.

- 쿠폰 list / 발급 — coupons 도메인 PRD
- 이벤트 list — events 도메인 PRD
- 공지사항 list / detail — notices 도메인 PRD
- 히스토리모드 list — historyMode 도메인 PRD
- 퀴즈 (홈 QuizSection 에서만 사용) — home 도메인 PRD (또는 quiz 도메인 별도)

---

## 5. 사용자 확인 필요 항목

1. 🟨 **endpoint path 확정** — `/api/auth/me` / `/api/auth/refresh` / `/api/auth/logout` 실제 URL BE 확인 (코드 cross-check)
2. 🟨 **응답 envelope shape** — `{success, data, message}` 가정. BE Swagger 정합 검증
3. 🔴 **신규 endpoint 추가** — 본 PRD 결정 사안 X. 도입 시 HITL
4. 🔴 **권한 헤더 / SessionFilter 변경** — 본 PRD 결정 사안 X. 도입 시 HITL

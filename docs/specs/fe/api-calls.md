# FE → BE API 호출 표

> 분석 시점: v2.0.0-refactor-mobile (2026-05-09 이후 정리 상태)
> baseURL: `import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"` (`web/src/infra/http/client.js:3`)
> 인증: `withCredentials: true` (쿠키 기반), 401 응답은 `{ data: null }` 으로 swallow (`client.js:27-29`)
> 호출 패턴: `endpoints.js` (path 상수) → `api.js` (axios fetcher) → `thunks.js` (redux thunk) → 도메인 hook (dispatch) → Screen 의 4단계
> **Admin 영역**: 라우트 전부 비활성 (Admin: TBD — 기획 대기). store/api 코드는 보존 (재기획 후 재구현)

## 표기 규칙
- **METHOD / PATH** 는 `endpoints.js` 의 상수 그대로 (BE 측 실제 매핑은 미검증)
- **호출 hook·service** = `dispatch(thunk)` 가 일어나는 위치
- **트리거 화면** = 라우트 또는 부모 컴포넌트
- **Live?** = 현재 운영 라우트로 진입 가능한지

---

## Public (활성 — BE 연결됨)

| METHOD | PATH | 호출 fetcher | thunk | hook | 트리거 화면 | Live? | 요청 shape | 응답 기대 shape |
|---|---|---|---|---|---|---|---|---|
| GET | `/users/me` | `fetchHealthCheck` (`web/src/domains/authentication/store/api.js:7`) | `requestUserHealthCheck` (`thunks.js:6`) | `AuthProvider` 직접 dispatch (`web/src/app/provider/AuthProvider.jsx:11`), `AuthCallback` (`web/src/domains/authentication/callback/AuthCallBack.jsx:11`) | 모든 라우트 (앱 부팅), `/auth/callback` | OK | (none) | `{ userRole, ...userDetail }` |
| POST | `/auth/logout` | `fetchLogout` (`api.js:12`) | `requestUserLogout` (`thunks.js:21`) | `useAuthentication.logout` (`web/src/domains/authentication/hooks/useAuthentication.js:30`) | TopBar 로그아웃 버튼 (`web/src/app/wrapper/mobile/parts/TopBar.jsx:44`) | OK | (none) | (none) |
| GET | `/notices` | `fetchGetNotices` (`web/src/domains/notices/store/public/api.js:4`) | `requestGetNoticeList` (`thunks.js:5`) | `useNoticeList` (`web/src/domains/notices/mobile/hooks/useNoticeList.js`), `useNoticeDetail` (`useNoticeDetail.js`) | `/notices`, `/notice/:id`, `/` (HomeScreen NoticeSection) | OK | (none) | `{ data: [{ id, title, summary, source: "INTERNAL"\|"OFFICIAL", isVisible, isPinned, publishedAt, ... }] }` (thunk 가 source 기준으로 `{ siteNotices, officialNotices }` 분리) |
| GET | `/coupons` | `fetchGetUserCoupon` (`web/src/domains/coupons/store/public/api.js:4`) | `requestGetUserCouponList` (`thunks.js:5`) | `useCouponList` (`web/src/domains/coupons/mobile/hooks/useCouponList.js`) | `/coupons`, `/` (HomeScreen 최신쿠폰) | OK | (none) | `{ data: [{ id, visible, expireAt, ... }] }` |
| GET | `/events/external` | `fetchGetUserExternalEvent` (`web/src/domains/events/store/public/api.js:4`) | `requestGetExternalEventList` (`thunks.js:5`) | `useEventList` (`web/src/domains/events/mobile/hooks/useEventList.js`) | `/events`, `/` (HomeScreen 진행 중 이벤트) | OK | (none) | `{ data: [{ id, visible, expireAt, eventType, externalLink, imageUrl, startAt, ... }] }` |
| GET | `/quiz/latest` | `fetchLatestQuizAnswer` (`web/src/domains/quiz/store/public/api.js:4`) | `requestLatestQuizAnswer` (`thunks.js:4`) | `HomeScreen` 직접 dispatch (`web/src/domains/home/components/HomeScreen.jsx:44`) | `/` (HomeScreen QuizSection) | OK | (none) | `{ data: { round, title, imageUrl, ... } \| null }` |

---

## Admin (TBD — 기획 대기, 라우트 비활성)

> **Admin: TBD (기획 대기)** — 코드/store 는 보존. UI 신규 기획 후 `domains/{domain}/feature/admin/` 패턴으로 재구현 예정. (`docs/prd/domains/admin.md` TODO)
> 모든 admin thunk 는 `payload.options` 를 반환 → `operationListener` (admin role 일 때만 trigger) → `ResponseModal` 출력
> 본 표는 **현재 코드에 살아있는 admin endpoint 목록** (라우트 진입은 모두 주석)

### Notices (admin)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/admin/notices` | `fetchAdminGetNoticeList` (`web/src/domains/notices/store/admin/api.js:4`) | `requestAdminGetNoticeList` (`thunks.js:10`) |
| POST | `/admin/notices` | `fetchAdminInsertNotice` (`api.js:5`) | `requestAdminInsertNotice` (`thunks.js:22`) |
| PATCH | `/admin/notices` | `fetchAdminUpdateNotice` (`api.js:6`) | `requestAdminUpdateNotice` (`thunks.js:34`) |
| PATCH | `/admin/notices/visible` | `fetchAdminUpdateVisible` (`api.js:7`) | `requestAdminUpdateNoticeVisible` (`thunks.js:46`) |

### Coupons (admin)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/admin/coupons` | `fetchAdminCouponList` (`web/src/domains/coupons/store/admin/api.js:8`) | `requestGetAdminCouponList` (`thunks.js:9`) |
| POST | `/admin/coupons` | `fetchAdminInsertCoupon` (`api.js:12`) | `requestAdminInsertNewCoupon` (`thunks.js:21`) |
| PATCH | `/admin/coupons/{id}` | `fetchAdminUpdateCoupon` (`api.js:16`) | `requestAdminUpdateCoupon` (`thunks.js:37`) |
| PATCH | `/admin/coupons/{id}/visible` | `fetchAdminUpdateVisible` (`api.js:20`) | `requestAdminUpdateCouponVisible` (`thunks.js:53`) |

### Events (admin)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/admin/events/external` | `fetchAdminExEventList` (`web/src/domains/events/store/admin/api.js:8`) | `requestAdminGetExEventList` (`thunks.js:11`) |
| POST | `/admin/events` | `fetchAdminInsertExEvent` (`api.js:13`) | `requestAdminInsertNewExEvent` (`thunks.js:23`) (uses `baseEventDTO` from `events/store/dto.js`) |
| PATCH | `/admin/events/{id}` | `fetchAdminUpdateExEvent` (`api.js:17`) | `requestAdminUpdateExEvent` (`thunks.js:38`) |
| PATCH | `/admin/events/{id}/visible` | `fetchAdminUpdateExVisible` (`api.js:21`) | `requestAdminUpdateExEventVisible` (`thunks.js:53`) |
| POST | `/upload/events` | `fetchUploadEventImageFile` (`api.js:25`, deprecated — uses `/upload/events`) | `requestAdminUploadEventImage` wrapper (`thunks.js:67`, delegates to `requestUploadImage`) |

### Quiz (admin)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/admin/quiz` | `fetchAdminQuizAll` (`web/src/domains/quiz/store/admin/api.js:4`) | `requestAdminQuizAll` (`thunks.js:11`) |
| POST | `/admin/quiz` | `fetchAdminQuizCreate` (`api.js:9`) | `requestAdminQuizCreate` (`thunks.js:23`) (uses `baseQuizAnswerDTO` from `quiz/store/dto.js`) |
| PATCH | `/admin/quiz/{id}` | `fetchAdminQuizUpdate` (`api.js:14`) | `requestAdminQuizUpdate` (`thunks.js:35`) |
| POST | `/upload/events` | (via `requestUploadImage`) | `requestAdminUploadQuizImage` wrapper (`thunks.js:47`, directory: `"events"`) |

### Upload (infra — admin form 용)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| POST | `/upload/{directory}` | `fetchAdminUploadImageFile` (`web/src/infra/api/uploads/api.js:3`) | `requestUploadImage` (`thunks.js:5`) — events/quiz admin wrapper 가 호출 |

---

## community (전체 — IA 재개 대기)

> community reducer 는 store 에 등록 안 됨 (`store.js:17-18` 주석). thunk 는 코드로 잔존하지만 운영 호출 없음.

### community admin (legacy admin UI 폐기 후 잔존)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/community/admin/boards` | `fetchGetAllBoardLists` (`web/src/domains/community/store/api.js:8`) | `requestGetAllBoardLists` (`thunks/boardThunks.js:8`) |
| POST | `/community/admin/boards` | `fetchInsertNewBoard` (`api.js:13`) | `requestInsertNewBoard` (`boardThunks.js:20`) |
| PATCH | `/community/admin/boards/{id}` | `fetchUpdateBoard` (`api.js:18`) | `requestUpdateNewBoard` (`boardThunks.js:35`) |
| GET | `/community/admin/posts` | `fetchGetAllPostLists` (`api.js:24`) | `requestGetAllPostLists` (`thunks/postThunks.js`) |
| POST | `/community/admin/posts` | `fetchInsertNewPost` (`api.js:29`) | `requestInsertNewPost` (`postThunks.js`) |
| PATCH | `/community/admin/posts/{id}` | `fetchUpdatePost` (`api.js:34`) | `requestUpdateNewPost` (`postThunks.js`) |
| GET | `/community/admin/tags` | `fetchGetAllTags` (`api.js:39`) | `requestGetAllTagLists` (`thunks/tagThunks.js`) |
| POST | `/community/admin/tags` | `fetchInsertNewTag` (`api.js:44`) | `requestInsertNewTag` (`tagThunks.js`) |
| PATCH | `/community/admin/tags/{id}` | `fetchUpdateTag` (`api.js:49`) | `requestUpdateNewTag` (`tagThunks.js`) |

### community user (legacy PC 잔존, 라우트 비활성)

| METHOD | PATH | 호출 fetcher | thunk |
|---|---|---|---|
| GET | `/community/boards` | `fetchGetUserBoardLists` (`api.js:58`) | `requestGetUserBoardLists` (`thunks/userThunks.js:5`) |
| GET | `/community/board/{boardId}/posts` | `fetchGetUserPostListsByBoardId` (`api.js:63`) | `requestGetUserPostListsByBoardId` (`userThunks.js:17`) |

> 모바일 `CommunityScreen` / `CategoryScreen` 은 위 thunk 미사용 (mock-only, `data/community/*.js` 직접 import)

---

## 핵심 관찰

1. **HomeScreen BE 연결 완료**: notices / coupons / events / quiz 4개 섹션 모두 BE 연결. community 인기글/자유게시판 섹션은 주석 처리 (community 정리 보류).
2. **community 모바일 화면 = mock-only**: `useCommunity` / `useCategoryFeed` 둘 다 `@/data/community/*` 만 import, redux 분리. `useCategoryFeed.js:8` 의 `SOURCE_MAP` 이 추후 BE 연동 단일 분기 지점.
3. **historyMode 화면 = mock-only**: `domains/historyMode/config/MOCK_HISTORY_*.js` 정적 import. BE 연동 thunk 자체 없음 (도메인 store 부재).
4. **admin endpoint 코드 보존, 라우트 비활성**: notices/coupons/events/quiz/community admin thunk + api 모두 살아있음. UI 신규 기획 후 `domains/{domain}/feature/admin/` 패턴으로 재구현 예정. → 본 표의 Admin 행은 모두 **TBD (기획 대기)**.
5. **legacy 도메인 (dictionary / simulate / kbo / playerCard) endpoint 전부 제거됨**: 도메인 폴더 자체가 `domains/` 에서 사라짐. 잔존 mock 은 `data/skill/*.js` 만 (사용처 없음).
6. **GA4 axios interceptor 통합 없음**: `infra/http/client.js` 의 interceptor 는 헤더 보정 + 401 swallow 만. GA4 호출은 컴포넌트/hook 에서 직접 (예: `NoticeDetailScreen.jsx:18` 의 `pushEvent('page_view', ...)`).

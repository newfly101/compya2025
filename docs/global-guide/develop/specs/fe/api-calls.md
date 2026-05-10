# API 호출 카탈로그 (FE → BE)

> baseline: `web/src/**` 의 `endpoints.js` / `api.js` / `thunks.js` 실측
> 목적: store thunk → BE endpoint 매핑을 도메인별 표로 단일 참조. 신규 도메인 추가 시 endpoint 충돌 / 중복 식별
> 짝 spec: BE `docs/specs/be/endpoints.md` (BE controller 매핑 — ❓ 동기화 책임 별도)

---

## 1. http client (단일 진입점)

`web/src/infra/http/client.js` — axios instance.

| 항목 | 값 |
|---|---|
| baseURL | `API_BASE_URL` (`config/env.js`) |
| Content-Type | `application/json` (기본). multipart 는 호출처에서 override |
| timeout | 30000 ms |
| withCredentials | `true` (쿠키 기반 세션 — refresh token 쿠키 유지) |

**request interceptor** — 모든 요청에 헤더 추가:

| 헤더 | 값 |
|---|---|
| `X-Page-Path` | `window.location.pathname` |
| `X-Referrer` | `document.referrer || "-"` |
| `X-Page-Url` | `window.location.href` |

**response interceptor — 401 refresh 재시도**:

```text
response 401
  ├─ url 이 /api/auth/refresh / /api/auth/logout → retry 안 함, 401 인 경우 { data: null } 반환
  ├─ original._retried === true → retry 안 함, 401 인 경우 { data: null } 반환
  └─ otherwise:
      ├─ refreshing promise 없으면 API.post("/api/auth/refresh") 호출 (싱글톤)
      ├─ await refreshing
      ├─ 성공 → API(original) 재호출
      └─ 실패 → Promise.resolve({ data: null })
```

> 동시 다발 401 발생 시 refresh 호출은 1번만 수행 (`refreshing` 모듈 변수 게이트)
> 401 → `Promise.resolve({ data: null })` 정책으로 미인증 상태에서 화면이 axios reject 없이 빈 데이터 처리. 단 비-401 에러는 reject 그대로

---

## 2. config/env.js

| 상수 | 빌드 분기 | 용도 |
|---|---|---|
| `API_BASE_URL` | PROD: `https://api.compyafun.com/api`, dev: `http://localhost:8080/api` | http client baseURL |
| `COUPON_BASE_URL` | 환경 무관: `http://withhive.me/399` | CouponCard 외부 링크 base (`${COUPON_BASE_URL}/${couponCode}`) |

> dev 분기 키는 `import.meta.env.PROD` (Vite 빌드타임). `.env` 파일 폐기

---

## 3. authentication

`domains/authentication/store/{api,endpoints,thunks,slices}.js` (public/admin 분리 X)

| thunk (action type) | api | method + path | hook 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestUserHealthCheck` (`/users/me`) | `fetchHealthCheck` | GET `/users/me` | `AuthProvider`(부트), `AuthCallback`(OAuth 후) | 응답 `{ userRole, ...userDetail }` → `setUser` reducer dispatch + `state.auth.initialized = true` |
| `requestUserLogout` (`/auth/logout`) | `fetchLogout` | POST `/auth/logout` | `useAuthentication.logout` | extraReducer fulfilled/rejected 모두 user/userRole=null + initialized=true |

**OAuth 외부 redirect** (BE 로 직접 이동 — axios 호출 아님):

```text
useAuthentication.login()
  → window.location.href = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=Ltp6btmLGcZZGgCIxYqv&redirect_uri=<REDIRECT_URI>&state=<crypto.randomUUID>"
```

| REDIRECT_URI | 분기 |
|---|---|
| `http://localhost:8080/api/auth/naver/callback` | hostname === "localhost" |
| `https://api.compyafun.com/api/auth/naver/callback` | otherwise |

> NAVER 가 BE callback 으로 redirect → BE 가 SPA `/auth/callback` 으로 redirect → `AuthCallback` 컴포넌트가 `requestUserHealthCheck` 후 `sessionStorage[redirectPath]` 복귀

> ⚠ NAVER_CLIENT_ID 가 hook 코드에 hardcode (`useAuthentication.js:7`). publishable key 라 보안 이슈는 없으나 env 로 빼는 것 권고

---

## 4. coupons

`domains/coupons/store/{public,admin,slices}.js`

### 4.1 public

| thunk (action type) | api | method + path | hook 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestGetUserCouponList` (`GET/coupons/list`) | `fetchGetUserCoupon` | GET `/coupons` | `useCouponList`(`useEffect` 마운트) | `data.filter(visible).sort(b.id - a.id)` → `state.coupon.coupons` |

> 응답 shape: `{ data: [coupon...] }` — thunk 가 `const { data } = await fetchGetUserCoupon()` 형태로 unwrap

### 4.2 admin

| thunk (action type) | api | method + path | dispatch 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestGetAdminCouponList` (`GET/admin/coupons/list`) | `fetchAdminCouponList` | GET `/admin/coupons` | (없음 — admin UI 폐기) | items 정렬 후 `coupons` 덮어쓰기 |
| `requestAdminInsertNewCoupon` (`POST/admin/coupons`) | `fetchAdminInsertCoupon` | POST `/admin/coupons` | (없음) | `coupons.unshift(payload)` |
| `requestAdminUpdateCoupon` (`PATCH/admin/coupons/update`) | `fetchAdminUpdateCoupon(id, body)` | PATCH `/admin/coupons/{id}` | (없음) | findIndex 후 merge |
| `requestAdminUpdateCouponVisible` (`PATCH/admin/coupons/updateVisible`) | `fetchAdminUpdateVisible(id, visible)` | PATCH `/admin/coupons/{id}/visible` | (없음) | map 후 visible 갱신 |

> admin thunk 는 모두 dispatch 호출처 0건. admin UI 신규 기획 후 재연결 예정 (코드는 보존)

---

## 5. events

`domains/events/store/{public,admin,slices,dto}.js`

### 5.1 public

| thunk (action type) | api | method + path | hook 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestGetExternalEventList` (`GET/events/external/list`) | `fetchGetUserExternalEvent` | GET `/events/external` | `useEventList` | `data.filter(visible).sort(b.id - a.id)` → `state.events.events` |

### 5.2 admin

| thunk (action type) | api | method + path | dispatch 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestAdminGetExEventList` (`GET/admin/events/external/list`) | `fetchAdminExEventList` | GET `/admin/events/external` | (없음) | `[...items].reverse()` → events |
| `requestAdminInsertNewExEvent` (`POST/admin/events`) | `fetchAdminInsertExEvent(baseEventDTO(form))` | POST `/admin/events` | (없음) | `events.unshift` |
| `requestAdminUpdateExEvent` (`PATCH/admin/events/update`) | `fetchAdminUpdateExEvent(id, baseEventDTO)` | PATCH `/admin/events/{id}` | (없음) | findIndex merge |
| `requestAdminUpdateExEventVisible` (`PATCH/admin/events/updateVisible`) | `fetchAdminUpdateExVisible(id, visible)` | PATCH `/admin/events/{id}/visible` | (없음) | map visible |
| `requestAdminUploadEventImage` (래핑) | `requestUploadImage({ file, directory:"events" })` | POST `/upload/events` (multipart) | (없음) | `state.upload.imageUrl` |

> `baseEventDTO` 는 form payload 정제 (title/eventType/startAt/expireAt/imageUrl/externalLink/visible 만 추출)

---

## 6. notices

`domains/notices/store/{public,admin,slices}.js`

### 6.1 public

| thunk (action type) | api | method + path | hook 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestGetNoticeList` (`GET/notices/list`) | `fetchGetNotices` | GET `/notices` | `useNoticeList`, `useNoticeDetail`(siteNotices 비어있으면), `NoticeSection`(home → useNoticeList) | `data.filter(isVisible)` → `source` 기준 INTERNAL/OFFICIAL 분리, 각각 id desc 정렬 → `state.notices.{siteNotices, officialNotices}` |

> response shape: `{ data: [notice...] }` — thunk 가 `const { data }` unwrap. `notice.source` 는 `"INTERNAL" | "OFFICIAL"` 두 값
> `useNoticeList` 가 `featured = first(isPinned) ?? siteNotices[0]` + `listed = filter(!== featured).slice(0,3)` + `listedOfficials = officialNotices.slice(0,3)` 가공

### 6.2 admin

| thunk (action type) | api | method + path | dispatch 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestAdminGetNoticeList` (`GET/admin/notices/list`) | `fetchAdminGetNoticeList` | GET `/admin/notices` | (없음) | reverse 후 siteNotices 덮어쓰기 |
| `requestAdminInsertNotice` (`POST/admin/notices/insert`) | `fetchAdminInsertNotice(notice)` | POST `/admin/notices` | (없음) | `siteNotices.unshift({id, ...notice})` |
| `requestAdminUpdateNotice` (`PATCH/admin/notices/update`) | `fetchAdminUpdateNotice(notice)` | PATCH `/admin/notices` | (없음) | findIndex merge |
| `requestAdminUpdateNoticeVisible` (`PATCH/admin/notices/visible`) | `fetchAdminUpdateVisible({id, visible})` | PATCH `/admin/notices/visible` | (없음) | map isVisible |

> ❓ admin 의 update path 가 `/admin/notices` (id 없음 — body 에 id 포함). public API 의 detail/visible API 는 path 에 id 가 들어감. BE controller 와 동기화 확인 필요

---

## 7. quiz

`domains/quiz/store/{public,admin,slices,dto}.js`

### 7.1 public

| thunk (action type) | api | method + path | hook 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestLatestQuizAnswer` (`GET/quiz/latest`) | `fetchLatestQuizAnswer` | GET `/quiz/latest` | `HomeScreen`(useEffect) | `state.quiz.latest = data ?? null` |

> 최신 1건만 조회. `data` 가 null 이면 null 저장. 응답 shape: `{ data: { round, imageUrl, title?, ... } | null }`

### 7.2 admin

| thunk (action type) | api | method + path | dispatch 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestAdminQuizAll` (`GET/admin/quiz`) | `fetchAdminQuizAll` | GET `/admin/quiz` | (없음) | items → quizAnswers |
| `requestAdminQuizCreate` (`POST/admin/quiz`) | `fetchAdminQuizCreate(baseQuizAnswerDTO)` | POST `/admin/quiz` | (없음) | unshift |
| `requestAdminQuizUpdate` (`PATCH/admin/quiz/update`) | `fetchAdminQuizUpdate(id, dto)` | PATCH `/admin/quiz/{id}` | (없음) | findIndex merge |
| `requestAdminUploadQuizImage` (래핑) | `requestUploadImage({ file, directory:"events" })` | POST `/upload/events` (multipart) | (없음) | `state.upload.imageUrl` |

> admin endpoints 에 `DELETE: (id) => /admin/quiz/{id}` 정의되나 thunk/api 미작성 — placeholder
> ⚠ quiz 이미지 업로드 directory 가 `"events"` 로 잘못 박힘 (events 도메인과 동일 path). `"quiz"` 로 변경 권고 (현재 dispatch 0건이라 운영 영향 0)

---

## 8. uploads (infra)

`infra/api/uploads/{api,endpoints,thunks,slices}.js` — 도메인 횡단 멀티파트 업로드

| thunk (action type) | api | method + path | dispatch 호출처 | slice 영향 |
|---|---|---|---|---|
| `requestUploadImage` (`/upload/{domain}`) | `fetchAdminUploadImageFile(formData, path)` | POST `/upload/{directory}` (multipart) | events / quiz 가 wrap (`requestAdminUploadEventImage`, `requestAdminUploadQuizImage`) — admin UI 폐기로 dispatch 0 | `state.upload.imageUrl = data` |

> path 는 `/upload/${directory}` runtime 조립 (endpoints.IMAGES literal `"/upload/{domain}"` 은 thunk type identifier 로만 사용). 실 path 는 thunk 안에서 `"/upload/events"` 등으로 만들어 axios 에 전달

---

## 9. community (라우트 미등록 — dead chain)

`domains/community/store/{api, endpoints, thunks/, slices, dto, index}.js` — store.js 미등록 (`reducer:` 에 없음). dispatch 해도 state 변경 0.

### 9.1 admin endpoints

| group | thunk | method + path | 호출처 | 비고 |
|---|---|---|---|---|
| boards | `requestGetAllBoardLists` | GET `/community/admin/boards` | `useBoards`(admin UI 폐기) | dead |
| boards | `requestInsertNewBoard` | POST `/community/admin/boards` | `useBoardCreate`(admin UI 폐기) | dead |
| boards | `requestUpdateNewBoard` | PATCH `/community/admin/boards/{id}` | `useBoardEdit`(admin UI 폐기) | dead |
| posts | `requestGetAllPostLists` | GET `/community/admin/posts` | `usePosts`(admin UI 폐기) | dead |
| posts | `requestInsertNewPost` | POST `/community/admin/posts` | `usePostCreate`(admin UI 폐기) | dead |
| posts | `requestUpdateNewPost` | PATCH `/community/admin/posts/{id}` | `usePostEdit`(admin UI 폐기) | dead |
| tags | `requestGetAllTagLists` | GET `/community/admin/tags` | `useTag`(admin UI 폐기) | dead |
| tags | `requestInsertNewTag` | POST `/community/admin/tags` | `useTagCreate`(admin UI 폐기) | dead |
| tags | `requestUpdateNewTag` | PATCH `/community/admin/tags/{id}` | `useTagEdit`(admin UI 폐기) | dead |

### 9.2 user endpoints

| thunk | method + path | 호출처 | 비고 |
|---|---|---|---|
| `requestGetUserBoardLists` | GET `/community/boards` | `useUserBoards`(라우트 미등록) | dead |
| `requestGetUserPostListsByBoardId` | GET `/community/board/{boardId}/posts` | `useUserPost`(라우트 미등록) | dead |

> mobile community `useCommunity` / `useCategoryFeed` 는 axios 호출 0건 — `data/community/{categories,notices,hotPosts,posts}.js` 정적 mock 만 사용. BE 통합 시 user thunk 사용 계획

---

## 10. 도메인별 endpoint 충돌 / 패턴

### 10.1 path 패턴 일관성

| 패턴 | 사용 도메인 |
|---|---|
| public 단순 list `GET /{domain}` | coupons, notices |
| public 단순 list `GET /{domain}/external` | events |
| public 최신 `GET /{domain}/latest` | quiz |
| admin list `GET /admin/{domain}` | coupons, events, notices, quiz |
| admin create `POST /admin/{domain}` | coupons, events, notices, quiz |
| admin update by id `PATCH /admin/{domain}/{id}` | coupons, events, quiz, community |
| admin update no-id (body id) `PATCH /admin/{domain}` | notices ★ 이질 |
| admin visible `PATCH /admin/{domain}/{id}/visible` | coupons, events |
| admin visible no-id `PATCH /admin/{domain}/visible` | notices ★ 이질 |
| auth `POST /auth/refresh`, `POST /auth/logout`, `GET /users/me` | authentication (프리픽스 `/auth`, `/users` 두 갈래) |

> notices admin update / visible 만 path 에 id 안 들어감. BE controller 측 패턴 동기화 ❓ 확인 필요

### 10.2 응답 shape 패턴

| 패턴 | 사용처 |
|---|---|
| `{ data: ... }` | coupons public, events public, notices public, quiz public — thunk 안 `const { data } = await fetchX()` |
| `{ items: [...] }` | coupons admin, events admin, quiz admin, community admin — thunk 안 `const { items } = await fetchX()` |
| 직접 객체 | notices admin (data.id 만 사용), uploads (data 가 imageUrl 문자열) |

### 10.3 page 헤더

모든 요청에 `X-Page-Path` / `X-Referrer` / `X-Page-Url` 자동 첨부 — BE 가 page-context 분석 가능. 헤더 변경 시 `infra/http/client.js` 수정

---

## 11. 신규 endpoint 추가 체크리스트

1. **endpoints.js 추가**: `XXX = { GET_FOO: "/api/path" }` + `XXX_ACTIONS = { GET: "GET/path" }` 두 set. ACTIONS key 는 thunk type identifier (devtools 식별)
2. **api.js 추가**: `import { API }` → `const { data } = await API.get(XXX.GET_FOO)` → `return data`. multipart 만 별도 (`requestUploadImage` 사용)
3. **thunks.js 추가**: `createAsyncThunk(XXX_ACTIONS.GET, async (arg, { rejectWithValue }) => { try { ... } catch (e) { return rejectWithValue(e.message); } })` 표준
4. **slices.js 등록**: `applyAsyncHandlers(builder, thunk, (state, action) => { state.X = action.payload; })`
5. **store.js 등록**: `reducer: { x: xReducer, ... }` 에 추가 (community 케이스 회피)
6. **hook 추가**: `domains/{name}/mobile/hooks/use{Name}.js` 에서 `useEffect(() => dispatch(thunk()))` + `useSelector(state => state.x)` + 가공
7. **운영 모달 (admin)**: thunk payload return 에 `options: { success: true, message: "...", kind, scope }` 포함하면 admin 에 자동 ResponseModal 노출 (operationListener middleware)
8. **연관 BE 동기화**: BE controller path 추가 / 응답 shape 일치 확인. BE spec `docs/specs/be/endpoints.md` 와 cross-check 권장

# admin 등록/수정 배관 전수 검증 (read-only)

검증일 2026-09-09 · 브랜치 `v2.0.0-refactor-mobile` · 코드 정적 분석만 (빌드/런타임 미실행)

---

## 1. 공지 등록 실패 — 원인 판정

### 결론

공지 글쓰기(등록) 경로는 **라우트 → TopBar 버튼 → thunk → api → BE 컨트롤러 → DTO → mapper → DB 제약**까지 전 구간을 코드로 추적한 결과, 코드만으로 재현 가능한 "클릭해도 요청 자체가 안 나가는" 버그는 **찾지 못했다.** 오히려 6개 admin 도메인 중 공지 글쓰기 화면이 가장 방어적으로 짜여 있다(검증 → payload 정리 → `.unwrap()` → 에러 표시).

| 구간 | 근거 파일:줄 | 판정 |
|---|---|---|
| 라우트가 MobileLayout(TopBarProvider) 안쪽인가 | `web/src/app/wrapper/AppWrapper.jsx:11` → `MobileLayout` 이 모든 라우트의 공통 부모, `AdminRoutes.jsx:23-24` 가 그 자식 | 정상 |
| 같은 화면에서 다른 컴포넌트가 TopBar 를 덮어쓰는가 | `AdminNoticeWriteScreen.jsx` 는 셸(`AdminShellScreen`) 밖 **독립 라우트** — 같은 트리에 다른 `useSetTopBar` 호출자가 없음 | 배제 |
| 등록 버튼 onClick → 최신 핸들러 참조 | `AdminNoticeWriteScreen.jsx:104-158` — `handleSaveRef.current()` 패턴으로 stale closure 회피 | 정상 |
| thunk → api 경로/메서드 | `store/admin/thunks.js:39-49`, `store/admin/api.js:8` → `POST /admin/notices` | 정상 |
| BE 매핑 | `AdminNoticeController.java:45-52` → `@PostMapping` `/api/admin/notices` (context-path 없음, `API_BASE_URL` 이 `/api` 포함 — 일치) | 정상 |
| DTO 필드명 | `NoticeRequest` record(`title,summary,content,externalUrl,imageUrl,isVisible,isPinned,publishedAt`) vs FE payload(`title,content,externalUrl,imageUrl,source,isVisible,isPinned`) — **record 라 Lombok is-프리픽스 문제 자체가 없음**(accessor 가 필드명과 동일) | 정상 |
| CHECK 제약 미러링 | FE(`AdminNoticeWriteScreen.jsx:122-126`)와 BE(`AdminNoticeServiceImpl.java:218-240`)가 `chk_site_notices_source_payload`(`sql/V2/site/CREATE_TABLE_SITE.sql:31-36`)를 동일하게 미러링 | 정상 |
| slug/발행일 컬럼 잔존 여부 | 855279b 에서 추가된 `slug` 는 37a5716 에서 코드·마이그레이션 SQL 모두 되돌림. 마이그레이션은 애초에 "실행하지 않았다"(`sql/migration/ADD_SITE_NOTICES_SLUG.sql` 은 해당 커밋에서 파일째 삭제, `FIX_SITE_NOTICES_PUBLISHED_AT.sql` 도 "실행하지 말 것" 주석) | 현재 mapper·엔티티 모두 slug 참조 없음 — 배제 |
| Security | `SecurityConfig.java:62` `/api/admin/**` → `hasRole('ADMIN')`, FE `AuthGuard`(`AdminRoutes.jsx:15`, `AuthGuard.jsx`)가 비-ADMIN 을 이미 라우트 진입 전에 리다이렉트 — 화면이 보인다면 role 은 이미 통과된 상태 | 정상(화면 도달 = 이미 ADMIN) |

### 유력 후보 (코드 결함이지만 "요청 안 나감"보다는 "실패가 이상하게 삼켜짐"에 가까움)

**`web/src/infra/http/client.js:33-65` — 401 재시도 인터셉터가 두 번째 401 을 가짜 성공으로 바꿔치기**

```js
if (status !== 401 || original?._retried || isAuthEndpoint) {
  if (status === 401) return Promise.resolve({ data: null });  // ← 여기
  return Promise.reject(error);
}
```

- refresh 시도 후에도 다시 401 이 나면(만료된 세션/재로그인 필요 상황) reject 하지 않고 `{data: null}` 로 **resolve** 한다.
- 호출부(`api.js`)는 `const { data } = await API.post(...); return data.data;` 형태라 `data` 가 `null` 이 되어 `data.data` 에서 `TypeError: Cannot read properties of null (reading 'data')` 가 던져진다.
- 이 예외는 thunk 의 `catch (error) { return rejectWithValue(error.message) }` 로 잡혀 `"Cannot read properties of null (reading 'data')"` 라는 **의미 없는 에러 문구**로 화면에 노출된다(공지 화면은 `submitError` 로 표시는 되지만, 원인이 "로그인 만료"라는 걸 사용자가 알 수 없다).
- **모든 admin 도메인 공통** 코드 경로라 공지에도 그대로 적용된다. "배포 버전에서만" 이라는 사용자 진술과 정합적인 유일한 지점 — 로컬 개발 세션은 토큰이 자주 새로 발급되는 반면, 운영에 배포된 세션은 오래 유지되다 만료될 가능성이 더 높다.
- **추정**: 사용자가 실제로 겪은 것은 "요청이 안 나감"이 아니라 "요청은 나가지만 세션 만료 → 이 버그로 인해 원인 불명의 에러만 뜨고 저장이 안 됨"일 가능성. 코드만으로는 "요청 자체가 안 나간다"는 확정적 재현 경로는 없다.

### 배제된 가설

- rightAction 버튼이 안 그려진다 → 배제 (라우트 계층·TopBar 배선 정상)
- BE 라우팅/메서드 불일치 → 배제 (POST/POST 일치)
- DTO 필드명 불일치(Lombok is-프리픽스) → 배제 (record 라 해당 없음)
- DB NOT NULL 컬럼 누락(slug 등) → 배제 (되돌림 완료, 마이그레이션 미실행 확인)

---

## 2. 도메인 × 액션 정합 표

| 도메인.액션 | FE 경로/메서드 | BE 경로/메서드 | 판정 |
|---|---|---|---|
| notices.INSERT | `POST /admin/notices` (`api.js:8`) | `POST /api/admin/notices` (`AdminNoticeController.java:46`) | 정상 |
| notices.UPDATE | `PUT /admin/notices/{id}` (`api.js:9`) | `PUT /api/admin/notices/{noticeId}` (`.java:55`) | 정상 (endpoints.js 의 액션 문자열만 `"PATCH/..."` 로 이름 붙었을 뿐, 실제 HTTP 메서드는 PUT/PUT 일치 — 액션 타입 문자열은 redux 내부 식별자라 무해) |
| notices.VISIBLE/PINNED/DELETE/BULK | PATCH/PATCH/DELETE/DELETE+PATCH | 전부 일치 | 정상 |
| events.INSERT/UPDATE | `POST /admin/events`, `PATCH /admin/events/{id}` | `POST`, `PATCH /api/admin/events/{id}` | 정상 |
| events.VISIBLE(단건) | FE `PATCH .../{id}/visible` body `{visible}` | BE `EventVisibleRequest(boolean visible)` | 정상 |
| events.BULK | DELETE/PATCH `.../bulk`, `.../bulk/visible` | 동일 매핑 존재(`AdminEventController.java:74-87`) | 정상 (미배선 아님 — 이미 연결됨) |
| coupons.INSERT/UPDATE | `POST /admin/coupons`, `PATCH /admin/coupons/{id}` | `POST`, `PATCH /api/admin/coupons/{id}` | 정상 |
| coupons.VISIBLE/BULK/REFRESH | 전부 일치(`AdminCouponController.java`) | 일치 | 정상 |
| quiz.INSERT/UPDATE/DELETE/BULK | `POST/PATCH/DELETE /admin/quiz`, `DELETE .../bulk` | `AdminQuizController.java` 전부 존재, **`@PreAuthorize` 없음**(전역 SecurityConfig 매처로만 보호) | **불일치(경미)** — 다른 컨트롤러와 스타일 불일치, 기능적으론 URL 매처가 막아 안전하지만 메서드 레벨 방어가 없어 내부 직접 호출(테스트/배치) 시 우회 가능 |
| users.LIST/DETAIL/ROLE/STATUS | `GET`, `GET`, `PATCH .../role`, `PATCH .../status` | `AdminUserController.java` 전부 일치, `AdminUserRoleRequest.userRole` / `AdminUserStatusRequest.userStatus` 필드명도 일치 | 정상 (users 는 INSERT 자체가 없음 — OAuth 가입만 존재, 기획상 정상) |
| community.* | `AdminCommunityPage.jsx` 존재하나 **어떤 router 파일에도 등록되지 않음**(`PublicRoutes.jsx`/`UserRoutes.jsx`/`AdminRoutes.jsx` 어디에도 import 없음) | 대응 BE 컨트롤러 미조사(화면 자체가 라우트 미연결이라 실익 없음) | **동결 확인** — 결함으로 세지 않음(사용자 사전 확인 사실과 일치) |

---

## 3. 결함 목록

| 심각도 | 증상 | 원인 파일:줄 | 수정 방향 |
|---|---|---|---|
| 높음 | events/coupons/quiz 어드민 등록·수정 폼이 `dispatch()` 만 하고 `.unwrap()`/`await` 없이 즉시 모달을 닫는다 — 서버가 400/403/500 을 반환해도 **화면은 성공한 것처럼 모달이 닫힌다**(에러 메시지 전무) | `web/src/domains/events/mobile/admin/AdminEventScreen.jsx:274-282`, `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx:194-208`, `web/src/domains/quiz/mobile/admin/AdminQuizScreen.jsx:166-175` | `handleSubmit` 을 `async` 로 바꾸고 `await dispatch(...).unwrap()` 성공 시에만 `closeModal()`, 실패 시 에러 상태값을 만들어 모달 내부에 표시(공지 화면의 `submitError` 패턴 재사용) |
| 높음 | axios 응답 인터셉터가 재시도 후에도 401 이면 reject 대신 `{data:null}` 로 resolve — 호출부가 `data.data` 접근 시 `TypeError` 로 원인 불명 에러가 노출됨. 세션 만료 시 전 admin 도메인(공지 포함) 공통 발생 | `web/src/infra/http/client.js:44-46` | 두 번째 401 도 원래 `error` 를 그대로 `reject` 하도록 변경. 필요하면 별도의 "세션 만료" 표준 에러 객체로 감싸서 reject (예: `Promise.reject({ code: "SESSION_EXPIRED", ... })`), 호출부가 `data.data` 를 읽기 전에 항상 실패로 분기되게 함 |
| 보통 | `AdminQuizController` 에만 `@PreAuthorize("hasRole('ADMIN')")` 없음 — 다른 admin 컨트롤러와 방어 계층 불일치(현재는 `SecurityConfig` 의 URL 매처가 대신 막고 있어 외부 공격 표면은 없음) | `src/main/java/.../domain/quiz/controller/AdminQuizController.java:16-19` | 다른 컨트롤러와 통일 — 클래스 레벨에 `@PreAuthorize("hasRole('ADMIN')")` 추가 |
| 보통 | `AdminCommunityPage` 가 어느 router 파일에도 매핑되어 있지 않음(완전 고아 컴포넌트) | `web/src/domains/community/page/admin/AdminCommunityPage.jsx` (참조 라우트 없음) | 기획상 "동결"이 맞다면 조치 불요. 재개 시 `AdminRoutes.jsx` 또는 셸 탭에 연결 필요 |
| 낮음 | `endpoints.js` 의 액션 타입 문자열(`ADMIN_NOTICE_ACTIONS.UPDATE = "PATCH/admin/notices/update"`)이 실제 HTTP 메서드(PUT)와 다른 이름 — redux devtools 로 디버깅할 때 혼동 유발 가능(기능엔 무해) | `web/src/domains/notices/store/admin/endpoints.js:5` | 문자열을 `"PUT/admin/notices/update"` 로 정정(선택 사항) |

---

## 4. 수정 dispatch brief

### FE 담당

**범위 A — events/coupons/quiz 등록·수정 에러 처리 추가**
- 파일: `web/src/domains/events/mobile/admin/AdminEventScreen.jsx`, `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx`, `web/src/domains/quiz/mobile/admin/AdminQuizScreen.jsx`
- 작업:
  1. 각 파일의 `handleSubmit` 을 `async (e) => {...}` 로 변경
  2. `dispatch(requestXxx(payload))` 를 `await dispatch(requestXxx(payload)).unwrap()` 으로 감싸고 `try/catch`
  3. 성공 시에만 `closeModal()` 호출, 실패 시 모달 내부에 에러 문구 표시할 state 추가(공지 화면의 `submitError` 네이밍/패턴 그대로 재사용 권장)
  4. 세 파일은 서로 독립 — 한 agent 가 3개 다 처리해도 되고, 파일당 분리해도 무관(겹치는 파일 없음)

**범위 B — axios 401 재시도 인터셉터 수정**
- 파일: `web/src/infra/http/client.js`
- 작업: 44-46번째 줄의 `if (status === 401) return Promise.resolve({ data: null });` 분기를 제거하고 원래 `error` 를 `reject` 하도록 변경. 변경 후 정상 401(최초 1회, refresh 대상)과 재시도 후 401(세션 완전 만료)의 동작이 달라지는지 — 즉 로그인 페이지로 보내는 전역 401 핸들러가 다른 곳에 있다면 그쪽과 충돌 없는지 확인 필요(이 인터셉터를 참조하는 다른 코드가 있는지 `grep -rn "data: null" web/src` 로 부작용 범위 먼저 확인할 것)
- 주의: 이 파일은 전 도메인 공용 — 다른 범위 agent 와 절대 동시에 건드리지 말 것(단독 범위로 분리)

### BE 담당

**범위 C — AdminQuizController 방어 계층 통일**
- 파일: `src/main/java/com/dawne/com2usbaseball/domain/quiz/controller/AdminQuizController.java`
- 작업: 클래스 선언부에 `@PreAuthorize("hasRole('ADMIN')")` 추가(다른 admin 컨트롤러와 동일하게), `org.springframework.security.access.prepost.PreAuthorize` import 추가

---

## 5. 확인 못 한 것 / 런타임 확인 필요

- **배포 환경에서 실제로 401/403 이 발생하는지, 발생한다면 정확히 몇 번째 요청부터인지** — 코드상 재현 경로(§1 유력 후보)는 특정했으나, 실제 로그/네트워크 탭 확인 없이는 "이것이 사용자가 겪은 정확한 원인"이라고 확정할 수 없음
- **운영 DB 의 `site_notices` 테이블에 `slug` 컬럼이 실제로 존재하는지** — git 이력상 마이그레이션을 실행하지 않았다고 되어 있으나, 실제 운영 DB 를 직접 조회하지 않았으므로 100% 보장 불가(`docs/global-guide/develop/specs/db/` 실측 문서나 DB 접속으로 재확인 권장)
- **운영 프론트엔드 배포본이 현재 브랜치(37a5716 포함) 기준으로 재배포되었는지** — 만약 855279b 시점(슬러그 컬럼 참조 코드 포함) 빌드가 아직도 서빙되고 있다면 조회 500 등 다른 증상이 나올 수 있음(등록 실패와는 별개 증상)
- **coupons.couponCode 유니크 제약 위반 시 500 이 나는지, 그 에러가 `handleSubmit` 의 fire-and-forget 패턴과 겹쳐 "조용한 실패"로 보이는지** — DB 제약까지는 확인했으나 실제 중복 등록 시나리오는 실행하지 않음
- **community 도메인의 BE 컨트롤러 존재 여부** — FE 라우트 미연결이 확정되어 실익이 낮아 BE 쪽은 조사하지 않음

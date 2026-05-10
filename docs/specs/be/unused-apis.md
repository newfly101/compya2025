# Unused API Endpoints (BE 구현 / FE 미호출)

> 본 문서는 **backend 에 구현되어 있으나 frontend (mobile 리뉴얼 후) 에서 호출되지 않는 API endpoint** 를 식별하기 위한 보류 마킹 문서이다.
>
> - 분석 대상 도메인: `authentication` (=oauth), `coupon`, `event`, `notice`, `quiz`
> - 분석 제외: `community` (mobile 리뉴얼 진행 중), `admin/upload`, `fun/playerCard`, `player`, `skill` (기획 대기 / 별도 trace)
> - 분석 시각: 2026-05-10
> - **frontend 호출 site 판정 기준**: `web/src/domains/{도메인}/store/**/{endpoints,api,thunks}.js` 정의 + `request*Thunk` 가 slice 외부 (hook / component / provider) 에서 dispatch 되는지 여부.
>   - slice 의 extraReducers 등록만 있고 외부 dispatch site 가 없으면 **사용 안 함**.
> - 사유 분류:
>   - **기획 대기** — admin UI legacy 폐기 (2026-05-09) 후 신규 기획 후 재구현 예정 (`docs/prd/domains/admin.md` TODO 참조)
>   - **FE 단순 미연결** — backend 는 의도적으로 구현되었으나 FE 가 호출 흐름을 만들지 않은 상태
>   - **path mismatch (BE/FE 불일치)** — FE endpoints.js 에 정의가 있으나 path 가 BE 와 어긋남 → 실제로 호출되어도 404. 문서적으로는 "사용 안 함" 처리

---

## 0. 요약 표 (사용 / 미사용 count)

| 도메인 | 전체 endpoint | 사용 중 | 미사용 (보류) | 사용률 |
|---|---:|---:|---:|---:|
| authentication (oauth) | 3 | 3 | 0 | 100% |
| coupon                 | 5 | 1 | 4 | 20% |
| event                  | 5 | 1 | 4 | 20% |
| notice                 | 9 | 1 | 8 | 11% |
| quiz                   | 5 | 1 | 4 | 20% |
| **합계**               | **27** | **7** | **20** | **26%** |

---

## 1. authentication (oauth)

> Controller: `AuthController` (`/api/auth`), `UserController` (`/api/users`)
> 모든 endpoint 사용 중.

| Method | Path                         | Handler                | 상태   | 비고                                                  |
|--------|------------------------------|------------------------|--------|-------------------------------------------------------|
| GET    | `/api/auth/naver/callback`   | `naverCallback`        | 사용  | OAuth redirect_uri (`useAuthentication.js`)            |
| POST   | `/api/auth/logout`           | `logout`               | 사용  | `requestUserLogout` thunk                              |
| GET    | `/api/users/me`              | `getMe`                | 사용  | `requestUserHealthCheck` thunk (AuthProvider)          |

**미사용 endpoint: 없음**

---

## 2. coupon

> Controller: `CouponController` (`/api/coupons`), `AdminCouponController` (`/api/admin/coupons`, `@PreAuthorize("hasRole('ADMIN')")`)

| Method | Path                                  | Handler                  | 상태       | 사유 / 비고                                                                 |
|--------|---------------------------------------|--------------------------|------------|-----------------------------------------------------------------------------|
| GET    | `/api/coupons`                        | `getCouponLists`         | 사용      | `requestGetUserCouponList` (coupons/mobile/hooks/useCouponList.js)           |
| GET    | `/api/admin/coupons`                  | `getCouponLists`         | **미사용** | 기획 대기 (admin-only). FE thunk `requestGetAdminCouponList` 정의되어 있으나 외부 dispatch site 없음 |
| POST   | `/api/admin/coupons`                  | `insertNewCoupons`       | **미사용** | 기획 대기 (admin-only). FE thunk `requestAdminInsertNewCoupon` dispatch site 없음 |
| PATCH  | `/api/admin/coupons/{id}`             | `updateCoupon`           | **미사용** | 기획 대기 (admin-only). FE thunk `requestAdminUpdateCoupon` dispatch site 없음 |
| PATCH  | `/api/admin/coupons/{id}/visible`     | `updateCouponVisible`    | **미사용** | 기획 대기 (admin-only). FE thunk `requestAdminUpdateCouponVisible` dispatch site 없음 |

> AdminRoutes.jsx 에서 `AdminCouponListPage` import / route 모두 주석. admin coupon UI 재기획 후 활성화 예정.

---

## 3. event

> Controller: `EventController` (`/api/events`), `AdminEventController` (`/api/admin/events`, `@PreAuthorize("hasRole('ADMIN')")`)

| Method | Path                                       | Handler                       | 상태       | 사유 / 비고                                                                 |
|--------|--------------------------------------------|-------------------------------|------------|-----------------------------------------------------------------------------|
| GET    | `/api/events/external`                     | `getExternalEventList`        | 사용      | `requestGetExternalEventList` (events/mobile/hooks/useEventList.js)          |
| GET    | `/api/admin/events/external`               | `getExternalEventList`        | **미사용** | 기획 대기 (admin-only). thunk `requestAdminGetExEventList` dispatch site 없음 |
| POST   | `/api/admin/events`                        | `insertNewEvent`              | **미사용** | 기획 대기 (admin-only). thunk `requestAdminInsertNewExEvent` dispatch site 없음 |
| PATCH  | `/api/admin/events/{id}`                   | `updateExternalEvent`         | **미사용** | 기획 대기 (admin-only). thunk `requestAdminUpdateExEvent` dispatch site 없음 |
| PATCH  | `/api/admin/events/{id}/visible`           | `updateExternalEventVisible`  | **미사용** | 기획 대기 (admin-only). thunk `requestAdminUpdateExEventVisible` dispatch site 없음 |

> AdminRoutes.jsx 에서 `AdminEventPage` import / route 주석 처리됨. admin event UI 재기획 후 활성화 예정.

---

## 4. notice

> Controller: `NoticeController` (`/api/notices`), `AdminNoticeController` (`/api/admin/notices`)
> notice 도메인은 (a) 단건 detail API 가 FE 에서 list cache `find()` 로 대체되어 미사용, (b) admin UI 자체가 폐기되어 다수 admin endpoint 미사용, (c) FE admin endpoints.js 에 일부 path 가 누락 또는 mismatch 인 점이 특징.

| Method | Path                                      | Handler                  | 상태       | 사유 / 비고                                                                                  |
|--------|-------------------------------------------|--------------------------|------------|----------------------------------------------------------------------------------------------|
| GET    | `/api/notices`                            | `getNoticeList`          | 사용      | `requestGetNoticeList` (mobile/hooks/useNoticeList.js, useNoticeDetail.js)                    |
| GET    | `/api/notices/{noticeId}`                 | `getNoticeDetail`        | **미사용** | FE 단순 미연결. NoticeDetailScreen 은 list cache 에서 `siteNotices.find(n => n.id === id)` 로 처리 → 단건 API 미호출 |
| GET    | `/api/admin/notices`                      | `getAdminNoticeList`     | **미사용** | 기획 대기 (admin-only). thunk `requestAdminGetNoticeList` dispatch site 없음                    |
| GET    | `/api/admin/notices/{noticeId}`           | `getAdminNoticeDetail`   | **미사용** | 기획 대기 (admin-only). FE endpoints.js 에 정의 자체가 없음                                       |
| POST   | `/api/admin/notices`                      | `createNotice`           | **미사용** | 기획 대기 (admin-only). thunk 정의 있으나 dispatch site 없음                                     |
| PUT    | `/api/admin/notices/{noticeId}`           | `updateNotice`           | **미사용** | 기획 대기 (admin-only). FE 는 PATCH `/admin/notices` (no path variable) 로 정의 → **path mismatch**. thunk `requestAdminUpdateNotice` 도 dispatch site 없음 |
| PATCH  | `/api/admin/notices/{noticeId}/visible`   | `updateNoticeVisible`    | **미사용** | 기획 대기 (admin-only). FE 는 PATCH `/admin/notices/visible` (no path variable) 로 정의 → **path mismatch**. dispatch site 없음 |
| PATCH  | `/api/admin/notices/{noticeId}/pinned`    | `updateNoticePinned`     | **미사용** | 기획 대기 (admin-only). FE endpoints.js 에 정의 자체가 없음                                       |
| DELETE | `/api/admin/notices/{noticeId}`           | `deleteNotice`           | **미사용** | 기획 대기 (admin-only). FE endpoints.js 에 정의 자체가 없음                                       |

### Notice 도메인 추가 메모

- 단건 detail (`GET /api/notices/{noticeId}`) 은 admin 이 아닌 **public** API 임에도 미사용. 현재 mobile 리뉴얼은 list 1 회 fetch 후 캐시 find 패턴을 채택했음. 추후 (a) list 진입 없이 detail deep-link 진입 (e.g. push notification) 요구가 생기면 실수요 발생 → **기획 대기로 보류**.
- admin endpoints.js 의 path mismatch 4 건 (`PUT /admin/notices/{id}`, `PATCH /admin/notices/{id}/visible` BE ↔ `PATCH /admin/notices`, `PATCH /admin/notices/visible` FE) 은 admin UI 가 폐기되며 검증 누락된 상태로 남았음. admin UI 재기획 시 endpoints.js 도 함께 정합 작업 필요.
- admin endpoints.js 에 `pinned`, `delete`, 단건 `getDetail` 매핑이 아예 없음 → admin UI 재기획 시 신규 추가 필요.

---

## 5. quiz

> Controller: `QuizController` (`/api/quiz`), `AdminQuizController` (`/api/admin/quiz`)

| Method | Path                          | Handler           | 상태       | 사유 / 비고                                                                                  |
|--------|-------------------------------|-------------------|------------|----------------------------------------------------------------------------------------------|
| GET    | `/api/quiz/latest`            | `getLatest`       | 사용      | `requestLatestQuizAnswer` (HomeScreen.jsx 에서 dispatch)                                      |
| GET    | `/api/admin/quiz`             | `getAll`          | **미사용** | 기획 대기 (admin-only). thunk `requestAdminQuizAll` dispatch site 없음                         |
| POST   | `/api/admin/quiz`             | `create`          | **미사용** | 기획 대기 (admin-only). thunk `requestAdminQuizCreate` dispatch site 없음                       |
| PATCH  | `/api/admin/quiz/{id}`        | `update`          | **미사용** | 기획 대기 (admin-only). thunk `requestAdminQuizUpdate` dispatch site 없음                       |
| DELETE | `/api/admin/quiz/{id}`        | `delete`          | **미사용** | 기획 대기 (admin-only). FE endpoints.js 에 path 정의는 있으나 **api.js / thunks.js 에 fetcher 자체가 없음** (dispatch site 없음 + 호출 함수 미구현) |

> AdminRoutes.jsx 에서 `AdminQuizPage` import / route 주석. admin quiz UI 재기획 후 활성화 예정.

---

## 6. 패턴별 미사용 사유 분류

| 사유 패턴 | 건수 | 도메인:endpoint 예시 |
|---|---:|---|
| 기획 대기 (admin-only, AdminRoutes 주석 폐기) | 16 | coupon admin 4, event admin 4, notice admin 6, quiz admin 4 ※ notice admin 1 (visible) 은 path mismatch 와 중복 카운트 회피 |
| FE 단순 미연결 (public 인데 호출 흐름 없음)    | 1  | `GET /api/notices/{noticeId}` (list cache find 로 대체)         |
| FE 정의 자체 누락 (endpoints.js 에 없음)       | 3  | `GET /api/admin/notices/{noticeId}`, `PATCH /api/admin/notices/{noticeId}/pinned`, `DELETE /api/admin/notices/{noticeId}` |
| FE path mismatch (BE/FE 다름)                   | 2  | `PUT /api/admin/notices/{noticeId}`, `PATCH /api/admin/notices/{noticeId}/visible` (FE 는 path variable 없는 형태로 정의) |

> 위 4 분류는 서로 배타적이지 않다. notice 의 mismatch 항목들은 "admin-only 기획 대기" 와 "FE path mismatch" 의 교집합이라 둘 다 해당. 표는 실제 미연결 root cause 우선으로 1 건 1 분류.

---

## 7. Dead 의심 (별도)

> 본 문서 분석 도메인 (auth/coupon/event/notice/quiz) 안에서 **명백한 dead code 는 발견되지 않음**.
> - admin 핸들러들은 entity / service / DTO 가 모두 정상 구현되어 있고, frontend store 도 thunk 까지 정의됨. 단지 마지막 dispatch site 가 admin UI 폐기로 인해 끊긴 상태이므로 dead 가 아니라 **보류** 가 맞다.
> - `web/src/domains/quiz/store/admin/` 에서는 `DELETE` thunk / api fetcher 자체가 빠져 있는데, 이는 BE 단에서 dead 라기보다 FE 가 미구현인 케이스 (BE 는 정상). 따라서 dead 아님.
> - 이 외 의심 후보 (`FunPlayerCardController` 등) 는 본 문서 분석 범위 밖이며 `docs/specs/be/dead-suspects.md` 에 별도 정리되어 있음.

---

## 8. 후속 작업 가이드

1. **admin UI 재기획 시 점검 항목**
   - `web/src/domains/notices/store/admin/endpoints.js` path mismatch 보정 (`{id}` path variable 누락 — `update`, `updateVisible`, 신규 `pinned`, `delete`, 단건 `getDetail` 추가)
   - `web/src/domains/quiz/store/admin/` 에 `DELETE` fetcher / thunk 추가
   - 각 admin store thunk 를 dispatch 하는 hook / component 부착
2. **단건 notice detail (`GET /api/notices/{noticeId}`)**
   - 현재는 list cache find 로 대체. deep-link 진입 (e.g. push 알림 → `/notice/:id`) 등 list 미경유 진입 흐름이 추가되는 시점에 활성화 결정.
3. **본 문서 갱신 트리거**
   - admin 도메인별 page 가 `AdminRoutes.jsx` 에 다시 등록되거나, public 쪽에서 단건 detail 흐름이 추가될 때 해당 row 를 "사용" 으로 옮길 것.

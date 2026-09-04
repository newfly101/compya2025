# 어드민 API 인벤토리

조사 대상: 퀴즈 / 이벤트 / 쿠폰 / 공지 / 유저관리 5개 도메인.
판별 기준: 전역 시큐리티 설정(`SecurityConfig`)에서 `/api/admin/**` 전체를 `hasRole('ADMIN')` 으로 막고 있다. 컨트롤러별 `@PreAuthorize("hasRole('ADMIN')")` 은 일부만 중복으로 붙어 있을 뿐, 없어도 이미 보호된다 (퀴즈가 그 경우).

## 요약

5개 도메인 × CRUD 매트릭스. "있음" = BE API 존재 + FE 연결 확인.

| 도메인 | 목록 | 단건조회 | 등록 | 수정 | 삭제 |
|---|---|---|---|---|---|
| 퀴즈 | 있음 | 없음 | 있음 | 있음 | BE만 있음 (FE 미연결) |
| 이벤트 | 있음 | 없음 (목록에 통합) | 있음 | 있음 | 있음 |
| 쿠폰 | 있음 | 없음 | 있음 | 있음 | 있음 |
| 공지 | 있음 | 있음 (FE 미사용) | 있음 | 있음 | BE만 있음 (FE 미연결) |
| 유저관리 | 있음 | 있음 | 없음 (가입은 OAuth 전용) | 역할/상태 변경만 | 없음 (탈퇴 API 없음) |

그 외 표시(visible 토글, notice pinned 토글)는 도메인별 상세에 별도 정리.

---

## 도메인별 상세

### 퀴즈

**엔드포인트** (`/api/admin/quiz`, `AdminQuizController`)

| 메서드 | 경로 | 요청 DTO | 응답 DTO |
|---|---|---|---|
| GET | `/api/admin/quiz` | 없음 | `List<QuizResponse>` |
| POST | `/api/admin/quiz` | `QuizRequest` | `QuizResponse` |
| PATCH | `/api/admin/quiz/{id}` | `QuizRequest` | `QuizResponse` |
| DELETE | `/api/admin/quiz/{id}` | 없음 | `Void` |

페이징/검색/필터 없음. 단건 조회 API도 없음(목록만 있고 상세 GET 없음).

**데이터 모델**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| id | Long | 응답전용 | |
| round | Integer | 필수 | 회차, DB UNIQUE 제약(`uq_round`) — 중복 시 409 |
| imageUrl | String | 선택 | |
| title | String | 응답전용 | **DB 저장값 아님.** `QuizMapStruct` 가 `round` 로 매 응답마다 동적 합성: `"🎉컴프야 퀴즈 이벤트 {round}회 정답"`. 등록/수정 폼에 title 입력란 자체가 필요 없음 |
| createdAt / updatedAt | LocalDateTime | 응답전용 | `yyyy-MM-dd HH:mm` |

**FE ↔ BE 불일치**

- **BE API 는 실재하고 정상 동작한다** (Service/Repository/캐시(`@Cacheable`)까지 완결). 다만 **화면(페이지/컴포넌트)이 없다** — `find` 결과 `src/domains/quiz/store/admin` 아래에 store 코드만 있고 pages/screens 없음.
- FE `endpoints.js` 에 `DELETE` 엔드포인트가 정의돼 있으나 **`api.js`/`thunks.js` 에 delete 함수가 없음** — 삭제 기능 미구현.
- **버그 발견**: `thunks.js` 의 `requestAdminQuizAll` 이 `const { items } = await fetchAdminQuizAll();` 로 구조분해하는데, BE 응답은 `List<QuizResponse>`(배열) 그대로라 `items` 키가 없다. 어드민 화면을 새로 붙일 때 이 부분부터 고쳐야 목록이 뜬다.

---

### 이벤트

**엔드포인트** (`/api/admin/events`, `AdminEventController`, `@PreAuthorize("hasRole('ADMIN')")`)

| 메서드 | 경로 | 요청 DTO | 응답 DTO |
|---|---|---|---|
| GET | `/api/admin/events/external` | 없음 | `List<EventResponse>` (레거시: 공식 카페 외부 이벤트만) |
| GET | `/api/admin/events` | `EventAdminListRequest` (page, size, eventType, visible) | `List<EventResponse>` |
| POST | `/api/admin/events` | `EventRequest` | `EventResponse` |
| PATCH | `/api/admin/events/{id}` | `EventRequest` | `EventResponse` |
| PATCH | `/api/admin/events/{id}/visible` | `EventVisibleRequest` | `Void` |
| DELETE | `/api/admin/events/{id}` | 없음 | `Void` |

페이징 있음(`page`/`size`, 기본 0/20) + `eventType`/`visible` 필터. **단, count 쿼리가 없어 total 개수/전체 페이지 수를 못 준다** — 매퍼에 `selectAdminEventList` 만 있고 count select 없음. 번호식 페이지네이션 대신 "더보기" 방식이 맞다.

**데이터 모델**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| id | Long | 응답전용 | |
| eventType | Enum | 필수 | `OFFICIAL`(공식 카페 이벤트) / `INTERNAL`(컴프야 펀 이벤트) |
| title | String | 필수 | |
| startAt | LocalDateTime | 선택 | `yyyy-MM-dd HH:mm` |
| expireAt | LocalDateTime | 선택 | `yyyy-MM-dd HH:mm` |
| imageUrl | String | 선택 | |
| externalLink | String | 선택 | |
| visible | boolean | 필수 | 목록/폼 모두 노출 |

**FE ↔ BE 불일치**: 없음. FE `endpoints.js`/`api.js`/`thunks.js` 가 6개 BE 엔드포인트를 모두 사용 중 (external 목록 · 전체 목록(페이징) · 등록 · 수정 · visible 토글 · 삭제). 이미지 업로드도 `/api/upload/events` 로 연결됨.

---

### 쿠폰

**엔드포인트** (`/api/admin/coupons`, `AdminCouponController`, `@PreAuthorize("hasRole('ADMIN')")`)

| 메서드 | 경로 | 요청 DTO | 응답 DTO |
|---|---|---|---|
| GET | `/api/admin/coupons` | 없음 | `List<CouponResponse>` |
| POST | `/api/admin/coupons` | `CouponRequest` | `CouponResponse` |
| PATCH | `/api/admin/coupons/{id}` | `CouponRequest` | `CouponResponse` |
| PATCH | `/api/admin/coupons/{id}/visible` | `CouponVisibleRequest` | `Void` |
| DELETE | `/api/admin/coupons/{id}` | 없음 | `Void` |

페이징/검색/필터 전혀 없음(목록 전량 조회). 단건 조회 API 없음.

**데이터 모델**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| id | Long | 응답전용 | |
| couponCode | String | 필수 | DB UNIQUE — 중복 시 409 |
| title | String | 필수 | |
| detail | String | 선택 | |
| expireAt | LocalDateTime | 선택 | `yyyy-MM-dd HH:mm` |
| visible | boolean | 필수 | |

**FE ↔ BE 불일치**: 없음. FE 5개 함수(목록/등록/수정/visible/삭제) 모두 대응.

---

### 공지

**엔드포인트** (`/api/admin/notices`, `AdminNoticeController`, `@PreAuthorize("hasRole('ADMIN')")`)

| 메서드 | 경로 | 요청 DTO | 응답 DTO |
|---|---|---|---|
| GET | `/api/admin/notices` | `NoticeAdminListRequest` (source, isVisible, isPinned) | `List<NoticeResponse>` |
| GET | `/api/admin/notices/{noticeId}` | 없음 | `NoticeResponse` |
| POST | `/api/admin/notices` | `NoticeRequest` | `NoticeResponse` |
| PUT | `/api/admin/notices/{noticeId}` | `NoticeRequest` | `NoticeResponse` |
| PATCH | `/api/admin/notices/{noticeId}/visible` | `NoticeVisibleRequest` | `Void` |
| PATCH | `/api/admin/notices/{noticeId}/pinned` | `NoticePinnedRequest` | `Void` |
| DELETE | `/api/admin/notices/{noticeId}` | 없음 | `Void` |

필터는 있으나(`source`/`isVisible`/`isPinned`) 페이지네이션 파라미터는 없음(전량 조회 후 필터).

**데이터 모델**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| id | Long | 응답전용 | |
| source | Enum | 필수 | `INTERNAL` / `EXTERNAL` |
| title | String | 필수 | |
| summary | String | 선택 | |
| content | String | 선택 | |
| externalUrl | String | 선택 | source=EXTERNAL일 때 사용 추정 |
| imageUrl | String | 선택 | |
| isVisible | Boolean | 필수 | |
| isPinned | Boolean | 필수 | 상단 고정 |
| publishedAt | LocalDateTime | 선택 | `yyyy-MM-dd HH:mm` |
| createdAt / updatedAt | LocalDateTime | 응답전용 | `yyyy-MM-dd HH:mm` |

**FE ↔ BE 불일치**

- **BE 에는 있는데 FE 에서 아직 안 쓰는 것 3개**: 단건 조회(`GET /{noticeId}`), 고정(pinned) 토글(`PATCH /{noticeId}/pinned`), 삭제(`DELETE /{noticeId}`). FE `endpoints.js`/`api.js`/`thunks.js` 에 목록·등록·수정·visible 토글 4개만 있음.
- 수정은 BE가 `PUT`, FE도 `API.put` 으로 정확히 맞춰 호출 중(불일치 아님, 확인 완료).

---

### 유저관리

**엔드포인트** (`/api/admin/users`, `AdminUserController`, `@PreAuthorize("hasRole('ADMIN')")`)

| 메서드 | 경로 | 요청 DTO | 응답 DTO |
|---|---|---|---|
| GET | `/api/admin/users` | `AdminUserListRequest` (nickname, userRole, userStatus, page, size) | `List<AdminUserResponse>` |
| GET | `/api/admin/users/{userId}` | 없음 | `AdminUserResponse` |
| PATCH | `/api/admin/users/{userId}/role` | `AdminUserRoleRequest` | `Void` |
| PATCH | `/api/admin/users/{userId}/status` | `AdminUserStatusRequest` | `Void` |

등록/삭제 API 자체가 없음 — 가입은 OAuth 로만 이뤄지고, 관리자가 계정을 직접 만들거나 지우는 기능은 설계상 없음. 페이징 있음(기본 0/20) + 닉네임 검색 + role/status 필터. **이벤트와 동일하게 count 쿼리 없음** — total 페이지 수 계산 불가.

**데이터 모델**

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| id | Long | 응답전용 | |
| nickname | String | — | 검색 가능 |
| email | String | — | |
| userRole | Enum | 필수 | `ADMIN` / `USER` |
| userStatus | Enum | 필수 | `ACTIVE` / `BLOCKED` / `WITHDRAWN` / `SUSPENDED` |
| lastLoginAt | LocalDateTime | — | `yyyy-MM-dd HH:mm` |
| createdAt | LocalDateTime | — | `yyyy-MM-dd HH:mm` |

**FE ↔ BE 불일치**: 없음. FE 4개 함수(목록/상세/역할변경/상태변경) 모두 대응.

---

## 신규로 만들어야 하는 API

우선순위 순.

1. **퀴즈 삭제 FE 연동** — BE API는 있음. `api.js`/`thunks.js`에 delete 함수 추가 + `requestAdminQuizAll` 의 `{ items }` 구조분해 버그 수정. (신규 BE 개발 아님, FE 배선 + 버그 수정)
2. **퀴즈 어드민 화면 자체가 없음** — 화면 개발 필요. API는 이미 완결돼 있어 새 BE 작업은 불필요.
3. **공지 상세/고정토글/삭제 FE 연동** — BE 3종 모두 있음, FE 배선만 하면 됨.
4. **이벤트·유저 목록 total count** — 번호식 페이지네이션을 쓰려면 count 쿼리 + 응답에 totalCount 추가하는 BE 작업 필요. 안 하면 "더보기"형 무한 스크롤로 설계.
5. **쿠폰/퀴즈 페이징·검색** — 현재 전량 조회. 데이터가 적으면 당장은 급하지 않음, 늘어나면 페이징 추가 필요.
6. **쿠폰/퀴즈 단건 상세 GET** — 현재 목록 API 응답으로 수정 폼을 채우는 방식이라 없어도 동작은 함. 우선순위 낮음.

신규 BE 개발이 실제로 필요한 항목은 4번(count) 정도이고, 나머지는 FE 배선 또는 화면 개발이다.

---

## 주의 항목

- **파괴적 조작**: 쿠폰/이벤트/공지 삭제(hard delete)는 이미 BE에 있고 FE도 대부분 연결돼 있다. 어드민 화면에서 삭제 버튼에는 확인 모달을 반드시 둘 것.
- **유저관리 자기 자신 보호 로직 (HITL 불필요, 이미 구현됨)**: `AdminUserServiceImpl` 이 관리자가 **자기 자신의 role/status 를 변경하지 못하게** 서버에서 막아둔다(`ADMIN_USER_SELF_ROLE_CHANGE_FORBIDDEN` / `..._STATUS_CHANGE_FORBIDDEN`, 403). 어드민 화면에서도 본인 행 role/status 컨트롤은 비활성화 처리하는 게 UX상 맞다.
- **유저 role/status 변경 시 refresh token 전체 삭제** — 변경 즉시 해당 유저는 재로그인이 강제된다. 화면에 "변경 시 즉시 로그아웃됨" 안내 문구 필요.
- **유저 삭제(회원탈퇴) API 자체가 없음** — 관리자가 계정을 지우는 기능은 설계에 없다. 필요하면 별도 기획/HITL 대상.
- **quiz title 은 입력값이 아니다** — 등록/수정 폼에 title 입력란을 넣지 말 것(넣어도 응답에서 무시되고 round 기반으로 재계산됨).

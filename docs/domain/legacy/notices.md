# 도메인: notices

## A.1 현재 상태

- **분류**: **live** (모바일 사용자 + PC 어드민 모두)
- **모바일 전환 진척도**: **표준 거의 일치** (admin 구조만 `feature/components/admin/` 로 다른 위치 — `routes-and-screens.md:116`)
- 폴더 구조:
  ```
  domains/notices/
  ├── mobile/
  │   ├── NoticeScreen.jsx
  │   ├── NoticeDetailScreen.jsx
  │   ├── components/{noticeCard, officialNoticeCard}/
  │   ├── containers/{NoticeListVertical, OfficialNoticeListVertical}/
  │   └── hooks/{useNoticeList, useNoticeDetail}.js
  ├── feature/components/admin/  ★ 표준에서 위치 다름 (admin 따로)
  │   └── AdminNoticeManagePage.jsx
  └── store/
      ├── admin/    { api.js, endpoints.js, thunks.js }
      └── public/   { api.js, endpoints.js, thunks.js }
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| NoticePage → NoticeScreen | `/notices` | `web/src/domains/notices/mobile/NoticeScreen.jsx` | 모바일 | live |
| NoticeDetailPage → NoticeDetailScreen | `/notice/:id` | `web/src/domains/notices/mobile/NoticeDetailScreen.jsx` | 모바일 | live (재사용 `/notices` GET — list 캐시 lookup) |
| (HomeScreen NoticeSection) | `/` 의 일부 | `domains/home/components/section/notice/` | 모바일 | HomeScreen 차용 |
| AdminNoticeManagePage | `/admin/content/notice` | `web/src/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx` | PC 어드민 | live |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/notice/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/notices` | `NoticeController#getNoticeList` (`notice/controller/NoticeController.java:21`) | permitAll | |
| GET | `/api/notices/{noticeId}` | `NoticeController#getNoticeDetail` (line 29) | permitAll | |
| GET | `/api/admin/notices` | `AdminNoticeController#getAdminNoticeList` (line 24) | ADMIN | |
| GET | `/api/admin/notices/{noticeId}` | `AdminNoticeController#getAdminNoticeDetail` (line 32) | ADMIN | |
| POST | `/api/admin/notices` | `AdminNoticeController#createNotice` (line 40) | ADMIN | INTERNAL ↔ content / EXTERNAL ↔ externalUrl 필수 (DB CHECK 미러) |
| **PUT** | `/api/admin/notices/{noticeId}` | `AdminNoticeController#updateNotice` (line 48) | ADMIN | jsoup sanitize. ★ FE 는 PATCH (method 미스매치 의심) |
| PATCH | `/api/admin/notices/{noticeId}/visible` | line 58 | ADMIN | |
| PATCH | `/api/admin/notices/{noticeId}/pinned` | line 68 | ADMIN | |
| DELETE | `/api/admin/notices/{noticeId}` | line 78 | ADMIN | |

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/notices/store/public/api.js:4` | GET | `/notices` | `useNoticeList`, `useNoticeDetail` | `/notices`, `/notice/:id`, `/` |
| `domains/notices/store/admin/api.js:4` | GET | `/admin/notices` | (admin hook) | `/admin/content/notice` |
| `domains/notices/store/admin/api.js:5` | POST | `/admin/notices` | (admin) | `/admin/content/notice` |
| `domains/notices/store/admin/api.js:6` | **PATCH** | `/admin/notices` | (admin update) | ★ method 미스매치 의심 |
| `domains/notices/store/admin/api.js:7` | PATCH | `/admin/notices/visible` | (admin) | ★ path 형식 차이 (BE 는 `{id}/visible`) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #4-5, #21-24)

- **매칭됨**: 5건 (public list, admin list/detail/create — 정상)
- **MATCH (path 형식 차이 의심, spot-check 권장)**: PATCH `/admin/notices` (BE 는 PUT `/admin/notices/{id}`), PATCH `/admin/notices/visible` (BE 는 `{id}/visible`)
- **BE 만 노출** (`fe-be-mismatch.md #5`): `GET /api/notices/{noticeId}` (FE 는 list 만 fetch, detail 은 list 캐시 lookup) — 의도된 미연결 가능. 액션 보류

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `notices` | V1 | ⚪ legacy(이전완료) | — (mapper 0건) | site_notices 로 이전 |
| `site_notices` | V2 | 🔵 active | `mapper/site/notice/NoticeMapper.xml:26,48,71,92,111,119,144,159,166,173` | 10 stmt |

**dual pair**: `notices ↔ site_notices` — V2 단방향 (이전 완료). V2 가 `image_url`, `published_at`, 인덱스 3개 추가된 superset (`dual-management.md §10`).

## A.5 권한 / 가드

- 사용자 (`/notices*`): permitAll
- admin (`/admin/notices*`): SecurityConfig URL 가드 `/api/admin/**` hasRole(ADMIN)
- AdminNoticeServiceImpl 에서 jsoup sanitize 적용 (`services.md:80`)

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| ⚠ admin notice update method 미스매치 의심 (FE PATCH ↔ BE PUT) | `fe-be-mismatch.md #23` | ⚠ admin notice update 작동 검증 필요. spec 그대로면 admin 화면 update 시 405/404 |
| ⚠ admin notice visible path 형식 차이 (FE: `/admin/notices/visible`, body 에 id ↔ BE: `/admin/notices/{id}/visible`) | `fe-be-mismatch.md #24` | ⚠ spot-check 권장 |

## A.7 dead 항목 (이 도메인 안)

- `web/src/app/page/notice/NoticeLayout.jsx` — 구 `notice` 중첩 라우트의 layout, 라우트 주석 처리 후 잔존 (Owner 정책: 보존 — `fe/dead-suspects.md C`)
- `web/src/data/{CafeNotice,FunNotice}.js` — import 0건 즉시 삭제 가능 (`dead-confirmed.md 1-D`)
- `web/src/global/layout/callBack/AuthCallBack.jsx` 같은 중복 (직접 이 도메인 아니지만 notice 라우트 주석 자리에서 import 됨) — `fe/dead-suspects.md A`

## A.8 ★ Owner 결정 필요 (도메인 한정)

- admin notice update method/path spot-check 후 fix 결정 (FE 측 PATCH→PUT 변경 또는 BE 에 PATCH alias 추가)

---

## B.1 도메인 정의

본 도메인은 **공지사항 (notices)** 의 모바일 사용자 노출과 PC 어드민 운영을 모두 포괄한다. Part A 분류 기준 **live** 이며 모바일 전환은 표준 거의 일치 (단 `feature/components/admin/` admin 위치만 표준 외 — `routes-and-screens.md:116`).

본 라운드 scope:

- **public 모바일** (`/notices`, `/notice/:id`, HomeScreen NoticeSection): 기존 동작 유지 + admin 측 endpoint 정합 fix 가 미치는 부수 정정 (T4 detail 단건 fetch 연결)
- **PC 어드민** (`/admin/content/notice` → `AdminNoticeManagePage`): 표준 폴더 정렬 (T1) + Part A.6 위험 2건 (admin update method/path 미스매치, admin visible path 형식 차이) fix (T2/T3) + 4 capability 동작 정합 검증 (T6)
- 도메인 한정 ★ Owner 결정 (`A.8` admin notice update method/path spot-check 후 fix 결정) 본 라운드 해소 — fix 방향 = **FE 를 BE 표준 (PUT `/admin/notices/{id}`, PATCH `/admin/notices/{id}/visible`) 에 맞춤**

본 라운드 scope 외 (추후 별도 라운드):

- 횡단 dead 정리 (T5 결번 — `app/page/notice/NoticeLayout.jsx`, `data/CafeNotice.js`, `data/FunNotice.js` 는 본 도메인 외 횡단 dead. 본 라운드 task 화 안 함)
- BE 측 검증 (BE 단의 PUT/PATCH 동작 재확인) 은 후속 작업 (B.7)

## B.2 기능 / 작업 항목

> Part A.6 위험 2건 (admin update method/path / admin visible path) + 표준 폴더 정렬 + 4 capability QA + public detail endpoint 연결. 모두 P0 (모바일 리뉴얼 admin 운영 안정화 차단성).

> ⚠ **본 라운드 (2026-05-09) admin UI legacy 통째 폐기**: 사용자 정책 ("src/domains/{domain}/ 내 admin 관련 page UI 전부 삭제. UI 는 신규 기획을 통해 디자인. API 는 보존") 에 따라 admin UI 통째 폐기 → T1~T3, T6 admin 관련 task 모두 **신규 admin UI 기획 라운드 후 재구현**. 폐기 결과:
> - `web/src/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx` + scss 삭제 (2 파일 — 비표준 위치였음)
> - `AdminRoutes.jsx` 의 `/admin/content/notice` 라우트 + lazy import 주석
> - 보존 (데이터 레이어): `store/admin/{api, endpoints, thunks}` 미터치 — admin endpoint 호출 로직 그대로 (T2/T3 의 method/path fix 작업 대상은 store/admin/api.js 에 그대로 살아있음)
> - 어느 도메인 우선 진행할지 사용자 결정 필요 (admin.md TODO 참조)
> - T4 (public detail endpoint 연결) 만 admin 무관 → 독립 진행 가능

- [ ] **T1 — admin 폴더 표준화** (P0)
  - 사용자 시나리오: 관리자 운영 화면이 다른 도메인 (coupons, events) 과 같은 폴더 구조에 있어 운영자/개발자가 동일한 경로 컨벤션으로 인지/탐색
  - acceptance criteria:
    - `web/src/domains/notices/feature/components/admin/AdminNoticeManagePage.jsx` → `web/src/domains/notices/mobile/` 또는 다른 도메인과 동일한 admin 위치로 이동 (다른 도메인 표준 패턴 그대로)
    - 기존 `store/admin/` (`api.js`, `endpoints.js`, `thunks.js`) 패턴 유지 — 본 task 는 컴포넌트 위치 표준화에 한정
    - import 경로 갱신, `/admin/content/notice` 라우트가 새 위치에서 정상 진입
  - 의존 API/테이블: `A.3` admin endpoint 5건 (GET list/detail, POST, PUT update, PATCH visible, PATCH pinned, DELETE) — 동작 변화 없음
  - 우선순위: **P0**
  - figma node: 미진행 (admin figma 미제공 — coupons/events 패턴)

- [ ] **T2 — admin update method/path 정합 fix** (P0)
  - 사용자 시나리오: 관리자가 공지 수정 시 405/404 없이 정상 저장 (현재 FE PATCH `/admin/notices` (body 에 id) ↔ BE PUT `/admin/notices/{id}` 미스매치 의심 — `A.6` 위험 #1, `fe-be-mismatch.md #23`)
  - acceptance criteria:
    - FE `domains/notices/store/admin/api.js:6` 의 `PATCH /admin/notices` → `PUT /admin/notices/{id}` 로 변경 (BE 표준에 맞춤)
    - thunks/endpoints.js 의 호출부 정합 갱신 (id 가 path param 이 되도록)
    - `AdminNoticeManagePage` 의 update flow 가 새 method/path 로 동작
  - 의존 API/테이블: `A.3` PUT `/api/admin/notices/{noticeId}` (`AdminNoticeController#updateNotice` line 48) — BE 미변경
  - 우선순위: **P0**
  - figma node: 해당 없음 (API 정합)

- [ ] **T3 — admin visible path fix** (P0)
  - 사용자 시나리오: 관리자가 공지 노출 ON/OFF 토글 시 정상 동작 (현재 FE PATCH `/admin/notices/visible` (body 에 id) ↔ BE PATCH `/admin/notices/{id}/visible` path 형식 차이 — `A.6` 위험 #2, `fe-be-mismatch.md #24`)
  - acceptance criteria:
    - FE `domains/notices/store/admin/api.js:7` 의 `/admin/notices/visible` → `/admin/notices/{id}/visible` 로 변경 (BE 표준에 맞춤)
    - thunks/endpoints.js 의 호출부 정합 갱신 (id 가 path param 으로)
    - `AdminNoticeManagePage` 의 visible toggle flow 가 새 path 로 동작
  - 의존 API/테이블: `A.3` PATCH `/api/admin/notices/{noticeId}/visible` (line 58) — BE 미변경
  - 우선순위: **P0**
  - figma node: 해당 없음 (API 정합)

- [ ] **T4 — public `/notice/:id` detail endpoint 연결** (P0)
  - 사용자 시나리오: 사용자가 공지 상세 진입 시 단건 fetch 로 데이터를 가져옴 (현재는 list 캐시 lookup — `A.3` BE 만 노출 `GET /api/notices/{noticeId}` 미연결)
  - acceptance criteria:
    - `useNoticeDetail` (또는 동일 역할 hook) 이 list 캐시 lookup 대신 `GET /notices/{id}` 단건 fetch 호출
    - `domains/notices/store/public/api.js`, `endpoints.js`, `thunks.js` 에 단건 fetch endpoint 추가
    - `/notice/:id` 직접 진입 (list 미경유) 시에도 정상 노출
  - 의존 API/테이블: `A.3` GET `/api/notices/{noticeId}` (`NoticeController#getNoticeDetail` line 29) — BE 미변경 (이미 노출됨)
  - 우선순위: **P0**
  - figma node: 미정 (public figma URL 미제공 — wireframe 단계 텍스트 모드)

- [ ] **T5 (결번)** — 횡단 dead 정리 (`NoticeLayout.jsx`, `CafeNotice.js`, `FunNotice.js`) 는 본 도메인 외 횡단 작업으로 분리. 본 라운드 task 화 안 함. 별도 정리 라운드에서 진행.

- [ ] **T6 — admin 4-capability 동작 정합 검증** (P0)
  - 사용자 시나리오: T1~T3 fix 적용 이후 admin 의 4 가지 핵심 capability (list / create / update / visible toggle) 가 끝-끝으로 정상 동작하는지 정합 QA (events T2 와 동일 패턴)
  - acceptance criteria:
    - **list**: GET `/api/admin/notices` 응답 정상 렌더링
    - **create**: POST `/api/admin/notices` (INTERNAL ↔ content / EXTERNAL ↔ externalUrl 필수 — DB CHECK 미러) 신규 등록 후 list refetch 반영
    - **update**: PUT `/api/admin/notices/{id}` (T2 fix 후) jsoup sanitize 동작 정상, 수정 내용 반영
    - **visible toggle**: PATCH `/api/admin/notices/{id}/visible` (T3 fix 후) ON/OFF 전환 후 public list 반영
  - 의존 API/테이블: `A.3` admin endpoint 4건, `A.4` `site_notices` (mapper 10 stmt)
  - 우선순위: **P0**
  - figma node: 해당 없음 (QA)

## B.3 데이터 모델 영향

- **`site_notices`** (`A.4`) 그대로 사용 — V2 active, mapper 10 stmt. V1 `notices` 는 이미 이전 완료 (legacy/이전완료 — `dual-management.md §10`)
- coupons 의 dual-write 와 달리 본 도메인은 **단방향 이전 완료** 상태 → 본 라운드 DB scope 변경 없음
- T2/T3/T4 모두 BE endpoint 측은 이미 표준 형태로 노출되어 있어 **DB / Mapper 변경 없음**

## B.4 KPI / 성공지표

- 측정 안 함 (표준 패턴 — coupons/events 와 동일)
- 정성적: T1~T3 fix 후 admin 운영 시 update / visible toggle 405/404 발생 0 건, T4 후 public detail 직접 진입 정상 노출

## B.5 디자인 / Figma 참조

- **public 모바일** (`NoticeScreen`, `NoticeDetailScreen`, HomeScreen NoticeSection): figma URL 미제공 → **wireframe-generator 단계에서 텍스트 wireframe 으로 정의**. 추후 figma 도착 시 별도 라운드
- **PC 어드민** (`AdminNoticeManagePage`): figma 미진행 (coupons/events 패턴 그대로) — 텍스트 wireframe → design-sync 보류

## B.6 Cross-domain 영향

- **home 도메인**: HomeScreen `NoticeSection` (`A.2`) — public list endpoint (`GET /notices`) 동일 사용. T4 (detail 단건 fetch) 적용 시 HomeScreen 진입 → 공지 카드 탭 → `/notice/:id` 흐름이 list 캐시 lookup 대신 단건 fetch 로 전환
- **admin 도메인**: `/admin/content/notice` 라우트 자체는 admin 도메인 마스터 표 (`_overview.md`) 에 등록되어 있음. T1 폴더 표준화는 라우트 등록 변경 없이 컴포넌트 위치만 이동

## B.7 후속 작업 (본 라운드 외)

- **T5 결번 — 횡단 dead 정리 별도 라운드**: `app/page/notice/NoticeLayout.jsx` (보존 정책 재확인), `data/{CafeNotice,FunNotice}.js` (즉시 삭제 가능 — `dead-confirmed.md 1-D`), `AuthCallBack.jsx` 중복 (`fe/dead-suspects.md A`)
- **BE 측 검증**: T2 (PUT) / T3 (PATCH `{id}/visible`) fix 적용 후 BE 단에서 실제 method/path 동작 (jsoup sanitize 포함) 재확인 — admin QA (T6) 의 일부로 수행
- **public figma 도착 시**: NoticeScreen / NoticeDetailScreen / HomeScreen NoticeSection 의 wireframe → design-sync → figma-update-spec 라운드

## B.8 Owner 결정 해소 기록 (도메인 한정)

- **A.8 — admin notice update method/path spot-check 후 fix 결정**:
  - ✅ 본 라운드 해소
  - 결정: **FE 를 BE 표준에 맞춤** (PUT `/admin/notices/{id}` + PATCH `/admin/notices/{id}/visible`)
  - 사유: BE 가 RESTful 표준 형태 (`{id}` path param) 로 이미 노출되어 있으며, 다른 도메인 (coupons, events) 과 일관성 유지. T2/T3 가 fix task
  - 글로벌 ★ 5건과 별개 (도메인 한정 결정)

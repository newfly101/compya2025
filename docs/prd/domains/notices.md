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

## B.1 기능 요구사항 (미작성 — Owner 채움)

> 이 섹션은 도메인별 상세 기획 시 채울 영역. A 섹션을 사실 baseline 으로 사용.

- [ ] 기능 1: ...
  - 사용자 시나리오:
  - acceptance criteria:
  - 의존 API/테이블:
- [ ] 기능 2: ...

## B.2 신규 기능 (미작성)

- [ ] ...

## B.3 우선순위 (미작성)

- P0 / P1 / P2

## B.4 KPI / 성공지표 (미작성)

## B.5 디자인 / Figma 참조 (미작성)

- figma-spec-validator 단계에서 채워질 영역

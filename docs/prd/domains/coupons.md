# 도메인: coupons

> **재작성 라운드 (2026-05-11)** — 본 문서는 두 입력을 통합한 PRD.
> - **(A) 현재 BE/FE 코드 reverse 기획** (사실 baseline)
> - **(B) 모바일 어드민 패널 신규 기획 prompt** (UI forward design)
>
> 본 PRD 는 7 sub-skill 오케스트레이션 결과물 (Part A~G).
> mismatch 항목 (코드 ↔ prompt) 은 `Part F.Z` / `Part G` 끝 "사용자 확인 필요" 섹션에 별도 정리.
> 강제 HITL 4 분야 (법무/결제/권한/DB 파괴적) 해당 사항 없음 — 자동 진행.

---

## Part A — IA (정보 구조)

### A.1 도메인 분류

- **public**: live (모바일 단일 화면 — `/coupons` + HomeScreen 미니)
- **admin**: ★ 신규 기획 진입 (UI 부재 상태 — `web/src/domains/coupons/store/admin/**` 만 존재. 페이지 컴포넌트는 2026-05-09 폐기됨)
- **모바일 우선 다크 테마 + 보라 #a78bfa 포인트** — 본 라운드 모든 신규 화면은 모바일 기준

### A.2 라우팅 / 진입 경로

| 라우트 | 화면 | 권한 | 진입점 | 상태 |
|---|---|---|---|---|
| `/coupons` | CouponScreen (public 전체 리스트) | permitAll | 사이드 메뉴 또는 HomeScreen 미니 카드 탭 | live |
| `/` 의 일부 | HomeScreen 미니 가로 스크롤 | permitAll | 홈 진입 시 자동 노출 | live |
| `/admin/coupons` | AdminCouponListPage (★ 신규) | ROLE_ADMIN | `/admin` (어드민 홈) → "쿠폰 관리" 메뉴 | ★ 신규 기획 |
| `/admin/coupons/new` | AdminCouponFormPage — 등록 (★ 신규) | ROLE_ADMIN | `/admin/coupons` → 우하단 FAB | ★ 신규 기획 |
| `/admin/coupons/:id` | AdminCouponFormPage — 수정 (★ 신규) | ROLE_ADMIN | `/admin/coupons` → 카드 탭 | ★ 신규 기획 |

> **🟨 가정**: `/admin/content/coupon` (구 PC 어드민 라우트) 은 폐기. 신규 라우트 prefix 는 `/admin/coupons` (prompt 기준) — 사용자 확정 필요.

### A.3 진입 메뉴 구조 (`/admin` 어드민 홈)

- 사이드 메뉴 하단 "관리자" 진입 (admin 권한 유저에게만 노출)
- 어드민 홈 = 대시보드 (도메인 카드 2x2 + 도메인별 리스트 메뉴)
- **본 PRD 범위**: coupon 만 상세. events / history-mode / quizzes / users / notices 는 placeholder (별도 PRD)

### A.4 폴더 구조 — 현행 + 신규

```
web/src/domains/coupons/
├── mobile/                                # public 모바일 (현행 보존)
│   ├── CouponScreen.jsx
│   ├── components/couponCard/CouponCard.jsx
│   ├── containers/public/
│   │   ├── CouponListHorizontal.jsx       # HomeScreen 미니
│   │   └── CouponListVertical.jsx         # /coupons 풀 리스트
│   └── hooks/useCouponList.js
├── feature/admin/                         # ★ 신규 admin UI (재구현)
│   ├── pages/
│   │   ├── AdminCouponListPage.jsx        # /admin/coupons
│   │   └── AdminCouponFormPage.jsx        # /admin/coupons/new + /admin/coupons/:id
│   ├── components/
│   │   ├── AdminCouponCard.jsx            # 리스트 카드 (좌측 3px border)
│   │   └── (FormField 류는 글로벌 admin 공용 컴포넌트 사용 권고)
│   └── hooks/useAdminCouponDetail.js      # 수정 모드 상세 fetch
└── store/                                 # 데이터 레이어 (현행 보존)
    ├── admin/    { api.js, endpoints.js, thunks.js }
    ├── public/   { api.js, endpoints.js, thunks.js }
    └── slices.js
```

### A.5 글로벌 admin 공용 컴포넌트 (★ 신규 — coupon 도메인 외)

prompt 요청 항목. 본 PRD 범위 밖이지만 coupon 이 첫 도입 도메인이므로 필요 컴포넌트 명세를 cite.

- `<AdminListLayout>` — TopBar (뒤로가기 / 타이틀 / 검색) + 필터 칩 + 리스트 슬롯 + FAB 슬롯
- `<AdminFormLayout>` — TopBar (X 취소 / 타이틀 / 저장) + 폼 슬롯 + 하단 삭제 슬롯 (수정 모드)
- `<AdminCard>` — 좌측 3px border + 제목 + 보조 텍스트 + 상태 배지 + opacity 처리
- `<AdminFormField>` — 라벨 + 인풋 (다크 박스). 우측 액션 버튼 슬롯 (예: ti-refresh)
- `<AdminStatCard>` — 어드민 홈 대시보드용 (2x2 통계 카드)

> **🟨 가정**: 위 글로벌 컴포넌트는 `web/src/global/ui/admin/` 하위에 작성 권고. 본 PRD 에서 코드 위치 확정 X — admin 도메인 PRD 에서 결정.

---

## Part B — Requirements (요구사항)

### B.1 사용자 역할

| 역할 | 권한 | 본 도메인 capability |
|---|---|---|
| guest | 비로그인 | public 쿠폰 조회만 |
| user | 로그인 일반 | public 쿠폰 조회만 (guest 와 동일) |
| admin | ROLE_ADMIN | public 조회 + admin 등록/수정/노출 토글 |

> **사실 baseline**: BE `SecurityConfig.java:57` — `/api/admin/**` hasRole(ADMIN). 그 외 `/api/**` permitAll.
> `@PreAuthorize("hasRole('ADMIN')")` 가 `CouponAdminController.java:18` 에 부착 + `@EnableMethodSecurity` 활성화 (`SecurityConfig.java:28`) → URL 가드 + 메서드 가드 이중 보호.

### B.2 사용자 기능 (public)

| 기능 ID | 기능명 | 권한 | 우선순위 |
|---|---|---|---|
| FN-PUB-1 | 쿠폰 전체 리스트 조회 (`/coupons`) | permitAll | P0 (live) |
| FN-PUB-2 | HomeScreen 미니 가로 리스트 노출 | permitAll | P0 (live) |
| FN-PUB-3 | 쿠폰 카드 → 외부 사이트 (withhive.me) 이동 | permitAll | P0 (live) |
| FN-PUB-4 | 만료 쿠폰 별도 섹션 노출 ("종료된 쿠폰") | permitAll | P0 (live) |

### B.3 관리자 기능 (admin)

| 기능 ID | 기능명 | 권한 | 우선순위 |
|---|---|---|---|
| FN-ADM-1 | 쿠폰 리스트 조회 (visible / hidden 모두) | ROLE_ADMIN | P0 |
| FN-ADM-2 | 쿠폰 신규 등록 (couponCode UNIQUE) | ROLE_ADMIN | P0 |
| FN-ADM-3 | 쿠폰 수정 (전체 필드) | ROLE_ADMIN | P0 |
| FN-ADM-4 | 쿠폰 노출 토글 (visible 단일 PATCH) | ROLE_ADMIN | P0 |
| FN-ADM-5 | 필터 칩 — 전체 / 활성 / 만료 / 비활성 | ROLE_ADMIN | P1 (UI only — server filter 없음) |
| FN-ADM-6 | 검색 (제목 / coupon_code) | ROLE_ADMIN | P2 (UI only — server filter 없음) |
| FN-ADM-7 | 쿠폰 삭제 (수정 모드 하단 빨간 버튼) | ROLE_ADMIN | ❓ **미정** — BE DELETE 엔드포인트 부재 |

> **❓ 미정 (FN-ADM-7)**: prompt 는 "수정 모드 하단 빨간 외곽선 삭제 + confirm 모달" 명세. 그러나 BE 에 `DELETE /api/admin/coupons/{id}` 엔드포인트 **없음** (`CouponAdminController.java` 에 미정의). `CouponMessages.COUPON_DELETED` enum 만 존재 (`CouponMessages.java:16` — 주석 "삭제 로직 추가 시 사용").
> **처리 옵션 (사용자 결정 필요)**:
> - (A) BE DELETE 엔드포인트 신규 추가 (mapper / repository / service / controller 4 layer) — DB 파괴적 변경 (DELETE) → 🔴 **위험** 마커 (HITL 강제)
> - (B) "삭제" UI 를 "비활성화 (visible=false)" 로 대체 — 기존 PATCH visible 재사용. 데이터 보존
> - (C) prompt 무시 — 삭제 기능 제외
>
> **🟨 가정 (default)**: (B) 권고 — 외부 발급 쿠폰 등록 방식 정책상 데이터 보존이 안전. UI 라벨은 "비활성화" + confirm 모달.

### B.4 비기능 요구사항 (NFR)

| 항목 | 요구 |
|---|---|
| 캐시 | `coupons` cache (Spring `@Cacheable`) — public/admin 리스트 모두 — `CouponUserServiceImpl.java:24` / `CouponAdminServiceImpl.java:30` |
| 캐시 evict | 쓰기 작업 (create/update/visible) 후 트랜잭션 commit 시점에 `admin` + `public` 키 동시 evict — `@CacheEvictAfterCommit` (`CacheEvictAfterCommitAspect.java:19-31`) |
| 시간대 | KST 기준 (만료일 표시 / 활성-만료 분류) — **현행 fix 필요 항목** (Part F 참조) |
| 외부 URL | `COUPON_BASE_URL` env 변수 (현행 `web/src/config/env.js`). 하드코딩 제거 완료 |

---

## Part C — Policy (정책 결정)

### C.1 외부 발급 쿠폰 등록 방식 (사용자 명시 정책)

- **본 사이트는 다른 회사가 발급한 쿠폰 코드를 노출만 하는 채널**.
- 발급 / 사용 / 유저 보유 모델 **도입 안 함** — 즉 다음 모델 없음:
  - 사용자별 쿠폰 보유 (user_coupons 테이블)
  - 쿠폰 사용 처리 (use / redeem 엔드포인트)
  - 발급 수량 제한 / 1인 1회 제한
- 사용자가 카드의 "바로가기" 버튼을 누르면 외부 사이트 (`COUPON_BASE_URL/{code}`) 로 이동 — 이후 흐름은 외부 책임.

> **사유 (기획자 의견)**: 외부 발급 정책상 본 사이트는 큐레이션 + 노출 채널만 담당. 발급/사용 모델을 도입하면 외부 사이트와 정합성 충돌 위험 → 의도적 단순화.

### C.2 만료 쿠폰 노출 정책

- 만료 (expire_at < now) 쿠폰도 visible=true 면 **노출 OK** (현행 정책 — 사용자 결정).
- public `/coupons` 화면은 "최신 쿠폰" + "종료된 쿠폰" 2 섹션으로 분리 (`CouponScreen.jsx:10-22`).
- admin 리스트는 만료 여부 무관 전체 노출 + 필터 칩으로 분류 (FN-ADM-5).

### C.3 visible (노출 여부) 정책

- BE 컬럼명: `is_visible BOOLEAN NOT NULL DEFAULT true` (`CREATE_TABLE_SITE.sql:8`)
- DTO 명: `visible` (mapper alias: `is_visible AS visible` — `CouponMapper.xml:14,29`)
- **PATCH visible 단일 엔드포인트** 분리 — 전체 PATCH 와 별개로 운영 (`CouponAdminController.java:49`)
- 사유: 운영 토글 빠르게 — 다른 필드 영향 없이 즉시 활성/비활성

### C.4 캐시 정책

| 캐시 키 | 데이터 | TTL | evict 트리거 |
|---|---|---|---|
| `coupons::public` | public 리스트 (visible=true 만) | (Java in-memory ConcurrentMap — TTL 없음) | create/update/visible PATCH 후 commit |
| `coupons::admin` | admin 리스트 (전체) | 동일 | 동일 |

> **사실**: `CacheConfig.java` 제거됨 (commit `3473830` — Java in-memory ConcurrentMap 채택). Caffeine / Redis 미사용.

### C.5 권한 정책

- public: permitAll (`/api/coupons`)
- admin: hasRole(ADMIN) (URL 가드 + `@PreAuthorize` 메서드 가드 — 이중)
- **🔴 위험 마커 (없음)**: 권한 분야 정책 변경 X. 현행 유지.

### C.6 UNIQUE 제약 정책

- `coupon_code VARCHAR(100) NOT NULL UNIQUE` — DB 레벨 강제
- 중복 INSERT → `DataIntegrityViolationException` → BaseException(`COUPON_CODE_DUPLICATED`, 409) — `CouponAdminServiceImpl.java:50-52`

### C.7 Owner 결정 항목 (해소 완료 / 유지)

- **dual-write 정책**: 단방향 정리 완료. V1 `coupons` 테이블 read fallback 제거됨 (`CouponMapper.xml:35-47` 가 site_coupons 단일 출처) — 현행 코드는 안정.
  - V1 → V2 INSERT only 마이그레이션 (P1) / V1 DROP (P2) 은 별도 라운드.
  - 본 PRD 라운드에서는 **현 안정 상태 유지** 만 확인.

---

## Part D — Feature Spec (admin UI 모바일 신규)

> Given/When/Then = 주어진 상황 / 행동 / 결과
>
> 본 섹션은 prompt (입력 B) 의 admin UI 명세를 코드 reverse 와 정합되게 풀어 쓴 것.
> mismatch 항목 (보상 / 사용 제한 / 시작일) 은 `Part F.Z` 별도 섹션.

### D.1 화면: AdminCouponListPage (`/admin/coupons`)

#### 시각 요소

- **TopBar**: 뒤로가기 (←) / 타이틀 "쿠폰" / 검색 아이콘 (우측)
- **필터 칩** (가로 스크롤): 전체 / 활성 / 만료 / 비활성
  - "활성" = visible=true AND expire_at >= now
  - "만료" = visible=true AND expire_at < now
  - "비활성" = visible=false
- **카드 리스트** (세로): `<AdminCouponCard>` 반복
  - 좌측 3px border-left:
    - 활성 → 보라 (`#a78bfa`)
    - 만료 / 비활성 → 회색 (`#3a3a45`)
  - 카드 내부:
    - 제목 (title)
    - coupon_code (작게)
    - 상태 배지 (활성 / 만료 / 비활성)
    - 만료일 ("YYYY-MM-DD HH:mm 까지")
  - 만료 / 비활성 카드는 opacity 0.6
- **FAB**: 우하단 보라 원형 + 플러스 → `/admin/coupons/new`

#### 시나리오

**S-D1-1 (admin 진입 → 리스트 노출)**
- **Given** admin 권한 유저가 어드민 홈에서 "쿠폰 관리" 메뉴 탭
- **When** `/admin/coupons` 진입
- **Then** GET `/api/admin/coupons` 호출 → site_coupons 전체 (visible 무관) 카드 리스트 노출
- **분기**:
  - 응답 빈 배열 → "등록된 쿠폰이 없습니다" empty state + FAB 강조
  - 응답 401 → AuthGuard 가 `/` 로 redirect
  - 응답 403 → AuthGuard 가 `/` 로 redirect (admin 아닌 user 가 강제 진입한 경우)

**S-D1-2 (필터 칩 클릭)**
- **Given** 리스트 노출 상태
- **When** "활성" 칩 탭
- **Then** 클라이언트 사이드 필터 (visible=true AND expire_at >= now) 만 렌더링
- **사유**: 서버 필터 없음 (`/api/admin/coupons` 는 전체 반환). FE 에서 필터.

**S-D1-3 (FAB 탭)**
- **Given** 리스트 노출 상태
- **When** FAB 탭
- **Then** `/admin/coupons/new` 진입 (등록 폼)

**S-D1-4 (카드 탭)**
- **Given** 리스트 노출 상태
- **When** 특정 쿠폰 카드 탭
- **Then** `/admin/coupons/{id}` 진입 (수정 폼)

### D.2 화면: AdminCouponFormPage — 등록 (`/admin/coupons/new`)

#### 시각 요소

- **TopBar**: X (취소) / 타이틀 "쿠폰 등록" / "저장" 버튼
- **폼 필드** (라벨 → 인풋 수직 배치, 다크 박스):
  - 쿠폰 코드 (자동생성 / 수동수정 가능, 우측 ti-refresh 아이콘)
  - 쿠폰 이름 (title)
  - 설명 (detail)
  - 유효기간 — **❓ 미정**: prompt = "시작~종료" / BE = `expire_at` 만 (시작일 컬럼 없음)
  - 보상 (스타/재화/카드팩) — **❓ 미정**: BE 컬럼 부재 (Part F.Z 참조)
  - 사용 제한 횟수 — **❓ 미정**: BE 컬럼 부재 (Part F.Z 참조)
  - 활성 여부 (visible 토글)
- 등록 모드: 하단 삭제 버튼 **없음**

#### 시나리오

**S-D2-1 (자동생성)**
- **Given** 등록 폼 진입 직후
- **When** 클라이언트 측 자동생성 (예: `WELCOME_${YYYYMMDDHHmm}` 패턴 — 🟨 **가정** — 사용자 패턴 확정 필요)
- **Then** 쿠폰 코드 인풋이 자동 채움. 사용자가 수정 가능.

**S-D2-2 (저장 — 정상)**
- **Given** 모든 필드 채움 (쿠폰 코드 / 이름 / 설명 / expireAt / visible)
- **When** "저장" 탭
- **Then**:
  - POST `/api/admin/coupons` 호출 (body: CouponRequest)
  - 200 → 성공 토스트 ("쿠폰이 등록되었습니다") → `/admin/coupons` redirect
  - 캐시 evict 후 리스트 재조회 시 신규 쿠폰 즉시 반영

**S-D2-3 (저장 — couponCode 중복)**
- **Given** 기존 쿠폰과 동일한 couponCode 입력
- **When** "저장" 탭
- **Then**:
  - 409 `COUPON_CODE_DUPLICATED` 응답
  - "이미 사용 중인 쿠폰 코드입니다" 토스트 + 쿠폰 코드 인풋 빨간 외곽 (필드 에러)
  - 폼 유지 (페이지 이동 X)

**S-D2-4 (취소 — X 탭)**
- **Given** 폼 일부 입력 상태
- **When** X 탭
- **Then**:
  - 변경사항 있으면 confirm 모달 ("작성 중인 내용이 있습니다. 취소하시겠습니까?")
  - 확인 → `/admin/coupons` redirect / 취소 → 폼 유지

### D.3 화면: AdminCouponFormPage — 수정 (`/admin/coupons/:id`)

#### 시각 요소

- D.2 와 동일 + **하단 빨간 외곽선 "삭제" 버튼** (D.2 차이점)
- 진입 시 GET `/api/admin/coupons` 후 클라이언트 측 find by id (또는 별도 GET — 🟨 **가정**: 단건 GET 엔드포인트 부재 → 리스트 캐시 활용)

#### 시나리오

**S-D3-1 (수정 폼 진입)**
- **Given** admin 이 카드 탭으로 진입
- **When** `/admin/coupons/{id}` 진입
- **Then**:
  - 리스트 캐시에서 해당 id 의 쿠폰 데이터 채움
  - 캐시 미존재 시 GET `/api/admin/coupons` 재호출 후 find
  - id not found → "쿠폰을 찾을 수 없습니다" 토스트 + `/admin/coupons` redirect

**S-D3-2 (수정 — 정상)**
- **Given** 폼 일부 필드 변경
- **When** "저장" 탭
- **Then**:
  - PATCH `/api/admin/coupons/{id}` (body: CouponRequest)
  - 200 → 성공 토스트 → `/admin/coupons` redirect
  - 캐시 evict 후 리스트 재조회 반영

**S-D3-3 (삭제 — 🟨 가정 default = 비활성화 대체)**
- **Given** 수정 모드, 하단 "비활성화" 버튼 노출 (라벨 변경 — Part B.3 FN-ADM-7 참조)
- **When** 버튼 탭 → confirm 모달 ("이 쿠폰을 비활성화하시겠습니까?") → 확인
- **Then**:
  - PATCH `/api/admin/coupons/{id}/visible` (body: `{visible: false}`)
  - 200 → "비활성화되었습니다" 토스트 → `/admin/coupons` redirect
- **대안 (옵션 A 채택 시)**: DELETE `/api/admin/coupons/{id}` 신규 BE → 데이터 영구 삭제 → 🔴 **위험** (DB 파괴적)

### D.4 화면: 어드민 홈 `/admin` (placeholder — coupon 관련 부분만)

- 대시보드 통계 (2x2): "활성 쿠폰" 카운트 카드 (`<AdminStatCard>`)
  - 데이터 소스: GET `/api/admin/coupons` 결과 → visible=true AND expire_at >= now 카운트
- 관리 메뉴 리스트 (수직): "쿠폰 관리" 행 → 탭 시 `/admin/coupons` 이동
- 그 외 도메인 항목 (events / history-mode / quizzes / users / notices) 은 별도 PRD 범위

---

## Part E — Endpoint Spec Draft (BE reverse — 사실 정확)

> 본 섹션은 BE 코드 reverse — **확정 사실**. mock / draft 가 아님.
> 신규 endpoint 는 D 섹션 미정 항목에 한해 별도 표시.

### E.1 엔드포인트 5개 (현행 BE)

| # | METHOD | PATH | 컨트롤러:line | 권한 | Request Body | Response | 비고 |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/coupons` | `CouponController.java:21` | permitAll | (없음) | `GlobalResponse<List<CouponResponse>>` | visible=true 만 SELECT |
| 2 | GET | `/api/admin/coupons` | `CouponAdminController.java:25` | ROLE_ADMIN | (없음) | `GlobalResponse<List<CouponResponse>>` | 전체 SELECT (visible 무관) |
| 3 | POST | `/api/admin/coupons` | `CouponAdminController.java:33` | ROLE_ADMIN | `CouponRequest` | `GlobalResponse<CouponResponse>` | INSERT site_coupons + findById readback |
| 4 | PATCH | `/api/admin/coupons/{id}` | `CouponAdminController.java:40` | ROLE_ADMIN | `CouponRequest` | `GlobalResponse<CouponResponse>` | dynamic UPDATE (`<set>` + `<if>`) |
| 5 | PATCH | `/api/admin/coupons/{id}/visible` | `CouponAdminController.java:49` | ROLE_ADMIN | `CouponVisibleRequest` (`{visible: boolean}`) | `GlobalResponse<Void>` | visible 단일 UPDATE |

### E.2 DTO 정확 명세

**CouponRequest** (`dto/request/CouponRequest.java`)
```java
record CouponRequest(
    String couponCode,                                      // UNIQUE
    String title,
    String detail,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime expireAt,
    Boolean visible                                         // ★ wrapper Boolean — null 허용
) {}
```

> **중요 사실**: `visible` 은 `Boolean` (wrapper) — `null` 입력 시 mapper `<if test="visible != null">` 로 UPDATE 제외.
> 즉 PATCH 시 visible 미포함 body 보내면 visible 필드는 그대로 유지 (강제 덮어쓰기 차단됨). Part F 참조.

**CouponVisibleRequest** (`dto/request/CouponVisibleRequest.java`)
```java
record CouponVisibleRequest(
    boolean visible                                         // primitive — null 불허
) {}
```

**CouponResponse** (`dto/response/CouponResponse.java`)
```java
record CouponResponse(
    Long id,
    String couponCode,
    String title,
    String detail,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime expireAt,
    boolean visible
) {}
```

### E.3 응답 메시지 enum (`CouponMessages.java`)

| enum | 용도 | HTTP |
|---|---|---|
| `COUPON_SUCCESS` | 조회 성공 | 200 |
| `COUPON_NOT_FOUND` | 수정/visible 시 id 없음 | 404 |
| `COUPON_CREATED` | 등록 성공 | 200 |
| `COUPON_CREATED_FAILED` | INSERT 0 row 또는 readback 실패 | 500 |
| `COUPON_CODE_DUPLICATED` | UNIQUE 위반 | 409 |
| `COUPON_UPDATED` | 수정 성공 | 200 |
| `COUPON_UPDATED_FAILED` | UPDATE 0 row | 500 |
| `COUPON_VISIBLE_UPDATED` | visible 변경 성공 | 200 |
| `COUPON_DELETED` | (미사용 — enum 만 정의) | — |

### E.4 DB 스키마 (`site_coupons`)

```sql
CREATE TABLE site_coupons
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    detail      VARCHAR(500),
    expire_at   DATETIME     NOT NULL,
    is_visible  BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> 컬럼 매핑: `is_visible AS visible` (mapper alias). DTO 는 `visible` 단일 명칭 유지.

### E.5 신규 엔드포인트 후보 (Part F.Z mismatch 항목 의존)

> 본 라운드에서 BE 신규 작성 **권고 X** — 사용자 확인 후 별도 라운드 진행.

| 후보 | 사유 | HITL |
|---|---|---|
| GET `/api/admin/coupons/{id}` 단건 조회 | 수정 폼 진입 시 단건 fetch (현재 리스트 캐시 활용) | 일반 — 단순 추가 |
| DELETE `/api/admin/coupons/{id}` | 수정 모드 "삭제" 버튼 (옵션 A) | 🔴 DB 파괴적 — HITL 강제 |
| 검색 / 페이지네이션 (GET 쿼리 파라미터) | FN-ADM-5/6 서버 필터 | 일반 — 현재 cache stale 위험 증가 |
| reward / usage_limit / start_at 컬럼 추가 | prompt mismatch (Part F.Z) | 일반 — schema 확장 |

---

## Part F — Edge Cases (예외 케이스)

### F.1 UNIQUE 위반 (couponCode 중복)

- **트리거**: POST `/api/admin/coupons` 또는 PATCH `/api/admin/coupons/{id}` 시 다른 row 와 동일한 couponCode 입력
- **동작**:
  - DB → `Duplicate entry '...' for key 'coupon_code'`
  - Spring → `DataIntegrityViolationException`
  - Service → catch → `BaseException(COUPON_CODE_DUPLICATED, 409)` (`CouponAdminServiceImpl.java:50-52`)
- **FE 처리**: 토스트 "이미 사용 중인 쿠폰 코드입니다" + 폼 유지 + 쿠폰 코드 필드 에러 강조

> ⚠ **PATCH 의 동일 case**: 현재 service `updateCoupon` 은 try-catch 없음 (`CouponAdminServiceImpl.java:58-68`) → DataIntegrityViolation 이 그대로 GlobalExceptionHandler 로 전파될 수 있음. 운영 시 500 응답 가능 — BE 보강 권고 항목 (Part G QA 참조).

### F.2 만료 쿠폰 처리

- **public**: `useCouponList.js:14-19` 에서 클라이언트 시각 (`new Date()`) 기준으로 active / expired 분리
  - **버그 가능성**: `formatNow()` 결과 vs `expireAt` (BE format `"yyyy-MM-dd HH:mm"`) 문자열 비교 — 시간대 정확성 / 형식 일치 확인 필요
- **admin**: 만료여도 노출 (visible=true 유지). 필터 칩 "만료" 로 분류만.

### F.3 캐시 stale

- **시나리오**: admin A 가 쿠폰 등록 → admin B 의 리스트 화면이 stale 일 수 있음
- **현행 동작**: `@CacheEvictAfterCommit` 가 commit 시점에 `coupons::admin` + `coupons::public` 동시 evict → 다음 GET 시 재조회 → stale 해소
- **잔존 위험**: 다중 인스턴스 환경 시 Java in-memory cache 는 인스턴스 별 분리 → 인스턴스 A 의 evict 가 B 에 전파 X
  - 🟨 **가정**: 본 사이트는 단일 인스턴스 운영 (사용자 명시 컨텍스트 — Caffeine / Redis 미도입). 다중 인스턴스 시 Redis pub/sub 등 별도 도입 필요 — 별도 라운드.

### F.4 PATCH visible 강제 덮어쓰기 차단 (Boolean wrapper 효과)

- **시나리오**: admin 이 PATCH `/api/admin/coupons/{id}` 로 (couponCode/title/detail) 만 변경하고 싶음. visible 은 그대로 유지하고 싶음.
- **현행 동작**:
  - `CouponRequest.visible` 은 `Boolean` (wrapper) — body 에 visible 미포함 시 null
  - mapper `<if test="visible != null">` 로 visible 필드는 UPDATE SET 에서 제외 → 기존 값 유지
- **FE 권고**: PATCH body 작성 시 변경하지 않을 visible 은 명시적으로 null 또는 누락 — 강제 덮어쓰기 방지

> **사유 (기획자 의견)**: BE 가 의도적으로 wrapper Boolean 채택 → 부분 수정 안전성 확보. FE 폼은 현재 visible 토글 값을 명시적으로 보내고 있어 차단 효과 미발현. 향후 "visible 만 안 건드림" 시나리오 도입 시 활용 가능.

### F.5 createCoupon readback 실패

- **시나리오**: INSERT 성공 → findById 실패 (DB lag / replication 지연 등 — 현재 단일 DB 라 가능성 낮음)
- **현행 동작**: `BaseException(COUPON_CREATED_FAILED, 500)` 응답 (`CouponAdminServiceImpl.java:46-47`)
- **FE 처리**: 500 토스트 "쿠폰 등록에 실패했습니다. 잠시 후 다시 시도해주세요"

### F.6 PATCH visible — 존재하지 않는 id

- **시나리오**: admin 이 이미 삭제된 (또는 존재하지 않는) id 로 PATCH visible
- **현행 동작**: `findById` 가 빈 Optional → `BaseException(COUPON_NOT_FOUND, 404)` (`CouponAdminServiceImpl.java:74-75`)
- **FE 처리**: 404 토스트 "쿠폰을 찾을 수 없습니다" + 리스트 재조회

### F.7 외부 URL 이동 — 쿠폰 코드 특수문자

- **시나리오**: couponCode 에 URL-unsafe 문자 (예: `&`, `?`, `#`) 가 있으면 외부 사이트 이동 시 깨짐
- **현행 동작**: `CouponCard.jsx:12` — `window.open(\`${COUPON_BASE_URL}/${coupon.couponCode}\`, "_blank")` — encodeURIComponent 미적용
- **권고**: `encodeURIComponent(coupon.couponCode)` 적용. 본 라운드 fix 권고 (P1).

### F.Z mismatch — prompt 폼 필드 vs BE schema

> 🟨 **가정 마커** + ❓ **미정 마커** — 사용자 결정 후 별도 라운드 진행.

| prompt 필드 | BE 컬럼 | 상태 | 처리 옵션 |
|---|---|---|---|
| 쿠폰 코드 | `coupon_code` | ✅ 정합 | — |
| 쿠폰 이름 | `title` | ✅ 정합 | — |
| 설명 | `detail` | ✅ 정합 | — |
| 유효기간 **종료** | `expire_at` | ✅ 정합 | — |
| 유효기간 **시작** (start_at) | (부재) | ❓ **미정** | (1) BE schema 확장 — `start_at DATETIME NULL` 추가 / (2) 시작일 무시 — UI 에서 노출 X / (3) "등록일 (created_at) = 시작일" 간주 |
| 보상 (스타/재화/카드팩) | (부재) | ❓ **미정** | (1) BE schema 확장 — `reward_type ENUM`, `reward_amount INT` 추가 / (2) detail 텍스트에 통합 / (3) 보상 필드 무시 |
| 사용 제한 횟수 | (부재) | ❓ **미정** | (1) BE schema 확장 — `usage_limit INT NULL` 추가 (외부 발급 정책상 본 사이트는 사용 추적 X → 단순 메타정보) / (2) 무시 |
| 활성 여부 | `is_visible` (DTO `visible`) | ✅ 정합 | — |

> **🟨 기획자 의견 (default 권고)**:
> - **start_at**: 옵션 (3) "등록일 = 시작일 간주" — schema 변경 회피. UI 에서 시작일 라벨 표시 위치만 결정.
> - **reward**: 옵션 (2) detail 텍스트에 자연어로 표기 ("스타 100개 / 카드팩 1개" 등) — 외부 발급 정책상 본 사이트는 보상 메타데이터 정합성 책임 X.
> - **usage_limit**: 옵션 (2) 무시 — 외부 발급 정책상 사용 추적 X. 표시 자체가 사용자 혼동 유발 가능.
>
> **❓ 사용자 결정 필요**: 위 default 채택 또는 schema 확장 결정.

---

## Part G — QA Checklist

### G.1 Public (FN-PUB-1 ~ FN-PUB-4)

- [ ] `/coupons` 진입 시 GET `/api/coupons` 호출됨
- [ ] visible=true 쿠폰만 노출 (visible=false 는 빠짐) — BE 가 SQL `WHERE is_visible = true` 로 필터
- [ ] "최신 쿠폰" 섹션 = expire_at >= now / "종료된 쿠폰" 섹션 = expire_at < now
- [ ] 만료 카드는 opacity 적용 + "바로가기" 버튼 비활성 (`CouponCard.jsx:9-10`)
- [ ] 카드 탭 → `${COUPON_BASE_URL}/${coupon.couponCode}` 외부 이동
- [ ] 빈 응답 시 빈 상태 메시지 노출 (current: 빈 div — 보강 권고)
- [ ] `formatNow` 시간대 / 형식 정합 — KST 기준 active / expired 분류 정확

### G.2 Admin — 리스트 (FN-ADM-1, FN-ADM-5)

- [ ] `/admin/coupons` 진입 시 GET `/api/admin/coupons` 호출됨
- [ ] visible 무관 전체 노출 (visible=false 도 표시)
- [ ] 카드 좌측 border 색: 활성=보라 / 만료=회색 / 비활성=회색 (3상태)
- [ ] 만료 / 비활성 카드 opacity 0.6
- [ ] 필터 칩: 전체 / 활성 / 만료 / 비활성 — 클라이언트 사이드 필터 정확
- [ ] FAB 탭 → `/admin/coupons/new` 이동
- [ ] 카드 탭 → `/admin/coupons/{id}` 이동
- [ ] 비admin 진입 시 AuthGuard 가 `/` 로 redirect
- [ ] 빈 리스트 empty state 노출

### G.3 Admin — 등록 (FN-ADM-2)

- [ ] 자동생성 쿠폰 코드 패턴 명세대로 채움
- [ ] 모든 필수 필드 (쿠폰 코드 / 이름 / expireAt) 미입력 시 저장 비활성
- [ ] 저장 → POST `/api/admin/coupons` 호출
- [ ] 200 → 토스트 + `/admin/coupons` redirect + 리스트 즉시 반영 (캐시 evict 효과)
- [ ] 409 (couponCode 중복) → 토스트 + 폼 유지 + 필드 에러 강조
- [ ] 500 (CREATED_FAILED) → 토스트 + 폼 유지
- [ ] 취소 (X) → 변경사항 있으면 confirm 모달

### G.4 Admin — 수정 (FN-ADM-3)

- [ ] 폼 진입 시 기존 값 채움 (리스트 캐시 또는 재조회)
- [ ] id not found → 토스트 + `/admin/coupons` redirect
- [ ] 부분 수정 (visible 미변경) → BE 가 visible 기존 값 유지 (Boolean wrapper 효과)
- [ ] 저장 → PATCH `/api/admin/coupons/{id}` 호출
- [ ] 200 → 토스트 + `/admin/coupons` redirect + 캐시 evict
- [ ] 404 → 토스트 + 리스트 redirect
- [ ] couponCode 중복 → 🔴 **검증 필요** (현재 service 에 try-catch 없음 — Part F.1 참조)

### G.5 Admin — 노출 토글 (FN-ADM-4)

- [ ] PATCH `/api/admin/coupons/{id}/visible` body = `{visible: true|false}`
- [ ] 200 → 토스트 + 리스트 즉시 반영
- [ ] 404 → 토스트
- [ ] visible 토글 후 public `/coupons` 에 즉시 반영 (캐시 evict 효과 — `coupons::public` key 도 함께 evict)

### G.6 Admin — 삭제 / 비활성화 (FN-ADM-7) — 🟨 default 권고: 비활성화로 대체

- [ ] 수정 모드 하단 "비활성화" 버튼 노출 (등록 모드 에서는 미노출)
- [ ] 탭 시 confirm 모달
- [ ] 확인 → PATCH visible (false)
- [ ] (옵션 A 채택 시) DELETE `/api/admin/coupons/{id}` BE 신규 추가 — 🔴 DB 파괴적

### G.7 캐시 / 동시성

- [ ] 등록 / 수정 / visible 토글 후 `coupons::admin` + `coupons::public` 동시 evict
- [ ] 트랜잭션 rollback 시 evict 호출 X (`@CacheEvictAfterCommit` afterCommit 만)
- [ ] 단일 인스턴스 가정 — 다중 인스턴스 시 캐시 정합 별도 검증 (별도 라운드)

### G.8 권한 / 보안

- [ ] guest / user 가 `/api/admin/coupons*` 호출 시 401/403 반환 후 메인 화면으로 redirect
- [ ] admin 만 `/admin/coupons*` 라우트 진입 가능 (AuthGuard `allow="ADMIN"`)
- [ ] JWT 만료 시 401 → AuthGuard redirect
- [ ] 외부 URL 이동 시 `couponCode` URL-encode 처리 (Part F.7 — 권고)

### G.9 사용자 확인 필요 항목 (HITL)

> 본 라운드 자동 진행 X — 별도 답변 후 후속 라운드 진행.

| # | 항목 | default 권고 | 결정 옵션 |
|---|---|---|---|
| Q1 | `/admin/coupons` 라우트 prefix 확정 | `/admin/coupons` (prompt 기준) | 또는 `/admin/content/coupon` 유지 |
| Q2 | 자동생성 쿠폰 코드 패턴 | `WELCOME_${YYYYMMDDHHmm}` (🟨 가정) | 사용자 정의 패턴 / 자동생성 미적용 |
| Q3 | 삭제 (FN-ADM-7) 처리 | (B) 비활성화로 대체 | (A) BE DELETE 신규 (🔴 DB 파괴적) / (C) 기능 제외 |
| Q4 | 시작일 (start_at) | (3) 등록일 간주 | (1) schema 확장 / (2) 무시 |
| Q5 | 보상 필드 | (2) detail 텍스트 통합 | (1) schema 확장 / (3) 무시 |
| Q6 | 사용 제한 횟수 | (2) 무시 | (1) schema 확장 |
| Q7 | 단건 조회 GET `/api/admin/coupons/{id}` 신규 | 현재 리스트 캐시 재활용 | 신규 엔드포인트 추가 |
| Q8 | 검색 / 페이지네이션 (FN-ADM-5/6) | 클라이언트 사이드 (P1/P2) | 서버 필터 도입 (별도 라운드) |
| Q9 | PATCH (전체 수정) couponCode 중복 시 try-catch 누락 | BE 보강 권고 (Part F.1) | — |
| Q10 | `formatNow` 시간대 정합 (Part F.2) | 본 라운드 외 — 별도 fix 라운드 | — |

> Q1~Q8 = UI / 폼 / 신규 endpoint 결정 (UI 트랙 의존)
> Q9~Q10 = BE 코드 보강 (BE 트랙 의존)

---

## Part H — 후속 단계 (구현 트랙 분리 권고)

### H.1 권고 트랙 분리

본 PRD 합의 후 다음 트랙 병렬 진행 권고 (`CLAUDE.md` 트랙 분류 기준):

| 트랙 | 작업 | 산출물 위치 |
|---|---|---|
| **planner** | 본 PRD 의 Q1~Q8 사용자 답변 수집 → 별도 후속 라운드 (admin UI 신규 기획 promote) | `docs/prd/domains/coupons.md` 갱신 |
| **designer** | admin Figma 신규 작성 (현재 admin Figma 부재) — wireframe + design-sync | `docs/prd/wireframes/coupons-admin.md`, `docs/prd/design-sync/coupons-admin.md` |
| **develop (FE)** | (Q1~Q8 확정 후) `web/src/domains/coupons/feature/admin/**` 재구현 + 글로벌 admin 공용 컴포넌트 (`<AdminListLayout>` / `<AdminFormLayout>` / `<AdminCard>` / `<AdminFormField>` / `<AdminStatCard>`) | `web/src/domains/coupons/feature/admin/`, `web/src/global/ui/admin/` |
| **develop (BE)** | (선택) Q3-A 채택 시 DELETE 엔드포인트 / Q4-Q6 schema 확장 / Q9 PATCH try-catch 보강 | `domain/coupon/**`, `sql/V2/site/CREATE_TABLE_SITE.sql` |
| **ops** | 단일 인스턴스 가정 명문화 / 다중 인스턴스 캐시 정합 정책 (별도 라운드) | `docs/ops/cache-policy.md` (TBD) |

### H.2 우선순위

1. **Q1~Q8 답변 수집 (planner)** — 본 PRD 후속 라운드 즉시 진행 가능
2. **글로벌 admin 공용 컴포넌트 작성 (develop FE)** — coupon 이 첫 도입 도메인. 이후 events / quizzes / notices admin 도 동일 패턴 재사용
3. **coupon admin UI 재구현 (develop FE)** — 글로벌 컴포넌트 검증 케이스
4. **나머지 도메인 admin** — coupon 패턴 검증 후 일괄 진행

> **기획자 의견**: prompt 의 우선순위 (1. 라우팅 + 공용 컴포넌트 / 2. 쿠폰 CRUD / 3. 나머지 도메인) 와 정합. 본 PRD 는 "쿠폰 CRUD" 단계의 사양서.

---

## Part Z — 변경 이력

| 일자 | 변경 | 비고 |
|---|---|---|
| 2026-05-09 | admin UI 폐기 라운드 | `feature/admin/**` 12 파일 삭제. store 보존 |
| 2026-05-11 | **본 라운드** — BE/FE reverse + admin UI 신규 기획 prompt 통합 PRD 재작성 | 7 sub-skill (Part A~G) + 트랙 분리 권고 (Part H) |

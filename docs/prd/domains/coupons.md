# 도메인: coupons

> ★ **표준 패턴** (`fe-map.md ★ Owner 확정 #4`). 다른 도메인 정렬 기준.

## A.1 현재 상태

- **분류**: **live** (public) + **partial-mock** (admin 라우트 주석)
- **모바일 전환 진척도**: ★ **표준 (다른 도메인 정렬 기준)**
- 폴더 구조 (★ 표준):
  ```
  domains/coupons/
  ├── mobile/
  │   ├── CouponScreen.jsx       # 라우트 진입
  │   ├── components/couponCard/
  │   ├── containers/public/
  │   │   ├── CouponListHorizontal.jsx   # home 미니
  │   │   └── CouponListVertical.jsx     # 전체 리스트
  │   └── hooks/useCouponList.js
  └── store/
      ├── admin/    { api.js, endpoints.js, thunks.js }
      ├── public/   { api.js, endpoints.js, thunks.js }
      └── slices.js
  ```

## A.2 화면 목록

| 화면명 | 라우트 | 진입 컴포넌트 (file:line) | PC/모바일 | 비고 |
|---|---|---|---|---|
| CouponPage → CouponScreen | `/coupons` | `web/src/domains/coupons/mobile/CouponScreen.jsx` | 모바일 단일 | live |
| (HomeScreen 미니 리스트) | `/` 의 일부 | `domains/coupons/mobile/containers/public/CouponListHorizontal.jsx` | 모바일 | HomeScreen 차용 |
| AdminCouponListPage (PC admin) | `/admin/content/coupon` ★ 라우트 주석 | (lazy import 자체가 주석) | PC 어드민 | Owner 확정: 디자인 미진행, 일부 페이지 삭제 |

## A.3 API 엔드포인트

### BE 노출 (도메인 패키지: `domain/coupon/*`)

| METHOD | PATH | 컨트롤러:메서드 (file:line) | auth | 비고 |
|---|---|---|---|---|
| GET | `/api/coupons` | `CouponController#getCouponLists` (`coupon/controller/CouponController.java:21`) | permitAll | site_coupons 만 SELECT, visible=true |
| GET | `/api/admin/coupons` | `AdminCouponController#getCouponLists` (`AdminCouponController.java:25`) | ADMIN | site_coupons 만 |
| POST | `/api/admin/coupons` | `AdminCouponController#insertNewCoupons` (line 33) | ADMIN | ★ INSERT site_coupons 후 findById 는 coupons (legacy) — dual-write 갭 |
| PATCH | `/api/admin/coupons/{id}` | `AdminCouponController#updateCoupon` (line 40) | ADMIN | UPDATE 는 site_coupons. findById 는 coupons → ID 매칭 깨짐 위험 |
| PATCH | `/api/admin/coupons/{id}/visible` | `AdminCouponController#updateCouponVisible` (line 49) | ADMIN | site_coupons UPDATE |

### FE 호출

| 호출 위치 (file:line) | METHOD | PATH | hook | 트리거 화면 |
|---|---|---|---|---|
| `domains/coupons/store/public/api.js:4` | GET | `/coupons` | `useCouponList` | `/coupons`, `/` (HomeScreen) |
| `domains/coupons/store/admin/api.js:9` | GET | `/admin/coupons` | (admin hook) | `/admin/content/coupon` ★ 라우트 주석 |
| `domains/coupons/store/admin/api.js:13` | POST | `/admin/coupons` | (admin) | (admin coupon) |
| `domains/coupons/store/admin/api.js:17` | PATCH | `/admin/coupons/{id}` | (admin) | (admin coupon) |
| `domains/coupons/store/admin/api.js:21` | PATCH | `/admin/coupons/{id}/visible` | (admin) | (admin coupon) |

### 매칭 결과 (`reconciliation/fe-be-mismatch.md` #6, #25-26)

- **매칭됨**: 5건 (public 1, admin 4 — admin 은 라우트 주석 처리이지만 코드 자체는 정상 매칭)
- FE 만 호출 (BE 부재): 0
- BE 만 노출 (호출 없음): 0

## A.4 DB 테이블 + Mapper

| 테이블 | V1/V2 | 분류 | Mapper xml | 비고 |
|---|---|---|---|---|
| `coupons` | V1 | 🟢 legacy (Owner: 의도된 dual-write) | `mapper/site/coupon/CouponMapper.xml:45` (selectCouponById 만, line 45) | ★ 단방향 read fallback |
| `site_coupons` | V2 | 🔵 active | `mapper/site/coupon/CouponMapper.xml:17,32,50,70,92` | 5 stmt (INSERT/UPDATE/SELECT) |

**dual pair**: `coupons ↔ site_coupons` ★ Owner 진술 = "의도된 dual-write 운영", 실제 코드 = "V2-only write + V1 단건 read fallback" (`dual-management.md §1`, `auth-and-flags.md:79-93`).

## A.5 권한 / 가드

- 사용자 (`/coupons`): permitAll
- admin (`/admin/coupons*`): SecurityConfig URL 가드 `/api/admin/**` hasRole(ADMIN)
- ★ `@PreAuthorize("hasRole('ADMIN')")` 부착되어 있으나 `@EnableMethodSecurity` 미선언 → decorative (R6). URL 가드로 자연 보호

## A.6 알려진 위험 + 제약 (Owner 확정 사실)

| 위험 | 출처 | 차단성 |
|---|---|---|
| 🔥 **R1: coupon dual-write 정책 ↔ 코드 갭** | `auth-and-flags.md:79-93`, `dual-management.md §1`, `services.md:64-66` | ★ admin coupon 화면 신규 작업 차단. public 미차단 |
| `CouponAdminServiceImpl#createCoupon` 흐름이 site_coupons INSERT 후 coupons 에서 readback → coupons 시드 row 없으면 즉시 NPE | 동일 | 운영 시 createCoupon 호출 즉시 실패 가능 |
| Owner 정책: coupons / events 는 ★ **표준 패턴** (다른 도메인 정렬 기준) | `fe-map.md ★ Owner 확정 #4` | admin 라우트 주석 = 디자인 미진행 상태. 코드 일부만 잔존 |

## A.7 dead 항목 (이 도메인 안)

- 도메인 자체에 dead 항목 없음
- **참고**: `domains/admin/store/{api,endpoints,thunks}.js` (구 events admin 잔존, 전체 주석 — `dead-confirmed.md 1-C`) 는 events 도메인으로 이전 완료, 이미 dead 분류

## A.8 ★ Owner 결정 필요 (도메인 한정)

- **결정 #1 (🔥)**: dual-write 정책 굳히기 vs 단방향 정리
  - (A) dual-write 굳히기 — service 레이어에 `coupons` INSERT/UPDATE 추가
  - (B) 단방향 정리 — `selectCouponById` 도 site_coupons 로 변경 + V1 `coupons` 테이블 폐기
  - 선결: runtime-analyzer 의 `coupons` vs `site_coupons` row 수 비교
- **결정 #5 일부**: V2 통폐합 라운드 시 coupon dual-write 와 같이 진행할지 별도 진행할지 (`reconciliation/_overview.md §2 결정 5`)

---

## B.1 사용자 시나리오 (scope: public 모바일 + admin)

### 시나리오 1 — public guest/user (모바일)

- **Home 진입 → 쿠폰 미니 리스트 인지**: HomeScreen 의 가로 스크롤 미니 카드 (`CouponListHorizontal`) 에서 visible=true 쿠폰 N건을 즉시 본다 (auth 무관, permitAll)
- **`/coupons` 진입 → 전체 쿠폰 리스트**: 세로 리스트 (`CouponListVertical`) 로 visible=true 전체를 본다. 페이지네이션 / 검색 / 필터 미적용 (현재 BE GET `/api/coupons` 가 단일 페이로드)
- **카드 인터랙션**: 카드 탭 → 외부 링크(쿠폰 상세 URL) 또는 in-app 모달 (현행 코드 기준 — `CouponCard` 내부 동작은 wireframe 단계에서 확정)
- 종료점: 외부 링크 이탈 또는 뒤로가기

### 시나리오 2 — admin (PC 어드민, ADMIN role)

- **`/admin/content/coupon` 진입**: 쿠폰 리스트 테이블 (visible / hidden 모두) → CRUD 가능
- 등록 / 수정 / visible toggle / (삭제는 현재 미노출 — visible=false 처리로 갈음)
- 종료점: 변경사항 저장 후 리스트 재조회
- ⚠ 현재 라우트가 주석 처리됨 (`A.2`) → admin 라우트 활성화 + AdminCouponListPage 컴포넌트 신규 작성 필요 (현 코드는 lazy import 자체가 주석) — 본 라운드 **T2**

## B.2 기능 요구사항

> 본 라운드 합의 task 총 **7건** = P0 5건 (T1~T5) + P1 1건 (T6) + P2 1건 (T7).
> public 쿠폰 리스트 read 자체는 현행 유지 (별도 task X) — 아래 task 들은 모두 그 위에서의 정합 / 활성화 / 보안 fix.

### T1 — BE 코드 단방향 전환 (P0)

- **사용자 시나리오**: (BE 내부) `selectCouponById` 호출 경로의 V1 read fallback 제거
- **acceptance criteria**:
  - `CouponServiceImpl#selectCouponById` 가 `site_coupons` mapper 사용
  - V1 `coupons` 테이블 read fallback 제거
  - V1 테이블 자체는 **보존** (DROP 안 함 — 별도 라운드 T7)
- **의존 API/테이블**: `site_coupons` (`A.4`), V1 `coupons` 보존
- **우선순위**: **P0**
- **신규/기존**: 기존 BE 코드 수정 (FE 영향 없음)
- **figma node**: 해당 없음 (BE only)

### T2 — admin 라우트 활성화 + AdminCouponListPage 컴포넌트 신규 작성 (P0)

- **사용자 시나리오**: 시나리오 2 전체
- **acceptance criteria**:
  - `AdminRoutes.jsx` 의 `/admin/content/coupon` 라우트 주석 해제
  - `AdminCouponListPage.jsx` 신규 작성 (현재 파일 부재)
  - 입력 필드: `couponCode` / `title` / `detail` / `expireAt` / `visible` — 추가 필드 없음
  - admin URL 가드 `/api/admin/**` hasRole(ADMIN) 으로 자연 보호 (`A.5`)
- **의존 API/테이블**: GET/POST/PATCH `/api/admin/coupons*` (`A.3`, 4건 매칭) → `site_coupons`
- **우선순위**: **P0** (모바일 리뉴얼 일환)
- **신규/기존**: 라우트 주석 해제 (기존) + AdminCouponListPage 컴포넌트 신규 작성
- **figma node**: 미정 — wireframe 단계 신규 정의

### T3 — admin 4 capability 정합 검증 (P0)

- **사용자 시나리오**: admin 등록 / 수정 / visible toggle 흐름이 단일 출처 (`site_coupons`) 만으로 일관 동작
- **acceptance criteria**:
  - list (GET) / create (POST) / update (PATCH) / visible toggle (PATCH visible) 4 capability 모두 `site_coupons` 단일 출처로 동작
  - createCoupon → INSERT site_coupons → findById site_coupons (V1 fallback 없음) → NPE 위험 해소 (`A.6` R1)
  - **선결**: T1 (BE 단방향 전환) 완료
- **의존 API/테이블**: `/api/admin/coupons*` 4건 (`A.3`), `site_coupons`
- **우선순위**: **P0**
- **신규/기존**: 검증 task — T1+T2 결과 합쳐 동작 확인
- **figma node**: 해당 없음

### T4 — public `formatNow` vs `expireAt` 시간대 정합 fix (P0)

- **사용자 시나리오**: public 쿠폰 카드의 만료 표시 / 만료 필터가 시간대 차이로 흔들리는 현상 fix
- **acceptance criteria**:
  - KST 기준 정합 또는 server-side 만료 필터 (TBD — 구현 단계에서 결정)
  - 만료 라벨 / 노출 여부가 사용자 시각 기준으로 정확
- **의존 API/테이블**: GET `/api/coupons` (`A.3`), `site_coupons.expireAt`
- **우선순위**: **P0**
- **신규/기존**: 기존 FE/BE 로직 fix
- **figma node**: 해당 없음

### T5 — 외부 URL HTTPS / 환경변수화 (P0)

- **사용자 시나리오**: 쿠폰 카드 → 외부 사이트 이동 시 평문 http 노출 + URL 하드코딩 제거
- **현재 상태**: `http://withhive.me/399/{code}` (http 평문 + 하드코딩)
- **acceptance criteria**:
  - HTTPS 전환 또는 env 변수 추출 (`VITE_COUPON_BASE_URL` 등)
  - withhive.me HTTPS 지원 확인은 보류 항목 (구현 단계에서 검증)
- **의존 API/테이블**: 해당 없음 (FE 내 URL 처리)
- **우선순위**: **P0**
- **신규/기존**: 기존 FE 상수 수정
- **figma node**: 해당 없음

### T6 — V1 → V2 INSERT only 마이그레이션 (P1, 배포 후)

- **사용자 시나리오**: (운영) V1 `coupons` 의 row 가 V2 `site_coupons` 에 없으면 보강
- **acceptance criteria**:
  - V1 row 가 V2 에 없으면 INSERT only — UPDATE / DELETE 안 함
  - V1 테이블 자체는 보존
  - **선결**: T1 완료 + 모바일 배포 후
- **의존 API/테이블**: `coupons` (V1) → `site_coupons` (V2), `A.4`
- **우선순위**: **P1**
- **신규/기존**: 운영 마이그레이션 (1회성 스크립트)
- **figma node**: 해당 없음

### T7 — V1 `coupons` 테이블 DROP (P2, 별도 라운드)

- **사용자 시나리오**: (운영) T6 마이그 검증 후 V1 테이블 폐기
- **acceptance criteria**:
  - T6 마이그 결과 V2 가 V1 superset 임을 검증한 후 V1 `coupons` 테이블 DROP
  - 별도 라운드 (모바일 리뉴얼 v2.0.0 외)
- **의존 API/테이블**: `coupons` (V1) DROP
- **우선순위**: **P2**
- **신규/기존**: 운영 schema 변경
- **figma node**: 해당 없음

## B.3 신규 기능 (Part A 에 없음)

- **신규 1 — AdminCouponListPage 컴포넌트** → **T2 에 흡수** (별도 분리 X). lazy import 자체가 주석 = 컴포넌트 파일 부재 → T2 acceptance 의 일부로 신규 작성

> ★ 신규 기능 중 BE/DB 영향 항목: **0건**. 모두 기존 endpoint / 테이블 재활용 또는 운영 마이그/DROP (T6/T7).

## B.4 우선순위

| 우선순위 | 기능 | Phase 매핑 (`_overview.md § 7`) |
|---|---|---|
| **P0** | T1, T2, T3, T4, T5 (5건) | Phase 0 — 모바일 리뉴얼 차단성 + admin 정합 + 보안/UX |
| **P1** | T6 (1건) | 모바일 배포 후 |
| **P2** | T7 (1건) | 별도 라운드 (모바일 리뉴얼 외) |

> 본 라운드 (모바일 리뉴얼 v2.0.0) 차단성 = **P0 5건 (T1~T5)**. admin 활성화 (T2/T3) 도 모바일 리뉴얼 일환으로 P0 포함.

## B.5 KPI / 성공지표

- **public**:
  - `/coupons` 진입 후 카드 클릭율 (CTR) — 측정 인프라 미정 (어시스턴트 보고: 현재 analytics 도메인 부재)
  - 빈 상태 노출 빈도 (visible=true 가 0 일 때) — 운영 모니터링 지표
- **admin**:
  - admin 쿠폰 등록 → public 노출까지 lag time (visible toggle 적용까지 소요 시간)
  - dual-write 단방향 전환 후 `coupons` (V1) row 잔존 여부 — runtime 검증 (B.7 참조)

> KPI 측정 인프라는 본 라운드 scope 외. 정성 지표 위주.

## B.6 디자인 / Figma 참조

- **public 모바일 (P0)** — Figma file: `VCVQzOpSIpwpZw11gxG7N1` (컴프야펀)
  - node-id `16-624`: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=16-624
  - node-id `10-2`: https://www.figma.com/design/VCVQzOpSIpwpZw11gxG7N1/%EC%BB%B4%ED%94%84%EC%95%BC%ED%8E%80?node-id=10-2
  - 2건 제공 → wireframe-generator 단계에서 각 frame 매칭 (예상: 하나는 `/coupons` 풀화면, 다른 하나는 HomeScreen 미니 가로 스크롤. 실제 매칭은 wireframe 결과로 확정)
- **admin (P1)** — figma 미정. wireframe-generator 단계에서 신규 텍스트 wireframe 정의 후 design-sync 단계 보류 / Figma 신규 작성 요청

## B.7 ★ Owner 결정 — 본 라운드 해소 항목

### 결정 #1 (글로벌 ★) — coupon dual-write 정책 → ◐ **부분 해소**

- **결정 내용**: **(B) 단방향 정리** 채택. 단 V1 `coupons` 테이블 DROP 은 단계 분리.
  - **Step 1 (P0)**: 코드 단방향 전환 (`selectCouponById` 도 `site_coupons` 로 변경, V1 테이블 read fallback 제거)
  - **Step 2 (P1)**: V1 → V2 INSERT only 마이그레이션 (V1 row 잔존 처리)
  - **Step 3 (P2 — 별도 라운드)**: V1 `coupons` 테이블 DROP (마이그 검증 후)
- **결정일**: 2026-05-09
- **사유**: dual-write 굳히기 (A) 는 createCoupon NPE 위험 (`A.6` R1) 을 service 레이어 수정으로 해결해야 하는데, V2-only 가 이미 안정 동작 중 → V1 read fallback 만 정리하는 것이 risk 최소
- **선결 조건**: runtime-analyzer 의 `coupons` vs `site_coupons` row 수 비교 (Step 2 마이그 시 input)
- **상태**: ◐ **부분 해소** (코드 단방향 = 본 라운드 P0 한정. 테이블 DROP = P2 별도 라운드)

### 결정 #5 일부 — V2 통폐합 시점

- 본 도메인에서는 위 #1 의 Step 3 (V1 DROP) 가 결정 #5 와 자연스럽게 연동
- **결정 보류**: figma 도착 시 playerCard 와 같이 묶어 결정 (`_overview.md § 8`)

## B.8 의존성 cross-reference

- **home 도메인**: HomeScreen 의 `CouponListHorizontal` 미니 → 본 도메인 hook 재사용. home 도메인 PRD 작성 시 본 row 차용
- **admin 도메인**: admin 라우트 활성화 (기능 2) → admin 도메인 PRD 의 메뉴 트리 / 라우팅 가드 cross-check 필요

## B.9 follow-up / 모호 사항

- AdminCouponListPage 컴포넌트 부재 → T2 진행 시 신규 작성 필요 (어시스턴트 보고로 컴포넌트 파일 부재 확인됨)
- Figma node `16-624` / `10-2` 의 `/coupons` 풀 vs HomeScreen 미니 매칭은 wireframe-generator 가 해소
- admin Figma 미진행 — admin 디자인은 wireframe 단계 텍스트 wireframe → design-sync 단계 보류 / 디자인팀 별도 요청
- T4 (시간대 fix) 의 KST 정합 vs server-side 필터 선택은 구현 단계 결정 (TBD)
- T5 외부 URL: withhive.me HTTPS 지원 여부 확인 필요 (미지원 시 env 변수화만 진행)
- runtime-analyzer 결과 (V1 vs V2 row 수) 도착 시 T6 마이그 plan 구체화

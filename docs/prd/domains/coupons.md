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

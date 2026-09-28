---
feature: coupons
version: 1.0.4
status: active
created: 2026-01-29
updated: 2026-09-28
---

# coupons

## 1. 무엇을 하는 기능인가

현재 유효한 쿠폰 코드 목록을 "사용가능"/"기간 만료" 두 그룹으로 보여주고, "바로가기"를 누르면 게임 클라이언트로 이동시켜 준다. 실제 쿠폰 등록·수령·1인 1회 제한은 게임 클라이언트(이 저장소 밖)가 처리하며, 이 화면은 "지금 쓸 수 있는 코드가 뭔지 보여주는 게시판"에 가깝다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 쿠폰 목록 (SC-02-01) | `/coupons` | 홈(SC-07-01) "최신 쿠폰" 섹션 더보기 |
| 관리자 — 쿠폰 관리 (SC-01-01 내부 탭) | `/admin/coupon` | 관리자 셸(SC-01-01) 상단 탭 |

쿠폰에는 상세 페이지가 없다 — 목록 카드가 곧 전체 정보다.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-CP-01 | 노출 조건 | 공개 목록은 `is_visible = TRUE` 인 행만 반환 | `mapper/site/coupon/CouponMapper.xml` |
| REQ-CP-02 | 사용가능/기간 만료 판정 | BE는 상태 필드를 안 내려주고, 관리자·공개 화면 모두 KST 기준 현재 시각과 `expireAt` 을 같은 분 단위 문자열로 비교한다(과거엔 관리자만 날짜 단위여서 갈렸으나 통일됨) | `useCouponList.js`, `AdminCouponScreen.jsx:112-113` |
| REQ-CP-03 | 정렬 순서 | BE `selectCouponListForUser` 에 `ORDER BY` 가 없다 — 정렬 책임이 원래부터 전적으로 FE에 있다. `id` 내림차순 | `CouponMapper.xml` |
| REQ-CP-04 | "바로가기" 클릭 | `COUPON_BASE_URL/{couponCode}` 를 새 탭으로 여는 것뿐 — 클릭 자체를 서버에 기록하지 않는다 | `CouponCard.jsx` |
| REQ-CP-05 | 1계정 1회 한정 | 공식 카페에서 발급된 링크를 클릭하면 게임 클라이언트가 열려 자동 지급된다. 1인당 1회 제한은 그 클라이언트가 보장 — 이 사이트는 별도 구현이 필요 없다(확정 설계) | 확정 2026-09-27(사용자 결정), 저장소 경계 밖 |
| REQ-CP-06 | 코드 중복 처리 | 등록·수정 모두 코드 중복 시 409(`COUPON_CODE_DUPLICATED`)로 안내한다 | `AdminCouponServiceImpl.java:65-91` |
| REQ-CP-07 | "삭제"의 실제 의미 | 실제로는 `is_visible = false` 로 바꾸는 숨김이다. 같은 코드로 재등록하면 UNIQUE 위반(409)이 나며, 화면 문구는 "삭제"가 아니라 "숨김"으로 안내한다 | `CouponMapper.xml`, 소프트 삭제 경계는 [0004](../../decisions/0004-soft-delete-boundary.md) |
| REQ-CP-08 | 일괄 처리 부분 실패 | 서버가 구분해 응답하는 `successIds`/`failedIds` 를 화면이 그대로 반영 — 성공분만 목록에서 제거하고 실패 건수를 배너로 안내 | `admin/thunks.js`, `admin/slices.js` |
| REQ-CP-09 | 저장 직후 화면 반영 | 등록·수정 후 화면은 폼 입력값이 아니라 서버 응답(보정된 만료 시각 포함)을 그대로 반영한다 | `admin/thunks.js` |
| REQ-CP-10 | 권한 | 공개 조회는 누구나. 등록/수정/노출 토글/삭제/일괄 작업은 `AdminCouponController` 클래스 레벨 ADMIN 권한자만 | `AdminCouponController.java` |
| REQ-CP-11 | 캐시 갱신 시점 | 실제 쓰기가 있는 6개 메서드 전부 트랜잭션 커밋 후에 캐시를 비운다(`@CacheEvictAfterCommit`) — 프로젝트에서 이 패턴을 유일하게 전 메서드에 적용한 도메인 | `AdminCouponServiceImpl.java` |
| REQ-CP-12 | 새로고침(refresh) | 관리자가 DB에 직접 넣은 값을 캐시만 비워 즉시 반영시키는 용도. 쓰기가 없는 읽기 전용 메서드라 즉시 evict 방식이어도 안전하다 | `AdminCouponServiceImpl.java` |
| REQ-CP-13 | 상태 칸 분리 | 관리자 목록(`coupons`, 숨김 포함)과 공개 목록(`publicCoupons`)을 Redux에서 별도 칸에 저장한다 — 한 칸을 공유하면 관리자 화면을 거친 뒤 공개 화면에 숨김 쿠폰이 보인다 | `store/slices.js:12` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 쿠폰 정의 | `site_coupons`(`id`, `coupon_code` UNIQUE, `title`, `detail` nullable, `expire_at`, `is_visible`, `created_at`, `updated_at`) | 사용자-쿠폰 매핑 테이블 없음(확정 설계) |
| 공개 목록 | `GET /api/coupons` | 인증 불필요 |
| 관리자 목록 | `GET /api/admin/coupons` | ADMIN, 노출 여부 무관 전체 |
| 등록 | `POST /api/admin/coupons` | ADMIN |
| 새로고침 | `POST /api/admin/coupons/refresh` | ADMIN, 쓰기 없음 |
| 수정 | `PATCH /api/admin/coupons/{id}` | ADMIN |
| 노출 토글 | `PATCH /api/admin/coupons/{id}/visible` | ADMIN |
| 삭제(숨김) | `DELETE /api/admin/coupons/{id}` | ADMIN |
| 일괄 삭제 | `DELETE /api/admin/coupons/bulk` | ADMIN, 부분 실패 허용 |
| 일괄 노출 변경 | `PATCH /api/admin/coupons/bulk/visible` | ADMIN, 부분 실패 허용 |

## 5. 하지 않는 것

- 사용자별 쿠폰 발급·수령·사용 기록 — 구현 누락이 아니라 게임 클라이언트가 담당하는 확정 설계다.
- 쿠폰 상세 페이지 — 목록 카드가 곧 전체 정보라 만들지 않는다.
- "바로가기" 클릭 자체를 서버에 기록하는 것 — 하지 않는다.
- 공식 카페 게시물을 웹 크롤링으로 자동 등록하는 것 — 예정돼 있으나 아직 만들지 않았다.

## 6. 확인 필요

🟨 `detail` 컬럼이 NULL이면 공개 화면 렌더가 가드돼 있으나(수정 완료), DB에 직접 NULL을 넣는 경로에 대한 운영 방침은 정해진 문서가 없다 — 현재는 발생 사례 없음.

없음 — 그 외 항목은 모두 확정됐다.

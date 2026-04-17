# Coupons Domain Guide

## 1. 목적

쿠폰 도메인의 모바일 사용자 화면, 상태 관리, API 연동 구조를 관리한다.

---

## 2. 폴더 구조

```text
coupons/
├─ mobile/
│  ├─ components/
│  │  └─ couponCard/
│  │     ├─ CouponCard.jsx
│  │     └─ CouponCard.module.scss
│  ├─ containers/
│  │  └─ public/
│  │     ├─ CouponList.module.scss
│  │     ├─ CouponListHorizontal.jsx
│  │     └─ CouponListVertical.jsx
│  ├─ hooks/
│  │  └─ useCouponList.js
│  ├─ CouponScreen.jsx
│  └─ CouponScreen.module.scss
├─ store/
│  ├─ admin/
│  │  ├─ api.js
│  │  ├─ endpoints.js
│  │  └─ thunks.js
│  ├─ public/
│  │  ├─ api.js
│  │  ├─ endpoints.js
│  │  └─ thunks.js
│  └─ slices.js
```

---

## 3. 파일별 역할

### `mobile/CouponScreen.jsx`
쿠폰 페이지의 메인 화면.  
최신 쿠폰 / 종료된 쿠폰 섹션을 구성한다.

### `mobile/hooks/useCouponList.js`
쿠폰 목록 데이터를 가져오고, 화면에서 사용할 형태로 가공한다.  
`expireAt` 기준으로 `activeCoupon` / `expiredCoupon` 을 분리해 반환한다.

### `mobile/components/couponCard/CouponCard.jsx`
개별 쿠폰 카드 UI.  
`showDetail` prop으로 홈(간략) / 쿠폰 페이지(상세) 표현을 분기한다.  
`isExpired` prop으로 종료된 쿠폰 스타일을 적용한다.

### `mobile/containers/public/CouponListHorizontal.jsx`
홈 등 가로 스크롤 영역에서 사용하는 리스트 컨테이너.

### `mobile/containers/public/CouponListVertical.jsx`
쿠폰 전체 페이지 등 세로 리스트에서 사용하는 컨테이너.

### `store/public/api.js`
공개 쿠폰 API 호출 담당.

### `store/public/thunks.js`
공개 쿠폰 목록 조회 비동기 액션.  
응답 데이터 중 `visible: true` 인 항목만 필터링 후 `id` 내림차순 정렬해 반환한다.

### `store/slices.js`
쿠폰 상태 저장소.

---

## 4. 데이터 흐름

```
endpoints.js → api.js → thunks.js → slices.js → useCouponList.js → CouponScreen.jsx
                                                                   → CouponListVertical / CouponListHorizontal
                                                                   → CouponCard.jsx
```

1. `store/public/endpoints.js` 에서 공개 API 경로를 정의한다.
2. `store/public/api.js` 에서 실제 API 호출을 수행한다.
3. `store/public/thunks.js` 에서 비동기 액션을 생성하고, `visible: true` 필터링 및 정렬을 처리한다.
4. `store/slices.js` 에서 응답 데이터를 상태로 저장한다.
5. `useCouponList.js` 에서 `expireAt` 기준으로 활성/종료 쿠폰을 분리해 반환한다.
6. `CouponScreen.jsx` 에서 섹션별로 분리해 렌더링한다.
7. `CouponListHorizontal / CouponListVertical` 이 리스트 형태를 담당한다.
8. `CouponCard.jsx` 가 개별 카드 UI를 렌더링한다.

---

## 5. 외부 의존성

이 도메인은 아래 공통 모듈에 의존한다.

| 모듈 | 경로 | 용도 |
|------|------|------|
| `formatNow` | `@/global/utils/datetime/dateUtils` | 현재 시각 포맷 — 활성/종료 쿠폰 분기 기준 |
| `SectionBlock` | `@/global/ui/mobile/section/SectionBlock` | 최신/종료 섹션 공통 레이아웃 |

---

## 6. 수정 가이드

### 쿠폰 카드 UI를 수정할 때
- `mobile/components/couponCard/CouponCard.jsx`
- `mobile/components/couponCard/CouponCard.module.scss`

### 최신/종료 섹션 구성을 수정할 때
- `mobile/CouponScreen.jsx`

### 가로/세로 배치 방식을 수정할 때
- `mobile/containers/public/CouponListHorizontal.jsx`
- `mobile/containers/public/CouponListVertical.jsx`
- `mobile/containers/public/CouponList.module.scss`

### API 응답 구조를 수정할 때
- `store/public/endpoints.js`
- `store/public/api.js`
- `store/public/thunks.js`
- `store/slices.js`
- `mobile/hooks/useCouponList.js`

---

## 7. 규칙

- `CouponCard` 는 공통 카드 컴포넌트로 유지한다.
- 홈(간략) / 쿠폰 페이지(상세) 차이는 `showDetail` prop으로 제어한다.
- `isExpired` 는 `useCouponList` 에서 가공된 데이터 기준으로 결정하며, 카드 내부에서 재계산하지 않는다.
- API 응답 원본 가공(`visible` 필터링, 정렬)은 `thunks.js` 에서 처리한다.
- 활성/종료 쿠폰 분리는 `useCouponList` 에서 처리하며, 화면 컴포넌트에서 직접 계산하지 않는다.
- 카드 레이아웃 책임과 리스트 레이아웃 책임을 혼합하지 않는다.

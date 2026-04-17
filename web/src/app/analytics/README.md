# Analytics Guide

## 1. 목적

Google Analytics 4(GA4) 기반 사용자 행동 데이터 수집을 담당한다.  
`gtag` 직접 연동 방식을 사용하며, 이벤트는 도메인별 파일로 분리해 관리한다.

---

## 2. 폴더 구조

```text
app/analytics/
├── events/
│   └── authEvents.js       ← 인증 관련 이벤트
└── hooks/
│   └── useGA4PageView.js   ← 페이지뷰 자동 트래킹 훅
└── ga.js                   ← 공통 이벤트 전송 함수
```

---

## 3. 파일별 역할

### `ga.js`
모든 GA4 이벤트 전송의 단일 진입점.  
localhost 환경에서는 `console.log` 만 출력하고 실제 GA4로 전송하지 않는다.

```js
const isDev = window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1"

export const pushEvent = (event) => {
  if (isDev) {
    console.log("[GA]", event)
    return
  }
  const { event: eventName, ...params } = event
  window.gtag?.("event", eventName, params)
}
```

### `hooks/useGA4PageView.js`
라우트 변경 시 자동으로 `page_view` 이벤트를 전송한다.  
`ADMIN` 권한 유저는 트래킹에서 제외한다.

### `events/authEvents.js`
로그인/로그아웃 이벤트를 관리한다.  
환경(localhost)과 권한(ADMIN/USER)에 따라 이벤트 이름을 분기한다.

---

## 4. GA4 연동 방식

`gtag` 직접 연동 방식 사용. GTM은 현재 비활성화 상태.

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KCC3QTZWZW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-KCC3QTZWZW');
</script>
```

---

## 5. 이벤트 목록

### 자동 수집 이벤트
| 이벤트 이름 | 발생 시점 | 담당 파일 |
|------------|----------|----------|
| `page_view` | 라우트 변경 시 | `useGA4PageView.js` |

### 인증 이벤트
| 이벤트 이름 | 발생 시점 | 조건 |
|------------|----------|------|
| `user_login` | 로그인 완료 | 일반 유저 + production |
| `admin_login` | 로그인 완료 | ADMIN + production |
| `dev_login` | 로그인 완료 | localhost |
| `user_logout` | 로그아웃 | 일반 유저 + production |
| `admin_logout` | 로그아웃 | ADMIN + production |
| `dev_logout` | 로그아웃 | localhost |

---

## 6. 환경별 동작

| 환경 | 동작 |
|------|------|
| localhost | `console.log("[GA]", event)` 만 출력, GA4 미전송 |
| production (ADMIN) | `page_view` 제외, 인증 이벤트는 `admin_*` 로 전송 |
| production (USER) | 모든 이벤트 정상 전송 |

---

## 7. 이벤트 추가 방법

새로운 도메인 이벤트 추가 시 `events/` 폴더에 파일 추가:

```js
// events/couponEvents.js
import { pushEvent } from '../ga'

export const trackCouponCopy = (couponCode) => {
  pushEvent({
    event: 'coupon_copy',
    coupon_code: couponCode,
  })
}

export const trackCouponApply = (couponCode) => {
  pushEvent({
    event: 'coupon_apply',
    coupon_code: couponCode,
  })
}
```

사용:
```js
import { trackCouponCopy } from '@/app/analytics/events/couponEvents'

const handleCopy = () => {
  trackCouponCopy(coupon.code)
}
```

---

## 8. GA4 맞춤 측정기준

GA4 → 관리 → 맞춤 정의에 등록된 측정기준:

| 측정기준 이름 | 이벤트 매개변수 | 범위 | 용도 |
|-------------|--------------|------|------|
| `is_admin` | `is_admin` | 이벤트 | 어드민 행동 구분 |
| `is_dev` | `is_dev` | 이벤트 | 개발 환경 구분 |

> 커스텀 파라미터는 등록 후 24~48시간이 지나야 보고서에서 확인 가능하다.

---

## 9. 수정 가이드

### 이벤트 전송 로직을 수정할 때
- `ga.js`

### 페이지뷰 트래킹을 수정할 때
- `hooks/useGA4PageView.js`

### 인증 이벤트를 수정할 때
- `events/authEvents.js`

### 새 도메인 이벤트를 추가할 때
- `events/` 폴더에 `{domain}Events.js` 파일 추가
- `pushEvent` import 후 사용

---

## 10. 규칙

- 모든 GA4 이벤트는 반드시 `pushEvent` 를 통해 전송한다. `gtag` 직접 호출 금지.
- 이벤트는 도메인별로 파일을 분리해 관리한다.
- localhost 환경에서는 GA4로 전송하지 않으며 콘솔로만 확인한다.
- `ADMIN` 유저의 `page_view` 는 트래킹에서 제외한다.
- 이벤트 이름은 `snake_case` 로 작성한다.

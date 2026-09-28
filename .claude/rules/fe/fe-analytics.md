---
paths:
  - "web/src/infra/analytics/**"
---
# GA4 애널리틱스 규칙

> 기준 2026-09-28. `gtag` 직접 연동(GTM 비활성). 대상 `web/src/infra/analytics/**` + 도메인별 `events/{domain}Events.js` 호출부.

## 1. 구조

| 파일 | 역할 |
|---|---|
| `infra/analytics/ga.js` | 모든 GA4 이벤트 전송의 단일 진입점(`pushEvent`) |
| `infra/analytics/hooks/useGA4PageView.js` | 라우트 변경 시 `page_view` 자동 전송 |
| `infra/analytics/events/{domain}Events.js` | 도메인별 이벤트 트래커(예: `authEvents.js` `eventEvents.js`) |

## 2. 환경별 동작

| 환경 | 동작 |
|---|---|
| localhost | `gtag.js` 자체를 로드하지 않는다(`index.html` DEV_HOSTS 분기) — `pushEvent`는 `console.log("[GA]", event)`만 출력, GA4 미전송 |
| production(ADMIN) | `page_view` 트래킹 제외, 인증 이벤트는 `admin_*` 이름으로 전송 |
| production(USER) | 모든 이벤트 정상 전송 |

로컬에서 스크립트를 아예 안 실어오는 이유: 개발 클릭이 운영 속성에 쌓이는 것과 gtag 내장 web-vitals가 상호작용마다 콘솔 예외를 뱉는 것을 함께 막는다.

## 3. 규칙

- 모든 GA4 이벤트는 반드시 `pushEvent`를 통해 전송한다. `gtag` 직접 호출 금지
- 이벤트는 도메인별로 `events/{domain}Events.js` 파일을 분리해 관리한다
- 이벤트 이름은 `snake_case`
- `ADMIN` 유저의 `page_view`는 트래킹에서 제외한다
- 커스텀 파라미터는 GA4 콘솔 등록 후 24~48시간 지나야 보고서에서 확인 가능 — 등록 직후 "안 보임"을 오류로 착각하지 않는다

## 4. 새 이벤트 추가

```js
// events/{domain}Events.js
import { pushEvent } from '../ga'

export const trackX = (id) => {
  pushEvent({ event: 'domain_action', id })
}
```

## 5. GA4 맞춤 측정기준

GA4 콘솔 → 관리 → 맞춤 정의에 등록된 측정기준. 코드에서 이벤트 파라미터로 실어 보낸다.

| 측정기준 | 파라미터 | 범위 | 용도 |
|---|---|---|---|
| `is_admin` | `is_admin` | 이벤트 | 어드민 행동 구분 |
| `is_dev` | `is_dev` | 이벤트 | 개발 환경 구분 |

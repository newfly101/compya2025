# Events Domain Guide

## 1. 목적

이벤트 도메인의 모바일 사용자 화면, 상태 관리, API 연동 구조를 관리한다.  
진행중/종료 이벤트를 구분하여 표시하며, 공식 카페 이벤트와 내부 이벤트를 함께 관리한다.

---

## 2. 폴더 구조

```text
events/
├── feature/
│   └── public/
│       ├── components/
│       │   └── EventCard/
│       │       ├── EventCard.jsx
│       │       └── EventCard.module.scss
│       ├── containers/
│       │   ├── EventListHorizontal.jsx    ← 홈 가로 스크롤
│       │   ├── EventListVertical.jsx      ← 이벤트 페이지 세로 리스트
│       │   ├── EventList.module.scss
│       ├── hooks/
│       │   └── useEventList.js
│       └── screens/
│           └── EventScreen.jsx
└── store/
    ├── public/
    │   ├── api.js
    │   ├── endpoints.js
    │   └── thunks.js
    └── slices.js
```

---

## 3. 파일별 역할

### `feature/public/components/EventCard/EventCard.jsx`
개별 이벤트 카드 UI.  
`isExpired` prop으로 진행중/종료 스타일을 분기한다.  
이미지 없을 경우 그라디언트 빈 영역으로 대체한다.  
카드 클릭 시 `externalLink` 있으면 새 탭으로 열고, 없으면 상세 페이지로 이동한다.

### `feature/public/containers/EventListHorizontal.jsx`
홈 화면 가로 스크롤 이벤트 리스트.  
CSS 변수(`--thumb-height`)로 카드 썸네일 높이를 `72px` 로 제어한다.

### `feature/public/containers/EventListVertical.jsx`
이벤트 페이지 세로 리스트.  
CSS 변수(`--thumb-height`)로 카드 썸네일 높이를 `120px` 로 제어한다.

### `feature/public/hooks/useEventList.js`
`expireAt` 기준으로 진행중/종료 이벤트를 분리해 반환한다.

### `feature/public/screens/EventScreen.jsx`
이벤트 페이지 메인 화면.  
진행중 이벤트 / 종료된 이벤트 섹션을 구성한다.

### `store/public/thunks.js`
이벤트 목록 조회 비동기 액션.  
응답 데이터를 `id` 내림차순 정렬 후 반환한다.

---

## 4. 데이터 흐름

```
endpoints.js → api.js → thunks.js → slices.js → useEventList.js → EventScreen.jsx
                                                                  → EventListVertical / EventListHorizontal
                                                                  → EventCard.jsx
```

1. `store/public/endpoints.js` 에서 API 경로를 정의한다.
2. `store/public/api.js` 에서 실제 API 호출을 수행한다.
3. `store/public/thunks.js` 에서 비동기 액션을 생성하고 `id` 내림차순 정렬을 처리한다.
4. `store/slices.js` 에서 응답 데이터를 상태로 저장한다.
5. `useEventList.js` 에서 `expireAt` 기준으로 진행중/종료를 분리해 반환한다.
6. `EventScreen.jsx` 에서 섹션별로 분리해 렌더링한다.
7. `EventListVertical / EventListHorizontal` 이 리스트 형태를 담당한다.
8. `EventCard.jsx` 가 개별 카드 UI를 렌더링한다.

---

## 5. BE 응답 구조

```json
{
  "id": 1,
  "eventType": "INTERNAL",
  "title": "리그 버닝 이벤트",
  "startAt": "2026-03-18 00:00",
  "expireAt": "2026-04-05 23:59",
  "imageUrl": "https://...",
  "externalLink": null,
  "visible": true
}
```

### EventType
| 값 | 설명 |
|----|------|
| `INTERNAL` | 컴프야펀 자체 이벤트 |
| `OFFICIAL` | 공식 카페 이벤트 — `externalLink` 로 이동 |

### 진행중/종료 판단
BE에서 상태를 내려주지 않으며, FE에서 `expireAt` 과 현재 시각을 비교해 판단한다.

```js
const now = formatNow(new Date())
const isExpired = event.expireAt < now
```

---

## 6. 카드 레이아웃 제어

썸네일 높이와 폰트 크기는 CSS 변수로 container에서 제어한다.  
`EventCard.module.scss` 는 변수 기본값만 정의하고, container가 상황에 맞게 오버라이드한다.

| CSS 변수 | 기본값 | Horizontal | Vertical |
|---------|--------|------------|----------|
| `--thumb-height` | `120px` | `72px` | `120px` |
| `--title-font-size` | `$font-size-13` | `$font-size-11` | `$font-size-15` |
| `--event-card-info-padding` | `$space-2` | `$space-2` | `$space-3` |

---

## 7. GA4 이벤트

| 이벤트 이름 | 발생 시점 | 파라미터 |
|------------|----------|---------|
| `event_click` | 이벤트 카드 클릭 | `event_id`, `event_title` |

이벤트는 `app/analytics/events/eventEvents.js` 에서 관리한다.

```js
export const trackEventClick = (eventId, eventTitle) => {
  pushEvent({
    event: 'event_click',
    event_id: eventId,
    event_title: eventTitle,
  })
}
```

---

## 8. 외부 의존성

| 모듈 | 경로 | 용도 |
|------|------|------|
| `formatNow` | `@/global/utils/datetime/dateUtils` | 현재 시각 포맷 — 진행중/종료 분기 기준 |
| `SectionBlock` | `@/global/ui/mobile/section/SectionBlock` | 섹션 공통 레이아웃 |
| `pushEvent` | `@/app/analytics/ga` | GA4 이벤트 전송 |

---

## 9. 수정 가이드

### 이벤트 카드 UI를 수정할 때
- `feature/public/components/EventCard/EventCard.jsx`
- `feature/public/components/EventCard/EventCard.module.scss`

### 가로/세로 배치 방식을 수정할 때
- `feature/public/containers/EventListHorizontal.jsx`
- `feature/public/containers/EventListVertical.jsx`

### 진행중/종료 분리 기준을 수정할 때
- `feature/public/hooks/useEventList.js`

### API 응답 구조를 수정할 때
- `store/public/endpoints.js`
- `store/public/api.js`
- `store/public/thunks.js`
- `store/slices.js`

### GA 이벤트를 수정할 때
- `app/analytics/events/eventEvents.js`

---

## 10. 규칙

- 진행중/종료 판단은 `useEventList` 에서 처리하며, 컴포넌트에서 직접 계산하지 않는다.
- `EventCard` 는 `isExpired` prop만 받아 스타일을 분기하며, 날짜 계산 로직을 포함하지 않는다.
- 카드 레이아웃(썸네일 높이, 폰트 크기)은 CSS 변수로 container에서 제어한다.
- `externalLink` 가 있는 이벤트는 새 탭으로 열고, 없으면 내부 상세 페이지로 이동한다.
- `visible: false` 인 이벤트는 `thunks.js` 에서 필터링한다.
- API 응답 가공(정렬)은 `thunks.js` 에서 처리하며, 화면 컴포넌트에서 직접 처리하지 않는다.

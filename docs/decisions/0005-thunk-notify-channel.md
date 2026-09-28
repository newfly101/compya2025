---
adr: 0005
title: 작업 결과 알림은 응답이 아니라 별도 채널(meta.notify)로 나른다
status: accepted
date: 2026-09-28
scope: web/src/domains/**/store/**, web/src/app/store/**
related: rules/fe/fe-store.md § 3
created: 2026-09-28
updated: 2026-09-28
---

# 0005 thunk 알림은 `meta.notify` 로 — 응답(payload)에 안 섞는다

## 배경

Redux Toolkit 의 thunk(비동기 요청을 처리하는 함수)가 "저장했습니다" 같은 알림 문구를 어디로 실어 보낼지가 정해져 있지 않아, 예전에는 반환값(payload) 안에 `options` 같은 알림 정보를 같이 담아 보냈다. 이 방식이 실제로 두 가지 사고를 냈다.

## 결정

알릴 것이 있는 thunk 는 **응답과 별도인 자리**로 문구를 나른다. 전역 리스너가 `action.meta.notify` 를 읽어 모달을 띄운다.

```js
return fulfillWithValue(saved, { notify: { kind: "success", message: "저장했습니다." } });
```

| 규칙 | 이유 |
|---|---|
| 응답(payload)에 섞지 않는다 | 리듀서가 읽지 않는 키가 목록 행에 그대로 저장되는 문제를 막는다 |
| 리스너는 권한을 보지 않는다 — 문구는 thunk 가 정한다 | 관리자에게만 알림이 가는 구조적 결함을 없앤다 |
| `.unwrap()` 을 쓰는 화면은 `.catch(() => {})` 라도 둔다 | 없으면 unhandled rejection 으로 실패가 무음 처리된다 |
| 화면이 직접 실패를 보여주는 곳(`.unwrap()` + 지역 상태)에는 알림을 얹지 않는다 | 이중으로 뜨는 것을 막는다 |

## 왜 (대안과 비교)

| 대안 | 문제 | 판정 |
|---|---|---|
| 알림 정보를 payload 에 계속 싣는다 | 리듀서가 안 읽는 키가 목록 행에 그대로 저장돼 데이터가 오염된다. 거부(reject) 값은 오류 문구 문자열이라 **실패는 애초에 알릴 자리가 없었다** | 기각 |
| 리스너에 `userRole === 'ADMIN'` 조건을 유지한다 | 일반 사용자에게는 구조적으로 알림이 안 간다 — 실제로 있었던 결함 | 기각 |
| Redux 미들웨어(store 리스너)로 전역 처리 | thunk 가 `rejectWithValue(error.message)` 로 던지면 플래그가 액션까지 살아남지 않는다 | 기각(관련 사고 § 참조) |

## 실제로 걸렸던 사고

- **알림이 관리자에게만 갔다** — 예전 리스너의 `userRole === 'ADMIN'` 조건 때문에 일반 사용자는 저장 성공/실패 알림을 아예 못 받았다
- **인증 콜백 실패가 무음이었다** — `AuthCallBack` 화면에서 `.unwrap()` 뒤 `.catch()` 가 없어, 인증 실패가 unhandled rejection 으로만 남고 화면엔 아무 표시가 없었다
- **응답에 섞인 옵션값이 목록 행에 저장됨** — 반환값에 `options` 를 담았던 시절, 리듀서가 그 키를 그대로 상태에 넣어 목록 행 데이터가 오염됐다

## 영향받는 곳

- `rules/fe/fe-store.md` § 3 — `meta.notify` 규칙의 단일 원천
- `web/src/app/store/` 의 전역 알림 리스너(`operationListener.js`) — `action.meta.notify` 를 읽어 모달 표시
- 알림이 필요한 모든 도메인의 `thunks.js`

## 아직 미정인 것 (❓)

- 없음 — `meta.notify` 단일 채널로 정착 완료. 새 thunk 를 추가할 때 이 패턴을 따르는지만 리뷰 시 확인하면 된다

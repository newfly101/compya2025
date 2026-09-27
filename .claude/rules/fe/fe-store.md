---
paths:
  - "web/src/domains/**/store/**"
  - "web/src/app/store/**"
  - "web/src/infra/http/**"
  - "web/src/infra/analytics/**"
---
# FE 상태관리 · 외부 통신

> 기준 2026-09-28. Redux Toolkit 2. 구조·화면 규칙은 `fe-convention.md`.

## 1. 스토어 폴더 (public / admin 분리)

```
domains/{도메인}/store/
├── public/   api.js (axios 만, 가공 금지) · endpoints.js (경로·액션 상수) · thunks.js (createAsyncThunk, 정렬·필터 여기서)
├── admin/    동일 3개 — 관리자 화면 없어도 미리 만든다
├── dto.js    (선택) 서버 응답 ↔ 화면 상태 변환
└── slices.js createSlice. public + admin 을 한 슬라이스에서
```

- `api.js` 는 **봉투를 벗겨 내용물만** 반환 (`return data.data`). thunk 에서 다시 벗기지 않는다
- 정렬·필터는 `thunks.js` 에서 끝. 컴포넌트·훅 재가공 금지
- **thunk 는 서버 응답을 반환한다.** 폼 값(`{...notice, id}`)을 돌려주면 서버가 채운 `createdAt`·정규화 값이 화면에 안 온다 (공지 등록일 `-`, 쿠폰 저장 직후 "만료" 사고). 유일한 예외: 응답이 `GlobalResponse<Void>` 인 토글·PATCH 4곳 — 요청 param 으로 갱신, 실패는 `meta.notify`
- 일괄 처리 thunk 는 서버 응답 `{ successIds, failedIds }` 를 `toBulkResult`(빈 배열 기본값 + `Number` 정규화)로 반환, 리듀서는 `successIds` 만 반영. `?? ids.filter(...)` 식 자체 보정 금지 — BE 는 항상 두 배열을 준다
- 재요청 가드는 슬라이스 `loaded` 플래그 (fulfilled 에서 `true`) + `!loaded && !loading`. `items.length > 0` 으로 파생하면 정상 0건과 미조회를 못 가른다
- 업로드는 `@/infra/api/uploads/{thunks,index}.js` 공용 (`extractUploadedUrl` 1개, `result.url` 만). BE 응답은 `{url, fileName}` 한 형태 — 화면에 복사본 금지
- 새 스토어는 `app/store/store.js` 에 등록:
  `import { reducer as {d}Reducer } from "@/domains/{d}/store/slices";` → `reducer: { {d}: {d}Reducer }`

## 2. slices.js — `applyAsyncHandlers` 만

`extraReducers` 에 `addCase` 직접 금지. 로딩·에러 칸은 공용 헬퍼가 관리한다.

```js
import { createSlice } from "@reduxjs/toolkit";
import { applyAsyncHandlers } from "@/app/store/utils/applyAsyncHandlers";
import * as thunks from "./thunks";

const slice = createSlice({
  name: "{domain}",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    applyAsyncHandlers(builder, thunks.requestGetList, (state, action) => { state.items = action.payload; });
    applyAsyncHandlers(builder, thunks.requestCreate, null, "mutate");
  },
});
export const { actions, reducer } = slice;
```

**로딩·오류 칸은 요청 성격별로 나눈다.** 한 칸을 여러 요청이 쓰면 한쪽 실패가 다른 칸까지 오류로 보인다. 네 번째 인자는 네 가지뿐:

| 인자 | 칸 | 쓰는 곳 |
|---|---|---|
| (생략) | `loading` / `error` | 주 목록 조회 |
| `"public"` | `publicLoading` / `publicError` | 공개 화면 조회 (운영 화면과 분리) |
| `"detail"` | `detailLoading` / `detailError` | 단건 상세 |
| `"mutate"` | `mutateLoading` / `mutateError` | 등록·수정·삭제 |

## 3. 작업 결과 알림 — `meta.notify`

알릴 게 있는 thunk 는 응답이 아니라 **별도 자리**로 문구를 나른다. 전역 리스너가 `action.meta.notify` 를 읽어 모달을 띄운다.

```js
return fulfillWithValue(saved, { notify: { kind: "success", message: "저장했습니다." } });
```

- 응답(payload)에 섞지 않는다 — 리듀서가 안 읽는 키가 목록 행에 저장되고, 실패는 알릴 자리가 없다
- `.unwrap()` 을 쓰는 화면은 `.catch(() => {})` 라도 둔다 — 없으면 unhandled rejection 에 실패가 무음 (AuthCallBack 사고)
- 리스너는 권한을 보지 않는다 — 문구는 thunk 가 정한다
- 화면이 직접 실패를 보여주는 곳(`.unwrap()` + 지역 상태)에는 알림을 얹지 않는다 (이중)
- 왜: `docs/decisions/0005-thunk-notify-channel.md`

## 4. 표준을 벗어난 도메인

| 도메인 | 형태 | 이유 |
|---|---|---|
| `authentication` | public/admin 없이 평평 | 관리자 개념 없음 |
| `players` · `playerSkills` | 평평 | 조회 전용 |

`slices.js` 는 `thunks.js` 만 import 한다. 역방향(thunk → slice 액션 import)은 **순환 참조** → TDZ 오류(`Cannot access … before initialization`, HMR 에서 발현). 상태 반영은 전부 `applyAsyncHandlers`, thunk 가 액션을 dispatch 하지 않는다. 부득이하면 타입 문자열(`"auth/clearUser"`)로.

`home` · `historyLegend` 는 **예외 아님**. `home` 은 전용 스토어(`/home` 1회 호출)가 있고 다른 도메인 상태를 채우지 않는다 — 홈에서 쿠폰·공지로 이동하면 그 화면이 다시 불러온다. `historyLegend` 는 서버 연동 스토어 있음, 옛 이름 `historyMode` 로 찾지 마라. `quiz/store/public/` 은 삭제됨 — 공개 퀴즈는 `/home` 응답으로 온다. 죽은 thunk 8개도 2026-09-28 제거.

## 5. 외부 통신

- axios 는 `@/infra/http/client.js` 의 `API` 인스턴스만. `axios.create` 신설 금지
- 화면·컴포넌트에서 axios 직접 호출 금지 — `store/{public,admin}/api.js` 만 호출 책임
- 로그 수집 `pushEvent` 는 `@/infra/analytics/ga.js` 단일 진입. 도메인별 이벤트는 `infra/analytics/events/{도메인}Events.js`
- 서버 오류 코드 문자열(`AUTH_USER_BLOCKED` 등)을 `client.js` 가 직접 들고 있다 → BE 가 코드를 바꾸면 **동반 배포**. 커밋 `버전 영향:` 사유에 `(동반 배포)` 표기 (`rules/common/commit-version.md`)

## 6. 금지

- `addCase` 직접 · 로딩 칸 공유 · 응답에 notify 섞기 · 요청 값으로 상태 채우기
- 컴포넌트에서 axios / dispatch 가공 · `axios.create` · 스토어 미등록 · thunk → slice import (순환)
- 관리자 목록 건수를 `list.length` 로 — 서버 기본 페이지 20건이 총건수로 보인다(회원 545명이 20으로 보인 사고). 페이징 API 는 전량 요청 또는 총건수 API

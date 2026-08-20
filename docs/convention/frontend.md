# 프론트엔드 컨벤션

> 기준일: 2026-08-21
> 출처: `docs/develop/frontend-developer.md`, `docs/global-guide/develop/specs/fe/module-conventions.md`, `docs/global-guide/develop/specs/fe/frontend-structure.md`
> 대상: `web/src/**` (React 19 + Redux Toolkit + Vite)

---

## 1. 빌드 환경 기본값

| 항목 | 규칙 |
|---|---|
| import 경로 | `@/...` 절대경로만 사용. `../../` 같은 깊은 상대경로 금지. 같은 폴더 안 파일 참조(`./X`)만 상대경로 허용 |
| SCSS 변수·믹스인 | `@/global/styles/index.scss` 가 모든 `*.module.scss` 파일에 자동으로 미리 불러와짐 → 컴포넌트 SCSS에서 `@use` 문 안 써도 바로 사용 가능 |
| 진입 파일 | `web/src/main.jsx` → `<AppProvider><RouterProvider /></AppProvider>` |
| 화면 형태 | 모바일 전용 단일 레이아웃. PC 전용 레이아웃 분기 없음 |

---

## 2. 최상위 폴더 구조

| 폴더 | 역할 |
|---|---|
| `app/` | 라우터 · 스토어 조립 · 전역 레이아웃. 도메인 코드는 두지 않음 |
| `domains/{도메인명}/` | 화면 + 훅 + 스토어를 한 폴더에 묶은 단위 |
| `global/` | 여러 도메인이 같이 쓰는 UI · 스타일 토큰 · 순수 유틸 함수. 외부 통신 없음 |
| `infra/` | 외부 시스템 연결 (axios 통신, 로그 수집, 파일 업로드 등). 두 도메인 이상이 같이 쓸 때만 여기 둔다 |
| `data/` | 서버 연동 전 임시로 쓰는 정적 데이터 (예: historyMode) |
| `assets/` | 이미지 등 정적 파일 |

새 코드는 반드시 도메인 폴더 안 `mobile/` 하위에 만든다.

---

## 3. 도메인 표준 폴더 구조

```text
domains/{도메인명}/
├── README.md                       # 도메인 설명 문서(권장)
├── mobile/
│   ├── {도메인명}Screen.jsx         # 라우트로 연결되는 진입 화면
│   ├── {도메인명}Screen.module.scss
│   ├── components/                 # 이 도메인 안에서만 쓰는 하위 부품
│   │   └── {부품명}/
│   │       ├── {부품명}.jsx
│   │       └── {부품명}.module.scss
│   ├── containers/public/          # 목록/섹션 조립. 다른 도메인이 가져다 쓸 수 있음(홈 화면 등)
│   │   └── {도메인명}List가로형or세로형.jsx
│   └── hooks/
│       └── use{도메인명}List.js     # 데이터 요청 + 상태 읽기를 한 곳에 모음
└── store/                          # 4번 참조
```

규칙
- 하위 부품 폴더명은 소문자로 시작(camelCase), 파일명은 대문자로 시작(PascalCase). 예: `couponCard/CouponCard.jsx`
- 화면이 하나인데 상태(빈 화면/결과/선택 등)만 여러 개로 갈리는 경우는 하위 부품으로 쪼개지 않는다. 아래 세 조건 중 하나를 만족할 때만 분리한다: (1) 같은 모양이 반복된다 (2) 겉모습이 상황별로 달라진다 (3) 다른 도메인에서도 재사용한다
- 도메인 화면 안에 자체 `<header>`를 만들지 않는다 — 전역 레이아웃의 상단바를 그대로 쓴다(5번 참조)

---

## 4. 상태 관리 (Redux Toolkit)

### 4.1 스토어 폴더 표준 (일반 사용자용/관리자용 분리)

```text
domains/{도메인명}/store/
├── public/
│   ├── api.js          # axios 호출만 하는 얇은 래퍼. 데이터 가공 금지
│   ├── endpoints.js    # 요청 경로 상수 + 액션 이름 상수
│   └── thunks.js       # createAsyncThunk. 여기서 정렬/필터 등 가공 처리
├── admin/               # 관리자 화면이 아직 없어도 미리 만들어 둔다
│   ├── api.js
│   ├── endpoints.js
│   └── thunks.js
├── dto.js               # (선택) 서버 응답 ↔ 화면 상태 모양 변환
└── slices.js            # createSlice. public + admin 요청을 한 슬라이스에서 처리
```

- 정렬·필터는 `thunks.js`에서 끝낸다. 컴포넌트나 훅에서 다시 가공하지 않는다
- `slices.js`는 공용 헬퍼(`applyAsyncHandlers`)로 로딩·에러 상태를 자동 관리한다
- 새 스토어는 반드시 `web/src/app/store/store.js`에 한 줄 등록해야 동작한다 (등록 안 하면 dispatch 해도 상태가 안 바뀜)
- axios 호출은 반드시 `@/infra/http/client.js`의 단일 인스턴스만 사용

### 4.2 관리자 응답 모달 규칙

관리자 전용 thunk만 결과에 `options`(성공여부/메시지/종류)를 담아 반환한다. 이 값이 있으면 전역 리스너가 관리자 계정에게만 결과 모달을 띄운다. 일반 사용자용 thunk는 `options`를 넣지 않는다.

### 4.3 표준을 따르지 않는 예외 도메인

| 도메인 | 형태 | 이유 |
|---|---|---|
| authentication | public/admin 구분 없이 평평한 구조 | 로그인 관련이라 관리자 개념 자체가 없음 |
| home | 스토어 없음 | 다른 도메인의 훅(쿠폰/이벤트/공지 목록)을 그대로 가져다 조립만 함 |
| historyMode | 스토어 없음 | 서버 연동 전까지 정적 데이터만 사용 |

---

## 5. 화면 레이아웃 규칙

- 전역 레이아웃 하나가 상단바 + 서랍 메뉴 + 본문 영역을 감싼다. 도메인 화면은 이 틀 안의 본문 자리에만 들어간다
- 상단바 모양을 바꾸고 싶으면 화면 진입 시 `useSetTopBar({ variant, title, rightAction, onBack })`를 호출한다. 호출하지 않으면 기본 모양이 적용된다
- 도메인 화면에 별도 헤더나 상단 영역을 새로 만들지 않는다

---

## 6. 라우트 등록 규칙

새 도메인 화면을 라우트에 연결하는 순서:

1. `web/src/app/router/config/routePath.js`, `routeMeta.js`에 경로/제목 추가
2. 라우트 파일(`PublicRoutes.jsx` 등)에 `lazy(() => import(...))`로 화면 불러오기 추가
3. 라우터 변수명은 `{도메인명}Page` 형태로 통일 (예: `CouponPage`)
4. `handle: ROUTE_META.{키}.title`로 페이지 제목 지정
5. (선택) 서랍 메뉴에 노출하려면 `MENU_GROUPS.js`에 항목 추가

```jsx
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));

export const PublicRoutes = [
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title },
];
```

---

## 7. 파일 · 네이밍 규칙

| 대상 | 규칙 | 예 |
|---|---|---|
| 화면/하위 컴포넌트 파일 | 대문자로 시작 + `.jsx` | `CouponScreen.jsx`, `CouponCard.jsx` |
| 하위 컴포넌트 폴더 | 소문자로 시작 | `couponCard/` |
| SCSS 모듈 | 컴포넌트명과 동일 + `.module.scss` | `CouponCard.module.scss` |
| 도메인 전용 스타일 변수 파일 | `{도메인명}.tokens.scss` | `historyMode.tokens.scss` |
| 훅 | `use` + 대문자 시작 이름 | `useCouponList.js` |
| 정적 상수 | 전체 대문자 + 밑줄 | `MENU_GROUPS.js` |
| 스토어 슬라이스 파일 | `slices.js` | `events/store/slices.js` |
| barrel(재수출) 파일 | `index.js` (소문자) | `global/ui/responseModal/index.js` |

컴포넌트는 항상 기본 내보내기(default export) 1개만 가진다.

---

## 8. 컴포넌트를 어디에 둘지 정하는 기준

| 상황 | 위치 |
|---|---|
| 이 도메인 안에서만 쓴다 | `domains/{도메인명}/mobile/components/` |
| 다른 도메인도 가져다 쓴다 (홈 화면 등) | `domains/{도메인명}/mobile/containers/public/` |
| 여러 도메인이 공통으로 쓴다 | `global/ui/{부품명}/` |

새 컴포넌트를 만들 때 확인할 것
1. 위 표로 위치 결정
2. props로 가공된 데이터만 받는다 — 컴포넌트 안에서 axios 호출이나 dispatch 직접 호출 금지
3. 옆에 `{Name}.module.scss` 두기 — 토큰(색상 변수, 간격 변수)만 사용, 하드코딩 금지
4. 기본 내보내기 1개
5. 상태 분기만 있는 단일 화면은 굳이 쪼개지 않는다(3번 원칙)

---

## 9. 외부 통신 규칙

- 모든 axios 호출은 `@/infra/http/client.js`의 `API` 인스턴스로만 한다. `axios.create`를 새로 만들지 않는다
- 화면/컴포넌트에서 axios를 직접 부르지 않는다 — 도메인의 `store/{public,admin}/api.js`만 호출 책임을 가진다
- 로그 수집(`pushEvent`)은 `@/infra/analytics/ga.js`가 단일 진입점. 도메인별 이벤트 함수는 `infra/analytics/events/{도메인명}Events.js`에 모아둔다

---

## 10. 신규 도메인 추가 체크리스트

1. `domains/{새도메인}/` 폴더를 3번 구조대로 만든다 (관리자 화면이 없어도 `store/admin/`은 미리 준비)
2. `web/src/app/store/store.js`에 스토어 등록
3. `routePath.js` + `routeMeta.js`에 경로/제목 추가
4. 라우트 파일에 lazy import + 라우트 항목 추가
5. (선택) 서랍 메뉴에 항목 추가
6. (선택) 로그 수집 이벤트 함수 추가

---

## 11. 하지 말아야 할 것

- 도메인 폴더 밑에 `page/`나 `feature/` 같은 옛 방식 폴더를 새로 만들지 않는다 — 새 코드는 항상 `mobile/`
- `mobile/components/` 바깥에 하위 부품을 두지 않는다
- thunk 안에서 처리해야 할 가공(정렬/필터)을 컴포넌트나 훅에서 다시 하지 않는다
- 도메인 화면에 자체 `<header>`를 만들지 않는다
- 다른 도메인의 `mobile/components/**`를 직접 import하지 않는다 — 재사용이 필요하면 `containers/`나 `global/ui/`로 옮긴다
- 스토어 등록을 빼먹지 않는다 (빼먹으면 dispatch해도 상태가 안 바뀌는 조용한 버그가 생긴다)

---

## 12. 참고

- 스타일 토큰(색상/간격/타이포/반응형) 규칙은 `docs/convention/design.md` 참조
- 백엔드 쪽 응답 형식·권한 규칙은 `docs/convention/backend.md` 참조

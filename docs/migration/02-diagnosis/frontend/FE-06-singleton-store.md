# FE-06 모듈 단위 단일 Redux 스토어

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 3단계 — [`phase-3`](../../03-roadmap/phase-3-nextjs-shell.md)
> 관련: FE-05

## 현상
Redux 스토어가 모듈을 import 할 때 한 번 만들어지는 전역 객체다. 브라우저에서는 탭마다 모듈이 새로 로드되니 문제가 없지만, 서버는 **하나의 프로세스가 여러 요청을 처리**하므로 같은 스토어를 공유하게 된다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/app/store/store.js:19` | `export const store = configureStore({...})` — 리듀서 16개, 리스너 미들웨어 |
| `web/src/app/store/store.js:43-44` | `players` 경로를 직렬화 · 불변성 검사에서 제외(대용량 목록) |
| 데이터 조회 방식 | 화면이 `useEffect` 에서 thunk 를 dispatch 해 가져온다. 라우트 로더 없음 |

## 영향
- **정적 export(1차)**: 지금은 조회가 `useEffect` 안이라 빌드 렌더 중에는 스토어가 비어 있다. 다만 이관하면서 렌더 중 dispatch 나 초기 데이터 주입이 생기면, 한 빌드 프로세스 안에서 재사용되는 모듈 스토어 때문에 앞 페이지 상태가 뒤 페이지 HTML 에 섞일 수 있다.
- **SSR(7단계)**: 사용자 A 의 로그인 상태가 사용자 B 의 응답에 섞이는 **정보 노출 사고**로 이어진다.

## 해결 방향
1. **스토어 팩토리**: `makeStore()` 를 export 하고, 클라이언트 컴포넌트 `StoreProvider` 가 `useRef` 로 인스턴스를 한 번만 만든다 (Redux Toolkit 공식 Next.js 가이드 패턴).
2. **서버 컴포넌트는 Redux 를 쓰지 않는다.** 공개 페이지의 초기 데이터는 서버 컴포넌트가 `fetch` 해서 props 로 넘긴다. Redux 는 필터 · 모달 · 로그인 사용자처럼 **브라우저에서만 의미 있는 상태**에 남긴다.
3. 목록 데이터를 Redux 에 넣던 도메인(쿠폰 · 이벤트 · 공지 등)은 이관하면서 "서버 fetch → props" 로 바꾸고, 필요하면 초기 데이터를 스토어에 주입(preloadedState)한다.

## 완료 기준
- [ ] `export const store =` 형태의 모듈 싱글턴이 없다 (`makeStore` 만 존재)
- [ ] 서버 컴포넌트 파일에서 `react-redux` import 0건
- [ ] 두 페이지를 연속 빌드했을 때 앞 페이지 데이터가 뒤 페이지 HTML 에 없다

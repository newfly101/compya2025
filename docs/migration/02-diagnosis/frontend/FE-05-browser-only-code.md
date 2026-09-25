# FE-05 서버에서 실행할 수 없는 코드

> 상태: 열림
> 심각도: 🔴 이관 차단
> 닫히는 단계: 1단계 — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: FE-01, FE-06

## 현상
Next 는 빌드 때 Node 에서 컴포넌트를 import 하고 렌더한다. Node 에는 `window` · `document` · `localStorage` 가 없다. 지금 코드에는 **import 하는 순간** 이 객체들을 읽는 모듈이 있어, 그 모듈을 쓰는 페이지는 빌드에서 바로 죽는다.

## 근거
**① 모듈 최상위에서 읽음 — import 만 해도 실패**

| 위치 | 코드 |
|---|---|
| `web/src/global/ui/responseModal/ResponseModal.jsx:3` | `const modalRoot = document.getElementById("modal")` |
| `web/src/domains/players/mobile/components/filterSheet/FilterSheet.jsx:7` | 같음 |
| `web/src/domains/home/components/section/support/SupportSection.jsx:8` | 같음 |
| `web/src/domains/authentication/hooks/useAuthentication.js:8` | `window.location.hostname` 으로 `REDIRECT_URI` 결정 |
| `web/src/infra/analytics/ga.js:4` | `window.location.hostname` 으로 개발 여부 판정 |
| `web/src/infra/analytics/events/authEvents.js:4` | 같음 |
| `web/src/infra/http/client.js:14-22` | 요청 인터셉터가 매 요청 `window.location` · `document.referrer` 를 읽음 |

**② 렌더 중에 읽거나 씀 — 서버 렌더와 첫 클라이언트 렌더가 달라짐**

| 위치 | 코드 |
|---|---|
| `web/src/app/router/guards/AuthGuard.jsx:12` | 렌더 도중 `sessionStorage.setItem("redirectPath", ...)` (부수 효과) |
| `web/src/domains/players/mobile/PlayerEncyclopediaScreen.jsx:118` | `useState(readSavedView)` — 초기값을 `localStorage` 에서 |
| `web/src/domains/community/feature/hooks/user/post/useUserPost.js:27-28` | `useState(() => window.matchMedia(...))` |

**③ 전체 규모** — `src/` 기준 `window.` 47줄(23파일), `document.` 65줄(24파일), `localStorage` 7줄, `sessionStorage` 4줄, `navigator.` 3줄. 대부분은 이벤트 핸들러 · `useEffect` 안이라 문제없다.

## 영향
- ① 은 이관 첫날 빌드를 멈춘다.
- ② 는 빌드는 되지만 hydration mismatch 경고와 화면 깜빡임을 만든다.

## 해결 방향
**이관 전에 Vite 앱 안에서 먼저 고친다.** 고친 결과는 지금 앱에서도 똑같이 동작해야 한다(동작 변화 없는 리팩터).

| 유형 | 고치는 법 |
|---|---|
| 포털 대상 `#modal` | 모듈 상수 대신 컴포넌트 안에서 `document.getElementById` — 마운트 후(`useEffect`) 또는 렌더 시 `typeof document !== "undefined"` 가드 |
| 호스트로 환경 판정 | `window.location.hostname` 대신 **빌드 환경변수**(`import.meta.env.MODE` → 이관 후 `process.env.NEXT_PUBLIC_*`) |
| 요청 인터셉터의 `location` · `referrer` | `typeof window === "undefined"` 이면 헤더를 붙이지 않음. 서버용 fetch 는 이관 후 별도 모듈로 분리 |
| 렌더 중 storage 쓰기 | `useEffect` 로 이동 |
| storage · `matchMedia` 초기값 | 첫 렌더는 기본값, 마운트 후 `useEffect` 에서 읽어 반영(또는 `useSyncExternalStore` 의 `getServerSnapshot`) |

ESLint 규칙으로 재발을 막는다: 모듈 최상위의 `window`/`document` 접근을 금지하는 `no-restricted-globals` 예외 설정, 또는 리뷰 체크리스트 항목.

## 완료 기준
- [ ] `grep -rnE "^(const|let|var) .*\b(window|document)\." web/src` 결과 0건
- [ ] `AuthGuard` 가 렌더 중 storage 를 쓰지 않는다
- [ ] 각 수정 후 기존 Vite 앱의 해당 화면 동작이 같다(모달 열림, 로그인 리다이렉트, 선수 보기 방식 기억)

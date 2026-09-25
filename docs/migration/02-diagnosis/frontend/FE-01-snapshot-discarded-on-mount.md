# FE-01 스냅샷을 버리고 다시 그리는 마운트

> 상태: 열림
> 심각도: 🟠 이관 중 해결
> 닫히는 단계: 3~4단계 — [`phase-3`](../../03-roadmap/phase-3-nextjs-shell.md), [`phase-4`](../../03-roadmap/phase-4-page-migration.md)
> 관련: FE-05, FE-06

## 현상
prerender 로 받은 HTML 에는 본문이 있다. 그런데 JS 가 실행되면 React 가 그 DOM 을 **지우고 처음부터 다시 그린다**. 게다가 인증 확인이 끝날 때까지 앱 전체가 아무것도 렌더하지 않아, 본문이 한 번 사라졌다가 다시 나타난다.

## 근거
| 위치 | 내용 |
|---|---|
| `web/src/main.jsx:7` | `createRoot(document.getElementById("root")).render(...)` — hydrate 가 아니라 새로 마운트 |
| `web/scripts/prerender.mjs:7` 주석 | "createRoot 그대로, hydrateRoot 전환 X" — 의도된 선택 |
| `web/src/app/provider/AuthProvider.jsx:32` | `if (!initialized) return null;` — `/users/me` 확인 전까지 빈 화면 |

## 영향
- **지금**: 첫 화면이 스냅샷 → 빈 화면 → 완성 화면으로 깜빡인다. CLS(레이아웃 이동)와 LCP(가장 큰 요소 표시 시간)가 나빠진다. 로그인 여부와 무관한 공개 페이지까지 인증 응답을 기다린다.
- **그냥 `hydrateRoot` 로 바꾸면**: 스냅샷 DOM 과 첫 클라이언트 렌더가 다르면(인증 상태, `localStorage` 값, 날짜 등) hydration mismatch 가 난다. prerender 구조에서는 서버 렌더 결과를 React 가 보장하지 않으므로 이 전환은 위험하다 — 그래서 원래 안 했다.

## 해결 방향
| 선택 | 판단 |
|---|---|
| Vite 앱에서 `hydrateRoot` 전환 | 기각 — 스냅샷이 React 렌더 결과라는 보장이 없음 |
| **Next.js 로 이관(SSG)** | 채택 — 빌드 때 React 가 직접 렌더한 HTML 을 같은 React 가 hydrate. 불일치는 개발 모드 경고로 잡힌다 |

이관 시 지킬 것:
1. 인증 여부로 **페이지 전체**를 막지 않는다. 헤더의 로그인 버튼처럼 인증에 따라 바뀌는 조각만 클라이언트에서 마운트 후 그린다(`useEffect` 이후 상태 반영, 또는 `dynamic(..., { ssr: false })`).
2. 첫 렌더에서 `localStorage` · `Date.now()` · `Math.random()` 결과를 화면에 쓰지 않는다 → [FE-05](./FE-05-browser-only-code.md).

## 완료 기준
- [ ] 이관된 페이지에서 JS 를 끈 상태와 켠 상태의 본문이 같다
- [ ] 개발 모드 콘솔에 hydration 경고가 0건
- [ ] 공개 페이지 첫 렌더가 `/users/me` 응답을 기다리지 않는다 (네트워크 탭에서 본문 표시가 `/users/me` 보다 먼저)

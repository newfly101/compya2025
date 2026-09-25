# 01. 배경 — 왜 Next.js 로 가는가 (결정 요약)

> 기준일: 2026-09-25
> 형식: ADR(설계 결정 기록) — 상황 / 결정 / 이유 / 치르는 값 / 되돌리려면
> 상세: [`adsense-and-csr.md`](./adsense-and-csr.md) · [`prerender-stopgap.md`](./prerender-stopgap.md) · [`rendering-options.md`](./rendering-options.md)

---

## 1. 프로젝트가 걸어온 방향

| 시기 | 방향 | 렌더링 방식 |
|---|---|---|
| 2025-06 | 로그인 뼈대 원형(`newfly101/baseball2025`) — Spring + React 를 한 저장소에 두는 연습 | CSR |
| 2025-12 ~ 2026-05 | 컴프야펀 개시, PC 웹 → 모바일 대응, 기능 확장 (커밋 약 950) | CSR |
| 2026-08-20 ~ 09-13 | v2 리뉴얼 — 모바일 우선 재작성, 데이터 도메인 3개 신설, 인증 결함 수정, **애드센스 대응** | CSR + **빌드타임 prerender** |
| 다음 | 기존 결함을 먼저 닫고 페이지 단위로 Next.js 이관 | **SSG(정적 export)** → 필요 시 SSR/ISR |

방향은 한 번도 "기술을 바꾸고 싶어서" 가 아니었다. **1인 운영으로 게임 정보를 빨리 찾게 한다 → 광고로 운영비를 회수한다** 는 목표가 요구하는 것을 따라왔다. CSR 은 기능을 빨리 붙이는 데 맞았고, 검색 노출과 광고 심사라는 요구가 생기자 한계가 드러났다.

---

## 2. 결정

| 항목 | 내용 |
|---|---|
| **상황** | 애드센스가 「게시자 콘텐츠가 없는 화면의 광고」 「가치가 별로 없는 콘텐츠」 로 반려(2026-08-30). 원인은 SPA 가 모든 주소에 같은 빈 `<div id="root">` 를 내려보낸 것. prerender 로 29개 정적 경로 + 공지 상세 스냅샷을 만들어 대응했지만, 스냅샷을 버리고 다시 그리는 마운트, 스냅샷 없는 주소의 소프트 404, 퍼피티어 대기 로직의 취약성이 남았다 |
| **결정** | 프론트엔드를 **Next.js App Router + TypeScript** 로 옮긴다. 1차 목표는 `output: 'export'`(정적 export)로 **지금의 S3 + CloudFront 배포를 유지**하는 것이다. 서버 런타임(SSR/ISR)은 커뮤니티 글쓰기처럼 자주 바뀌는 사용자 콘텐츠가 열릴 때 7단계에서 따로 판단한다 |
| **이유** | ① 크롤러와 사용자가 **같은 HTML** 을 받고 React 가 그 위에서 hydrate 한다(스냅샷을 버리지 않음) ② `generateStaticParams` · `generateMetadata` · `notFound()` · `sitemap.ts` 가 지금 손으로 만든 prerender · sitemap · 메타 스크립트를 프레임워크 기능으로 대체한다 ③ 빌드 시 데이터 조회가 브라우저가 아닌 Node 에서 일어나 CORS · `localhost:3000` 결합이 사라진다 ④ 정적 export 는 인프라를 바꾸지 않으므로 1인 운영의 위험이 작다 |
| **치르는 값** | 라우터 · 스토어 · 브라우저 API 사용처를 손봐야 한다([FE-05](../02-diagnosis/frontend/FE-05-browser-only-code.md), [FE-06](../02-diagnosis/frontend/FE-06-singleton-store.md)). 정적 export 에서는 middleware · ISR · 서버 쿠키를 못 쓴다. 공지가 새로 올라오면 여전히 재빌드가 필요하다(지금과 같음 — 자동화로 보완) |
| **안 고른 것** | SSR 전면 전환(인프라 교체 + 인증 쿠키 재설계를 한 번에 떠안음) · 동적 렌더링(UA 분기, 정책 위험) · prerender 계속 보강(퍼피티어 대기 로직을 계속 땜질) — 비교표는 `rendering-options.md` |
| **되돌리려면** | 이관은 `frontend/` 새 폴더에서 진행하고 `web/` 은 컷오버까지 그대로 배포한다. 6단계 전에는 언제든 멈출 수 있고, 6단계 이후에도 배포 워크플로의 빌드 경로만 되돌리면 이전 산출물로 돌아간다 |

---

## 3. 이 결정이 전제로 하는 정책

| 정책 (Notion 「서비스 정책」) | 이관에 미치는 영향 |
|---|---|
| 조회 화면은 **전부 공개** | 공개 페이지는 인증 없이 빌드 시점에 전부 그릴 수 있다 → 정적 export 가 성립하는 근거 |
| 기록이 남는 행동(퀴즈 참여 · 글쓰기 · 마이페이지)만 로그인 | 로그인 화면은 클라이언트 컴포넌트로 두면 된다. 서버 인증은 7단계까지 미룰 수 있다 |
| 확률 공시 상세 · 커뮤니티는 색인 제외 | 정적 생성 대상에서 빼거나 `robots: noindex` 로 둔다 |
| 광고는 자동광고 금지, 본문 있는 자리의 수동 슬롯만 | 광고 슬롯은 hydrate 뒤 클라이언트에서만 채운다. 빈 화면 광고 문제는 구조적으로 사라진다 |

---

## 4. 이 폴더의 문서

| 문서 | 한 줄 |
|---|---|
| [`adsense-and-csr.md`](./adsense-and-csr.md) | 반려 사유가 CSR 구조에서 어떻게 나왔는지 |
| [`prerender-stopgap.md`](./prerender-stopgap.md) | prerender 로 무엇을 얻었고 무엇이 남았는지 |
| [`rendering-options.md`](./rendering-options.md) | CSR · prerender · SSG · SSR · ISR 비교, 프레임워크 후보 비교, 정적 export 를 1차로 고른 이유 |

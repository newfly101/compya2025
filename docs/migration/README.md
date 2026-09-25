# CSR → Next.js 이관 문서 — 컴프야펀

> 기준일: 2026-09-25
> 기준 코드: `master` @ `566cf3b` (2026-09-13)
> 대상 독자: 이 프로젝트를 처음 보는 주니어 풀스택 개발자, 포트폴리오 검토자
> 배경: 애드센스 반려(2026-08-30) 이후 빌드타임 prerender 로 급한 불은 껐지만, SPA 구조가 남긴 한계가 계속 드러났다. 왜 Next.js 로 가는지, 어떤 순서로 기존 결함을 잡으며 옮기는지를 한곳에 남긴다.

---

## 1. 한 줄 요약

> 검색엔진이 빈 HTML 을 받던 React SPA 를, **기존 결함을 먼저 정리한 뒤 페이지 단위로 Next.js(App Router, 정적 export)로 옮겨** 크롤러와 사용자가 같은 HTML 을 받게 만든다.

포트폴리오용 문장과 STAR 정리는 [`05-project-management/portfolio.md`](./05-project-management/portfolio.md) 에 있다.

---

## 2. 폴더 지도

| 폴더 | 무엇을 담나 | 언제 여나 |
|---|---|---|
| [`01-background/`](./01-background/README.md) | **왜** — 애드센스 반려, prerender 임시 해법의 한계, 렌더링 방식 비교와 결정 | "왜 Next.js 인가" 를 설명해야 할 때 |
| [`02-diagnosis/`](./02-diagnosis/README.md) | **지금 무엇이 문제인가** — FE · BE · 운영 결함을 문제 1건당 md 1개로 관리 | 결함 하나를 고치러 들어갈 때 |
| [`03-roadmap/`](./03-roadmap/README.md) | **어떤 순서로 옮기나** — 0~7단계, 단계마다 어떤 결함을 닫는지와 완료 기준 | 다음 작업을 고를 때 |
| [`04-deep-dive/`](./04-deep-dive/README.md) | **깊게 보면** — 프론트엔드 풀스택 / 백엔드 풀스택 관점의 기술 포인트 | 설계 이유를 면접·리뷰에서 설명해야 할 때 |
| [`05-project-management/`](./05-project-management/README.md) | **어떻게 관리하나** — 문서 원천(Notion vs 저장소), 이슈 ID, 완료 정의, 포트폴리오 | 문서나 작업 방식을 바꿀 때 |

---

## 3. 읽는 순서

1. `01-background/README.md` — 결정 요약 (5분)
2. `02-diagnosis/README.md` — 결함 목록 표 (5분)
3. `03-roadmap/README.md` — 단계 표 (5분)
4. 필요한 단계의 `phase-*.md` 와, 거기서 링크된 결함 md 만 연다

---

## 4. 결함 색인

심각도: **🔴 이관 차단**(이것부터 고쳐야 옮길 수 있음) · **🟠 이관 중 해결** · **🟡 정리**

| ID | 제목 | 심각도 | 닫히는 단계 |
|---|---|---|---|
| [FE-01](./02-diagnosis/frontend/FE-01-snapshot-discarded-on-mount.md) | 스냅샷을 버리고 다시 그리는 마운트 | 🟠 | 3~4 |
| [FE-02](./02-diagnosis/frontend/FE-02-soft-404.md) | 없는 주소가 홈 HTML(200)로 응답 | 🟠 | 5~6 |
| [FE-03](./02-diagnosis/frontend/FE-03-prerender-fragility.md) | prerender 파이프라인 취약성 | 🟠 | 6 |
| [FE-04](./02-diagnosis/frontend/FE-04-client-side-meta.md) | 메타 태그를 브라우저에서 조작 | 🟠 | 5 |
| [FE-05](./02-diagnosis/frontend/FE-05-browser-only-code.md) | 서버에서 실행할 수 없는 코드 | 🔴 | 1 |
| [FE-06](./02-diagnosis/frontend/FE-06-singleton-store.md) | 모듈 단위 단일 Redux 스토어 | 🟠 | 3 |
| [FE-07](./02-diagnosis/frontend/FE-07-login-flag-policy-mismatch.md) | 정책과 어긋난 「로그인 필요」 표시 | 🟡 | 1 |
| [FE-08](./02-diagnosis/frontend/FE-08-ad-gate-inconsistent.md) | 광고 게이트 검사 누락 | 🟡 | 1 |
| [FE-09](./02-diagnosis/frontend/FE-09-dead-code-and-deps.md) | 죽은 코드 · 미사용 의존성 · 잘못된 설정 | 🟡 | 1 |
| [BE-01](./02-diagnosis/backend/BE-01-all-errors-500.md) | 처리 못 한 예외가 전부 500 | 🔴 | 1 |
| [BE-02](./02-diagnosis/backend/BE-02-expired-token-blocks-public-get.md) | 만료 토큰이면 공개 조회도 401 | 🔴 | 1 |
| [BE-03](./02-diagnosis/backend/BE-03-oauth-state-unchecked.md) | OAuth `state` 미검증 | 🔴 | 1 |
| [BE-04](./02-diagnosis/backend/BE-04-cookie-model.md) | 인증 쿠키 설정이 SSR 과 맞지 않음 | 🟠 | 7 |
| [BE-05](./02-diagnosis/backend/BE-05-hardcoded-env.md) | 환경별 값 하드코딩 | 🟠 | 1 |
| [BE-06](./02-diagnosis/backend/BE-06-notice-contract.md) | 공지 API 계약(슬러그 · 목록 크기) | 🔴 | 1 |
| [BE-07](./02-diagnosis/backend/BE-07-response-shape.md) | 응답 형태 · 에러 코드 불일치 | 🟡 | 1~4 |
| [BE-08](./02-diagnosis/backend/BE-08-cache-config-drift.md) | 캐시 설정과 문서의 괴리 | 🟡 | 5 |
| [OPS-01](./02-diagnosis/ops/OPS-01-docs-drift.md) | 문서끼리, 문서와 코드가 어긋남 | 🟠 | 0 |
| [OPS-02](./02-diagnosis/ops/OPS-02-deploy-pipeline.md) | 배포 파이프라인 공백 | 🟠 | 0, 6 |
| [OPS-03](./02-diagnosis/ops/OPS-03-db-migration.md) | DB 마이그레이션 도구 부재 · 테이블 세대 중복 | 🟡 | 1 |
| [OPS-04](./02-diagnosis/ops/OPS-04-test-gap.md) | 테스트 공백 | 🟠 | 0~1 |
| [OPS-05](./02-diagnosis/ops/OPS-05-done-definition.md) | "확인" 에서 멈춘 작업 — 완료 정의 부재 | 🟠 | 0 |

---

## 5. 이 문서 묶음의 규칙

- 결함 md 는 **현상 → 근거(`파일:줄`) → 영향 → 해결 방향 → 완료 기준** 순서를 지킨다.
- 결함을 닫으면 해당 md 머리말의 `상태` 를 바꾸고, 위 색인과 Notion 「📋 작업 보드」 를 함께 고친다. 규칙 전체는 [`05-project-management/README.md`](./05-project-management/README.md).
- 코드 줄 번호는 기준 커밋(`566cf3b`) 기준이다. 코드가 바뀌면 줄 번호보다 **파일과 심볼 이름**을 믿는다.

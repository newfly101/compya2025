# 반응형 전략 — 공용

> 본 프로젝트 전체 공용 컨벤션. planner / designer / FE developer agent 참조.

---

## 1. 본 프로젝트 — mobile-first 단일 모드 (고정)

| 항목 | 값 |
|---|---|
| 모드 | `mobile-first` (확정) |
| 결정 절차 | 없음 — 사용자 질의 없이 mobile-first 적용 |
| pc-first 모드 | 본 프로젝트 미적용 (deprecated) |
| 상세 컨벤션 | [responsive-mobile-first.md](./responsive-mobile-first.md) |

⭐ 본 프로젝트는 **모바일 우선 / 단일 모드**. 데스크탑 전용 레이아웃 / multi-column / pc-first 분기 모두 X.

---

## 2. 공통 원칙

| # | 원칙 |
|---|---|
| 1 | **단일 코드베이스 / 단일 컴포넌트** — SSR/CSR 분기 X, 컴포넌트 분기 X |
| 2 | **디자인 토큰 일원화** — color/typography/spacing/radius 동일 토큰 |
| 3 | **글로벌 레이아웃 컴포넌트 우선** — `<MobileLayout>` 사용. 도메인별 자체 헤더 X |
| 4 | **CSS clamp() / min() / max() 권장** — 부드러운 스케일링 |
| 5 | **media query 는 컨벤션 파일의 breakpoint 만 사용** — 일회성 breakpoint X |

---

## 3. 자가 점검 (모든 agent 공통)

- [ ] `responsive-mobile-first.md` 1회 Read 했는가?
- [ ] 산출물에 mobile-first 원칙 반영했는가? (도메인 헤더 X / multi-column X / hover 의존 X)
- [ ] `<MobileLayout>` 사용했는가? (도메인 자체 wrapper X)

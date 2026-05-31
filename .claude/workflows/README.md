# Workflows — 사용 가이드

> `.claude/workflows/` 는 메인 어시스턴트가 따라하는 절차서 모음.
> agent 가 아닌 markdown 문서 — 메인이 Read 해서 sub-agent dispatch.

---

## 1. 현재 워크플로

| 워크플로 | 파일 | 용도 |
|---|---|---|
| Multi-Feature Parallel | [multi-feature-parallel.md](./multi-feature-parallel.md) | 다중 도메인 한 세션 병렬 처리 (planner → integrate) |

---

## 2. 사용 방법

자연어로 메인에게 요청:

```
"multi-parallel 워크플로로 coupons, events, notices 진행해줘"
```

메인이 워크플로 markdown 을 Read → 절차 따라 sub-agent dispatch.

---

## 3. 워크플로 vs Agent

| 구분 | Workflow | Agent |
|---|---|---|
| 형태 | 절차 markdown | 페르소나 + 시스템 프롬프트 |
| 호출 | 메인이 Read 해서 따라함 | Task tool dispatch |
| 컨텍스트 | 메인에서 직접 진행 | 격리된 sub-session |
| 토큰 | 가벼움 | 무거움 |
| 적합 | 절차 자동화 | 깊은 사고 작업 |

---

## 4. 관련 컨벤션

| 컨벤션 | 용도 |
|---|---|
| [file-locks.md](../conventions/file-locks.md) | 다중 기능 병렬 시 충돌 방지 |
| [file-split.md](../conventions/file-split.md) | 산출물 100줄 초과 시 분할 룰 |
| [fe-code-base.md](../conventions/fe-code-base.md) | FE 코드 패턴 cheat sheet |
| [responsive.md](../conventions/responsive.md) | 반응형 (본 프로젝트 mobile-first 단일) |
| [figma-plugin.md](../conventions/figma-plugin.md) | figma-plugin 분리 구조 + 누적 보존 |
| [hitl-markers.md](../conventions/hitl-markers.md) | 의사결정 마커 |

---

## 5. 워크플로 신규 추가 시 컨벤션

1. 파일명: `{snake-case}.md`
2. 위치: `.claude/workflows/`
3. 본 README 표 추가
4. 구조: § 목적 / § 사전 조건 / § 사용자 input / § 전체 흐름 / § Phase 절차 / § 보고 / § 실패 처리 / § 명령 예시
5. 줄 수: **200줄 이내 권장** ([file-split.md](../conventions/file-split.md))

---

## 6. 향후 추가 예정

| 워크플로 | 용도 |
|---|---|
| `single-feature.md` | 단일 도메인 전 단계 자동 |
| `design-only.md` | planner 산출물 → designer 만 |
| `develop-only.md` | analyze ~ integrate (기획/디자인 완료 후) |
| `review-only.md` | 기존 화면 review |

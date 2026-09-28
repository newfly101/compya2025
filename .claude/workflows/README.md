# Workflows — 사용 가이드

> `.claude/workflows/` 는 메인 어시스턴트가 따라하는 절차서 모음. agent 가 아닌 markdown — 메인이 Read 해서 sub-agent dispatch. 어느 agent 에 어느 rules 를 Read 시키고 산출물을 어디에 두는지는 `.claude/agents/README.md`.

## 1. 현재 워크플로

| 워크플로 | 파일 | 용도 |
|---|---|---|
| Multi-Feature Parallel | `multi-feature-parallel.md` | 다중 도메인 한 세션 병렬 처리 (planner → integrate) |
| **feature (열차)** | `feature.js` — Workflow 도구 스크립트 | 기능 하나를 자동으로 끝까지: drafts → 분석 → FE∥BE → Playwright 실측·수정 루프(3회) → 문서 검사. 호출은 `/feature <기능>` 스킬(`.claude/skills/feature/SKILL.md`)이 한다 |

## 2. 사용 방법

자연어로 메인에게 요청: `"multi-parallel 워크플로로 coupons, events, notices 진행해줘"` → 메인이 워크플로 markdown 을 Read → 절차 따라 dispatch. brief 는 `.claude/templates/dispatch-brief.md` 를 채운다.

## 3. 워크플로 vs Agent

| 구분 | Workflow | Agent |
|---|---|---|
| 형태 | 절차 markdown | 페르소나 + 시스템 프롬프트 |
| 호출 | 메인이 Read 해서 따라함 | Agent 도구 dispatch |
| 컨텍스트 | 메인에서 직접 진행 | 격리된 sub-session |
| 적합 | 절차 자동화 | 깊은 사고 작업 |

## 4. 관련 규칙·절차

| 파일 | 용도 |
|---|---|
| `.claude/conventions/file-locks.md` | 다중 기능 병렬 시 충돌 방지 |
| `.claude/conventions/agent-progress.md` · `agent-progress-main.md` | progress.log · Monitor · 로그 통합 |
| `.claude/rules/common/file-split.md` | 산출물 분할 한도 |
| `.claude/rules/common/hitl-markers.md` | 의사결정 마커 |
| `.claude/rules/fe/fe-convention.md` · `fe-design.md` | FE 코드 패턴 · mobile-first 값 |
| `.claude/references/designer/figma-mcp-rules.md` ❓ | Figma MCP 직접 조작 룰 — 위치 확인 필요 (D5) |
| `.claude/agents/README.md` | agent × Read 할 rules · 산출물 위치 · agent 파일 수정 목록 |

## 5. 워크플로 신규 추가 시

1. 파일명 `{kebab-case}.md`, 위치 `.claude/workflows/`, 본 README § 1 표에 추가
2. 구조: 목적 / 사전 조건 / 사용자 input / 전체 흐름 / Phase 절차 / 보고 / 실패 처리 / 명령 예시
3. 200줄 이내 (`file-split`)

## 6. 향후 추가 후보

| 워크플로 | 용도 |
|---|---|
| `single-feature.md` | 단일 도메인 전 단계 자동 |
| `develop-only.md` | analyze ~ integrate (기획·디자인 완료 후) |
| `fix-only.md` | `templates/analysis.md` → 수정 → `verification.md` → history 1항목. docs-policy 6단계 그대로 |
| `review-only.md` | 기존 화면 review |

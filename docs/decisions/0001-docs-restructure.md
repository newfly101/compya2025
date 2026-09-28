---
adr: 0001
title: docs 구조를 기능 단위 고정 문서로 재편한다
status: accepted
date: 2026-09-25
scope: docs/** 전체 · .claude/templates · CHANGELOG.md 위치
related: rules/common/docs-policy.md
created: 2026-09-25
updated: 2026-09-28
---

# 0001. docs 구조를 기능 단위 고정 문서로 재편한다

- 상태: 확정 (물리 이관 진행 중)
- 날짜: 2026-09-28
- 정책 본문: [.claude/rules/common/docs-policy.md](../../.claude/rules/common/docs-policy.md)

## 배경

`docs/` 가 201개 파일, 22,991줄까지 늘었다. 이 중 일회성 리뷰·감사·todo 문서가 134개, 13,434줄로 전체의 58%를 차지한다. 원인은 작업할 때마다 새 파일을 만드는 습관 — 리뷰 1회 = 문서 1개, 감사 1회 = 문서 1개 식으로 쌓였다. 문서 수가 작업 횟수에 비례해 버려서, 기능 하나의 현재 상태를 알려면 여러 파일을 뒤져야 하는 상태가 됐다.

## 결정

문서를 두 종류로 나눈다.

- **누적 문서** (`docs/`) — 기능마다 고정된 파일 3개(`spec.md` `design.md` `history.md`). 영속. 작업 시 갱신·덧붙임만, 새 파일 금지
- **작업 문서** (`.claude/.progress/<branch-name>/`) — 브랜치 1개당 존재, 머지 전 삭제. 과정 기록은 git 이력과 PR 본문에 남긴다

새 파일이 생기는 경우는 새 기능 추가와 여러 기능에 걸친 결정(ADR) 둘뿐이다. 버그 수정·리팩터링·리뷰·감사·실측은 전부 기존 파일 갱신으로 끝낸다. 상세 구조와 버전 규칙은 `docs-policy.md` 참조.

## 이관 대응표

| 현재 | 이동 |
|---|---|
| `docs/_roadmap/`, `docs/domain/_roadmap/prd/` | `docs/roadmap.md` 로 통합 |
| `docs/convention/` | `.claude/rules/common/`(규칙 6개: commit-version·docs-policy·domain-naming·file-split·git-scope·hitl-markers) + `.claude/rules/be/`·`.claude/rules/fe/`(스택별 규칙) |
| `docs/global-guide/`, `docs/mcp/` | `.claude/references/` (외부용 요약만 `docs/overview/`) |
| `docs/domain/` | `docs/overview/domain.md` + 기능별 내용은 `docs/features/*/spec.md` |
| `docs/design-review-v1/`, `docs/review-code-complete/`, `docs/consistency-audit/` | 결론만 해당 기능 `history.md` 첫 항목으로 요약. 원본은 태그 `docs-archive-2026-09` 로 보존 후 삭제 |
| `docs/code-review-v2/` (87파일) | **현 위치 유지 — 손대지 않음.** 수정 반영 이전 기록이며 다른 세션이 동시 작업 중. 처리 시점은 사용자가 따로 지시한다 |
| `docs/todo-*.md` 3개 | 남은 항목은 GitHub Issues 로, 파일 삭제 |
| `docs/refactoring-claude-ai.md` | `docs/overview/ai-workflow.md` 의 재료 |
| `docs/CHANGELOG.md` | 루트로 이동 |

> 2026-09-28 정정 — 규칙 본문은 `.claude/rules/`, 운영 절차는 `.claude/conventions/` 로 갈라졌다.

## 이번 재편에서 제외한 것

`docs/code-review-v2/` 87파일은 재편 범위 밖이다. 이 폴더를 읽거나 옮기거나 지우는 작업은 사용자 지시가 있을 때만 한다.

## 대안과 기각 사유

- **도구별로 자동 정리 스크립트를 돌린다** — 구조가 아니라 습관이 원인이라 재발한다. 기각
- **날짜 폴더로 아카이브만 한다** (`docs/2026-09/`) — 찾기는 쉬워지지만 "현재 기능 상태"가 여전히 여러 파일에 흩어진다. 기각
- **문서를 아예 없애고 커밋 메시지로만 남긴다** — 포트폴리오 공개용 산출물(README, spec)이 필요해 기각
- **기능별 폴더 안에서도 리뷰·감사를 별도 파일로 허용** — "새 파일 둘뿐" 원칙이 무너져 문제가 반복된다. 기각

## 영향

- 신규 기능·결정 외에는 새 파일이 생기지 않는다 — `docs/` 파일 수가 기능 수에 수렴
- 물리 이관은 이 결정 이후 별도 작업으로 진행한다. 이관 전까지는 옛 경로(`docs/convention/*` 등)도 함께 유효하다
- `CLAUDE.md` § 3, § 4 는 이관 후 기준 경로로 이미 갱신했다 — 실제 파일이 옮겨지기 전에는 문서와 실물 경로가 잠시 불일치한다

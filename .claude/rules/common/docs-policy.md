# 문서 정책

> 원칙 한 줄: **문서 수는 기능 수에 비례한다. 작업 횟수에는 비례하지 않는다.**
> 배경·이관 대응표: [docs/decisions/0001-docs-restructure.md](../../docs/decisions/0001-docs-restructure.md)

---

## 1. 문서 두 종류

| 종류 | 위치 | 수명 |
|---|---|---|
| 누적 문서 | `docs/` | 영속. 기능마다 고정 파일. 작업 시 갱신·덧붙임만 |
| 작업 문서 | `.claude/.progress/<branch-name>/` | 브랜치 1개당 존재. 머지 전 삭제. 원본은 git 이력·PR 본문에 남음. **agent 파이프라인 산출(analysis·be/fe-history·decisions.log·screen-spec 초안·integrate-report)도 전부 여기** |

---

## 2. docs/ 확정 구조

```
docs/
├── README.md                 포트폴리오 첫 화면 — 프로젝트 소개, 핵심 도식, 기능 목록
├── roadmap.md                로드맵 (기존 _roadmap 통합 결과)
├── overview/
│   ├── architecture.md       시스템 구성도 (mermaid)
│   ├── domain.md              도메인 모델, ERD
│   └── ai-workflow.md         AI 기반 개발 프로세스 외부용 설명
├── features/<feature>/
│   ├── spec.md                기획. 현재 버전만 유지. 버전의 단일 원천
│   ├── design.md               설계·도식. 현재 상태만 유지
│   └── history.md              변경 이력. 위에 추가만
└── decisions/NNNN-slug.md     여러 기능에 걸친 결정만 (ADR)
CHANGELOG.md                    루트. 릴리스 단위 요약. 각 항목이 features/*/history.md 로 링크
```

---

## 3. 새 파일이 생기는 경우는 딱 둘

1. 새 기능 추가 → `docs/features/<feature>/` 에 `spec.md` `design.md` `history.md` 3개
2. 여러 기능에 걸친 결정 → `docs/decisions/` 에 ADR 1개

버그 수정 / 리팩터링 / 성능 개선 / 기획 변경 / 리뷰 / 감사 / 실측 — **전부 기존 파일 갱신으로 끝난다. 새 파일 금지.**

⚠️ 예외 — `docs/code-review-v2/` 는 재편 진행 중에도 위 구조 규칙 적용 대상이 아니다. 수정 반영 이전 기록이고 다른 세션이 동시 작업 중이라 **손대지 않는다.** 상세: [docs/decisions/0001-docs-restructure.md](../../docs/decisions/0001-docs-restructure.md)

---

## 4. 기능 목록의 단일 원천

`web/src/domains/*` 폴더명 + BE `src/main/java/**/domain/**` 패키지명. 여기 없는 이름으로 `features/` 폴더를 만들지 않는다.

⚠️ `historyLegend`(FE) ↔ `historyMode`(BE) 는 같은 기능인데 이름이 다르다 — features 폴더명은 FE 이름 `historyLegend` 를 쓴다.

---

## 5. 버전 규칙

버전은 `spec.md` frontmatter 한 곳에만. 나머지는 "어느 spec 버전 기준인가"만 참조.

| 변경 종류 | 버전 | 갱신 대상 |
|---|---|---|
| 기획 변경 (동작·정책이 달라짐) | Major `2.0.0` | spec, design, history |
| 기능 추가·개선 (기획 범위 안) | Minor `1.3.0` | design(필요 시), history |
| 버그 수정, 리팩터링, 성능 개선 | Patch `1.2.1` | history |
| 오타, 문서 정리 | 버전 유지 | 해당 파일만 |

```yaml
# spec.md frontmatter
feature: lineup-edit
version: 2.0.0
status: active        # active | frozen | deprecated
updated: 2026-09-28

# design.md frontmatter
spec_version: 2.0.0   # spec 의 version 과 다르면 design 이 뒤처졌다는 신호
updated: 2026-09-28
```

---

## 6. 작업 흐름 6단계

1. `master` 에서 브랜치 분기 (`feat/` `fix/` `refactor/` `docs/` `ops/`)
2. 분석 — `.claude/.progress/<branch>/analysis.md` 를 `.claude/templates/analysis.md` 로 작성. 현재 동작 / 문제점 / 측정 기준값(before) / 수정 계획
3. 코드 수정 — 커밋 여러 개
4. 실측 — 같은 폴더 `verification.md` 를 `.claude/templates/verification.md` 로. 수정 후 측정값(after) + 계획 대비 결과
5. 이력 반영 — `docs/features/<기능>/history.md` 맨 위에 항목 1개 추가 (`.claude/templates/history-entry.md` 형식). analysis·verification 을 몇 줄로 요약. 기획 변경이 있었으면 spec.md / design.md 갱신 + 버전 올림
6. 정리 — `.claude/.progress/<branch>/` 삭제 커밋 → PR → 머지

⚠️ **squash merge 를 쓰면 6단계에서 삭제한 작업 문서가 master 이력에서 사라진다.** 과정 기록을 남기려면 merge commit 방식을 쓰거나 PR 본문에 analysis·verification 핵심을 붙인다. 이 프로젝트는 **PR 본문 첨부를 기본으로 한다.**

---

## 7. 템플릿 강제

`.claude/templates/` 의 5개(`spec.md` `design.md` `history-entry.md` `analysis.md` `verification.md`)로만 문서를 만든다. 템플릿에 없는 섹션을 즉흥으로 추가하지 않는다.

---

## 8. agent 파이프라인 산출물 ↔ 이 정책

| 파이프라인 산출 | 최종 위치 |
|---|---|
| planner `_common.md` + `{feature}.md` | `docs/features/<f>/spec.md` (템플릿 `spec.md`) |
| planner `_tasks.md` · `_decision_log.md` | `.claude/.progress/<branch>/{tasks.md, decisions.log}` — 확정된 결정은 spec 규칙 표 또는 ADR 로 |
| designer `screen-spec.md` | `docs/features/<f>/design.md` (템플릿 `design.md`). `design-report.md` 는 `.progress/` |
| developer-analyze `analysis.md` | `.claude/.progress/<branch>/analysis.md` (템플릿 `analysis.md` + 기능 분해 §) |
| `be-history.md` · `fe-history.md` | `.claude/.progress/<branch>/` |
| developer-integrate `integrate-report.md` | `.claude/.progress/<branch>/verification.md` — 마지막 § 가 `history-entry` 블록, 그것만 `docs/features/<f>/history.md` 로 |
| `integrate-summary.md` (multi) | PR 본문 |

`docs/domain/**` 경로는 폐지. 기존 파일은 0001 이관표에 따라 옮긴다.

## 9. 겹치는 룰은 참조만

아래는 이 문서가 다루지 않는다. 해당 파일을 그대로 따른다.

- 진행 로그 포맷 / sub-agent 통합: `.claude/conventions/agent-progress.md`
- 동일 파일 충돌 회피: `.claude/conventions/file-locks.md`
- 파일 분할 기준: `.claude/rules/common/file-split.md`
- HITL 마커: `.claude/rules/common/hitl-markers.md`
- 커밋 `버전 영향:` 표기: `.claude/rules/common/commit-version.md`

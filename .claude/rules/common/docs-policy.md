# 문서 정책

> 원칙 한 줄: **문서 수는 기능 수에 비례한다. 작업 횟수에는 비례하지 않는다.**
> 배경·이관 대응표: [docs/decisions/0001-docs-restructure.md](../../docs/decisions/0001-docs-restructure.md)

---

## 1. 문서 세 종류

| 종류 | 위치 | 수명 |
|---|---|---|
| 누적 문서 | `docs/` | 영속. 기능마다 고정 파일. 작업 시 갱신·덧붙임만 |
| 작업 문서 | `.claude/.progress/<branch-name>/` | 브랜치 1개당 존재. 머지 전 삭제. 원본은 git 이력·PR 본문에 남음. **agent 파이프라인 산출(analysis·be/fe-history·decisions.log·screen-spec 초안·integrate-report)도 전부 여기** |
| 사람 창작물 | `drafts/<branch>/` | gitignore. 브랜치 1개당 존재. 통합 단계(§ 6 ④)에서 삭제. Claude Design html · 기획 md · 엑셀 등, 코드·문서 작업의 투입 재료 |

---

## 2. docs/ 확정 구조

```
docs/
├── README.md                 포트폴리오 첫 화면 — 프로젝트 소개, 핵심 도식, 기능 목록
├── roadmap.md                로드맵 (기존 _roadmap 통합 결과)
├── overview/
│   ├── architecture.md       시스템 구성도 (mermaid)
│   ├── domain.md              도메인 모델, ERD
│   ├── ai-workflow.md         AI 기반 개발 프로세스 외부용 설명
│   └── traceability.md        요구사항 추적표 — REQ → 화면(SC) → API → 테이블 → 이력을 한 줄로
├── features/<feature>/
│   ├── spec.md                기획. 현재 버전만 유지. 버전의 단일 원천
│   ├── design.md               설계·도식. 현재 상태만 유지
│   └── history.md              변경 이력. 위에 추가만
├── decisions/NNNN-slug.md     여러 기능에 걸친 결정만 (ADR)
└── assets/                    루트 README·design.md 가 쓰는 이미지만 (readme/ 화면 캡처 · 도식). md 금지
CHANGELOG.md                    루트. 릴리스 단위 요약. 각 항목이 features/*/history.md 로 링크
```

⚠️ **생성 파일 (손으로 편집 금지)**: `overview/traceability*.md`(`python .claude/scripts/build-traceability.py`), `README.md` § 3 기능표(`python .claude/scripts/build-readme-table.py`). 검사는 `python .claude/scripts/docs-check.py`. 머지 뒤 master 에서 재실행 — `.claude/conventions/release-procedure.md`.

---

## 3. 새 파일이 생기는 경우는 딱 둘

1. 새 기능 추가 → `docs/features/<feature>/` 에 `spec.md` `design.md` `history.md` 3개
2. 여러 기능에 걸친 결정 → `docs/decisions/` 에 ADR 1개

버그 수정 / 리팩터링 / 성능 개선 / 기획 변경 / 리뷰 / 감사 / 실측 — **전부 기존 파일 갱신으로 끝난다. 새 파일 금지.**

예외 없음. 2026-09-28 까지 남아 있던 `docs/code-review-v2/`(수정 반영 이전 PRD) 도 `features/*/spec.md` 로 흡수 후 삭제됐다 — [docs/decisions/0001-docs-restructure.md](../../docs/decisions/0001-docs-restructure.md)

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
created: 2026-01-29   # FE 도메인 폴더 최초 커밋일
updated: 2026-09-28

# design.md frontmatter
spec_version: 2.0.0   # spec 의 version 과 다르면 design 이 뒤처졌다는 신호
created: 2026-01-29
updated: 2026-09-28
```

모든 `docs/**/*.md` 는 frontmatter 에 `created` · `updated` 를 갖는다. history.md 는 `created` = 첫 항목 날짜, `updated` = 최신 항목 날짜. ID 체계: 화면 `SC-NN-NN`(overview/domain.md), 요구사항 `REQ-{약어}-NN`(spec § 3), 대응표는 overview/traceability.md.

---

## 6. 작업 흐름 5단계

> 이 다섯 단계를 한 번에 돌리는 것이 `/feature <기능>` (`.claude/skills/feature/SKILL.md` → `.claude/workflows/feature.js`). 사람은 ① 투입과 마지막 자가 테스트만 한다. `/feature` 흐름 안의 문서 커밋은 사전 승인된 것으로 본다.

① 투입 — 사람 창작물(Claude Design html · 기획 md · 엑셀)을 `drafts/<branch>/` 에 둔다 (세션 = worktree = 브랜치 = 기능 하나, `claude --worktree {이름}`)
② 분석 — `developer-analyze` 가 `drafts/<branch>/**` + 현재 `spec.md`/`design.md` 를 읽고 `.claude/.progress/<branch>/analysis.md` 와, 바뀔 § 만 담은 `.claude/.progress/<branch>/spec-delta.md` 를 작성
③ 개발 — `frontend-developer` / `backend-developer` 가 기능 구현 후 각자 `docs/features/<f>/history.md` 맨 위에 항목 1개를 **직접** 추가 (`.claude/templates/history-entry.md`). 지금의 `fe-history.md`/`be-history.md` 는 그 재료
④ 통합 — `developer-integrate` 가 spec-delta 를 spec.md/design.md 에 반영 · spec `version` 을 history 최상단 버전과 맞춤 · `CHANGELOG.md` `[Unreleased]` 1줄 · Playwright 실측 · `drafts/<branch>/` 삭제
⑤ 커밋 — 훅 `guard-docs-sync.sh` 가 기능 코드 스테이징 시 같은 기능 `history.md` 동반 스테이징 + spec↔history 버전 일치를 검사한다. 예외는 `ALLOW_NODOCS=1` + 사유. PR → 머지

⚠️ **squash merge 를 쓰면 머지 전 삭제되는 작업 문서(`.claude/.progress/<branch>/`)가 master 이력에서 사라진다.** 과정 기록을 남기려면 merge commit 방식을 쓰거나 PR 본문에 analysis·verification 핵심을 붙인다. 이 프로젝트는 **PR 본문 첨부를 기본으로 한다.**

---

## 7. 템플릿 강제

`.claude/templates/` 의 5개(`spec.md` `design.md` `history-entry.md` `analysis.md` `verification.md`)로만 문서를 만든다. 템플릿에 없는 섹션을 즉흥으로 추가하지 않는다.

**문체 (모든 md 산출물)** — 일반인이 읽어도 이해되게 쓴다. 개발 용어는 처음 쓸 때 괄호로 푼다. `Phase`·`Step`·`스프린트` 같은 단계 워딩과 `RN-01` 식 코드형 식별자는 쓰지 않는다(예외: 규칙이 정한 `REQ-`·`SC-`·ADR 번호). 순서는 "지금 할 것 / 그다음 / 여유 있을 때" 처럼 자연어로.

---

## 8. agent 파이프라인 산출물 ↔ 이 정책

| 파이프라인 산출 | 최종 위치 |
|---|---|
| planner `_common.md` + `{feature}.md` | `docs/features/<f>/spec.md` (템플릿 `spec.md`) |
| planner `_tasks.md` · `_decision_log.md` | `.claude/.progress/<branch>/{tasks.md, decisions.log}` — 확정된 결정은 spec 규칙 표 또는 ADR 로 |
| designer `screen-spec.md` | `docs/features/<f>/design.md` (템플릿 `design.md`). `design-report.md` 는 `.progress/` |
| developer-analyze `analysis.md` · `spec-delta.md` | `.claude/.progress/<branch>/` (템플릿 `analysis.md` + 기능 분해 §. `spec-delta.md` 는 통합 단계에서 spec/design 에 반영 후 폐기) |
| `be-history.md` · `fe-history.md` | 재료 — frontend/backend-developer 가 직접 쓰는 `docs/features/<f>/history.md` 항목의 작업 로그. 최종 위치는 history.md 그 자체 |
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

---
name: feature
description: 기능 하나를 끝까지 자동으로 — drafts 창작물 → 분석 → FE∥BE 개발 → Playwright 실측·수정 루프 → 문서 갱신 → 커밋 → 자가 테스트 안내. 사용자가 "/feature <기능>" 또는 "만들어" 라고 시작 지시를 내린 뒤 호출한다.
---

# /feature <기능이름> [--max-fix N]

사용자가 하는 일은 셋뿐이다: ① `drafts/<branch>/` 에 창작물(Claude Design html · 기획 md · 엑셀)을 넣는다 ② `/feature <기능>` ③ 끝나면 자가 테스트. 그 사이는 이 스킬이 `.claude/workflows/feature.js` 를 돌려 처리한다. 메인 세션은 문서를 쓰지 않는다.

## 1. 출발 전 점검 (메인, 도구 5번 이내)

1. `git branch --show-current` — `master` 면 중단하고 브랜치를 만들라고 안내. 브랜치 이름이 곧 `<branch>`
2. worktree 인지: `git rev-parse --git-common-dir` 와 `--git-dir` 이 다르면 worktree. `.claude/worktree.env` 가 있으면 `ROOT`·`DRAFTS`·`FE_PORT`·`BE_PORT` 를 읽는다. 없으면(원본 디렉터리) `ROOT=.`, `DRAFTS=drafts/<branch>`, 포트 3000/8080 — 이때 다른 세션이 같은 디렉터리에 떠 있으면 중단(`git-scope.md` § 1)
3. `DRAFTS/` 가 없거나 비어 있으면: "창작물 없이 진행할까요(코드·기존 spec 만으로 분석)?" 한 줄 묻고 답을 기다린다. 있으면 파일 목록만 1줄로 보여준다
4. 기능 이름이 `web/src/domains/<기능>` 에 있으면 기존 기능, 없으면 신규 — 신규는 `docs-policy.md` § 4 이름 계약(FE 폴더명 = 정본)을 지키는지 확인만 한다
5. `.claude/.locks/` 에 같은 기능 lock 이 있으면 중단(다른 세션이 작업 중)

## 2. 열차 출발

```
Workflow scriptPath: "<저장소 절대경로>/.claude/workflows/feature.js"   ← name: "feature" 로 부르면 승인 창 검증에 걸린다(2026-09-28 확인). 경로로 부른다
args: { feature, branch, drafts: <DRAFTS 절대경로>, root: <ROOT>, fePort, bePort, date: "YYYY-MM-DD", maxFixRounds: 3 }   ← 모델은 스크립트가 sonnet 으로 고정(args.model 로만 바꾼다). 열차가 도는 동안 drafts/ 에 파일을 넣지 않는다 — 끝날 때 폴더째 지운다
```

브랜치 이름에 `/` 가 있으면 drafts 는 `drafts/feat/<이름>/` 처럼 한 단계 안쪽에 생긴다 — `DRAFTS` 절대경로는 그 실제 폴더로.

이 스킬이 호출됐다는 것이 사용자의 오케스트레이션 승인이다. 워크플로가 도는 동안 메인은 기다린다(중간 개입 없음). 정지선은 워크플로 안에 있다 — 🔴(DB DDL · 법무 · 권한 모델 · 외부 자산 · 운영 배포)가 나오면 분석 단계에서 `status: blocked` 로 돌아온다.

## 3. 돌아왔을 때

| status | 메인이 하는 일 |
|---|---|
| `blocked` | blockers 를 표로 보여주고 멈춘다. 사용자가 결정하면 그 결정을 `drafts/<branch>/decision.md` 에 적고, args 에 `decisions: [{ kind: <blocker.kind>, decision: "<한 줄>" }]` 를 넣어 같은 `scriptPath` 로 재실행 — 결정된 kind 는 정지선에서 빠지고 분석은 결정을 반영해 다시 짠다 |
| `needs-attention` | must 항목이 수정 루프 상한(3회)에도 남았다. 남은 항목 표 + verification.md 경로. 커밋은 한다(작업 보존) |
| `ready-for-self-test` | 아래 4 |

## 4. 커밋 · 자가 테스트 안내

1. `python .claude/scripts/docs-check.py` 0건 확인(워크플로가 이미 돌렸지만 메인이 한 번 더)
2. 커밋 — 이 스킬의 흐름 안에서는 문서 커밋이 **사전 승인**돼 있다. 4단계로 나눠 커밋한다(`git-scope.md` § 2):
   ① 코드를 범주별로 커밋 — `ALLOW_FOREIGN=1 git add <sql 경로들>` → 커밋, `ALLOW_FOREIGN=1 git add <be 경로들>` → 커밋, `ALLOW_FOREIGN=1 git add <web 경로들>` → 커밋 (sql → be → web 순, 각 본문에 `버전 영향:` 줄)
   ② `history.md` 최상단 항목의 `커밋: 미커밋` 을 ①에서 방금 만든 코드 커밋 해시로 바꾼다 (아직 커밋하지 않음)
   ③ md 는 세 갈래로 나눠 순서대로 각 1회 커밋 — `ALLOW_DOCS=1 ALLOW_FOREIGN=1 git add <바뀐 .claude/**/*.md>` → `[md-claude]` 커밋 → `ALLOW_DOCS=1 ALLOW_FOREIGN=1 git add docs/features/<기능> docs/overview docs/README.md` → `[docs]` 커밋(훅이 history 동반·버전 일치를 검사) → `ALLOW_DOCS=1 ALLOW_FOREIGN=1 git add CHANGELOG.md` → `[md-root]` 커밋 (`CHANGELOG.md` 는 저장소 루트라 md-docs 가 아니라 md-root). 순서를 어기면(앞 갈래에 미커밋 md 가 남으면) 훅이 차단한다
   ④ 사용자에게 200자 안팎으로: 무엇이 바뀌었나(history 항목 요약) · 확인할 화면 경로(screens) · 실행 명령(`cd web && npx vite --port <FE_PORT>` / `./gradlew bootRun --args="--server.port=<BE_PORT>"`) · should 항목 목록 · "자가 테스트 후 고칠 것을 말해 주세요"
3. PR 은 만들지 않는다 — 자가 테스트 뒤 사용자가 "PR" 이라고 하면 `release-procedure.md`. 머지가 확인되면(`gh pr view --json state`) 이 기능 브랜치를 로컬·원격에서 지운다 — 사용자 지시, `git-scope.md` § 4

## 5. 하지 않는 것

- 워크플로 중간에 메인이 코드나 문서를 손대기 · 수정 루프를 3회 넘겨 돌리기 · 🔴 를 가정값으로 통과시키기 · `master` 에서 실행 · 배포

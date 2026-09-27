# 커밋 범위 — 이 세션이 고친 것만, 문서는 지시받았을 때만

> 항상 로드. hook(`.claude/hooks/guard-git.sh`, `track-session-files.sh`)이 강제하고, 이 문서는 왜·어떻게를 적는다. 배경: 여러 세션이 한 작업 디렉터리를 쓰면 `git status` 에 남의 변경이 섞여 함께 커밋되는 사고가 반복됐다.

## 1. 병렬 세션은 worktree 가 기본

```
claude --worktree {이름}        # .claude/worktrees/{이름}/ 에 자기 브랜치·자기 파일. 다른 세션 변경이 아예 안 보인다
```

같은 디렉터리에서 세션을 여러 개 켜는 것은 예외 상황이다. 그 경우에만 § 2 의 세션 범위 검사가 의미를 갖는다. worktree 는 빈 상태로 시작하므로 `node_modules`·`.env` 는 세션 시작 시 다시 준비한다 (`WorktreeCreate` hook 으로 자동화 가능 — 미설정).

## 2. 커밋 절차 (매번)

1. `git status --porcelain` 을 본다. **변경 목록 ≠ 커밋 목록.**
2. 이 세션이 고친 파일 목록은 `.claude/.sessions/{session_id}.files` — Write/Edit 마다 hook 이 채운다. 목록 밖 파일은 다른 세션 것으로 간주한다.
3. `git add <파일> <파일> …` 로 **경로를 하나씩 지정.** `-A` · `.` · `--all` · `-u` · `commit -a` 는 hook 이 차단한다.
4. 목록 밖 파일을 꼭 넣어야 하면 사용자에게 "다른 세션 작업물로 보이는 X 도 포함할까요" 라고 묻고, 승인 시에만 `ALLOW_FOREIGN=1 git add X`.
5. 커밋 본문에 `버전 영향:` 줄 (`commit-version.md`).

## 3. 문서는 자동으로 커밋하지 않는다

| 대상 | 기본 | 커밋하는 때 |
|---|---|---|
| `docs/**` (전부) · 루트 `*.md` | **스테이징 금지** | 사용자가 "문서 커밋" · "docs 도 넣어" 처럼 **명시적으로** 말했을 때만 |
| `.claude/**` · `CHANGELOG.md` | 위 규칙에 걸린다(`.md`) | 동일 — 규칙·컨벤션 갱신도 지시받았을 때만 커밋 |
| 코드 · `sql/` · 설정 | 세션 범위 검사만 | 평소대로 |

허용 방법은 하나: 사용자 지시가 있었을 때 명령 앞에 `ALLOW_DOCS=1` 을 붙인다 — `ALLOW_DOCS=1 git add docs/features/coupons/history.md`. 지시 없이 이 접두를 붙이는 것은 규칙 위반이다. `.gitignore` 에 `docs/` 를 넣지 않는 이유: 문서도 결국 커밋돼야 하고, 무시가 아니라 **시점을 사용자가 정하는 것**이 목적이다.

문서 변경이 커밋에서 빠지면 그 사실을 보고에 한 줄 남긴다 — "docs/ 변경 3파일은 스테이징하지 않음 (지시 시 커밋)".

## 4. 예외 없이 막는 것

`git push --force` · `git reset --hard` · master 에서 commit/push/merge (`guard-master.sh`). hook 이 차단하면 우회하지 말고 사용자에게 이유를 보고한다.

## 5. 세션 목록 정리

`.claude/.sessions/*.files` 는 세션이 끝나도 남는다. 세션 시작 시 stale lock 검사와 함께 7일 지난 목록을 지운다. 이 폴더는 `.gitignore`.

# 커밋 범위 — 이 세션이 고친 것만, 문서는 지시받았을 때만

> 항상 로드. hook(`.claude/hooks/guard-git.sh`, `track-session-files.sh`)이 강제하고, 이 문서는 왜·어떻게를 적는다. 배경: 여러 세션이 한 작업 디렉터리를 쓰면 `git status` 에 남의 변경이 섞여 함께 커밋되는 사고가 반복됐다.

## 1. 세션 = worktree = 브랜치 = 기능 하나 — 필수

```
claude --worktree {이름}        # .claude/worktrees/{이름}/ 에 자기 브랜치·자기 파일. 다른 세션 변경이 아예 안 보인다
```

**같은 디렉터리에서 세션을 여러 개 켜는 것은 금지.** 오늘 공유 인덱스에 남의 스테이징이 섞이고 남의 미커밋 수정을 덮은 사고가 반복됐다. 예외적으로 같은 디렉터리에서 세션을 두 개 이상 켜야 한다면 § 2 의 세션 범위 검사가 필수다. worktree 는 빈 상태로 시작하므로 `node_modules`·`.env` 복사·포트 배정은 `WorktreeCreate` hook(`.claude/hooks/worktree-create.sh`)이 자동으로 준비한다.

## 2. 커밋 절차 (매번) — 범주 분리, md 는 3갈래 순서대로 마지막에

0. **모든 git 명령 전에 `git branch --show-current`.** 병렬 agent 가 brief 의 금지에도 브랜치를 바꾼 사고가 있었고, `git status` 는 clean 이라 티가 안 난다. sub-agent brief 에는 `checkout`·`switch` 금지를 명시한다.
1. `git status --porcelain` 을 본다. **변경 목록 ≠ 커밋 목록.**
2. 이 세션이 고친 파일 목록은 `.claude/.sessions/{session_id}.files` — Write/Edit 마다 hook 이 채운다. 목록 밖 파일은 다른 세션 것으로 간주한다.
3. **한 커밋에는 아래 범주 하나만.** `git add <파일> <파일> …` 로 경로를 하나씩 지정 (`-A` · `.` · `--all` · `-u` · `commit -a` 는 hook 이 차단한다).

   | 범주 | 대상 | 순서 |
   |---|---|---|
   | sql | `sql/**` | 코드 먼저 |
   | be | `src/**` · `build.gradle` · `settings.gradle` · `gradle/**` (`.md` 제외) | sql 다음 |
   | web | `web/**` (`.md` 제외) | be 다음 |
   | md-claude | `.claude/**/*.md` | 코드 끝난 뒤, **브랜치에서 1회** — md 3갈래 중 가장 먼저 |
   | md-docs | `docs/**/*.md` | md-claude 다음, **브랜치에서 1회** — § 3 |
   | md-root | 그 밖의 `*.md` (`CLAUDE.md` · `CHANGELOG.md` · `README.md` · `SETTING.md` · `DESIGN.md` · `PRODUCT.md` 등) | md-docs 다음, **브랜치에서 1회, md 중 가장 마지막** |
   | ops | `.claude/` 스크립트·훅 · `.github/` · `.gitattributes` 등 | sql/be/web 어느 쪽과도 같이 커밋 가능 (md 는 안 됨) |

   코드 커밋(sql/be/web) 본문에는 `버전 영향:` 줄 (`commit-version.md`). md 세 갈래는 각각 딱 1회, 순서는 md-claude → md-docs → md-root — 뒤 갈래를 커밋할 때 앞 갈래에 미커밋 md 가 남아 있으면 순서 위반이다.
4. 목록 밖 파일을 꼭 넣어야 하면 사용자에게 "다른 세션 작업물로 보이는 X 도 포함할까요" 라고 묻고, 승인 시에만 `ALLOW_FOREIGN=1 git add X`.
5. **md 커밋 뒤에 코드나 문서 수정이 더 생기면** — 이미 커밋한 md 갈래를 tip 부터 역순(`md-root` → `md-docs` → `md-claude`, 필요한 만큼만)으로 떼어낸다(`git reset --soft HEAD~N`, 이미 푸시됐으면 자기 기능 브랜치에 한해 `--force-with-lease` — 범위는 § 4) → 코드 수정을 범주별로 커밋 → md 세 갈래를 원래 순서(md-claude → md-docs → md-root)로 다시 1회씩 커밋. 결과적으로 브랜치의 각 md 갈래 커밋은 항상 1개, 항상 tip 쪽에 이 순서로 모인다.
6. 훅 `guard-docs-sync.sh` 가 강제한다: 범주 혼합 커밋 차단 · md 순서 위반 차단 · md-docs 커밋이면 브랜치가 건드린 기능마다 `docs/features/<f>/history.md` 동반 스테이징 + spec↔history 버전 일치 검사 (`docs-policy.md` § 6). 예외는 `ALLOW_MIXED=1` + 커밋 본문 사유. 옛 `ALLOW_NODOCS=1` 은 폐기 — 훅이 더 이상 보지 않는다.

## 3. 문서는 브랜치에서 md 갈래마다 딱 1회만 커밋한다

| 대상 | 기본 | 커밋하는 때 |
|---|---|---|
| `.claude/**/*.md` (md-claude) · `docs/**/*.md` (md-docs) · 그 밖의 `*.md`(md-root, `CLAUDE.md`·`CHANGELOG.md`·`README.md` 등) | **스테이징 금지** | 사용자가 "문서 커밋" · "docs 도 넣어" 처럼 **명시적으로** 말했을 때만, § 2 ③의 코드 커밋이 끝난 뒤 갈래마다 **1회씩, md-claude → md-docs → md-root 순서로** |
| 코드 · `sql/` · 설정 | 세션 범위 검사만 | 평소대로, 범주별로 |
| 생성 문서 3종 (`overview/traceability*.md`, `README.md` § 3 기능표) | **직접 편집 금지** | 스크립트로만 갱신 (`docs-policy.md` § 2) |

허용 방법은 하나: 사용자 지시가 있었을 때 명령 앞에 `ALLOW_DOCS=1` 을 붙인다 — `ALLOW_DOCS=1 git add docs/features/coupons/history.md`. 지시 없이 이 접두를 붙이는 것은 규칙 위반이다. `.gitignore` 에 `docs/` 를 넣지 않는 이유: 문서도 결국 커밋돼야 하고, 무시가 아니라 **시점을 사용자가 정하는 것**이 목적이다.

문서 변경이 커밋에서 빠지면 그 사실을 보고에 한 줄 남긴다 — "docs/ 변경 3파일은 스테이징하지 않음 (지시 시 커밋)".

## 4. 예외 없이 막는 것 · force-with-lease 허용 범위

`git push --force` · `git reset --hard` · master 에서 commit/push/merge (`guard-master.sh`). hook 이 차단하면 우회하지 말고 사용자에게 이유를 보고한다.

**머지된 기능 브랜치는 지운다.** 사용자가 요청해 만든 `feat/` `fix/` `refactor/` `ops/` `docs/` 브랜치는 PR 이 `dev`(또는 `master`)에 머지되는 즉시 로컬(`git branch -d`)과 원격(`git push origin --delete`) 양쪽에서 삭제한다 — 사용자 지시(2026-09-29). 남겨 둘 이유가 있으면 사용자에게 묻는다. 삭제는 머지 확인(`gh pr view --json state`) 뒤에만.

§ 2 ⑤의 `--force-with-lease` 는 예외다 — 단, **자기 기능 브랜치(`feat/` `fix/` `refactor/` `ops/`)의 md 커밋(md-claude/md-docs/md-root)을 tip 에서 재작성할 때만.** `master` · `dev` 에는 절대 쓰지 않는다. tip 이 아닌 커밋을 되돌리거나, md 아닌 커밋을 다시 쓰는 데는 쓰지 않는다.

## 5. 세션 목록 정리

`.claude/.sessions/*.files` 는 세션이 끝나도 남는다. 세션 시작 시 stale lock 검사와 함께 7일 지난 목록을 지운다. 이 폴더는 `.gitignore`.

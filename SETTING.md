# SETTING.md — Claude Code 작업 환경 셋업

> 이 저장소를 새 PC·새 사람이 받아서 **Claude Code 로 작업을 시작할 수 있을 때까지**의 안내. 150줄 이하.

이 문서는 Claude Code(agent 자동화) 환경만 다룬다. BE/FE 로컬 실행(DB 적재·서버 기동)은 [`.claude/references/dev-setup.md`](.claude/references/dev-setup.md), 배포는 [`.claude/references/deploy-runbook.md`](.claude/references/deploy-runbook.md) 참고 — 여기서 중복하지 않는다.

---

## 1. 사전 준비물

| 항목 | 버전 / 비고 |
|---|---|
| Node.js | 20 (CI 와 동일. `web && npm ci`) |
| Java (JDK) | 21 (BE toolchain) |
| Git | Git Bash 포함 (훅이 bash 스크립트로 돈다) |
| Python 3 | 훅(`guard-*.sh`)이 내부적으로 호출. `python` 명령이 실제로 실행돼야 함 — Windows 스토어 `python3` 스텁은 안 됨 |
| Claude Code | https://claude.com/claude-code |
| IntelliJ (선택) | 쓴다면 § 6 설정 필수 |
| MariaDB 접속 정보 | ⚠️ **테스트 DB = 운영 DB 동일 인스턴스.** 로컬에서 DDL 돌리면 바로 운영 반영 — 받기만 하고 손대지 않는다 |

---

## 2. 설치 5단계

```bash
# 1) 클론
git clone <repo-url>
cd com2usbaseball

# 2) FE 의존성
cd web && npm ci && cd ..

# 3) .env* 준비 — 값은 여기 적지 않는다. 키 목록·발급처는 dev-setup.md § 4
#    루트에 .env.properties (BE), web/ 에 필요 시 .env (FE) 를 각자 채운다

# 4) Claude Code 열기
claude
```

5) MCP 연결 확인 — 저장소는 MCP 설정을 추적하지 않는다(각자 환경 의존):
   - Figma: claude.ai 커넥터, 도구는 `mcp__claude_ai_Figma__*` 로 노출
   - Playwright: `mcp__playwright__*`
   - GitHub MCP는 2026-09-28 현재 연결 실패 상태 — PR·이슈 작업은 `gh` CLI 사용

---

## 3. 작업 흐름 — "세션 = worktree = 브랜치 = 기능"

| 단계 | 하는 일 |
|---|---|
| 시작 | `claude --worktree <이름>` — 같은 디렉터리에서 세션 두 개를 띄우지 않는다 |
| 훅이 자동 준비 | `.env*` 원본 복사 · `web && npm ci` · FE/BE 포트 배정(이름 해시) · `drafts/<branch>/`, `.claude/.progress/` 경로 안내 |
| 창작물 투입 | 기획서·디자인 시안(md·html·엑셀)을 `drafts/<branch>/` 에 둔다 |
| 실행 | `/feature <기능이름>` — drafts 부터 분석 → FE∥BE 개발 → Playwright 실측·수정 루프 → 문서 갱신까지 자동 |
| 마무리 | 자가 테스트 → 문제 있으면 고칠 내용 말하기 → "PR" 이라고 하면 릴리스 절차 진행 |

자연어로 요청해도 된다 — 메인 세션이 요청을 트랙(develop/planner/designer/ops)으로 나눠 배경 agent 를 띄운다.

---

## 4. 훅이 막는 것

| 훅 | 막는 것 | 예외 |
|---|---|---|
| `guard-master.sh` | `master`/`main` 브랜치에서 commit·push·merge | 없음 — 브랜치 먼저 만들기 |
| `guard-git.sh` | `git add -A`/`.`/`-u`, `commit -a` 등 일괄 스테이징 · 이 세션이 안 고친 파일 add · `docs/**`·루트 `*.md` 커밋 | 타 세션 파일: `ALLOW_FOREIGN=1` · 문서: `ALLOW_DOCS=1` (사용자가 "문서도 커밋" 이라고 명시했을 때만) |
| `guard-ddl.sh` | `ssh fun`·`mysql`·`mariadb` 명령 중 ALTER/DROP/DELETE/UPDATE/INSERT/TRUNCATE/CREATE TABLE/MODIFY | 없음 — 조회(SELECT/SHOW/COUNT)만 통과 |
| `guard-docs-sync.sh` | 기능 코드(`web/src/domains/**`, BE `domain/**`)를 커밋하는데 그 기능 `history.md` 가 같은 커밋에 없거나, `spec.md` version 과 `history.md` 최상단 버전이 다를 때 | 핫픽스·chore: `ALLOW_NODOCS=1` (사유를 커밋 본문에) |

`--force`·`reset --hard`·`add -A` 류는 `.claude/settings.json` deny 목록에도 있어 이중으로 막힌다.

---

## 5. 검증 체크리스트

- [ ] `claude` 실행 후 도구 목록에 `mcp__claude_ai_Figma__*` · `mcp__playwright__*` 노출
- [ ] Claude Code 가 agent 를 부를 수 있는지 — 작업 요청 시 `backend-developer`/`frontend-developer`/`planner-lite`/`designer-render` 등이 dispatch 되는지 확인 (`.claude/agents/*.md`)
- [ ] Git Bash 에서 `python -c "print(1)"` 동작 (안 되면 `python3` 는 스토어 스텁 — 훅은 `.claude/hooks/_py.sh` 로 실행 가능한 인터프리터를 자동 탐색하지만, 하나도 없으면 훅 자체가 종료 코드 2 로 실패한다)
- [ ] 훅 동작 확인: `git add -A` 류 명령을 시도하면 "차단"이 출력된다
- [ ] `docs/features/`, `docs/decisions/` 폴더 존재 (`docs/README.md` 트리 기준)
- [ ] **IntelliJ 쓴다면** — Settings → Version Control → Confirmation → "When files are created" 를 **Do not add** 로. (`.idea/workspace.xml` 의 `ADD_EXTERNAL_FILES_SILENTLY=true` 면 IDE 가 새 파일을 조용히 git 인덱스에 올려 다른 세션 커밋에 섞인다. `.idea/` 는 gitignore 라 PC 마다 직접 설정)

---

## 6. 문제가 생겼을 때

| 증상 | 원인 / 해결 |
|---|---|
| 훅이 "실행 가능한 python 이 없습니다" 로 실패 | `python`/`python3`/`py` 중 실제로 도는 게 하나도 없음 — Windows 스토어 별칭 끄고 진짜 Python 설치 |
| 내가 안 친 명령을 훅이 막는다 | 훅은 명령 **문자열**을 검사한다 (`case "$cmd" in *"git add -A"*)`) — 스크립트·alias 로 우회한 `git add` 도 걸린다. 우회하지 말고 경로 지정으로 바꾼다 |
| `git add` 했는데 "이 세션이 고친 파일이 아닙니다" | IntelliJ 자동 add 또는 다른 세션 작업물 — `.claude/.sessions/{session_id}.files` 목록 밖. 정말 포함해야 하면 사용자 확인 후 `ALLOW_FOREIGN=1` |
| `--worktree` 로 만든 세션에 `web/node_modules` 없음 | 첫 `npm ci` 가 실패했을 가능성 — `worktree-create.sh` 로그 확인 후 `cd web && npm ci` 수동 실행 |
| FE/BE 포트 충돌 | `env.js`/`vite.config.js` 는 원본 저장소 기준 3000/8080 고정. worktree 는 이름 해시로 자동 배정된 포트(`.claude/worktree.env` 의 `FE_PORT`/`BE_PORT`)를 쓴다 |

---

## 7. 핵심 파일 위치

| 파일·폴더 | 역할 |
|---|---|
| `CLAUDE.md` | 워크플로우 허브 — 트랙 4개, 메인 세션 절대 룰 |
| `.claude/rules/common/*.md`, `.claude/rules/be/*.md`, `.claude/rules/fe/*.md` | 경로별 자동 로드 규칙 |
| `.claude/conventions/*.md` | 도구 라우팅·진행 로그·파일 락·릴리스 절차 |
| `.claude/agents/*.md` | agent 정의(페르소나·권한·모드) |
| `.claude/skills/feature/SKILL.md` | `/feature` — drafts 부터 커밋까지 자동 열차 |
| `.claude/workflows/feature.js` | `/feature` 가 실제로 돌리는 워크플로 스크립트 |
| `.claude/hooks/*.sh` | guard-master·guard-git·guard-ddl·guard-docs-sync·worktree-create·track-session-files |
| `.claude/scripts/*` | `domain-map.sh`(도메인 이름 대조), `docs-check.py`(문서 정합 검사) |
| `.claude/templates/*.md` | spec·design·history-entry·dispatch-brief 등 문서 템플릿 |
| `.claude/references/*.md` | dev-setup·deploy-runbook·db 등 상세 참고 자료 |
| `docs/` | 영속 문서 — `features/<f>/{spec,design,history}.md`, `decisions/` |
| `drafts/<branch>/` | 사람이 넣는 창작물 투입함(브랜치 1개당) |

문제가 안 풀리면 `.claude/agents/*.md` 를 직접 읽는다 — agent 정의 자체가 사용 설명서 역할.

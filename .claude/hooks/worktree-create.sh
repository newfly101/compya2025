#!/usr/bin/env bash
. "$(dirname "$0")/_py.sh"
# WorktreeCreate 훅 — `claude --worktree <이름>` 이 .claude/worktrees/<이름>/ 을 만든 직후 실행된다.
# 하는 일: ① .env* 복사 ② web/node_modules 설치(npm ci, 캐시 사용) ③ 포트 배정 ④ 공유 경로 안내
# ⚠️ junction/symlink 는 쓰지 않는다 — `git worktree remove --force` 가 링크를 따라 들어가 원본(node_modules·drafts·.progress)을
#    지운 사고가 있었다(2026-09-28). 공유가 필요한 것은 링크 대신 "원본 절대경로" 를 .claude/worktree.env 에 적어 준다.
# stdin: {"name","path","branch","cwd",...}  (cwd = 원본 저장소 루트)
in=$(cat)
j(){ printf '%s' "$in" | "$PY" -c "import sys,json; print(json.load(sys.stdin).get('$1',''))" 2>/dev/null; }
wt=$(j path); name=$(j name); branch=$(j branch); root=$(j cwd); [ -n "$root" ] || root="$CLAUDE_PROJECT_DIR"
[ -d "$wt" ] || { echo "worktree 경로 없음: $wt" >&2; exit 1; }

# ① BE 로컬 설정 (gitignore 라 worktree 에 없다) — 복사만, 링크 금지
for f in .env .env.local .env.prod .env.properties; do [ -f "$root/$f" ] && [ ! -f "$wt/$f" ] && cp "$root/$f" "$wt/$f"; done

# ② FE 의존성 — npm 캐시로 설치 (보통 1분 안팎). 원본을 링크하지 않는다
if [ -f "$wt/web/package-lock.json" ] && [ ! -d "$wt/web/node_modules" ]; then
  ( cd "$wt/web" && npm ci --prefer-offline --no-audit --no-fund >/dev/null 2>&1 ) && nm="설치됨" || nm="실패 — 수동으로 cd web && npm ci"
else nm="건너뜀"; fi

# ③ 포트 배정 — 이름 해시로 1..40 → FE 3001..3040, BE 8081..8120 (원본은 3000/8080)
n=$(( ( $(printf '%s' "$name" | cksum | cut -d' ' -f1) % 40 ) + 1 ))
fe=$((3000+n)); be=$((8080+n))

# ④ 공유 경로 — 사람 창작물 투입함·메인 진행 로그는 원본 저장소 한 곳에 둔다
mkdir -p "$root/drafts/$branch" "$root/.claude/.progress"
mkdir -p "$wt/.claude"
cat > "$wt/.claude/worktree.env" <<ENV
WORKTREE=$name
BRANCH=$branch
ROOT=$root
DRAFTS=$root/drafts/$branch
PROGRESS_LOG_DIR=$root/.claude/.progress
FE_PORT=$fe
BE_PORT=$be
ENV

cat <<MSG
worktree 준비 완료: $wt  (브랜치 $branch)
  창작물 투입함: $root/drafts/$branch/   ← 사람이 여기에 넣는다 (링크 아님, 절대경로로 읽는다)
  메인 진행 로그: $root/.claude/.progress/claude-YYYYMMDD.log
  web/node_modules: $nm
  dev 서버 포트: FE $fe · BE $be  → .claude/worktree.env
    FE: cd web && npx vite --port $fe
    BE: ./gradlew bootRun --args="--server.port=$be"
  ⚠️ FE 가 부르는 BE 주소는 web/src/config/env.js 에 8080 으로 고정 — BE 를 두 세션이 동시에 띄우려면 env.js 를 포트 인자로 바꾸는 작업이 먼저다
MSG
exit 0

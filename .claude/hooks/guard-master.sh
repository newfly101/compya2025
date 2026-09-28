#!/usr/bin/env bash
. "$(dirname "$0")/_py.sh"
# CLAUDE.md § 3-5: master 직접 커밋·푸시 금지. PreToolUse(Bash) — 명령이 git commit/push 이고 현재 브랜치가 master 면 차단.
cmd=$("$PY" -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
case "$cmd" in
  *"git commit"*|*"git push"*|*"git merge"*)
    br=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ "$br" = "master" ] || [ "$br" = "main" ]; then
      echo "차단: 현재 브랜치가 $br 입니다. feat/ fix/ refactor/ docs/ ops/ 브랜치를 만든 뒤 진행하세요 (CLAUDE.md § 3-5)." >&2
      exit 2
    fi ;;
esac
exit 0

#!/usr/bin/env bash
. "$(dirname "$0")/_py.sh"
# PreToolUse(Bash): git add / git commit 범위 제한.
#  1) 일괄 스테이징 금지 — git add -A / . / --all, git commit -a
#  2) 세션 범위 — .claude/.sessions/{session_id}.files 에 없는 파일은 add·commit 불가 (ALLOW_FOREIGN=1 로 예외)
#  3) 문서 게이트 — docs/** 와 루트 *.md 는 ALLOW_DOCS=1 이 명령에 있을 때만 (사용자가 "문서 커밋" 이라고 했을 때만 붙인다)
in=$(cat)
cmd=$(printf '%s' "$in" | "$PY" -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
sid=$(printf '%s' "$in" | "$PY" -c 'import sys,json; print(json.load(sys.stdin).get("session_id",""))' 2>/dev/null)
case "$cmd" in *"git add"*|*"git commit"*) ;; *) exit 0 ;; esac
block(){ echo "차단: $1" >&2; exit 2; }

case "$cmd" in
  *"git add -A"*|*"git add --all"*|*"git add . "*|*"git add ."|*"git add -u"*|*"git commit -a "*|*"git commit -a"|*"git commit --all"*|*"git commit -am"*)
    block "일괄 스테이징입니다. 다른 세션의 변경이 섞입니다. 이 세션이 고친 파일만 'git add <경로>' 로 지정하세요 (rules/common/git-scope.md)." ;;
esac

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
manifest="$root/.claude/.sessions/$sid.files"
allow_docs=0;   case "$cmd" in *ALLOW_DOCS=1*)    allow_docs=1 ;; esac
allow_foreign=0; case "$cmd" in *ALLOW_FOREIGN=1*) allow_foreign=1 ;; esac

is_doc(){ case "$1" in docs/*|*.md) return 0 ;; esac; return 1; }
in_session(){ [ -f "$manifest" ] || return 0; grep -qxF "$1" "$manifest"; }

check(){ # $1 = repo-relative path
  if [ $allow_docs -eq 0 ] && is_doc "$1"; then
    block "'$1' 은 문서입니다. 문서는 사용자가 명시적으로 커밋을 지시했을 때만 — 그때 명령 앞에 ALLOW_DOCS=1 을 붙이세요."
  fi
  if [ $allow_foreign -eq 0 ] && ! in_session "$1"; then
    block "'$1' 은 이 세션이 고친 파일이 아닙니다 (다른 세션 작업물 가능). 정말 포함하려면 사용자 확인 후 ALLOW_FOREIGN=1."
  fi
}

case "$cmd" in
  *"git add"*)
    rest=${cmd#*git add}
    for tok in $rest; do
      # 명령 구분자를 만나면 add 의 인자는 끝난 것 — 뒤에 오는 push 브랜치명(docs/…) 등을 파일로 오인하지 않는다
      case "$tok" in "&&"|";"|"||"|"|"|"|"*) break ;; -*) continue ;; esac
      tok=${tok%\"}; tok=${tok#\"}; tok=${tok%\'}; tok=${tok#\'}
      [ -n "$tok" ] && check "$tok"
    done ;;
esac
case "$cmd" in
  *"git commit"*)
    while IFS= read -r f; do [ -n "$f" ] && check "$f"; done < <(git diff --cached --name-only 2>/dev/null) ;;
esac
exit 0

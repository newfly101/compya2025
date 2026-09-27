#!/usr/bin/env bash
# PostToolUse(Write|Edit|MultiEdit): 이 세션이 고친 파일을 .claude/.sessions/{session_id}.files 에 기록.
# guard-git.sh 가 커밋 범위를 이 목록으로 제한한다.
in=$(cat)
sid=$(printf '%s' "$in" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null)
fp=$(printf '%s' "$in"  | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null)
[ -z "$sid" ] || [ -z "$fp" ] && exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
rel=$(python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]).replace("\\","/"))' "$fp" "$root" 2>/dev/null)
case "$rel" in ../*) exit 0 ;; esac
mkdir -p "$root/.claude/.sessions"
f="$root/.claude/.sessions/$sid.files"
grep -qxF "$rel" "$f" 2>/dev/null || printf '%s\n' "$rel" >> "$f"
exit 0

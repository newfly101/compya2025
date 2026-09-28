#!/usr/bin/env bash
. "$(dirname "$0")/_py.sh"
# PreToolUse(Bash) — git commit 때 "기능 코드가 바뀌면 그 기능 history.md 도 같은 커밋에" 를 강제한다.
#  1) 스테이징에 web/src/domains/<f>/** 또는 BE domain/**/<pkg>/** 가 있으면 docs/features/<f>/history.md 도 스테이징돼 있어야 한다
#  2) 그 기능의 spec.md `version:` == history.md 최상단 항목 `버전:` (유지/refactor 항목은 건너뜀)
#  예외: 명령 앞에 ALLOW_NODOCS=1 (핫픽스·chore. 사유를 커밋 본문에 적는다)
in=$(cat)
cmd=$(printf '%s' "$in" | "$PY" -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
case "$cmd" in *"git commit"*) ;; *) exit 0 ;; esac
case "$cmd" in *ALLOW_NODOCS=1*) exit 0 ;; esac
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
staged=$(git diff --cached --name-only 2>/dev/null); [ -n "$staged" ] || exit 0

# BE 패키지 → FE 기능 폴더 (단수→복수 + 예외). 모르는 패키지는 검사하지 않는다
fe_of(){ case "$1" in
  coupon) echo coupons;; event) echo events;; notice) echo notices;; quiz) echo quiz;; home) echo home;;
  admin) echo admin;; community) echo community;; mileage) echo mileage;; oauth|user) echo authentication;;
  historyLegend) echo historyLegend;; legendStat|legendCard) echo legendStats;; playerSkill) echo playerSkills;;
  playerCard|team) echo players;; *) echo "";; esac; }

feats=""
while IFS= read -r f; do
  case "$f" in
    web/src/domains/*) d=${f#web/src/domains/}; d=${d%%/*}; feats="$feats $d" ;;
    src/main/java/*/domain/*) p=${f#*/domain/}; p=${p%%/*}; [ "$p" = fun ] && { p=${f#*/domain/fun/}; p=${p%%/*}; }; m=$(fe_of "$p"); [ -n "$m" ] && feats="$feats $m" ;;
  esac
done <<< "$staged"
feats=$(printf '%s\n' $feats | sort -u)
[ -n "$feats" ] || exit 0

fail=""
for f in $feats; do
  h="docs/features/$f/history.md"; s="docs/features/$f/spec.md"
  [ -f "$h" ] || continue   # features 문서가 없는 도메인은 검사 대상 아님
  printf '%s\n' "$staged" | grep -qx "$h" || fail="$fail\n  - $f: 코드는 바뀌었는데 $h 가 이 커밋에 없다 (템플릿 .claude/templates/history-entry.md 로 맨 위에 1항목)"
  # 스테이징된 내용 기준으로 읽는다 (작업 트리와 다를 수 있다)
  sv=$( { git show ":$s" 2>/dev/null || cat "$s"; } | grep -m1 '^version:' | awk '{print $2}')
  hv=$( { git show ":$h" 2>/dev/null || cat "$h"; } | grep -m1 '^- 버전:' | sed -E 's/^- 버전: *//')
  case "$hv" in ""|*유지*|*refactor*) ;; *)
    hv=${hv%% *}; [ "$sv" = "$hv" ] || fail="$fail\n  - $f: spec.md version($sv) ≠ history.md 최상단 버전($hv). spec 의 version 을 맞추거나 history 항목 버전을 고친다" ;;
  esac
done
[ -z "$fail" ] && exit 0
printf '차단: 코드와 문서가 같이 가지 않았습니다 (rules/common/docs-policy.md § 6).%b\n핫픽스·chore 라면 ALLOW_NODOCS=1 을 붙이고 사유를 본문에 적는다.\n' "$fail" >&2
exit 2

#!/usr/bin/env bash
. "$(dirname "$0")/_py.sh"
# PreToolUse(Bash) — git commit 의 "범주 분리" 를 강제한다 (사용자 결정 2026-09-29).
#  한 커밋에는 아래 중 하나만 들어간다. ops 는 코드 범주(web/be/sql)와 같이 들어갈 수 있다.
#    web       = web/**            (md 제외)
#    be        = src/** · build.gradle · settings.gradle · gradle/**   (md 제외)
#    sql       = sql/**
#    ops       = 그 외 코드·설정 (.claude/ 스크립트·훅, .github/, .gitattributes, .gitignore, infra/ …)
#    md-claude = .claude/**/*.md        ┐ 브랜치 마지막에 이 순서로 각 1회.
#    md-docs   = docs/**/*.md           │ 뒤 갈래를 커밋할 때 앞 갈래에 미커밋 md 가 남아 있으면 순서 위반
#    md-root   = 그 밖의 *.md (CLAUDE.md · CHANGELOG.md · README.md · SETTING.md …) ┘
#  md-docs 커밋일 때는 이 브랜치가 건드린 기능(web/src/domains/<f>, BE domain/<pkg>)마다
#  docs/features/<f>/history.md 가 이 커밋에 있어야 하고, spec version == history 최상단 버전이어야 한다.
#  예외: ALLOW_MIXED=1 (사유를 커밋 본문에). 옛 ALLOW_NODOCS=1 은 폐기(무시).
in=$(cat)
cmd=$(printf '%s' "$in" | "$PY" -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
case "$cmd" in *"git commit"*) ;; *) exit 0 ;; esac
case "$cmd" in *ALLOW_MIXED=1*) exit 0 ;; esac
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0
staged=$(git diff --cached --name-only 2>/dev/null); [ -n "$staged" ] || exit 0

cat_of(){ # 파일 → 범주
  case "$1" in
    .claude/*.md) echo md-claude ;;
    docs/*.md) echo md-docs ;;
    *.md) echo md-root ;;
    web/*) echo web ;;
    src/*|build.gradle|settings.gradle|gradle/*) echo be ;;
    sql/*) echo sql ;;
    *) echo ops ;;
  esac
}
cats=$(printf '%s\n' "$staged" | while IFS= read -r f; do cat_of "$f"; done | grep -v '^ops$' | sort -u)
n=$(printf '%s\n' "$cats" | grep -c . || true)
if [ "$n" -gt 1 ]; then
  echo "차단: 한 커밋에 여러 범주가 섞였습니다 — $(printf '%s' "$cats" | tr '\n' ' ')" >&2
  echo "  코드는 web / be / sql, 문서는 .claude md → docs md → 그 밖의 md 순으로 각각 따로 커밋합니다 (rules/common/git-scope.md § 2)." >&2
  echo "  정말 섞어야 하면 ALLOW_MIXED=1 + 사유." >&2
  exit 2
fi
case "$cats" in md-claude|md-docs|md-root) ;; *) exit 0 ;; esac

# ---- md 순서: 뒤 갈래를 커밋하는데 앞 갈래에 미커밋 md 가 남아 있으면 안 된다 ----
pending(){ # $1 = 경로 glob 접두 → 스테이징 안 된 변경 + 미추적 md 목록
  { git diff --name-only -- "$1" 2>/dev/null; git ls-files --others --exclude-standard -- "$1" 2>/dev/null; } | grep '\.md$' | sort -u
}
order_fail=""
if [ "$cats" = md-docs ] || [ "$cats" = md-root ]; then
  p=$(pending '.claude'); [ -n "$p" ] && order_fail="$order_fail\n  .claude md 가 아직 안 올라감: $(printf '%s' "$p" | tr '\n' ' ')"
fi
if [ "$cats" = md-root ]; then
  p=$(pending 'docs'); [ -n "$p" ] && order_fail="$order_fail\n  docs md 가 아직 안 올라감: $(printf '%s' "$p" | tr '\n' ' ')"
fi
if [ -n "$order_fail" ]; then
  printf '차단: md 커밋 순서 위반 — .claude md → docs md → 그 밖의 md 순서로 올립니다.%b\n' "$order_fail" >&2
  exit 2
fi
[ "$cats" = md-docs ] || exit 0

# ---- docs md 커밋: 이 브랜치가 건드린 기능마다 history 동반 + 버전 일치 ----
base=$(git merge-base HEAD origin/dev 2>/dev/null || git merge-base HEAD origin/master 2>/dev/null) || exit 0
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
done < <(git diff --name-only "$base"..HEAD 2>/dev/null)
feats=$(printf '%s\n' $feats | sort -u)
fail=""
for f in $feats; do
  h="docs/features/$f/history.md"; s="docs/features/$f/spec.md"
  [ -f "$h" ] || continue
  printf '%s\n' "$staged" | grep -qx "$h" || fail="$fail\n  - $f: 이 브랜치가 코드를 바꿨는데 $h 가 docs 커밋에 없다"
  sv=$( { git show ":$s" 2>/dev/null || cat "$s"; } | grep -m1 '^version:' | awk '{print $2}')
  hv=$( { git show ":$h" 2>/dev/null || cat "$h"; } | grep -m1 '^- 버전:' | sed -E 's/^- 버전: *//')
  case "$hv" in ""|*유지*|*refactor*) ;; *)
    hv=${hv%% *}; [ "$sv" = "$hv" ] || fail="$fail\n  - $f: spec.md version($sv) ≠ history.md 최상단 버전($hv)" ;;
  esac
done
[ -z "$fail" ] && exit 0
printf '차단: docs 커밋이 브랜치의 코드 변경을 다 담지 못했습니다.%b\n' "$fail" >&2
exit 2

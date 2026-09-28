#!/usr/bin/env bash
# FE 도메인 폴더 ↔ BE 패키지 ↔ API 경로 대조. 규칙 문서 대신 이 출력이 "현재 도메인 목록" 이다.
# 사용: bash .claude/scripts/domain-map.sh   (저장소 루트에서)
ALLOW_UNPAIRED="error guides odds policy oauth statistics analytics admin community"   # 짝 없어도 되는 것
sing(){ case "$1" in *ies) echo "${1%ies}y";; *ches|*shes|*sses|*xes) echo "${1%es}";; *s) echo "${1%s}";; *) echo "$1";; esac; }
kebab(){ printf '%s' "$1" | sed -E 's/([a-z0-9])([A-Z])/\1-\L\2/g'; }
fe=$(ls web/src/domains 2>/dev/null | grep -v '^_' | sort)
be=$( { ls src/main/java/com/dawne/com2usbaseball/domain 2>/dev/null; ls src/main/java/com/dawne/com2usbaseball/domain/fun 2>/dev/null; } | grep -v '^fun$' | sort -u)
api=$(grep -rhoE '@RequestMapping\("/api/[a-z0-9/-]+"' src/main/java 2>/dev/null | sed -E 's/.*"\/api\/([^"]+)"/\1/' | sort -u)
printf '%-18s %-18s %-24s %s\n' "FE(정본)" "BE 패키지" "API" "상태"
for f in $fe; do
  s=$(sing "$f"); k=$(kebab "$f")
  b=""; for cand in "$s" "$f"; do echo "$be" | grep -qx "$cand" && b=$cand && break; done
  a=""; for cand in "$k" "$(kebab "$s")" "admin/$k"; do echo "$api" | grep -qx "$cand" && a=$cand && break; done
  st="OK"; [ -z "$b" ] && st="❌ BE 없음"; [ -z "$a" ] && st="$st ❌ API 없음"
  echo " $ALLOW_UNPAIRED " | grep -q " $f " && st="(예외) $st"
  printf '%-18s %-18s %-24s %s\n' "$f" "${b:--}" "${a:--}" "$st"
done
echo "--- FE 에 없는 BE 패키지:"
for b in $be; do m=0; for f in $fe; do [ "$(sing "$f")" = "$b" ] || [ "$f" = "$b" ] && m=1; done; [ $m -eq 0 ] && { echo " $ALLOW_UNPAIRED " | grep -q " $b " && echo "  (예외) $b" || echo "  ❌ $b"; }; done

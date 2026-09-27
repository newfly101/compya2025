#!/usr/bin/env bash
# CLAUDE.md § 0: test DB = prod DB. ssh fun 또는 mysql 로 DDL/DML 을 실행하려는 명령은 차단 — 조회(SELECT/SHOW/COUNT)만 허용.
cmd=$(python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
case "$cmd" in
  *"ssh fun"*|*mysql*|*mariadb*)
    up=$(printf '%s' "$cmd" | tr '[:lower:]' '[:upper:]')
    case "$up" in
      *"ALTER "*|*"DROP "*|*"DELETE "*|*"UPDATE "*|*"INSERT "*|*"TRUNCATE "*|*"CREATE TABLE"*|*"MODIFY "*)
        echo "차단: 운영 DB 변경 명령입니다 (test = prod). DDL/DML 은 사용자 승인 + ops 트랙에서만 (be-convention § 7)." >&2
        exit 2 ;;
    esac ;;
esac
exit 0

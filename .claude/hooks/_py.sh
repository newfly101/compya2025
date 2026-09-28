# 훅 공용 — 실제로 실행되는 파이썬을 고른다. Windows 의 python3 는 스토어 스텁이라 실행이 안 되는 경우가 있다.
PY=""; for c in python python3 py; do "$c" -c 'print(1)' >/dev/null 2>&1 && { PY=$c; break; }; done
[ -n "$PY" ] || { echo "훅 오류: 실행 가능한 python 이 없습니다 (guard 훅이 동작하지 않습니다)" >&2; exit 2; }

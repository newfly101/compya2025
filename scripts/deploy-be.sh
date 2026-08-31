#!/usr/bin/env bash
# BE 배포 — 빌드 → 원격 백업 → jar 전송 → 서비스 재시작
#
#   ./scripts/deploy-be.sh          실제 배포
#   ./scripts/deploy-be.sh --dry    빌드만 하고 전송은 하지 않음
#
# 서버 구조 (실측)
#   호스트          ssh fun  (ec2-user@3.37.250.14)
#   배포 경로       /opt/compyafun/compyafun-web.jar
#   백업           /opt/compyafun/bak/compyafun-web-YYMMDD-HHMM.jar
#   서비스         compyafun-web.service
#   외부 설정      /opt/compyafun/config/application.properties  (건드리지 않는다)

set -euo pipefail

HOST="fun"
REMOTE_DIR="/opt/compyafun"
JAR_NAME="compyafun-web.jar"
SERVICE="compyafun-web"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCAL_JAR="$ROOT/build/libs/$JAR_NAME"
STAMP="$(date +%y%m%d-%H%M)"

DRY=0
[[ "${1:-}" == "--dry" ]] && DRY=1 && echo "▶ DRY RUN — 빌드만 한다"

echo "▶ 빌드"
(cd "$ROOT" && ./gradlew clean bootJar -q)
[[ -f "$LOCAL_JAR" ]] || { echo "✖ jar 이 없다: $LOCAL_JAR"; exit 1; }
echo "  $(ls -lh "$LOCAL_JAR" | awk '{print $5}')  $LOCAL_JAR"

if [[ $DRY -eq 1 ]]; then
  echo "▶ dry run 종료"
  exit 0
fi

echo "▶ 접속 확인"
ssh -o ConnectTimeout=10 "$HOST" "true" || { echo "✖ ssh $HOST 접속 실패"; exit 1; }

echo "▶ 현재 jar 백업 → bak/compyafun-web-$STAMP.jar"
ssh "$HOST" "sudo cp $REMOTE_DIR/$JAR_NAME $REMOTE_DIR/bak/compyafun-web-$STAMP.jar"

echo "▶ 전송"
scp "$LOCAL_JAR" "$HOST:$REMOTE_DIR/$JAR_NAME"

echo "▶ 재시작"
ssh "$HOST" "sudo systemctl restart $SERVICE"

echo "▶ 기동 확인 (10초 대기)"
sleep 10
STATUS=$(ssh "$HOST" "systemctl is-active $SERVICE" || true)

if [[ "$STATUS" == "active" ]]; then
  echo "  ✔ $SERVICE active"
  ssh "$HOST" "systemctl status $SERVICE --no-pager -l | head -8"
else
  echo "  ✖ 기동 실패 (상태: $STATUS)"
  echo "  최근 로그 40줄:"
  ssh "$HOST" "sudo journalctl -u $SERVICE -n 40 --no-pager"
  cat <<EOF

▶ 롤백하려면
   ssh $HOST "sudo cp $REMOTE_DIR/bak/compyafun-web-$STAMP.jar $REMOTE_DIR/$JAR_NAME && sudo systemctl restart $SERVICE"
EOF
  exit 1
fi

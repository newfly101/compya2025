#!/usr/bin/env bash
# FE 배포 — 빌드 → S3 동기화 → CloudFront 무효화
#
#   ./scripts/deploy-fe.sh          실제 배포
#   ./scripts/deploy-fe.sh --dry    무엇이 올라가고 지워질지만 확인 (안전)
#
# ⚠️ web 정적 파일과 업로드 이미지가 같은 버킷을 쓴다.
#    --delete 가 업로드물을 지우지 않도록 exclude 두 개가 반드시 있어야 한다.

set -euo pipefail

BUCKET="compya-images"
DIST_ID="E3TX8OFJBC8IML"
REGION="ap-northeast-2"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT/web"

DRYRUN=""
if [[ "${1:-}" == "--dry" ]]; then
  DRYRUN="--dryrun"
  echo "▶ DRY RUN — 실제로 올리거나 지우지 않는다"
fi

command -v aws >/dev/null || { echo "✖ aws CLI 가 없다"; exit 1; }
aws sts get-caller-identity --region "$REGION" >/dev/null 2>&1 \
  || { echo "✖ AWS 자격증명이 없거나 만료됐다"; exit 1; }

echo "▶ 빌드 (+ prerender 스냅샷, build:fast 아님 — 반드시 full build)"
npm --prefix "$WEB_DIR" run build:prerender

[[ -f "$WEB_DIR/dist/index.html" ]] || { echo "✖ dist/index.html 이 없다. 빌드 실패"; exit 1; }

# ⚠️ AdSense 반려 사유 재발 방지 가드.
#   build:fast(vite build 만)로 잘못 배포되면 dist/ 에 루트 index.html 만 남고
#   라우트별 프리렌더 스냅샷 폴더가 생기지 않는다 — 그 상태로 나가면 크롤러가 다시
#   빈 SPA 화면을 보게 된다. S3 동기화 전에 스냅샷 폴더 존재를 검사해 사전 차단한다.
#   (이 목록은 web/scripts/prerender.mjs 의 STATIC_ROUTES 와 맞춰 유지한다.)
PRERENDER_ROUTES=(
  "coupons" "events" "notices" "probability" "players"
  "legend-stats" "history-mode/legend" "skills" "mileage"
  "guides" "guides/legend-material-priority" "guides/legend-stats-guide"
  "guides/mileage-sniping" "guides/history-legend-guide"
  "guides/player-skills-guide" "guides/player-encyclopedia"
  "privacy" "terms" "contact" "about"
)
MISSING_SNAPSHOTS=()
for route in "${PRERENDER_ROUTES[@]}"; do
  [[ -f "$WEB_DIR/dist/$route/index.html" ]] || MISSING_SNAPSHOTS+=("$route")
done
if [[ ${#MISSING_SNAPSHOTS[@]} -gt 0 ]]; then
  echo "✖ prerender 스냅샷 누락 — 배포 중단:"
  printf '    - dist/%s/index.html\n' "${MISSING_SNAPSHOTS[@]}"
  echo "  (build:fast 로 빌드됐거나 prerender.mjs 가 실패했을 가능성 — build:prerender 로 재빌드할 것)"
  exit 1
fi
echo "▶ prerender 스냅샷 ${#PRERENDER_ROUTES[@]}개 확인 완료"

echo "▶ S3 동기화 → s3://$BUCKET"
aws s3 sync "$WEB_DIR/dist" "s3://$BUCKET" \
  --delete \
  --exclude "uploads/*" \
  --exclude "portfolio/*" \
  --region "$REGION" \
  $DRYRUN

if [[ -n "$DRYRUN" ]]; then
  echo "▶ dry run 이므로 무효화는 건너뛴다"
  exit 0
fi

echo "▶ CloudFront 무효화"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)
echo "  무효화 ID: $INVALIDATION_ID (반영까지 보통 1~5분)"

# ⚠️ CloudFront 무효화 직후라 아직 구 캐시가 응답할 수 있다 — 여기서 나는 경고는
#   "지금 당장 재배포하라"는 신호가 아니라 "1~5분 뒤 다시 확인하라"는 신호다.
echo "▶ 배포 후 라이브 검증 (무효화 전파 지연 시 아래 경고는 몇 분 뒤 재확인)"

ADS_CONTENT_TYPE=$(curl -sI "https://compyafun.com/ads.txt" 2>/dev/null | tr -d '\r' | grep -i '^content-type:' | head -1 || true)
if [[ "$ADS_CONTENT_TYPE" == *text/plain* ]]; then
  echo "  ✓ ads.txt content-type: text/plain"
else
  echo "  ⚠ ads.txt content-type 이 text/plain 이 아니다: ${ADS_CONTENT_TYPE:-<응답 없음>}"
fi

# "최신 쿠폰" 은 HomeScreen 이 렌더하는 실제 텍스트 — index.html 원본(SPA 셸)에는 없고
# prerender 스냅샷에만 구워진다. 이게 안 보이면 루트가 빈 SPA 셸로 나간 것이다.
HOME_HTML=$(curl -s "https://compyafun.com/" 2>/dev/null || true)
if [[ "$HOME_HTML" == *"최신 쿠폰"* ]]; then
  echo "  ✓ 홈 HTML 에 prerender 실텍스트 확인 (\"최신 쿠폰\")"
else
  echo "  ⚠ 홈 HTML 에서 prerender 텍스트를 못 찾음 — 빈 SPA 셸로 나갔을 수 있다"
fi

cat <<'EOF'

▶ 배포 후 추가 확인 (수동)
   https://compyafun.com/privacy       직접 입력해서 열리는지 (SPA fallback)
   https://compyafun.com/sitemap.xml   URL 개수
   https://compyafun.com/ads.txt       pub-8723423525807131
EOF

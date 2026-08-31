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

echo "▶ 빌드 (+ prerender 스냅샷)"
npm --prefix "$WEB_DIR" run build:prerender

[[ -f "$WEB_DIR/dist/index.html" ]] || { echo "✖ dist/index.html 이 없다. 빌드 실패"; exit 1; }

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

cat <<'EOF'

▶ 배포 후 확인
   https://compyafun.com/privacy       직접 입력해서 열리는지 (SPA fallback)
   https://compyafun.com/sitemap.xml   URL 개수
   https://compyafun.com/ads.txt       pub-8723423525807131
EOF

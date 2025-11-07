#!/bin/bash

# === CONFIG ===
export AWS_PAGER=""

ROOT_DIR=$(pwd)

GAME_DIR="dist"
GAME_BUCKET="canario-game"
GAME_CLOUDFRONT_ID="E1VG5LVXHT46JN"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# === BUILD PROJECT ===
echo -e "${GREEN}📦 Building project...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed. Aborting.${NC}"
  exit 1
fi

# === DEPLOY ===
echo -e "${GREEN}🚀 Deploying...${NC}"
aws s3 sync "$GAME_DIR" "s3://$GAME_BUCKET" --delete
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ S3 upload failed.${NC}"
  exit 1
fi

aws cloudfront create-invalidation \
  --distribution-id "$GAME_CLOUDFRONT_ID" \
  --paths "/*" >/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ CloudFront invalidation failed.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Game deployed successfully!${NC}"

#!/usr/bin/env bash
# Build và deploy web lên Vercel production bằng Vercel CLI (pipeline CD dùng cho cả deploy lẫn rollback).
#   VERCEL_TOKEN=... VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... API_URL=https://... bash scripts/vercel-deploy.sh
# Chạy ở thư mục gốc repo (project Vercel đặt Root Directory là apps/web).
set -euo pipefail
: "${VERCEL_TOKEN:?Thiếu VERCEL_TOKEN}"
: "${API_URL:?Thiếu API_URL}"

vercel pull --yes --environment=production --token="$VERCEL_TOKEN"

# Biến NEXT_PUBLIC_* được ghi thẳng vào JS lúc build. Nếu trên Vercel biến này đặt là "Sensitive",
# vercel pull chỉ nhận về chữ "[SENSITIVE]" và web sẽ gọi API sai địa chỉ. Địa chỉ API không phải bí mật
# (trình duyệt nào cũng thấy), nên lấy từ biến API_URL của GitHub cho chắc.
ENV_FILE=.vercel/.env.production.local
touch "$ENV_FILE"
grep -v '^NEXT_PUBLIC_API_URL=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
mv "$ENV_FILE.tmp" "$ENV_FILE"
echo "NEXT_PUBLIC_API_URL=\"$API_URL\"" >> "$ENV_FILE"
export NEXT_PUBLIC_API_URL="$API_URL"

vercel build --prod --token="$VERCEL_TOKEN"

# Bản build phải trỏ đúng API trước khi đưa lên production
if grep -rqF '[SENSITIVE]' .vercel/output; then
  echo "::error::Bản build còn chữ [SENSITIVE] thay cho địa chỉ API"; exit 1
fi
grep -rqF "$API_URL" .vercel/output || { echo "::error::Bản build không chứa địa chỉ API $API_URL"; exit 1; }
echo "Bản build gọi API tại $API_URL"

vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"

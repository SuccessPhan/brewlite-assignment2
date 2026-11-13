#!/usr/bin/env bash
# Smoke test sau khi triển khai: kiểm tra nhanh production còn chạy đúng luồng chính.
#   bash scripts/smoke-test.sh https://brewlite-api.onrender.com https://brewlite.vercel.app
# Thoát mã khác 0 nếu bất kỳ bước nào lỗi (pipeline CD dừng và rollback).
set -euo pipefail
API_URL="${1:?Thiếu địa chỉ API}"
WEB_URL="${2:?Thiếu địa chỉ web}"
API_URL="${API_URL%/}"
WEB_URL="${WEB_URL%/}"
fail() { echo "::error::$1"; exit 1; }
# Đọc JSON từ stdin bằng Node (có sẵn trên máy dev và runner CI): json 'biểu thức với biến d'
json() { node -e "let s='';process.stdin.on('data',c=>s+=c).on('end',()=>{const d=JSON.parse(s);console.log($1)})"; }

# 1. API sống và kết nối được CSDL. Render gói miễn phí ngủ khi vắng khách, lần đầu có thể mất tới ~1 phút để thức.
echo "1. GET $API_URL/health"
for i in $(seq 1 24); do
  BODY=$(curl -fsS --max-time 20 "$API_URL/health" 2>/dev/null || true)
  if echo "$BODY" | grep -q '"db":"up"'; then echo "   OK: $BODY"; break; fi
  [[ $i -eq 24 ]] && fail "API /health không trả db up sau 4 phút: $BODY"
  echo "   chờ API thức dậy ($i)..."; sleep 10
done

# 2. Menu có dữ liệu (migration, seed đã chạy)
echo "2. GET $API_URL/products"
COUNT=$(curl -fsS --max-time 20 "$API_URL/products" | json 'd.length')
[[ "$COUNT" -gt 0 ]] || fail "GET /products trả danh sách rỗng"
echo "   OK: $COUNT món"

# 3. CORS: API cho phép đúng tên miền web gọi tới (sai FRONTEND_URL thì trình duyệt không tải được menu)
echo "3. CORS cho $WEB_URL"
ALLOW=$(curl -fsS --max-time 20 -o /dev/null -D - -H "Origin: $WEB_URL" "$API_URL/products" | tr -d '\r' | awk -F': ' 'tolower($1)=="access-control-allow-origin"{print $2}')
[[ "$ALLOW" == "$WEB_URL" ]] || fail "Access-Control-Allow-Origin là '$ALLOW', cần '$WEB_URL' (kiểm tra FRONTEND_URL trên Render)"
echo "   OK"

# 4. API bảo vệ route đặt đơn
echo "4. POST $API_URL/orders không đăng nhập phải trả 401"
CODE=$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$API_URL/orders")
[[ "$CODE" == "401" ]] || fail "POST /orders không token trả $CODE, cần 401"
echo "   OK"

# 5. Web chạy qua HTTPS, trang chủ và manifest PWA tải được
echo "5. GET $WEB_URL"
[[ "$WEB_URL" == https://* ]] || fail "Web production phải dùng HTTPS"
curl -fsS --max-time 30 "$WEB_URL/" | grep -q 'BrewLite' || fail "Trang chủ không có chữ BrewLite"
[[ "$(curl -fsS --max-time 30 "$WEB_URL/manifest.webmanifest" | json 'd.short_name')" == "BrewLite" ]] || fail "Không tải được manifest PWA"
curl -fsS --max-time 30 -o /dev/null "$WEB_URL/menu" || fail "Trang /menu lỗi"
echo "   OK"

echo "Smoke test đạt"

# ADR 007: Triển khai web lên Vercel, API và CSDL lên Render, image ở GHCR

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Đề yêu cầu production truy cập được qua HTTPS, CSDL không mở công khai, image có tag theo commit hoặc phiên bản, deploy bằng secret của CI, có health check và cách rollback. Nhóm sinh viên cần nền tảng miễn phí.

## Quyết định

- **Web:** Vercel (CDN, edge Singapore), project trỏ `apps/web`. Tắt deploy tự động theo Git (`apps/web/vercel.json`); chỉ pipeline CD deploy bằng Vercel CLI.
- **API:** Render Web Service chạy Docker image từ **GitHub Container Registry**, tag bằng commit SHA và `vX.Y.Z`. Health check `/health`. Container khởi động: migrate → rào CSDL → seed → API.
- **CSDL:** Render PostgreSQL 16 cùng region Singapore; chặn mọi IP từ Internet, API kết nối qua mạng nội bộ.
- Secret ở GitHub Secrets (token Render, Vercel), biến môi trường Render (CSDL, JWT, VNPay), Vercel (địa chỉ API); không nằm trong repository.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Railway cho cả ba thành phần | Chỉ có tín dụng dùng thử, hết thì phải trả phí |
| VPS + Docker Compose + Caddy | Tốn tiền, cần tên miền, nhóm phải tự vá bảo mật máy chủ |
| Render cho cả web | Vercel phục vụ Next.js tốt hơn (CDN, dựng trang) và miễn phí |

## Hệ quả

- (+) Miễn phí; HTTPS, CDN, mạng nội bộ cho CSDL có sẵn.
- (+) Rollback nhanh: deploy lại image cũ trên GHCR; Vercel và Render đều có nút rollback.
- (−) Render gói Free ngủ sau 15 phút không có truy cập, lần gọi đầu chậm khoảng 50 giây.
- (−) Render PostgreSQL gói Free hết hạn sau 30 ngày, phải tạo lại hoặc nâng gói.
- (−) Biến `NEXT_PUBLIC_API_URL` được ghi vào JS lúc build; pipeline lấy từ biến `API_URL` của GitHub và kiểm tra bản build để tránh trỏ sai địa chỉ.

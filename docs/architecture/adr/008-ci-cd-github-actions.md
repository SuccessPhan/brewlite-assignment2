# ADR 008: CI/CD bằng GitHub Actions, cổng chất lượng chặn merge

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Đề yêu cầu CI chạy khi mở pull request (Install → Lint → Unit Test → Build), không cho merge khi lỗi; CD đi đủ Push/Tag → Lint và Test → Build → Docker image → Push registry → Deploy → Smoke test, dừng và rollback khi lỗi.

## Quyết định

- **CI** (`.github/workflows/ci.yml`), chạy khi mở PR:
  - Backend: Install → Lint → Unit Test → Build → kiểm tra migration → Integration test trên PostgreSQL thật.
  - Frontend: Install → Lint → kiểm kiểu → Unit Test (component) → Build.
  - E2E Playwright chạy sau khi hai job trên đạt.
- `main` được bảo vệ: cần 1 người duyệt, 3 check bắt buộc (Backend, Frontend, E2E), nhánh phải cập nhật theo `main`.
- **CD** (`.github/workflows/cd.yml`), chạy khi merge `main`, khi tạo tag `vX.Y.Z`, hoặc chạy tay để rollback: gọi lại CI → build và push image → deploy Render → deploy Vercel → smoke test (`scripts/smoke-test.sh`). Lỗi sau khi deploy thì tự triển khai lại commit trước. Tag thì tạo GitHub Release từ `docs/releases/`.
- Chưa cấu hình nền tảng thì CD chỉ build và đẩy image, bỏ qua deploy.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Để Vercel, Render tự deploy theo Git | Không có cổng chất lượng chung, không có smoke test, rollback tự động |
| GitLab CI, Jenkins | Repository ở GitHub; thêm hệ thống phải quản lý |

## Hệ quả

- (+) Không có thay đổi nào lên production mà chưa qua lint, test, build, E2E; có lịch sử chạy để làm minh chứng.
- (+) Rollback tự động khi deploy hoặc smoke test lỗi.
- (−) Pipeline phụ thuộc mạng của runner: đã gặp lỗi tải Google Fonts khi build làm CD đỏ ngẫu nhiên (pipeline dừng an toàn, chạy lại thì qua).
- (−) Mỗi lần merge chạy lại toàn bộ CI (khoảng 5 phút) trước khi deploy.

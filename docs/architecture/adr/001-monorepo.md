# ADR 001: Một repository chứa cả frontend và backend

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Nhóm 3 người phát triển cả web (Next.js) và API (NestJS). Nhiều thay đổi chạm cả hai phía cùng lúc, ví dụ thêm trường cho đơn hàng: sửa DTO ở API và form ở web. Đề yêu cầu cấu trúc `apps/web`, `apps/api`, `docs`, `tests`, pipeline CI/CD và tài liệu truy vết được trên cùng kho mã.

## Quyết định

Dùng **một repository (monorepo)**: `apps/web`, `apps/api`, `docs/`, `tests/`, `.github/workflows/`. Mỗi app giữ `package.json` và `package-lock.json` riêng, không dùng công cụ workspace (Nx, Turborepo, npm workspaces).

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Hai repository riêng | Một thay đổi phải mở 2 PR, khó review cùng lúc; CI/CD và truy vết tách đôi |
| Monorepo có công cụ workspace | Thêm cấu hình và khái niệm mới cho nhóm; dự án chỉ có 2 app nên chưa cần |

## Hệ quả

- (+) Một PR thay đổi được cả web và API; lịch sử, tài liệu, ma trận truy vết ở một chỗ.
- (+) CI chạy song song job backend và frontend, mỗi job làm việc trong thư mục của app (`working-directory`).
- (−) Cài thư viện hai lần; phiên bản TypeScript, Node phải tự giữ đồng bộ giữa hai app.
- (−) Không dùng chung mã TypeScript giữa web và API (ví dụ kiểu dữ liệu, bảng quà đổi điểm có bản sao ở cả hai phía).

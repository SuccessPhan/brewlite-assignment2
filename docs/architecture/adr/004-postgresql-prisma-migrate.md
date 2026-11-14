# ADR 004: PostgreSQL, Prisma ORM và Prisma Migrate

- **Trạng thái:** Đã chấp nhận (thay `prisma db push` từ bản Assignment 1)
- **Ngày:** 14/11/2026

## Bối cảnh

Đề bắt buộc PostgreSQL và yêu cầu migration/seed tái tạo được CSDL, chạy migration an toàn khi triển khai. Nghiệp vụ cần transaction và chống ghi đè khi đồng thời (tồn kho, thanh toán). Bản Assignment 1 tạo bảng bằng `prisma db push`, không có lịch sử thay đổi lược đồ.

## Quyết định

- **PostgreSQL 16**, truy cập qua **Prisma ORM** (truy vấn có tham số, không ghép chuỗi SQL).
- **Prisma Migrate**: mỗi thay đổi lược đồ là một thư mục trong `apps/api/prisma/migrations/`; triển khai chạy `prisma migrate deploy` (chỉ áp migration mới, không xoá dữ liệu). Lệnh `db:migrate` tự baseline CSDL cũ tạo bằng `db push`.
- CI kiểm tra `schema.prisma` khớp thư mục migration.
- Hai tài khoản CSDL: **chủ** (`DIRECT_URL`) cho migration và rào CSDL; **app** (`DATABASE_URL`) chỉ có SELECT/INSERT/UPDATE/DELETE. Ràng buộc CHECK chặn số âm.
- Migration chỉ được **thêm** (bảng, cột có mặc định hoặc cho phép null) để bản code cũ vẫn chạy được khi rollback.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Giữ `prisma db push` | Không có lịch sử, có thể xoá cột khi lược đồ lệch; không đạt yêu cầu "migration an toàn" |
| TypeORM | Nhóm đã quen Prisma từ Assignment 1; Prisma sinh kiểu TypeScript chặt hơn |
| Viết SQL migration tay | Dễ lệch với mô hình dữ liệu trong mã |

## Hệ quả

- (+) Tái tạo CSDL bằng một lệnh; lịch sử lược đồ nằm trong Git.
- (+) CSDL tự bảo vệ: app bị tấn công cũng không DROP bảng được; số âm bị từ chối ở tầng CSDL.
- (−) Khoá dòng (`SELECT … FOR UPDATE`) và ràng buộc CHECK phải viết SQL thô ngoài Prisma.
- (−) Đổi tên hoặc xoá cột phải tách thành nhiều lần phát hành.

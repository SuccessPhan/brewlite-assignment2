# ADR 003: Backend NestJS chia module theo miền nghiệp vụ

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Đề bắt buộc backend NestJS. Hệ thống có nhiều miền: tài khoản, sản phẩm, đơn hàng, thanh toán, khuyến mãi, quầy, quản lý, kho. Ba thành viên cần làm song song mà ít đụng mã của nhau, và luật nghiệp vụ quan trọng (Task 10 của Assignment 1) phải có test chứng minh.

## Quyết định

- Mỗi miền một module NestJS: `auth`, `products`, `orders`, `payments`, `promotions`, `staff`, `manage`, `inventory`, `customers`, `feedback`, `notifications`, `favorites`; `prisma` là module toàn cục dùng chung.
- Mỗi module theo lớp **controller** (HTTP, validate DTO, guard) → **service** (nghiệp vụ, transaction) → **Prisma** (CSDL).
- Luật nghiệp vụ cốt lõi viết thành **hàm thuần** để unit test không cần CSDL: máy trạng thái đơn, bảng giá, luật mã giảm giá, ký và kiểm chữ ký VNPay, định lượng nguyên liệu.
- Bảo vệ dùng chung khai báo một lần: `ValidationPipe` (whitelist, từ chối trường lạ), `JwtAuthGuard`, `RolesGuard`, `@CustomerOnly()`, giới hạn request theo IP.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Chia theo lớp kỹ thuật (thư mục controllers/, services/) | Một thay đổi nghiệp vụ rải khắp nhiều thư mục; khó chia việc theo người |
| Microservices (mỗi miền một dịch vụ) | Quá phức tạp cho quy mô một quán; transaction xuyên dịch vụ khó làm đúng |

## Hệ quả

- (+) Ranh giới rõ, dễ phân công, dễ review.
- (+) Luật quan trọng có unit test nhanh (37 test), phần chạm CSDL có integration test trên PostgreSQL thật.
- (−) Nhiều file khung cho mỗi module.
- (−) Một vài module gọi hàm của module khác trực tiếp (orders dùng hàm kho của inventory) thay vì qua service được inject; chấp nhận vì đơn giản, cần để ý khi tách tiếp.

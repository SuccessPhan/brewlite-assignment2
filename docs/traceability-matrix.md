# Ma trận truy vết

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 14/11/2026 | Truy vết các yêu cầu mức Must và Should tới use case, sơ đồ, mã nguồn và test |

Mỗi yêu cầu trong [SRS](requirements/srs.md) được nối tới use case, sơ đồ thiết kế, mã nguồn / API và test chứng minh. Yêu cầu mức Could mô tả phần mở rộng, không đưa vào ma trận.

## 1. Bảng mã

### Use case

Theo [sơ đồ use-case tổng quát](requirements/use-case-tong-quat.svg); UC-01 có [đặc tả](requirements/uc-01-dat-mon-va-thanh-toan.md).

| Mã | Use case |
|---|---|
| UC-01 | Đặt món và thanh toán |
| UC-02 | Xem menu và tìm món |
| UC-03 | Xem chi tiết, chọn tuỳ chọn món |
| UC-04 | Quản lý giỏ hàng |
| UC-05 | Đăng ký tài khoản |
| UC-06 | Đăng nhập |
| UC-07 | Theo dõi đơn, xem lịch sử đơn |
| UC-08 | Cập nhật trạng thái pha chế |
| UC-09 | Quản lý cửa hàng |

### Sơ đồ

| Mã | Sơ đồ | Tệp |
|---|---|---|
| UseCase-TQ | Use-case tổng quát | `docs/requirements/use-case-tong-quat.*` |
| UseCase-01 | Use-case UC-01 Đặt món và thanh toán | `docs/diagrams/uc-01-dat-thanh-toan.*` |
| Activity-01 | Hoạt động: từ đặt món đến nhận món | `docs/diagrams/act-01-dat-mon-nhan-mon.*` |
| Sequence-01 | Tuần tự: đặt món và thanh toán qua VNPay | `docs/diagrams/sequence-checkout.*` |
| Class-01 | Lớp mức domain | `docs/diagrams/class-domain.*` |
| Deployment-01 | Triển khai production | `docs/architecture/deployment-diagram.*` |

### Test

| Mã | Loại | Tệp / nơi chạy |
|---|---|---|
| UT-01 | Unit | `apps/api/src/app.controller.spec.ts` (health check) |
| UT-02 | Unit | `apps/api/src/auth/roles.guard.spec.ts` (phân quyền) |
| UT-03 | Unit | `apps/api/src/inventory/usage.spec.ts` (định lượng nguyên liệu) |
| UT-04 | Unit | `apps/api/src/orders/order-state-machine.spec.ts` (máy trạng thái) |
| UT-05 | Unit | `apps/api/src/payments/vnpay/vnpay.util.spec.ts` (chữ ký VNPay) |
| UT-06 | Unit | `apps/api/src/promotions/voucher-rules.spec.ts` (mã giảm giá, quy đổi điểm) |
| CT-01 | Component | `apps/web/components/menu/MenuBrowser.test.tsx` (trang menu) |
| INT-01 | Integration | `apps/api/test/products-api.int-spec.ts` (API sản phẩm) |
| INT-02 | Integration | `apps/api/test/stock-concurrency.int-spec.ts` (tồn kho đồng thời, máy trạng thái trên đơn thật) |
| INT-03 | Integration | `apps/api/test/payments-vnpay.int-spec.ts` (thanh toán VNPay, idempotency, điểm) |
| INT-04 | Integration | `apps/api/test/order-flows.int-spec.ts` (báo giá, tự huỷ, quầy huỷ, tổng quan) |
| INT-05 | Integration | `apps/api/test/notifications.int-spec.ts` (thông báo theo trạng thái) |
| INT-06 | Integration | `apps/api/test/customers.int-spec.ts` (khoá tài khoản khách) |
| INT-07 | Integration | `apps/api/test/favorites.int-spec.ts` (món yêu thích) |
| INT-08 | Integration | `apps/api/test/db-security.int-spec.ts` (ràng buộc CSDL) |
| E2E-01 | End-to-end | `tests/e2e/specs/dat-va-thanh-toan.spec.ts` (menu → xác nhận đơn) |
| E2E-02 | End-to-end | `tests/e2e/specs/pwa.spec.ts` (PWA) |
| TC-01 … TC-12 | API thủ công | Thunder Client, thư mục 1–12 (`tests/thunder-client/`) |
| SMK-01 | Smoke test | `scripts/smoke-test.sh`, chạy trong CD sau mỗi lần deploy |
| MAN | Kiểm tra tay | Kịch bản demo trong README |

Unit, component, integration, E2E chạy tự động trong CI ở mỗi pull request.

## 2. Yêu cầu chức năng

| Mã | Mức | Use case | Thiết kế / Sơ đồ | Code / API | Test |
|---|---|---|---|---|---|
| FR-01 | Must | UC-02 | Activity-01, Class-01 | `GET /products` · `products/` · `components/menu/MenuBrowser.tsx` | INT-01, CT-01, TC-01 |
| FR-02 | Should | UC-02 | Activity-01 | `apps/web/lib/search.ts` · `MenuBrowser.tsx` | CT-01, E2E-01 |
| FR-03 | Must | UC-02 | Class-01 | `products.service.ts` (ẩn món, báo hết) · `orders.service.ts` (chặn đặt) | INT-01, INT-04, TC-09 |
| FR-04 | Must | UC-03 | Activity-01, Class-01 | `GET /products/:id` · `components/product/ProductCustomizer.tsx` | INT-01, TC-01 |
| FR-05 | Must | UC-03 | Activity-01, Class-01 | `orders/pricing.ts` · `ProductCustomizer.tsx` | E2E-01 |
| FR-06 | Must | UC-04 | Activity-01 | `apps/web/context/app-store.tsx` | E2E-01 |
| FR-07 | Must | UC-04 | Activity-01 | `app-store.tsx` · `components/checkout/Checkout.tsx` | MAN (kịch bản demo bước 3) |
| FR-08 | Should | UC-04 | — | `app-store.tsx` (Zustand persist) | E2E-01 (giỏ còn sau đăng ký), MAN |
| FR-09 | Must | UC-05 | Class-01 | `POST /auth/register` · `auth/` | E2E-01, TC-02, TC-06 |
| FR-10 | Must | UC-06 | Sequence-01 | `POST /auth/login` · `auth/jwt.strategy.ts` | TC-02, TC-06 |
| FR-11 | Must | UC-01, UC-06 | Activity-01, Sequence-01 | `JwtAuthGuard` · `orders.controller.ts`, `payments.controller.ts` | E2E-01, TC-06, SMK-01 |
| FR-12 | Must | UC-06, UC-08, UC-09 | UseCase-TQ, Class-01 | `auth/roles.guard.ts`, `auth/customer-only.decorator.ts` | UT-02, TC-06, TC-08 |
| FR-13 | Should | UC-01 | Activity-01, Sequence-01 | `POST /orders/quote` · `orders.service.ts` | INT-04 |
| FR-14 | Must | UC-01 | Activity-01, Sequence-01, Class-01 | `POST /orders` · `orders.service.ts` | INT-02, E2E-01, TC-03 |
| FR-15 | Must | UC-01 | Sequence-01 | `orders/dto/create-order.dto.ts` · `ValidationPipe` (`main.ts`) | TC-06 |
| FR-16 | Must | UC-01 | Sequence-01, Class-01 | `orders.service.ts` (optimistic locking) | INT-02, INT-08 |
| FR-17 | Must | UC-01 | Activity-01, Class-01 | `create-order.dto.ts` · `orders.service.ts` | E2E-01 (nhận tại quầy), MAN (giao tận nơi) |
| FR-18 | Must | UC-01 | Activity-01, UseCase-01 | `components/checkout/PaymentMethodList.tsx` | E2E-01 |
| FR-19 | Must | UC-01 | Sequence-01, Class-01 | `POST /payments` · `payments/vnpay/` | INT-03, TC-04 |
| FR-20 | Must | UC-01 | Activity-01, Sequence-01 | `GET /payments/vnpay/return`, `GET /payments/vnpay/ipn` · `payments.service.ts` | INT-03, UT-05, TC-04, TC-06 |
| FR-21 | Must | UC-01 | Activity-01, Sequence-01 | `payments.service.ts` · `components/payment/VnpayReturn.tsx` | INT-03 |
| FR-22 | Must | UC-01 | Sequence-01, Class-01 | Header `Idempotency-Key` · `Payment.idempotencyKey` UNIQUE | INT-03, TC-03, TC-06 |
| FR-23 | Should | UC-01 | Activity-01, UseCase-01 | `payments.service.ts` (`payWithPoints`) | INT-03, E2E-01, TC-03 |
| FR-24 | Should | UC-01, UC-07 | Sequence-01 | `POST /payments/:id/query` (`querydr`) | INT-03 |
| FR-25 | Should | UC-01 | Class-01 | `payments.service.ts` (`NEEDS_REFUND`) | INT-03 |
| FR-26 | Must | UC-01 | Activity-01, Sequence-01 | `Checkout.tsx` (màn xác nhận), `VnpayReturn.tsx` | E2E-01 |
| FR-27 | Must | UC-07 | Activity-01 | `GET /orders/:id` · `components/orders/OrderTracking.tsx` | E2E-01, TC-05, TC-12 |
| FR-28 | Must | UC-07 | Class-01 | `GET /orders/me` · `components/orders/OrdersList.tsx` | TC-03, TC-12 |
| FR-29 | Should | UC-07 | Class-01 | `GET /payments/me`, `GET /payments/:id` | INT-03, TC-03 |
| FR-30 | Must | UC-01, UC-08 | Activity-01, Class-01 | `orders/order-state-machine.ts` | UT-04, INT-02 |
| FR-31 | Must | UC-08 | Activity-01, UseCase-TQ | `GET /staff/orders`, `POST /staff/orders/:id/advance` · `components/staff/StaffQueue.tsx` | INT-05, TC-05 |
| FR-32 | Must | UC-01 | Activity-01, UseCase-01 | `POST /orders/:id/cancel` | INT-02 |
| FR-33 | Should | UC-01 | Activity-01 | `OrdersService.expireStale` (mỗi phút) | INT-04 |
| FR-34 | Should | UC-08 | — | `POST /staff/orders/:id/cancel` | INT-04, TC-11 |
| FR-35 | Should | UC-07 | Activity-01 | `notifications/` · `components/layout/NotificationBell.tsx` | INT-05 |
| FR-36 | Should | UC-01 | Activity-01, UseCase-01, Class-01 | `promotions/voucher-rules.ts` | UT-06, INT-04, TC-09 |
| FR-37 | Should | UC-01 | Class-01 | `promotions/voucher-rules.ts` (`pointsEarnedFor`) · `payments.service.ts` | UT-06, INT-03 |
| FR-39 | Should | UC-09 | UseCase-TQ | `GET /staff/overview` · `manage/overview.ts` | INT-04, TC-08 |
| FR-40 | Should | UC-09 | UseCase-TQ, Class-01 | `manage/` (`/staff/products`) | TC-09 |
| FR-41 | Should | UC-09 | UseCase-TQ, Class-01 | `manage/` (`/staff/vouchers`) | TC-09 |

## 3. Yêu cầu phi chức năng

| Mã | Mức | Thiết kế / Sơ đồ | Cách hiện thực | Kiểm chứng |
|---|---|---|---|---|
| NFR-01 | Must | — | Truy vấn qua Prisma có chỉ mục; dữ liệu mẫu nhỏ | Đo tay bằng `curl` (chưa có script tự động) |
| NFR-03 | Must | Sequence-01 | Optimistic locking, transaction | INT-02 |
| NFR-04 | Must | Class-01 | bcrypt, không trả `passwordHash` | MAN (xem phản hồi `/auth/me`, TC-02) |
| NFR-05 | Must | Sequence-01 | `jwt.strategy.ts`: khoá ≥ 32 ký tự ở production, thu hồi token khi đổi mật khẩu, khi khoá tài khoản | INT-06, TC-06, TC-12 |
| NFR-06 | Must | — | Truy vấn lọc theo người đăng nhập; sai vai trò trả 403 | INT-03, INT-05, UT-02, TC-12 |
| NFR-07 | Must | Sequence-01 | `ValidationPipe` whitelist; form có kiểm tra phía web | TC-06 |
| NFR-08 | Should | — | `@nestjs/throttler`, `TRUST_PROXY` | TC-06 (đăng nhập sai liên tục → 429) |
| NFR-09 | Must | Sequence-01 | HMAC-SHA512, kiểm số tiền (`payments/vnpay/`) | UT-05, INT-03 |
| NFR-10 | Must | Deployment-01 | `.env` ngoài Git; GitHub Secrets; HTTPS; `helmet` | SMK-01 (HTTPS) |
| NFR-11 | Must | Deployment-01 | Render PostgreSQL chặn mọi IP từ Internet | MAN (cấu hình *Inbound IP Rules*) |
| NFR-12 | Should | — | `db-harden.ts`: tài khoản app hạn chế quyền, ràng buộc CHECK | INT-08 |
| NFR-13 | Must | — | Giao diện mobile-first (TailwindCSS) | E2E-01, E2E-02 (chạy trên khung Pixel 7) |
| NFR-14 | Must | Deployment-01 | `app/manifest.ts`, `public/sw.js` | E2E-02, SMK-01 (manifest) |
| NFR-15 | Must | — | React Query, `apiRequest` đổi lỗi thành câu tiếng Việt | CT-01 |
| NFR-16 | Should | — | Next.js build cho trình duyệt hiện đại | MAN |
| NFR-17 | Must | Deployment-01 | `GET /health` (200/503); Render health check | UT-01, SMK-01 |
| NFR-18 | Must | Sequence-01 | Ghi nhận kết quả VNPay đúng một lần (khoá dòng đơn) | INT-03 |
| NFR-19 | Must | Deployment-01 | `docker-compose.yml`, `run-brewlite.bat` | MAN |
| NFR-20 | Must | Class-01 | `prisma/migrations/`, `db-migrate.ts`, `seed.ts` | CI (kiểm tra schema khớp migration, áp migration trên CSDL trống) |
| NFR-21 | Must | Deployment-01 | `.github/workflows/ci.yml`; bảo vệ nhánh `main` | Lịch sử GitHub Actions trên các PR |
| NFR-22 | Must | Deployment-01 | `.github/workflows/cd.yml`, `scripts/` | Lịch sử GitHub Actions (CD), SMK-01 |
| NFR-23 | Must | Deployment-01 | `@nestjs/config`, `.env.example` | MAN |
| NFR-24 | Must | — | Jest, Vitest, Playwright | Toàn bộ UT, CT, INT, E2E chạy trong CI |
| NFR-25 | Should | Deployment-01 | Logger NestJS, `PaymentLog` | INT-03 (nhật ký giao dịch) |

## 4. Yêu cầu chưa có test tự động

| Yêu cầu | Cách kiểm hiện tại |
|---|---|
| FR-07 (sửa, xoá dòng giỏ hàng) | Kịch bản demo bước 3 |
| FR-17 (giao tận nơi) | Chạy tay trên trang thanh toán |
| NFR-04 (không trả `passwordHash`) | Xem phản hồi API |
| NFR-01 (thời gian phản hồi) | Đo tay bằng `curl` |
| NFR-11, NFR-16, NFR-19, NFR-23 | Kiểm tra cấu hình, chạy tay |

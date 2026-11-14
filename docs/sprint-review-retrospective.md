# Sprint Review và Sprint Retrospective

Số liệu lấy từ lịch sử pull request và GitHub Actions của repository (đến 14/11/2026).

## 1. Ghi chú về thứ tự các task

Mã nguồn MVP được **chuyển từ Assignment 1 sang** (PR #2, 12/11), nên các tạo phẩm code của Task 4–5 có mặt trên repository trước một số tài liệu của Task 1–3. Nhóm không sửa lại lịch sử commit. Trong Assignment 2, nhóm bổ sung lần lượt: CI chặn merge, migration, E2E, PWA, CD và production (Task 4–5), sau đó hoàn thiện tài liệu yêu cầu, sơ đồ, kiến trúc (Task 1–3) và đối chiếu chúng với mã nguồn đang chạy. Các mục dưới ghi đúng thứ tự thực tế.

## 2. Sprint 1: Nền tảng, CI, MVP chạy được

**Sprint Goal (theo đề):** tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu.

| PR | Nội dung | Merge |
|---|---|---|
| #1 | Khung repository theo cấu trúc đề (`apps/web`, `apps/api`, `docs`, `tests`), quy ước nhánh, PR, Definition of Done | 01/11 |
| #2 | Chuyển mã MVP từ Assignment 1: menu, chi tiết món, giỏ hàng, đăng nhập JWT, đặt đơn, thanh toán, quầy, quản lý; unit test, integration test, Thunder Client | 12/11 |
| #3 | `GET /health` trả 503 khi mất CSDL; `TRUST_PROXY` để giới hạn request đúng IP khách | 13/11 |
| #4 | ESLint; CI chạy Install → Lint → Unit Test → Build; integration test HTTP cho `GET /products`, `GET /products/:id`; component test trang menu (đang tải, lỗi, rỗng) | 13/11 |

**Increment:** luồng xem menu chạy được bằng `docker compose up`; API sản phẩm và trang menu có test; mọi PR đều qua CI.

**Minh chứng CI:** PR #4 lần đầu **đỏ** ở bước *Install* (`npm ci` báo `package-lock.json` thiếu `webpack` vì tạo bằng npm 11, runner dùng npm 10); sửa file lock thì **xanh**. Từ 13/11 `main` bắt buộc 3 check Backend, Frontend, E2E và 1 người duyệt.

## 3. Sprint 2: Hoàn thiện MVP, CI/CD, production

**Sprint Goal (theo đề):** hoàn thành luồng end-to-end, tự động hoá đóng gói và triển khai một phiên bản production truy cập được.

| PR | Nội dung | Merge |
|---|---|---|
| #5 | Prisma Migrate: migration có phiên bản, tự baseline CSDL cũ, CI kiểm tra schema khớp migration | 13/11 |
| #6 | E2E Playwright: từ menu đến màn hình xác nhận, chưa đăng nhập bị chuyển sang đăng nhập | 13/11 |
| #7 | PWA: manifest, icon, service worker, trang báo mất mạng | 13/11 |
| #8 | Pipeline CD: build image (tag commit SHA), đẩy GHCR, deploy Render và Vercel, smoke test, rollback, release | 13/11 |
| #9 | Nâng các GitHub Action lên bản chạy Node 24 | 14/11 |
| #10 | Sơ đồ use-case tổng quát | 14/11 |
| #11 | Sửa CD: nâng Vercel CLI | 14/11 |
| #12 | Sơ đồ triển khai production, bảng truy vết node → mã nguồn | 14/11 |
| #13 | Release notes `v1.0.0`, địa chỉ production trong README | 14/11 |
| #14 | Sửa CD: web production gọi sai địa chỉ API | 14/11 |
| #15–#17 | Tài liệu Task 1 (bối cảnh, SRS, đặc tả UC-01), Task 3 (kiến trúc C4, 8 ADR); tự host font | đang review |

**Increment (đã demo):**

| | |
|---|---|
| Web (PWA) | https://brewlite-nhom10.vercel.app |
| API, health check | https://brewlite-api-gb4h.onrender.com/health |
| Phiên bản | [v1.0.0](https://github.com/SuccessPhan/brewlite-assignment2/releases/tag/v1.0.0), image `ghcr.io/successphan/brewlite-api:v1.0.0` |

Đã kiểm trên production: smoke test 5 bước đạt sau mỗi lần deploy (health, menu, CORS, chặn đặt đơn khi chưa đăng nhập, HTTPS và manifest PWA); đăng ký tài khoản trên web; tài khoản nội bộ không đăng nhập được bằng mật khẩu mẫu. Thanh toán VNPay sandbox và luồng quầy pha chế trên production được trình diễn trong video demo.

**Số liệu:**

| | |
|---|---|
| Test tự động | 37 unit backend, 7 component frontend, 42 integration, 3 E2E |
| Lượt CI trên pull request | 26 xanh, 3 đỏ, 1 bị huỷ |
| Lượt CD | 7 xanh, 3 đỏ (2 lỗi cấu hình Vercel khi deploy lần đầu, 1 lỗi tải font khi build); mọi lượt đỏ đều dừng trước khi đưa bản lỗi lên production |

## 4. Sprint Retrospective

### Làm tốt

- **Cổng chất lượng hoạt động thật:** mọi thay đổi vào `main` qua PR, có người duyệt, CI chạy lint, test, build, integration, E2E. Lỗi cấu hình pipeline đều bị chặn trước khi lên production.
- **Kiểm chứng trên môi trường thật:** smoke test sau deploy; dùng trình duyệt tự động trên production để tìm nguyên nhân lỗi thay vì đoán.
- **Nghiệp vụ khó có test chứng minh:** idempotency, đặt đồng thời không vượt kho, kết quả VNPay ghi đúng một lần.
- **Bảo mật triển khai:** CSDL production chặn mọi IP từ Internet, secret chỉ nằm trên GitHub Secrets, Render, Vercel; tài khoản quản lý trên production dùng mật khẩu riêng.

### Chưa tốt

| Sự việc | Nguyên nhân | Đã xử lý |
|---|---|---|
| Tài liệu Task 1–3 hoàn thành sau code | Mã MVP có sẵn từ Assignment 1, nhóm ưu tiên CI/CD | Bổ sung tài liệu, đối chiếu với mã nguồn; ghi rõ ở mục 1 |
| GitHub vẫn cho bấm merge khi CI còn đỏ (PR #4 hiện "Some non-required checks are failing") | Lúc đầu bảo vệ `main` chưa bật *Require status checks* | Bật bắt buộc 3 check từ 13/11 |
| `npm ci` lỗi trên CI | File lock tạo bằng npm 11, runner dùng npm 10 | Tạo lại file lock bằng npm 10 |
| Lần deploy đầu lên Vercel đỏ 2 lần | Node 26 mặc định trên Vercel; Vercel CLI ghim bản cũ | Đặt Node 22 trên Vercel; nâng Vercel CLI (PR #11) |
| Web production gọi sai địa chỉ API | Biến `NEXT_PUBLIC_API_URL` đặt loại *Secret* nên CLI chỉ nhận chữ `[SENSITIVE]`; smoke test không kiểm web gọi API | Lấy địa chỉ từ biến GitHub và kiểm bản build trước khi deploy (PR #14) |
| CD đỏ ngẫu nhiên khi build | `next/font/google` tải font từ Google lúc build | Tự host font bằng `@fontsource` (PR #17) |
| Giá trị bí mật lộ trong ảnh chụp màn hình trao đổi nội bộ | Chụp màn hình biến môi trường khi giá trị đang hiện | Đổi mật khẩu tài khoản nội bộ trước khi deploy; quy ước che giá trị trước khi chụp |

### Cải thiện cho lần sau

| Việc | Cách làm |
|---|---|
| Làm tài liệu song song với code | Mỗi tính năng có FR và cập nhật ma trận truy vết trong cùng PR |
| Bật bảo vệ nhánh đầy đủ ngay từ đầu | *Require status checks* bật cùng lúc với CI đầu tiên |
| Ghim phiên bản công cụ nhất quán | Node 22 cho CI, Docker, Vercel; tạo file lock bằng npm đi kèm Node 22 |
| Smoke test kiểm cả đường web gọi API | Thêm bước dùng trình duyệt tự động đăng nhập hoặc tải menu trên production |
| Không chụp giá trị bí mật | Bấm ẩn giá trị trước khi chụp màn hình cấu hình |
| Theo dõi hạn gói miễn phí | Render PostgreSQL Free hết hạn sau 30 ngày (khoảng 14/12/2026): tạo lại hoặc nâng gói trước hạn |

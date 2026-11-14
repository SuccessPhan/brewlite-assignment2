# Bối cảnh, stakeholder và phạm vi (Task 1.1)

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 14/11/2026 | Bản đầu, dựa trên đề Assignment 2 và mã nguồn MVP chuyển từ Assignment 1 |

Tài liệu liên quan: [SRS](srs.md) · [Đặc tả UC-01 Đặt món và thanh toán](uc-01-dat-mon-va-thanh-toan.md)

## 1. Vấn đề nghiệp vụ

BrewLite là một quán cà phê nhỏ (quầy An Dương Vương). Vào giờ cao điểm, khách phải xếp hàng hai lần: một lần để gọi món và trả tiền, một lần để chờ lấy đồ uống. Các vấn đề cụ thể:

1. **Mất thời gian ở quầy.** Thu ngân vừa ghi món vừa nhận tiền mặt, thối tiền; khách chọn size, đường, đá, topping bằng lời nên dễ ghi nhầm.
2. **Tiền mặt rủi ro.** Thiếu tiền lẻ, lệch két cuối ca, khó đối soát.
3. **Khách không biết đơn đang ở đâu.** Không có thông tin đơn đã được pha hay chưa, khách đứng chờ quanh quầy.
4. **Quầy pha chế nhận đơn rời rạc.** Đơn ghi tay, không có hàng đợi theo thứ tự, không biết món nào đã hết nguyên liệu.
5. **Quản lý thiếu số liệu.** Không biết doanh thu theo ngày, món bán chạy, nguyên liệu sắp hết; thay giá hay báo hết món phải dặn miệng nhân viên.

**Mục tiêu sản phẩm** (Product Vision từ Assignment 1): *BrewLite giúp khách hàng đặt và thanh toán đồ uống không dùng tiền mặt chỉ trong vài chạm, giảm thời gian xếp hàng và nhận đơn nhanh tại quầy.*

Luồng nghiệp vụ tối thiểu: **Xem menu → Chọn tuỳ chọn → Giỏ hàng → Đặt đơn → Thanh toán → Theo dõi đơn.**

## 2. Stakeholder

| # | Stakeholder | Vai trò với hệ thống | Mục tiêu | Kỳ vọng cụ thể | Mức ảnh hưởng |
|---|---|---|---|---|---|
| SH-01 | **Khách hàng** | Người dùng trực tiếp (actor *Khách*, *Khách vãng lai*) | Đặt món nhanh, đúng ý, không cần tiền mặt | Xem menu trên điện thoại, tuỳ chỉnh size/đường/đá/topping, thấy giá ngay; thanh toán VNPay hoặc điểm trong vài bước; biết đơn đang ở bước nào; thanh toán lỗi không mất giỏ hàng, không bị trừ tiền hai lần | Cao |
| SH-02 | **Nhân viên quầy / Barista** | Người dùng nội bộ (actor *Nhân viên quầy*) | Nhận đơn đã trả tiền theo thứ tự, pha đúng món | Hàng đợi chỉ gồm đơn đã thanh toán; mỗi đơn hiện đủ tuỳ chọn và ghi chú; chuyển bước bằng một nút; huỷ được đơn chưa pha khi có sự cố, hệ thống tự hoàn tiền/điểm | Cao |
| SH-03 | **Quản lý cửa hàng** (đồng thời là Product Owner) | Người dùng nội bộ (actor *Quản lý*); xác định và ưu tiên yêu cầu | Vận hành quán có số liệu, kiểm soát thực đơn, khuyến mãi, kho | Xem doanh thu, món bán chạy; ẩn món, báo hết, đổi giá có hiệu lực ngay; tạo mã giảm giá; theo dõi nguyên liệu, nhập kho; khoá tài khoản khách vi phạm; nghiệm thu Increment sau mỗi Sprint | Cao |
| SH-04 | **Giảng viên / khách hàng nghiệm thu** | Người đánh giá | Đánh giá quy trình và sản phẩm theo đề | Có đủ tạo phẩm từng task trên repository với lịch sử thay đổi rõ ràng; yêu cầu có mã, tiêu chí kiểm chứng được và truy vết tới thiết kế, code, test; có URL production chạy thật | Cao |
| SH-05 | **Nhóm phát triển** (Nhóm 10, 3 thành viên) | Phân tích, thiết kế, lập trình, kiểm thử, triển khai | Hoàn thành 5 task đúng hạn, đúng Definition of Done | Yêu cầu rõ, ít thay đổi giữa Sprint; công nghệ quen thuộc (Next.js, NestJS, PostgreSQL); CI phát hiện lỗi sớm; tài liệu đủ để người khác review | Trung bình |
| SH-06 | **Đơn vị thanh toán** (VNPay, môi trường sandbox) | Hệ thống bên ngoài (actor *VNPay*) | Xử lý giao dịch đúng chuẩn tích hợp | Tham số ký HMAC-SHA512 đúng `HashSecret`; số tiền gửi theo đơn vị ×100; xử lý IPN và trả `RspCode`; không lộ `HashSecret`; đối soát được qua API `querydr` | Trung bình |

## 3. Phạm vi

### 3.1 Trong phạm vi MVP (bắt buộc giao)

Ứng với luồng tối thiểu của đề và các yêu cầu mức **Must** trong [SRS](srs.md).

| Nhóm | Nội dung | Mã yêu cầu |
|---|---|---|
| Menu | Danh sách món có ảnh, tên, giá, danh mục; trạng thái đang tải, rỗng, lỗi; món hết hàng, món ẩn | FR-01, FR-03 |
| Chi tiết sản phẩm | Chọn size S/M/L, mức đường, mức đá, topping, ghi chú; giá tính lại ngay | FR-04, FR-05 |
| Giỏ hàng | Thêm, sửa, xoá, tổng tiền, badge | FR-06, FR-07 |
| Xác thực | Đăng ký, đăng nhập JWT, chặn đặt đơn khi chưa đăng nhập, phân quyền 3 vai trò | FR-09 – FR-12 |
| Đặt đơn | Tạo đơn PENDING, backend tự tính giá và kiểm tra dữ liệu, giữ tồn kho an toàn khi đặt đồng thời, nhận tại quầy hoặc giao tận nơi | FR-14 – FR-17 |
| Thanh toán | "Thẻ" là cổng VNPay sandbox (thẻ ATM test, không tiền thật); xác minh chữ ký và số tiền, idempotent, PAYMENT_FAILED và thanh toán lại, màn hình kết quả. "Ví" là điểm BrewLite (FR-23, mức Should) | FR-18 – FR-22, FR-26 |
| Lịch sử, theo dõi đơn | Theo dõi đơn tự cập nhật, lịch sử đơn | FR-27, FR-28 |
| Quản lý trạng thái đơn | Máy trạng thái; quầy chuyển PAID → PREPARING → READY → COMPLETED; khách huỷ đơn chưa thanh toán | FR-30 – FR-32 |
| Phi chức năng | Hiệu năng, bảo mật, mobile-first, PWA cài được, health check, Docker Compose, migration, CI/CD, production HTTPS, kiểm thử 3 mức | 20 NFR mức Must (SRS mục 6) |

### 3.2 Phạm vi mở rộng (Should, Could)

Phần lớn đã có trong mã nguồn chuyển từ Assignment 1; nếu Sprint thiếu thời gian, các mục này nhường chỗ cho yêu cầu Must.

| Nội dung | Mã yêu cầu | Ưu tiên |
|---|---|---|
| Tìm kiếm không dấu, giữ giỏ hàng khi tải lại | FR-02, FR-08 | Should |
| Báo giá từ máy chủ trước khi đặt | FR-13 | Should |
| Trả bằng điểm, đối soát VNPay, xử lý trả 2 lần, lịch sử giao dịch | FR-23 – FR-25, FR-29 | Should |
| Tự huỷ đơn bỏ dở, quầy huỷ đơn đã thanh toán, thông báo đổi trạng thái | FR-33 – FR-35 | Should |
| Mã giảm giá, tích điểm | FR-36, FR-37 | Should |
| Khu quản lý: tổng quan doanh thu, thực đơn và giá, mã giảm giá | FR-39 – FR-41 | Should |
| Đổi điểm lấy quà | FR-38 | Could |
| Khu quản lý: tài khoản khách, phản hồi, nội dung trang, kho nguyên liệu | FR-42 – FR-45 | Could |
| Món yêu thích, hồ sơ, đổi mật khẩu | FR-46, FR-47 | Could |

### 3.3 Ngoài phạm vi (không thực hiện)

Các mục có mã FR-48 – FR-51 được ghi trong SRS với mức **Won't**.

| Nội dung | Lý do |
|---|---|
| Thanh toán tiền mặt, thanh toán bằng tiền thật (VNPay production, ví MoMo, thẻ quốc tế) | Đề yêu cầu thanh toán không tiền mặt *mô phỏng*; chỉ dùng VNPay sandbox |
| Hoàn tiền tự động qua API hoàn tiền của VNPay | Giao dịch cần hoàn chỉ được đánh dấu `NEEDS_REFUND`, quản lý hoàn thủ công |
| Ứng dụng di động native (Android/iOS) | Đề chọn web mobile-first/PWA |
| Dùng đầy đủ khi mất mạng (đặt món offline) | Service worker chỉ lưu file tĩnh và trang báo mất mạng; giá, tồn kho, đơn luôn lấy mới từ máy chủ |
| Nhiều chi nhánh, chuỗi cửa hàng | Quán chỉ có một quầy |
| Theo dõi shipper, tích hợp đơn vị giao hàng | Giao tận nơi chỉ ghi địa chỉ và phí cố định |
| Gửi email/SMS (xác nhận đơn, quên mật khẩu) | Không có dịch vụ gửi thư trong phạm vi; thông báo chỉ hiện trong ứng dụng |
| Đăng nhập bằng Google/Facebook | Ngoài phạm vi môn học |
| Xoá tài khoản khách | Giữ lịch sử đơn và giao dịch; quản lý chỉ khoá |
| Báo cáo kế toán, xuất hoá đơn điện tử | Ngoài phạm vi môn học |

## 4. Giả định

| # | Giả định |
|---|---|
| A-01 | Khách có điện thoại thông minh hoặc máy tính có trình duyệt hiện đại (Chrome, Safari, Edge, Firefox bản 2 năm gần nhất) và kết nối Internet. |
| A-02 | Khách đã có tài khoản ngân hàng/thẻ nội địa; khi demo dùng thẻ test NCB do VNPay sandbox công bố. |
| A-03 | VNPay sandbox hoạt động trong thời gian demo và chấm; mã `TmnCode`, `HashSecret` sandbox được cấp cho nhóm. |
| A-04 | Quán có một tài khoản dùng chung cho mỗi vị trí (`staff@`, `manager@`); khi có người nghỉ thì đổi mật khẩu. |
| A-05 | Lượng truy cập nhỏ (dưới 50 người dùng đồng thời), dữ liệu cỡ vài chục món và vài nghìn đơn. |
| A-06 | Giá niêm yết đã gồm thuế; phí giao hàng cố định 15.000đ. |
| A-07 | Quy đổi điểm cố định: thanh toán 1.000đ được 1 điểm; 1 điểm trả được 100đ. |

## 5. Ràng buộc

| # | Loại | Ràng buộc |
|---|---|---|
| C-01 | Công nghệ | Bắt buộc Next.js (frontend), NestJS (backend), PostgreSQL (CSDL); được bổ sung công nghệ khác nhưng không thay ba thành phần này. |
| C-02 | Công nghệ | Frontend theo hướng mobile-first/PWA. |
| C-03 | Quy trình | 5 task làm tuần tự; task sau chỉ được nghiệm thu khi tạo phẩm task trước đã có trên repository với lịch sử thay đổi rõ ràng. |
| C-04 | Quy trình | `main` được bảo vệ: mọi thay đổi qua pull request, cần 1 người duyệt và CI xanh. Thay đổi yêu cầu, sơ đồ, kiến trúc ghi rõ lý do trong PR. |
| C-05 | Thanh toán | Chỉ dùng môi trường thử (VNPay sandbox), không xử lý tiền thật. VNPay không gọi được IPN về `localhost`. |
| C-06 | Triển khai | Production phải truy cập được qua HTTPS; CSDL production không mở công khai; secret không nằm trong repository hoặc log CI. |
| C-07 | Nguồn lực | Nhóm 3 người, 2 Sprint trong học kỳ I năm học 2026–2027; ưu tiên nền tảng triển khai có gói miễn phí. |

## 6. Rủi ro ban đầu

| # | Rủi ro | Khả năng | Ảnh hưởng | Cách giảm thiểu |
|---|---|---|---|---|
| R-01 | VNPay sandbox gián đoạn hoặc đổi API khi demo | Trung bình | Cao | Có phương thức trả bằng điểm làm phương án dự phòng; integration test giả lập kết quả VNPay bằng tham số ký đúng; nút đối soát `querydr` |
| R-02 | Khách trả tiền hai lần hoặc gửi lặp yêu cầu thanh toán | Trung bình | Cao | `Idempotency-Key` UNIQUE; ghi nhận kết quả đúng một lần (khoá dòng đơn); giao dịch thừa đánh dấu `NEEDS_REFUND` |
| R-03 | Bán vượt tồn kho khi nhiều khách đặt cùng lúc | Trung bình | Cao | Transaction + optimistic locking theo cột `version`; ràng buộc CHECK tồn kho không âm |
| R-04 | Giả mạo kết quả thanh toán (sửa `vnp_ResponseCode`) hoặc sửa giá ở trình duyệt | Trung bình | Cao | Kiểm chữ ký HMAC-SHA512 và số tiền; backend tự tính giá từ CSDL, từ chối trường lạ |
| R-05 | Lộ secret (`JWT_SECRET`, `VNP_HASH_SECRET`, mật khẩu CSDL) | Thấp | Cao | `.env` trong `.gitignore`; secret của CI/nền tảng triển khai; API không khởi động với khoá yếu ở production |
| R-06 | Nền tảng miễn phí ngủ đông, giới hạn tài nguyên, đổi chính sách | Trung bình | Trung bình | Health check, smoke test sau triển khai; tài liệu rollback; chọn nền tảng sớm ở Task 3 |
| R-07 | Yêu cầu phình to (khu quản lý, kho) làm chậm luồng chính | Cao | Trung bình | Ưu tiên MoSCoW; luồng Must hoàn thành và có test trước khi làm Should/Could |
| R-08 | Thành viên vắng hoặc trễ review làm tắc pull request | Trung bình | Trung bình | Review chéo cố định (mỗi người review một người); PR nhỏ |
| R-09 | Thiếu kinh nghiệm CI/CD, Docker registry | Trung bình | Trung bình | Dựng pipeline CI từ Sprint 1, thêm CD dần; thử deploy sớm |

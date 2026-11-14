# Đặc tả use-case UC-01: Đặt món và thanh toán (Task 1.3)

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 14/11/2026 | Bản đầu |

Tài liệu liên quan: [SRS](srs.md) · [Bối cảnh và phạm vi](context-and-scope.md)

## 1. Sơ đồ use-case cho phạm vi UC-01

![Sơ đồ use-case UC-01](uc-01-dat-mon-va-thanh-toan.svg)

Nguồn PlantUML: [uc-01-dat-mon-va-thanh-toan.puml](uc-01-dat-mon-va-thanh-toan.puml). UC-01 là use case trọng tâm trong [sơ đồ use-case tổng quát](use-case-tong-quat.svg).

## 2. Thông tin chung

| Mục | Nội dung |
|---|---|
| Mã, tên | UC-01 – Đặt món và thanh toán |
| Mục tiêu | Khách biến giỏ hàng thành một đơn đã thanh toán (PAID) mà không dùng tiền mặt, để quầy bắt đầu pha |
| Actor chính | Khách hàng (đã đăng nhập, vai trò CUSTOMER) |
| Actor phụ | VNPay (sandbox); Nhân viên quầy (nhận đơn sau khi UC kết thúc) |
| Stakeholder và quyền lợi | **Khách**: trả đúng số tiền, không bị trừ hai lần, lỗi không mất giỏ. **Quầy**: chỉ nhận đơn đã trả tiền. **Quản lý**: giá, mã giảm giá, tồn kho đúng với dữ liệu mới nhất. **VNPay**: tham số ký đúng chuẩn. |
| Trigger | Khách bấm **Thanh toán ngay** ở trang thanh toán (`/checkout`) |
| Mức ưu tiên | Must |
| Tần suất | Mỗi lần khách mua; cao điểm vài chục đơn mỗi giờ |

## 3. Tiền điều kiện

1. Khách đã đăng nhập bằng tài khoản CUSTOMER, tài khoản không bị khoá (nếu chưa đăng nhập: xem luồng A1).
2. Giỏ hàng có ít nhất 1 món, mỗi dòng có số lượng 1–20.
3. Backend và CSDL đang hoạt động (`GET /health` trả `"db":"up"`).
4. Với phương thức VNPay: máy chủ đã cấu hình `VNP_TMN_CODE`, `VNP_HASH_SECRET`.

## 4. Hậu điều kiện

**Thành công (đảm bảo thành công):**

1. Đơn ở trạng thái **PAID**, có đúng **một** giao dịch SUCCEEDED; tổng tiền tính theo giá, phí, mã giảm giá trong CSDL.
2. Tồn kho đã trừ đúng số lượng từng món.
3. Nếu trả bằng VNPay: khách được cộng `floor(số tiền / 1.000)` điểm; lượt dùng mã giảm giá tăng 1.
4. Nếu trả bằng điểm: điểm bị trừ `ceil(tổng / 100)`, không âm.
5. Giỏ hàng được xoá; khách thấy mã đơn và trạng thái; đơn xuất hiện trong hàng đợi của quầy; khách nhận thông báo.

**Tối thiểu (đảm bảo khi thất bại):**

1. Khách không bị trừ tiền hoặc điểm cho một đơn không PAID.
2. Giỏ hàng giữ nguyên để thử lại.
3. Đơn (nếu đã tạo) ở PENDING, PAYMENT_FAILED hoặc CANCELLED; nếu CANCELLED thì món đã trả về kho.
4. Mọi lần trao đổi với VNPay được ghi nhật ký giao dịch.

## 5. Luồng chính (thanh toán qua VNPay, thành công)

| Bước | Actor | Hệ thống |
|---|---|---|
| 1 | Khách mở trang thanh toán từ giỏ hàng. | |
| 2 | | Gửi giỏ hàng lên `POST /orders/quote`; hiển thị giá từng dòng, phí, giảm giá, tổng tiền theo CSDL. |
| 3 | Khách chọn hình thức nhận (tại quầy kèm giờ nhận, hoặc giao tận nơi kèm địa chỉ), chọn phương thức **VNPay**, (tuỳ chọn) nhập mã giảm giá (**điểm mở rộng: Áp mã giảm giá**). | |
| 4 | | Báo giá lại với mã và hình thức nhận mới; nút *Thanh toán ngay* hiện tổng tiền. |
| 5 | Khách bấm **Thanh toán ngay**. | |
| 6 | | Kiểm tra JWT và dữ liệu đơn; trong một transaction: tính lại giá từ CSDL, kiểm tra mã giảm giá, trừ tồn kho từng món (optimistic locking), tạo đơn **PENDING**; trả mã đơn. |
| 7 | | Sinh `Idempotency-Key` mới, gọi `POST /payments` (`method = VNPAY`). |
| 8 | | Tạo giao dịch **PROCESSING** với `vnp_TxnRef` mới; tạo link VNPay chứa số tiền × 100, hạn 15 phút, ký HMAC-SHA512; ghi nhật ký; trả `payUrl`. |
| 9 | | Chuyển trình duyệt sang trang VNPay sandbox. |
| 10 | Khách chọn ngân hàng, nhập thông tin thẻ và OTP trên trang VNPay. | |
| 11 | VNPay xử lý thanh toán, gọi IPN `GET /payments/vnpay/ipn` và chuyển khách về `/payment/vnpay-return`. | |
| 12 | | Kiểm chữ ký, kiểm số tiền; khoá dòng đơn hàng; giao dịch chưa có kết quả thì ghi **SUCCEEDED**, chuyển đơn **PENDING → PAID**, cộng điểm, tăng lượt mã giảm giá, tăng số đã bán, tạo thông báo; trả IPN `00`. |
| 13 | | Trang kết quả gọi `GET /payments/vnpay/return` (ghi nhận lần nữa nếu IPN chưa tới, không ghi trùng); hiện mã đơn, trạng thái PAID, mã giao dịch VNPay, ngân hàng, điểm được cộng; xoá giỏ hàng. |
| 14 | Khách bấm **Theo dõi đơn**. UC kết thúc; đơn chuyển sang UC-08 *Cập nhật trạng thái pha chế* (quầy bấm *Bắt đầu pha* → *Pha xong* → *Đã giao khách*). | |

## 6. Luồng thay thế

| Mã | Điều kiện (tại bước) | Xử lý |
|---|---|---|
| A1 | Khách chưa đăng nhập (bước 1 hoặc 5) | Hệ thống chuyển sang `/login`, giữ nguyên giỏ hàng. Khách đăng nhập (UC-06) hoặc đăng ký (UC-05) rồi được đưa về trang thanh toán; tiếp tục bước 2. |
| A2 | Khách chọn trả bằng **điểm BrewLite** (bước 3) | Bước 7: gọi `POST /payments` với `method = POINTS`. Hệ thống trong một transaction: trừ điểm có điều kiện `điểm ≥ ceil(tổng / 100)`, tạo giao dịch SUCCEEDED, chuyển đơn PAID, ghi lịch sử điểm (không tích điểm). Bỏ qua bước 8–12, sang bước 13. Không đủ điểm: xem E5. |
| A3 | Khách nhập mã giảm giá hợp lệ (bước 3) | Báo giá trừ phần giảm (mã % có mức tối đa) hoặc miễn phí giao (FREESHIP); bước 6 kiểm tra lại mã. Mã không hợp lệ: xem E2. |
| A4 | Báo giá khác giỏ hàng: quản lý vừa đổi giá (bước 2) | Giỏ hàng cập nhật giá mới, hiện thông báo cho khách; khách xác nhận rồi tiếp tục bước 3. |
| A5 | Khách bấm **Hủy thanh toán** trên trang VNPay, hoặc thẻ bị từ chối (bước 10–11) | Bước 12: VNPay trả mã khác `00` (ví dụ `24`); hệ thống ghi giao dịch **FAILED**, đơn **PENDING → PAYMENT_FAILED**, không trừ điểm, không tăng lượt mã. Bước 13 hiện lý do và nút **Thanh toán lại qua VNPay**; giỏ hàng giữ nguyên. Khách bấm thì đơn **PAYMENT_FAILED → PENDING**, quay lại bước 7 với Idempotency-Key mới. |
| A6 | Mạng chập chờn, trình duyệt gửi lại `POST /payments` cùng Idempotency-Key (bước 7) | Hệ thống tìm thấy giao dịch theo khoá, trả lại đúng giao dịch và `payUrl` cũ, không tạo giao dịch thứ hai (kể cả khi nhiều request tới cùng lúc). |
| A7 | Khách đóng trình duyệt sau khi trả tiền, không quay về Return URL (bước 11–13) | IPN vẫn ghi nhận kết quả (nếu VNPay gọi được máy chủ). Khách mở *Lịch sử giao dịch*, bấm **Kiểm tra lại với VNPay**: hệ thống gọi `querydr`, ghi nhận theo cùng luật bước 12. |
| A8 | Khách huỷ đơn thay vì thanh toán lại (sau A5) | Khách bấm **Huỷ đơn**: đơn **→ CANCELLED**, món trả về kho. UC kết thúc theo đảm bảo tối thiểu. |

## 7. Luồng ngoại lệ

| Mã | Điều kiện (tại bước) | Xử lý |
|---|---|---|
| E1 | Món hết hàng, bị báo hết hoặc bị ẩn; hoặc kho không đủ số lượng (bước 2 hoặc 6) | Báo giá đánh dấu món hết hàng, khoá nút thanh toán. Nếu xảy ra ở bước 6 (khách khác vừa mua hết): API trả **409**, transaction rollback, không tạo đơn, kho không đổi; hiện *"Món … chỉ còn n phần"*, khách sửa giỏ rồi thử lại. |
| E2 | Mã giảm giá không hợp lệ: không tồn tại, tạm dừng, chưa tới ngày, hết hạn, hết lượt, dưới mức tối thiểu, sai phương thức, không giao tận nơi (bước 3 hoặc 6) | Hiện lý do cụ thể dưới ô nhập mã; đơn không được tạo với mã đó; khách bỏ mã hoặc đổi điều kiện. |
| E3 | Dữ liệu đơn sai: giỏ rỗng, số lượng ngoài 1–20, tuỳ chọn lạ, thiếu địa chỉ giao, có trường giá do trình duyệt gửi (bước 6) | API trả **400** kèm thông báo tiếng Việt; không tạo đơn. |
| E4 | Token hết hạn, bị thu hồi (đổi mật khẩu, bị khoá) (bước 6 hoặc 7) | API trả **401**; giao diện chuyển sang đăng nhập, giữ giỏ hàng. Tài khoản bị khoá thấy lý do khoá. |
| E5 | Trả bằng điểm nhưng không đủ điểm (A2) | Giao dịch ghi **FAILED** (lý do *"Không đủ điểm"*), đơn **→ PAYMENT_FAILED**, điểm không đổi, giỏ hàng giữ nguyên. Phương thức gắn với đơn từ lúc tạo, nên khách huỷ đơn (A8) rồi đặt lại với VNPay. Trường hợp thường gặp đã bị chặn từ bước 3: không đủ điểm thì lựa chọn *Điểm* bị vô hiệu. |
| E6 | Kết quả VNPay có chữ ký sai (bị sửa tham số) (bước 12–13) | Không ghi nhận gì; trang kết quả báo **chữ ký không hợp lệ**; IPN trả `97`. Đơn giữ trạng thái cũ. |
| E7 | Số tiền VNPay báo khác số tiền giao dịch (bước 12) | Không ghi nhận; IPN trả `04`; ghi nhật ký để đối soát. |
| E8 | Khách đã trả thành công qua một link khác của cùng đơn (2 tab), hoặc đơn đã bị huỷ khi link còn mở (bước 12) | Đơn chỉ PAID một lần; giao dịch tới sau ghi **NEEDS_REFUND** để quản lý hoàn tiền thủ công. |
| E9 | Chuyển trạng thái không hợp lệ (ví dụ thanh toán đơn đã CANCELLED hoặc COMPLETED) (bước 7 hoặc 12) | Máy trạng thái từ chối, API trả **409**, trạng thái không đổi. |
| E10 | Khách bỏ dở: đơn PENDING quá 30 phút, không còn link VNPay đang mở | Tác vụ nền của hệ thống chuyển đơn **CANCELLED**, trả món về kho, gửi thông báo *"chưa bị trừ tiền"* (tác vụ nền của hệ thống, FR-33). |
| E11 | VNPay hoặc máy chủ không phản hồi (bước 8–9) | Hiện lỗi kèm nút thử lại; thử lại dùng cùng Idempotency-Key nên không tạo giao dịch trùng (A6). Đơn giữ PENDING. |
| E12 | Gửi yêu cầu quá nhanh, vượt giới hạn (bất kỳ bước nào) | API trả **429**, hiện *"Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút"*. |

## 8. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| BR-01 | Giá dòng = (giá size S + phụ thu size + tổng giá topping) × số lượng. Phụ thu size: S 0đ, M 6.000đ, L 12.000đ. |
| BR-02 | Tổng đơn = tạm tính + phí giao (15.000đ khi giao tận nơi, 0đ khi nhận tại quầy hoặc có FREESHIP) − giảm giá. |
| BR-03 | Mã giảm %: giảm `round(tạm tính × % / 100)`, không vượt mức giảm tối đa của mã. |
| BR-04 | Tích điểm: `floor(số tiền trả bằng VNPay / 1.000)`, chỉ khi đơn PAID. Trả bằng điểm: cần `ceil(tổng / 100)` điểm. |
| BR-05 | Link VNPay hết hạn sau 15 phút; đơn chưa thanh toán tự huỷ sau 30 phút. |
| BR-06 | Một đơn có thể có nhiều giao dịch; chỉ giao dịch mới nhất quyết định đơn có PAYMENT_FAILED hay không. |

## 9. Liên kết yêu cầu

| Bước / luồng | Yêu cầu |
|---|---|
| Tiền điều kiện 1, A1, E4 | FR-10, FR-11, FR-12, NFR-05 |
| Bước 2, A4 | FR-13 |
| Bước 3, A3, E2 | FR-17, FR-18, FR-36 |
| Bước 6, E1, E3 | FR-14, FR-15, FR-16, NFR-03, NFR-07 |
| Bước 7–9, A6, E11 | FR-19, FR-22 |
| Bước 10–12, E6, E7 | FR-20, NFR-09, NFR-18 |
| Bước 12 (cộng điểm, tăng lượt mã) | FR-37, FR-36 |
| Bước 13–14 | FR-26, FR-27, FR-35 |
| A2, E5 | FR-23 |
| A5 | FR-21 |
| A7 | FR-24, FR-29 |
| A8 | FR-32 |
| E8 | FR-25 |
| E9 | FR-30 |
| E10 | FR-33 |
| E12 | NFR-08 |

## 10. Gợi ý kiểm thử từ use-case

Mỗi luồng là một kịch bản test cho Task 4, 5:

| Kịch bản | Luồng | Test (14/11/2026) |
|---|---|---|
| Đặt và trả VNPay thành công, đơn PAID, cộng điểm | Luồng chính | `apps/api/test/payments-vnpay.int-spec.ts` |
| Huỷ trên VNPay rồi trả lại thành công | A5 | `apps/api/test/payments-vnpay.int-spec.ts` |
| Gửi lặp cùng Idempotency-Key (tuần tự, đồng thời) | A6 | `apps/api/test/payments-vnpay.int-spec.ts` |
| Trả bằng điểm, gửi lặp không trừ hai lần | A2 | `tests/e2e/specs/dat-va-thanh-toan.spec.ts` (trả bằng điểm), Thunder Client thư mục 3 (gửi lặp) |
| 12 khách đặt cùng lúc trên kho 5 | E1 | `apps/api/test/stock-concurrency.int-spec.ts` |
| Sửa tham số → chữ ký sai; sai số tiền | E6, E7 | `apps/api/test/payments-vnpay.int-spec.ts` |
| Trả 2 link → NEEDS_REFUND | E8 | `apps/api/test/payments-vnpay.int-spec.ts` |
| Chuyển trạng thái sai bị chặn | E9 | `apps/api/src/orders/order-state-machine.spec.ts` |
| Tự huỷ đơn bỏ dở | E10 | `apps/api/test/order-flows.int-spec.ts` |
| Từ menu đến màn xác nhận trên trình duyệt; chưa đăng nhập bị chuyển sang đăng nhập | Luồng chính, A1 | `tests/e2e/specs/dat-va-thanh-toan.spec.ts` |

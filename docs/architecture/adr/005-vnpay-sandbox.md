# ADR 005: Thanh toán mô phỏng bằng VNPay sandbox và điểm BrewLite

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Đề yêu cầu "dịch vụ thanh toán mô phỏng", thanh toán Ví/Thẻ không dùng tiền mặt. Cần thể hiện được các vấn đề thật của thanh toán trực tuyến: chống giả mạo kết quả, kết quả về nhiều đường (trình duyệt và máy chủ), khách huỷ giữa chừng, đối soát.

## Quyết định

- **Thẻ:** tích hợp **VNPay sandbox**, môi trường thử của cổng thật: tạo link ký HMAC-SHA512, nhận kết quả qua Return URL và IPN, đối soát bằng API `querydr`. Không có tiền thật.
- **Ví:** **điểm BrewLite**, trừ có điều kiện trong một transaction.
- Mã VNPay tách ở `apps/api/src/payments/vnpay/`; `VnpayGateway` nhận cấu hình và hàm gọi mạng qua tham số để test thay VNPay bằng dữ liệu ký đúng.
- Mọi đường kết quả (Return, IPN, đối soát) đi qua một hàm ghi nhận: kiểm chữ ký, kiểm số tiền, khoá dòng đơn, ghi đúng một lần. Mọi trao đổi lưu `PaymentLog`.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Tự viết cổng thanh toán giả (bấm "thành công/thất bại") | Không thể hiện chữ ký, IPN, đối soát; kém thuyết phục khi demo |
| Stripe test mode | Không phổ biến ở Việt Nam; đơn vị VND, thẻ nội địa không sát thực tế |
| MoMo sandbox | Thủ tục đăng ký phức tạp hơn VNPay sandbox |

## Hệ quả

- (+) Demo trên trang thanh toán thật của VNPay; tra được giao dịch trên trang quản trị merchant sandbox.
- (+) Integration test phủ được: thành công, khách huỷ, sai chữ ký, sai số tiền, trả hai lần, đối soát.
- (−) Phụ thuộc dịch vụ ngoài: sandbox gián đoạn thì không demo được thẻ (vẫn còn trả bằng điểm).
- (−) IPN cần địa chỉ công khai; chạy ở máy thì chỉ có Return URL (vẫn kiểm chữ ký, số tiền).

# ADR 006: Idempotency-Key cho thanh toán, optimistic locking cho tồn kho

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Hai tình huống đồng thời có thể làm sai tiền hoặc sai kho:

1. Mạng chập chờn, trình duyệt gửi lại yêu cầu thanh toán: không được tạo hai giao dịch, trừ tiền hoặc điểm hai lần.
2. Nhiều khách đặt cùng món lúc kho gần hết: không được bán vượt tồn kho.

## Quyết định

- **Thanh toán:** client sinh `Idempotency-Key` cho mỗi lần bấm thanh toán (gửi lại dùng khoá cũ). Cột `Payment.idempotencyKey` là **UNIQUE**: request trùng khoá (tuần tự hay đồng thời) chỉ nhận lại giao dịch và link cũ. Ghi nhận kết quả khoá dòng đơn (`SELECT … FOR UPDATE`) để Return và IPN tới cùng lúc vẫn ghi một lần.
- **Tồn kho:** trong transaction, đọc sản phẩm kèm `version`, rồi `UPDATE … SET stock = stock - qty, version = version + 1 WHERE id = ? AND version = ?`. Không dòng nào được cập nhật thì rollback, thử lại (tối đa 8 lần, lùi ngẫu nhiên). Ràng buộc CHECK `stock >= 0` ở CSDL là lớp chặn cuối.
- **Trạng thái đơn:** mọi chuyển trạng thái qua máy trạng thái (`assertTransition`) và câu `UPDATE … WHERE status = <trạng thái cũ>`.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Khoá bi quan (`FOR UPDATE`) cho tồn kho | Giữ khoá suốt lúc tính giá, giảm thông lượng khi đông khách |
| Chặn bấm hai lần chỉ ở giao diện | Không chặn được gửi lại do mạng, gọi API trực tiếp |
| Hàng đợi tuần tự hoá mọi đơn | Thêm hạ tầng (Redis, queue) không cần thiết ở quy mô này |

## Hệ quả

- (+) Có test chứng minh: 5 request đồng thời cùng khoá → 1 giao dịch; Return và 4 IPN đồng thời → điểm cộng 1 lần; kho 5, 12 khách đặt cùng lúc → đúng 5 đơn.
- (−) Logic thử lại và xử lý xung đột làm mã phức tạp hơn; khách có thể nhận lỗi 409 khi tranh nhau món cuối.

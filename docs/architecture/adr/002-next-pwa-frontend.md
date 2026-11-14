# ADR 002: Frontend Next.js mobile-first, PWA, tách khỏi backend

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 14/11/2026

## Bối cảnh

Đề bắt buộc frontend Next.js theo hướng mobile-first/PWA. Khách chủ yếu đặt món trên điện thoại. Luật nghiệp vụ (giá, tồn kho, thanh toán) phải tin cậy được, không phụ thuộc trình duyệt.

## Quyết định

- Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 4; giao diện thiết kế cho màn hình 360 px trước.
- Web **chỉ là lớp giao diện**, gọi API NestJS qua REST/JSON với JWT. Không có API route nghiệp vụ trong Next.js.
- Trạng thái: **Zustand** cho giỏ hàng (lưu `localStorage`, giữ khi tải lại); **React Query** cho dữ liệu từ API (cache, thử lại, làm mới định kỳ để thấy đơn đổi trạng thái).
- **PWA tối thiểu**: manifest, icon, service worker chỉ lưu file tĩnh có mã băm và trang báo mất mạng. Không lưu dữ liệu API.

## Phương án đã cân nhắc

| Phương án | Lý do không chọn |
|---|---|
| Đặt nghiệp vụ trong API route của Next.js | Đề bắt buộc NestJS; dồn nghiệp vụ hai nơi dễ lệch nhau |
| Service worker lưu cả dữ liệu API để chạy offline | Khách có thể thấy giá, tồn kho, trạng thái đơn đã cũ; dữ liệu tài khoản nằm lại trên máy dùng chung |
| Redux cho mọi trạng thái | Nhiều mã khung; dữ liệu từ máy chủ đã có React Query lo |

## Hệ quả

- (+) Luật nghiệp vụ một chỗ; web đổi giao diện không ảnh hưởng nghiệp vụ.
- (+) Cài được lên màn hình chính, mở toàn màn hình; mất mạng không hiện trang lỗi trình duyệt.
- (−) Mỗi thao tác cần gọi mạng tới API; phải cấu hình CORS và địa chỉ API lúc build (`NEXT_PUBLIC_API_URL`).
- (−) Không đặt món được khi mất mạng (đã ghi trong phạm vi "không thực hiện").

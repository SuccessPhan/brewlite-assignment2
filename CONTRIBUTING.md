# Quy ước làm việc

## Nhánh

- `main` luôn chạy được và đã được khoá: **không push thẳng**, mọi thay đổi đi qua pull request.
- Mỗi việc tạo 1 nhánh từ `main` mới nhất, đặt tên theo loại việc:

| Tiền tố | Dùng khi | Ví dụ |
|---|---|---|
| `feat/` | Chức năng mới | `feat/trang-menu` |
| `fix/` | Sửa lỗi | `fix/tong-tien-gio-hang` |
| `docs/` | Tài liệu, sơ đồ | `docs/srs` |
| `test/` | Thêm, sửa test | `test/e2e-dat-hang` |
| `ci/` | Pipeline CI/CD | `ci/them-lint` |
| `chore/` | Cấu hình, dọn dẹp | `chore/cap-nhat-thu-vien` |

## Commit

Theo Conventional Commits: `<loại>: <mô tả ngắn bằng tiếng Việt>`, ví dụ `feat: thêm API GET /products`.
Mỗi commit một thay đổi rõ ràng. Commit bằng **tài khoản và email GitHub của chính mình** (`git config user.email`).

## Pull request

1. `git checkout main && git pull`, rồi `git checkout -b <nhánh>`.
2. Làm, commit, `git push -u origin <nhánh>`.
3. Mở PR vào `main`, điền mẫu, ghi `Closes #<số issue>`, chọn 1 người review.
4. Chỉ merge khi **có 1 Approve và CI xanh**. Nhánh tự xoá sau khi merge.
5. Thay đổi yêu cầu, sơ đồ, kiến trúc phải ghi rõ **lý do** trong mô tả PR.

## Definition of Done

Một việc được coi là xong khi:

- Code chạy được, build không lỗi, đạt tiêu chí chấp nhận của yêu cầu.
- Lint và test đạt trên CI; có test cho phần mới (nếu là code).
- API validate dữ liệu vào; giao diện có trạng thái đang tải, lỗi.
- Đã được 1 thành viên khác review và merge vào `main` qua PR.
- README, tài liệu, ma trận truy vết được cập nhật nếu có thay đổi liên quan.

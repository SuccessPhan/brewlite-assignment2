import { expect, test } from '@playwright/test';

/**
 * E2E-01: luồng chính UC-01 Đặt và thanh toán đơn hàng, từ menu đến màn hình xác nhận.
 * Xem menu → tìm món → chọn size, topping → giỏ hàng → chưa đăng nhập bị chuyển sang đăng nhập
 * → đăng ký (được tặng 1.250 điểm) → quay lại giỏ còn nguyên → trả bằng điểm → đơn PAID → theo dõi đơn.
 * Trả bằng điểm để test không phụ thuộc VNPay sandbox; luồng VNPay đã có integration test.
 */
test('khách đặt món từ menu, trả bằng điểm và thấy màn hình xác nhận', async ({ page }) => {
  const email = `e2e-${Date.now()}@brewlite.test`;
  const password = 'E2eTest123';

  // 1. Menu: tìm không dấu "bx" ra Bạc xỉu
  await page.goto('/menu?q=bx');
  await expect(page.getByRole('heading', { name: 'Thực đơn' })).toBeVisible();
  await page.getByRole('button', { name: 'Chọn tuỳ chọn và thêm Bạc xỉu vào giỏ' }).click();

  // 2. Tuỳ chọn: size L (+12.000đ), thạch cà phê (+8.000đ) → 32.000 + 12.000 + 8.000 = 52.000đ
  await page.getByRole('radio', { name: /^L\b/ }).click();
  await page.getByRole('checkbox', { name: /Thạch cà phê/ }).check();
  const addButton = page.getByRole('button', { name: /Thêm vào giỏ/ });
  await expect(addButton).toContainText('52.000');
  await addButton.click();

  // 3. Giỏ hàng: badge tăng lên 1 món, vào trang thanh toán
  await expect(page.getByRole('button', { name: 'Giỏ hàng, 1 món' })).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByText('Bạc xỉu').first()).toBeVisible();

  // 4. Chưa đăng nhập: bấm thanh toán thì bị chuyển sang trang đăng nhập
  await page.getByRole('button', { name: /Đăng nhập để thanh toán/ }).click();
  await expect(page).toHaveURL(/\/login\?next=(%2F|\/)checkout$/);

  // 5. Đăng ký tài khoản mới, xong tự quay lại trang thanh toán
  await page.getByRole('link', { name: 'Tạo tài khoản mới' }).click();
  await page.getByLabel('Họ và tên').fill('Khách E2E');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByLabel('Xác nhận mật khẩu').fill(password);
  await page.getByRole('checkbox', { name: /Tôi đồng ý/ }).check();
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // 6. Giỏ còn nguyên; chọn trả bằng điểm (tài khoản mới có 1.250 điểm, đơn 52.000đ cần 520 điểm)
  await expect(page.getByText('Bạc xỉu').first()).toBeVisible();
  await page.getByRole('radio', { name: /Điểm BrewLite/ }).check({ force: true });
  const payButton = page.getByRole('button', { name: /Thanh toán ngay/ });
  await expect(payButton).toContainText('52.000');
  await payButton.click();

  // 7. Màn hình xác nhận: mã đơn, đã thanh toán bằng điểm
  const dialog = page.getByRole('dialog', { name: 'Đặt hàng thành công!' });
  await expect(dialog).toBeVisible();
  const orderId = (await dialog.locator('b', { hasText: /^#BL\d{6}$/ }).first().innerText()).slice(1);
  await expect(dialog).toContainText('52.000');
  await expect(dialog).toContainText('520 điểm');

  // 8. Theo dõi đơn: đúng mã đơn, giỏ hàng đã được xoá
  await dialog.getByRole('link', { name: 'Theo dõi đơn hàng' }).click();
  await expect(page).toHaveURL(new RegExp(`/orders/${orderId}$`));
  await expect(page.getByText(orderId).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Giỏ hàng, 0 món' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

/**
 * E2E-02: PWA (NFR-14). Chạy trên bản build production vì service worker chỉ đăng ký ở production.
 * Kiểm tra: có manifest đủ trường để cài, icon tải được, service worker kiểm soát trang,
 * mất mạng thì hiện trang báo mất kết nối thay vì trang lỗi của trình duyệt.
 */
test('manifest đủ trường để cài lên màn hình chính, icon tải được', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();

  const res = await request.get(href!);
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: expect.stringContaining('BrewLite'), short_name: 'BrewLite', start_url: '/', display: 'standalone' });

  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  for (const icon of manifest.icons) {
    const img = await request.get(icon.src);
    expect(img.ok(), icon.src).toBe(true);
    expect(img.headers()['content-type']).toContain('image/png');
  }
});

test('service worker kiểm soát trang; mất mạng thì hiện trang báo mất kết nối', async ({ page, context }) => {
  await page.goto('/');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toMatch(/\/$/);
  // Lần đầu service worker chưa kiểm soát trang đang mở; tải lại để nó tiếp quản
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  try {
    await page.goto('/menu');
    await expect(page.getByText('Mất kết nối mạng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
});

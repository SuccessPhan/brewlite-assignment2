import { defineConfig, devices } from '@playwright/test';

/**
 * E2E BrewLite: chạy trên bản build thật của web (Next.js) và API (NestJS) cùng PostgreSQL.
 * - CI: tự bật API (cổng 3001) và web (cổng 3000) từ bản đã build.
 * - Máy local: nếu đã chạy sẵn (run-brewlite.bat / npm run dev) thì dùng luôn, không bật lại.
 */
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './specs',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  forbidOnly: isCI,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Đề yêu cầu mobile-first: chạy luồng chính trên khung điện thoại
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : [
        {
          command: 'npm --prefix ../../apps/api run start:prod',
          url: 'http://localhost:3001/health',
          reuseExistingServer: !isCI,
          timeout: 120_000,
        },
        {
          command: 'npm --prefix ../../apps/web run start',
          url: 'http://localhost:3000',
          reuseExistingServer: !isCI,
          timeout: 120_000,
        },
      ],
});

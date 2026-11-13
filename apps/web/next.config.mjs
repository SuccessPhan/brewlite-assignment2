/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint chạy ở bước Lint riêng của CI (npm run lint), không chạy lại khi build
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  // Header bảo mật cho mọi trang: không cho web khác nhúng BrewLite vào iframe (chống clickjacking),
  // không đoán kiểu file, không gửi đường dẫn đầy đủ sang trang khác, tắt camera/micro/vị trí
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Service worker luôn lấy bản mới nhất để bản cập nhật tới khách ngay
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },
};

export default nextConfig;

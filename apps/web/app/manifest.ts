import type { MetadataRoute } from 'next';

// Web App Manifest (PWA): cho phép "Thêm vào màn hình chính", mở toàn màn hình như ứng dụng.
// Next.js phục vụ ở /manifest.webmanifest và tự gắn <link rel="manifest"> vào mọi trang.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'BrewLite – Đặt cà phê, thanh toán không tiền mặt',
    short_name: 'BrewLite',
    description: 'Đặt món trước tại BrewLite, thanh toán VNPay hoặc điểm thưởng, tới quầy đọc mã đơn là lấy.',
    lang: 'vi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#efe7d4',
    theme_color: '#efe7d4',
    categories: ['food', 'shopping'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Thực đơn', url: '/menu', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Đơn của tôi', url: '/orders', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}

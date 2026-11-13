// Service worker BrewLite (PWA).
// Chỉ lưu những thứ không bao giờ sai theo thời gian:
//   - file tĩnh của Next.js trong /_next/static (tên file có mã băm, đổi nội dung là đổi tên) và icon: lấy từ bộ nhớ trước;
//   - trang báo mất mạng /offline.html: hiện khi mở trang lúc không có mạng.
// KHÔNG lưu HTML các trang, KHÔNG lưu API (giá, tồn kho, đơn, tài khoản luôn lấy mới từ máy chủ),
// KHÔNG đụng request khác tên miền (API ở tên miền riêng) và request không phải GET (đặt đơn, thanh toán).
const VERSION = 'brewlite-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon.svg', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Xoá bộ nhớ của phiên bản cũ
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Mở trang: luôn lấy từ máy chủ; mất mạng thì hiện trang báo mất mạng
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // File tĩnh có mã băm và icon: lấy từ bộ nhớ, chưa có thì tải rồi lưu
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
});

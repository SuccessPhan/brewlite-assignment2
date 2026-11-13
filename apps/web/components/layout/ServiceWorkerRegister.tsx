'use client';

import { useEffect } from 'react';

/**
 * Đăng ký service worker (PWA) khi chạy bản build production.
 * Lúc phát triển (npm run dev) không đăng ký để file tĩnh không bị giữ bản cũ.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Không đăng ký được (trình duyệt chặn, chế độ ẩn danh...) thì web vẫn chạy bình thường
    });
  }, []);
  return null;
}

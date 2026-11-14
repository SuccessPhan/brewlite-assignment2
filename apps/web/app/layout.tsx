import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
// Bộ chữ kiểu báo in, đều có bảng chữ tiếng Việt: Playfair (tít), Lora (bài), Oswald (nhãn, nút), Plex Mono (giá, mã đơn).
// Font nằm sẵn trong gói @fontsource (cài cùng npm ci), không tải từ Google Fonts lúc build nên build không phụ thuộc mạng.
// Mỗi tệp CSS khai báo font theo từng bảng chữ (unicode-range): trình duyệt chỉ tải phần chữ trang dùng tới.
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/500.css';
import '@fontsource/lora/600.css';
import '@fontsource/lora/700.css';
import '@fontsource/lora/400-italic.css';
import '@fontsource/lora/500-italic.css';
import '@fontsource/lora/600-italic.css';
import '@fontsource/lora/700-italic.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/500.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import { AppStoreProvider } from '@/context/app-store';
import { AuthProvider } from '@/context/auth-context';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/layout/BottomNav';
import QueryProvider from '@/components/layout/QueryProvider';
import StorefrontSync from '@/components/layout/StorefrontSync';
import SiteChrome from '@/components/layout/SiteChrome';
import ServiceWorkerRegister from '@/components/layout/ServiceWorkerRegister';
import SiteFooter from '@/components/layout/SiteFooter';
import { ProductSheetProvider } from '@/components/product/ProductSheetProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrewLite – Đặt cà phê, thanh toán không tiền mặt',
  description: 'Đặt món trước tại BrewLite An Dương Vương, thanh toán bằng ví điện tử hoặc thẻ liên kết, tới quầy đọc mã đơn là lấy.',
  applicationName: 'BrewLite',
  // PWA: icon trên tab, trên màn hình chính iPhone; mở từ màn hình chính thì chạy toàn màn hình
  icons: { icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }], apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'BrewLite', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#efe7d4',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-dvh font-sans antialiased">
        <ServiceWorkerRegister />
        <QueryProvider>
          <AuthProvider>
            <StorefrontSync />
            <AppStoreProvider>
              <ProductSheetProvider>
                <SiteChrome
                  header={<AppHeader />}
                  footer={
                    <>
                      <SiteFooter />
                      <BottomNav />
                    </>
                  }
                >
                  {children}
                </SiteChrome>
              </ProductSheetProvider>
            </AppStoreProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

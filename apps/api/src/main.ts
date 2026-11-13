import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Ảnh món tải lên đi kèm JSON (tối đa ~1 MB sau khi mã hoá); mọi request khác vẫn nhỏ
  app.useBodyParser('json', { limit: '2mb' });

  // Chạy sau proxy/load balancer của nền tảng triển khai: tin số tầng proxy ghi trong TRUST_PROXY (thường là 1)
  // để req.ip là IP thật của khách. Không có thì mọi khách chung một IP, giới hạn 10 lần đăng nhập/phút áp cho cả quán.
  // Để trống khi chạy local, tránh khách tự gửi X-Forwarded-For giả để né giới hạn.
  const trustProxy = Number(process.env.TRUST_PROXY ?? 0);
  if (trustProxy > 0) app.set('trust proxy', trustProxy);

  // Header bảo mật (chặn nhúng iframe, đoán kiểu file, lộ tên framework...)
  app.use(helmet());

  // Cho phép frontend (khác cổng) gọi API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // Validate toàn cục: mọi DTO ở các task sau tự được kiểm tra
  // whitelist: bỏ trường lạ; forbidNonWhitelisted: báo 400 nếu có trường lạ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`BrewLite API chạy tại http://localhost:${port}`);
}
bootstrap();

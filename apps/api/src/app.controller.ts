import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  // Giữ lại route mặc định để test có sẵn của NestJS không bị hỏng
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // GET /health: kiểm tra backend và kết nối PostgreSQL.
  // Mất CSDL thì trả 503 để health check của nền tảng triển khai và smoke test sau deploy nhận ra lỗi.
  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', message: 'Không kết nối được CSDL', db: 'down' });
    }
    return { status: 'ok', message: 'Hello from BrewLite API', db: 'up' };
  }
}

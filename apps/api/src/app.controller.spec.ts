import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: { $queryRaw: (queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }])) } }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('GET / trả về "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });

  it('GET /health báo backend và CSDL đều chạy', async () => {
    await expect(appController.health()).resolves.toEqual({ status: 'ok', message: 'Hello from BrewLite API', db: 'up' });
  });

  it('GET /health trả 503 khi mất kết nối CSDL', async () => {
    queryRaw.mockRejectedValueOnce(new Error('connection refused'));
    const err = await appController.health().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ServiceUnavailableException);
    expect((err as ServiceUnavailableException).getStatus()).toBe(503);
    expect((err as ServiceUnavailableException).getResponse()).toMatchObject({ db: 'down' });
  });
});

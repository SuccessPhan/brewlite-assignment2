import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductsModule } from '../src/products/products.module';

// API menu (Task 4.3): gọi HTTP thật vào GET /products, GET /products/:id trên PostgreSQL thật
describe('API sản phẩm GET /products, GET /products/:id (PostgreSQL thật)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tag = randomUUID().slice(0, 8);
  const category = `test-${tag}`;
  const ids = { selling: `test-${tag}-ban`, hidden: `test-${tag}-an`, soldOut: `test-${tag}-het` };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [PrismaModule, ProductsModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    const base = { description: 'Món dùng cho test', imageUrl: 'https://example.com/a.jpg', category, kind: 'drink', keywords: [] as string[] };
    await prisma.product.createMany({
      data: [
        { ...base, id: ids.selling, name: 'Món đang bán', price: 30000, stock: 7 },
        { ...base, id: ids.hidden, name: 'Món bị ẩn', price: 30000, stock: 7, hidden: true },
        { ...base, id: ids.soldOut, name: 'Món báo hết', price: 30000, stock: 9, soldOut: true },
      ],
    });
  });

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { category } });
    await app.close();
  });

  it('GET /products trả 200, danh sách món kèm tên, giá, ảnh, tồn kho, topping', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const item = res.body.find((p: { id: string }) => p.id === ids.selling);
    expect(item).toMatchObject({ id: ids.selling, name: 'Món đang bán', price: 30000, imageUrl: 'https://example.com/a.jpg', stock: 7 });
    expect(Array.isArray(item.toppings)).toBe(true);
  });

  it('không trả cột nội bộ (version, hidden, soldOut)', async () => {
    const res = await request(app.getHttpServer()).get(`/products/${ids.selling}`).expect(200);
    expect(res.body).not.toHaveProperty('version');
    expect(res.body).not.toHaveProperty('hidden');
    expect(res.body).not.toHaveProperty('soldOut');
  });

  it('lọc theo danh mục; món bị ẩn không xuất hiện', async () => {
    const res = await request(app.getHttpServer()).get('/products').query({ category }).expect(200);
    const got = res.body.map((p: { id: string }) => p.id).sort();
    expect(got).toEqual([ids.selling, ids.soldOut].sort());
  });

  it('món quản lý báo hết vẫn hiện nhưng tồn kho trả về 0 (khách thấy "Hết hàng")', async () => {
    const res = await request(app.getHttpServer()).get(`/products/${ids.soldOut}`).expect(200);
    expect(res.body.stock).toBe(0);
  });

  it('GET /products/:id với món không tồn tại hoặc bị ẩn trả 404', async () => {
    await request(app.getHttpServer()).get('/products/khong-co-mon-nay').expect(404);
    await request(app.getHttpServer()).get(`/products/${ids.hidden}`).expect(404);
  });
});

/**
 * Chạy migration an toàn bằng tài khoản CHỦ CSDL (DIRECT_URL):
 *   npm run db:migrate          (khi phát triển)
 *   node dist/db-migrate.js     (trong Docker, trước khi chạy API)
 *
 * `prisma migrate deploy` chỉ áp những migration chưa chạy trong thư mục prisma/migrations, không xoá dữ liệu,
 * không tự sinh migration mới. Chạy lại nhiều lần vẫn an toàn.
 *
 * CSDL tạo từ trước bằng `prisma db push` (bản Assignment 1) đã có đủ bảng nhưng chưa có bảng _prisma_migrations.
 * Khi gặp trường hợp này, script đánh dấu migration đầu tiên là "đã áp" (baseline) để khỏi phải xoá CSDL làm lại.
 */
import { execFileSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Chạy ở máy: đọc DIRECT_URL, DATABASE_URL từ apps/api/.env. Docker, CI đã có biến môi trường thì giữ nguyên (không ghi đè).
config({ quiet: true });

const MIGRATIONS_DIR = join(__dirname, '..', 'prisma', 'migrations');

/** Gọi thẳng CLI của Prisma bằng Node (không qua shell, chạy giống nhau trên Windows và Linux) */
function prisma(args: string[]) {
  execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), ...args], { stdio: 'inherit' });
}

async function needsBaseline(url: string): Promise<boolean> {
  const db = new PrismaClient({ datasourceUrl: url });
  try {
    const rows = await db.$queryRaw<{ users: string | null; migrations: string | null }[]>`
      SELECT to_regclass('public."User"')::text AS users, to_regclass('public."_prisma_migrations"')::text AS migrations`;
    return Boolean(rows[0]?.users) && !rows[0]?.migrations;
  } finally {
    await db.$disconnect();
  }
}

async function main() {
  const ownerUrl = process.env.DIRECT_URL;
  if (!ownerUrl) throw new Error('Cần đặt DIRECT_URL (tài khoản chủ CSDL) để chạy migration');

  if (await needsBaseline(ownerUrl)) {
    const first = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()[0];
    console.log(`CSDL cũ tạo bằng db push: đánh dấu migration ${first} là đã áp (baseline)`);
    prisma(['migrate', 'resolve', '--applied', first]);
  }
  prisma(['migrate', 'deploy']);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

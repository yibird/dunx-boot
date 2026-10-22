import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle Kit 配置（PostgreSQL）。
 *
 * - `schema`：仅加载表定义，包含 sys 和 ai 模块。
 * - `out`：迁移 SQL 与快照的输出目录。
 * - `dialect`：数据库方言，固定为 `postgresql`。
 * - `dbCredentials.url`：连接串，从环境变量 `DATABASE_URL` 读取
 *   （bun run db:* 会加载项目 .env）。
 * - ORM 与 Kit 固定为相同的 1.0 RC 版本，保持迁移格式与 API 一致。
 */
export default defineConfig({
  schema: './src/schemas/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:123456@127.0.0.1:5432/dunx-boot?search_path=public',
  },
  verbose: true,
  strict: true,
})

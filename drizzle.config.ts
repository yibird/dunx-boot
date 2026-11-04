import { defineConfig } from 'drizzle-kit'

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
})

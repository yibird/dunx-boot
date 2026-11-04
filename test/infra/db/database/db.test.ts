import { describe, expect, test } from 'bun:test'
import { createDb, type DbOptions } from '@/infra/db/database/db'

function options(overrides: Partial<DbOptions> = {}): DbOptions {
  return {
    drizzle: { relations: {} },
    ...overrides,
  } as DbOptions
}

describe('createDb', () => {
  test('缺少连接地址时直接报错', async () => {
    await expect(createDb(options())).rejects.toThrow('database.url 未配置')
  })

  test('非法连接串时报错', async () => {
    await expect(createDb(options({ url: 'not a url' }))).rejects.toThrow(
      '不是合法的 PostgreSQL 连接串'
    )
  })

  test('只接受 postgres / postgresql 协议', async () => {
    await expect(
      createDb(options({ url: 'mysql://user:pass@127.0.0.1:3306/db' }))
    ).rejects.toThrow('只支持 postgres:// 或 postgresql://')
  })

  test('合法地址会创建惰性连接句柄', async () => {
    const db = await createDb(
      options({ url: 'postgres://user:pass@127.0.0.1:1/test' })
    )

    try {
      expect(db.$client).toBeDefined()
      expect(typeof db.$client.close).toBe('function')
    } finally {
      await db.$client.close()
    }
  })
})

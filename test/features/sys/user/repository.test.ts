import { describe, expect, test } from 'bun:test'
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { SysUserRepository } from '@/features/sys/user/repository'

const row = {
  id: '1',
  account: 'admin',
  email: 'admin@example.com',
  phone: '13800000000',
  password: 'hashed-secret',
  tenantId: '2',
}

/**
 * 模拟 drizzle 的列投影：只返回请求的列，和真实查询保持一致。
 */
function createFakeDb() {
  return {
    select: (columns: Record<string, unknown>) => ({
      from: () => ({
        where: () => ({
          limit: async () => [
            Object.fromEntries(
              Object.keys(columns).map((key) => [
                key,
                row[key as keyof typeof row],
              ])
            ),
          ],
        }),
      }),
    }),
  } as unknown as BunSQLDatabase
}

describe('SysUserRepository', () => {
  const repository = new SysUserRepository(createFakeDb())

  test('findByAccount 不返回 password', async () => {
    const user = await repository.findByAccount('admin')

    expect(user?.account).toBe('admin')
    expect(user).not.toHaveProperty('password')
  })

  test('findByEmail 不返回 password', async () => {
    const user = await repository.findByEmail('admin@example.com')

    expect(user?.email).toBe('admin@example.com')
    expect(user).not.toHaveProperty('password')
  })

  test('findByPhone 不返回 password', async () => {
    const user = await repository.findByPhone('13800000000')

    expect(user?.phone).toBe('13800000000')
    expect(user).not.toHaveProperty('password')
  })
})

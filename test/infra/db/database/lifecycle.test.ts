import { describe, expect, mock, test } from 'bun:test'
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DbConnection } from '@/infra/db/database/connection'
import { clientOf, DbLifecycle } from '@/infra/db/database/lifecycle'
import type { DbHandle } from '@/infra/db/database/db'

function fakeDb(close: () => Promise<void> | void) {
  const client = { close }
  return { db: { $client: client } as unknown as BunSQLDatabase, client }
}

describe('clientOf', () => {
  test('取回 drizzle 句柄底下的驱动实例', () => {
    const { db, client } = fakeDb(() => {})

    expect(clientOf(db)).toBe(client)
  })
})

describe('DbLifecycle', () => {
  test('重复调用只关闭一次连接池', async () => {
    const close = mock(async () => {})
    const lifecycle = new DbLifecycle({ close })

    await Promise.all([lifecycle.onShutdown(), lifecycle.onShutdown()])
    await lifecycle.onShutdown()

    expect(close).toHaveBeenCalledTimes(1)
  })

  test('关闭失败时保留同一个失败 Promise', async () => {
    const close = mock(async () => {
      throw new Error('close failed')
    })
    const lifecycle = new DbLifecycle({ close })

    await expect(lifecycle.onShutdown()).rejects.toThrow('close failed')
    await expect(lifecycle.onShutdown()).rejects.toThrow('close failed')
    expect(close).toHaveBeenCalledTimes(1)
  })
})

describe('DbConnection', () => {
  test('停机时关闭底层客户端', async () => {
    const close = mock(async () => {})
    const { db } = fakeDb(close)
    const connection = new DbConnection(db as unknown as DbHandle<never>)

    await connection.onShutdown()

    expect(close).toHaveBeenCalledTimes(1)
  })
})

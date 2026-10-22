import { describe, expect, mock, spyOn, test } from 'bun:test'
import type { Logger } from '@dunx/core'
import type { AppConfigService } from '@/infra/config'
import { createCache } from '@/infra/db/cache'

type CacheSettings = AppConfigService['values']['cache']

function config(cache: CacheSettings): AppConfigService {
  return {
    values: {
      application: { name: 'db-cache-test' },
      cache,
    },
  } as AppConfigService
}

const disabled = { enabled: false, max: 1000 }
const enabled = { enabled: true, max: 1000 }

describe('local database query cache', () => {
  test('disables query caching when local is off even if remote is enabled', () => {
    const logger = { warn: mock() } as unknown as Logger
    expect(
      createCache(config({ local: disabled, remote: disabled }), logger)
    ).toBeUndefined()
    expect(
      createCache(config({ local: disabled, remote: enabled }), logger)
    ).toBeUndefined()
  })

  test('preserves raw SQL values and prefers local TTL in milliseconds', async () => {
    const logger = { warn: mock() } as unknown as Logger
    const cache = createCache(
      config({
        local: { ...enabled, ttl: 250 },
        remote: { ...enabled, ttl: 10 },
        ttl: 1000,
      }),
      logger
    )!
    const now = spyOn(Date, 'now').mockReturnValue(1000)
    const rows = [
      [42n, new Date('2026-01-01T00:00:00Z'), Buffer.from([1, 2, 3])],
    ]
    try {
      expect(cache.strategy()).toBe('explicit')
      await cache.put('query', rows, [], false)
      now.mockReturnValue(1249)
      expect(await cache.get('query', [], false)).toEqual(rows)
      now.mockReturnValue(1250)
      expect(await cache.get('query', [], false)).toBeUndefined()
    } finally {
      now.mockRestore()
    }
  })

  test('uses shared TTL when no local TTL is configured', async () => {
    const logger = { warn: mock() } as unknown as Logger
    const cache = createCache(
      config({ local: enabled, remote: disabled, ttl: 400 }),
      logger
    )!
    const now = spyOn(Date, 'now').mockReturnValue(1000)
    try {
      await cache.put('query', [[3]], [], false)
      expect(await cache.get('query', [], false)).toEqual([[3]])
      now.mockReturnValue(1400)
      expect(await cache.get('query', [], false)).toBeUndefined()
    } finally {
      now.mockRestore()
    }
  })

  test('invalidates cached reads when their table is mutated', async () => {
    const logger = { warn: mock() } as unknown as Logger
    const cache = createCache(
      config({ local: enabled, remote: disabled, ttl: 1000 }),
      logger
    )!
    await cache.put('users-query', [[1]], ['sys_user'], false)
    await cache.put('roles-query', [[2]], ['sys_role'], false)
    expect(await cache.get('users-query', ['sys_user'], false)).toEqual([[1]])
    await cache.onMutate({ tables: ['sys_user'] })
    expect(await cache.get('users-query', ['sys_user'], false)).toBeUndefined()
    expect(await cache.get('roles-query', ['sys_role'], false)).toEqual([[2]])
  })
})

import { describe, expect, mock, spyOn, test } from 'bun:test'
import { AppFactory, Module, inject, provide, token } from '@dunx/core'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { unstorageCache } from 'drizzle-uncache'
import { AppConfigService, configSchema } from '@/infra/config'
import { AppDbModule } from '@/infra/db'
import type { relations } from '@/schemas'
import baseConfig from '../config/application'
import { createDb, type DbOptions } from '@/infra/db/db'
import { clientOf, DbLifecycle } from '@/infra/db/lifecycle'
import { DbModule } from '@/infra/db/module'

const options = {
  url: 'postgres://test:test@127.0.0.1:1/db_module_test',
  drizzle: { relations: {} },
} satisfies DbOptions

describe('DbModule', () => {
  test.each([true, false])(
    'wires database.cache=%s without a Redis provider',
    async (cache) => {
      const config = new AppConfigService(
        configSchema.parse({
          ...baseConfig,
          database: { url: options.url, cache },
          security: {
            ...baseConfig.security,
            cors: {},
            auth: {
              ...baseConfig.security.auth,
              secret: 'db-test-secret'.repeat(3),
            },
          },
        })
      )
      @Module({
        global: true,
        providers: [provide(AppConfigService, { useValue: config })],
        exports: [AppConfigService],
      })
      class TestConfigModule {}
      @Module({ imports: [TestConfigModule, AppDbModule] })
      class RootModule {}

      const app = await AppFactory.create(RootModule)
      try {
        const db = app.get(BunSQLDatabase<typeof relations>)
        expect(
          db.query.sysUser.findMany({ with: { role: true } }).toSQL().sql
        ).toContain('"role_id"')
        expect(db.$cache !== undefined).toBe(cache)
      } finally {
        await app.shutdown()
      }
    }
  )

  test('shares a lazy database globally and closes it after its consumers', async () => {
    const shutdownOrder: string[] = []
    class Repository {
      constructor(readonly db: BunSQLDatabase) {}

      onShutdown() {
        shutdownOrder.push('repository')
      }
    }
    @Module({ providers: [Repository], exports: [Repository] })
    class FeatureModule {}
    @Module({ imports: [DbModule.forRoot(options), FeatureModule] })
    class RootModule {}

    const app = await AppFactory.create(RootModule)
    const db = app.get(BunSQLDatabase)
    const client = clientOf(db)
    const originalClose = client.close.bind(client)
    const close = spyOn(client, 'close').mockImplementation(async () => {
      shutdownOrder.push('connection')
      await originalClose()
    })
    try {
      expect(db).toBeInstanceOf(BunSQLDatabase)
      expect(app.get(Repository).db).toBe(db)
      await Promise.all([app.shutdown(), app.shutdown()])
      expect(close).toHaveBeenCalledTimes(1)
      expect(shutdownOrder).toEqual(['repository', 'connection'])
    } finally {
      await app.shutdown()
      close.mockRestore()
    }
  })

  test('resolves async options from imported providers and installs their cache', async () => {
    const configToken = token<DbOptions>('TestDatabaseConfig')
    const config = { ...options, drizzle: { ...options.drizzle, cache: true } }
    const cache = unstorageCache()
    const factory = mock(async (value: DbOptions) => value)
    const cacheFactory = mock(async (_value: DbOptions) => cache)
    @Module({
      providers: [provide(configToken, { useValue: config })],
      exports: [configToken],
    })
    class ConfigModule {}
    @Module({
      imports: [
        DbModule.forRootAsync(BunSQLDatabase, {
          imports: [ConfigModule],
          inject: [configToken] as const,
          useFactory: factory,
          cacheFactory,
        }),
      ],
    })
    class RootModule {}

    const app = await AppFactory.create(RootModule)
    try {
      expect(factory).toHaveBeenCalledTimes(1)
      expect(factory).toHaveBeenCalledWith(config)
      expect(cacheFactory).toHaveBeenCalledTimes(1)
      expect(cacheFactory).toHaveBeenCalledWith(config)
      expect(app.get(BunSQLDatabase).$cache as unknown).toBe(cache)
    } finally {
      await app.shutdown()
    }
  })

  test('does not build or attach a cache when disabled', async () => {
    const cacheFactory = mock(() => unstorageCache())
    const app = await AppFactory.create(
      DbModule.forRootAsync(BunSQLDatabase, {
        inject: [] as const,
        useFactory: () => ({
          ...options,
          drizzle: { ...options.drizzle, cache: false },
        }),
        cacheFactory,
      })
    )
    try {
      expect(cacheFactory).not.toHaveBeenCalled()
      expect(app.get(BunSQLDatabase).$cache).toBeUndefined()
    } finally {
      await app.shutdown()
    }
  })

  test('keeps named registrations and their connection lifecycles separate', async () => {
    const firstToken = token<BunSQLDatabase>('FirstDatabase')
    const secondToken = token<BunSQLDatabase>('SecondDatabase')
    class Consumer {
      readonly first = inject(firstToken)
      readonly second = inject(secondToken)
    }
    @Module({
      imports: [
        DbModule.forRootAsync(firstToken, {
          inject: [] as const,
          useFactory: () => options,
        }),
        DbModule.forRootAsync(secondToken, {
          inject: [] as const,
          useFactory: () => options,
        }),
      ],
      providers: [Consumer],
    })
    class RootModule {}

    const app = await AppFactory.create(RootModule)
    const first = app.get(firstToken)
    const second = app.get(secondToken)
    const closeFirst = spyOn(clientOf(first), 'close')
    const closeSecond = spyOn(clientOf(second), 'close')
    try {
      expect(first).not.toBe(second)
      expect(clientOf(first)).not.toBe(clientOf(second))
      expect(app.get(Consumer).first).toBe(first)
      expect(app.get(Consumer).second).toBe(second)
      await app.shutdown()
      expect(closeFirst).toHaveBeenCalledTimes(1)
      expect(closeSecond).toHaveBeenCalledTimes(1)
    } finally {
      await app.shutdown()
      closeFirst.mockRestore()
      closeSecond.mockRestore()
    }
  })
})

describe('database lifecycle and configuration', () => {
  test('concurrent shutdown calls share the same pending close', async () => {
    const pending = Promise.withResolvers<void>()
    const close = mock(() => pending.promise)
    const lifecycle = new DbLifecycle({ close })
    const first = lifecycle.onShutdown()
    const second = lifecycle.onShutdown()
    expect(second).toBe(first)
    await Promise.resolve()
    expect(close).toHaveBeenCalledTimes(1)
    pending.resolve()
    await first
    expect(lifecycle.onShutdown()).toBe(first)
    expect(close).toHaveBeenCalledTimes(1)
  })

  test('rejects missing, malformed and non-PostgreSQL URLs before use', async () => {
    const { url: _url, ...withoutUrl } = options
    await expect(createDb(withoutUrl)).rejects.toThrow('database.url 未配置')
    await expect(createDb({ ...options, url: 'invalid url' })).rejects.toThrow(
      '不是合法的 PostgreSQL 连接串'
    )
    await expect(
      createDb({ ...options, url: 'mysql://test:test@127.0.0.1:1/test' })
    ).rejects.toThrow('只支持 postgres:// 或 postgresql://')
  })
})

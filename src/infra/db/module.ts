import {
  provide,
  token,
  type Deps,
  type DynamicModule,
  type InjectionToken,
  type ModuleRef,
  type Resolved,
} from '@dunx/core'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { DbConnection } from './connection'
import { createDb, type DbOptions, type DbSchema } from './db'
import type { Cache } from 'drizzle-orm/cache/core'

export interface DbModuleAsyncOptions<R extends DbSchema, D extends Deps> {
  inject: D
  useFactory: (...args: Resolved<D>) => DbOptions<R> | Promise<DbOptions<R>>
  imports?: readonly ModuleRef[]
  /**
   * 构建查询缓存实例。仅当 `useFactory` 返回的 `drizzle.cache` 为 `true`
   * 时调用；返回 `undefined` 表示该连接不使用缓存。
   */
  cacheFactory?: (
    ...args: Resolved<D>
  ) => Cache | undefined | Promise<Cache | undefined>
}

/**
 * 应用自己的 PostgreSQL 模块，只依赖核心容器与 Drizzle。
 */
export class DbModule {
  static forRoot<R extends DbSchema>(options: DbOptions<R>): DynamicModule {
    return this.forRootAsync(BunSQLDatabase<R>, {
      inject: [] as const,
      useFactory: () => options,
    })
  }

  static forRootAsync<R extends DbSchema, const D extends Deps>(
    databaseToken: InjectionToken<BunSQLDatabase<NoInfer<R>>>,
    options: DbModuleAsyncOptions<R, D>
  ): DynamicModule {
    // 每次注册拥有独立的连接生命周期，命名 token 也可复用此模块。
    const connectionToken = token<DbConnection<R>>('DbConnection')
    return {
      module: DbModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        provide(connectionToken, {
          useFactory: async (...deps: Resolved<D>) => {
            const dbOptions = await options.useFactory(...deps)
            const cache = dbOptions.drizzle.cache
              ? await options.cacheFactory?.(...deps)
              : undefined
            return new DbConnection(await createDb(dbOptions, cache))
          },
          inject: options.inject,
        }),
        provide(databaseToken, {
          useFactory: (connection: DbConnection<R>) => connection.db,
          inject: [connectionToken] as const,
        }),
      ],
      exports: [databaseToken],
    }
  }
}

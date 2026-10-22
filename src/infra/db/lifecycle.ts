import type { OnShutdown } from '@dunx/core'
import type { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { DbSchema } from './db'

/**
 * 能收尾的连接池（`Bun.SQL` 实例即满足）。
 */
export interface ClosableClient {
  close(): Promise<void> | void
}

/**
 * 取 drizzle 句柄底下的驱动实例。
 *
 * `drizzle()` 的返回类型是 `BunSQLDatabase<...> & { $client }`，而容器里的
 * token 是 `BunSQLDatabase` 这个类本身，类型上看不到 `$client`；
 * 这是全项目唯一一处把它收回来的地方。
 */
export function clientOf<R extends DbSchema>(
  db: BunSQLDatabase<R>
): ClosableClient {
  return (db as BunSQLDatabase<R> & { $client: ClosableClient }).$client
}

/**
 * 停机时关闭数据库连接池。
 *
 * drizzle 句柄没有生命周期钩子，容器不会替我们关 `Bun.SQL`；没有这个
 * provider，停机后连接池仍然挂着。重复调用共用同一个关闭 Promise。
 */
export class DbLifecycle implements OnShutdown {
  #closing: Promise<void> | undefined

  constructor(private readonly client: ClosableClient) {}

  onShutdown(): Promise<void> {
    return (this.#closing ??= Promise.resolve().then(() => this.client.close()))
  }
}

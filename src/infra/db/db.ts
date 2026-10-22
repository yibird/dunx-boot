import type { AnyRelations } from 'drizzle-orm'
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { Cache } from 'drizzle-orm/cache/core'

/**
 * Drizzle 1.0 的关系定义，同时决定 db.query 的表与关联类型。
 */
export type DbSchema = AnyRelations

export type DbHandle<R extends DbSchema> = BunSQLDatabase<R> & {
  $client: Bun.SQL
}

export interface DrizzleOptions<R extends DbSchema = DbSchema> {
  logger?: boolean
  /**
   * 是否启用查询缓存
   */
  cache?: boolean
  relations: R
}

/**
 * 连接参数；每一项都由 `database` 配置给出默认值（见 schema），
 * 这里不再重复一份默认值，避免两处数值各说各话。
 */
export interface DbOptions<R extends DbSchema = DbSchema> {
  url?: string
  max?: number
  idleTimeout?: number
  connectionTimeout?: number
  maxLifetime?: number
  prepare?: boolean
  bigint?: boolean
  drizzle: DrizzleOptions<R>
}

/**
 * 建库。
 *
 * **不在这里 `connect()`**：本应用的契约是「postgres 缺失也能启动，由 readiness
 * 探针决定摘不摘流量」（见 README「Services」），连接交给首个查询惰性建立。
 * 但地址本身在启动期就校验：写错的 scheme（`mysql://`）或解析不了的串，
 * 框架的 Postgres 方言救不了，越早报错越好。
 *
 * 连接池的收尾见 {@link DbLifecycle}。
 */
export async function createDb<R extends DbSchema = DbSchema>(
  options: DbOptions<R>,
  cache?: Cache
) {
  const { url, drizzle: drizzleOptions, ...sqlOptions } = options
  if (!url) {
    throw new Error('database.url 未配置：数据库连接地址是必需的')
  }
  assertPostgresUrl(url)

  const client = new Bun.SQL(url, sqlOptions)
  const { cache: enabled, ...rest } = drizzleOptions
  try {
    return drizzle({
      ...rest,
      ...(enabled && cache ? { cache } : {}),
      client,
    })
  } catch (error) {
    await client.close().catch(() => {})
    throw error
  }
}

const POSTGRES_PROTOCOLS = new Set(['postgres:', 'postgresql:'])

function assertPostgresUrl(url: string) {
  let protocol: string
  try {
    protocol = new URL(url).protocol
  } catch {
    throw new Error('database.url 不是合法的 PostgreSQL 连接串')
  }
  if (!POSTGRES_PROTOCOLS.has(protocol)) {
    throw new Error(
      `database.url 只支持 postgres:// 或 postgresql://，收到 ${protocol}`
    )
  }
}

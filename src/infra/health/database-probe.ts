import { QueryProbe } from '@dunx/http'
import { sql, type SQL } from 'drizzle-orm'

/**
 * 能执行一条 SQL 的最小数据库契约（drizzle 各驱动实例都满足）。
 */
export interface PingableDatabase {
  execute(query: SQL): Promise<unknown>
}

/**
 * 数据库探针适配器：把 drizzle 实例桥接成 `QueryProbe`（一次 `select 1`）。
 */
export class DbPingProbe extends QueryProbe {
  constructor(private readonly db: PingableDatabase) {
    super()
  }

  override async ping(): Promise<void> {
    await this.db.execute(sql`select 1`)
  }
}

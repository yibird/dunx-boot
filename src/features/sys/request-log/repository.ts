import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { Pager } from '@/infra/model'
import { sysRequestLog, type SysRequestLogInsert } from '@/schemas'
import { asc, count, desc } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { SysRequestLogQuery } from './schema'

export class SysRequestLogRepository {
  constructor(readonly db: BunSQLDatabase) {}

  /**
   * 创建请求日志
   *
   * @param value 请求日志
   * @returns 创建 请求日志
   */
  async create(value: SysRequestLogInsert) {
    const [row] = await this.db.insert(sysRequestLog).values(value).returning()
    return row
  }

  /**
   * 获取请求日志分页列表
   *
   * @param query 查询参数
   * @returns 请求日志分页列表
   */
  async getPageList(query: SysRequestLogQuery) {
    const where = mergeAnd(
      ilikeIf(sysRequestLog.requestId, query.requestId),
      ilikeIf(sysRequestLog.traceId, query.traceId),
      eqIf(sysRequestLog.method, query.method),
      ilikeIf(sysRequestLog.url, query.url),
      eqIf(sysRequestLog.success, query.success),
      ilikeIf(sysRequestLog.token, query.token),
      ilikeIf(sysRequestLog.ip, query.ip),
      eqIf(sysRequestLog.statusCode, query.statusCode)
    )
    const { pageSize, offset } = Pager.getPagination(query)
    const [list, summary] = await Promise.all([
      this.db
        .select()
        .from(sysRequestLog)
        .where(where)
        .orderBy(asc(sysRequestLog.sort), desc(sysRequestLog.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(sysRequestLog).where(where),
    ])
    return { list, total: summary[0]?.count ?? 0 }
  }
}

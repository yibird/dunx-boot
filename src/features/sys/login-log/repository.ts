import { eqIf, mergeAnd } from '@/infra/db'
import { Pager } from '@/infra/model'
import { sysLoginLog, type SysLoginLogInsert } from '@/schemas'
import { asc, count, desc } from 'drizzle-orm'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import type { SysLoginLogQuery } from './schema'

export class SysLoginLogRepository {
  constructor(readonly db: BunSQLDatabase) {}

  /**
   * 创建登录日志
   * @param value 登录日志
   * @returns 创建的登录日志
   */
  async create(value: SysLoginLogInsert) {
    const [row] = await this.db.insert(sysLoginLog).values(value).returning()
    return row
  }

  /**
   * 获取登录日志分页列表
   *
   * @param query 查询参数
   * @returns 登录日志分页列表
   */
  async getPageList(query: SysLoginLogQuery) {
    const where = mergeAnd(
      eqIf(sysLoginLog.loginType, query.loginType),
      eqIf(sysLoginLog.platform, query.platform)
    )
    const { pageSize, offset } = Pager.getPagination(query)
    const [list, summary] = await Promise.all([
      this.db
        .select()
        .from(sysLoginLog)
        .where(where)
        .orderBy(asc(sysLoginLog.sort), desc(sysLoginLog.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(sysLoginLog).where(where),
    ])
    return { list, total: summary[0]?.count ?? 0 }
  }
}

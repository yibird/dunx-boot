import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { sysCaptchaLog, type SysCaptchaLogInsert } from '@/schemas'
import { desc, asc, count } from 'drizzle-orm'
import { eqIf, mergeAnd } from '@/infra/db'
import { Pager } from '@/infra/model'
import type { SysCaptchaLogQuery } from './model'

export class SysCaptchaLogRepository {
  constructor(readonly db: BunSQLDatabase) {}

  async create(value: SysCaptchaLogInsert) {
    const [row] = await this.db.insert(sysCaptchaLog).values(value).returning()
    return row
  }

  async getPageList(query: SysCaptchaLogQuery) {
    const where = mergeAnd(eqIf(sysCaptchaLog.captchaType, query.captchaType))
    const { pageSize, offset } = Pager.getPagination(query)
    const [list, summary] = await Promise.all([
      this.db
        .select()
        .from(sysCaptchaLog)
        .where(where)
        .orderBy(asc(sysCaptchaLog.sort), desc(sysCaptchaLog.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(sysCaptchaLog).where(where),
    ])
    return { list, total: summary[0]?.count ?? 0 }
  }
}

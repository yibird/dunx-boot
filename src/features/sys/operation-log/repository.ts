import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { eqIf, ilikeIf, mergeAnd } from '@/infra/db'
import { sysOperationLog } from '@/schemas'
import type { SysOperationLogQuery } from './schema'

/**
 * 操作日志仓储
 */
export class SysOperationLogRepository extends CrudRepository<
  typeof sysOperationLog
> {
  constructor() {
    super({
      table: sysOperationLog,
      cache: true,
      defaultOrderBy: [desc(sysOperationLog.createdAt)],
    })
  }

  override getQueryOptions(query: Partial<SysOperationLogQuery>) {
    return {
      where: mergeAnd(
        eqIf(sysOperationLog.module, query.module),
        eqIf(sysOperationLog.action, query.action),
        ilikeIf(sysOperationLog.username, query.username),
        eqIf(sysOperationLog.success, query.success)
      ),
    }
  }
}

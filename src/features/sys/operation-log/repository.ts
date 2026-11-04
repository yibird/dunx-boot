import { desc } from 'drizzle-orm'
import { CrudRepository } from '@/infra/crud'
import { sysOperationLog } from '@/schemas'

/**
 * 操作日志仓储
 */
export class SysOperationLogRepository extends CrudRepository<
  typeof sysOperationLog
> {
  constructor() {
    super({
      table: sysOperationLog,
      queryOptions: {
        orderBy: [desc(sysOperationLog.createdAt)],
      },
    })
  }
}

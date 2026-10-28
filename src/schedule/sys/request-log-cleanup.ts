import { Logger } from '@dunx/core'
import { BunSQLDatabase } from 'drizzle-orm/bun-sql/postgres'
import { Cron } from '@dunx/infra/schedule'
import { AppConfigService } from '@/infra/config'

/**
 * 按保留天数清理 `sys_request_log`。
 *
 * 单节点、进程内调度；每天 03:00 执行一次。用 CTE 拿删除条数，避免
 * `DELETE ... RETURNING` 把整批行读回来。
 */
export class SysRequestLogCleanup {
  constructor(
    private readonly db: BunSQLDatabase,
    private readonly logger: Logger,
    private readonly config: AppConfigService
  ) {}

  @Cron('0 3 * * *')
  async cleanup() {
    const days = this.config.values.requestLog.retentionDays
    try {
      // 注入的 token 类型是 BunSQLDatabase 类；drizzle() 返回值才带 $client。
      const client = (this.db as unknown as { $client: Bun.SQL }).$client
      const [row] = (await client`
        with removed as (
          delete from sys_request_log
          where create_at < now() - make_interval(days => ${days})
          returning 1
        )
        select count(*)::int as deleted from removed
      `) as unknown as [{ deleted: number }]
      this.logger.info('已清理过期请求日志', {
        retentionDays: days,
        deleted: row?.deleted ?? 0,
      })
    } catch (error) {
      // 清理失败不能影响其他定时任务，记录后交给下一轮。
      this.logger.error('清理过期请求日志失败', error)
    }
  }
}

import { Module } from '@dunx/core'
import { SysRequestLogCleanup } from './request-log-cleanup'

/**
 * 系统级定时任务：provider 里的 `@Cron` 方法会被 ScheduleModule 装载。
 */
@Module({
  imports: [],
  providers: [SysRequestLogCleanup],
})
export class SysScheduleModule {}

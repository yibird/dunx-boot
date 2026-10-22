import type { DynamicModule } from '@dunx/core'
import { ScheduleModule } from '@dunx/infra/schedule'
import { AppConfigService } from '../config'

/**
 * 定时任务基础设施：启动时装载全图的 `@Cron` / `@Interval` / `@OnceOnBoot`。
 *
 * 进程内、单节点；需要「整个集群只跑一次」的调度应改用队列的 job scheduler。
 * `global: true` 让 `ScheduleRegistry` 在业务模块里也注入得到（框架自己不加）。
 */
export const AppScheduleModule: DynamicModule = {
  ...ScheduleModule.forRootAsync({
    useFactory: (config: AppConfigService) => ({
      enabled: config.values.schedule.enabled,
      tz: config.values.schedule.tz,
      keepAlive: config.values.schedule.keepAlive,
    }),
    inject: [AppConfigService] as const,
  }),
  global: true,
}

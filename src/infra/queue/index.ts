import type { DynamicModule } from '@dunx/core'
import { QueueModule } from '@dunx/infra/queue'
import { AppConfigService } from '../config'

/**
 * Queue Module
 *
 * 默认只绑定发布侧（`JobPublisher` / `JobEvents` / `QueueConnection`），
 * 本进程不消费；`queue.consume` 为 `true` 时开启 worker 并发现 `@JobHandler`，
 * 为 `'if-any'` 时「有 handler 才消费」，没有 handler 的进程不会因此启动失败。
 * `global: true` 让发布方与系统指标模块共用 `JobPublisher` / `QueueMetrics`。
 *
 * `metrics` 固定开启且只写在模块设置里：设置对象在容器建立之前就定下来了，
 * 读不到配置；指标由 dashboard 的队列面板消费，所以这里不给它留旋钮。
 */
export const AppQueueModule: DynamicModule = {
  ...QueueModule.forRootAsync(
    {
      useFactory: (config: AppConfigService) => {
        const { url } = config.values.redis
        if (!url) return {}
        const { prefix, consume } = config.values.queue
        return { url, prefix, consume }
      },
      inject: [AppConfigService] as const,
    },
    { metrics: true }
  ),
  global: true,
}

import { z } from 'zod'

/**
 * 队列配置（bullmq over Redis）。
 */
export const queue = z.object({
  /**
   * bullmq 的 key 前缀
   */
  prefix: z.string().default('bull'),
  /**
   * 是否在本进程开启 worker 消费；默认 false，Web 进程只发布。
   *
   * `'if-any'` = 图里有 `@JobHandler` 就消费，没有就只发布并告警；
   * `true` = 必须有 handler，否则启动失败。
   */
  consume: z.union([z.boolean(), z.literal('if-any')]).default(false),
})

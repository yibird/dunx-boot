import { z } from 'zod'

/**
 * 健康检查配置。
 */
export const health = z.object({
  /**
   * 单个探针的超时时间（毫秒）
   */
  timeoutMs: z.coerce.number().int().positive().default(2000),
  /**
   * 关停前先让 readiness 失败多久（毫秒），用于负载均衡摘流
   */
  drainDelayMs: z.coerce.number().int().nonnegative().default(0),
  /**
   * RSS 上限（字节），超过时 liveness 报告 down
   */
  memoryMaxRssBytes: z.coerce
    .number()
    .int()
    .positive()
    .default(1024 * 1024 * 1024),
})

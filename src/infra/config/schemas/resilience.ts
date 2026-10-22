import { z } from 'zod'

/**
 * 限流配置(固定窗口,按调用方地址计数)
 *
 * 它是 `resilience` 下的一块，不是顶层节：读 `resilience.throttle.limit`。
 */
export const throttle = z.object({
  /**
   * 每个窗口允许的请求数
   */
  limit: z.coerce.number().int().positive().default(1000),
  /**
   * 窗口长度（秒）
   */
  windowSeconds: z.coerce.number().int().positive().default(60),
  /**
   * 是否返回 `RateLimit-*` / `Retry-After` 响应头
   */
  headers: z.coerce.boolean().default(true),
})

/**
 * 容错配置（超时 + 重试 + 限流）。
 *
 * 限流也是弹性的一类：它对外的承诺和超时、重试是同一个——过载时降级而不是
 * 塌掉，所以挂在 `resilience` 下面，不再单开一节。
 */
export const resilience = z.object({
  /**
   * 单次尝试的超时时间（毫秒）；0 表示不限制
   */
  timeoutMs: z.coerce.number().int().nonnegative().default(5000),
  /**
   * 首次失败后的重试次数
   */
  maxRetries: z.coerce.number().int().nonnegative().default(2),
  /**
   * 重试基础间隔（毫秒）
   */
  retryDelayMs: z.coerce.number().int().positive().default(200),
  /**
   * 限流配置
   */
  throttle,
})

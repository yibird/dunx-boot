import { z } from 'zod'

/**
 * 出站 HTTP 客户端配置（`@dunx/http/client`）。
 */
export const client = z.object({
  /**
   * 基础地址；相对路径的调用会拼接在它后面
   */
  baseUrl: z.string().default(''),
  /**
   * 单次请求超时时间（毫秒）
   */
  timeoutMs: z.coerce.number().int().positive().default(30_000),
  /**
   * 失败后的重试次数
   */
  maxRetries: z.coerce.number().int().nonnegative().default(1),
  /**
   * 重试基础间隔（毫秒）
   */
  retryDelayMs: z.coerce.number().int().positive().default(200),
})

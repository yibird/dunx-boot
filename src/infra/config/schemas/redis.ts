import { z } from 'zod'

/**
 * Redis 连接配置。
 */
export const redis = z.object({
  /**
   * 连接串；未配置时回退 `REDIS_URL` / `VALKEY_URL`，再回退 `valkey://localhost:6379`
   */
  url: z.string().optional(),
  /**
   * 建立连接的超时时间（毫秒）
   */
  connectionTimeout: z.coerce.number().int().positive().default(2_000),
  /**
   * 连接断开后的重试次数；调低让降级路径快速失败
   */
  maxRetries: z.coerce.number().int().nonnegative().default(1),
  /**
   * 未连接时是否把命令入队等待；关闭则立即失败，缓存/限流更快降级
   */
  enableOfflineQueue: z.coerce.boolean().default(false),
  /**
   * 是否在启动时 `PING`：开启则不可达时启动失败；默认关闭，缺失时应用降级运行
   */
  eager: z.coerce.boolean().default(false),
})

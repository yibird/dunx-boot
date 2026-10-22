import { z } from 'zod'

/**
 * 定时任务配置（`@Cron` / `@Interval` / `@OnceOnBoot`）。
 */
export const schedule = z.object({
  /**
   * 是否在启动时装载所有定时任务
   */
  enabled: z.coerce.boolean().default(true),
  /**
   * 未显式指定时区时 `@Cron` 使用的默认时区
   */
  tz: z.string().default('UTC'),
  /**
   * 是否保持事件循环存活；关闭后进程在无事可做时按时退出
   */
  keepAlive: z.coerce.boolean().default(true),
})

import { z } from 'zod'

/**
 * 邮件配置。
 *
 * 未配置 transport 时使用日志传输（不真正发送），`dryRun` 可强制走日志，
 * 因此没有邮件服务商凭据也能启动与联调。
 */
export const email = z.object({
  /**
   * 默认发件人；未配置时由调用方在消息里指定
   */
  from: z.string().optional(),
  /**
   * 只记录不发送
   */
  dryRun: z.coerce.boolean().default(true),
  /**
   * 每秒最多发送封数；0 表示不限速
   */
  maxPerSecond: z.coerce.number().int().nonnegative().default(0),
})

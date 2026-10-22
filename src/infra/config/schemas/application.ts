import { z } from 'zod'

/**
 * 应用元信息配置 schema。
 */
export const application = z.object({
  /**
   * 应用名称。
   */
  name: z.string().min(1).default('dunx-boot'),
  /**
   * 应用版本号。
   */
  version: z.string().default('0.1.0'),
})

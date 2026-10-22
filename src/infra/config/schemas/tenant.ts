import { z } from 'zod'
import { DEFAULT_TENANT_ID } from '@/constants'

/**
 * 多租户配置。
 */
export const tenant = z.object({
  /**
   * 默认租户id
   *
   * 与 `tenant_id` 列默认值、无会话时的 `getTenantId()` 回退值保持一致。
   */
  defaultId: z.string().default(DEFAULT_TENANT_ID),
})

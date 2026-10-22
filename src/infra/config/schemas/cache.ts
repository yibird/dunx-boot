import { z } from 'zod'

/**
 * 缓存配置
 */
export const cache = z.object({
  local: z
    .object({
      /**
       * 是否启用本地缓存
       */
      enabled: z.coerce.boolean().default(true),
      /**
       * 最大缓存key数量
       */
      max: z.coerce.number().int().positive().optional().default(1000),
      /**
       * 默认过期时间(单位毫秒)
       */
      ttl: z.coerce.number().int().positive().optional(),
    })
    .default({ enabled: true, max: 1000 }),
  remote: z
    .object({
      /**
       * 是否启用远程缓存
       */
      enabled: z.coerce.boolean().default(true),
      /**
       * 最大缓存key数量
       */
      max: z.coerce.number().int().positive().optional().default(1000),
      /**
       * 默认过期时间(单位毫秒)
       */
      ttl: z.coerce.number().int().positive().optional(),
    })
    .default({ enabled: true, max: 1000 }),
  /**
   * 默认过期时间(单位毫秒)
   */
  ttl: z.coerce.number().int().positive().optional(),
  /**
   * 查询缓存 key 前缀(可选,默认为项目名)
   */
  prefix: z.string().optional(),
})

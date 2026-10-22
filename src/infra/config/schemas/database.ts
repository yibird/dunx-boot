import { z } from 'zod'

export const database = z.object({
  /**
   * PostgreSQL 数据库连接地址
   */
  url: z.string().min(1, '数据库连接地址不能为空'),
  /**
   * 连接池最大连接数
   */
  max: z.number().int().positive().default(4),
  /**
   * 连接最大空闲时间，单位为秒
   */
  idleTimeout: z.number().nonnegative().default(30),
  /**
   * 连接最大生命周期，单位为秒
   */
  maxLifetime: z.number().nonnegative().default(0),
  /**
   * 建立数据库连接的超时时间，单位为秒
   */
  connectionTimeout: z.number().positive().default(5),
  /**
   * 是否启用预处理语句
   */
  prepare: z.boolean().default(true),
  /**
   * 是否将 PostgreSQL 整数返回为 bigint
   */
  bigint: z.boolean().default(false),
  /**
   * 是否开启缓存
   */
  cache: z.boolean().default(false),
})

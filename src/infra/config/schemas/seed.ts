import { z } from 'zod'

/**
 * 数据种子配置（`runSeeds`）。
 */
export const seed = z.object({
  /**
   * 种子文件目录
   */
  dir: z.string().default('src/seeds'),
  /**
   * 种子文件匹配模式
   */
  pattern: z.string().default('*.seeder.{ts,js}'),
  /**
   * 记录已执行种子的日志表
   */
  table: z.string().default('dunx_seeds'),
})

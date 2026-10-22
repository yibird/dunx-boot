import { z } from 'zod'

/**
 * 图片处理配置（编码质量与尺寸上限）。
 */
export const images = z.object({
  /**
   * 默认编码质量（1-100）
   */
  quality: z.coerce.number().int().min(1).max(100).default(82),
  /**
   * 允许解码的最大像素数（宽 × 高）
   */
  maxPixels: z.coerce.number().int().positive().optional(),
  /**
   * 缩放宽度上限
   */
  maxWidth: z.coerce.number().int().positive().optional(),
  /**
   * 缩放高度上限
   */
  maxHeight: z.coerce.number().int().positive().optional(),
})

import { z } from 'zod'

/**
 * 文件存储配置（本地磁盘后端）。
 */
export const files = z.object({
  /**
   * 本地存储根目录；相对路径以进程工作目录为基准
   */
  root: z.string().default('storage/uploads'),
  /**
   * 分片大小（字节）。
   */
  chunkSize: z
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  /**
   * 单个文件的最大大小（字节）。
   */
  maxFileSize: z
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024 * 1024),
  /**
   * 上传任务有效期（秒）；过期任务在再次访问时清理。
   */
  uploadTtlSeconds: z
    .number()
    .int()
    .positive()
    .default(24 * 60 * 60),
})

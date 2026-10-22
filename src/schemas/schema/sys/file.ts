import { bigint, pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * sys_file —— 文件元数据表。
 *
 * 记录所有通过上传接口写入的文件信息，按租户与 hash 唯一以支持租户内秒传。
 */
export const sysFile = pgTable('sys_file', {
  /**
   * SHA-256 内容哈希（秒传依据）。
   */
  hash: varchar('hash', { length: 64 }).notNull(),
  /**
   * 原始文件名。
   */
  name: varchar('name', { length: 255 }).notNull(),
  /**
   * 文件大小（字节）。
   */
  size: bigint('size', { mode: 'number' }).notNull(),
  /**
   * MIME 类型。
   */
  mime: varchar('mime', { length: 127 }).notNull(),
  /**
   * 存储引擎中的 key。
   */
  storageKey: varchar('storage_key', { length: 512 }).notNull(),
  /**
   * 使用的存储驱动（local / s3）。
   */
  driver: varchar('driver', { length: 10 }).notNull(),
  ...commonColumns,
})

export type SysFileTable = typeof sysFile
export type SysFile = typeof sysFile.$inferSelect

import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'

/**
 * 系统消息已读表
 */
export const sysMessageRead = pgTable(
  'sys_message_read',
  {
    /**
     * 消息ID
     */
    messageId: bigintString('message_id').notNull(),
    /**
     * 已读用户ID
     */
    userId: bigintString('user_id').notNull(),
    /**
     * 已读时间
     */
    readAt: datetime('read_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('sys_message_read_user_idx').on(table.userId),
    uniqueIndex('sys_message_read_pair_uidx')
      .on(table.messageId, table.userId)
      .where(sql`${table.deleted} = false`),
  ]
)

export type SysMessageReadTable = typeof sysMessageRead
export type SysMessageRead = typeof sysMessageRead.$inferSelect
export type SysMessageReadInsert = typeof sysMessageRead.$inferInsert

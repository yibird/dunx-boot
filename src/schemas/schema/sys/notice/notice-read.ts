import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'

/**
 * 通知公告已读表
 *
 * 每个用户对每条通知最多一行，重复写入由唯一索引拦截。
 */
export const sysNoticeRead = pgTable(
  'sys_notice_read',
  {
    /**
     * 通知ID
     */
    noticeId: bigintString('notice_id').notNull(),
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
    index('sys_notice_read_user_idx').on(table.userId),
    uniqueIndex('sys_notice_read_pair_uidx')
      .on(table.noticeId, table.userId)
      .where(sql`${table.deleted} = false`),
  ]
)

export type SysNoticeReadTable = typeof sysNoticeRead
export type SysNoticeRead = typeof sysNoticeRead.$inferSelect
export type SysNoticeReadInsert = typeof sysNoticeRead.$inferInsert

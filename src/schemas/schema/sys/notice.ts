import { index, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { SYS_NOTICE_SEND_MODE, SYS_NOTICE_TYPE } from '@/constants'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'

/**
 * 通知公告表
 */
export const sysNotice = pgTable(
  'sys_notice',
  {
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content'),
    noticeType: smallint('notice_type')
      .default(SYS_NOTICE_TYPE.Notice)
      .notNull(),
    sendMode: varchar('send_mode', { length: 20 })
      .default(SYS_NOTICE_SEND_MODE.Immediate)
      .notNull(),
    scheduledAt: datetime('scheduled_at'),
    publishTime: datetime('publish_time'),
    publisherId: bigintString('publisher_id'),
    publisherName: varchar('publisher_name', { length: 64 }),
    ...commonColumns,
  },
  (table) => [
    index('sys_notice_type_idx').on(table.noticeType),
    index('sys_notice_publish_time_idx').on(table.publishTime),
  ]
)

/**
 * 通知公告已读表
 *
 * 每个用户对每条通知最多一行，重复写入由唯一索引拦截。
 */
export const sysNoticeRead = pgTable('sys_notice_read', {
  noticeId: bigintString('notice_id').notNull(),
  userId: bigintString('user_id').notNull(),
  readAt: datetime('read_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  ...commonColumns,
})

export type SysNoticeTable = typeof sysNotice
export type SysNotice = typeof sysNotice.$inferSelect
export type SysNoticeInsert = typeof sysNotice.$inferInsert

export type SysNoticeReadTable = typeof sysNoticeRead
export type SysNoticeRead = typeof sysNoticeRead.$inferSelect
export type SysNoticeReadInsert = typeof sysNoticeRead.$inferInsert

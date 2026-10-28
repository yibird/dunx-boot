import { index, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import { SYS_NOTICE_SEND_MODE, SYS_NOTICE_TYPE } from '@/constants'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'

/**
 * 通知公告表
 */
export const sysNotice = pgTable(
  'sys_notice',
  {
    /**
     * 通知标题
     */
    title: varchar('title', { length: 200 }).notNull(),
    /**
     * 通知内容
     */
    content: text('content'),
    /**
     * 通知类型：1 通知 2 公告
     */
    noticeType: smallint('notice_type')
      .default(SYS_NOTICE_TYPE.Notice)
      .notNull(),
    /**
     * 发送方式：immediate 立即发送 scheduled 定时发送
     */
    sendMode: varchar('send_mode', { length: 20 })
      .default(SYS_NOTICE_SEND_MODE.Immediate)
      .notNull(),
    /**
     * 定时发送时间；立即发送时为空
     */
    scheduledAt: datetime('scheduled_at'),
    /**
     * 实际发布时间；为空表示尚未发布
     */
    publishTime: datetime('publish_time'),
    /**
     * 发布人ID；系统发布时为空
     */
    publisherId: bigintString('publisher_id'),
    /**
     * 发布人名称
     */
    publisherName: varchar('publisher_name', { length: 64 }),
    ...commonColumns,
  },
  (table) => [
    index('sys_notice_type_idx').on(table.noticeType),
    index('sys_notice_publish_time_idx').on(table.publishTime),
  ]
)

export type SysNoticeTable = typeof sysNotice
export type SysNotice = typeof sysNotice.$inferSelect
export type SysNoticeInsert = typeof sysNotice.$inferInsert

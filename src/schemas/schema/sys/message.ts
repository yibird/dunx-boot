import { pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import { SYS_MESSAGE_LEVEL, SYS_MESSAGE_TYPE } from '@/constants'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import { sql } from 'drizzle-orm'

/**
 * 系统消息表
 */
export const sysMessage = pgTable('sys_message', {
  /**
   * 消息标题
   */
  title: varchar('title', { length: 200 }).notNull(),
  /**
   * 消息内容
   */
  content: text('content'),
  /**
   * 消息类型：1 系统通知 2 待办事项 3 告警消息
   */
  messageType: smallint('message_type')
    .default(SYS_MESSAGE_TYPE.SystemNotice)
    .notNull(),
  /**
   * 消息级别：1 普通 2 重要 3 紧急
   */
  level: smallint('level').default(SYS_MESSAGE_LEVEL.Normal).notNull(),
  /**
   * 发送人ID；系统发送时为空
   */
  senderId: bigintString('sender_id'),
  /**
   * 发送人名称
   */
  senderName: varchar('sender_name', { length: 64 }),
  /**
   * 关联业务类型，待办事项/告警消息用于跳转
   */
  bizType: varchar('biz_type', { length: 64 }),
  /**
   * 关联业务ID
   */
  bizId: bigintString('biz_id'),
  /**
   * 发布时间；为空表示尚未发布
   */
  publishTime: datetime('publish_time'),
  /**
   * 过期时间；过期后不再展示
   */
  expireTime: datetime('expire_time'),
  ...commonColumns,
})

/**
 * 系统消息已读表
 */
export const sysMessageRead = pgTable('sys_message_read', {
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
})

export type SysMessageTable = typeof sysMessage
export type SysMessage = typeof sysMessage.$inferSelect
export type SysMessageInsert = typeof sysMessage.$inferInsert

export type SysMessageReadTable = typeof sysMessageRead
export type SysMessageRead = typeof sysMessageRead.$inferSelect
export type SysMessageReadInsert = typeof sysMessageRead.$inferInsert

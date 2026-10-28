import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema, type BaseQuery } from '@/infra/model'
import { commonColumnsSchema, sysMessage, sysMessageRead } from '@/schemas'
import { SYS_MESSAGE_LEVEL, SYS_MESSAGE_TYPE } from '@/constants'

export const sysMessageSchema = createSelectSchema(sysMessage, {
  title: z
    .string()
    .meta({ description: '消息标题', examples: ['系统维护通知'] }),
  content: z
    .string()
    .nullable()
    .meta({ description: '消息内容', examples: ['系统将于今晚 22:00 维护'] }),
  messageType: z
    .union([
      z.literal(SYS_MESSAGE_TYPE.SystemNotice),
      z.literal(SYS_MESSAGE_TYPE.Todo),
      z.literal(SYS_MESSAGE_TYPE.Alert),
    ])
    .meta({
      description: '消息类型：1 系统通知 2 待办事项 3 告警消息',
      examples: [SYS_MESSAGE_TYPE.SystemNotice],
    }),
  level: z
    .union([
      z.literal(SYS_MESSAGE_LEVEL.Normal),
      z.literal(SYS_MESSAGE_LEVEL.Important),
      z.literal(SYS_MESSAGE_LEVEL.Urgent),
    ])
    .meta({
      description: '消息级别：1 普通 2 重要 3 紧急',
      examples: [SYS_MESSAGE_LEVEL.Normal],
    }),
  senderId: z
    .string()
    .nullable()
    .meta({ description: '发送人ID；系统发送时为空', examples: ['1'] }),
  senderName: z
    .string()
    .nullable()
    .meta({ description: '发送人名称', examples: ['admin'] }),
  bizType: z
    .string()
    .nullable()
    .meta({ description: '关联业务类型', examples: ['sys:user'] }),
  bizId: z
    .string()
    .nullable()
    .meta({ description: '关联业务ID', examples: ['1'] }),
  publishTime: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '发布时间；为空表示尚未发布',
      examples: ['2026-07-20 17:39:30'],
    }),
  expireTime: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '过期时间；过期后不再展示',
      examples: ['2026-08-20 17:39:30'],
    }),
  ...commonColumnsSchema,
}).meta({ id: 'SysMessage' })

export const sysMessageReadSchema = createSelectSchema(sysMessageRead, {
  messageId: z.string().meta({ description: '消息ID', examples: ['1'] }),
  userId: z.string().meta({ description: '已读用户ID', examples: ['1'] }),
  readAt: z
    .union([z.string(), z.date()])
    .meta({ description: '已读时间', examples: ['2026-07-20 17:39:30'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysMessageRead' })

/**
 * 时间字段的可空时间戳
 */
const timestampSchema = z.union([z.string(), z.date()]).nullable().optional()

/**
 * 消息新增入参
 */
export const SysMessageCreateReq = createInsertSchema(sysMessage, {
  publishTime: timestampSchema,
  expireTime: timestampSchema,
})
  .pick({
    title: true,
    content: true,
    messageType: true,
    level: true,
    bizType: true,
    bizId: true,
    publishTime: true,
    expireTime: true,
    remark: true,
    sort: true,
    dataStatus: true,
  })
  .meta({ id: 'SysMessageCreateReq' })
export type SysMessageCreateReq = z.infer<typeof SysMessageCreateReq>

/**
 * 消息更新入参（`version` 必填，乐观锁契约）
 */
export const SysMessageUpdateReq = createUpdateSchema(sysMessage, {
  publishTime: timestampSchema,
  expireTime: timestampSchema,
})
  .pick({
    title: true,
    content: true,
    messageType: true,
    level: true,
    bizType: true,
    bizId: true,
    publishTime: true,
    expireTime: true,
    remark: true,
    sort: true,
    dataStatus: true,
  })
  .meta({ id: 'SysMessageUpdateReq' })
export type SysMessageUpdateReq = z.infer<typeof SysMessageUpdateReq>

/**
 * 消息分页查询入参
 */
export const SysMessageQuery = baseQuerySchema
  .extend({
    title: z.string().optional().meta({ description: '消息标题（模糊查询）' }),
    messageType: z.number().optional(),
    level: z.number().optional(),
    bizType: z.string().optional().meta({ description: '关联业务类型' }),
    dataStatus: z.boolean().optional().meta({ description: '数据状态' }),
  })
  .meta({ id: 'SysMessageQuery' })
export type SysMessageQuery = z.infer<typeof SysMessageQuery>

export interface SysMessageReadQuery extends Partial<BaseQuery> {
  messageId?: string
  userId?: string
}

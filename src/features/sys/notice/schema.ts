import { z } from 'zod'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-orm/zod'
import { baseQuerySchema, type BaseQuery } from '@/infra/model'
import { commonColumnsSchema, sysNotice, sysNoticeRead } from '@/schemas'
import { SYS_NOTICE_SEND_MODE, SYS_NOTICE_TYPE } from '@/constants'

export const sysNoticeSchema = createSelectSchema(sysNotice, {
  title: z
    .string()
    .meta({ description: '通知标题', examples: ['国庆放假公告'] }),
  content: z
    .string()
    .nullable()
    .meta({ description: '通知内容', examples: ['公司于 10 月 1 日放假'] }),
  noticeType: z
    .union([
      z.literal(SYS_NOTICE_TYPE.Notice),
      z.literal(SYS_NOTICE_TYPE.Announcement),
    ])
    .meta({
      description: '通知类型：1 通知 2 公告',
      examples: [SYS_NOTICE_TYPE.Notice],
    }),
  sendMode: z
    .union([
      z.literal(SYS_NOTICE_SEND_MODE.Immediate),
      z.literal(SYS_NOTICE_SEND_MODE.Scheduled),
    ])
    .meta({
      description: '发送方式：immediate 立即发送 scheduled 定时发送',
      examples: [SYS_NOTICE_SEND_MODE.Immediate],
    }),
  scheduledAt: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '定时发送时间；立即发送时为空',
      examples: ['2026-07-20 17:39:30'],
    }),
  publishTime: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({
      description: '实际发布时间；为空表示尚未发布',
      examples: ['2026-07-20 17:39:30'],
    }),
  publisherId: z
    .string()
    .nullable()
    .meta({ description: '发布人ID；系统发布时为空', examples: ['1'] }),
  publisherName: z
    .string()
    .nullable()
    .meta({ description: '发布人名称', examples: ['admin'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysNotice' })

export const sysNoticeReadSchema = createSelectSchema(sysNoticeRead, {
  noticeId: z.string().meta({ description: '通知ID', examples: ['1'] }),
  userId: z.string().meta({ description: '已读用户ID', examples: ['1'] }),
  readAt: z
    .union([z.string(), z.date()])
    .meta({ description: '已读时间', examples: ['2026-07-20 17:39:30'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysNoticeRead' })

/**
 * 通知类型：1 通知 2 公告
 */
const noticeTypeSchema = z
  .union([
    z.literal(SYS_NOTICE_TYPE.Notice),
    z.literal(SYS_NOTICE_TYPE.Announcement),
  ])
  .meta({
    description: '通知类型：1 通知 2 公告',
    examples: [SYS_NOTICE_TYPE.Notice],
  })

/**
 * 发送方式：immediate 立即发送 scheduled 定时发送
 */
const sendModeSchema = z
  .union([
    z.literal(SYS_NOTICE_SEND_MODE.Immediate),
    z.literal(SYS_NOTICE_SEND_MODE.Scheduled),
  ])
  .meta({
    description: '发送方式：immediate 立即发送 scheduled 定时发送',
    examples: [SYS_NOTICE_SEND_MODE.Immediate],
  })

/**
 * 时间字段的可空时间戳
 */
const timestampSchema = z.union([z.string(), z.date()]).nullable().optional()

/**
 * 通知新增入参
 */
export const SysNoticeCreateReq = createInsertSchema(sysNotice, {
  scheduledAt: timestampSchema,
  publishTime: timestampSchema,
})
  .pick({
    title: true,
    content: true,
    noticeType: true,
    sendMode: true,
    scheduledAt: true,
    publishTime: true,
    remark: true,
    sort: true,
    dataStatus: true,
  })
  .extend({
    noticeType: noticeTypeSchema.optional(),
    sendMode: sendModeSchema.optional(),
  })
  .meta({ id: 'SysNoticeCreateReq' })
export type SysNoticeCreateReq = z.infer<typeof SysNoticeCreateReq>

/**
 * 通知更新入参（`version` 必填，乐观锁契约）
 */
export const SysNoticeUpdateReq = createUpdateSchema(sysNotice, {
  scheduledAt: timestampSchema,
  publishTime: timestampSchema,
})
  .pick({
    title: true,
    content: true,
    noticeType: true,
    sendMode: true,
    scheduledAt: true,
    publishTime: true,
    remark: true,
    sort: true,
    dataStatus: true,
  })
  .extend({
    noticeType: noticeTypeSchema.optional(),
    sendMode: sendModeSchema.optional(),
    version: z.number().int().positive(),
  })
  .meta({ id: 'SysNoticeUpdateReq' })
export type SysNoticeUpdateReq = z.infer<typeof SysNoticeUpdateReq>

/**
 * 通知分页查询入参
 */
export const SysNoticeQuery = baseQuerySchema
  .extend({
    title: z.string().optional().meta({ description: '通知标题（模糊查询）' }),
    noticeType: noticeTypeSchema.optional(),
    sendMode: sendModeSchema.optional(),
    dataStatus: z.boolean().optional().meta({ description: '数据状态' }),
  })
  .meta({ id: 'SysNoticeQuery' })
export type SysNoticeQuery = z.infer<typeof SysNoticeQuery>

export interface SysNoticeReadQuery extends Partial<BaseQuery> {
  noticeId?: string
  userId?: string
}

import {
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { datetime } from '@/schemas/types'
import { SYS_TASK_STATUS } from '@/features/sys/task/constant'

/**
 * 通用任务表
 *
 * 各业务模块的异步任务（导入、导出、同步、批处理等）共用这一张表，
 * 用 `taskModule` 区分来源模块、`taskStatus` 跟踪执行进度。
 */
export const sysTask = pgTable(
  'sys_task',
  {
    /**
     * 任务名称。
     */
    taskName: varchar('task_name', { length: 200 }).notNull(),
    /**
     * 任务模块，例如 sys:user、ai:chat。
     */
    taskModule: varchar('task_module', { length: 64 }).notNull(),
    /**
     * 任务类型，例如 import、export、sync。
     */
    taskType: varchar('task_type', { length: 64 }),
    /**
     * 任务状态：1 待执行 2 执行中 3 成功 4 失败 5 已取消。
     */
    taskStatus: smallint('task_status')
      .default(SYS_TASK_STATUS.PENDING)
      .notNull(),
    /**
     * 执行进度百分比，0-100。
     */
    progress: smallint('progress').default(0).notNull(),
    /**
     * 任务参数快照。
     */
    params: jsonb('params'),
    /**
     * 任务执行结果。
     */
    result: jsonb('result'),
    /**
     * 失败原因。
     */
    errorMessage: text('error_message'),
    /**
     * 已重试次数。
     */
    retryCount: integer('retry_count').default(0).notNull(),
    /**
     * 开始执行时间。
     */
    startTime: datetime('start_time'),
    /**
     * 结束时间（成功或失败）。
     */
    endTime: datetime('end_time'),
    /**
     * 链路追踪 ID。
     */
    traceId: varchar('trace_id', { length: 64 }),
    ...commonColumns,
  },
  (table) => [
    index('sys_task_module_status_idx').on(table.taskModule, table.taskStatus),
  ]
)

export const sysTaskSchema = createSelectSchema(sysTask, {
  taskName: z
    .string()
    .meta({ description: '任务名称', examples: ['用户数据导出'] }),
  taskModule: z
    .string()
    .meta({ description: '任务模块', examples: ['sys:user'] }),
  taskType: z
    .string()
    .nullable()
    .meta({ description: '任务类型', examples: ['export'] }),
  taskStatus: z
    .union([
      z.literal(SYS_TASK_STATUS.PENDING),
      z.literal(SYS_TASK_STATUS.RUNNING),
      z.literal(SYS_TASK_STATUS.SUCCESS),
      z.literal(SYS_TASK_STATUS.FAILED),
      z.literal(SYS_TASK_STATUS.CANCELED),
    ])
    .meta({
      description: '任务状态：1 待执行 2 执行中 3 成功 4 失败 5 已取消',
      examples: [SYS_TASK_STATUS.PENDING],
    }),
  progress: z
    .number()
    .int()
    .meta({ description: '执行进度百分比，0-100', examples: [0, 100] }),
  params: z
    .object({})
    .nullable()
    .optional()
    .meta({ description: '任务参数快照' }),
  result: z
    .object({})
    .nullable()
    .optional()
    .meta({ description: '任务执行结果' }),
  errorMessage: z
    .string()
    .nullable()
    .meta({ description: '失败原因', examples: ['目标文件不存在'] }),
  retryCount: z
    .number()
    .int()
    .meta({ description: '已重试次数', examples: [0, 3] }),
  startTime: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '开始执行时间', examples: ['2026-07-20 17:39:30'] }),
  endTime: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '结束时间', examples: ['2026-07-20 17:40:10'] }),
  traceId: z
    .string()
    .nullable()
    .meta({ description: '链路追踪 ID', examples: ['01JABCDEF1234567890XYZ'] }),
  ...commonColumnsSchema,
}).meta({ id: 'SysTask' })

export type SysTaskTable = typeof sysTask
export type SysTask = typeof sysTask.$inferSelect
export type SysTaskInsert = typeof sysTask.$inferInsert

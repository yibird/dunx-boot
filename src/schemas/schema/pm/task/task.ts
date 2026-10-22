import { index, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import { PM_TASK_PRIORITY, PM_TASK_STATUS } from '@/features/pm/task/constant'

/**
 * 任务表：`parent_id` 指向父任务，为空表示顶层任务。
 */
export const pmTask = pgTable(
  'pm_task',
  {
    /**
     * 所属项目主键。
     */
    projectId: bigintString('project_id').notNull(),
    /**
     * 父任务主键；为空表示顶层任务。
     */
    parentId: bigintString('parent_id'),
    /**
     * 任务标题。
     */
    title: varchar('title', { length: 200 }).notNull(),
    /**
     * 任务描述。
     */
    description: text('description'),
    /**
     * 任务状态：1 待办 2 进行中 3 已完成 4 已取消。
     */
    status: smallint('status').default(PM_TASK_STATUS.TODO).notNull(),
    /**
     * 任务优先级：1 低 2 中 3 高 4 紧急。
     */
    priority: smallint('priority').default(PM_TASK_PRIORITY.MEDIUM).notNull(),
    /**
     * 任务负责人。
     */
    assigneeId: bigintString('assignee_id'),
    /**
     * 计划开始时间。
     */
    startDate: datetime('start_date'),
    /**
     * 截止时间。
     */
    dueDate: datetime('due_date'),
    /**
     * 实际完成时间。
     */
    completedAt: datetime('completed_at'),
    /**
     * 任务进度百分比，0-100。
     */
    progress: smallint('progress').default(0).notNull(),
    ...commonColumns,
  },
  (table) => [
    index('pm_task_project_status_idx').on(table.projectId, table.status),
    index('pm_task_parent_idx').on(table.parentId),
    index('pm_task_assignee_idx').on(table.assigneeId),
  ]
)

export const pmTaskSchema = createSelectSchema(pmTask, {
  projectId: z.string().meta({ description: '所属项目主键', examples: ['1'] }),
  parentId: z
    .string()
    .nullable()
    .meta({ description: '父任务主键；为空表示顶层任务', examples: ['1'] }),
  title: z.string().meta({ description: '任务标题', examples: ['设计登录页'] }),
  description: z
    .string()
    .nullable()
    .meta({ description: '任务描述', examples: ['完成登录页视觉稿'] }),
  status: z
    .union([
      z.literal(PM_TASK_STATUS.TODO),
      z.literal(PM_TASK_STATUS.IN_PROGRESS),
      z.literal(PM_TASK_STATUS.DONE),
      z.literal(PM_TASK_STATUS.CANCELED),
    ])
    .meta({
      description: '任务状态：1 待办 2 进行中 3 已完成 4 已取消',
      examples: [PM_TASK_STATUS.TODO],
    }),
  priority: z
    .union([
      z.literal(PM_TASK_PRIORITY.LOW),
      z.literal(PM_TASK_PRIORITY.MEDIUM),
      z.literal(PM_TASK_PRIORITY.HIGH),
      z.literal(PM_TASK_PRIORITY.URGENT),
    ])
    .meta({
      description: '任务优先级：1 低 2 中 3 高 4 紧急',
      examples: [PM_TASK_PRIORITY.MEDIUM],
    }),
  assigneeId: z
    .string()
    .nullable()
    .meta({ description: '任务负责人', examples: ['1'] }),
  startDate: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '计划开始时间', examples: ['2026-07-20 00:00:00'] }),
  dueDate: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '截止时间', examples: ['2026-07-25 00:00:00'] }),
  completedAt: z
    .union([z.string(), z.date()])
    .nullable()
    .meta({ description: '实际完成时间', examples: ['2026-07-24 17:39:30'] }),
  progress: z
    .number()
    .int()
    .meta({ description: '任务进度百分比，0-100', examples: [0, 100] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTask' })

export type PmTaskTable = typeof pmTask
export type PmTask = typeof pmTask.$inferSelect
export type PmTaskInsert = typeof pmTask.$inferInsert

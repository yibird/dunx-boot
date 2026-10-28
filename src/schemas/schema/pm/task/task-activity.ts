import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import { PM_TASK_ACTIVITY_ACTION } from '@/constants'

/**
 * 任务变更动态表：记录谁在什么时候对任务做了什么改动。
 *
 * `field`/`before_value`/`after_value` 描述单字段变更，`content` 存可读描述。
 */
export const pmTaskActivity = pgTable(
  'pm_task_activity',
  {
    /**
     * 所属项目主键，便于按项目拉动态流。
     */
    projectId: bigintString('project_id').notNull(),
    /**
     * 任务主键。
     */
    taskId: bigintString('task_id').notNull(),
    /**
     * 操作人主键。
     */
    userId: bigintString('user_id'),
    /**
     * 动作：create 创建 update 更新 status 变更状态 assign 变更负责人
     * comment 新增评论 attachment 新增附件 delete 删除任务。
     */
    action: varchar('action', { length: 32 }).notNull(),
    /**
     * 变更字段名；整对象或非字段级动作时为空。
     */
    field: varchar('field', { length: 64 }),
    /**
     * 变更前的值。
     */
    beforeValue: text('before_value'),
    /**
     * 变更后的值。
     */
    afterValue: text('after_value'),
    /**
     * 可读的动态描述。
     */
    content: text('content'),
    ...commonColumns,
  },
  (table) => [
    index('pm_task_activity_task_idx').on(table.taskId),
    index('pm_task_activity_project_idx').on(table.projectId),
  ]
)

export const pmTaskActivitySchema = createSelectSchema(pmTaskActivity, {
  projectId: z.string().meta({ description: '所属项目主键', examples: ['1'] }),
  taskId: z.string().meta({ description: '任务主键', examples: ['1'] }),
  userId: z
    .string()
    .nullable()
    .meta({ description: '操作人主键', examples: ['1'] }),
  action: z
    .union([
      z.literal(PM_TASK_ACTIVITY_ACTION.Create),
      z.literal(PM_TASK_ACTIVITY_ACTION.Update),
      z.literal(PM_TASK_ACTIVITY_ACTION.Status),
      z.literal(PM_TASK_ACTIVITY_ACTION.Assign),
      z.literal(PM_TASK_ACTIVITY_ACTION.Comment),
      z.literal(PM_TASK_ACTIVITY_ACTION.Attachment),
      z.literal(PM_TASK_ACTIVITY_ACTION.Delete),
    ])
    .meta({
      description:
        '动作：create 创建 update 更新 status 变更状态 assign 变更负责人 comment 新增评论 attachment 新增附件 delete 删除任务',
      examples: [PM_TASK_ACTIVITY_ACTION.Status],
    }),
  field: z
    .string()
    .nullable()
    .meta({ description: '变更字段名', examples: ['status'] }),
  beforeValue: z
    .string()
    .nullable()
    .meta({ description: '变更前的值', examples: ['1'] }),
  afterValue: z
    .string()
    .nullable()
    .meta({ description: '变更后的值', examples: ['3'] }),
  content: z
    .string()
    .nullable()
    .meta({ description: '可读的动态描述', examples: ['将状态改为已完成'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTaskActivity' })

export type PmTaskActivityTable = typeof pmTaskActivity
export type PmTaskActivity = typeof pmTaskActivity.$inferSelect
export type PmTaskActivityInsert = typeof pmTaskActivity.$inferInsert

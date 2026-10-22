import { index, pgTable, text } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 任务评论表：`parent_id` 指向被回复的评论。
 */
export const pmTaskComment = pgTable(
  'pm_task_comment',
  {
    /**
     * 任务主键。
     */
    taskId: bigintString('task_id').notNull(),
    /**
     * 评论人主键。
     */
    userId: bigintString('user_id').notNull(),
    /**
     * 被回复的评论主键；为空表示顶层评论。
     */
    parentId: bigintString('parent_id'),
    /**
     * 评论内容。
     */
    content: text('content').notNull(),
    ...commonColumns,
  },
  (table) => [
    index('pm_task_comment_task_idx').on(table.taskId),
    index('pm_task_comment_parent_idx').on(table.parentId),
  ]
)

export const pmTaskCommentSchema = createSelectSchema(pmTaskComment, {
  taskId: z.string().meta({ description: '任务主键', examples: ['1'] }),
  userId: z.string().meta({ description: '评论人主键', examples: ['1'] }),
  parentId: z
    .string()
    .nullable()
    .meta({
      description: '被回复的评论主键；为空表示顶层评论',
      examples: ['1'],
    }),
  content: z
    .string()
    .meta({ description: '评论内容', examples: ['这里建议用分页'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTaskComment' })

export type PmTaskCommentTable = typeof pmTaskComment
export type PmTaskComment = typeof pmTaskComment.$inferSelect
export type PmTaskCommentInsert = typeof pmTaskComment.$inferInsert

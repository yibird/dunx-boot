import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 任务标签关联表：同一任务对同一标签只有一条有效记录。
 */
export const pmTaskLabelRel = pgTable(
  'pm_task_label_rel',
  {
    /**
     * 任务主键。
     */
    taskId: bigintString('task_id').notNull(),
    /**
     * 标签主键。
     */
    labelId: bigintString('label_id').notNull(),
    ...commonColumns,
  },
  (table) => [
    index('pm_task_label_rel_label_idx').on(table.labelId),
    uniqueIndex('pm_task_label_rel_pair_uidx')
      .on(table.taskId, table.labelId)
      .where(sql`${table.deleted} = false`),
  ]
)

export const pmTaskLabelRelSchema = createSelectSchema(pmTaskLabelRel, {
  taskId: z.string().meta({ description: '任务主键', examples: ['1'] }),
  labelId: z.string().meta({ description: '标签主键', examples: ['1'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTaskLabelRel' })

export type PmTaskLabelRelTable = typeof pmTaskLabelRel
export type PmTaskLabelRel = typeof pmTaskLabelRel.$inferSelect
export type PmTaskLabelRelInsert = typeof pmTaskLabelRel.$inferInsert

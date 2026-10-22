import { sql } from 'drizzle-orm'
import { pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 任务标签定义表：标签按项目隔离，同一项目内名称唯一。
 */
export const pmTaskLabel = pgTable(
  'pm_task_label',
  {
    /**
     * 所属项目主键。
     */
    projectId: bigintString('project_id').notNull(),
    /**
     * 标签名称。
     */
    labelName: varchar('label_name', { length: 64 }).notNull(),
    /**
     * 标签颜色（十六进制色值）。
     */
    color: varchar('color', { length: 20 }),
    ...commonColumns,
  },
  (table) => [
    uniqueIndex('pm_task_label_name_uidx')
      .on(table.projectId, table.labelName)
      .where(sql`${table.deleted} = false`),
  ]
)

export const pmTaskLabelSchema = createSelectSchema(pmTaskLabel, {
  projectId: z.string().meta({ description: '所属项目主键', examples: ['1'] }),
  labelName: z.string().meta({ description: '标签名称', examples: ['前端'] }),
  color: z
    .string()
    .nullable()
    .meta({ description: '标签颜色', examples: ['#1677ff'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTaskLabel' })

export type PmTaskLabelTable = typeof pmTaskLabel
export type PmTaskLabel = typeof pmTaskLabel.$inferSelect
export type PmTaskLabelInsert = typeof pmTaskLabel.$inferInsert

import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 任务附件关联表：文件本体在 `sys_file`，这里只存引用与文件名快照。
 */
export const pmTaskAttachment = pgTable(
  'pm_task_attachment',
  {
    /**
     * 任务主键。
     */
    taskId: bigintString('task_id').notNull(),
    /**
     * 文件主键，对应 sys_file。
     */
    fileId: bigintString('file_id').notNull(),
    /**
     * 文件名快照，便于文件被删除后仍能展示。
     */
    fileName: varchar('file_name', { length: 255 }),
    ...commonColumns,
  },
  (table) => [
    index('pm_task_attachment_file_idx').on(table.fileId),
    uniqueIndex('pm_task_attachment_pair_uidx')
      .on(table.taskId, table.fileId)
      .where(sql`${table.deleted} = false`),
  ]
)

export const pmTaskAttachmentSchema = createSelectSchema(pmTaskAttachment, {
  taskId: z.string().meta({ description: '任务主键', examples: ['1'] }),
  fileId: z
    .string()
    .meta({ description: '文件主键，对应 sys_file', examples: ['1'] }),
  fileName: z
    .string()
    .nullable()
    .meta({ description: '文件名快照', examples: ['设计稿.png'] }),
  ...commonColumnsSchema,
}).meta({ id: 'PmTaskAttachment' })

export type PmTaskAttachmentTable = typeof pmTaskAttachment
export type PmTaskAttachment = typeof pmTaskAttachment.$inferSelect
export type PmTaskAttachmentInsert = typeof pmTaskAttachment.$inferInsert

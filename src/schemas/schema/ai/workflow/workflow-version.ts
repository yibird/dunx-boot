import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  AiWorkflowVersionStatus,
  type AiWorkflowVersionStatusValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流版本。
 *
 * 每次保存/发布都产生一个不可变版本，节点与连线挂在版本下，
 * 因此运行记录始终能还原到当时那张图。
 */
export const aiWorkflowVersion = pgTable(
  'ai_workflow_version',
  {
    /**
     * 所属工作流主键。
     */
    workflowId: bigintString('workflow_id').notNull(),
    /**
     * 版本序号，工作流内自增。
     */
    versionNo: integer('version_no').notNull(),
    /**
     * 版本名称。
     */
    versionName: varchar('version_name', { length: 100 }),
    /**
     * 版本说明 / 变更日志。
     */
    description: varchar('description', { length: 500 }),
    /**
     * 版本状态：draft 草稿、published 已发布、archived 已归档。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowVersionStatusValue>()
      .default(AiWorkflowVersionStatus.DRAFT)
      .notNull(),
    /**
     * 发布时间；未发布时为空。
     */
    publishedAt: datetime('published_at'),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_version_workflow_idx').on(table.workflowId),
    uniqueIndex('ai_workflow_version_no_uidx')
      .on(table.workflowId, table.versionNo)
      .where(sql`${table.deleted} = false`),
  ]
)

export type AiWorkflowVersionTable = typeof aiWorkflowVersion
export type AiWorkflowVersion = typeof aiWorkflowVersion.$inferSelect
export type AiWorkflowVersionInsert = typeof aiWorkflowVersion.$inferInsert

import { sql } from 'drizzle-orm'
import {
  index,
  jsonb,
  pgTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import {
  AiWorkflowApiAuthType,
  AiWorkflowApiStatus,
  type AiWorkflowApiAuthTypeValue,
  type AiWorkflowApiStatusValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流对外 API。
 *
 * 把某个工作流暴露成 HTTP 端点；`path` + `method` 在租户内唯一，
 * 绑定的版本为空时使用工作流的当前发布版本。
 */
export const aiWorkflowApi = pgTable(
  'ai_workflow_api',
  {
    /**
     * 工作流主键。
     */
    workflowId: bigintString('workflow_id').notNull(),
    /**
     * 绑定的版本主键；为空表示跟随工作流的发布版本。
     */
    versionId: bigintString('version_id'),
    /**
     * API 名称。
     */
    name: varchar('name', { length: 100 }).notNull(),
    /**
     * API 描述。
     */
    description: varchar('description', { length: 500 }),
    /**
     * API 路径。
     */
    path: varchar('path', { length: 255 }).notNull(),
    /**
     * HTTP 方法。
     */
    method: varchar('method', { length: 10 }).default('POST').notNull(),
    /**
     * API 状态：active 启用、disabled 停用。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowApiStatusValue>()
      .default(AiWorkflowApiStatus.ACTIVE)
      .notNull(),
    /**
     * 鉴权方式：none、api_key、jwt。
     */
    authType: varchar('auth_type', { length: 20 })
      .$type<AiWorkflowApiAuthTypeValue>()
      .default(AiWorkflowApiAuthType.NONE)
      .notNull(),
    /**
     * 入参 schema。
     */
    inputSchema: jsonb('input_schema')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    /**
     * 出参 schema。
     */
    outputSchema: jsonb('output_schema')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    /**
     * API 级扩展配置。
     */
    config: jsonb('config')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_api_workflow_idx').on(table.workflowId),
    uniqueIndex('ai_workflow_api_path_uidx')
      .on(table.tenantId, table.method, table.path)
      .where(sql`${table.deleted} = false`),
  ]
)

export type AiWorkflowApiTable = typeof aiWorkflowApi
export type AiWorkflowApi = typeof aiWorkflowApi.$inferSelect
export type AiWorkflowApiInsert = typeof aiWorkflowApi.$inferInsert

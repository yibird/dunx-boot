import { index, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import {
  AiWorkflowEdgeType,
  type AiWorkflowEdgeTypeValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流连线。
 *
 * 用 `sourceKey` / `targetKey` 引用同一版本内的节点标识，
 * `sourceHandle` / `targetHandle` 区分多出口/多入口端口。
 */
export const aiWorkflowEdge = pgTable(
  'ai_workflow_edge',
  {
    /**
     * 所属版本主键。
     */
    versionId: bigintString('version_id').notNull(),
    /**
     * 源节点标识。
     */
    sourceKey: varchar('source_key', { length: 64 }).notNull(),
    /**
     * 目标节点标识。
     */
    targetKey: varchar('target_key', { length: 64 }).notNull(),
    /**
     * 源端口标识；单出口节点为空。
     */
    sourceHandle: varchar('source_handle', { length: 64 }),
    /**
     * 目标端口标识；单入口节点为空。
     */
    targetHandle: varchar('target_handle', { length: 64 }),
    /**
     * 连线类型：default 普通、condition 条件、error 异常。
     */
    edgeType: varchar('edge_type', { length: 20 })
      .$type<AiWorkflowEdgeTypeValue>()
      .default(AiWorkflowEdgeType.DEFAULT)
      .notNull(),
    /**
     * 连线上的展示标签。
     */
    label: varchar('label', { length: 100 }),
    /**
     * 条件连线的判断表达式。
     */
    conditionExpr: jsonb('condition_expr')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_edge_version_idx').on(table.versionId),
    index('ai_workflow_edge_source_idx').on(table.versionId, table.sourceKey),
  ]
)

export type AiWorkflowEdgeTable = typeof aiWorkflowEdge
export type AiWorkflowEdge = typeof aiWorkflowEdge.$inferSelect
export type AiWorkflowEdgeInsert = typeof aiWorkflowEdge.$inferInsert

import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  real,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import type { AiWorkflowNodeTypeValue } from '@/features/ai/workflow/constant'

/**
 * 工作流节点。
 *
 * 节点挂在某个版本下，`nodeKey` 是该版本内的稳定标识，连线用它引用节点。
 */
export const aiWorkflowNode = pgTable(
  'ai_workflow_node',
  {
    /**
     * 所属版本主键。
     */
    versionId: bigintString('version_id').notNull(),
    /**
     * 版本内唯一的节点标识，供连线引用。
     */
    nodeKey: varchar('node_key', { length: 64 }).notNull(),
    /**
     * 节点类型。
     */
    nodeType: varchar('node_type', { length: 50 })
      .$type<AiWorkflowNodeTypeValue>()
      .notNull(),
    /**
     * 节点名称。
     */
    name: varchar('name', { length: 100 }).notNull(),
    /**
     * 节点说明。
     */
    description: varchar('description', { length: 500 }),
    /**
     * 画布横坐标。
     */
    positionX: real('position_x').default(0).notNull(),
    /**
     * 画布纵坐标。
     */
    positionY: real('position_y').default(0).notNull(),
    /**
     * 父节点标识；循环、迭代等容器节点的子节点使用。
     */
    parentKey: varchar('parent_key', { length: 64 }),
    /**
     * 节点参数，结构由节点类型决定。
     */
    config: jsonb('config')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    /**
     * 是否禁用；禁用节点执行时跳过。
     */
    disabled: boolean('disabled').default(false).notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_node_version_idx').on(table.versionId),
    uniqueIndex('ai_workflow_node_key_uidx')
      .on(table.versionId, table.nodeKey)
      .where(sql`${table.deleted} = false`),
  ]
)

export type AiWorkflowNodeTable = typeof aiWorkflowNode
export type AiWorkflowNode = typeof aiWorkflowNode.$inferSelect
export type AiWorkflowNodeInsert = typeof aiWorkflowNode.$inferInsert

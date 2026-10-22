import { index, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  AiWorkflowStatus,
  AiWorkflowTriggerType,
  AiWorkflowVisibility,
  type AiWorkflowStatusValue,
  type AiWorkflowTriggerTypeValue,
  type AiWorkflowVisibilityValue,
} from '@/features/ai/workflow/constant'

/**
 * AI 工作流主体。
 *
 * 图结构按版本存在 `ai_workflow_version` 及其节点、连线子表中，
 * 这里只保留草稿/发布版本的指针与工作流级别的元信息。
 */
export const aiWorkflow = pgTable(
  'ai_workflow',
  {
    /**
     * 所有者用户主键。
     */
    ownerUserId: bigintString('owner_user_id'),
    /**
     * 工作流名称。
     */
    name: varchar('name', { length: 100 }).notNull(),
    /**
     * 工作流描述。
     */
    description: varchar('description', { length: 500 }),
    /**
     * 图标。
     */
    icon: varchar('icon', { length: 255 }),
    /**
     * 可见性：private 仅所有者可用，public 租户内公开。
     */
    visibility: varchar('visibility', { length: 20 })
      .$type<AiWorkflowVisibilityValue>()
      .default(AiWorkflowVisibility.PRIVATE)
      .notNull(),
    /**
     * 工作流状态：draft 草稿、published 已发布、archived 已归档、disabled 已停用。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowStatusValue>()
      .default(AiWorkflowStatus.DRAFT)
      .notNull(),
    /**
     * 触发方式：manual 手动、api 接口、schedule 定时、webhook、event 事件。
     */
    triggerType: varchar('trigger_type', { length: 20 })
      .$type<AiWorkflowTriggerTypeValue>()
      .default(AiWorkflowTriggerType.MANUAL)
      .notNull(),
    /**
     * 当前草稿版本主键。
     */
    draftVersionId: bigintString('draft_version_id'),
    /**
     * 当前发布版本主键。
     */
    publishedVersionId: bigintString('published_version_id'),
    /**
     * 最近一次发布时间。
     */
    publishedAt: datetime('published_at'),
    /**
     * 标签。
     */
    tags: jsonb('tags').$type<string[]>().default([]).notNull(),
    /**
     * 工作流级别的扩展配置。
     */
    config: jsonb('config')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_owner_idx').on(table.ownerUserId),
    index('ai_workflow_status_idx').on(table.status),
  ]
)

export type AiWorkflowTable = typeof aiWorkflow
export type AiWorkflow = typeof aiWorkflow.$inferSelect
export type AiWorkflowInsert = typeof aiWorkflow.$inferInsert

import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  AiWorkflowNodeRunStatus,
  AiWorkflowNodeType,
  type AiWorkflowNodeRunStatusValue,
  type AiWorkflowNodeTypeValue,
} from '@/features/ai/workflow/constant'

/**
 * 节点运行记录。
 *
 * 一次工作流运行中每个被执行（或被跳过）的节点各一行。
 */
export const aiWorkflowNodeRun = pgTable(
  'ai_workflow_node_run',
  {
    /**
     * 所属运行主键。
     */
    runId: bigintString('run_id').notNull(),
    /**
     * 节点标识，对应 `ai_workflow_node.node_key`。
     */
    nodeKey: varchar('node_key', { length: 64 }).notNull(),
    /**
     * 节点类型快照。
     */
    nodeType: varchar('node_type', { length: 50 })
      .$type<AiWorkflowNodeTypeValue>()
      .default(AiWorkflowNodeType.START)
      .notNull(),
    /**
     * 节点运行状态。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowNodeRunStatusValue>()
      .default(AiWorkflowNodeRunStatus.PENDING)
      .notNull(),
    /**
     * 执行序号。
     */
    sequence: integer('sequence').default(0).notNull(),
    /**
     * 节点输入。
     */
    inputs: jsonb('inputs').$type<Record<string, unknown>>(),
    /**
     * 节点输出。
     */
    outputs: jsonb('outputs').$type<Record<string, unknown>>(),
    /**
     * 失败原因。
     */
    errorMessage: text('error_message'),
    /**
     * 已重试次数。
     */
    retryCount: integer('retry_count').default(0).notNull(),
    /**
     * 开始时间。
     */
    startedAt: datetime('started_at'),
    /**
     * 结束时间。
     */
    finishedAt: datetime('finished_at'),
    /**
     * 耗时（毫秒）。
     */
    durationMs: integer('duration_ms'),
    /**
     * 输入 Token 数，LLM 节点使用。
     */
    inputTokens: bigint('input_tokens', { mode: 'number' })
      .default(0)
      .notNull(),
    /**
     * 输出 Token 数，LLM 节点使用。
     */
    outputTokens: bigint('output_tokens', { mode: 'number' })
      .default(0)
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_node_run_run_seq_idx').on(table.runId, table.sequence),
    index('ai_workflow_node_run_run_status_idx').on(table.runId, table.status),
  ]
)

export type AiWorkflowNodeRunTable = typeof aiWorkflowNodeRun
export type AiWorkflowNodeRun = typeof aiWorkflowNodeRun.$inferSelect
export type AiWorkflowNodeRunInsert = typeof aiWorkflowNodeRun.$inferInsert

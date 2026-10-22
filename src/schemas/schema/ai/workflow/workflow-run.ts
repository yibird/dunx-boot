import {
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
  AiWorkflowRunStatus,
  AiWorkflowTriggerType,
  type AiWorkflowRunStatusValue,
  type AiWorkflowTriggerTypeValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流运行记录。
 *
 * 一次运行固定绑定当时的版本；节点级明细在 `ai_workflow_node_run`，
 * 日志在 `ai_workflow_run_log`。
 */
export const aiWorkflowRun = pgTable(
  'ai_workflow_run',
  {
    /**
     * 工作流主键。
     */
    workflowId: bigintString('workflow_id').notNull(),
    /**
     * 本次运行使用的版本主键。
     */
    versionId: bigintString('version_id'),
    /**
     * 触发者用户主键；定时/事件触发时可为空。
     */
    userId: bigintString('user_id'),
    /**
     * 触发方式。
     */
    triggerType: varchar('trigger_type', { length: 20 })
      .$type<AiWorkflowTriggerTypeValue>()
      .default(AiWorkflowTriggerType.MANUAL)
      .notNull(),
    /**
     * 通过工作流 API 触发时的 API 主键。
     */
    apiId: bigintString('api_id'),
    /**
     * 通过 API Key 触发时使用的密钥主键。
     */
    apiKeyId: bigintString('api_key_id'),
    /**
     * 运行状态。
     */
    status: varchar('status', { length: 20 })
      .$type<AiWorkflowRunStatusValue>()
      .default(AiWorkflowRunStatus.PENDING)
      .notNull(),
    /**
     * 运行输入。
     */
    inputs: jsonb('inputs')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    /**
     * 运行输出。
     */
    outputs: jsonb('outputs').$type<Record<string, unknown>>(),
    /**
     * 失败原因。
     */
    errorMessage: text('error_message'),
    /**
     * 开始时间。
     */
    startedAt: datetime('started_at'),
    /**
     * 结束时间。
     */
    finishedAt: datetime('finished_at'),
    /**
     * 总耗时（毫秒）。
     */
    durationMs: integer('duration_ms'),
    /**
     * 链路追踪 ID。
     */
    traceId: varchar('trace_id', { length: 64 }),
    /**
     * 父运行主键；子工作流节点触发的运行使用。
     */
    parentRunId: bigintString('parent_run_id'),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_run_workflow_status_idx').on(
      table.workflowId,
      table.status
    ),
    index('ai_workflow_run_workflow_time_idx').on(
      table.workflowId,
      table.createdAt
    ),
    index('ai_workflow_run_trace_idx').on(table.traceId),
  ]
)

export type AiWorkflowRunTable = typeof aiWorkflowRun
export type AiWorkflowRun = typeof aiWorkflowRun.$inferSelect
export type AiWorkflowRunInsert = typeof aiWorkflowRun.$inferInsert

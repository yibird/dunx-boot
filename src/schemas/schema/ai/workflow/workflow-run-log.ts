import { index, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import {
  AiWorkflowLogLevel,
  type AiWorkflowLogLevelValue,
} from '@/features/ai/workflow/constant'

/**
 * 工作流运行日志。
 *
 * 运行级或节点级的结构化日志，按时间顺序读取。
 */
export const aiWorkflowRunLog = pgTable(
  'ai_workflow_run_log',
  {
    /**
     * 所属运行主键。
     */
    runId: bigintString('run_id').notNull(),
    /**
     * 所属节点运行主键；运行级日志为空。
     */
    nodeRunId: bigintString('node_run_id'),
    /**
     * 节点标识快照；运行级日志为空。
     */
    nodeKey: varchar('node_key', { length: 64 }),
    /**
     * 日志级别：debug、info、warn、error。
     */
    level: varchar('level', { length: 10 })
      .$type<AiWorkflowLogLevelValue>()
      .default(AiWorkflowLogLevel.INFO)
      .notNull(),
    /**
     * 日志消息。
     */
    message: text('message').notNull(),
    /**
     * 结构化附加信息。
     */
    detail: jsonb('detail').$type<Record<string, unknown>>(),
    ...commonColumns,
  },
  (table) => [
    index('ai_workflow_run_log_run_idx').on(table.runId),
    index('ai_workflow_run_log_node_run_idx').on(table.nodeRunId),
  ]
)

export type AiWorkflowRunLogTable = typeof aiWorkflowRunLog
export type AiWorkflowRunLog = typeof aiWorkflowRunLog.$inferSelect
export type AiWorkflowRunLogInsert = typeof aiWorkflowRunLog.$inferInsert

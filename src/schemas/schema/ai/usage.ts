import { bigint, jsonb, numeric, pgTable, varchar } from 'drizzle-orm/pg-core'
import { bigintString } from '../../types'
import { commonColumns } from '../../common'
/** AI 请求的来源类型。 */
export const AiRequestType = {
  CHAT: 'chat',
  EMBEDDING: 'embedding',
  RERANK: 'rerank',
} as const

/** AI 请求来源类型值。 */
export type AiRequestTypeValue =
  (typeof AiRequestType)[keyof typeof AiRequestType]

/**
 * AI Token 与成本流水
 */
export const aiUsageRecord = pgTable('ai_usage_record', {
  userId: bigintString('user_id'),
  providerId: bigintString('provider_id'),
  modelId: bigintString('model_id'),
  agentId: bigintString('agent_id'),
  agentSessionId: bigintString('agent_session_id'),
  agentMessageId: bigintString('agent_message_id'),
  knowledgeBaseId: bigintString('knowledge_base_id'),
  chatId: bigintString('chat_id'),
  sessionId: bigintString('session_id'),
  messageId: bigintString('message_id'),
  requestId: varchar('request_id', { length: 128 }),
  traceId: varchar('trace_id', { length: 64 }),
  requestType: varchar('request_type', { length: 20 })
    .$type<AiRequestTypeValue>()
    .notNull(),
  status: varchar('status', { length: 20 }).default('success').notNull(),
  providerSnapshot: varchar('provider_snapshot', { length: 100 }),
  modelSnapshot: varchar('model_snapshot', { length: 255 }),
  inputTokens: bigint('input_tokens', { mode: 'number' }).default(0).notNull(),
  outputTokens: bigint('output_tokens', { mode: 'number' })
    .default(0)
    .notNull(),
  cachedInputTokens: bigint('cached_input_tokens', { mode: 'number' })
    .default(0)
    .notNull(),
  reasoningTokens: bigint('reasoning_tokens', { mode: 'number' })
    .default(0)
    .notNull(),
  totalTokens: bigint('total_tokens', { mode: 'number' }).default(0).notNull(),
  inputCost: numeric('input_cost', { precision: 20, scale: 8 })
    .default('0')
    .notNull(),
  outputCost: numeric('output_cost', { precision: 20, scale: 8 })
    .default('0')
    .notNull(),
  totalCost: numeric('total_cost', { precision: 20, scale: 8 })
    .default('0')
    .notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  latencyMs: bigint('latency_ms', { mode: 'number' }),
  timeToFirstTokenMs: bigint('time_to_first_token_ms', { mode: 'number' }),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiUsageRecordTable = typeof aiUsageRecord

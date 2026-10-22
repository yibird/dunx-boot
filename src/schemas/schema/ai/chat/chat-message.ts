import {
  Ai_MESSAGE_STATUS,
  type AiMessageRoleValue,
  type AiMessageStatusValue,
} from '@/features/ai/chat/constant'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
/**
 * Chat 会话消息，支持流式生成、工具消息和消息分支。
 */
export const aiChatMessage = pgTable('ai_chat_message', {
  sessionId: bigintString('session_id').notNull(),
  parentId: bigintString('parent_id'),
  userId: bigintString('user_id'),
  sequence: integer('sequence').notNull(),
  role: varchar('role', { length: 20 }).$type<AiMessageRoleValue>().notNull(),
  status: varchar('status', { length: 20 })
    .$type<AiMessageStatusValue>()
    .default(Ai_MESSAGE_STATUS.PENDING)
    .notNull(),
  content: text('content').default('').notNull(),
  parts: jsonb('parts')
    .$type<Record<string, unknown>[]>()
    .default([])
    .notNull(),
  toolName: varchar('tool_name', { length: 100 }),
  toolCallId: varchar('tool_call_id', { length: 255 }),
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  modelId: bigintString('model_id'),
  finishReason: varchar('finish_reason', { length: 50 }),
  errorCode: varchar('error_code', { length: 64 }),
  errorMessage: text('error_message'),
  requestId: varchar('request_id', { length: 128 }),
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
  latencyMs: integer('latency_ms'),
  ...commonColumns,
})

export type AiChatMessageTable = typeof aiChatMessage

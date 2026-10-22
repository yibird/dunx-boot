import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '../../../common'
import { bigintString, datetime } from '@/schemas/types'
import {
  Ai_MESSAGE_STATUS,
  type AiMessageRoleValue,
  type AiMessageStatusValue,
} from '@/features/ai/chat/constant'

/**
 * Agent 的独立会话，可由 Chat 入口创建，也可由 Agent API 直接创建。
 */
export const aiAgentSession = pgTable('ai_agent_session', {
  agentId: bigintString('agent_id').notNull(),
  ownerUserId: bigintString('owner_user_id').notNull(),
  chatSessionId: bigintString('chat_session_id'),
  modelId: bigintString('model_id'),
  systemPromptSnapshot: text('system_prompt_snapshot'),
  sourceType: varchar('source_type', { length: 20 })
    .default('direct')
    .notNull(),
  title: varchar('title', { length: 255 }).default('新 Agent 会话').notNull(),
  summary: text('summary'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  totalTokens: bigint('total_tokens', { mode: 'number' }).default(0).notNull(),
  lastMessageAt: datetime('last_message_at'),
  lastMessagePreview: varchar('last_message_preview', { length: 500 }),
  archived: boolean('archived').default(false).notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

/**
 * Agent 会话消息，保存提示词快照、检索引用和模型响应状态。
 */
export const aiAgentMessage = pgTable('ai_agent_message', {
  sessionId: bigintString('session_id').notNull(),
  parentId: bigintString('parent_id'),
  userId: bigintString('user_id'),
  modelId: bigintString('model_id'),
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
  citations: jsonb('citations')
    .$type<Record<string, unknown>[]>()
    .default([])
    .notNull(),
  toolName: varchar('tool_name', { length: 100 }),
  toolCallId: varchar('tool_call_id', { length: 255 }),
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

export type AiAgentSessionTable = typeof aiAgentSession
export type AiAgentMessageTable = typeof aiAgentMessage

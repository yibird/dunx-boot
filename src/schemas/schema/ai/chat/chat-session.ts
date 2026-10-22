import { commonColumns } from '@/schemas/common'
import { bigintString, datetime } from '@/schemas/types'
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * Chat 会话
 */
export const aiChatSession = pgTable('ai_chat_session', {
  chatId: bigintString('chat_id'),
  ownerUserId: bigintString('owner_user_id').notNull(),
  agentId: bigintString('agent_id'),
  modelId: bigintString('model_id'),
  title: varchar('title', { length: 255 }).default('新对话').notNull(),
  summary: text('summary'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  totalTokens: bigint('total_tokens', { mode: 'number' }).default(0).notNull(),
  lastMessageAt: datetime('last_message_at'),
  lastMessagePreview: varchar('last_message_preview', { length: 500 }),
  pinned: boolean('pinned').default(false).notNull(),
  archived: boolean('archived').default(false).notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiChatSessionTable = typeof aiChatSession

import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * ai Chat表Schema
 */
export const aiChat = pgTable('ai_chat', {
  ownerUserId: bigintString('owner_user_id'),
  agentId: bigintString('agent_id'),
  modelId: bigintString('model_id'),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  icon: varchar('icon', { length: 255 }),
  chatType: varchar('chat_type', { length: 20 }).default('agent').notNull(),
  visibility: varchar('visibility', { length: 20 })
    .default('private')
    .notNull(),
  systemPrompt: text('system_prompt'),
  welcomeMessage: text('welcome_message'),
  suggestedQuestions: jsonb('suggested_questions')
    .$type<string[]>()
    .default([])
    .notNull(),
  temperature: real('temperature'),
  topP: real('top_p'),
  maxOutputTokens: integer('max_output_tokens'),
  memoryEnabled: boolean('memory_enabled').default(true).notNull(),
  config: jsonb('config')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiChatTable = typeof aiChat
export type AiChat = typeof aiChat.$inferSelect

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
import { bigintString, datetime } from '@/schemas/types'

/**
 * 用户可配置的 Agent。Agent 负责组合提示词、模型和知识库。
 */
export const aiAgent = pgTable('ai_agent', {
  ownerUserId: bigintString('owner_user_id'),
  modelId: bigintString('model_id'),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  icon: varchar('icon', { length: 255 }),
  visibility: varchar('visibility', { length: 20 })
    .default('private')
    .notNull(),
  systemPrompt: text('system_prompt').notNull(),
  welcomeMessage: text('welcome_message'),
  suggestedQuestions: jsonb('suggested_questions')
    .$type<string[]>()
    .default([])
    .notNull(),
  temperature: real('temperature').default(0.7).notNull(),
  topP: real('top_p').default(1).notNull(),
  maxOutputTokens: integer('max_output_tokens'),
  memoryEnabled: boolean('memory_enabled').default(true).notNull(),
  publishedAt: datetime('published_at'),
  config: jsonb('config')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

/** Agent 与知识库的多对多关系及检索参数。 */
export const aiAgentKnowledgeBase = pgTable('ai_agent_knowledge_base', {
  agentId: bigintString('agent_id').notNull(),
  knowledgeBaseId: bigintString('knowledge_base_id').notNull(),
  retrievalTopK: integer('retrieval_top_k').default(5).notNull(),
  similarityThreshold: real('similarity_threshold').default(0.7).notNull(),
  rerankModelId: bigintString('rerank_model_id'),
  queryRewrite: boolean('query_rewrite').default(false).notNull(),
  citationEnabled: boolean('citation_enabled').default(true).notNull(),
  metadataFilter: jsonb('metadata_filter')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiAgentTable = typeof aiAgent
export type AiAgent = typeof aiAgent.$inferSelect
export type AiAgentKnowledgeBaseTable = typeof aiAgentKnowledgeBase

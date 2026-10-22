import {
  bigint,
  integer,
  jsonb,
  pgTable,
  real,
  varchar,
} from 'drizzle-orm/pg-core'
import { bigintString } from '@/schemas/types'
import { commonColumns } from '@/schemas/common'

/** AI 知识库的向量存储类型。 */
export const AiVectorStoreType = {
  PGVECTOR: 'pgvector',
  EXTERNAL: 'external',
} as const

/** 向量存储类型值。 */
export type AiVectorStoreTypeValue =
  (typeof AiVectorStoreType)[keyof typeof AiVectorStoreType]

/** RAG 知识库配置。一个知识库对应一个 embedding 空间。 */
export const aiKnowledgeBase = pgTable('ai_knowledge_base', {
  ownerUserId: bigintString('owner_user_id'),
  embeddingModelId: bigintString('embedding_model_id'),
  rerankModelId: bigintString('rerank_model_id'),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  icon: varchar('icon', { length: 255 }),
  vectorStore: varchar('vector_store', { length: 20 })
    .$type<AiVectorStoreTypeValue>()
    .default(AiVectorStoreType.PGVECTOR)
    .notNull(),
  collectionName: varchar('collection_name', { length: 255 })
    .default('')
    .notNull(),
  embeddingDimensions: integer('embedding_dimensions'),
  chunkStrategy: varchar('chunk_strategy', { length: 32 })
    .default('recursive')
    .notNull(),
  chunkSize: integer('chunk_size').default(800).notNull(),
  chunkOverlap: integer('chunk_overlap').default(120).notNull(),
  retrievalMode: varchar('retrieval_mode', { length: 20 })
    .default('vector')
    .notNull(),
  retrievalTopK: integer('retrieval_top_k').default(5).notNull(),
  similarityThreshold: real('similarity_threshold').default(0.7).notNull(),
  documentCount: bigint('document_count', { mode: 'number' })
    .default(0)
    .notNull(),
  chunkCount: bigint('chunk_count', { mode: 'number' }).default(0).notNull(),
  tokenCount: bigint('token_count', { mode: 'number' }).default(0).notNull(),
  config: jsonb('config')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiKnowledgeBaseTable = typeof aiKnowledgeBase

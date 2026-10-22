import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import {
  bigintString,
  bigserialString,
  datetime,
  now,
  pgVector,
} from '@/schemas/types'

/** 文档切分后的检索单元，embedding 以 jsonb 浮点数组存储，也可引用外部向量库。 */
export const aiKnowledgeChunk = pgTable('ai_knowledge_chunk', {
  id: bigserialString('id').primaryKey(),
  tenantId: bigintString('tenant_id').notNull(),
  knowledgeBaseId: bigintString('knowledge_base_id').notNull(),
  documentId: bigintString('document_id').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  contentHash: varchar('content_hash', { length: 128 }).notNull(),
  tokenCount: bigint('token_count', { mode: 'number' }).default(0).notNull(),
  embedding: pgVector('embedding'),
  embeddingModelId: bigintString('embedding_model_id'),
  vectorId: varchar('vector_id', { length: 255 }),
  embeddingStatus: varchar('embedding_status', { length: 20 })
    .default('pending')
    .notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: datetime('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime('updated_at').$onUpdate(now),
})

export type AiKnowledgeChunkTable = typeof aiKnowledgeChunk
export type AiKnowledgeChunk = typeof aiKnowledgeChunk.$inferSelect

// export const AiKnowledgeChunkSchema = createSelectSchema(aiKnowledgeChunk, {
//   id: idField(),
//   tenantId: idField(),
//   knowledgeBaseId: idField(),
//   documentId: idField(),
//   embeddingModelId: idField().nullable(),
//   embedding: z.array(z.number()).nullable(),
//   metadata: z.record(z.string(), z.unknown()),
// }).meta({ id: 'AiKnowledgeChunk', description: '知识库文档分块' })

// export type AiKnowledgeChunk = z.infer<typeof AiKnowledgeChunkSchema>

import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { bigintString, datetime } from '@/schemas/types'
import { commonColumns } from '@/schemas/common'

/** 知识库文档处理状态。 */
export const AiDocumentStatus = {
  PENDING: 'pending',
  PARSING: 'parsing',
  CHUNKING: 'chunking',
  INDEXING: 'indexing',
  READY: 'ready',
  FAILED: 'failed',
} as const

export type AiDocumentStatusValue =
  (typeof AiDocumentStatus)[keyof typeof AiDocumentStatus]

/** 知识库中的原始文档及其异步解析、索引状态。 */
export const aiKnowledgeDocument = pgTable('ai_knowledge_document', {
  knowledgeBaseId: bigintString('knowledge_base_id').notNull(),
  fileId: varchar('file_id', { length: 64 }),
  sourceType: varchar('source_type', { length: 20 }).default('file').notNull(),
  sourceName: varchar('source_name', { length: 255 }).notNull(),
  sourceUri: varchar('source_uri', { length: 1000 }),
  mimeType: varchar('mime_type', { length: 127 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  checksum: varchar('checksum', { length: 128 }).notNull(),
  status: varchar('status', { length: 20 })
    .$type<AiDocumentStatusValue>()
    .default(AiDocumentStatus.PENDING)
    .notNull(),
  content: text('content'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  chunkCount: integer('chunk_count').default(0).notNull(),
  tokenCount: bigint('token_count', { mode: 'number' }).default(0).notNull(),
  indexedAt: datetime('indexed_at'),
  ...commonColumns,
})

export type AiKnowledgeDocumentTable = typeof aiKnowledgeDocument

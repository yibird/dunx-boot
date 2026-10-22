import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  real,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * ai模型表
 */
export const aiModel = pgTable('ai_model', {
  providerId: bigintString('provider_id').notNull(),
  modelKey: varchar('model_key', { length: 255 }).notNull(),
  modelName: varchar('model_name', { length: 100 }).notNull(),
  modelType: varchar('model_type', { length: 20 }).default('chat').notNull(),
  contextWindow: integer('context_window').default(8192).notNull(),
  maxOutputTokens: integer('max_output_tokens'),
  embeddingDimensions: integer('embedding_dimensions'),
  supportsStreaming: boolean('supports_streaming').default(true).notNull(),
  supportsTools: boolean('supports_tools').default(false).notNull(),
  supportsVision: boolean('supports_vision').default(false).notNull(),
  supportsReasoning: boolean('supports_reasoning').default(false).notNull(),
  defaultTemperature: real('default_temperature').default(0.7).notNull(),
  defaultTopP: real('default_top_p').default(1).notNull(),
  inputTokenPrice: numeric('input_token_price', {
    precision: 20,
    scale: 8,
  })
    .default('0')
    .notNull(),
  outputTokenPrice: numeric('output_token_price', {
    precision: 20,
    scale: 8,
  })
    .default('0')
    .notNull(),
  priceUnitTokens: integer('price_unit_tokens').default(1_000_000).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  config: jsonb('config')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type AiModelTable = typeof aiModel

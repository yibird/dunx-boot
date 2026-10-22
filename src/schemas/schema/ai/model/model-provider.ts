import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

export const aiModelProvider = pgTable('ai_model_provider', {
  providerCode: varchar('provider_code', { length: 64 }).notNull().unique(),
  providerName: varchar('provider_name', { length: 100 }).notNull(),
  internal: boolean('internal').default(false).notNull(),
  ...commonColumns,
})

export type AiModelProviderTable = typeof aiModelProvider

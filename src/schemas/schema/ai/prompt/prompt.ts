import { commonColumns } from '@/schemas/common'
import { boolean, pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import type { AiPromptTypeValue } from '@/features/ai/prompt/constant'
import { bigintString } from '@/schemas/types'
import { aiPromptCategory } from './prompt-category'

export const aiPrompt = pgTable('ai_prompt', {
  promptTitle: varchar('prompt_title', { length: 255 }).notNull(),
  promptType: smallint('model_type').$type<AiPromptTypeValue>().notNull(),
  promptDescription: varchar('prompt_description', { length: 255 }).notNull(),
  promptContext: text('prompt_content').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  /** 提示词分类 ID */
  promptCategory: bigintString('prompt_category').references(
    () => aiPromptCategory.id
  ),
  ...commonColumns,
})

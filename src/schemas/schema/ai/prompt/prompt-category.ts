import { commonColumns } from '@/schemas/common'
import { pgTable, varchar } from 'drizzle-orm/pg-core'

export const aiPromptCategory = pgTable('ai_prompt_category', {
  /** 分类名称 */
  categoryName: varchar('category_name', { length: 100 }).notNull(),
  /** 分类描述 */
  categoryDescription: varchar('category_description', { length: 255 }),
  /** 分类排序 */
  ...commonColumns,
})

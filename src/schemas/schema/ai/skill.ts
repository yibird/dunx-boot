import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 可复用的 Markdown 指令；公开技能仅对同一租户开放使用。
 */
export const aiSkill = pgTable(
  'ai_skill',
  {
    ownerUserId: bigintString('owner_user_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 500 }),
    content: text('content').notNull(),
    visibility: varchar('visibility', { length: 20 })
      .default('private')
      .notNull(),
    ...commonColumns,
  },
  (table) => [
    index('ai_skill_tenant_owner_idx').on(table.tenantId, table.ownerUserId),
  ]
)

export type AiSkillTable = typeof aiSkill
export type AiSkill = typeof aiSkill.$inferSelect

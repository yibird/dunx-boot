import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { commonColumns } from '../../../common'
import { bigintString } from '../../../types'
import { aiAgent } from './agent'
import { aiSkill } from '../skill'

/**
 * Agent 与技能的有序多对多关联；sort 表示指令加载顺序。
 */
export const aiAgentSkill = pgTable(
  'ai_agent_skill',
  {
    agentId: bigintString('agent_id')
      .notNull()
      .references(() => aiAgent.id),
    skillId: bigintString('skill_id')
      .notNull()
      .references(() => aiSkill.id),
    ...commonColumns,
  },
  (table) => [
    uniqueIndex('ai_agent_skill_active_pair_idx')
      .on(table.agentId, table.skillId)
      .where(sql`${table.deleted} = false`),
    index('ai_agent_skill_skill_idx').on(table.skillId),
  ]
)

export type AiAgentSkillTable = typeof aiAgentSkill
export type AiAgentSkill = typeof aiAgentSkill.$inferSelect

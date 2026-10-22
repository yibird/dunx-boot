import { sql } from 'drizzle-orm'
import { index, pgTable, smallint, uniqueIndex } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { commonColumns, commonColumnsSchema } from '@/schemas/common'
import { bigintString } from '@/schemas/types'
import { PM_PROJECT_MEMBER_ROLE } from '@/features/pm/project/constant'

/**
 * 项目成员表：一个用户在同一个项目里只有一条有效记录。
 */
export const pmProjectMember = pgTable(
  'pm_project_member',
  {
    /**
     * 项目主键。
     */
    projectId: bigintString('project_id').notNull(),
    /**
     * 成员用户主键。
     */
    userId: bigintString('user_id').notNull(),
    /**
     * 成员角色：1 负责人 2 管理员 3 成员 4 观察者。
     */
    role: smallint('role').default(PM_PROJECT_MEMBER_ROLE.MEMBER).notNull(),
    ...commonColumns,
  },
  (table) => [
    index('pm_project_member_user_idx').on(table.userId),
    uniqueIndex('pm_project_member_pair_uidx')
      .on(table.projectId, table.userId)
      .where(sql`${table.deleted} = false`),
  ]
)

export const pmProjectMemberSchema = createSelectSchema(pmProjectMember, {
  projectId: z.string().meta({ description: '项目主键', examples: ['1'] }),
  userId: z.string().meta({ description: '成员用户主键', examples: ['1'] }),
  role: z
    .union([
      z.literal(PM_PROJECT_MEMBER_ROLE.OWNER),
      z.literal(PM_PROJECT_MEMBER_ROLE.ADMIN),
      z.literal(PM_PROJECT_MEMBER_ROLE.MEMBER),
      z.literal(PM_PROJECT_MEMBER_ROLE.VIEWER),
    ])
    .meta({
      description: '成员角色：1 负责人 2 管理员 3 成员 4 观察者',
      examples: [PM_PROJECT_MEMBER_ROLE.MEMBER],
    }),
  ...commonColumnsSchema,
}).meta({ id: 'PmProjectMember' })

export type PmProjectMemberTable = typeof pmProjectMember
export type PmProjectMember = typeof pmProjectMember.$inferSelect
export type PmProjectMemberInsert = typeof pmProjectMember.$inferInsert

import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 部门表
 */
export const sysDept = pgTable('sys_dept', {
  deptName: varchar('dept_name', { length: 100 }).notNull(),
  rootId: bigintString('root_id').default('0').notNull(),
  parentId: bigintString('parent_id').default('0').notNull(),
  path: varchar('path', { length: 500 }).default('').notNull(),
  leaderId: bigintString('leader_id'),
  leaderName: varchar('leader_name', { length: 64 }),
  ...commonColumns,
})

export type SysDeptTable = typeof sysDept
export type SysDept = typeof sysDept.$inferSelect

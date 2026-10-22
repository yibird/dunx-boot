import { pgTable, smallint, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * 角色表
 */
export const sysRole = pgTable('sys_role', {
  roleName: varchar('role_name', { length: 100 }).notNull(),
  dataScope: smallint('data_scope').default(0).notNull(),
  ...commonColumns,
})

export type SysRoleTable = typeof sysRole
export type SysRole = typeof sysRole.$inferSelect

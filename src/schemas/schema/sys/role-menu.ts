import { pgTable } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 角色菜单表Schema
 */
export const sysRoleMenu = pgTable('sys_role_menu', {
  roleId: bigintString('role_id').notNull(),
  menuId: bigintString('menu_id').notNull(),
  ...commonColumns,
})

export type SysRoleMenuTable = typeof sysRoleMenu

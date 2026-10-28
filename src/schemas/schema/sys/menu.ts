import { boolean, pgTable, smallint, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 菜单表
 */
export const sysMenu = pgTable('sys_menu', {
  menuName: varchar('menu_name', { length: 100 }).notNull(),
  menuType: smallint('menu_type').notNull(),
  rootId: bigintString('root_id').default('0').notNull(),
  parentId: bigintString('parent_id').default('0').notNull(),
  routePath: varchar('route_path', { length: 255 }),
  permission: varchar('permission', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  isExternal: boolean('is_external').default(false).notNull(),
  isCache: boolean('is_cache').default(true).notNull(),
  ...commonColumns,
})

export type SysMenuTable = typeof sysMenu
export type SysMenu = typeof sysMenu.$inferSelect

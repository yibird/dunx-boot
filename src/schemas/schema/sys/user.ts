import { pgTable, smallint, text, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 用户表
 */
export const sysUser = pgTable('sys_user', {
  account: varchar('account', { length: 64 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 64 }).notNull(),
  avatar: text('avatar'),
  sex: smallint('sex').notNull().default(0),
  age: smallint('age'),
  phone: varchar('phone', { length: 20 }),
  idCard: varchar('id_card', { length: 18 }),
  email: varchar('email', { length: 100 }),
  roleId: bigintString('role_id'),
  deptId: bigintString('dept_id'),
  postId: bigintString('post_id'),
  ...commonColumns,
})

export type SysUserTable = typeof sysUser
export type SysUser = typeof sysUser.$inferSelect

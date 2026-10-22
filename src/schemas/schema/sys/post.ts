import { pgTable, smallint, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * 岗位表Schema
 */
export const sysPost = pgTable('sys_post', {
  postName: varchar('post_name', { length: 100 }).notNull(),
  postLevel: smallint('post_level').notNull(),
  ...commonColumns,
})

export type SysPostTable = typeof sysPost
export type SysPost = typeof sysPost.$inferSelect

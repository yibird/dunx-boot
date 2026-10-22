import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * 数据字典类型表Schema
 */
export const sysDictType = pgTable('sys_dict_type', {
  dictName: varchar('dict_name', { length: 100 }).notNull(),
  dictType: varchar('dict_type', { length: 100 }).notNull(),
  ...commonColumns,
})

export type SysDictTypeTable = typeof sysDictType
export type SysDictType = typeof sysDictType.$inferSelect

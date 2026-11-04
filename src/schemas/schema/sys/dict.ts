import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 数据字典类型表
 */
export const sysDictType = pgTable('sys_dict_type', {
  dictKey: varchar('dict_key').notNull(),
  dictName: varchar('dict_name').notNull(),
  ...commonColumns,
})

/**
 * 字典数据表
 */
export const sysDictData = pgTable('sys_dict_data', {
  dictTypeId: bigintString('dict_type_id').notNull(),
  dictLabel: varchar('dict_label', { length: 100 }).notNull(),
  dictValue: varchar('dict_value', { length: 255 }).notNull(),
  ...commonColumns,
})

export type SysDictTypeTable = typeof sysDictType
export type SysDictType = typeof sysDictType.$inferSelect
export type SysDictDataTable = typeof sysDictData
export type SysDictData = typeof sysDictData.$inferSelect

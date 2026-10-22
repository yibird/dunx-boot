import { sql } from 'drizzle-orm'
import { index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

/**
 * 字典数据表Schema
 */
export const sysDictData = pgTable(
  'sys_dict_data',
  {
    dictTypeId: bigintString('dict_type_id').notNull(),
    dictLabel: varchar('dict_label', { length: 100 }).notNull(),
    dictValue: varchar('dict_value', { length: 255 }).notNull(),
    ...commonColumns,
  },
  (table) => [
    index('sys_dict_data_type_id_idx').on(table.dictTypeId),
    uniqueIndex('sys_dict_data_type_value_uidx')
      .on(table.dictTypeId, table.dictValue)
      .where(sql`${table.deleted} = false`),
  ]
)

export type SysDictDataTable = typeof sysDictData
export type SysDictData = typeof sysDictData.$inferSelect

import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * 系统语言表
 */
export const sysLocaleLang = pgTable('sys_locale_lang', {
  langCode: varchar('lang_code', { length: 100 }).notNull(),
  langName: varchar('lang_name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  nativeName: varchar('native_name', { length: 100 }),
  ...commonColumns,
})

/**
 * 系统语言翻译表
 */
export const sysLocaleTrans = pgTable('sys_locale_trans', {
  langId: varchar('lang_id', { length: 100 }).notNull(),
  namespace: varchar('namespace', { length: 100 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  ...commonColumns,
})

export type SysLocaleLangTable = typeof sysLocaleLang
export type SysLocaleLang = typeof sysLocaleLang.$inferSelect
export type SysLocaleTransTable = typeof sysLocaleTrans
export type SysLocaleTrans = typeof sysLocaleTrans.$inferSelect

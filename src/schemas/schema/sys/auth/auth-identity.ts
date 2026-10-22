import { jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '../../../common'
import { bigintString } from '../../../types'

/**
 * 本地用户与第三方账号的绑定关系。
 */
export const sysAuthIdentity = pgTable('sys_auth_identity', {
  userId: bigintString('user_id').notNull(),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerAppId: varchar('provider_app_id', { length: 128 }).notNull(),
  providerSubject: varchar('provider_subject', { length: 255 }).notNull(),
  unionId: varchar('union_id', { length: 255 }),
  nickname: varchar('nickname', { length: 128 }),
  avatar: text('avatar'),
  email: varchar('email', { length: 255 }),
  profile: jsonb('profile').$type<Record<string, unknown>>().notNull(),
  ...commonColumns,
})

export type SysAuthIdentityTable = typeof sysAuthIdentity
export type SysAuthIdentity = typeof sysAuthIdentity.$inferSelect

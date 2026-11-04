import { jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { bigintString, datetime } from '@/schemas/types'
import { commonColumns } from '@/schemas/common'

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

/**
 * 登录会话令牌
 */
export const sysAuthToken = pgTable('sys_auth_token', {
  userId: bigintString('user_id').notNull(),
  jti: varchar('jti', { length: 64 }).notNull(),
  expiresAt: datetime('expire_at').notNull(),
  revokedAt: datetime('revoked_at'),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  ...commonColumns,
})

export type SysAuthTokenTable = typeof sysAuthToken
export type SysAuthToken = typeof sysAuthToken.$inferSelect

export type SysAuthIdentityTable = typeof sysAuthIdentity
export type SysAuthIdentity = typeof sysAuthIdentity.$inferSelect

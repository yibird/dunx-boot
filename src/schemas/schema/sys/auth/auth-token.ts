import { pgTable, varchar } from 'drizzle-orm/pg-core'
import { bigintString, datetime } from '@/schemas/types'
import { commonColumns } from '@/schemas/common'

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

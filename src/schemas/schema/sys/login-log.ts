import {
  boolean,
  jsonb,
  pgTable,
  smallint,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

export const sysLoginLog = pgTable('sys_login_log', {
  loginType: smallint('loginType').default(1).notNull(),
  platform: smallint('platform').default(1).notNull(),
  userId: bigintString('user_id'),
  username: varchar('username', { length: 50 }),
  status: boolean('status').default(true).notNull(),
  failReason: text('failReason'),
  ip: varchar('ip', { length: 64 }),
  ipLocation: varchar('ip_location', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  device: varchar('device', { length: 200 }),
  userAgent: varchar('userAgent', { length: 200 }),
  traceId: varchar('trace_id', { length: 64 }),
  payload: jsonb('payload'),
  ...commonColumns,
})

export type SysLoginLogTable = typeof sysLoginLog
export type SysLoginLog = typeof sysLoginLog.$inferSelect
export type SysLoginLogInsert = typeof sysLoginLog.$inferInsert

import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'

/**
 * 请求日志表Schema
 */
export const sysRequestLog = pgTable('sys_request_log', {
  requestId: varchar('request_id', { length: 128 }),
  traceId: varchar('trace_id', { length: 64 }),
  method: varchar('method', { length: 10 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  success: boolean('success').default(true).notNull(),
  token: varchar('token', { length: 500 }),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 500 }),
  headers: jsonb('headers'),
  params: jsonb('params'),
  response: jsonb('response'),
  statusCode: integer('status_code').notNull(),
  duration: integer('duration').notNull(),
  errorMessage: text('error_message'),
  ...commonColumns,
})

export type SysRequestLogTable = typeof sysRequestLog
export type SysRequestLog = typeof sysRequestLog.$inferSelect
export type SysRequestLogInsert = typeof sysRequestLog.$inferInsert

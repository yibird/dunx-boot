import { boolean, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { bigintString } from '@/schemas/types'

export const sysOperationLog = pgTable('sys_operation_log', {
  /**
   * 操作用户主键。系统任务操作时可以为空。
   */
  userId: bigintString('user_id'),
  /**
   * 操作用户账号快照。
   * */
  username: varchar('username', { length: 64 }),
  /**
   * 操作模块，例如用户管理、订单管理。
   */
  module: varchar('module', { length: 64 }).notNull(),
  /**
   * 操作类型，例如 USER_CREATE、USER_UPDATE、USER_DELETE。
   */
  action: varchar('action', { length: 64 }).notNull(),
  /**
   * 业务类型，例如 user、customer、order。
   */
  businessType: varchar('business_type', { length: 64 }),
  /**
   * 业务主键。
   */
  businessId: varchar('business_id', { length: 64 }),
  /**
   * 操作描述。
   */
  description: text('description'),
  /**
   * 修改前数据快照。
   */
  beforeData: jsonb('before_data'),
  /**
   * 修改后数据快照。
   */
  afterData: jsonb('after_data'),
  /**
   * 触发操作的 HTTP 方法；后台任务操作时可以为空。
   */
  requestMethod: varchar('request_method', { length: 16 }),
  /**
   * 触发操作的请求地址。
   */
  requestUrl: varchar('request_url', { length: 512 }),
  /**
   * 客户端 IP。
   */
  ip: varchar('ip', { length: 64 }),
  /**
   * 客户端 User-Agent。
   */
  userAgent: text('user_agent'),
  /**
   * 链路追踪 ID。
   */
  traceId: varchar('trace_id', { length: 64 }),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  ...commonColumns,
})

export type SysOperationLogTable = typeof sysOperationLog
export type SysOperationLog = typeof sysOperationLog.$inferSelect

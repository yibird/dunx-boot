import {
  boolean,
  integer,
  jsonb,
  pgTable,
  smallint,
  varchar,
} from 'drizzle-orm/pg-core'
import { commonColumns } from '@/schemas/common'
import { datetime } from '@/schemas/types'

export const sysCaptchaLog = pgTable('sys_captcha_log', {
  /** 业务侧验证码唯一标识。 */
  captchaId: varchar('captcha_id', { length: 64 }).notNull(),
  /** 验证码脱敏占位值，不持久化原始验证码。 */
  captchaValue: varchar('captcha_value', { length: 64 }).notNull(),
  captchaType: smallint('captcha_type').default(1).notNull(),
  /** 脱敏后的手机号、邮箱等接收目标。 */
  target: varchar('target', { length: 128 }),
  platform: smallint('platform'),
  provider: smallint('provider'),
  /** 1=待验证，2=成功，3=失败，4=过期。 */
  status: smallint('status').default(1).notNull(),
  used: boolean('used').default(false).notNull(),
  attempts: integer('attempts').default(0),
  expireAt: datetime('expire_at').notNull(),
  usedAt: datetime('used_at'),
  ip: varchar('ip', { length: 64 }),
  payload: jsonb('payload')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...commonColumns,
})

export type SysCaptchaLogTable = typeof sysCaptchaLog
export type SysCaptchaLog = typeof sysCaptchaLog.$inferSelect
export type SysCaptchaLogInsert = typeof sysCaptchaLog.$inferInsert

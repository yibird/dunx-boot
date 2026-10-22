import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core'
import { omit } from 'es-toolkit'
import { commonColumns } from '@/schemas/common'
import { datetime } from '@/schemas/types'

/**
 * 租户表Schema
 */
export const sysTenant = pgTable('sys_tenant', {
  // 租户名称
  tenantName: varchar('tenant_name', { length: 100 }).notNull(),
  // 绑定域名
  domain: varchar('domain', { length: 255 }).unique(),
  // 租户官网
  website: varchar('website', { length: 255 }).unique(),
  // 授权到期时间
  expireAt: datetime('expire_at'),
  // 是否是超级租户
  superTenant: boolean('super_tenant').default(false).notNull(),
  // 租户logo
  logo: varchar('logo', { length: 255 }),
  // 地址
  address: varchar('address', { length: 255 }),
  // 电话
  phone: varchar('phone', { length: 20 }),
  // 邮箱
  email: varchar('email', { length: 100 }),
  // 联系人
  contact: varchar('contact', { length: 100 }),
  ...omit(commonColumns, ['tenantId']),
})

export type SysTenantTable = typeof sysTenant
export type SysTenant = typeof sysTenant.$inferSelect

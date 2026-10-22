import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { omit } from 'es-toolkit'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysTenant } from '@/schemas'

export const sysTenantSchema = createSelectSchema(sysTenant, {
  tenantName: z.string().meta({ description: '租户名称', example: '默认租户' }),
  domain: z.string().meta({ description: '绑定域名', example: 'tenant1' }),
  website: z
    .string()
    .meta({ description: '租户官网', example: 'https://tenant1.example.com' }),
  expireAt: z.iso
    .datetime()
    .nullable()
    .optional()
    .meta({ description: '授权到期时间', example: '2026-12-31T23:59:59Z' }),
  superTenant: z
    .boolean()
    .meta({ description: '是否是超级租户', example: false }),
  logo: z
    .string()
    .meta({ description: '租户logo', example: 'https://example.com/logo.png' }),
  address: z.string().meta({ description: '地址', example: '北京市海淀区' }),
  phone: z.string().meta({ description: '电话', example: '13800000000' }),
  email: z
    .string()
    .meta({ description: '邮箱', example: 'tenant@example.com' }),
  contact: z.string().meta({ description: '联系人', example: '张三' }),
  ...omit(commonColumnsSchema, ['tenantId']),
})

/**
 * 角色查询Schema
 */
export const sysTenantQuerySchema = baseQuerySchema
  .extend({
    tenantName: z
      .string()
      .optional()
      .meta({ description: '租户名称(模糊查询)' }),
    phone: z.string().optional().meta({ description: '手机号(模糊查询)' }),
    contact: z.string().optional().meta({ description: '联系人(模糊查询)' }),
    email: z.string().optional().meta({ description: '邮箱(模糊查询)' }),
  })
  .meta({ id: 'SysTenantQuery' })

export const sysTenantCreateReqSchema = sysTenantSchema
  .pick({
    tenantName: true,
    domain: true,
    website: true,
    logo: true,
    expireAt: true,
    superTenant: true,
    phone: true,
    contact: true,
    address: true,
    email: true,
    remark: true,
  })
  .meta({ id: 'SysTenantCreateReq' })

export const sysTenantUpdateReqSchema = sysTenantSchema
  .pick({
    id: true,
    tenantName: true,
    domain: true,
    website: true,
    logo: true,
    expireAt: true,
    superTenant: true,
    phone: true,
    contact: true,
    address: true,
    email: true,
    remark: true,
  })
  .meta({ id: 'SysTenantUpdateReq' })

export type SysTenantQuery = z.infer<typeof sysTenantQuerySchema>
export type SysTenantCreateReq = z.infer<typeof sysTenantCreateReqSchema>
export type SysTenantUpdateReq = z.infer<typeof sysTenantUpdateReqSchema>

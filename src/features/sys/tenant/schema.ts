import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { omit } from 'es-toolkit'
import { baseQuerySchema } from '@/infra/model'
import { commonColumnsSchema, sysTenant } from '@/schemas'

export const sysTenantSchema = createSelectSchema(sysTenant, {
  tenantName: (schema) =>
    schema.meta({ description: '租户名称', examples: ['默认租户'] }),
  domain: (schema) =>
    schema.meta({ description: '绑定域名', examples: ['tenant1'] }),
  website: (schema) =>
    schema.meta({
      description: '租户官网',
      examples: ['https://tenant1.example.com'],
    }),
  expireAt: (schema) =>
    schema.meta({
      description: '授权到期时间',
      examples: ['2026-12-31T23:59:59Z'],
    }),
  superTenant: (schema) =>
    schema.meta({ description: '是否是超级租户', examples: [false] }),
  logo: (schema) =>
    schema.meta({
      description: '租户logo',
      examples: ['https://example.com/logo.png'],
    }),
  address: (schema) =>
    schema.meta({ description: '地址', examples: ['北京市海淀区'] }),
  phone: (schema) =>
    schema.meta({ description: '手机号', examples: ['13800000000'] }),
  email: (schema) =>
    schema.meta({ description: '邮箱', examples: ['tenant@example.com'] }),
  contact: (schema) =>
    schema.meta({ description: '联系人', examples: ['张三'] }),
  ...omit(commonColumnsSchema, ['tenantId']),
})

/**
 * 角色查询
 */
export const sysTenantQuerySchema = baseQuerySchema
  .extend({
    tenantName: z
      .string()
      .optional()
      .meta({ description: '租户名称', examples: ['默认租户'] }),
    phone: z
      .string()
      .optional()
      .meta({ description: '手机号', examples: ['13800000000'] }),
    contact: z
      .string()
      .optional()
      .meta({ description: '联系人', examples: ['张三'] }),
    email: z
      .string()
      .optional()
      .meta({
        description: '邮箱',
        examples: ['tenant@example.com'],
      }),
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

export const schema = {
  response: sysTenantSchema,
  create: sysTenantCreateReqSchema,
  update: sysTenantUpdateReqSchema,
  query: sysTenantQuerySchema,
}

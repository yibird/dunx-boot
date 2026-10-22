import { z } from 'zod'
import { createSelectSchema } from 'drizzle-orm/zod'
import { baseQuerySchema } from '@/infra/model'
import { sysRole, commonColumnsSchema } from '@/schemas'

export const sysRoleSchema = createSelectSchema(sysRole, {
  roleName: z.string().meta({ description: '角色名称', example: '管理员' }),
  dataScope: z.number().meta({ description: '数据范围', example: 0 }),
  ...commonColumnsSchema,
}).meta({ id: 'SysRole' })

/**
 * 角色查询Schema
 */
export const sysRoleQuerySchema = baseQuerySchema
  .extend({
    roleName: z.string().optional().meta({ description: '角色名称(模糊查询)' }),
    dataScope: z.coerce
      .number()
      .int()
      .optional()
      .meta({ description: '岗位级别' }),
  })
  .meta({ id: 'SysRoleQuery' })

/**
 * 角色新增Schema
 */
export const sysRoleCreateReqSchema = sysRoleSchema
  .pick({
    roleName: true,
    dataScope: true,
    remark: true,
  })
  .meta({ id: 'SysRoleCreateReq' })

/**
 * 角色更新Schema
 */
export const sysRoleUpdateReqSchema = sysRoleSchema
  .pick({
    id: true,
    roleName: true,
    dataScope: true,
    remark: true,
  })
  .meta({ id: 'SysRoleUpdateReq' })

export type SysRoleQuery = z.infer<typeof sysRoleQuerySchema>
export type SysRoleCreateReq = z.infer<typeof sysRoleCreateReqSchema>
export type SysRoleUpdateReq = z.infer<typeof sysRoleUpdateReqSchema>
